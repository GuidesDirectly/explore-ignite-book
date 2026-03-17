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

    // Fetch approved guides from DB for matching context (traveler mode only)
    let guidesContext = "";
    if (mode !== "guide") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: guides } = await supabase
        .from("guide_profiles")
        .select("form_data, user_id")
        .eq("status", "approved");

      if (guides && guides.length > 0) {
        guidesContext = `\n\nAvailable guides in our network:\n${guides.map((g, i) => {
          const fd = g.form_data as any;
          return `Guide ${i + 1}: ${fd?.name || "Guide"} — Languages: ${fd?.languages || "English"}, Specialties: ${fd?.specialties || "General tours"}, Locations: ${fd?.locations || "Various"}`;
        }).join("\n")}\n\nBased on the customer's preferences, suggest which guide(s) would be the best match and why. Include a section titled "🎯 Recommended Guides" with match percentages.`;
      } else {
        guidesContext = "\n\nNote: We don't have guide profiles loaded yet, so focus on creating an amazing tour plan. Mention that we'll personally match them with the perfect guide from our vetted network.";
      }
    }

    // Build system prompt based on mode
    let systemPrompt: string;

    if (mode === "guide") {
      systemPrompt = `You are the AI Itinerary Builder for Guides Directly, a premium tour guide platform. A tour guide is requesting a professional itinerary template they can use as a foundation for their tours.

Your job is to:
1. Create a detailed, professional itinerary template based on their city, specialty, and tour duration
2. Structure it as a time-blocked itinerary (e.g., 9:00 AM — 10:30 AM: Location / Activity)
3. Include talking points, insider tips, and local knowledge they can use
4. Suggest pricing tiers (budget, standard, premium)
5. Include logistical notes (meeting points, rest stops, photo opportunities)
6. Add a section for "Customization Ideas" so the guide can adapt it

Format using markdown with clear headers, bullet points, and emojis for visual appeal. Make it feel professional and ready to use. The guide should feel like they have a complete tour product they can start offering immediately.`;
    } else {
      systemPrompt = `You are the AI Tour Planner for Guides Directly, a premium tour guide platform. The platform currently operates in Washington DC and is expanding to other cities across the USA, Canada, and globally. You can plan tours for ANY destination worldwide.

A traveler is describing their dream tour. Your job is to:
1. Create a detailed, exciting day-by-day itinerary based on their preferences
2. Include specific times, locations, and activities for each day
3. Provide estimated costs for each major activity
4. Include a daily budget breakdown
5. Suggest the best restaurants and hidden gems
6. Add practical tips (what to wear, best transport, etc.)
7. Include a "📊 Budget Summary" section at the end with total estimated costs

Keep the tone warm, professional, and exciting. Use markdown formatting with headers (##), bullet points, and emojis for readability. Make the traveler feel this will be an unforgettable experience.

IMPORTANT: Do NOT start your response with any disclaimer about which cities the platform covers. Jump straight into the exciting itinerary.${guidesContext}${profileContext ? `\n\nThis traveler has shared their personal preferences — tailor the plan accordingly:${profileContext}` : ""}`;
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
          stream: true,
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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("plan-tour error:", e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
