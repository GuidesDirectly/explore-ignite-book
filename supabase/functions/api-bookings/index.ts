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

  try {
    // POST — create a booking
    if (req.method === "POST") {
      const body = await req.json();
      const { guide_user_id, traveler_name, traveler_email, date, time, tour_type, group_size, location, notes } = body;

      if (!guide_user_id || !traveler_name || !date || !time || !tour_type) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: guide_user_id, traveler_name, date, time, tour_type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase.from("bookings").insert({
        guide_user_id,
        traveler_name: String(traveler_name).slice(0, 100),
        traveler_email: traveler_email ? String(traveler_email).slice(0, 255) : null,
        date,
        time,
        tour_type: String(tour_type).slice(0, 200),
        group_size: Math.min(Math.max(parseInt(group_size) || 1, 1), 200),
        location: location ? String(location).slice(0, 200) : null,
        notes: notes ? String(notes).slice(0, 1000) : null,
      }).select().single();

      if (error) throw error;

      return new Response(JSON.stringify({ booking: data }), {
        status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET — list bookings for authenticated user
    if (req.method === "GET") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userSupabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await userSupabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userId = claimsData.claims.sub;
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("guide_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return new Response(JSON.stringify({ bookings: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("api-bookings error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
