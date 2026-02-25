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
  const pathParts = url.pathname.split("/").filter(Boolean);
  // Expected: /api-guides or /api-guides/{id}
  const guideId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

  try {
    if (req.method === "GET") {
      if (guideId && guideId !== "api-guides") {
        // GET single guide
        const { data, error } = await supabase
          .from("guide_profiles")
          .select("id, user_id, form_data, service_areas, translations, created_at")
          .eq("status", "approved")
          .eq("id", guideId)
          .single();

        if (error || !data) {
          return new Response(JSON.stringify({ error: "Guide not found" }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ guide: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // GET list with optional filters
      const city = url.searchParams.get("city");
      const language = url.searchParams.get("language");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase
        .from("guide_profiles")
        .select("id, user_id, form_data, service_areas, translations, created_at")
        .eq("status", "approved")
        .range(offset, offset + limit - 1);

      if (city) {
        query = query.contains("service_areas", [city]);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Filter by language client-side if needed (stored in form_data JSON)
      let results = data || [];
      if (language) {
        results = results.filter((g: any) => {
          const langs = g.form_data?.languages || "";
          return langs.toLowerCase().includes(language.toLowerCase());
        });
      }

      return new Response(JSON.stringify({ guides: results, total: results.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("api-guides error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
