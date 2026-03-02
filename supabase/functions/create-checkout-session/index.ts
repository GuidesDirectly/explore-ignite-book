import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      booking_id,
      guide_user_id,
      traveler_name,
      traveler_email,
      tour_type,
      amount_cents,
      date,
      time,
      location,
      group_size,
      success_url,
      cancel_url,
    } = await req.json();

    if (!guide_user_id || !tour_type || !amount_cents || !traveler_email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate 85/15 split
    const totalAmount = Math.round(Number(amount_cents));
    const platformFee = Math.round(totalAmount * 0.15);

    // Check if guide has a Stripe Connect account
    const { data: guideProfile } = await supabase
      .from("guide_profiles")
      .select("stripe_account_id, stripe_onboarding_complete")
      .eq("user_id", guide_user_id)
      .single();

    const hasConnectedAccount = guideProfile?.stripe_account_id && guideProfile?.stripe_onboarding_complete;

    // Build session params
    const sessionParams: any = {
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: traveler_email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: tour_type,
              description: `Tour with guide on ${date} at ${time}${location ? ` in ${location}` : ""}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking_id || "",
        guide_user_id,
        traveler_name,
        traveler_email,
        tour_type,
        date,
        time,
        location: location || "",
        group_size: String(group_size || 1),
        platform_fee: String(platformFee),
      },
      success_url: success_url || "https://explore-ignite-book.lovable.app/home?payment=success",
      cancel_url: cancel_url || "https://explore-ignite-book.lovable.app/home?payment=cancelled",
    };

    // If guide has Connect, use destination charges for automatic split
    if (hasConnectedAccount) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: guideProfile.stripe_account_id,
        },
      };
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionParams);

    // Create payment record
    await supabase.from("payments").insert({
      booking_id: booking_id || null,
      stripe_checkout_session_id: session.id,
      guide_user_id,
      traveler_email,
      amount_total: totalAmount,
      platform_fee: platformFee,
      guide_payout: totalAmount - platformFee,
      currency: "usd",
      status: "pending",
      metadata: {
        tour_type,
        date,
        time,
        location,
        group_size,
        traveler_name,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-checkout-session error:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
