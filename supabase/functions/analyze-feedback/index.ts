import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { guideUserId } = await req.json();
    if (!guideUserId) {
      return new Response(
        JSON.stringify({ error: "guideUserId is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all non-hidden reviews for this guide
    const { data: reviews, error: reviewError } = await supabase
      .from("reviews")
      .select("rating, comment, reviewer_name, created_at")
      .eq("guide_user_id", guideUserId)
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(100);

    if (reviewError) throw reviewError;

    if (!reviews || reviews.length === 0) {
      return new Response(
        JSON.stringify({
          summary: "No reviews available for analysis yet.",
          sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
          themes: [],
          recommendations: [],
          totalReviews: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build review text for AI analysis
    const reviewTexts = reviews
      .filter((r: any) => r.comment && r.comment.trim().length > 0)
      .map((r: any) => `Rating: ${r.rating}/10 — "${r.comment}"`)
      .join("\n");

    const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;

    const systemPrompt = `You are a tour guide performance analyst for iGuide Tours. Analyze the following traveler reviews and provide actionable insights.

Reviews (${reviews.length} total, avg rating: ${avgRating.toFixed(1)}/10):
${reviewTexts || "No written comments available, only numerical ratings."}

Provide your analysis as valid JSON with this exact structure:
{
  "summary": "2-3 sentence executive summary of overall performance",
  "sentimentBreakdown": { "positive": <number 0-100>, "neutral": <number 0-100>, "negative": <number 0-100> },
  "themes": [
    { "theme": "Theme Name", "count": <number>, "sentiment": "positive|neutral|negative", "examples": ["quote1"] }
  ],
  "recommendations": [
    { "priority": "high|medium|low", "action": "Specific actionable recommendation", "impact": "Expected impact description" }
  ],
  "strengths": ["Strength 1", "Strength 2"],
  "improvementAreas": ["Area 1", "Area 2"]
}

Be specific, data-driven, and constructive. Focus on actionable insights.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Analyze these reviews and return the JSON analysis." },
          ],
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI analysis service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      analysis = {
        summary: content || "Analysis completed but could not be parsed.",
        sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
        themes: [],
        recommendations: [],
      };
    }

    // Add metadata
    analysis.totalReviews = reviews.length;
    analysis.avgRating = Math.round(avgRating * 10) / 10;
    analysis.analyzedAt = new Date().toISOString();

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-feedback error:", e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
