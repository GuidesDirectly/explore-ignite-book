import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const NOTIFY_EMAIL = "michael@iguidetours.net";

function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get inquiries from the last 7 days with "other:" destinations
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: inquiries, error } = await supabase
      .from("inquiries")
      .select("destination, name, email, created_at")
      .like("destination", "other:%")
      .gte("created_at", oneWeekAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!inquiries || inquiries.length === 0) {
      console.log("No unserved destination requests this week. Skipping digest.");
      return new Response(JSON.stringify({ message: "No unserved requests this week" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aggregate by city
    const cityMap = new Map<string, { count: number; travelers: Set<string>; names: string[]; latest: string }>();
    for (const inq of inquiries) {
      const city = inq.destination.replace("other:", "").trim();
      const key = city.toLowerCase();
      const existing = cityMap.get(key);
      if (existing) {
        existing.count++;
        existing.travelers.add(inq.email);
        if (!existing.names.includes(inq.name)) existing.names.push(inq.name);
        if (inq.created_at > existing.latest) existing.latest = inq.created_at;
      } else {
        cityMap.set(key, {
          count: 1,
          travelers: new Set([inq.email]),
          names: [inq.name],
          latest: inq.created_at,
        });
      }
    }

    const sorted = Array.from(cityMap.entries())
      .map(([key, val]) => ({
        city: key.charAt(0).toUpperCase() + key.slice(1),
        count: val.count,
        travelers: val.travelers.size,
        names: val.names,
        latest: val.latest,
      }))
      .sort((a, b) => b.count - a.count);

    // Build email
    const weekStart = oneWeekAgo.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const weekEnd = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const cityRows = sorted
      .map(
        (c, i) => `
        <tr style="border-bottom:1px solid #e8e0d0;">
          <td style="padding:12px 16px;font-weight:bold;color:#d4a843;font-size:18px;width:40px;">${i + 1}</td>
          <td style="padding:12px 16px;">
            <strong style="color:#1a1f2e;font-size:15px;">${escapeHtml(c.city)}</strong>
            <br/><span style="color:#888;font-size:12px;">${c.travelers} unique traveler${c.travelers !== 1 ? "s" : ""}</span>
          </td>
          <td style="padding:12px 16px;text-align:center;">
            <span style="background:#d4a843;color:#1a1f2e;padding:4px 12px;border-radius:12px;font-weight:bold;font-size:14px;">${c.count}</span>
          </td>
          <td style="padding:12px 16px;color:#888;font-size:12px;text-align:right;">
            ${new Date(c.latest).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </td>
        </tr>`
      )
      .join("");

    const html = `
      <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;border:1px solid #e8e0d0;">
        <div style="background:linear-gradient(135deg,#1a1f2e 0%,#2a2f3e 100%);padding:40px 30px;text-align:center;">
          <h1 style="color:#d4a843;margin:0;font-size:24px;letter-spacing:1px;">iGuide Tours</h1>
          <p style="color:#8a8fa0;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Weekly Expansion Digest</p>
        </div>
        <div style="padding:30px;background:#faf9f7;">
          <h2 style="color:#1a1f2e;font-size:20px;margin:0 0 8px;">🌍 Expansion Opportunities</h2>
          <p style="color:#666;font-size:14px;margin:0 0 24px;">${weekStart} — ${weekEnd} · ${inquiries.length} total request${inquiries.length !== 1 ? "s" : ""} for ${sorted.length} unserved destination${sorted.length !== 1 ? "s" : ""}</p>
          
          <table style="width:100%;border-collapse:collapse;border:1px solid #e8e0d0;border-radius:8px;">
            <thead>
              <tr style="background:#f0ede6;">
                <th style="padding:10px 16px;text-align:left;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">#</th>
                <th style="padding:10px 16px;text-align:left;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Destination</th>
                <th style="padding:10px 16px;text-align:center;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Requests</th>
                <th style="padding:10px 16px;text-align:right;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Latest</th>
              </tr>
            </thead>
            <tbody>
              ${cityRows}
            </tbody>
          </table>

          <div style="margin-top:24px;padding:16px;background:#fff3cd;border:1px solid #ffc107;border-radius:8px;">
            <p style="margin:0;color:#856404;font-size:13px;">
              <strong>💡 Action items:</strong> Consider recruiting guides in the top-requested cities above. 
              These travelers are actively looking for guides and may convert quickly once coverage is available.
            </p>
          </div>

          <div style="text-align:center;margin-top:24px;">
            <a href="https://explore-ignite-book.lovable.app/admin" style="display:inline-block;background:linear-gradient(135deg,#d4a843,#c49a3a);color:#1a1f2e;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;">View Full Dashboard</a>
          </div>
        </div>
        <div style="padding:16px;text-align:center;background:#1a1f2e;">
          <p style="color:#8a8fa0;font-size:11px;margin:0;">iGuide Tours — Premium Private Tours Across North America</p>
          <p style="color:#555;font-size:10px;margin:4px 0 0;">This is an automated weekly digest. Sent every Monday at 9 AM ET.</p>
        </div>
      </div>
    `;

    const { error: sendError } = await resend.emails.send({
      from: "iGuide Tours <noreply@iguidetours.net>",
      to: [NOTIFY_EMAIL],
      subject: `🌍 Weekly Expansion Digest — ${sorted.length} unserved destination${sorted.length !== 1 ? "s" : ""} (${weekStart}–${weekEnd})`,
      html,
    });

    if (sendError) throw sendError;

    console.log(`Expansion digest sent: ${sorted.length} cities, ${inquiries.length} requests`);

    return new Response(
      JSON.stringify({ success: true, cities: sorted.length, requests: inquiries.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Expansion digest error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
