import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// HTML escape function to prevent XSS in email templates
function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

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

const VALID_TYPES = new Set(["inquiry", "review", "tour_plan", "guide_status", "guide_application"]);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // --- Authentication: require a valid Supabase JWT ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, data }: NotificationRequest = body;

    // Validate notification type
    if (!type || !VALID_TYPES.has(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid notification type." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return new Response(
        JSON.stringify({ error: "data must be an object." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject: string;
    let html: string;
    let toEmails: string[] = [NOTIFY_EMAIL];

    if (type === "inquiry") {
      subject = `🔔 New Tour Inquiry from ${escapeHtml(data.name)}`;
      html = `
        <h2>New Tour Inquiry</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr><td style="padding:8px;font-weight:bold;">Name</td><td style="padding:8px;">${escapeHtml(data.name)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
          ${data.phone ? `<tr><td style="padding:8px;font-weight:bold;">Phone</td><td style="padding:8px;">${escapeHtml(data.phone)}</td></tr>` : ""}
          <tr><td style="padding:8px;font-weight:bold;">Destination</td><td style="padding:8px;">${escapeHtml(data.destination)}</td></tr>
          ${data.group_size ? `<tr><td style="padding:8px;font-weight:bold;">Group Size</td><td style="padding:8px;">${escapeHtml(data.group_size)}</td></tr>` : ""}
          ${data.message ? `<tr><td style="padding:8px;font-weight:bold;">Message</td><td style="padding:8px;">${escapeHtml(data.message)}</td></tr>` : ""}
        </table>
        <p style="margin-top:16px;color:#888;font-size:12px;">Sent from iGuide Tours website</p>
      `;
    } else if (type === "review") {
      const stars = "★".repeat(data.rating as number) + "☆".repeat(5 - (data.rating as number));
      subject = `⭐ New ${escapeHtml(data.rating)}-Star Review from ${escapeHtml(data.reviewer_name)}`;
      html = `
        <h2>New Review Submitted</h2>
        <p style="font-size:24px;color:#d4a843;">${stars}</p>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr><td style="padding:8px;font-weight:bold;">Reviewer</td><td style="padding:8px;">${escapeHtml(data.reviewer_name)}</td></tr>
          ${data.reviewer_email ? `<tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;">${escapeHtml(data.reviewer_email)}</td></tr>` : ""}
          <tr><td style="padding:8px;font-weight:bold;">Rating</td><td style="padding:8px;">${escapeHtml(data.rating)}/5</td></tr>
          ${data.comment ? `<tr><td style="padding:8px;font-weight:bold;">Comment</td><td style="padding:8px;">${escapeHtml(data.comment)}</td></tr>` : ""}
        </table>
        <p style="margin-top:16px;color:#888;font-size:12px;">Sent from iGuide Tours website</p>
      `;
    } else if (type === "tour_plan") {
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
            <h2 style="color:#1a1f2e;">Hi ${escapeHtml(customerName)}! 👋</h2>
            <p>Thank you for using our AI Tour Planner! Here's your personalized tour plan:</p>
            <div style="background:white;padding:20px;border-radius:8px;border:1px solid #e0e0e0;margin:20px 0;white-space:pre-wrap;font-size:14px;line-height:1.6;">
              ${escapeHtml(plan).replace(/\n/g, "<br>")}
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

      try {
        await resend.emails.send({
          from: "iGuide Tours <noreply@iguidetours.net>",
          to: [NOTIFY_EMAIL],
          subject: `🗺️ Tour Plan Completed for ${escapeHtml(customerName)}`,
          html: `<h2>Customer Tour Plan Completed</h2><p><strong>${escapeHtml(customerName)}</strong> (${escapeHtml(customerEmail)}) has completed their AI tour plan and is satisfied with the result.</p><p style="color:#888;font-size:12px;">Sent from iGuide Tours website</p>`,
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
        ? `Welcome to iGuide Tours — You're Officially One of Us! 🌟`
        : `📋 Update on Your iGuide Tours Application`;

      html = `
        <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;border:1px solid #e8e0d0;">
          <div style="background:linear-gradient(135deg,#1a1f2e 0%,#2a2f3e 100%);padding:40px 30px;text-align:center;">
            <h1 style="color:#d4a843;margin:0;font-size:28px;letter-spacing:1px;">iGuide Tours</h1>
            <p style="color:#8a8fa0;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Premium Private Tours</p>
          </div>
          <div style="padding:40px 35px;background:#faf9f7;">
            ${isApproved ? `
              <h2 style="color:#1a1f2e;font-size:22px;margin:0 0 20px;">Dear ${escapeHtml(guideName)},</h2>
              <p style="color:#333;line-height:1.8;font-size:15px;">It is with great pleasure that we welcome you to the <strong>iGuide Tours</strong> family. After a thorough review, your application has been <strong style="color:#1a7a4c;">approved</strong>, and we couldn't be more excited to have you on board.</p>
              <div style="border-left:3px solid #d4a843;padding:15px 20px;margin:25px 0;background:#f5f0e8;">
                <p style="color:#555;line-height:1.7;font-size:14px;margin:0;font-style:italic;">"A great guide doesn't just show people places — they open doors to experiences that last a lifetime. You have the passion and expertise to do exactly that."</p>
              </div>
              <p style="color:#333;line-height:1.8;font-size:15px;">Your profile is now <strong>live</strong> on our platform, and travelers from around the world can discover and connect with you. This is the beginning of something truly special.</p>
              <h3 style="color:#1a1f2e;font-size:16px;margin:25px 0 12px;">Here's how to make the most of your journey with us:</h3>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 15px;border-bottom:1px solid #e8e0d0;"><strong style="color:#d4a843;">✦</strong> <span style="color:#333;font-size:14px;">Ensure your profile photo and biography truly reflect your unique expertise</span></td></tr>
                <tr><td style="padding:10px 15px;border-bottom:1px solid #e8e0d0;"><strong style="color:#d4a843;">✦</strong> <span style="color:#333;font-size:14px;">Keep your availability updated so travelers can book seamlessly</span></td></tr>
                <tr><td style="padding:10px 15px;border-bottom:1px solid #e8e0d0;"><strong style="color:#d4a843;">✦</strong> <span style="color:#333;font-size:14px;">Respond promptly to inquiries — first impressions matter</span></td></tr>
                <tr><td style="padding:10px 15px;"><strong style="color:#d4a843;">✦</strong> <span style="color:#333;font-size:14px;">Deliver exceptional experiences and watch your reviews grow</span></td></tr>
              </table>
              <div style="text-align:center;margin:30px 0 10px;">
                <a href="https://explore-ignite-book.lovable.app" style="display:inline-block;background:linear-gradient(135deg,#d4a843,#c49a3a);color:#1a1f2e;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;letter-spacing:0.5px;box-shadow:0 4px 12px rgba(212,168,67,0.3);">View Your Profile</a>
              </div>
              <p style="color:#555;line-height:1.7;font-size:14px;margin-top:25px;">We believe in you, and we're confident you'll create unforgettable moments for every traveler you meet. Welcome aboard — the world is waiting.</p>
              <p style="color:#333;font-size:15px;margin-top:20px;">With warm regards,<br/><strong style="color:#1a1f2e;">The iGuide Tours Team</strong></p>
            ` : `
              <h2 style="color:#1a1f2e;font-size:22px;margin:0 0 20px;">Dear ${escapeHtml(guideName)},</h2>
              <p style="color:#333;line-height:1.8;font-size:15px;">Thank you sincerely for your interest in joining iGuide Tours as a guide.</p>
              <p style="color:#333;line-height:1.8;font-size:15px;">After careful consideration, we are unable to approve your application at this time. This decision does not diminish the value of your experience or expertise.</p>
              <p style="color:#333;line-height:1.8;font-size:15px;">We warmly encourage you to refine your profile and reapply in the future. If you have any questions or would like feedback, please don't hesitate to reach out to us at <a href="mailto:michael@iguidetours.net" style="color:#d4a843;">michael@iguidetours.net</a>.</p>
              <p style="color:#333;font-size:15px;margin-top:20px;">With kind regards,<br/><strong style="color:#1a1f2e;">The iGuide Tours Team</strong></p>
            `}
          </div>
          <div style="padding:20px;text-align:center;background:#1a1f2e;">
            <p style="color:#8a8fa0;font-size:11px;margin:0;letter-spacing:1px;">iGuide Tours — Premium Private Tours Across North America</p>
          </div>
        </div>
      `;
      toEmails = [guideEmail];

      try {
        await resend.emails.send({
          from: "iGuide Tours <noreply@iguidetours.net>",
          to: [NOTIFY_EMAIL],
          subject: `Guide ${isApproved ? "Approved" : "Rejected"}: ${escapeHtml(guideName)}`,
          html: `<p>Guide <strong>${escapeHtml(guideName)}</strong> (${escapeHtml(guideEmail)}) has been <strong>${escapeHtml(status)}</strong>.</p>`,
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
            <h2 style="color:#1a1f2e;">Hi ${escapeHtml(guideName)}! 👋</h2>
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

      try {
        await resend.emails.send({
          from: "iGuide Tours <noreply@iguidetours.net>",
          to: [NOTIFY_EMAIL],
          subject: `📋 New Guide Application: ${escapeHtml(guideName)}`,
          html: `<p>A new guide application has been submitted by <strong>${escapeHtml(guideName)}</strong> (${escapeHtml(guideEmail)}). Please review it in the admin dashboard.</p>`,
        });
      } catch (e) {
        console.error("Failed to notify admin:", e);
      }
    } else {
      throw new Error("Invalid notification type");
    }

    const emailResponse = await resend.emails.send({
      from: "iGuide Tours <noreply@iguidetours.net>",
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
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
