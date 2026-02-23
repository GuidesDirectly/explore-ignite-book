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
    const body = await req.json();
    const { tourPlanId, currentPlan, originalActivity, swapRequest, dayNumber, userEmail } = body;

    if (!currentPlan || typeof currentPlan !== "string") {
      return new Response(
        JSON.stringify({ error: "currentPlan is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!originalActivity || typeof originalActivity !== "string") {
      return new Response(
        JSON.stringify({ error: "originalActivity is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!swapRequest || typeof swapRequest !== "string" || swapRequest.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "swapRequest must be at least 3 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (swapRequest.length > 500) {
      return new Response(
        JSON.stringify({ error: "swapRequest is too long (max 500 chars)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are the AI Tour Planner for iGuide Tours. A traveler wants to swap one activity in their existing itinerary.

Current full itinerary:
${currentPlan}

The traveler wants to replace: "${originalActivity}"
${dayNumber ? `This is on Day ${dayNumber}.` : ""}

Their swap request: "${swapRequest}"

Instructions:
1. Suggest 2-3 alternative activities that fit the same time slot, location, and budget constraints
2. For each alternative, provide: name, brief description, estimated duration, and why it's a good fit
3. Then regenerate ONLY the affected day's schedule with the best-fit swap integrated
4. Keep the rest of the itinerary unchanged
5. Use markdown formatting with headers and bullet points
6. Be enthusiastic and helpful`;

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
            { role: "user", content: `Please swap "${originalActivity}" with something related to: ${swapRequest}` },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save swap record to DB (fire-and-forget)
    if (tourPlanId && userEmail) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from("itinerary_swaps").insert({
          tour_plan_id: tourPlanId,
          user_email: userEmail,
          original_activity: originalActivity.slice(0, 500),
          swapped_activity: swapRequest.slice(0, 500),
          day_number: dayNumber || null,
          status: "completed",
        });
      } catch (dbErr) {
        console.error("Failed to save swap record:", dbErr);
      }
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("swap-itinerary error:", e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
