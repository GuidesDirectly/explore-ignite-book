import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const WhyDirectSection = () => {
  const { t } = useTranslation();

  const otherPlatformItems = [
    t("whyDirect.other1"),
    t("whyDirect.other2"),
    t("whyDirect.other3"),
    t("whyDirect.other4"),
    t("whyDirect.other5"),
    t("whyDirect.other6"),
  ];

  const guidesDirectlyItems = [
    t("whyDirect.ours1"),
    t("whyDirect.ours2"),
    t("whyDirect.ours3"),
    t("whyDirect.ours4"),
    t("whyDirect.ours5"),
    t("whyDirect.ours6"),
  ];

  return (
    <section id="why-book-direct" style={{ background: "#0A1628" }} className="py-20">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center max-w-[600px] mx-auto">
          <p style={{ color: "#C9A84C", fontSize: 11, letterSpacing: "0.12em" }} className="uppercase font-semibold mb-3">
            {t("whyDirect.eyebrow")}
          </p>
          <h2 style={{ color: "#F5F0E8" }} className="font-display text-[26px] md:text-[36px] font-semibold leading-tight">
            {t("whyDirect.headline")}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, maxWidth: 480, marginTop: 12 }} className="mx-auto">
            {t("whyDirect.subheading")}
          </p>
        </div>

        {/* Two-column comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[860px] mx-auto mt-12">
          {/* Other Platforms */}
          <div>
            <div style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: "12px 12px 0 0", padding: "16px 24px" }}>
              <span style={{ color: "#C0392B", fontSize: 15, fontWeight: 600 }}>{t("whyDirect.colOther")}</span>
            </div>
            <div style={{ background: "rgba(192,57,43,0.04)", borderLeft: "1px solid rgba(192,57,43,0.2)", borderRight: "1px solid rgba(192,57,43,0.2)", borderBottom: "1px solid rgba(192,57,43,0.2)", borderRadius: "0 0 12px 12px" }} className="p-6 space-y-4">
              {otherPlatformItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X style={{ color: "#C0392B" }} className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guides Directly */}
          <div>
            <div style={{ background: "rgba(45,106,79,0.12)", border: "1px solid rgba(45,106,79,0.4)", borderRadius: "12px 12px 0 0", padding: "16px 24px" }}>
              <span style={{ color: "#2D6A4F", fontSize: 15, fontWeight: 600 }}>{t("whyDirect.colOurs")}</span>
            </div>
            <div style={{ background: "rgba(45,106,79,0.04)", borderLeft: "1px solid rgba(45,106,79,0.2)", borderRight: "1px solid rgba(45,106,79,0.2)", borderBottom: "1px solid rgba(45,106,79,0.2)", borderRadius: "0 0 12px 12px" }} className="p-6 space-y-4">
              {guidesDirectlyItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check style={{ color: "#2D6A4F" }} className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Closing statement */}
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, fontStyle: "italic", maxWidth: 500, marginTop: 32 }} className="text-center mx-auto">
          {t("whyDirect.footer")}
        </p>
      </div>
    </section>
  );
};

export default WhyDirectSection;
