import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Globe, MapPin, Shield, Star, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo.jpg";

const VALUE_PROPS = [
  { icon: Zap, title: "0% Commission — Forever", desc: "We will never take a cut of your earnings. What you charge is what you keep." },
  { icon: Star, title: "Priority City Placement", desc: "Early adopters get featured positioning in their city before anyone else." },
  { icon: Globe, title: "Featured Global Visibility", desc: "Your profile is highlighted to travelers searching your destination worldwide." },
  { icon: Users, title: "Direct Traveler Access", desc: "Travelers contact you directly — no middlemen, no booking agents." },
];

const TRUST_POINTS = [
  "Manually verified guide profiles",
  "No algorithm rankings — equal visibility",
  "You set your own prices, always",
  "Platform funded privately — no investor pressure on commissions",
];

const LICENSE_OPTIONS = ["Licensed", "In Progress", "Not Required in My Area", "Other"];

const ApplyCityPilot = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    licenseStatus: "",
    yearsExperience: "",
    languages: "",
    phone: "",
    message: "",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.city) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("inquiries").insert({
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        destination: form.city,
        phone: form.phone,
        message: `[City Pilot Application]\nLicense: ${form.licenseStatus}\nExperience: ${form.yearsExperience} years\nLanguages: ${form.languages}\n\n${form.message}`,
        group_size: "Guide Application",
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-3">Application Received!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for applying to pilot your city. Our team will review your application and reach out within 48 hours.
          </p>
          <Button variant="outline" onClick={() => navigate("/home")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary border-b border-border px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <a href="/home" className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-bold text-primary-foreground tracking-tight">
              Guides<span className="text-gradient-gold">Directly</span>
            </span>
          </a>
          <Button variant="ghost" size="sm" className="text-primary-foreground/70" onClick={() => navigate("/home")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Home
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-secondary text-secondary-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold uppercase tracking-widest mb-8">
              <MapPin className="w-3.5 h-3.5" />
              Guide Partner Program
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-secondary-foreground mb-6 leading-tight">
              Become the Official<br />
              Guide Partner for<br />
              <span className="text-primary italic">Your City</span>
            </h1>
            <p className="text-secondary-foreground/70 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Join the world's only commission-free guide platform. Pilot your city, own your business, and keep 100% of your earnings — forever.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {VALUE_PROPS.map((prop, i) => (
              <motion.div
                key={prop.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-background border border-border rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <prop.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{prop.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{prop.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Apply Now — Reserve Your City
              </h2>
              <p className="text-muted-foreground text-lg">
                Fill out the form below and our team will reach out within 48 hours.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">First Name *</label>
                  <Input value={form.firstName} onChange={e => update("firstName", e.target.value)} placeholder="John" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Last Name *</label>
                  <Input value={form.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Smith" required />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address *</label>
                <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="john@example.com" required />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Your City *</label>
                <Input value={form.city} onChange={e => update("city", e.target.value)} placeholder="e.g. Rome, Paris, Tokyo, Buenos Aires..." required />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">License Status</label>
                  <select
                    value={form.licenseStatus}
                    onChange={e => update("licenseStatus", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select...</option>
                    {LICENSE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Years of Experience</label>
                  <Input type="number" min="0" value={form.yearsExperience} onChange={e => update("yearsExperience", e.target.value)} placeholder="e.g. 5" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Languages Spoken</label>
                <Input value={form.languages} onChange={e => update("languages", e.target.value)} placeholder="e.g. English, Spanish, French" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Phone / WhatsApp</label>
                <Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+1 (555) 123-4567" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Tell us about yourself (optional)</label>
                <Textarea
                  value={form.message}
                  onChange={e => update("message", e.target.value)}
                  placeholder="Your experience, tour types, what makes your city special..."
                  rows={4}
                />
              </div>

              <Button type="submit" variant="hero" className="w-full text-base py-6 rounded-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Apply Now — Reserve Your City"}
                {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Your information is secure. We never share your data with third parties.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Trust / Why Join Early */}
      <section className="py-20 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
                  <Shield className="w-3 h-3" />
                  Why Join Early
                </div>
                <h3 className="font-display text-2xl font-bold text-secondary-foreground mb-6">
                  First Movers Get the Best Position
                </h3>
                <div className="space-y-3">
                  {TRUST_POINTS.map(point => (
                    <div key={point} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-secondary-foreground/80 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-secondary-foreground/5 border border-primary/10 rounded-2xl p-8"
              >
                <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">A Note From Our Founder</div>
                <blockquote className="font-display text-lg italic text-secondary-foreground/80 leading-relaxed mb-6">
                  "I've spent 35 years in tourism watching platforms take more and more from guides. We built Guides Directly to fix that — permanently. If you're a local expert ready to own your business, this is your platform."
                </blockquote>
                <div className="flex items-center gap-3">
                  <img src={logoImg} alt="Founder" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-display font-bold text-secondary-foreground text-sm">Michael Zlotnitsky</div>
                    <div className="text-secondary-foreground/60 text-xs">Founder, Guides Directly</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Own Your City?</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
            Early guide partners receive priority placement, featured visibility, and founding member status.
          </p>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: document.querySelector('form')?.offsetTop ?? 0, behavior: 'smooth' }); }}
            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-semibold px-8 py-4 rounded-full hover:opacity-90 transition-opacity"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default ApplyCityPilot;
