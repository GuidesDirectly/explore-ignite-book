import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter: max 5 requests per IP per minute (expensive AI + DB op)
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

  // Rate limiting
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

    const { description } = body;

    // Input validation
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

    // Fetch approved guides from DB for matching context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: guides } = await supabase
      .from("guide_profiles")
      .select("form_data, user_id")
      .eq("status", "approved");

    let guidesContext = "";
    if (guides && guides.length > 0) {
      guidesContext = `\n\nAvailable guides in our network:\n${guides.map((g, i) => {
        const fd = g.form_data as any;
        return `Guide ${i + 1}: ${fd?.name || "Guide"} — Languages: ${fd?.languages || "English"}, Specialties: ${fd?.specialties || "General tours"}, Locations: ${fd?.locations || "Various"}`;
      }).join("\n")}\n\nBased on the customer's preferences, suggest which guide(s) would be the best match and why.`;
    } else {
      guidesContext = "\n\nNote: We don't have guide profiles loaded yet, so focus on creating an amazing tour plan. Mention that we'll personally match them with the perfect guide from our vetted network.";
    }

    const systemPrompt = `You are the AI Tour Planner for iGuide Tours, a premium tour guide service. A customer is describing their dream tour.

Your job is to:
1. Create a detailed, exciting tour plan based on their description
2. Break it into a day-by-day itinerary (or hour-by-hour for day trips)
3. Include estimated budget ranges
4. Suggest the best time of year to visit
5. Recommend specific highlights, restaurants, and hidden gems
6. Match them with the ideal guide from our network (if available)

Keep the tone warm, professional, and exciting. Use markdown formatting with headers, bullet points, and emojis for readability. Make the customer feel like this will be an unforgettable experience.

Our tour destinations include: Washington DC, New York City, Niagara Falls, Toronto, Boston, and Chicago. If they mention other destinations, politely note our primary service areas but still help plan.${guidesContext}`;

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
