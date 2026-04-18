import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SITE = "https://iguidetours.net";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: guides } = await supabase
      .from("guide_profiles_public")
      .select("user_id");

    const today = new Date().toISOString().split("T")[0];

    const staticUrls = [
      { loc: `${SITE}/`, priority: "1.0", changefreq: "weekly" },
      { loc: `${SITE}/guides`, priority: "0.9", changefreq: "daily" },
      { loc: `${SITE}/for-guides`, priority: "0.8", changefreq: "weekly" },
      { loc: `${SITE}/explore`, priority: "0.7", changefreq: "weekly" },
      { loc: `${SITE}/ai-planner`, priority: "0.7", changefreq: "weekly" },
      { loc: `${SITE}/trust`, priority: "0.6", changefreq: "monthly" },
      { loc: `${SITE}/support`, priority: "0.5", changefreq: "monthly" },
      { loc: `${SITE}/privacy-policy`, priority: "0.4", changefreq: "yearly" },
    ];

    const guideUrls = (guides || [])
      .filter((g: { user_id: string | null }) => g.user_id)
      .map((g: { user_id: string }) => ({
        loc: `${SITE}/guide/${g.user_id}`,
        priority: "0.8",
        changefreq: "weekly",
      }));

    const allUrls = [...staticUrls, ...guideUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    return new Response(
      `<?xml version="1.0"?><error>${(e as Error).message}</error>`,
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/xml" },
      }
    );
  }
});
