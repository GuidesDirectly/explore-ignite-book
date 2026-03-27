import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, PlusCircle, Check } from "lucide-react";
import type { BadgeType } from "@/components/GuideBadge";

interface GuideProfile {
  id: string;
  user_id: string;
  service_areas: string[];
  form_data: {
    firstName: string;
    lastName: string;
    biography: string;
    languages: string[] | string;
    specializations: string[];
  };
  badges: BadgeType[];
}

const CREDENTIAL_MAP: Record<string, string> = {
  Michael: "Founder & President, iGuide Tours",
  Mike: "President, Chicago Tour-Guide Professionals Association (CTPA)",
};

const MeetGuidesSection = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState<GuideProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      const { data: guideData, error } = await (supabase
        .from("guide_profiles_public" as any)
        .select("id, user_id, form_data, service_areas")
        .limit(2) as any);

      if (error || !guideData) {
        setLoading(false);
        return;
      }

      // Fetch badges
      const { data: badgeData } = await supabase
        .from("guide_badges" as any)
        .select("guide_user_id, badge_type");
      const badgeMap = new Map<string, BadgeType[]>();
      if (badgeData) {
        (badgeData as any[]).forEach((b: any) => {
          const existing = badgeMap.get(b.guide_user_id) || [];
          existing.push(b.badge_type as BadgeType);
          badgeMap.set(b.guide_user_id, existing);
        });
      }

      const enriched: GuideProfile[] = guideData.map((g: any) => ({
        ...g,
        service_areas: g.service_areas || [],
        badges: badgeMap.get(g.user_id) || [],
      }));

      setGuides(enriched);
      setLoading(false);
    };
    fetchGuides();
  }, []);

  const getInitials = (g: GuideProfile) => {
    const first = g.form_data.firstName?.[0] || "";
    const last = g.form_data.lastName?.[0] || "";
    return (first + last).toUpperCase();
  };

  const getLanguagesString = (g: GuideProfile) => {
    const langs = g.form_data.languages;
    if (Array.isArray(langs)) return langs.join(", ");
    if (typeof langs === "string") return langs;
    return "";
  };

  const getBioExcerpt = (g: GuideProfile) => {
    const bio = g.form_data.biography || "";
    return bio.length > 120 ? bio.slice(0, 120) + "..." : bio;
  };

  const getCredentialLine = (g: GuideProfile) => {
    const firstName = g.form_data.firstName;
    return CREDENTIAL_MAP[firstName] || "";
  };

  const getSpecializations = (g: GuideProfile) => {
    return (g.form_data.specializations || []).slice(0, 3);
  };

  const isFounderMichael = (g: GuideProfile) =>
    g.form_data.firstName === "Michael";

  // Loading skeleton
  if (loading) {
    return (
      <section id="meet-guides" className="py-20" style={{ backgroundColor: "#122040" }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-[900px] mx-auto mt-14">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[460px] rounded-xl animate-pulse"
                style={{ backgroundColor: "#1A2F50" }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="meet-guides" className="py-20" style={{ backgroundColor: "#122040" }}>
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center">
          <span
            className="text-xs font-semibold uppercase"
            style={{ color: "#C9A84C", letterSpacing: "0.1em", fontSize: 12 }}
          >
            Our Founding Guides
          </span>
          <h2
            className="font-serif font-semibold mt-3"
            style={{ color: "#F5F0E8", fontSize: "clamp(28px, 4vw, 40px)" }}
          >
            Meet the People Behind Your Experience
          </h2>
          <p
            className="mx-auto mt-3"
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: 16,
              maxWidth: 520,
            }}
          >
            Our founding guides set the standard for what direct, human-first travel looks like.
          </p>
        </div>

        {/* 4-card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-[900px] mx-auto mt-14">
          {/* Real guide cards */}
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
              style={{
                backgroundColor: "#1A2F50",
                border: "1px solid rgba(201,168,76,0.25)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)")
              }
            >
              {/* Photo / Initials area */}
              <div className="relative aspect-square rounded-t-[12px]" style={{ backgroundColor: "#0A1628" }}>
                <div className="w-full h-full flex items-center justify-center">
                  <span
                    className="font-serif"
                    style={{ color: "#C9A84C", fontSize: 64, fontWeight: 600 }}
                  >
                    {getInitials(guide)}
                  </span>
                </div>
                {/* FOUNDING GUIDE badge */}
                <span
                  className="absolute bottom-3 left-3 font-bold uppercase"
                  style={{
                    backgroundColor: "#C9A84C",
                    color: "#0A1628",
                    fontSize: 10,
                    padding: "3px 8px",
                    borderRadius: 4,
                    fontWeight: 700,
                  }}
                >
                  FOUNDING GUIDE
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1">
                {/* Name */}
                <h3
                  className="font-serif font-semibold px-5 pt-5 pb-1"
                  style={{ color: "#F5F0E8", fontSize: 22 }}
                >
                  {guide.form_data.firstName} {guide.form_data.lastName}
                </h3>

                {/* Credential line */}
                {getCredentialLine(guide) && (
                  <p className="px-5 pb-2" style={{ color: "#C9A84C", fontSize: 13 }}>
                    {getCredentialLine(guide)}
                  </p>
                )}

                {/* City & Languages */}
                <p className="px-5 pb-3" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                  📍 {guide.service_areas?.[0] || "—"} · {getLanguagesString(guide)}
                </p>

                {/* Bio excerpt */}
                <p
                  className="px-5 pb-4"
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  {getBioExcerpt(guide)}
                </p>

                {/* Specialization pills */}
                {getSpecializations(guide).length > 0 && (
                  <div className="px-5 pb-4 flex flex-wrap gap-1.5">
                    {getSpecializations(guide).map((spec) => (
                      <span
                        key={spec}
                        className="rounded-full"
                        style={{
                          backgroundColor: "rgba(201,168,76,0.12)",
                          border: "1px solid rgba(201,168,76,0.3)",
                          color: "#C9A84C",
                          fontSize: 11,
                          padding: "3px 10px",
                        }}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                {/* Experience line */}
                {isFounderMichael(guide) && (
                  <p className="px-5 pb-4" style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                    35+ Years Experience
                  </p>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Message button */}
                <button
                  onClick={() => navigate(`/guide/${guide.id}`)}
                  className="w-full flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer"
                  style={{
                    backgroundColor: "#C9A84C",
                    color: "#0A1628",
                    fontWeight: 600,
                    fontSize: 15,
                    padding: 16,
                    borderRadius: "0 0 12px 12px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#B8924A")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#C9A84C")
                  }
                >
                  <MessageCircle className="w-4 h-4" />
                  Message {guide.form_data.firstName}
                </button>
              </div>
            </div>
          ))}

          {/* Recruitment cards */}
          {[0, 1].map((i) => (
            <div
              key={`recruit-${i}`}
              className="rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200"
              style={{
                backgroundColor: "rgba(201,168,76,0.04)",
                border: "1.5px dashed rgba(201,168,76,0.35)",
                minHeight: 460,
                padding: "40px 24px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)";
                e.currentTarget.style.backgroundColor = "rgba(201,168,76,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)";
                e.currentTarget.style.backgroundColor = "rgba(201,168,76,0.04)";
              }}
            >
              <PlusCircle
                className="mb-4"
                style={{ width: 48, height: 48, color: "rgba(201,168,76,0.5)" }}
              />
              <h3
                className="font-serif font-semibold mb-3"
                style={{ color: "#F5F0E8", fontSize: 20 }}
              >
                Become a Founding Guide
              </h3>
              <p
                className="mb-6 mx-auto"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  lineHeight: 1.7,
                  maxWidth: 260,
                }}
              >
                Join our first wave of professional guides in Washington DC, Chicago, New York, and
                beyond. Own your clients. Keep 100% of your earnings.
              </p>

              {/* Perks */}
              <div className="flex flex-col gap-2 mb-7 text-left">
                {[
                  "No commission, ever",
                  "AI-powered profile tools",
                  "First access to new cities",
                ].map((perk) => (
                  <span
                    key={perk}
                    className="flex items-center gap-2"
                    style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}
                  >
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#C9A84C" }} />
                    {perk}
                  </span>
                ))}
              </div>

              <Link
                to="/guide-register"
                className="inline-block rounded-lg font-semibold transition-colors duration-200"
                style={{
                  backgroundColor: "#C9A84C",
                  color: "#0A1628",
                  padding: "12px 24px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#B8924A")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#C9A84C")
                }
              >
                Apply as Founding Guide
              </Link>
            </div>
          ))}
        </div>

        {/* Below grid link */}
        <p className="text-center mt-10" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
          Already a guide?{" "}
          <Link
            to="/guides"
            className="underline underline-offset-2 hover:no-underline"
            style={{ color: "#C9A84C" }}
          >
            Browse all our verified guides →
          </Link>
        </p>
      </div>
    </section>
  );
};

export default MeetGuidesSection;
