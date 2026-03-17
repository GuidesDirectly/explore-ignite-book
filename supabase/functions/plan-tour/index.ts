import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("cf-connecting-ip") ??
    "unknown";
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a minute before trying again." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { description, profileContext, mode } = body;

    if (profileContext !== undefined && (typeof profileContext !== "string" || profileContext.length > 2000)) {
      return new Response(
        JSON.stringify({ error: "Invalid profile context." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!description || typeof description !== "string") {
      return new Response(
        JSON.stringify({ error: "description is required and must be a string." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmed = description.trim();

    if (trimmed.length < 10) {
      return new Response(
        JSON.stringify({ error: "Please describe your dream tour in more detail (at least 10 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (trimmed.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Description is too long. Please keep it under 2000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build system prompt based on mode
    let systemPrompt: string;

    if (mode === "guide") {
      systemPrompt = `You are an itinerary generator for tour guides. A guide wants a professional itinerary template.

CRITICAL: You MUST respond with ONLY a valid JSON object. No text before or after. No markdown. No greetings. No explanations.

The JSON must follow this exact structure:
{
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity name",
          "description": "Short description with insider tips",
          "durationMinutes": 60
        }
      ]
    }
  ]
}

Rules:
- Create a single-day itinerary (day 1) with time-blocked activities based on the requested tour duration
- Include 4-8 activities depending on duration
- Include practical details: meeting points, photo spots, rest stops
- Times must be in HH:MM format
- durationMinutes must be a number
- description should include talking points and local knowledge`;
    } else {
      systemPrompt = `You are an itinerary generator for travelers. Create a detailed day-by-day itinerary.

CRITICAL: You MUST respond with ONLY a valid JSON object. No text before or after. No markdown. No greetings. No explanations. No disclaimers.

The JSON must follow this exact structure:
{
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity name",
          "description": "Short description with tips, costs, and insider info",
          "durationMinutes": 60
        }
      ]
    }
  ]
}

Rules:
- Create one object per day based on the trip length
- Include 4-7 activities per day
- Include specific times, locations, and practical tips in descriptions
- Include estimated costs where relevant in descriptions
- Times must be in HH:MM format
- durationMinutes must be a number
- Make it exciting and detailed but keep descriptions concise (1-2 sentences)
${profileContext ? `\nTraveler preferences: ${profileContext}` : ""}`;
    }

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
            { role: "user", content: trimmed },
          ],
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "We're experiencing high demand. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service unavailable. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await response.json();
    const rawContent = aiResult.choices?.[0]?.message?.content || "";

    // Extract JSON from the response (handle potential markdown code fences)
    let jsonStr = rawContent.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI JSON:", jsonStr.slice(0, 500));
      return new Response(
        JSON.stringify({ error: "Unable to generate itinerary. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate structure
    if (!parsed.itinerary || !Array.isArray(parsed.itinerary)) {
      console.error("Invalid itinerary structure:", JSON.stringify(parsed).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "Unable to generate itinerary. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ status: "success", itinerary: parsed.itinerary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("plan-tour error:", e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
