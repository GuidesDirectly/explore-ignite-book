import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, DollarSign, Link2, ShieldCheck, Sparkles, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const NAVY = "#0A1628";
const NAVY_LIFT = "#0F1E33";

const values = [
  {
    icon: Users,
    title: "Guides First",
    desc: "Every decision starts with what's best for professional guides.",
  },
  {
    icon: DollarSign,
    title: "Zero Commission",
    desc: "Guides keep 100% of what travelers pay them.",
  },
  {
    icon: Link2,
    title: "Direct Connection",
    desc: "No intermediaries between guides and travelers.",
  },
  {
    icon: ShieldCheck,
    title: "Licensed Professionals Only",
    desc: "Every guide is verified and credentialed.",
  },
  {
    icon: Sparkles,
    title: "Authentic Experiences",
    desc: "Real local expertise, not algorithmic recommendations.",
  },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white" style={{ background: NAVY }}>
      <SEO
        title="About Guides Directly — A platform built by a guide, for guides"
        description="GuidesDirectly is a zero-commission platform connecting travelers directly with licensed local guides. Founded by Michael Zlotnitsky, a 35-year DC tour guide."
        canonical="/about"
      />
      <Navbar />

      <main className="pt-[72px]">
        {/* HERO */}
        <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 relative">
            <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
              <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-4">
                About Us
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                About <span className="text-gradient-gold">Guides Directly</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/70 leading-relaxed">
                A platform built by a guide, for guides.
              </p>
            </motion.div>
          </div>
        </section>

        {/* OUR MISSION */}
        <section className="pt-12 pb-20 md:pt-16 md:pb-24" style={{ background: NAVY_LIFT }}>
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
              <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
                Our Mission
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-8">
                Travelers and guides, directly connected.
              </h2>
              <div className="space-y-5 text-lg text-white/70 leading-relaxed">
                <p>
                  We believe travelers deserve to meet the real experts — the licensed,
                  passionate, knowledgeable local guides who bring destinations to life.
                </p>
                <p>
                  And we believe guides deserve to keep every dollar they earn.
                  GuidesDirectly exists to make both possible.
                </p>
              </div>
              <div className="mt-10 inline-flex flex-wrap justify-center gap-3">
                {["Zero Commission", "Direct Connection", "Authentic Experiences"].map((tag) => (
                  <span
                    key={tag}
                    className="px-5 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-display font-semibold text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* PROBLEM WE SOLVE */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="max-w-3xl mx-auto">
              <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3 text-center">
                The Problem We Solve
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-8 text-center">
                The commission economy is broken.
              </h2>
              <div className="space-y-5 text-lg text-white/70 leading-relaxed">
                <p>
                  Major booking platforms charge professional guides 20–30% commission on
                  every booking. That's not a small fee — it's a fundamental tax on
                  expertise that took decades to build.
                </p>
                <p>
                  Worse, those platforms own the client relationship. The traveler
                  belongs to the platform, not the guide. Reviews, repeat bookings, and
                  referrals all flow back into a system designed to keep guides
                  interchangeable and replaceable.
                </p>
                <p>
                  This commoditizes professional, licensed guides and pushes them to
                  compete on price instead of craft.
                </p>
                <p className="text-white font-semibold text-xl pt-2">
                  GuidesDirectly eliminates that extraction entirely.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FOUNDER */}
        <section className="py-20 md:py-24" style={{ background: NAVY_LIFT }}>
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[auto,1fr] gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
              <motion.div {...fadeUp} className="flex justify-center lg:justify-start">
                <div className="relative">
                  <div className="w-52 h-52 md:w-64 md:h-64 rounded-full bg-gradient-gold flex items-center justify-center shadow-warm">
                    <span className="font-display text-7xl md:text-8xl font-bold text-secondary">
                      MZ
                    </span>
                  </div>
                  <div
                    className="absolute -bottom-2 -right-2 border border-primary/40 rounded-full px-4 py-2 shadow-lg"
                    style={{ background: NAVY }}
                  >
                    <span className="text-primary font-display text-xs font-semibold uppercase tracking-wider">
                      Founder
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div {...fadeUp}>
                <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
                  Meet the Founder
                </p>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
                  Michael Zlotnitsky
                </h2>
                <p className="text-primary font-display text-lg mb-6">
                  Licensed DC Tour Guide & Architectural Historian
                </p>
                <div className="space-y-4 text-white/70 text-lg leading-relaxed">
                  <p>
                    Michael has spent 35 years guiding visitors through Washington DC —
                    its monuments, its neighborhoods, its architecture, and the stories
                    that built the capital.
                  </p>
                  <p>
                    As Founder & President of iGuide Tours, he built a reputation the
                    old-fashioned way: one tour, one client, one referral at a time.
                  </p>
                  <p>
                    He built GuidesDirectly because he lived the problem firsthand —
                    watching booking platforms take commission from professional guides
                    who had spent entire careers building their expertise and
                    reputation. He knew there had to be a better way.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* OUR VALUES */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center mb-14">
              <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
                Our Values
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
                What we stand for.
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="p-7 rounded-2xl border border-white/10 shadow-card hover:border-primary/40 transition-colors"
                  style={{ background: NAVY_LIFT }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center mb-5">
                    <v.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">
                    {v.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WHERE WE ARE TODAY */}
        <section className="py-20 md:py-24" style={{ background: NAVY_LIFT }}>
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
              <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
                Where We Are Today
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-8">
                Live and growing.
              </h2>
              <p className="text-lg text-white/70 mb-10 leading-relaxed">
                The platform is live in Washington DC, Chicago, and Los Angeles — and
                expanding to more cities as professional guides join.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mb-10">
                {["Washington DC", "Chicago", "Los Angeles"].map((city) => (
                  <div
                    key={city}
                    className="p-5 rounded-xl border border-white/10 flex items-center justify-center gap-2"
                    style={{ background: NAVY }}
                  >
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-display font-semibold text-white">
                      {city}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-primary/10 border border-primary/30 p-8 text-left">
                <p className="text-primary font-body text-xs uppercase tracking-[0.2em] font-semibold mb-2">
                  Founding Guide Program
                </p>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
                  50 spots nationally. Free through end of 2026.
                </h3>
                <p className="text-white/70 leading-relaxed">
                  Our Founding Guide program is open to licensed professionals who want
                  to shape the platform from the ground up. No subscription, no
                  commission, no catch — through the end of 2026.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FOOTER CTA */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
                Ready to connect directly?
              </h2>
              <p className="text-lg text-white/70 mb-10">
                Whether you're planning a trip or building your guiding career, the
                next step is one click away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="hero"
                  onClick={() => navigate("/guides")}
                  className="min-w-[200px]"
                >
                  Find a Guide
                </Button>
                <Button
                  size="lg"
                  variant="heroOutline"
                  onClick={() => navigate("/guide-register")}
                  className="min-w-[200px]"
                >
                  Join as a Founding Guide
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
