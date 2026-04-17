import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Founding plan price ID — activates instantly without Stripe checkout
const FREE_PRICE_ID = "price_1TGrIRC1U7SmvwepwpRmbWkU";
// Founding free-period end (UTC). Founding guides activate with this expiry.
const FOUNDING_FREE_UNTIL = "2026-12-31T23:59:59Z";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { guide_user_id, price_id, success_url, cancel_url } = await req.json();

    if (!guide_user_id || !price_id || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: guide_user_id, price_id, success_url, cancel_url" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify guide exists
    const { data: guide, error: guideError } = await supabase
      .from("guide_profiles")
      .select("id, stripe_customer_id, user_id, form_data")
      .eq("user_id", guide_user_id)
      .maybeSingle();

    if (guideError || !guide) {
      return new Response(
        JSON.stringify({ error: "Guide profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== FOUNDING (FREE) PLAN BRANCH — instant activation, no Stripe =====
    if (price_id === FREE_PRICE_ID) {
      // Look up founding plan UUID
      const { data: foundingPlan } = await supabase
        .from("subscription_plans")
        .select("id")
        .eq("slug", "founding")
        .maybeSingle();

      // Atomically claim a founding spot. Throws 'founding_guide_limit_reached' if full.
      let newCount: number | null = null;
      try {
        const { data: incData, error: incError } = await supabase.rpc("increment_founding_count");
        if (incError) throw incError;
        newCount = typeof incData === "number" ? incData : Number(incData);
      } catch (e: any) {
        const msg = String(e?.message || "");
        if (msg.includes("founding_guide_limit_reached")) {
          return new Response(
            JSON.stringify({ error: "Founding Guide spots are full. Please choose Pro or Featured." }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw e;
      }

      const { error: updateError } = await supabase
        .from("guide_profiles")
        .update({
          activation_status: "active",
          subscription_tier: "founding",
          subscription_status: "active",
          subscription_plan_id: foundingPlan?.id ?? null,
          subscription_started_at: new Date().toISOString(),
          subscription_expires_at: FOUNDING_FREE_UNTIL,
          payment_reminder_count: 0,
          suspension_reason: null,
        })
        .eq("user_id", guide_user_id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: `Failed to activate founding plan: ${updateError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Look up email
      let guideEmail: string | undefined;
      let guideName = "there";
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(guide_user_id);
        guideEmail = authUser?.user?.email;
        const fd: any = guide.form_data || {};
        guideName = `${fd.firstName || ""} ${fd.lastName || ""}`.trim() || "there";
      } catch (e) {
        console.error("Failed to look up guide:", e);
      }

      // Send founding-guide welcome email
      if (guideEmail) {
        try {
          await supabase.functions.invoke("send-notification", {
            body: {
              type: "founding_guide_welcome",
              data: { guideName, guideEmail, lockedPrice: 29 },
            },
          });
        } catch (e) {
          console.error("Failed to send founding welcome email:", e);
        }
      }

      // If we just hit 50, alert the admin
      if (newCount === 50) {
        try {
          await supabase.functions.invoke("send-notification", {
            body: {
              type: "founding_spots_filled",
              data: { filledAt: new Date().toISOString() },
            },
          });
        } catch (e) {
          console.error("Failed to send founding-spots-filled admin alert:", e);
        }
      }

      return new Response(
        JSON.stringify({ free: true, redirect_url: success_url, founding_count: newCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== PAID PLAN BRANCH — Stripe Checkout =====
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    let customerId = guide.stripe_customer_id;

    if (!customerId) {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(guide_user_id);

      if (authError || !authUser?.user?.email) {
        return new Response(
          JSON.stringify({ error: "Could not retrieve guide email" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const customer = await stripe.customers.create({
        email: authUser.user.email,
        metadata: { guide_user_id, guide_profile_id: guide.id },
      });

      customerId = customer.id;

      await supabase
        .from("guide_profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", guide_user_id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: price_id, quantity: 1 }],
      success_url,
      cancel_url,
      subscription_data: {
        metadata: { guide_user_id },
      },
      metadata: { guide_user_id },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("guide-subscribe error:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Failed to create subscription checkout" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
