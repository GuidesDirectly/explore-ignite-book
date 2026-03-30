import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Query draft guides older than 48 hours
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: draftGuides, error } = await supabase
      .from("guide_profiles")
      .select("id, user_id, form_data, created_at")
      .eq("status", "draft")
      .lt("created_at", cutoff);

    if (error) {
      console.error("Failed to query draft guides:", error);
      return new Response(
        JSON.stringify({ error: "Failed to query draft guides" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    const registrationUrl = "https://explore-ignite-book.lovable.app/guide-register";

    for (const guide of draftGuides || []) {
      const formData = guide.form_data as Record<string, unknown>;
      const email = formData?.email as string | undefined;
      const firstName = formData?.firstName as string | undefined;

      if (!email) continue;

      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            type: "profile_reminder",
            data: {
              guide_name: firstName || "Guide",
              guide_email: email,
              registration_url: registrationUrl,
            },
          }),
        });

        if (response.ok) {
          sent++;
        } else {
          const errBody = await response.text();
          console.error(`Failed to send reminder to ${email}:`, errBody);
        }
      } catch (e) {
        console.error(`Error sending reminder to ${email}:`, e);
      }
    }

    console.log(`Sent ${sent} draft guide reminders`);

    return new Response(
      JSON.stringify({ sent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in draft-guide-reminder:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
