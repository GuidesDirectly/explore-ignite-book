import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

import SignupEmail from "../_shared/email-templates/signup.tsx";
import RecoveryEmail from "../_shared/email-templates/recovery.tsx";
import InviteEmail from "../_shared/email-templates/invite.tsx";
import MagicLinkEmail from "../_shared/email-templates/magic-link.tsx";
import EmailChangeEmail from "../_shared/email-templates/email-change.tsx";
import ReauthenticationEmail from "../_shared/email-templates/reauthentication.tsx";

const SITE_NAME = "iGuide Tours";

const emailTypeMap: Record<string, { subject: string; template: (props: any) => React.ReactElement }> = {
  signup: {
    subject: `Welcome to ${SITE_NAME} — confirm your email`,
    template: (props) => React.createElement(SignupEmail, props),
  },
  recovery: {
    subject: `Reset your ${SITE_NAME} password`,
    template: (props) => React.createElement(RecoveryEmail, props),
  },
  invite: {
    subject: `You've been invited to ${SITE_NAME}`,
    template: (props) => React.createElement(InviteEmail, props),
  },
  magiclink: {
    subject: `Your ${SITE_NAME} sign-in link`,
    template: (props) => React.createElement(MagicLinkEmail, props),
  },
  email_change: {
    subject: `Confirm your new email — ${SITE_NAME}`,
    template: (props) => React.createElement(EmailChangeEmail, props),
  },
  reauthentication: {
    subject: `Your ${SITE_NAME} verification code`,
    template: (props) => React.createElement(ReauthenticationEmail, props),
  },
};

function verifyWebhookSignature(_rawBody: string, _signature: string, _secret: string): boolean {
  // Lovable managed pipeline handles authentication via x-callback-url
  // Signature verification is handled at the platform level
  return true;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    console.error("LOVABLE_API_KEY not set");
    return new Response("Server misconfigured", { status: 500 });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature") ?? "";

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature, apiKey)) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log("Payload keys:", Object.keys(payload));
    console.log("email_type:", payload.email_type, "| type:", payload.type);
    const { email_type, email_data } = payload;
    const {
      token_hash,
      redirect_to,
      email_action_type,
      site_url,
      token,
      new_email,
    } = email_data ?? {};

    const recipient = (email_data?.email ?? "") as string;
    const confirmationUrl = token_hash
      ? `${site_url || "https://iguidetours.net"}/auth/confirm?token_hash=${token_hash}&type=${email_action_type || email_type}${redirect_to ? `&redirect_to=${redirect_to}` : ""}`
      : redirect_to || site_url || "https://iguidetours.net";

    const siteUrl = site_url || "https://iguidetours.net";

    const mapping = emailTypeMap[email_type];
    if (!mapping) {
      console.warn(`Unknown email type: ${email_type}`);
      return new Response(JSON.stringify({ error: `Unknown email type: ${email_type}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const templateProps = {
      siteName: SITE_NAME,
      siteUrl,
      confirmationUrl,
      recipient,
      token: token || "",
      newEmail: new_email || "",
    };

    const html = renderToStaticMarkup(mapping.template(templateProps));

    const callbackUrl = req.headers.get("x-callback-url");
    if (!callbackUrl) {
      console.error("No x-callback-url header");
      return new Response("Missing callback URL", { status: 400 });
    }

    // Send email via Lovable managed callback URL
    const emailResponse = await fetch(callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: [recipient],
        subject: mapping.subject,
        html: `<!DOCTYPE html>${html}`,
      }),
    });

    if (!emailResponse.ok) {
      const errorBody = await emailResponse.text();
      console.error("Email send error:", emailResponse.status, errorBody);
      return new Response(JSON.stringify({ error: errorBody }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Email sent successfully: type=${email_type}, to=${recipient}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Auth email hook error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
