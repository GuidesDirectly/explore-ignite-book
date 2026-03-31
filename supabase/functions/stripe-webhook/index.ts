import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
      },
    });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // For development/sandbox without webhook signature verification
      event = JSON.parse(body);
    }

    console.log(`Stripe webhook received: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = session.metadata || {};

      // Update payment record
      const { error: paymentError } = await supabase
        .from("payments")
        .update({
          stripe_payment_intent_id: session.payment_intent as string,
          status: "completed",
        })
        .eq("stripe_checkout_session_id", session.id);

      if (paymentError) {
        console.error("Failed to update payment:", paymentError);
      }

      // Update booking status to confirmed if booking_id exists
      if (meta.booking_id) {
        const { error: bookingError } = await supabase
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", meta.booking_id);

        if (bookingError) {
          console.error("Failed to update booking:", bookingError);
        }
      }

      // Create notification for guide
      if (meta.guide_user_id) {
        await supabase.from("notifications").insert({
          user_id: meta.guide_user_id,
          title: "New Paid Booking!",
          message: `${meta.traveler_name} booked a ${meta.tour_type} on ${meta.date}. Payment received.`,
          type: "booking",
          metadata: {
            booking_id: meta.booking_id,
            amount: session.amount_total,
            tour_type: meta.tour_type,
          },
        });
      }

      console.log(`Payment completed for session ${session.id}`);
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;

      await supabase
        .from("payments")
        .update({ status: "expired" })
        .eq("stripe_checkout_session_id", session.id);
    }

    // --- Subscription lifecycle events ---

    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const guideUserId = subscription.metadata?.guide_user_id;

      if (guideUserId) {
        const tier = (() => {
          const priceId = subscription.items?.data?.[0]?.price?.id;
          if (priceId === "price_1TGrOMC1U7Smvwep4HvHeBiF") return "featured";
          if (priceId === "price_1TGrLvC1U7SmvwepyB5krby7") return "pro";
          return "founding";
        })();

        const status = subscription.status === "active" || subscription.status === "trialing" ? "active" : "past_due";

        const { error } = await supabase
          .from("guide_profiles")
          .update({
            subscription_status: status,
            subscription_tier: tier,
            stripe_subscription_id: subscription.id,
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("user_id", guideUserId);

        if (error) console.error(`Failed to update subscription for ${guideUserId}:`, error);
        else console.log(`Subscription ${event.type} processed for guide ${guideUserId}, tier: ${tier}`);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const guideUserId = subscription.metadata?.guide_user_id;

      if (guideUserId) {
        const { error } = await supabase
          .from("guide_profiles")
          .update({ subscription_status: "cancelled", subscription_tier: "founding" })
          .eq("user_id", guideUserId);

        if (error) console.error(`Failed to cancel subscription for ${guideUserId}:`, error);
        else console.log(`Subscription cancelled for guide ${guideUserId}`);
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as any;
      const customerId = invoice.customer;

      if (customerId) {
        const { error } = await supabase
          .from("guide_profiles")
          .update({ subscription_status: "past_due" })
          .eq("stripe_customer_id", customerId);

        if (error) console.error(`Failed to set past_due for customer ${customerId}:`, error);
        else console.log(`Payment failed for customer ${customerId}, set to past_due`);
      }
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as any;
      const customerId = invoice.customer;

      if (customerId) {
        const { error } = await supabase
          .from("guide_profiles")
          .update({ subscription_status: "active" })
          .eq("stripe_customer_id", customerId);

        if (error) console.error(`Failed to set active for customer ${customerId}:`, error);
        else console.log(`Payment succeeded for customer ${customerId}, set to active`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stripe-webhook error:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Webhook handler failed" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
