import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

const InquirySection = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    destination: "",
    groupSize: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.destination) {
      toast.error(t("inquiry.required"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("inquiries").insert({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      destination: formData.destination,
      group_size: formData.groupSize || null,
      message: formData.message.trim() || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
    toast.success(t("inquiry.success"));
    // Send email notification (fire-and-forget)
    supabase.functions.invoke("send-notification", {
      body: {
        type: "inquiry",
        data: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          destination: formData.destination,
          group_size: formData.groupSize || null,
          message: formData.message.trim() || null,
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
            <p className="text-lg leading-relaxed mb-8" style={{ color: "hsl(40, 33%, 80%)" }}>
              {t("inquiry.subtitle")}
            </p>
            <div className="space-y-4" style={{ color: "hsl(40, 33%, 75%)" }}>
              <p className="flex items-center gap-2">📧 michael@iguidetours.net</p>
              <p className="flex items-center gap-2">📞 +1 (202) 243-8336</p>
              <p className="flex items-center gap-2">📍 6100 Cheshire Dr, Bethesda, MD 20814, USA</p>
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>{t("inquiry.email")} *</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
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
                />
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
              <Select onValueChange={(val) => setFormData({ ...formData, destination: val })}>
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
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>{t("inquiry.message")}</label>
              <Textarea
                placeholder={t("inquiry.messagePlaceholder")}
                rows={4}
                className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
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
