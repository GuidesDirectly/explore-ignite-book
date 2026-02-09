import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const InquirySection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    destination: "",
    groupSize: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.destination) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitted(true);
    toast.success("Tour inquiry submitted! We'll be in touch within 24 hours.");
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
              Thank You!
            </h2>
            <p style={{ color: "hsl(40, 33%, 80%)" }}>
              Your tour inquiry has been received. Our team will reach out within 24 hours to help plan your perfect trip.
            </p>
            <Button variant="hero" className="mt-8" onClick={() => setSubmitted(false)}>
              Submit Another Inquiry
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
              Start Your Journey
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6" style={{ color: "hsl(40, 33%, 97%)" }}>
              Book Your
              <br />
              <span className="text-gradient-gold">Dream Tour</span>
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "hsl(40, 33%, 80%)" }}>
              Fill out the form and our team will get back to you within 24 hours with a custom tour proposal. No commitment required — let's start planning!
            </p>
            <div className="space-y-4" style={{ color: "hsl(40, 33%, 75%)" }}>
              <p className="flex items-center gap-2">📧 michael@iguidetours.net</p>
              <p className="flex items-center gap-2">📞 (202) 243-8336</p>
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
                <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>Full Name *</label>
                <Input
                  placeholder="John Doe"
                  className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>Email *</label>
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
                <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>Phone</label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>Group Size</label>
                <Select onValueChange={(val) => setFormData({ ...formData, groupSize: val })}>
                  <SelectTrigger className="bg-secondary/50 border-primary/20 text-primary-foreground">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1–2 people</SelectItem>
                    <SelectItem value="3-5">3–5 people</SelectItem>
                    <SelectItem value="6-10">6–10 people</SelectItem>
                    <SelectItem value="10+">10+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>Destination *</label>
              <Select onValueChange={(val) => setFormData({ ...formData, destination: val })}>
                <SelectTrigger className="bg-secondary/50 border-primary/20 text-primary-foreground">
                  <SelectValue placeholder="Choose a destination" />
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
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>Message</label>
              <Textarea
                placeholder="Tell us about your ideal tour — dates, interests, special requests..."
                rows={4}
                className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <Button variant="hero" size="lg" className="w-full text-base py-6" type="submit">
              <Send className="w-5 h-5 mr-2" />
              Send Inquiry
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default InquirySection;
