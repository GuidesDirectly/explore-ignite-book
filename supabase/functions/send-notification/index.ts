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
  type: "inquiry" | "review" | "tour_plan" | "guide_status" | "guide_application" | "booking_status" | "booking_request" | "review_request" | "profile_reminder" | "guide_activated" | "activation_reminder" | "subscription_expiring_soon" | "subscription_expired" | "founding_guide_welcome" | "founding_30day_warning" | "founding_7day_warning" | "founding_expired" | "founding_spots_filled" | "new_message";
  data: Record<string, unknown>;
}

const VALID_TYPES = new Set(["inquiry", "review", "tour_plan", "guide_status", "guide_application", "booking_status", "booking_request", "review_request", "profile_reminder", "guide_activated", "activation_reminder", "subscription_expiring_soon", "subscription_expired", "founding_guide_welcome", "founding_30day_warning", "founding_7day_warning", "founding_expired", "founding_spots_filled", "new_message"]);

// Notification types that can be sent without authentication (public forms + DB-triggered events)
const PUBLIC_TYPES = new Set(["inquiry", "review", "tour_plan", "booking_request", "review_request", "profile_reminder", "guide_activated", "activation_reminder", "subscription_expiring_soon", "subscription_expired", "founding_guide_welcome", "founding_30day_warning", "founding_7day_warning", "founding_expired", "founding_spots_filled", "new_message"]);
// Notification types that require authentication
const AUTH_TYPES = new Set(["guide_status", "guide_application", "booking_status"]);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // --- Authentication: required only for non-public types ---
    let userId: string | null = null;

    if (AUTH_TYPES.has(type)) {
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

      userId = (claimsData.claims as Record<string, unknown>).sub as string;

      // Authorization: guide_status requires admin role
      if (type === "guide_status") {
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        const { data: roleData } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();

        if (!roleData) {
          return new Response(
            JSON.stringify({ error: "Forbidden: admin access required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Authorization: guide_application and booking_status must match authenticated user
      if (type === "guide_application" || type === "booking_status") {
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        if (type === "guide_application") {
          const { data: profile } = await supabaseAdmin
            .from("guide_profiles")
            .select("user_id")
            .eq("user_id", userId)
            .maybeSingle();

          if (!profile) {
            return new Response(
              JSON.stringify({ error: "Forbidden: no guide profile found" }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        if (type === "booking_status") {
          const bookingId = data.bookingId as string;
          if (!bookingId) {
            return new Response(
              JSON.stringify({ error: "bookingId is required" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          const { data: booking } = await supabaseAdmin
            .from("bookings")
            .select("guide_user_id")
            .eq("id", bookingId)
            .maybeSingle();

          if (!booking || booking.guide_user_id !== userId) {
            return new Response(
              JSON.stringify({ error: "Forbidden: not your booking" }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }
    }

    let subject: string;
    let html: string;
    let toEmails: string[] = [NOTIFY_EMAIL];

    if (type === "inquiry") {
      const destination = String(data.destination || "");
      const isUnserved = destination.startsWith("other:");
      const unservedCity = isUnserved ? destination.replace("other:", "").trim() : null;

      subject = isUnserved
        ? `🌍 EXPANSION OPPORTUNITY — Inquiry for ${escapeHtml(unservedCity)} from ${escapeHtml(data.name)}`
        : `🔔 New Tour Inquiry from ${escapeHtml(data.name)}`;
      html = `
        ${isUnserved ? `<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin-bottom:20px;">
          <h3 style="margin:0 0 8px;color:#856404;">🌍 New Market Request: ${escapeHtml(unservedCity)}</h3>
          <p style="margin:0;color:#856404;font-size:14px;">A traveler is looking for a guide in <strong>${escapeHtml(unservedCity)}</strong> — a destination we don't currently serve. Consider recruiting guides in this area.</p>
        </div>` : ""}
        <h2>New Tour Inquiry</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr><td style="padding:8px;font-weight:bold;">Name</td><td style="padding:8px;">${escapeHtml(data.name)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
          ${data.phone ? `<tr><td style="padding:8px;font-weight:bold;">Phone</td><td style="padding:8px;">${escapeHtml(data.phone)}</td></tr>` : ""}
          <tr><td style="padding:8px;font-weight:bold;">Destination</td><td style="padding:8px;"><strong${isUnserved ? ' style="color:#d63384;"' : ""}>${escapeHtml(data.destination)}</strong></td></tr>
          ${data.group_size ? `<tr><td style="padding:8px;font-weight:bold;">Group Size</td><td style="padding:8px;">${escapeHtml(data.group_size)}</td></tr>` : ""}
          ${data.message ? `<tr><td style="padding:8px;font-weight:bold;">Message</td><td style="padding:8px;">${escapeHtml(data.message)}</td></tr>` : ""}
        </table>
        <p style="margin-top:16px;color:#888;font-size:12px;">Sent from iGuide Tours website</p>
      `;

      // Send traveler confirmation email if email is provided
      if (data.email) {
        try {
          await resend.emails.send({
            from: "Guides Directly <noreply@iguidetours.net>",
            to: [String(data.email)],
            subject: `We received your message, ${escapeHtml(data.name)} — a guide will be in touch soon`,
            html: `
              <div style="font-family:'Georgia','Times New Roman',serif;max-width:600px;margin:0 auto;">
                <div style="background:#0A1628;padding:32px 40px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:1px;">GuidesDirectly</h1>
                  <p style="color:rgba(255,255,255,0.5);margin:6px 0 0;font-size:12px;">by iGuide Tours</p>
                </div>
                <div style="padding:40px;background:#ffffff;">
                  <h2 style="color:#0A1628;font-size:22px;margin:0 0 20px;">Hi ${escapeHtml(data.name)},</h2>
                  <p style="color:#333333;line-height:1.7;font-size:16px;">Thank you for reaching out to <strong>Guides Directly</strong>.</p>
                  <p style="color:#333333;line-height:1.7;font-size:16px;">We have received your inquiry about <strong>${escapeHtml(data.destination)}</strong> and will connect you with a verified local guide within 24 hours.</p>

                  <div style="border-top:1px solid #F0E6C8;margin:28px 0;"></div>

                  <h3 style="color:#0A1628;font-size:17px;margin:0 0 16px;">Here is what you told us:</h3>
                  <p style="color:#333333;line-height:1.7;font-size:16px;margin:0 0 8px;">• <strong>Destination:</strong> ${escapeHtml(data.destination)}</p>
                  ${data.group_size ? `<p style="color:#333333;line-height:1.7;font-size:16px;margin:0 0 8px;">• <strong>Group size:</strong> ${escapeHtml(data.group_size)}</p>` : ""}
                  ${data.message ? `<p style="color:#333333;line-height:1.7;font-size:16px;margin:0 0 8px;">• <strong>Your message:</strong> ${escapeHtml(data.message)}</p>` : ""}

                  <p style="color:#333333;line-height:1.7;font-size:16px;margin-top:20px;">While you wait, you can browse our verified guides directly:</p>

                  <div style="text-align:center;margin:30px 0 10px;">
                    <a href="https://iguidetours.net/guides" style="display:inline-block;background:#C9A84C;color:#0A1628;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Browse Guides Now →</a>
                  </div>

                  <div style="border-top:1px solid #F0E6C8;margin:28px 0;"></div>

                  <h3 style="color:#0A1628;font-size:17px;margin:0 0 12px;">A quick note on how we work:</h3>
                  <p style="color:#333333;line-height:1.7;font-size:16px;">Unlike other platforms, Guides Directly takes zero commission from your guide. The price you agree with your guide is exactly what they receive. No markups. No platform fees. Just a direct human connection.</p>

                  <p style="color:#333333;line-height:1.7;font-size:16px;">If you have urgent questions, call us: <strong>+1 (202) 243-8336</strong></p>

                  <p style="color:#333333;line-height:1.7;font-size:16px;">We look forward to helping you experience <strong>${escapeHtml(data.destination)}</strong> through local eyes.</p>

                  <p style="color:#333333;font-size:15px;margin-top:28px;">— The Guides Directly Team</p>
                </div>
                <div style="padding:20px;text-align:center;background:#F5F5F5;">
                  <p style="color:#999999;font-size:12px;margin:0;line-height:1.6;">© 2025–2026 Guides Directly, powered by iGuide Tours<br/>Bethesda, MD · Washington DC Area<br/>+1 (202) 243-8336</p>
                </div>
              </div>
            `,
          });
        } catch (e) {
          console.error("Failed to send traveler confirmation:", e);
        }
      }
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
        ? `You're approved — your Guides Directly profile is now live`
        : `📋 Update on Your iGuide Tours Application`;

      html = isApproved ? `
        <div style="font-family:'Georgia','Times New Roman',serif;max-width:600px;margin:0 auto;">
          <div style="background:#0A1628;padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:1px;">GuidesDirectly</h1>
            <p style="color:rgba(255,255,255,0.5);margin:6px 0 0;font-size:12px;">by iGuide Tours</p>
          </div>
          <div style="padding:40px;background:#ffffff;">
            <h2 style="color:#0A1628;font-size:22px;margin:0 0 20px;">${escapeHtml(guideName)}, congratulations.</h2>
            <p style="color:#333333;line-height:1.7;font-size:16px;">Your profile is live on <strong>Guides Directly</strong>. Travelers searching for guides in your city can now find you, read your bio, and message you directly.</p>

            <div style="border-top:1px solid #F0E6C8;margin:28px 0;"></div>

            <h3 style="color:#0A1628;font-size:17px;margin:0 0 20px;">Here is how to make the most of your first week:</h3>

            <p style="color:#333333;line-height:1.7;font-size:16px;margin:0 0 16px;"><strong style="color:#0A1628;">1. Add your introduction video</strong><br/>Upload a short 60–90 second video to your profile. Guides with videos receive significantly more inquiries than those without.</p>

            <p style="color:#333333;line-height:1.7;font-size:16px;margin:0 0 16px;"><strong style="color:#0A1628;">2. Share your profile link</strong><br/>Post it to your Instagram, WhatsApp groups, and Facebook. Your past clients can now refer you directly through your profile page.</p>

            <p style="color:#333333;line-height:1.7;font-size:16px;margin:0 0 16px;"><strong style="color:#0A1628;">3. Keep your languages updated</strong><br/>Travelers filter by language. Make sure yours are all listed correctly.</p>

            <p style="color:#333333;line-height:1.7;font-size:16px;margin:0 0 16px;"><strong style="color:#0A1628;">4. Respond to messages quickly</strong><br/>Travelers often contact 2–3 guides at once. The guide who responds first and most personally usually wins the booking.</p>

            <div style="border-top:1px solid #F0E6C8;margin:28px 0;"></div>

            <p style="color:#333333;line-height:1.7;font-size:16px;">Remember: every dollar a traveler pays goes directly to you. We take nothing. That is the Guides Directly promise.</p>

            <div style="text-align:center;margin:30px 0 10px;">
              <a href="https://iguidetours.net/guide/${escapeHtml(guideUserId || "")}" style="display:inline-block;background:#C9A84C;color:#0A1628;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">View Your Live Profile →</a>
            </div>

            <p style="color:#333333;line-height:1.7;font-size:16px;">Questions? Reply to this email anytime.</p>
            <p style="color:#333333;font-size:15px;margin-top:28px;">— Michael Zlotnitsky<br/><span style="color:#666;">Founder, Guides Directly</span></p>
          </div>
          <div style="padding:20px;text-align:center;background:#F5F5F5;">
            <p style="color:#999999;font-size:12px;margin:0;line-height:1.6;">© 2025–2026 Guides Directly, powered by iGuide Tours<br/>Bethesda, MD · Washington DC Area<br/>+1 (202) 243-8336</p>
          </div>
        </div>
      ` : `
        <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;border:1px solid #e8e0d0;">
          <div style="background:linear-gradient(135deg,#1a1f2e 0%,#2a2f3e 100%);padding:40px 30px;text-align:center;">
            <h1 style="color:#d4a843;margin:0;font-size:28px;letter-spacing:1px;">iGuide Tours</h1>
            <p style="color:#8a8fa0;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Premium Private Tours</p>
          </div>
          <div style="padding:40px 35px;background:#faf9f7;">
            <h2 style="color:#1a1f2e;font-size:22px;margin:0 0 20px;">Dear ${escapeHtml(guideName)},</h2>
            <p style="color:#333;line-height:1.8;font-size:15px;">Thank you sincerely for your interest in joining iGuide Tours as a guide.</p>
            <p style="color:#333;line-height:1.8;font-size:15px;">After careful consideration, we are unable to approve your application at this time. This decision does not diminish the value of your experience or expertise.</p>
            <p style="color:#333;line-height:1.8;font-size:15px;">We warmly encourage you to refine your profile and reapply in the future. If you have any questions or would like feedback, please don't hesitate to reach out to us at <a href="mailto:michael@iguidetours.net" style="color:#d4a843;">michael@iguidetours.net</a>.</p>
            <p style="color:#333;font-size:15px;margin-top:20px;">With kind regards,<br/><strong style="color:#1a1f2e;">The iGuide Tours Team</strong></p>
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

      subject = `You're in — welcome to Guides Directly, ${escapeHtml(guideName)}`;
      html = `
        <div style="font-family:'Georgia','Times New Roman',serif;max-width:600px;margin:0 auto;">
          <div style="background:#0A1628;padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:1px;">GuidesDirectly</h1>
            <p style="color:rgba(255,255,255,0.5);margin:6px 0 0;font-size:12px;">by iGuide Tours</p>
          </div>
          <div style="padding:40px;background:#ffffff;">
            <h2 style="color:#0A1628;font-size:22px;margin:0 0 20px;">Hi ${escapeHtml(guideName)},</h2>
            <p style="color:#333333;line-height:1.7;font-size:16px;">Your application to join <strong>Guides Directly</strong> has been received. We are genuinely excited to have you here.</p>

            <div style="border-top:1px solid #F0E6C8;margin:28px 0;"></div>

            <h3 style="color:#0A1628;font-size:17px;margin:0 0 12px;">Here is what happens next:</h3>
            <p style="color:#333333;line-height:1.7;font-size:16px;">Our team will review your profile within 2–3 business days. We look at the quality of your bio, your specializations, and your service areas to ensure every guide on the platform meets our standard.</p>

            <div style="border-top:1px solid #F0E6C8;margin:28px 0;"></div>

            <h3 style="color:#0A1628;font-size:17px;margin:0 0 16px;">While you wait, here are three things you can do to strengthen your application:</h3>
            <p style="color:#333333;line-height:1.7;font-size:16px;margin:0 0 14px;"><strong style="color:#C9A84C;">✦</strong> Make sure your biography tells your story — not just your credentials. Travelers choose guides they connect with.</p>
            <p style="color:#333333;line-height:1.7;font-size:16px;margin:0 0 14px;"><strong style="color:#C9A84C;">✦</strong> Be specific about your specializations. "Architecture &amp; History" is more compelling than "City Tours."</p>
            <p style="color:#333333;line-height:1.7;font-size:16px;margin:0 0 14px;"><strong style="color:#C9A84C;">✦</strong> Think about what makes you different. What will travelers remember about a day spent with you?</p>

            <div style="border-top:1px solid #F0E6C8;margin:28px 0;"></div>

            <p style="color:#333333;line-height:1.7;font-size:16px;">Once approved, your profile goes live and travelers searching in your city can message you directly. No commission taken. Ever.</p>

            <p style="color:#333333;line-height:1.7;font-size:16px;">Questions? Reply to this email or call <strong>+1 (202) 243-8336</strong>.</p>

            <div style="text-align:center;margin:30px 0 10px;">
              <a href="https://iguidetours.net/about" style="display:inline-block;background:#C9A84C;color:#0A1628;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Learn What Happens After Approval →</a>
            </div>

            <p style="color:#333333;font-size:15px;margin-top:28px;">— Michael Zlotnitsky<br/><span style="color:#666;">Founder, Guides Directly</span></p>
          </div>
          <div style="padding:20px;text-align:center;background:#F5F5F5;">
            <p style="color:#999999;font-size:12px;margin:0;line-height:1.6;">© 2025–2026 Guides Directly, powered by iGuide Tours<br/>Bethesda, MD · Washington DC Area<br/>+1 (202) 243-8336</p>
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
    } else if (type === "booking_status") {
      const travelerName = data.travelerName as string;
      const travelerEmail = data.travelerEmail as string;
      const guideName = data.guideName as string;
      const status = data.status as string;
      const tourType = data.tourType as string;
      const date = data.date as string;
      const time = data.time as string;
      const location = data.location as string | undefined;

      if (!travelerEmail) throw new Error("Traveler email is required");

      const isConfirmed = status === "confirmed";
      const statusLabel = isConfirmed ? "Confirmed ✅" : status === "declined" ? "Declined" : status.charAt(0).toUpperCase() + status.slice(1);
      const statusColor = isConfirmed ? "#1a7a4c" : status === "declined" ? "#c0392b" : "#d4a843";

      subject = isConfirmed
        ? `✅ Your booking with ${escapeHtml(guideName)} is confirmed!`
        : status === "declined"
        ? `Booking update from ${escapeHtml(guideName)}`
        : `Booking status update — ${escapeHtml(statusLabel)}`;

      html = `
        <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;border:1px solid #e8e0d0;">
          <div style="background:linear-gradient(135deg,#1a1f2e 0%,#2a2f3e 100%);padding:40px 30px;text-align:center;">
            <h1 style="color:#d4a843;margin:0;font-size:28px;letter-spacing:1px;">iGuide Tours</h1>
            <p style="color:#8a8fa0;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Booking Update</p>
          </div>
          <div style="padding:40px 35px;background:#faf9f7;">
            <h2 style="color:#1a1f2e;font-size:22px;margin:0 0 20px;">Hi ${escapeHtml(travelerName)},</h2>
            <p style="color:#333;line-height:1.8;font-size:15px;">Your booking with <strong>${escapeHtml(guideName)}</strong> has been <strong style="color:${statusColor};">${escapeHtml(statusLabel.toLowerCase())}</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;background:white;border-radius:8px;border:1px solid #e8e0d0;">
              <tr><td style="padding:12px 15px;font-weight:bold;border-bottom:1px solid #e8e0d0;color:#555;">Tour</td><td style="padding:12px 15px;border-bottom:1px solid #e8e0d0;">${escapeHtml(tourType)}</td></tr>
              <tr><td style="padding:12px 15px;font-weight:bold;border-bottom:1px solid #e8e0d0;color:#555;">Date</td><td style="padding:12px 15px;border-bottom:1px solid #e8e0d0;">${escapeHtml(date)}</td></tr>
              <tr><td style="padding:12px 15px;font-weight:bold;border-bottom:1px solid #e8e0d0;color:#555;">Time</td><td style="padding:12px 15px;border-bottom:1px solid #e8e0d0;">${escapeHtml(time)}</td></tr>
              ${location ? `<tr><td style="padding:12px 15px;font-weight:bold;color:#555;">Location</td><td style="padding:12px 15px;">${escapeHtml(location)}</td></tr>` : ""}
            </table>
            ${isConfirmed ? `<p style="color:#333;line-height:1.8;font-size:15px;">Your guide is looking forward to showing you an amazing experience. If you have any questions, feel free to reply to this email.</p>` : status === "declined" ? `<p style="color:#333;line-height:1.8;font-size:15px;">Unfortunately, your guide was unable to accommodate this booking. We encourage you to explore other available guides or adjust your dates.</p>` : ""}
            <div style="text-align:center;margin:25px 0;">
              <a href="https://explore-ignite-book.lovable.app" style="display:inline-block;background:linear-gradient(135deg,#d4a843,#c49a3a);color:#1a1f2e;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;">Browse Guides</a>
            </div>
          </div>
          <div style="padding:20px;text-align:center;background:#1a1f2e;">
            <p style="color:#8a8fa0;font-size:11px;margin:0;letter-spacing:1px;">iGuide Tours — Premium Private Tours Across North America</p>
          </div>
        </div>
      `;
      toEmails = [travelerEmail];

      // Also notify admin
      try {
        await resend.emails.send({
          from: "iGuide Tours <noreply@iguidetours.net>",
          to: [NOTIFY_EMAIL],
          subject: `Booking ${escapeHtml(statusLabel)}: ${escapeHtml(travelerName)} with ${escapeHtml(guideName)}`,
          html: `<p>Booking for <strong>${escapeHtml(travelerName)}</strong> with guide <strong>${escapeHtml(guideName)}</strong> has been <strong>${escapeHtml(status)}</strong>.</p><p>Tour: ${escapeHtml(tourType)} on ${escapeHtml(date)}</p>`,
        });
      } catch (e) {
        console.error("Failed to notify admin:", e);
      }
    } else if (type === "review_request") {
      const travelerName = data.travelerName as string;
      const travelerEmail = data.travelerEmail as string;
      const gName = data.guideName as string;
      const tourType = data.tourType as string;
      const date = data.date as string;
      const guideProfileId = data.guideProfileId as string;

      if (!travelerEmail) throw new Error("Traveler email is required for review request");

      const reviewUrl = `https://explore-ignite-book.lovable.app/review?guide=${encodeURIComponent(guideProfileId || "")}`;

      subject = `How was your tour with ${escapeHtml(gName)}? ⭐`;
      html = `
        <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;border:1px solid #e8e0d0;">
          <div style="background:linear-gradient(135deg,#1a1f2e 0%,#2a2f3e 100%);padding:40px 30px;text-align:center;">
            <h1 style="color:#d4a843;margin:0;font-size:28px;letter-spacing:1px;">iGuide Tours</h1>
            <p style="color:#8a8fa0;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Review Your Experience</p>
          </div>
          <div style="padding:40px 35px;background:#faf9f7;">
            <h2 style="color:#1a1f2e;font-size:22px;margin:0 0 20px;">Hi ${escapeHtml(travelerName)},</h2>
            <p style="color:#333;line-height:1.8;font-size:15px;">Thank you for choosing <strong>iGuide Tours</strong> for your recent experience! We hope you had an unforgettable time.</p>
            <p style="color:#333;line-height:1.8;font-size:15px;">Your tour — <strong>${escapeHtml(tourType)}</strong> on <strong>${escapeHtml(date)}</strong> with <strong>${escapeHtml(gName)}</strong> — has been marked as completed.</p>
            <div style="border-left:3px solid #d4a843;padding:15px 20px;margin:25px 0;background:#f5f0e8;">
              <p style="color:#555;line-height:1.7;font-size:14px;margin:0;font-style:italic;">Your feedback helps other travelers find great guides and helps our guides improve their craft. It only takes a minute!</p>
            </div>
            <div style="text-align:center;margin:30px 0;">
              <a href="${reviewUrl}" style="display:inline-block;background:linear-gradient(135deg,#d4a843,#c49a3a);color:#1a1f2e;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;letter-spacing:0.5px;box-shadow:0 4px 12px rgba(212,168,67,0.3);">Leave a Review ⭐</a>
            </div>
            <p style="color:#888;font-size:13px;margin-top:20px;">If you've already left a review, thank you! You can safely ignore this email.</p>
          </div>
          <div style="padding:20px;text-align:center;background:#1a1f2e;">
            <p style="color:#8a8fa0;font-size:11px;margin:0;letter-spacing:1px;">iGuide Tours — Premium Private Tours Across North America</p>
          </div>
        </div>
      `;
      toEmails = [travelerEmail];
    } else if (type === "booking_request") {
      const travelerName = data.travelerName as string;
      const travelerEmail = data.travelerEmail as string;
      const gName = data.guideName as string;
      const tourType = data.tourType as string;
      const date = data.date as string;
      const time = data.time as string;
      const location = data.location as string | undefined;
      const groupSize = data.groupSize as number | undefined;

      // --- Email to traveler (confirmation) ---
      subject = `📋 Booking Request Received — ${escapeHtml(tourType)} with ${escapeHtml(gName)}`;
      html = `
        <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;border:1px solid #e8e0d0;">
          <div style="background:linear-gradient(135deg,#1a1f2e 0%,#2a2f3e 100%);padding:40px 30px;text-align:center;">
            <h1 style="color:#d4a843;margin:0;font-size:28px;letter-spacing:1px;">iGuide Tours</h1>
            <p style="color:#8a8fa0;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Booking Confirmation</p>
          </div>
          <div style="padding:40px 35px;background:#faf9f7;">
            <h2 style="color:#1a1f2e;font-size:22px;margin:0 0 20px;">Hi ${escapeHtml(travelerName)},</h2>
            <p style="color:#333;line-height:1.8;font-size:15px;">Thank you for booking with <strong>iGuide Tours</strong>! Your request has been sent to <strong>${escapeHtml(gName)}</strong>, who will review and confirm shortly.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;background:white;border-radius:8px;border:1px solid #e8e0d0;">
              <tr><td style="padding:12px 15px;font-weight:bold;border-bottom:1px solid #e8e0d0;color:#555;">Tour</td><td style="padding:12px 15px;border-bottom:1px solid #e8e0d0;">${escapeHtml(tourType)}</td></tr>
              <tr><td style="padding:12px 15px;font-weight:bold;border-bottom:1px solid #e8e0d0;color:#555;">Date</td><td style="padding:12px 15px;border-bottom:1px solid #e8e0d0;">${escapeHtml(date)}</td></tr>
              <tr><td style="padding:12px 15px;font-weight:bold;border-bottom:1px solid #e8e0d0;color:#555;">Time</td><td style="padding:12px 15px;border-bottom:1px solid #e8e0d0;">${escapeHtml(time)}</td></tr>
              ${location ? `<tr><td style="padding:12px 15px;font-weight:bold;border-bottom:1px solid #e8e0d0;color:#555;">Location</td><td style="padding:12px 15px;border-bottom:1px solid #e8e0d0;">${escapeHtml(location)}</td></tr>` : ""}
              ${groupSize ? `<tr><td style="padding:12px 15px;font-weight:bold;color:#555;">Group Size</td><td style="padding:12px 15px;">${escapeHtml(String(groupSize))}</td></tr>` : ""}
            </table>
            <p style="color:#333;line-height:1.8;font-size:15px;">You'll receive another email once your guide confirms the booking. If you have questions, reply to this email or contact us at <a href="mailto:michael@iguidetours.net" style="color:#d4a843;">michael@iguidetours.net</a>.</p>
            <div style="text-align:center;margin:25px 0;">
              <a href="https://iguidetours.net" style="display:inline-block;background:linear-gradient(135deg,#d4a843,#c49a3a);color:#1a1f2e;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;">Visit iGuide Tours</a>
            </div>
          </div>
          <div style="padding:20px;text-align:center;background:#1a1f2e;">
            <p style="color:#8a8fa0;font-size:11px;margin:0;letter-spacing:1px;">iGuide Tours — Premium Private Tours Across North America</p>
          </div>
        </div>
      `;

      if (travelerEmail) {
        toEmails = [travelerEmail];
      } else {
        toEmails = [NOTIFY_EMAIL];
      }

      // --- Also notify admin + guide ---
      // Notify admin
      try {
        await resend.emails.send({
          from: "iGuide Tours <noreply@iguidetours.net>",
          to: [NOTIFY_EMAIL],
          subject: `🔔 New Booking Request: ${escapeHtml(travelerName)} — ${escapeHtml(tourType)}`,
          html: `
            <h2>New Booking Request</h2>
            <table style="border-collapse:collapse;width:100%;max-width:500px;">
              <tr><td style="padding:8px;font-weight:bold;">Traveler</td><td style="padding:8px;">${escapeHtml(travelerName)}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;"><a href="mailto:${escapeHtml(travelerEmail)}">${escapeHtml(travelerEmail)}</a></td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Guide</td><td style="padding:8px;">${escapeHtml(gName)}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Tour</td><td style="padding:8px;">${escapeHtml(tourType)}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Date</td><td style="padding:8px;">${escapeHtml(date)}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Time</td><td style="padding:8px;">${escapeHtml(time)}</td></tr>
              ${location ? `<tr><td style="padding:8px;font-weight:bold;">Location</td><td style="padding:8px;">${escapeHtml(location)}</td></tr>` : ""}
              ${groupSize ? `<tr><td style="padding:8px;font-weight:bold;">Group</td><td style="padding:8px;">${escapeHtml(String(groupSize))}</td></tr>` : ""}
            </table>
            <p style="margin-top:16px;color:#888;font-size:12px;">Sent from iGuide Tours website</p>
          `,
        });
      } catch (e) {
        console.error("Failed to notify admin:", e);
      }

      // Notify guide via email (look up guide email from guide_user_id if available)
      const guideUserId = data.guideUserId as string | undefined;
      if (guideUserId) {
        try {
          const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
          );
          const { data: guideUser } = await supabaseAdmin.auth.admin.getUserById(guideUserId);
          const guideEmail = guideUser?.user?.email;
          if (guideEmail) {
            await resend.emails.send({
              from: "iGuide Tours <noreply@iguidetours.net>",
              to: [guideEmail],
              subject: `📅 New Booking Request from ${escapeHtml(travelerName)}`,
              html: `
                <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;border:1px solid #e8e0d0;">
                  <div style="background:linear-gradient(135deg,#1a1f2e 0%,#2a2f3e 100%);padding:40px 30px;text-align:center;">
                    <h1 style="color:#d4a843;margin:0;font-size:28px;letter-spacing:1px;">iGuide Tours</h1>
                    <p style="color:#8a8fa0;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">New Booking</p>
                  </div>
                  <div style="padding:40px 35px;background:#faf9f7;">
                    <h2 style="color:#1a1f2e;font-size:22px;margin:0 0 20px;">Hi ${escapeHtml(gName)},</h2>
                    <p style="color:#333;line-height:1.8;font-size:15px;">Great news! You have a new booking request from <strong>${escapeHtml(travelerName)}</strong>.</p>
                    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:white;border-radius:8px;border:1px solid #e8e0d0;">
                      <tr><td style="padding:12px 15px;font-weight:bold;border-bottom:1px solid #e8e0d0;color:#555;">Tour</td><td style="padding:12px 15px;border-bottom:1px solid #e8e0d0;">${escapeHtml(tourType)}</td></tr>
                      <tr><td style="padding:12px 15px;font-weight:bold;border-bottom:1px solid #e8e0d0;color:#555;">Date</td><td style="padding:12px 15px;border-bottom:1px solid #e8e0d0;">${escapeHtml(date)}</td></tr>
                      <tr><td style="padding:12px 15px;font-weight:bold;border-bottom:1px solid #e8e0d0;color:#555;">Time</td><td style="padding:12px 15px;border-bottom:1px solid #e8e0d0;">${escapeHtml(time)}</td></tr>
                      ${location ? `<tr><td style="padding:12px 15px;font-weight:bold;border-bottom:1px solid #e8e0d0;color:#555;">Location</td><td style="padding:12px 15px;border-bottom:1px solid #e8e0d0;">${escapeHtml(location)}</td></tr>` : ""}
                      ${groupSize ? `<tr><td style="padding:12px 15px;font-weight:bold;color:#555;">Group Size</td><td style="padding:12px 15px;">${escapeHtml(String(groupSize))}</td></tr>` : ""}
                    </table>
                    <p style="color:#333;line-height:1.8;font-size:15px;">Please log in to your dashboard to review and confirm this booking.</p>
                    <div style="text-align:center;margin:25px 0;">
                      <a href="https://iguidetours.net/guide-dashboard" style="display:inline-block;background:linear-gradient(135deg,#d4a843,#c49a3a);color:#1a1f2e;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;">Go to Dashboard</a>
                    </div>
                  </div>
                  <div style="padding:20px;text-align:center;background:#1a1f2e;">
                    <p style="color:#8a8fa0;font-size:11px;margin:0;letter-spacing:1px;">iGuide Tours — Premium Private Tours Across North America</p>
                  </div>
                </div>
              `,
            });
          }
        } catch (e) {
          console.error("Failed to notify guide:", e);
        }
      }
    } else if (type === "profile_reminder") {
      const guideName = data.guide_name as string;
      const guideEmail = data.guide_email as string;
      const registrationUrl = data.registration_url as string;

      if (!guideEmail) throw new Error("guide_email is required");

      subject = "Complete your Guides Directly profile — your spot is waiting";
      html = `
        <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;border:1px solid #e8e0d0;">
          <div style="background:#0A1628;padding:40px 30px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:1px;">Guides Directly</h1>
            <p style="color:#8a8fa0;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">by iGuide Tours</p>
          </div>
          <div style="padding:40px 35px;background:#ffffff;">
            <h2 style="color:#0A1628;font-size:22px;margin:0 0 20px;">Hi ${escapeHtml(guideName)},</h2>
            <p style="color:#333;line-height:1.8;font-size:15px;">You started your guide registration on <strong>Guides Directly</strong> but haven't finished yet. Your profile is saved — it takes just a few minutes to complete.</p>
            <p style="color:#333;line-height:1.8;font-size:15px;">Once approved, travelers searching for guides in your city will be able to find you, message you directly, and book your tours — with zero commission taken from your earnings.</p>
            <div style="text-align:center;margin:30px 0;">
              <a href="${escapeHtml(registrationUrl)}" style="display:inline-block;background:#C9A84C;color:#0A1628;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;letter-spacing:0.5px;">Complete Your Profile →</a>
            </div>
            <p style="color:#555;line-height:1.7;font-size:14px;">Questions? Reply to this email or call: <strong>+1 (202) 243-8336</strong></p>
            <p style="color:#333;font-size:15px;margin-top:20px;">— The Guides Directly Team</p>
          </div>
          <div style="padding:20px;text-align:center;background:#0A1628;">
            <p style="color:#8a8fa0;font-size:11px;margin:0;letter-spacing:1px;">Guides Directly by iGuide Tours — Premium Private Tours</p>
          </div>
        </div>
      `;
      toEmails = [guideEmail];
    } else if (type === "guide_activated" || type === "activation_reminder" || type === "subscription_expiring_soon" || type === "subscription_expired") {
      const guideName = String(data.guideName || "there");
      const guideEmail = data.guideEmail as string | undefined;
      const tier = String(data.tier || "Founding");
      const dashboardUrl = "https://iguidetours.net/guide-dashboard";

      if (!guideEmail) throw new Error("guideEmail is required");

      const titles: Record<string, string> = {
        guide_activated: `You're live on Guides Directly — welcome, ${escapeHtml(guideName)}`,
        activation_reminder: `Activate your Guides Directly profile to be visible to travelers`,
        subscription_expiring_soon: `Your GuidesDirectly subscription expires in 7 days`,
        subscription_expired: `Your Guides Directly profile has been deactivated`,
      };

      const headlines: Record<string, string> = {
        guide_activated: `Your ${escapeHtml(tier)} plan is now active.`,
        activation_reminder: `Your profile is approved but not yet visible to travelers.`,
        subscription_expiring_soon: `Your subscription renews — or expires — soon.`,
        subscription_expired: `Your profile is no longer visible to travelers.`,
      };

      const bodies: Record<string, string> = {
        guide_activated: `Travelers searching in your city can now find you, message you directly, and book your tours. No commission. Ever.`,
        activation_reminder: `Choose a plan to make your profile live. Founding guides stay free forever — no card required.`,
        subscription_expiring_soon: `Your profile will be hidden from travelers in 7 days. Renew now to stay visible without interruption.`,
        subscription_expired: `Your subscription has ended and your profile is hidden from search. Reactivate anytime to restore visibility — your data is safe.`,
      };

      const ctaLabel: Record<string, string> = {
        guide_activated: "Open Your Dashboard →",
        activation_reminder: "Activate My Profile →",
        subscription_expiring_soon: "Renew Subscription →",
        subscription_expired: "Reactivate My Profile →",
      };

      subject = titles[type];
      html = `
        <div style="font-family:'Georgia','Times New Roman',serif;max-width:600px;margin:0 auto;">
          <div style="background:#0A1628;padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:1px;">GuidesDirectly</h1>
            <p style="color:rgba(255,255,255,0.5);margin:6px 0 0;font-size:12px;">by iGuide Tours</p>
          </div>
          <div style="padding:40px;background:#ffffff;">
            <h2 style="color:#0A1628;font-size:22px;margin:0 0 20px;">Hi ${escapeHtml(guideName)},</h2>
            <p style="color:#333333;line-height:1.7;font-size:17px;margin:0 0 16px;"><strong>${headlines[type]}</strong></p>
            <p style="color:#333333;line-height:1.7;font-size:16px;">${bodies[type]}</p>
            <div style="text-align:center;margin:30px 0 10px;">
              <a href="${dashboardUrl}" style="display:inline-block;background:#C9A84C;color:#0A1628;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">${ctaLabel[type]}</a>
            </div>
            <p style="color:#666;font-size:14px;margin-top:24px;">Questions? Reply to this email or call <strong>+1 (202) 243-8336</strong>.</p>
            <p style="color:#333333;font-size:15px;margin-top:24px;">— The Guides Directly Team</p>
          </div>
          <div style="padding:20px;text-align:center;background:#F5F5F5;">
            <p style="color:#999999;font-size:12px;margin:0;line-height:1.6;">© 2025–2026 Guides Directly, powered by iGuide Tours<br/>Bethesda, MD · +1 (202) 243-8336</p>
          </div>
        </div>
      `;
      toEmails = [guideEmail];
    } else if (type === "founding_guide_welcome" || type === "founding_30day_warning" || type === "founding_7day_warning" || type === "founding_expired") {
      const guideName = String(data.guideName || "there");
      const guideEmail = data.guideEmail as string | undefined;
      const lockedPrice = Number(data.lockedPrice || 29);
      const dashboardUrl = "https://iguidetours.net/guide-dashboard";
      const renewUrl = "https://iguidetours.net/guide-dashboard";

      if (!guideEmail) throw new Error("guideEmail is required");

      const titles: Record<string, string> = {
        founding_guide_welcome: `Welcome, Founding Guide ${escapeHtml(guideName)} — your $${lockedPrice}/mo rate is locked forever`,
        founding_30day_warning: `Your free Founding Guide period ends in 30 days — lock in your $${lockedPrice}/mo rate`,
        founding_7day_warning: `Final reminder — your free Founding Guide period ends in 7 days`,
        founding_expired: `Your Founding Guide free period has ended — your $${lockedPrice}/mo rate is still locked`,
      };

      const headlines: Record<string, string> = {
        founding_guide_welcome: `You're one of our first 50. Your profile is live — free until December 31, 2026.`,
        founding_30day_warning: `Your free period ends December 31, 2026 (30 days from now).`,
        founding_7day_warning: `Final 7 days. Your free period ends December 31, 2026.`,
        founding_expired: `Your free Founding Guide period has ended.`,
      };

      const bodies: Record<string, string> = {
        founding_guide_welcome: `Thank you for being a Founding Guide of GuidesDirectly. As one of our first 50 guides, you have <strong>locked in $${lockedPrice}/month for life</strong> — others will pay $59. Your profile is now visible to travelers worldwide. No commission. Ever.`,
        founding_30day_warning: `Thank you for being a Founding Guide. As a permanent thank-you, your subscription rate is <strong>locked at $${lockedPrice}/month forever</strong> — others will pay $59. To keep your profile visible without interruption, renew before December 31.`,
        founding_7day_warning: `This is your final reminder. Your free period ends in 7 days. Your <strong>$${lockedPrice}/month locked rate</strong> is still guaranteed forever — but only if you renew before your profile goes inactive.`,
        founding_expired: `Your free period has ended and your profile is currently hidden from travelers. Good news — your <strong>$${lockedPrice}/month Founding Guide rate is still locked forever</strong>. Reactivate now to restore visibility immediately. Others pay $59 — you pay $${lockedPrice}, always.`,
      };

      const ctaLabel: Record<string, string> = {
        founding_guide_welcome: "Open Your Dashboard →",
        founding_30day_warning: `Lock in $${lockedPrice}/mo Rate →`,
        founding_7day_warning: `Renew at $${lockedPrice}/mo →`,
        founding_expired: `Reactivate at $${lockedPrice}/mo →`,
      };

      subject = titles[type];
      html = `
        <div style="font-family:'Georgia','Times New Roman',serif;max-width:600px;margin:0 auto;">
          <div style="background:#0A1628;padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:1px;">GuidesDirectly</h1>
            <p style="color:#C9A84C;margin:6px 0 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">FOUNDING GUIDE PROGRAM</p>
          </div>
          <div style="padding:40px;background:#ffffff;">
            <h2 style="color:#0A1628;font-size:22px;margin:0 0 20px;">Hi ${escapeHtml(guideName)},</h2>
            <p style="color:#333333;line-height:1.7;font-size:17px;margin:0 0 16px;"><strong>${headlines[type]}</strong></p>
            <p style="color:#333333;line-height:1.7;font-size:16px;">${bodies[type]}</p>
            <div style="text-align:center;margin:30px 0 10px;">
              <a href="${renewUrl}" style="display:inline-block;background:#C9A84C;color:#0A1628;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">${ctaLabel[type]}</a>
            </div>
            <p style="color:#666;font-size:14px;margin-top:24px;">Questions? Reply to this email or call <strong>+1 (202) 243-8336</strong>.</p>
            <p style="color:#333333;font-size:15px;margin-top:24px;">— The Guides Directly Team</p>
          </div>
          <div style="padding:20px;text-align:center;background:#F5F5F5;">
            <p style="color:#999999;font-size:12px;margin:0;line-height:1.6;">© 2025–2026 Guides Directly, powered by iGuide Tours<br/>Bethesda, MD · +1 (202) 243-8336</p>
          </div>
        </div>
      `;
      toEmails = [guideEmail];
    } else if (type === "founding_spots_filled") {
      const filledAt = String(data.filledAt || new Date().toISOString());
      subject = "🎉 All 50 Founding Guide spots are claimed!";
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#0A1628;padding:30px;text-align:center;">
            <h1 style="color:#C9A84C;margin:0;">Founding Guide Program — FULL</h1>
          </div>
          <div style="padding:30px;background:#f9f9f9;">
            <h2 style="color:#0A1628;">All 50 Founding Guide spots have been claimed.</h2>
            <p style="color:#333;font-size:16px;line-height:1.6;">
              The Founding Guide cohort is now closed. New guide registrations will be routed to the standard paid flow (Pro $29/mo or Featured $59/mo).
            </p>
            <table style="border-collapse:collapse;margin-top:20px;">
              <tr><td style="padding:8px;font-weight:bold;">Filled at:</td><td style="padding:8px;">${escapeHtml(filledAt)}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Cohort size:</td><td style="padding:8px;">50</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Locked rate:</td><td style="padding:8px;">$29/mo forever (when free period ends Dec 31, 2026)</td></tr>
            </table>
            <p style="color:#666;font-size:14px;margin-top:24px;">All Founding Guides have been notified of their welcome and locked rate. Standard pricing now applies to all new signups.</p>
          </div>
        </div>
      `;
      toEmails = ["allharmony@gmail.com"];
    } else if (type === "new_message") {
      const recipientUserId = data.recipientUserId as string;
      const senderName = (data.senderName as string) || "Someone";
      const preview = ((data.preview as string) || "").slice(0, 100);
      const recipientRole = (data.recipientRole as string) || "traveler";
      const conversationId = data.conversationId as string | undefined;

      if (!recipientUserId) {
        throw new Error("recipientUserId is required for new_message");
      }

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Insert in-app notification (service role bypasses RLS)
      try {
        await supabaseAdmin.from("notifications").insert({
          user_id: recipientUserId,
          type: "new_message",
          title: `New message from ${senderName}`,
          message: preview,
          metadata: { conversationId, senderName, recipientRole },
        });
      } catch (e) {
        console.error("Failed to insert in-app notification:", e);
      }

      // Resolve recipient email
      let recipientEmail: string | undefined;
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(recipientUserId);
        recipientEmail = userData?.user?.email;
      } catch (e) {
        console.error("Failed to look up recipient email:", e);
      }

      if (!recipientEmail) {
        // Notification row was created; just return success without email
        return new Response(JSON.stringify({ success: true, emailed: false }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const dashboardUrl =
        recipientRole === "guide"
          ? "https://iguidetours.net/guide-dashboard"
          : "https://iguidetours.net/traveler/dashboard";

      subject = `New message from ${escapeHtml(senderName)} — GuidesDirectly`;
      html = `
        <div style="font-family:'Georgia','Times New Roman',serif;max-width:600px;margin:0 auto;">
          <div style="background:#0A1628;padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:1px;">GuidesDirectly</h1>
          </div>
          <div style="padding:40px;background:#ffffff;">
            <h2 style="color:#0A1628;font-size:22px;margin:0 0 16px;">New message from ${escapeHtml(senderName)}</h2>
            <div style="background:#F5F0E8;border-left:3px solid #C9A84C;padding:16px 20px;margin:20px 0;border-radius:4px;">
              <p style="color:#333;line-height:1.6;font-size:15px;margin:0;font-style:italic;">"${escapeHtml(preview)}${preview.length >= 100 ? "…" : ""}"</p>
            </div>
            <p style="color:#333;line-height:1.7;font-size:16px;">Open your dashboard to read and reply.</p>
            <div style="text-align:center;margin:30px 0 10px;">
              <a href="${dashboardUrl}" style="display:inline-block;background:#C9A84C;color:#0A1628;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Open Messages →</a>
            </div>
            <p style="color:#888;font-size:13px;margin-top:24px;">— The Guides Directly Team</p>
          </div>
          <div style="padding:20px;text-align:center;background:#F5F5F5;">
            <p style="color:#999;font-size:12px;margin:0;">© 2025–2026 Guides Directly, powered by iGuide Tours</p>
          </div>
        </div>
      `;
      toEmails = [recipientEmail];
    } else {
      throw new Error("Invalid notification type");
    }

    const emailResponse = await resend.emails.send({
      from: "Guides Directly <noreply@iguidetours.net>",
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
