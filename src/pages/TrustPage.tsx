import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  BadgeCheck,
  Eye,
  CreditCard,
  FileCheck,
  ScanLine,
  KeyRound,
  ServerCrash,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/seo/SEO";

const TrustPage = () => {
  const { t } = useTranslation();

  const trustBadges = [
    { icon: ShieldCheck, titleKey: "trustPage.badge1Title", descKey: "trustPage.badge1Desc" },
    { icon: Lock, titleKey: "trustPage.badge2Title", descKey: "trustPage.badge2Desc" },
    { icon: BadgeCheck, titleKey: "trustPage.badge3Title", descKey: "trustPage.badge3Desc" },
    { icon: Eye, titleKey: "trustPage.badge4Title", descKey: "trustPage.badge4Desc" },
    { icon: CreditCard, titleKey: "trustPage.badge5Title", descKey: "trustPage.badge5Desc" },
  ];

  const securityFeatures = [
    { icon: Lock, titleKey: "trustPage.feat1Title", descKey: "trustPage.feat1Desc" },
    { icon: BadgeCheck, titleKey: "trustPage.feat2Title", descKey: "trustPage.feat2Desc" },
    { icon: ScanLine, titleKey: "trustPage.feat3Title", descKey: "trustPage.feat3Desc" },
    { icon: Eye, titleKey: "trustPage.feat4Title", descKey: "trustPage.feat4Desc" },
  ];

  const uploadChecks = [
    t("trustPage.check1"), t("trustPage.check2"), t("trustPage.check3"),
    t("trustPage.check4"), t("trustPage.check5"), t("trustPage.check6"),
  ];

  const certItems = [
    t("trustPage.cert1"), t("trustPage.cert2"), t("trustPage.cert3"),
    t("trustPage.cert4"), t("trustPage.cert5"),
  ];

  const policyAllowed = {
    images: ["JPG", "PNG", "WEBP"],
    documents: ["PDF", "JPEG", "PNG"],
  };

  const policyProhibited = [
    t("trustPage.prohibited1"), t("trustPage.prohibited2"), t("trustPage.prohibited3"),
    t("trustPage.prohibited4"), t("trustPage.prohibited5"), t("trustPage.prohibited6"),
  ];

  const sizeLimits = [
    { type: t("trustPage.profilePhotos"), limit: "5 MB" },
    { type: t("trustPage.portfolioImages"), limit: "5 MB" },
    { type: t("trustPage.docsCerts"), limit: "10 MB" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero Banner ── */}
      <section className="relative bg-gradient-navy pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, hsl(36,80%,50%) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(200,98%,39%) 0%, transparent 50%)",
          }}
        />
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-5 py-2 mb-6">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-semibold tracking-wide uppercase">{t("trustPage.badge")}</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-primary-foreground mb-4">
              {t("trustPage.heroTitle1")}<br />
              <span className="text-gradient-gold">{t("trustPage.heroTitle2")}</span>
            </h1>
            <p className="text-primary-foreground/70 text-xl max-w-2xl mx-auto mb-6">
              {t("trustPage.heroDesc")}
            </p>
            <div className="inline-block bg-primary/20 border border-primary/30 rounded-full px-6 py-2">
              <p className="text-primary-foreground/90 font-semibold text-sm">
                {t("trustPage.heroNote")}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">{t("trustPage.badgesTitle")}</h2>
            <p className="text-muted-foreground">{t("trustPage.badgesDesc")}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-5xl mx-auto">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center text-center p-5 rounded-2xl border bg-primary/5 border-primary/20 shadow-card"
              >
                <badge.icon className="w-9 h-9 mb-3 text-primary" />
                <h3 className="font-display font-bold text-foreground text-sm mb-1">{t(badge.titleKey)}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{t(badge.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security Features Grid ── */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">{t("trustPage.featuresTitle")}</h2>
            <p className="text-muted-foreground">{t("trustPage.featuresDesc")}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {securityFeatures.map((feat, i) => (
              <motion.div
                key={feat.titleKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-background border border-border shadow-card"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-gold flex items-center justify-center mb-4">
                  <feat.icon className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{t(feat.titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(feat.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upload Security Policy ── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-2">{t("trustPage.uploadLabel")}</p>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">{t("trustPage.uploadTitle")}</h2>
            <p className="text-muted-foreground">{t("trustPage.uploadDesc")}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-7 shadow-card"
            >
              <div className="flex items-center gap-3 mb-5">
                <FileCheck className="w-6 h-6 text-primary" />
                <h3 className="font-display font-bold text-foreground text-lg">{t("trustPage.safeguardsTitle")}</h3>
              </div>
              <ul className="space-y-3">
                {uploadChecks.map((check) => (
                  <li key={check} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {check}
                  </li>
                ))}
              </ul>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-primary/5 border border-primary/20 rounded-2xl p-6"
              >
                <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" /> {t("trustPage.allowedTitle")}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-foreground mb-1">{t("trustPage.images")}</p>
                    {policyAllowed.images.map((f) => (
                      <p key={f} className="text-muted-foreground">{f}</p>
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">{t("trustPage.documents")}</p>
                    {policyAllowed.documents.map((f) => (
                      <p key={f} className="text-muted-foreground">{f}</p>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" /> {t("trustPage.sizeLimitsTitle")}
                </h3>
                <div className="space-y-2">
                  {sizeLimits.map((row) => (
                    <div key={row.type} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{row.type}</span>
                      <span className="font-semibold text-foreground">{row.limit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6"
              >
                <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" /> {t("trustPage.prohibitedTitle")}
                </h3>
                <ul className="space-y-1">
                  {policyProhibited.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Compliance Certificate ── */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <div className="relative bg-background border-2 border-primary/30 rounded-3xl p-8 shadow-[0_0_0_6px_hsl(var(--primary)/0.06),0_20px_60px_-10px_hsl(var(--primary)/0.15)] text-center overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <ShieldCheck className="w-72 h-72 text-primary" />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <ShieldCheck className="w-8 h-8 text-primary" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </div>

              <p className="text-primary font-body text-xs uppercase tracking-[0.25em] font-semibold mb-2">
                {t("trustPage.certLabel")}
              </p>
              <p className="text-muted-foreground text-sm mb-4">{t("trustPage.certifies")}</p>
              <h3 className="font-display text-2xl font-bold text-foreground mb-1">{t("trustPage.certPlatform")}</h3>
              <p className="text-muted-foreground text-sm mb-6">{t("trustPage.certMeets")}</p>

              <ul className="space-y-2 mb-6 text-left inline-block">
                {certItems.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-gradient-gold rounded-xl px-5 py-2 inline-block mb-6">
                <p className="font-display font-bold text-secondary text-sm tracking-wide">{t("trustPage.certStatus")}</p>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <ServerCrash className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">{t("trustPage.certIssued")}</p>
                  <p>{t("trustPage.certIssuedDate")}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{t("trustPage.certStandard")}</p>
                  <p>{t("trustPage.certStandardValue")}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 bg-gradient-navy text-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold text-primary-foreground mb-3">
              {t("trustPage.ctaTitle")}
            </h2>
            <p className="text-primary-foreground/60 mb-6 max-w-xl mx-auto">
              {t("trustPage.ctaDesc")}
            </p>
            <a
              href="/home#meet-guides"
              className="inline-flex items-center gap-2 bg-gradient-gold text-secondary font-semibold px-8 py-3 rounded-xl shadow-warm hover:scale-105 transition-transform duration-200"
            >
              <ShieldCheck className="w-5 h-5" />
              {t("trustPage.ctaButton")}
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrustPage;
