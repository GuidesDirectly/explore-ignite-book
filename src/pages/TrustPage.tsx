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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ─────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────── */
const trustBadges = [
  {
    icon: ShieldCheck,
    title: "Secure Uploads Verified",
    desc: "All files scanned and protected",
    color: "text-primary",
    bg: "bg-primary/5 border-primary/20",
  },
  {
    icon: Lock,
    title: "Encrypted Protection",
    desc: "Data secured in transit and storage",
    color: "text-primary",
    bg: "bg-primary/5 border-primary/20",
  },
  {
    icon: BadgeCheck,
    title: "Verified Professionals",
    desc: "Identity and credentials checked",
    color: "text-primary",
    bg: "bg-primary/5 border-primary/20",
  },
  {
    icon: Eye,
    title: "Privacy First",
    desc: "Your data is never sold or shared",
    color: "text-primary",
    bg: "bg-primary/5 border-primary/20",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    desc: "PCI-compliant processors only",
    color: "text-primary",
    bg: "bg-primary/5 border-primary/20",
  },
];

const securityFeatures = [
  {
    icon: Lock,
    title: "Encrypted Everywhere",
    desc: "Your information is protected with modern TLS encryption during transfer and AES-256 at rest in storage.",
  },
  {
    icon: BadgeCheck,
    title: "Strict Verification",
    desc: "Guides undergo credential and identity checks before approval. Licenses are reviewed by verification staff.",
  },
  {
    icon: ScanLine,
    title: "Malware-Protected Uploads",
    desc: "Every file is scanned by industry-standard antivirus detection before it reaches our storage system.",
  },
  {
    icon: Eye,
    title: "Privacy-First Design",
    desc: "We never sell your data. Sensitive documents are accessible only to authorized verification staff.",
  },
];

const uploadChecks = [
  "File type whitelist enforced (JPG, PNG, WEBP, PDF only)",
  "File size limits: 5 MB photos · 10 MB documents",
  "Filenames randomized — original name never stored",
  "Malware scan before storage write",
  "Private storage buckets — no public URLs",
  "Signed temporary access links with expiry",
];

const certItems = [
  "Data Protection",
  "Secure Authentication",
  "Encrypted Storage",
  "Malware-Scanned Uploads",
  "Role-Based Access Control",
];

const policyAllowed = {
  images: ["JPG", "PNG", "WEBP"],
  documents: ["PDF", "JPEG", "PNG"],
};

const policyProhibited = [
  "Executable files (.exe, .sh, .bat)",
  "Scripts or macros",
  "Compressed archives (.zip, .rar)",
  "Password-protected or encrypted files",
  "Software installers",
  "Unknown or unsupported formats",
];

const sizeLimits = [
  { type: "Profile photos", limit: "5 MB" },
  { type: "Portfolio images", limit: "5 MB" },
  { type: "Documents & certifications", limit: "10 MB" },
];

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */
const TrustPage = () => {
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
              <span className="text-primary text-sm font-semibold tracking-wide uppercase">Trust &amp; Security</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-primary-foreground mb-4">
              Your Safety Is Built Into<br />
              <span className="text-gradient-gold">Our Technology</span>
            </h1>
            <p className="text-primary-foreground/70 text-xl max-w-2xl mx-auto mb-6">
              Guides Directly is designed with enterprise-grade security from day one. Security isn't a feature — it's our foundation.
            </p>
            <div className="inline-block bg-primary/20 border border-primary/30 rounded-full px-6 py-2">
              <p className="text-primary-foreground/90 font-semibold text-sm">
                🛡 Your files are protected. Every upload is validated, scanned, encrypted, and securely stored.
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
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Security At Every Level</h2>
            <p className="text-muted-foreground">Five independent layers protecting travelers and guides.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-5xl mx-auto">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`flex flex-col items-center text-center p-5 rounded-2xl border ${badge.bg} shadow-card`}
              >
                <badge.icon className={`w-9 h-9 mb-3 ${badge.color}`} />
                <h3 className="font-display font-bold text-foreground text-sm mb-1">{badge.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{badge.desc}</p>
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
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">How We Protect You</h2>
            <p className="text-muted-foreground">Four pillars of platform-wide security.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {securityFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-background border border-border shadow-card"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-gold flex items-center justify-center mb-4">
                  <feat.icon className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{feat.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
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
            <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-2">File Upload Policy</p>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Upload Security &amp; File Safety</h2>
            <p className="text-muted-foreground">Every uploaded file passes automated multi-layer screening before storage.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Checks list */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-7 shadow-card"
            >
              <div className="flex items-center gap-3 mb-5">
                <FileCheck className="w-6 h-6 text-primary" />
                <h3 className="font-display font-bold text-foreground text-lg">Automated Safeguards</h3>
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

            {/* Allowed / Prohibited + Size Limits */}
            <div className="space-y-6">
              {/* Allowed types */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-primary/5 border border-primary/20 rounded-2xl p-6"
              >
                <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" /> Allowed File Types
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-foreground mb-1">Images</p>
                    {policyAllowed.images.map((t) => (
                      <p key={t} className="text-muted-foreground">{t}</p>
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Documents</p>
                    {policyAllowed.documents.map((t) => (
                      <p key={t} className="text-muted-foreground">{t}</p>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Size limits */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" /> Size Limits
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

              {/* Prohibited */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6"
              >
                <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" /> Prohibited Content
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
            {/* Certificate card */}
            <div className="relative bg-background border-2 border-primary/30 rounded-3xl p-8 shadow-[0_0_0_6px_hsl(var(--primary)/0.06),0_20px_60px_-10px_hsl(var(--primary)/0.15)] text-center overflow-hidden">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <ShieldCheck className="w-72 h-72 text-primary" />
              </div>

              {/* Top rule */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <ShieldCheck className="w-8 h-8 text-primary" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </div>

              <p className="text-primary font-body text-xs uppercase tracking-[0.25em] font-semibold mb-2">
                Guides Directly Security Certificate
              </p>
              <p className="text-muted-foreground text-sm mb-4">This certifies that</p>
              <h3 className="font-display text-2xl font-bold text-foreground mb-1">GUIDES DIRECTLY PLATFORM</h3>
              <p className="text-muted-foreground text-sm mb-6">meets modern industry standards for</p>

              <ul className="space-y-2 mb-6 text-left inline-block">
                {certItems.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-gradient-gold rounded-xl px-5 py-2 inline-block mb-6">
                <p className="font-display font-bold text-secondary text-sm tracking-wide">Security Status: VERIFIED</p>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <ServerCrash className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">Issued</p>
                  <p>February 2026</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Standard</p>
                  <p>SaaS Security Compliance Framework</p>
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
              Ready to Book With Confidence?
            </h2>
            <p className="text-primary-foreground/60 mb-6 max-w-xl mx-auto">
              Every booking is protected by the same enterprise-grade security that powers top travel platforms.
            </p>
            <a
              href="/home#meet-guides"
              className="inline-flex items-center gap-2 bg-gradient-gold text-secondary font-semibold px-8 py-3 rounded-xl shadow-warm hover:scale-105 transition-transform duration-200"
            >
              <ShieldCheck className="w-5 h-5" />
              Find a Verified Guide
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrustPage;
