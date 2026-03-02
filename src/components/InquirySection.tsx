import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, CheckCircle, Search, MapPin, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { inquirySchema } from "@/lib/formSchemas";
import { ALL_DESTINATIONS, PILOT_CITY } from "@/data/destinations";

const DEST_NAMES = ALL_DESTINATIONS.map((d) => d.name);

const InquirySection = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [destQuery, setDestQuery] = useState("");
  const [destOpen, setDestOpen] = useState(false);
  const destRef = useRef<HTMLDivElement>(null);
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
          customDestination: decoded,
          message: prev.message || `I'm looking for a guide in ${decoded}. Please help me find one!`,
        }));
      }
    }
  }, [location.hash]);

  // Close destination dropdown on click outside
  useEffect(() => {
    if (!destOpen) return;
    const handler = (e: MouseEvent) => {
      if (destRef.current && !destRef.current.contains(e.target as Node)) setDestOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [destOpen]);

  const filteredDests = useMemo(() => {
    if (!destQuery.trim()) return DEST_NAMES.slice(0, 20);
    const q = destQuery.toLowerCase();
    return DEST_NAMES.filter((d) => d.toLowerCase().includes(q)).slice(0, 20);
  }, [destQuery]);

  const destHasNoMatch = useMemo(() => {
    if (!destQuery.trim()) return false;
    return !DEST_NAMES.some((d) => d.toLowerCase() === destQuery.trim().toLowerCase());
  }, [destQuery]);

  const selectDestination = (name: string) => {
    setFormData((prev) => ({ ...prev, destination: name }));
    setDestQuery("");
    setDestOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Destination is now set directly (no "other" dropdown needed)
    const resolvedDestination = formData.destination.trim();

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
      <section id="inquiry" className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl font-bold mb-4 text-foreground">
              {t("inquiry.thankYou")}
            </h2>
            <p className="text-muted-foreground">
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
    errors[field] ? <p className="text-destructive text-xs mt-1">{errors[field]}</p> : null;

  return (
    <section id="inquiry" className="py-24 bg-card">
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
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t("inquiry.title")}
              <br />
              <span className="text-gradient-gold">{t("inquiry.titleGold")}</span>
            </h2>
            <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
              {t("inquiry.subtitle")}
            </p>
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 mb-6">
              <p className="text-sm font-medium text-foreground">
                {t("inquiry.commissionFreeNote")}
              </p>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p className="flex items-center gap-2">📧 michael@iguidetours.net</p>
              <p className="flex items-center gap-2">📞 +1 (202) 243-8336</p>
              <p className="flex items-center gap-2">📍 6100 Cheshire Dr, Bethesda, MD 20814, USA</p>
              <p className="text-xs italic mt-2">
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
            className="bg-background rounded-2xl p-8 border border-border shadow-card space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">{t("inquiry.fullName")} *</label>
                <Input
                  placeholder="John Doe"
                  className="bg-accent border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                />
                {fieldError("name")}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">{t("inquiry.email")} *</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="bg-accent border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  maxLength={255}
                />
                {fieldError("email")}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">{t("inquiry.phone")}</label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  className="bg-accent border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  maxLength={30}
                />
                {fieldError("phone")}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">{t("inquiry.groupSize")}</label>
                <Select onValueChange={(val) => setFormData({ ...formData, groupSize: val })}>
                  <SelectTrigger className="bg-accent border-border text-foreground">
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

            <div ref={destRef} className="relative">
              <label className="block text-sm font-medium mb-2 text-foreground">{t("inquiry.destination")} *</label>
              {/* Selected destination chip */}
              {formData.destination && !destOpen ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-sm font-semibold pl-3 pr-1.5 py-1.5 rounded-full">
                    <Check className="w-3 h-3" />
                    {formData.destination}
                    <button type="button" onClick={() => setFormData({ ...formData, destination: "" })} className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                  <button type="button" onClick={() => setDestOpen(true)} className="text-xs text-primary hover:underline">Change</button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("inquiry.searchDest", "Search country, city, or type your own...")}
                    className="pl-9 bg-accent border-border text-foreground placeholder:text-muted-foreground"
                    value={destQuery}
                    onChange={(e) => { setDestQuery(e.target.value); setDestOpen(true); }}
                    onFocus={() => setDestOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && destQuery.trim()) {
                        e.preventDefault();
                        selectDestination(destQuery.trim());
                      }
                    }}
                    maxLength={100}
                  />
                </div>
              )}
              {/* Dropdown results */}
              {destOpen && (
                <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {filteredDests.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => selectDestination(d)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:bg-primary/5 transition-colors text-left"
                    >
                      <MapPin className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                      {d}
                    </button>
                  ))}
                  {destHasNoMatch && destQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => selectDestination(destQuery.trim())}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg border-t border-border bg-primary/5 hover:bg-primary/10 transition-colors text-foreground"
                    >
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>Add "<strong>{destQuery.trim()}</strong>"</span>
                    </button>
                  )}
                  {filteredDests.length === 0 && !destQuery.trim() && (
                    <p className="text-sm text-muted-foreground text-center py-3">Type to search…</p>
                  )}
                </div>
              )}
              {fieldError("destination")}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">{t("inquiry.message")}</label>
              <Textarea
                placeholder={t("inquiry.messagePlaceholder")}
                rows={4}
                className="bg-accent border-border text-foreground placeholder:text-muted-foreground resize-none"
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
