import { motion } from "framer-motion";
import { X, Check, DollarSign, Settings, Bot, Handshake } from "lucide-react";
import { useTranslation } from "react-i18next";

const MonetizationSection = () => {
  const { t } = useTranslation();

  const neverDoItems = [
    t("monetization.never1"),
    t("monetization.never2"),
    t("monetization.never3"),
    t("monetization.never4"),
  ];

  const revenueStreams = [
    {
      icon: Settings,
      title: t("monetization.stream1Title"),
      items: [
        t("monetization.stream1a"),
        t("monetization.stream1b"),
        t("monetization.stream1c"),
        t("monetization.stream1d"),
      ],
      color: "hsl(210, 70%, 50%)",
    },
    {
      icon: Bot,
      title: t("monetization.stream2Title"),
      items: [
        t("monetization.stream2a"),
        t("monetization.stream2b"),
        t("monetization.stream2c"),
        t("monetization.stream2d"),
      ],
      color: "hsl(270, 60%, 55%)",
    },
    {
      icon: Handshake,
      title: t("monetization.stream3Title"),
      items: [
        t("monetization.stream3a"),
        t("monetization.stream3b"),
        t("monetization.stream3c"),
      ],
      color: "hsl(145, 60%, 40%)",
    },
  ];

  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "hsl(45, 80%, 65%)" }}>
            {t("monetization.label")}
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: "hsl(40, 33%, 97%)" }}>
            {t("monetization.title")}
          </h2>
          <p className="text-primary-foreground/60 max-w-2xl mx-auto text-lg">
            {t("monetization.subtitle")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Left: What we NEVER do */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border p-8"
            style={{ borderColor: "hsla(0, 80%, 60%, 0.25)", background: "hsla(0, 60%, 10%, 0.3)" }}
          >
            <h3 className="font-display text-xl font-bold mb-6" style={{ color: "hsl(0, 80%, 75%)" }}>
              {t("monetization.neverTitle")}
            </h3>
            <div className="space-y-4">
              {neverDoItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "hsla(0, 80%, 60%, 0.15)", border: "1px solid hsla(0, 80%, 60%, 0.3)" }}>
                    <X className="w-3.5 h-3.5" style={{ color: "hsl(0, 80%, 70%)" }} />
                  </div>
                  <p className="text-primary-foreground/70">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t" style={{ borderColor: "hsla(0, 80%, 60%, 0.2)" }}>
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <p className="text-primary font-display font-bold text-sm text-center">{t("monetization.result")}</p>
                <div className="grid grid-cols-3 gap-3 mt-3 text-center text-xs">
                  {[t("monetization.resultItem1"), t("monetization.resultItem2"), t("monetization.resultItem3")].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 justify-center">
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="text-primary-foreground/70">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Core principle + Direct model */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            <div className="rounded-2xl border p-8 flex-1" style={{ borderColor: "hsla(45, 80%, 65%, 0.2)", background: "hsla(220, 30%, 10%, 0.4)" }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3" style={{ color: "hsl(40, 33%, 97%)" }}>
                {t("monetization.coreTitle")}
              </h3>
              <p className="text-primary-foreground/70 leading-relaxed mb-6">
                {t("monetization.coreDesc")}
              </p>
              <div className="flex items-center justify-center gap-4 bg-primary/5 border border-primary/15 rounded-xl p-5">
                <div className="text-center">
                  <p className="font-display font-bold text-primary-foreground">{t("monetization.modelTraveler")}</p>
                </div>
                <div className="text-3xl font-bold text-primary">⇄</div>
                <div className="text-center">
                  <p className="font-display font-bold text-primary-foreground">{t("monetization.modelGuide")}</p>
                </div>
              </div>
              <p className="text-xs text-primary-foreground/40 text-center mt-3 italic">{t("monetization.platformOnly")}</p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
              <p className="font-display font-bold text-lg text-primary">{t("monetization.alignmentLine")}</p>
            </div>
          </motion.div>
        </div>

        {/* Revenue streams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-center text-primary-foreground/50 text-sm uppercase tracking-widest font-semibold mb-8">
            {t("monetization.streamsLabel")}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {revenueStreams.map((stream, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl border p-6"
                style={{ borderColor: `${stream.color}33`, background: "hsla(220, 30%, 8%, 0.5)" }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${stream.color}22`, border: `1px solid ${stream.color}44` }}>
                  <stream.icon className="w-5 h-5" style={{ color: stream.color }} />
                </div>
                <h4 className="font-display font-bold text-base mb-4" style={{ color: "hsl(40, 33%, 90%)" }}>
                  {stream.title}
                </h4>
                <div className="space-y-2">
                  {stream.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: stream.color }} />
                      <span className="text-sm text-primary-foreground/60">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10"
        >
          <p className="text-primary-foreground/40 text-sm">{t("monetization.optionalNote")}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default MonetizationSection;
