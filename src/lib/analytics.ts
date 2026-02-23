import { supabase } from "@/integrations/supabase/client";

/**
 * Track an analytics event for KPI dashboards.
 * Fire-and-forget — never blocks the UI.
 */
export const trackEvent = (
  eventType: string,
  eventData: Record<string, unknown> = {},
  userId?: string
) => {
  const sessionId =
    sessionStorage.getItem("analytics_session") ||
    (() => {
      const id = crypto.randomUUID();
      sessionStorage.setItem("analytics_session", id);
      return id;
    })();

  supabase
    .from("analytics_events")
    .insert({
      event_type: eventType,
      event_data: eventData,
      session_id: sessionId,
      user_id: userId || null,
    } as any)
    .then(({ error }) => {
      if (error) console.warn("Analytics event failed:", error.message);
    });
};

// Pre-defined event helpers
export const trackSwapRequest = (data: {
  originalActivity: string;
  swapRequest: string;
  tourPlanId?: string;
}) => trackEvent("swap_request", data);

export const trackSwapCompleted = (data: {
  originalActivity: string;
  swapRequest: string;
  tourPlanId?: string;
}) => trackEvent("swap_completed", data);

export const trackCtaClick = (ctaName: string, location: string) =>
  trackEvent("cta_click", { ctaName, location });

export const trackAiDemoSubmit = (destination: string) =>
  trackEvent("ai_demo_submit", { destination });

export const trackTourPlanGenerated = (destination: string) =>
  trackEvent("tour_plan_generated", { destination });

export const trackTourPlanRefined = (destination: string, refinementCount: number) =>
  trackEvent("tour_plan_refined", { destination, refinementCount });

export const trackGuideMatched = (destination: string, matchCount: number) =>
  trackEvent("guide_matched", { destination, matchCount });

export const trackFeedbackViewed = (guideUserId: string) =>
  trackEvent("feedback_insights_viewed", { guideUserId });
