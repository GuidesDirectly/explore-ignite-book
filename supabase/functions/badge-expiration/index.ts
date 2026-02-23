import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const now = new Date();
    const results = { expired_removed: 0, reminders_sent: 0, errors: [] as string[] };

    // 1. Remove expired badges
    const { data: expiredBadges, error: expiredErr } = await supabase
      .from("guide_badges")
      .select("id, guide_user_id, badge_type, expires_at")
      .not("expires_at", "is", null)
      .lt("expires_at", now.toISOString());

    if (expiredErr) {
      results.errors.push(`Fetch expired: ${expiredErr.message}`);
    } else if (expiredBadges && expiredBadges.length > 0) {
      const expiredIds = expiredBadges.map((b: any) => b.id);
      const { error: delErr } = await supabase
        .from("guide_badges")
        .delete()
        .in("id", expiredIds);

      if (delErr) {
        results.errors.push(`Delete expired: ${delErr.message}`);
      } else {
        results.expired_removed = expiredIds.length;

        // Log audit entries for each removal
        const auditEntries = expiredBadges.map((b: any) => ({
          admin_id: "00000000-0000-0000-0000-000000000000", // system
          action: "auto_expire",
          target_guide_id: b.guide_user_id,
          metadata: { badge_type: b.badge_type, expired_at: b.expires_at },
        }));
        await supabase.from("verification_audit_log").insert(auditEntries);

        // Notify each affected guide
        for (const badge of expiredBadges) {
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(badge.guide_user_id);
            const guideEmail = userData?.user?.email;
            if (!guideEmail) continue;

            // Get guide name
            const { data: profile } = await supabase
              .from("guide_profiles")
              .select("form_data")
              .eq("user_id", badge.guide_user_id)
              .maybeSingle();
            const fd = profile?.form_data as any;
            const name = fd ? `${fd.firstName || ""} ${fd.lastName || ""}`.trim() : "Guide";
            const badgeLabel = badge.badge_type.replace(/_/g, " ");

            await resend.emails.send({
              from: "iGuide Tours <noreply@iguidetours.net>",
              to: [guideEmail],
              subject: `⚠️ Your "${badgeLabel}" badge has expired`,
              html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                  <div style="background:#1a1f2e;padding:30px;text-align:center;">
                    <h1 style="color:#d4a843;margin:0;">iGuide Tours</h1>
                  </div>
                  <div style="padding:30px;background:#faf9f7;">
                    <h2 style="color:#1a1f2e;">Hi ${escapeHtml(name)},</h2>
                    <p style="color:#333;line-height:1.7;">Your <strong>${escapeHtml(badgeLabel)}</strong> credential has expired and has been removed from your profile.</p>
                    <p style="color:#333;line-height:1.7;">To maintain your verified status and traveler trust, please upload your renewed credentials through your Guide Dashboard.</p>
                    <div style="text-align:center;margin:25px 0;">
                      <a href="https://explore-ignite-book.lovable.app/guide-dashboard" style="display:inline-block;background:#d4a843;color:#1a1f2e;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">Update Credentials</a>
                    </div>
                  </div>
                  <div style="padding:15px;text-align:center;background:#1a1f2e;">
                    <p style="color:#8a8fa0;font-size:11px;margin:0;">iGuide Tours — Premium Private Tours Across North America</p>
                  </div>
                </div>
              `,
            });
          } catch (e) {
            results.errors.push(`Email expired guide ${badge.guide_user_id}: ${(e as Error).message}`);
          }
        }
      }
    }

    // 2. Send 30-day renewal reminders
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const { data: expiringBadges, error: expiringErr } = await supabase
      .from("guide_badges")
      .select("id, guide_user_id, badge_type, expires_at")
      .not("expires_at", "is", null)
      .gt("expires_at", now.toISOString())
      .lte("expires_at", thirtyDaysFromNow.toISOString());

    if (expiringErr) {
      results.errors.push(`Fetch expiring: ${expiringErr.message}`);
    } else if (expiringBadges && expiringBadges.length > 0) {
      for (const badge of expiringBadges) {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(badge.guide_user_id);
          const guideEmail = userData?.user?.email;
          if (!guideEmail) continue;

          const { data: profile } = await supabase
            .from("guide_profiles")
            .select("form_data")
            .eq("user_id", badge.guide_user_id)
            .maybeSingle();
          const fd = profile?.form_data as any;
          const name = fd ? `${fd.firstName || ""} ${fd.lastName || ""}`.trim() : "Guide";
          const badgeLabel = badge.badge_type.replace(/_/g, " ");
          const daysLeft = Math.ceil(
            (new Date(badge.expires_at!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          await resend.emails.send({
            from: "iGuide Tours <noreply@iguidetours.net>",
            to: [guideEmail],
            subject: `🔔 Your "${badgeLabel}" badge expires in ${daysLeft} days`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                <div style="background:#1a1f2e;padding:30px;text-align:center;">
                  <h1 style="color:#d4a843;margin:0;">iGuide Tours</h1>
                </div>
                <div style="padding:30px;background:#faf9f7;">
                  <h2 style="color:#1a1f2e;">Hi ${escapeHtml(name)},</h2>
                  <p style="color:#333;line-height:1.7;">Your <strong>${escapeHtml(badgeLabel)}</strong> credential is expiring in <strong>${daysLeft} days</strong>.</p>
                  <p style="color:#333;line-height:1.7;">To avoid losing your verified status, please upload your renewed credentials before the expiration date.</p>
                  <div style="text-align:center;margin:25px 0;">
                    <a href="https://explore-ignite-book.lovable.app/guide-dashboard" style="display:inline-block;background:#d4a843;color:#1a1f2e;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">Renew Credentials</a>
                  </div>
                </div>
                <div style="padding:15px;text-align:center;background:#1a1f2e;">
                  <p style="color:#8a8fa0;font-size:11px;margin:0;">iGuide Tours — Premium Private Tours Across North America</p>
                </div>
              </div>
            `,
          });
          results.reminders_sent++;
        } catch (e) {
          results.errors.push(`Email remind ${badge.guide_user_id}: ${(e as Error).message}`);
        }
      }
    }

    console.log("Badge expiration job results:", JSON.stringify(results));

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Badge expiration job failed:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
