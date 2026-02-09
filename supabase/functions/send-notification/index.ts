import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NOTIFY_EMAIL = "michael@iguidetours.net";

interface NotificationRequest {
  type: "inquiry" | "review";
  data: Record<string, unknown>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: NotificationRequest = await req.json();

    let subject: string;
    let html: string;

    if (type === "inquiry") {
      subject = `🔔 New Tour Inquiry from ${data.name}`;
      html = `
        <h2>New Tour Inquiry</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr><td style="padding:8px;font-weight:bold;">Name</td><td style="padding:8px;">${data.name}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
          ${data.phone ? `<tr><td style="padding:8px;font-weight:bold;">Phone</td><td style="padding:8px;">${data.phone}</td></tr>` : ""}
          <tr><td style="padding:8px;font-weight:bold;">Destination</td><td style="padding:8px;">${data.destination}</td></tr>
          ${data.group_size ? `<tr><td style="padding:8px;font-weight:bold;">Group Size</td><td style="padding:8px;">${data.group_size}</td></tr>` : ""}
          ${data.message ? `<tr><td style="padding:8px;font-weight:bold;">Message</td><td style="padding:8px;">${data.message}</td></tr>` : ""}
        </table>
        <p style="margin-top:16px;color:#888;font-size:12px;">Sent from iGuide Tours website</p>
      `;
    } else if (type === "review") {
      const stars = "★".repeat(data.rating as number) + "☆".repeat(5 - (data.rating as number));
      subject = `⭐ New ${data.rating}-Star Review from ${data.reviewer_name}`;
      html = `
        <h2>New Review Submitted</h2>
        <p style="font-size:24px;color:#d4a843;">${stars}</p>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr><td style="padding:8px;font-weight:bold;">Reviewer</td><td style="padding:8px;">${data.reviewer_name}</td></tr>
          ${data.reviewer_email ? `<tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;">${data.reviewer_email}</td></tr>` : ""}
          <tr><td style="padding:8px;font-weight:bold;">Rating</td><td style="padding:8px;">${data.rating}/5</td></tr>
          ${data.comment ? `<tr><td style="padding:8px;font-weight:bold;">Comment</td><td style="padding:8px;">${data.comment}</td></tr>` : ""}
        </table>
        <p style="margin-top:16px;color:#888;font-size:12px;">Sent from iGuide Tours website</p>
      `;
    } else {
      throw new Error("Invalid notification type");
    }

    const emailResponse = await resend.emails.send({
      from: "iGuide Tours <onboarding@resend.dev>",
      to: [NOTIFY_EMAIL],
      subject,
      html,
    });

    console.log("Notification email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
