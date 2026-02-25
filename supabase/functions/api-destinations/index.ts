import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Static destination catalog — enriched with guide counts from DB
const DESTINATIONS = [
  { slug: "washington-dc", name: "Washington D.C.", country: "USA", region: "East Coast", image: "/assets/city-cards/boston.jpg" },
  { slug: "new-york", name: "New York City", country: "USA", region: "East Coast", image: "/assets/city-cards/nyc.jpg" },
  { slug: "boston", name: "Boston", country: "USA", region: "East Coast", image: "/assets/city-cards/boston.jpg" },
  { slug: "chicago", name: "Chicago", country: "USA", region: "Midwest", image: "/assets/city-cards/chicago.jpg" },
  { slug: "miami", name: "Miami", country: "USA", region: "Southeast", image: "/assets/city-cards/miami.jpg" },
  { slug: "los-angeles", name: "Los Angeles", country: "USA", region: "West Coast", image: "/assets/city-cards/los-angeles.jpg" },
  { slug: "san-francisco", name: "San Francisco", country: "USA", region: "West Coast", image: "/assets/city-cards/san-francisco.jpg" },
  { slug: "las-vegas", name: "Las Vegas", country: "USA", region: "West", image: "/assets/city-cards/las-vegas.jpg" },
  { slug: "denver", name: "Denver", country: "USA", region: "West", image: "/assets/city-cards/denver.jpg" },
  { slug: "houston", name: "Houston", country: "USA", region: "South", image: "/assets/city-cards/houston.jpg" },
  { slug: "phoenix", name: "Phoenix", country: "USA", region: "Southwest", image: "/assets/city-cards/phoenix.jpg" },
  { slug: "san-diego", name: "San Diego", country: "USA", region: "West Coast", image: "/assets/city-cards/san-diego.jpg" },
  { slug: "san-antonio", name: "San Antonio", country: "USA", region: "South", image: "/assets/city-cards/san-antonio.jpg" },
  { slug: "philadelphia", name: "Philadelphia", country: "USA", region: "East Coast", image: "/assets/city-cards/philadelphia.jpg" },
  { slug: "niagara-falls", name: "Niagara Falls", country: "USA/Canada", region: "Northeast", image: "/assets/city-cards/boston.jpg" },
  { slug: "toronto", name: "Toronto", country: "Canada", region: "Ontario", image: "/assets/city-cards/toronto.jpg" },
  { slug: "montreal", name: "Montreal", country: "Canada", region: "Quebec", image: "/assets/city-cards/montreal.jpg" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get guide counts per service area
    const { data: guides } = await supabase
      .from("guide_profiles")
      .select("service_areas")
      .eq("status", "approved");

    const areaCounts: Record<string, number> = {};
    (guides || []).forEach((g: any) => {
      (g.service_areas || []).forEach((area: string) => {
        const key = area.toLowerCase().replace(/\s+/g, "-");
        areaCounts[key] = (areaCounts[key] || 0) + 1;
      });
    });

    const enriched = DESTINATIONS.map((d) => ({
      ...d,
      guideCount: areaCounts[d.slug] || 0,
    }));

    return new Response(JSON.stringify({ destinations: enriched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("api-destinations error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
