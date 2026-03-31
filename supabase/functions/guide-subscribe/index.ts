import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify guide exists
    const { data: guide, error: guideError } = await supabase
      .from("guide_profiles")
      .select("id, stripe_customer_id, user_id")
      .eq("user_id", guide_user_id)
      .maybeSingle();

    if (guideError || !guide) {
      return new Response(
        JSON.stringify({ error: "Guide profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or create Stripe customer
    let customerId = guide.stripe_customer_id;

    if (!customerId) {
      // Get guide's email from auth.users
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

      // Save customer ID to guide_profiles
      await supabase
        .from("guide_profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", guide_user_id);
    }

    // Create Stripe Checkout Session for subscription
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
