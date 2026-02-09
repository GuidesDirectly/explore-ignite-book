import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NOTIFY_EMAIL = "michael@iguidetours.net";

interface NotificationRequest {
  type: "inquiry" | "review" | "tour_plan" | "guide_status" | "guide_application";
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
    let toEmails: string[] = [NOTIFY_EMAIL];

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
    } else if (type === "tour_plan") {
      // Send to customer
      const customerEmail = data.customerEmail as string;
      const customerName = data.customerName as string;
      const plan = data.plan as string;

      subject = `🗺️ Your Personalized Tour Plan from iGuide Tours`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1a1f2e;padding:30px;text-align:center;">
            <h1 style="color:#d4a843;margin:0;">iGuide Tours</h1>
          </div>
          <div style="padding:30px;background:#f9f9f9;">
            <h2 style="color:#1a1f2e;">Hi ${customerName}! 👋</h2>
            <p>Thank you for using our AI Tour Planner! Here's your personalized tour plan:</p>
            <div style="background:white;padding:20px;border-radius:8px;border:1px solid #e0e0e0;margin:20px 0;white-space:pre-wrap;font-size:14px;line-height:1.6;">
              ${plan?.replace(/\n/g, "<br>")}
            </div>
            <p>Ready to make this dream trip a reality? Reply to this email or visit our website to get matched with the perfect guide.</p>
            <a href="https://explore-ignite-book.lovable.app" style="display:inline-block;background:#d4a843;color:#1a1f2e;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;margin-top:10px;">Visit iGuide Tours</a>
          </div>
          <div style="padding:20px;text-align:center;color:#888;font-size:12px;">
            <p>iGuide Tours — Premium Private Tours Across North America</p>
          </div>
        </div>
      `;
      toEmails = [customerEmail];

      // Also notify admin
      try {
        await resend.emails.send({
          from: "iGuide Tours <onboarding@resend.dev>",
          to: [NOTIFY_EMAIL],
          subject: `🗺️ Tour Plan Completed for ${customerName}`,
          html: `<h2>Customer Tour Plan Completed</h2><p><strong>${customerName}</strong> (${customerEmail}) has completed their AI tour plan and is satisfied with the result.</p><p style="color:#888;font-size:12px;">Sent from iGuide Tours website</p>`,
        });
      } catch (e) {
        console.error("Failed to notify admin:", e);
      }
    } else if (type === "guide_status") {
      const guideName = data.guideName as string;
      let guideEmail = data.guideEmail as string | undefined;
      const guideUserId = data.guideUserId as string | undefined;
      const status = data.status as string;
      const isApproved = status === "approved";

      // Look up email from auth.users if not provided
      if (!guideEmail && guideUserId) {
        try {
          const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
          );
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(guideUserId);
          guideEmail = userData?.user?.email;
        } catch (e) {
          console.error("Failed to look up guide email:", e);
        }
      }

      if (!guideEmail) {
        throw new Error("Could not determine guide email");
      }

      subject = isApproved
        ? `🎉 Congratulations! Your iGuide Tours Application Has Been Approved`
        : `📋 Update on Your iGuide Tours Application`;

      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1a1f2e;padding:30px;text-align:center;">
            <h1 style="color:#d4a843;margin:0;">iGuide Tours</h1>
          </div>
          <div style="padding:30px;background:#f9f9f9;">
            <h2 style="color:#1a1f2e;">Hi ${guideName}! 👋</h2>
            ${isApproved ? `
              <p>Great news! Your application to become an iGuide Tours guide has been <strong style="color:#22c55e;">approved</strong>! 🎉</p>
              <p>Your profile is now live on our website and travelers can find and connect with you directly.</p>
              <p>Here are some tips to get started:</p>
              <ul>
                <li>Make sure your profile photo and biography are up to date</li>
                <li>Keep your availability current</li>
                <li>Respond to traveler inquiries promptly</li>
              </ul>
              <a href="https://explore-ignite-book.lovable.app" style="display:inline-block;background:#d4a843;color:#1a1f2e;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;margin-top:10px;">Visit iGuide Tours</a>
            ` : `
              <p>Thank you for your interest in joining iGuide Tours as a guide.</p>
              <p>After careful review, we are unable to approve your application at this time.</p>
              <p>This could be due to a variety of reasons. We encourage you to update your profile and re-apply in the future.</p>
              <p>If you have any questions, feel free to reach out to us at <a href="mailto:michael@iguidetours.net">michael@iguidetours.net</a>.</p>
            `}
          </div>
          <div style="padding:20px;text-align:center;color:#888;font-size:12px;">
            <p>iGuide Tours — Premium Private Tours Across North America</p>
          </div>
        </div>
      `;
      toEmails = [guideEmail];

      // Notify admin too
      try {
        await resend.emails.send({
          from: "iGuide Tours <onboarding@resend.dev>",
          to: [NOTIFY_EMAIL],
          subject: `Guide ${isApproved ? "Approved" : "Rejected"}: ${guideName}`,
          html: `<p>Guide <strong>${guideName}</strong> (${guideEmail}) has been <strong>${status}</strong>.</p>`,
        });
      } catch (e) {
        console.error("Failed to notify admin:", e);
      }
    } else if (type === "guide_application") {
      const guideName = data.guideName as string;
      const guideEmail = data.guideEmail as string;

      if (!guideEmail) throw new Error("Guide email is required");

      subject = `✅ Application Received — iGuide Tours`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1a1f2e;padding:30px;text-align:center;">
            <h1 style="color:#d4a843;margin:0;">iGuide Tours</h1>
          </div>
          <div style="padding:30px;background:#f9f9f9;">
            <h2 style="color:#1a1f2e;">Hi ${guideName}! 👋</h2>
            <p>Thank you for submitting your guide application to <strong>iGuide Tours</strong>!</p>
            <p>We've received your application and our team will review it shortly. You'll receive another email once your application has been reviewed.</p>
            <p>In the meantime, if you have any questions, feel free to reach out to us at <a href="mailto:michael@iguidetours.net">michael@iguidetours.net</a>.</p>
            <a href="https://explore-ignite-book.lovable.app" style="display:inline-block;background:#d4a843;color:#1a1f2e;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;margin-top:10px;">Visit iGuide Tours</a>
          </div>
          <div style="padding:20px;text-align:center;color:#888;font-size:12px;">
            <p>iGuide Tours — Premium Private Tours Across North America</p>
          </div>
        </div>
      `;
      toEmails = [guideEmail];

      // Notify admin about new application
      try {
        await resend.emails.send({
          from: "iGuide Tours <onboarding@resend.dev>",
          to: [NOTIFY_EMAIL],
          subject: `📋 New Guide Application: ${guideName}`,
          html: `<p>A new guide application has been submitted by <strong>${guideName}</strong> (${guideEmail}). Please review it in the admin dashboard.</p>`,
        });
      } catch (e) {
        console.error("Failed to notify admin:", e);
      }
    } else {
      throw new Error("Invalid notification type");
    }

    const emailResponse = await resend.emails.send({
      from: "iGuide Tours <onboarding@resend.dev>",
      to: toEmails,
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
