import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { inquirySchema } from "@/lib/formSchemas";

interface GuideContactFormProps {
  guideName: string;
  guideUserId: string;
  serviceAreas: string[];
}

const GuideContactForm = ({ guideName, guideUserId, serviceAreas }: GuideContactFormProps) => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    destination: serviceAreas[0] || "",
    groupSize: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = inquirySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast.error(t("inquiry.required", "Please fill in the required fields."));
      return;
    }

    setLoading(true);
    const validated = result.data;

    // Prefix destination with guide name for routing
    const destinationWithGuide = `[Guide: ${guideName}] ${validated.destination}`;

    const { error } = await supabase.from("inquiries").insert({
      name: validated.name,
      email: validated.email,
      phone: validated.phone || null,
      destination: destinationWithGuide,
      group_size: validated.groupSize || null,
      message: validated.message || null,
    });

    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    toast.success(t("inquiry.success", "Your request has been sent!"));

    // Fire-and-forget notification
    supabase.functions.invoke("send-notification", {
      body: {
        type: "inquiry",
        data: {
          name: validated.name,
          email: validated.email,
          phone: validated.phone || null,
          destination: destinationWithGuide,
          group_size: validated.groupSize || null,
          message: validated.message || null,
          guide_user_id: guideUserId,
        },
      },
    }).catch(console.error);
  };

  const fieldError = (field: string) =>
    errors[field] ? <p className="text-destructive text-xs mt-1">{errors[field]}</p> : null;

  if (submitted) {
    return (
      <section id="contact-section" className="bg-card rounded-2xl border border-border/50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            {t("inquiry.thankYou", "Thank You!")}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {t("guideProfile.inquirySent", "Your request has been sent. We'll connect you with {guide} shortly.").replace("{guide}", guideName)}
          </p>
          <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
            {t("inquiry.submitAnother", "Send Another")}
          </Button>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="contact-section" className="bg-card rounded-2xl border border-primary/20 p-6">
      <h2 className="font-display text-xl font-bold text-foreground mb-1">
        <Send className="w-5 h-5 inline mr-2 text-primary" />
        {t("guideProfile.contactTitle", "Request a Tour with {guide}").replace("{guide}", guideName)}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {t("guideProfile.contactSubtitle", "Fill out the form below and we'll connect you directly — no commissions, no middlemen.")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("inquiry.fullName", "Full Name")} *
            </label>
            <Input
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={100}
            />
            {fieldError("name")}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("inquiry.email", "Email")} *
            </label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              maxLength={255}
            />
            {fieldError("email")}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("inquiry.phone", "Phone")}
            </label>
            <Input
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              maxLength={30}
            />
            {fieldError("phone")}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("inquiry.groupSize", "Group Size")}
            </label>
            <Select onValueChange={(val) => setFormData({ ...formData, groupSize: val })}>
              <SelectTrigger>
                <SelectValue placeholder={t("inquiry.selectSize", "Select size")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1–2 {t("inquiry.people", "people")}</SelectItem>
                <SelectItem value="3-5">3–5 {t("inquiry.people", "people")}</SelectItem>
                <SelectItem value="6-10">6–10 {t("inquiry.people", "people")}</SelectItem>
                <SelectItem value="10+">10+ {t("inquiry.people", "people")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("inquiry.destination", "Destination")} *
          </label>
          <Select
            value={formData.destination}
            onValueChange={(val) => setFormData({ ...formData, destination: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("inquiry.chooseDest", "Choose destination")} />
            </SelectTrigger>
            <SelectContent>
              {serviceAreas.length > 0 ? (
                serviceAreas.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="washington-dc">Washington DC</SelectItem>
                  <SelectItem value="new-york">New York City</SelectItem>
                  <SelectItem value="niagara-falls">Niagara Falls</SelectItem>
                  <SelectItem value="toronto">Toronto</SelectItem>
                  <SelectItem value="boston">Boston</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          {fieldError("destination")}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("inquiry.message", "Message")}
          </label>
          <Textarea
            placeholder={t("guideProfile.messagePlaceholder", "Tell us about your trip — dates, interests, group details...")}
            rows={4}
            className="resize-none"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            maxLength={2000}
          />
          {fieldError("message")}
        </div>

        <Button variant="hero" size="lg" className="w-full text-base" type="submit" disabled={loading}>
          <Send className="w-4 h-4 mr-2" />
          {loading ? "..." : t("guideProfile.sendRequest", "Send Tour Request")}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {t("guideProfile.noCommission", "Zero commissions. You'll be connected directly with the guide.")}
        </p>
      </form>
    </section>
  );
};

export default GuideContactForm;
