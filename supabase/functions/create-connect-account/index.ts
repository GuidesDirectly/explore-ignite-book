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

    // Get the authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, return_url } = await req.json();

    // Get guide profile
    const { data: profile } = await supabase
      .from("guide_profiles")
      .select("stripe_account_id, stripe_onboarding_complete, form_data")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Guide profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fd = profile.form_data as any;

    if (action === "status") {
      // Return current Connect status
      let accountStatus = null;
      if (profile.stripe_account_id) {
        try {
          const account = await stripe.accounts.retrieve(profile.stripe_account_id);
          accountStatus = {
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
          };

          // Update onboarding status if complete
          if (account.charges_enabled && account.payouts_enabled && !profile.stripe_onboarding_complete) {
            await supabase
              .from("guide_profiles")
              .update({ stripe_onboarding_complete: true })
              .eq("user_id", user.id);
          }
        } catch (e) {
          console.error("Failed to retrieve Stripe account:", e);
        }
      }

      return new Response(
        JSON.stringify({
          has_account: !!profile.stripe_account_id,
          onboarding_complete: profile.stripe_onboarding_complete,
          account_status: accountStatus,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "onboard") {
      let accountId = profile.stripe_account_id;

      // Create account if doesn't exist
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: "express",
          email: user.email,
          metadata: { user_id: user.id },
          business_profile: {
            name: `${fd?.firstName || ""} ${fd?.lastName || ""}`.trim() || undefined,
            product_description: "Tour guide services",
          },
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        });

        accountId = account.id;

        await supabase
          .from("guide_profiles")
          .update({ stripe_account_id: accountId })
          .eq("user_id", user.id);
      }

      // Create onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: return_url || "https://explore-ignite-book.lovable.app/guide-dashboard",
        return_url: return_url || "https://explore-ignite-book.lovable.app/guide-dashboard",
        type: "account_onboarding",
      });

      return new Response(
        JSON.stringify({ url: accountLink.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "dashboard") {
      if (!profile.stripe_account_id) {
        return new Response(JSON.stringify({ error: "No Stripe account found" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const loginLink = await stripe.accounts.createLoginLink(profile.stripe_account_id);
      return new Response(
        JSON.stringify({ url: loginLink.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-connect-account error:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
