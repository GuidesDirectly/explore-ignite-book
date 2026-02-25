import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);

  try {
    if (req.method === "GET") {
      const guideId = url.searchParams.get("guide_user_id");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase
        .from("reviews_public")
        .select("*")
        .eq("hidden", false)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (guideId) {
        query = query.eq("guide_user_id", guideId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ reviews: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { guide_user_id, reviewer_name, reviewer_email, rating, comment, booking_id } = body;

      if (!guide_user_id || !reviewer_name || !rating) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: guide_user_id, reviewer_name, rating" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (typeof rating !== "number" || rating < 1 || rating > 10) {
        return new Response(
          JSON.stringify({ error: "Rating must be between 1 and 10" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase.from("reviews").insert({
        guide_user_id,
        reviewer_name: String(reviewer_name).slice(0, 100),
        reviewer_email: reviewer_email ? String(reviewer_email).slice(0, 255) : null,
        rating,
        comment: comment ? String(comment).slice(0, 2000) : null,
        booking_id: booking_id || null,
      }).select().single();

      if (error) throw error;

      return new Response(JSON.stringify({ review: data }), {
        status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("api-reviews error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
