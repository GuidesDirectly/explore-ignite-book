import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REMINDER_DAYS = [0, 3, 7, 14]; // Days after approval to send reminders
const SUSPEND_AFTER_DAYS = 30;

// Founding Guide free period end + warning windows
const FOUNDING_FREE_UNTIL_ISO = "2026-12-31T23:59:59Z";
const FOUNDING_30DAY_START_ISO = "2026-12-01T00:00:00Z";
const FOUNDING_7DAY_START_ISO = "2026-12-24T00:00:00Z";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date();
    let remindersSent = 0;
    let expiringSoonSent = 0;
    let expiredCount = 0;
    let suspendedCount = 0;
    let founding30daySent = 0;
    let founding7daySent = 0;
    let foundingExpiredCount = 0;

    // === JOB 1: Activation reminders for approved-but-inactive guides ===
    const { data: inactive } = await supabase
      .from("guide_profiles")
      .select("user_id, form_data, payment_reminder_count, last_reminder_sent_at, updated_at, created_at")
      .eq("status", "approved")
      .eq("activation_status", "inactive")
      .lt("payment_reminder_count", REMINDER_DAYS.length);

    for (const g of inactive || []) {
      const reminderIdx = g.payment_reminder_count;
      const baseDate = new Date(g.updated_at || g.created_at);
      const dueDate = new Date(baseDate.getTime() + REMINDER_DAYS[reminderIdx] * 24 * 60 * 60 * 1000);

      if (now < dueDate) continue;
      if (g.last_reminder_sent_at && now.getTime() - new Date(g.last_reminder_sent_at).getTime() < 24 * 60 * 60 * 1000) continue;

      const { data: authUser } = await supabase.auth.admin.getUserById(g.user_id);
      const email = authUser?.user?.email;
      const fd: any = g.form_data || {};
      const name = `${fd.firstName || ""} ${fd.lastName || ""}`.trim() || "there";

      if (email) {
        await supabase.functions.invoke("send-notification", {
          body: { type: "activation_reminder", data: { guideName: name, guideEmail: email } },
        });
        await supabase
          .from("guide_profiles")
          .update({
            payment_reminder_count: reminderIdx + 1,
            last_reminder_sent_at: now.toISOString(),
          })
          .eq("user_id", g.user_id);
        remindersSent++;
      }
    }

    // === JOB 2: Suspend approved-inactive guides after 30 days of no activation ===
    const suspendCutoff = new Date(now.getTime() - SUSPEND_AFTER_DAYS * 24 * 60 * 60 * 1000);
    const { data: toSuspend } = await supabase
      .from("guide_profiles")
      .select("user_id, updated_at")
      .eq("status", "approved")
      .eq("activation_status", "inactive")
      .gte("payment_reminder_count", REMINDER_DAYS.length)
      .lte("updated_at", suspendCutoff.toISOString());

    for (const g of toSuspend || []) {
      await supabase
        .from("guide_profiles")
        .update({ activation_status: "suspended", suspension_reason: "non_payment" })
        .eq("user_id", g.user_id);
      suspendedCount++;
    }

    // === JOB 3: Subscription expiring soon (7 days warning, paid plans only) ===
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const { data: expiringSoon } = await supabase
      .from("guide_profiles")
      .select("user_id, form_data, subscription_tier, subscription_expires_at, last_reminder_sent_at")
      .eq("activation_status", "active")
      .in("subscription_tier", ["pro", "featured"])
      .not("subscription_expires_at", "is", null)
      .lte("subscription_expires_at", sevenDaysFromNow.toISOString())
      .gte("subscription_expires_at", now.toISOString());

    for (const g of expiringSoon || []) {
      if (g.last_reminder_sent_at && now.getTime() - new Date(g.last_reminder_sent_at).getTime() < 48 * 60 * 60 * 1000) continue;

      const { data: authUser } = await supabase.auth.admin.getUserById(g.user_id);
      const email = authUser?.user?.email;
      const fd: any = g.form_data || {};
      const name = `${fd.firstName || ""} ${fd.lastName || ""}`.trim() || "there";

      if (email) {
        await supabase.functions.invoke("send-notification", {
          body: { type: "subscription_expiring_soon", data: { guideName: name, guideEmail: email, tier: g.subscription_tier } },
        });
        await supabase
          .from("guide_profiles")
          .update({ last_reminder_sent_at: now.toISOString() })
          .eq("user_id", g.user_id);
        expiringSoonSent++;
      }
    }

    // === JOB 4: Expiry sweep — deactivate paid plans whose period has passed ===
    const { data: expired } = await supabase
      .from("guide_profiles")
      .select("user_id, form_data, subscription_tier")
      .eq("activation_status", "active")
      .in("subscription_tier", ["pro", "featured"])
      .not("subscription_expires_at", "is", null)
      .lt("subscription_expires_at", now.toISOString());

    for (const g of expired || []) {
      await supabase
        .from("guide_profiles")
        .update({
          activation_status: "inactive",
          subscription_status: "cancelled",
          suspension_reason: "subscription_expired",
        })
        .eq("user_id", g.user_id);

      const { data: authUser } = await supabase.auth.admin.getUserById(g.user_id);
      const email = authUser?.user?.email;
      const fd: any = g.form_data || {};
      const name = `${fd.firstName || ""} ${fd.lastName || ""}`.trim() || "there";

      if (email) {
        await supabase.functions.invoke("send-notification", {
          body: { type: "subscription_expired", data: { guideName: name, guideEmail: email, tier: g.subscription_tier } },
        });
      }
      expiredCount++;
    }

    // === JOB 5: Founding Guide — 30-day warning (Dec 1 → Dec 23) ===
    if (now >= new Date(FOUNDING_30DAY_START_ISO) && now < new Date(FOUNDING_7DAY_START_ISO)) {
      const { data: founding } = await supabase
        .from("guide_profiles")
        .select("user_id, form_data, subscription_tier, last_reminder_sent_at")
        .eq("activation_status", "active")
        .eq("subscription_tier", "founding");

      for (const g of founding || []) {
        if (g.last_reminder_sent_at && now.getTime() - new Date(g.last_reminder_sent_at).getTime() < 7 * 24 * 60 * 60 * 1000) continue;
        const { data: authUser } = await supabase.auth.admin.getUserById(g.user_id);
        const email = authUser?.user?.email;
        const fd: any = g.form_data || {};
        const name = `${fd.firstName || ""} ${fd.lastName || ""}`.trim() || "there";
        if (email) {
          await supabase.functions.invoke("send-notification", {
            body: { type: "founding_30day_warning", data: { guideName: name, guideEmail: email, lockedPrice: 29 } },
          });
          await supabase
            .from("guide_profiles")
            .update({ last_reminder_sent_at: now.toISOString() })
            .eq("user_id", g.user_id);
          founding30daySent++;
        }
      }
    }

    // === JOB 6: Founding Guide — 7-day warning (Dec 24 → Dec 31) ===
    if (now >= new Date(FOUNDING_7DAY_START_ISO) && now < new Date(FOUNDING_FREE_UNTIL_ISO)) {
      const { data: founding } = await supabase
        .from("guide_profiles")
        .select("user_id, form_data, subscription_tier, last_reminder_sent_at")
        .eq("activation_status", "active")
        .eq("subscription_tier", "founding");

      for (const g of founding || []) {
        if (g.last_reminder_sent_at && now.getTime() - new Date(g.last_reminder_sent_at).getTime() < 2 * 24 * 60 * 60 * 1000) continue;
        const { data: authUser } = await supabase.auth.admin.getUserById(g.user_id);
        const email = authUser?.user?.email;
        const fd: any = g.form_data || {};
        const name = `${fd.firstName || ""} ${fd.lastName || ""}`.trim() || "there";
        if (email) {
          await supabase.functions.invoke("send-notification", {
            body: { type: "founding_7day_warning", data: { guideName: name, guideEmail: email, lockedPrice: 29 } },
          });
          await supabase
            .from("guide_profiles")
            .update({ last_reminder_sent_at: now.toISOString() })
            .eq("user_id", g.user_id);
          founding7daySent++;
        }
      }
    }

    // === JOB 7: Founding Guide expiry (Jan 1, 2027 onward) ===
    if (now > new Date(FOUNDING_FREE_UNTIL_ISO)) {
      const { data: foundingExpired } = await supabase
        .from("guide_profiles")
        .select("user_id, form_data, subscription_tier")
        .eq("activation_status", "active")
        .eq("subscription_tier", "founding")
        .not("subscription_expires_at", "is", null)
        .lt("subscription_expires_at", now.toISOString());

      for (const g of foundingExpired || []) {
        await supabase
          .from("guide_profiles")
          .update({
            activation_status: "inactive",
            subscription_status: "cancelled",
            suspension_reason: "founding_period_expired",
          })
          .eq("user_id", g.user_id);

        const { data: authUser } = await supabase.auth.admin.getUserById(g.user_id);
        const email = authUser?.user?.email;
        const fd: any = g.form_data || {};
        const name = `${fd.firstName || ""} ${fd.lastName || ""}`.trim() || "there";

        if (email) {
          await supabase.functions.invoke("send-notification", {
            body: { type: "founding_expired", data: { guideName: name, guideEmail: email, lockedPrice: 29 } },
          });
        }
        foundingExpiredCount++;
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        remindersSent,
        expiringSoonSent,
        expiredCount,
        suspendedCount,
        founding30daySent,
        founding7daySent,
        foundingExpiredCount,
        ranAt: now.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("guide-activation-reminders error:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
