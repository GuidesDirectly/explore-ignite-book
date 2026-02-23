import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { inquirySchema } from "@/lib/formSchemas";

const InquirySection = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    destination: "",
    customDestination: "",
    groupSize: "",
    message: "",
  });

  // Pre-fill destination from URL hash (e.g., #inquiry?dest=Bali)
  useEffect(() => {
    const hash = location.hash;
    if (hash.includes("dest=")) {
      const params = new URLSearchParams(hash.split("?")[1] || "");
      const dest = params.get("dest");
      if (dest) {
        const decoded = decodeURIComponent(dest);
        setFormData(prev => ({
          ...prev,
          destination: "other",
          message: prev.message || `I'm looking for a guide in ${decoded}. Please help me find one!`,
        }));
      }
    }
  }, [location.hash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Resolve destination: use custom text if "other" is selected
    const resolvedDestination = formData.destination === "other" && formData.customDestination.trim()
      ? `other: ${formData.customDestination.trim()}`
      : formData.destination;

    const result = inquirySchema.safeParse({ ...formData, destination: resolvedDestination });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast.error(t("inquiry.required"));
      return;
    }

    setLoading(true);
    const validated = result.data;
    const { error } = await supabase.from("inquiries").insert({
      name: validated.name,
      email: validated.email,
      phone: validated.phone || null,
      destination: validated.destination,
      group_size: validated.groupSize || null,
      message: validated.message || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
    toast.success(t("inquiry.success"));
    supabase.functions.invoke("send-notification", {
      body: {
        type: "inquiry",
        data: {
          name: validated.name,
          email: validated.email,
          phone: validated.phone || null,
          destination: validated.destination,
          group_size: validated.groupSize || null,
          message: validated.message || null,
        },
      },
    }).catch(console.error);
  };

  if (submitted) {
    return (
      <section id="inquiry" className="py-24 bg-gradient-navy">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl font-bold mb-4" style={{ color: "hsl(40, 33%, 97%)" }}>
              {t("inquiry.thankYou")}
            </h2>
            <p style={{ color: "hsl(40, 33%, 80%)" }}>
              {t("inquiry.thankYouMsg")}
            </p>
            <Button variant="hero" className="mt-8" onClick={() => setSubmitted(false)}>
              {t("inquiry.submitAnother")}
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  const fieldError = (field: string) =>
    errors[field] ? <p className="text-red-400 text-xs mt-1">{errors[field]}</p> : null;

  return (
    <section id="inquiry" className="py-24 bg-gradient-navy">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
              {t("inquiry.label")}
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6" style={{ color: "hsl(40, 33%, 97%)" }}>
              {t("inquiry.title")}
              <br />
              <span className="text-gradient-gold">{t("inquiry.titleGold")}</span>
            </h2>
            <p className="text-lg leading-relaxed mb-6" style={{ color: "hsl(40, 33%, 80%)" }}>
              {t("inquiry.subtitle")}
            </p>
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 mb-6">
              <p className="text-sm font-medium" style={{ color: "hsl(40, 33%, 90%)" }}>
                {t("inquiry.commissionFreeNote")}
              </p>
            </div>
            <div className="space-y-4" style={{ color: "hsl(40, 33%, 75%)" }}>
              <p className="flex items-center gap-2">📧 michael@iguidetours.net</p>
              <p className="flex items-center gap-2">📞 +1 (202) 243-8336</p>
              <p className="flex items-center gap-2">📍 6100 Cheshire Dr, Bethesda, MD 20814, USA</p>
              <p className="text-xs italic mt-2" style={{ color: "hsl(40, 33%, 65%)" }}>
                {t("inquiry.directContact")}
              </p>
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card/10 backdrop-blur-sm rounded-2xl p-8 border border-primary/10 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>{t("inquiry.fullName")} *</label>
                <Input
                  placeholder="John Doe"
                  className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                />
                {fieldError("name")}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>{t("inquiry.email")} *</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  maxLength={255}
                />
                {fieldError("email")}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>{t("inquiry.phone")}</label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  maxLength={30}
                />
                {fieldError("phone")}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>{t("inquiry.groupSize")}</label>
                <Select onValueChange={(val) => setFormData({ ...formData, groupSize: val })}>
                  <SelectTrigger className="bg-secondary/50 border-primary/20 text-primary-foreground">
                    <SelectValue placeholder={t("inquiry.selectSize")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1–2 {t("inquiry.people")}</SelectItem>
                    <SelectItem value="3-5">3–5 {t("inquiry.people")}</SelectItem>
                    <SelectItem value="6-10">6–10 {t("inquiry.people")}</SelectItem>
                    <SelectItem value="10+">10+ {t("inquiry.people")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>{t("inquiry.destination")} *</label>
              <Select value={formData.destination} onValueChange={(val) => setFormData({ ...formData, destination: val })}>
                <SelectTrigger className="bg-secondary/50 border-primary/20 text-primary-foreground">
                  <SelectValue placeholder={t("inquiry.chooseDest")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="washington-dc">Washington DC</SelectItem>
                  <SelectItem value="new-york">New York City</SelectItem>
                  <SelectItem value="niagara-falls">Niagara Falls</SelectItem>
                  <SelectItem value="toronto">Toronto</SelectItem>
                  <SelectItem value="boston">Boston</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                  <SelectItem value="other">{t("inquiry.other", "Other")}</SelectItem>
                </SelectContent>
              </Select>
              {formData.destination === "other" && (
                <Input
                  placeholder={t("inquiry.customDestPlaceholder", "Enter your desired destination...")}
                  className="mt-2 bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground"
                  value={formData.customDestination || ""}
                  onChange={(e) => setFormData({ ...formData, customDestination: e.target.value })}
                  maxLength={100}
                />
              )}
              {fieldError("destination")}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>{t("inquiry.message")}</label>
              <Textarea
                placeholder={t("inquiry.messagePlaceholder")}
                rows={4}
                className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                maxLength={2000}
              />
              {fieldError("message")}
            </div>

            <Button variant="hero" size="lg" className="w-full text-base py-6" type="submit" disabled={loading}>
              <Send className="w-5 h-5 mr-2" />
              {loading ? "..." : t("inquiry.send")}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default InquirySection;
