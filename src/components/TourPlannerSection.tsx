import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, ArrowRight, ArrowLeft, RotateCcw,
  MapPin, Clock, DollarSign, Heart, User, Mail, Phone,
  CheckCircle2, Globe, RefreshCw, Users, Send,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

const PLAN_URL = `https://oegfwomloaihzwomwypx.supabase.co/functions/v1/plan-tour`;
const NOTIFY_URL = `https://oegfwomloaihzwomwypx.supabase.co/functions/v1/send-notification`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZ2Z3b21sb2FpaHp3b213eXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDM4NTAsImV4cCI6MjA4NjA3OTg1MH0.ZRn_9BDZZM5uTdqAxaeBcwckzjqXe7HQXUN8OZSbLNM";

const DEST_KEYS = ["dest_dc", "dest_nyc", "dest_niagara", "dest_toronto", "dest_boston", "dest_chicago"] as const;
const BUDGET_KEYS = ["budget_under500", "budget_500_1000", "budget_1000_2500", "budget_2500_5000", "budget_5000plus", "budget_flexible"] as const;
const EXP_KEYS = ["exp_history", "exp_food", "exp_art", "exp_architecture", "exp_nature", "exp_nightlife", "exp_shopping", "exp_photography", "exp_family", "exp_romantic", "exp_vip", "exp_wine"] as const;

const MAX_REFINEMENTS = 4;

interface GuideProfile {
  id: string;
  user_id: string;
  form_data: {
    firstName: string;
    lastName: string;
    biography: string;
    languages: string[];
    specializations: string[];
    tourTypes: string[];
    targetAudience: string[];
  };
}

const STEP_ICONS = [
  <User className="w-5 h-5" />,
  <MapPin className="w-5 h-5" />,
  <Clock className="w-5 h-5" />,
  <DollarSign className="w-5 h-5" />,
  <Heart className="w-5 h-5" />,
  <User className="w-5 h-5" />,
];

const TourPlannerSection = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  // Step 0: Contact info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Steps 1-5: Tour preferences
  const [destination, setDestination] = useState("");
  const [otherDestination, setOtherDestination] = useState("");
  const [days, setDays] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("");
  const [budget, setBudget] = useState("");
  const [experiences, setExperiences] = useState<string[]>([]);
  const [guideDescription, setGuideDescription] = useState("");

  // Results
  const [plan, setPlan] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [tourPlanId, setTourPlanId] = useState<string | null>(null);

  // Refinement
  const [refinementCount, setRefinementCount] = useState(0);
  const [refinementText, setRefinementText] = useState("");
  const [showRefinementInput, setShowRefinementInput] = useState(false);
  const [refinementHistory, setRefinementHistory] = useState<string[]>([]);

  // Final states
  const [showMaxRefinements, setShowMaxRefinements] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [guides, setGuides] = useState<GuideProfile[]>([]);
  const [emailSent, setEmailSent] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  const totalSteps = 6; // 0=contact, 1=dest, 2=duration, 3=budget, 4=experiences, 5=guide desc

  const stepTitles = [
    { title: t("planner.contactTitle"), subtitle: t("planner.contactSubtitle") },
    { title: t("planner.step1Title"), subtitle: t("planner.step1Subtitle") },
    { title: t("planner.step2Title"), subtitle: t("planner.step2Subtitle") },
    { title: t("planner.step3Title"), subtitle: t("planner.step3Subtitle") },
    { title: t("planner.step4Title"), subtitle: t("planner.step4Subtitle") },
    { title: t("planner.step5Title"), subtitle: t("planner.step5Subtitle") },
  ];

  const toggleExperience = (exp: string) => {
    setExperiences(prev =>
      prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]
    );
  };

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const canProceed = () => {
    switch (currentStep) {
      case 0: return firstName.trim().length > 0 && lastName.trim().length > 0 && isValidEmail(email);
      case 1: return destination !== "" && (destination !== "other" || otherDestination.trim().length > 0);
      case 2: return days.trim().length > 0;
      case 3: return budget !== "";
      case 4: return experiences.length > 0;
      case 5: return guideDescription.trim().length > 5;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      setError("");
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError("");
    }
  };

  const buildDescription = (refinement?: string) => {
    const dest = destination === "other" ? otherDestination : t(`planner.${destination}`);
    const expLabels = experiences.map(key => t(`planner.${key}`)).join(", ");
    const budgetLabel = t(`planner.${budget}`);
    let desc = `I want to visit ${dest} for ${days} days, spending about ${hoursPerDay || "flexible"} hours per day touring. My budget is ${budgetLabel}. I'm interested in: ${expLabels}. For my ideal guide: ${guideDescription}`;

    if (refinementHistory.length > 0 || refinement) {
      desc += "\n\n--- Previous plan and refinements ---\n";
      desc += `Previous plan:\n${plan}\n`;
      refinementHistory.forEach((r, i) => {
        desc += `\nRefinement ${i + 1}: ${r}`;
      });
      if (refinement) {
        desc += `\nRefinement ${refinementHistory.length + 1}: ${refinement}`;
      }
      desc += "\n\nPlease create a new improved plan accounting for all the refinement requests above.";
    }

    return desc;
  };

  const saveTourPlan = async (aiPlan?: string, refCount?: number, refHistory?: string[]) => {
    const dest = destination === "other" ? otherDestination : t(`planner.${destination}`);
    const data: Record<string, unknown> = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      destination: dest,
      days,
      hours_per_day: hoursPerDay || null,
      budget: t(`planner.${budget}`),
      experiences: experiences.map(key => t(`planner.${key}`)),
      guide_description: guideDescription,
    };

    if (aiPlan !== undefined) data.ai_plan = aiPlan;
    if (refCount !== undefined) data.refinement_count = refCount;
    if (refHistory !== undefined) data.refinement_history = refHistory;

    if (tourPlanId) {
      await supabase.from("tour_plans").update(data as any).eq("id", tourPlanId);
    } else {
      const { data: inserted } = await supabase.from("tour_plans").insert(data as any).select("id").single();
      if (inserted) setTourPlanId(inserted.id);
    }
  };

  const handleGenerate = async (refinement?: string) => {
    setError("");
    setPlan("");
    setIsGenerating(true);
    setShowRefinementInput(false);

    try {
      // Save to DB before AI processing (first time)
      if (!tourPlanId && !refinement) {
        await saveTourPlan();
      }

      const resp = await fetch(PLAN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ description: buildDescription(refinement) }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed (${resp.status})`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setPlan(accumulated);
              resultRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Update refinement tracking
      const newHistory = refinement ? [...refinementHistory, refinement] : refinementHistory;
      const newCount = refinement ? refinementCount + 1 : refinementCount;
      if (refinement) {
        setRefinementHistory(newHistory);
        setRefinementCount(newCount);
      }

      // Save plan to DB
      await saveTourPlan(accumulated, newCount, newHistory);

    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = () => {
    if (refinementCount >= MAX_REFINEMENTS) {
      setShowMaxRefinements(true);
      saveTourPlan(plan, refinementCount, refinementHistory);
      // Send notification
      sendAdminNotification();
      return;
    }
    setShowRefinementInput(true);
  };

  const handleSubmitRefinement = () => {
    if (refinementText.trim().length < 5) return;
    handleGenerate(refinementText.trim());
    setRefinementText("");
  };

  const handleSatisfied = async () => {
    // Send email to customer
    await sendCustomerEmail();
    setEmailSent(true);
    // Update status
    if (tourPlanId) {
      await supabase.from("tour_plans").update({ status: "completed" } as any).eq("id", tourPlanId);
    }
  };

  const handleMatchGuides = async () => {
    const { data } = await supabase
      .from("guide_profiles")
      .select("id, user_id, form_data")
      .eq("status", "approved")
      .limit(10);

    if (data) {
      setGuides(data as unknown as GuideProfile[]);
      setShowGuides(true);
    }
  };

  const sendCustomerEmail = async () => {
    try {
      await fetch(NOTIFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          type: "tour_plan",
          data: {
            customerEmail: email,
            customerName: `${firstName} ${lastName}`,
            plan,
          },
        }),
      });
    } catch (e) {
      console.error("Failed to send customer email:", e);
    }
  };

  const sendAdminNotification = async () => {
    try {
      await fetch(NOTIFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          type: "inquiry",
          data: {
            name: `${firstName} ${lastName}`,
            email,
            phone,
            destination: destination === "other" ? otherDestination : t(`planner.${destination}`),
            message: `AI Tour Plan customer reached max refinements. Plan ID: ${tourPlanId}`,
          },
        }),
      });
    } catch (e) {
      console.error("Failed to send admin notification:", e);
    }
  };

  const handleReset = () => {
    setPlan("");
    setCurrentStep(0);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setDestination("");
    setOtherDestination("");
    setDays("");
    setHoursPerDay("");
    setBudget("");
    setExperiences([]);
    setGuideDescription("");
    setError("");
    setTourPlanId(null);
    setRefinementCount(0);
    setRefinementText("");
    setRefinementHistory([]);
    setShowRefinementInput(false);
    setShowMaxRefinements(false);
    setShowGuides(false);
    setGuides([]);
    setEmailSent(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(40, 33%, 85%)" }}>
                  {t("planner.firstName")} *
                </label>
                <Input
                  placeholder={t("planner.firstNamePlaceholder")}
                  className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(40, 33%, 85%)" }}>
                  {t("planner.lastName")} *
                </label>
                <Input
                  placeholder={t("planner.lastNamePlaceholder")}
                  className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(40, 33%, 85%)" }}>
                {t("planner.emailLabel")} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={t("planner.emailPlaceholder")}
                  className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(40, 33%, 85%)" }}>
                {t("planner.phoneLabel")}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder={t("planner.phonePlaceholder")}
                  className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground pl-10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: "hsl(40, 33%, 60%)" }}>{t("planner.phoneOptional")}</p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DEST_KEYS.map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setDestination(key)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
                  destination === key
                    ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/20"
                    : "border-primary/10 bg-secondary/20 hover:border-primary/30"
                }`}
                style={{ color: destination === key ? undefined : "hsl(40, 33%, 80%)" }}
              >
                <MapPin className={`w-4 h-4 mb-1 ${destination === key ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-semibold block">{t(`planner.${key}`)}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setDestination("other")}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
                destination === "other"
                  ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/20"
                  : "border-primary/10 bg-secondary/20 hover:border-primary/30"
              }`}
              style={{ color: destination === "other" ? undefined : "hsl(40, 33%, 80%)" }}
            >
              <MapPin className={`w-4 h-4 mb-1 ${destination === "other" ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm font-semibold block">{t("planner.other")}</span>
            </button>
            {destination === "other" && (
              <div className="col-span-2 sm:col-span-3 mt-2">
                <Input
                  placeholder={t("planner.otherPlaceholder")}
                  className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground"
                  value={otherDestination}
                  onChange={(e) => setOtherDestination(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>
                {t("planner.howManyDays")}
              </label>
              <Input
                type="number"
                min="1"
                max="30"
                placeholder="e.g. 3"
                className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground text-lg"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>
                {t("planner.hoursPerDay")}
              </label>
              <Input
                type="number"
                min="1"
                max="16"
                placeholder="e.g. 6"
                className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground text-lg"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
              />
              <p className="text-xs mt-1" style={{ color: "hsl(40, 33%, 60%)" }}>{t("planner.hoursFlexible")}</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-2 gap-3">
            {BUDGET_KEYS.map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setBudget(key)}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:scale-[1.02] ${
                  budget === key
                    ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/20"
                    : "border-primary/10 bg-secondary/20 hover:border-primary/30"
                }`}
                style={{ color: budget === key ? undefined : "hsl(40, 33%, 80%)" }}
              >
                <span className="text-sm font-semibold">{t(`planner.${key}`)}</span>
              </button>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EXP_KEYS.map(key => (
              <button
                key={key}
                type="button"
                onClick={() => toggleExperience(key)}
                className={`p-3 rounded-xl border-2 text-center transition-all duration-200 hover:scale-[1.02] ${
                  experiences.includes(key)
                    ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/20"
                    : "border-primary/10 bg-secondary/20 hover:border-primary/30"
                }`}
                style={{ color: experiences.includes(key) ? undefined : "hsl(40, 33%, 80%)" }}
              >
                <span className="text-xs sm:text-sm font-semibold">{t(`planner.${key}`)}</span>
              </button>
            ))}
            <p className="col-span-2 sm:col-span-3 text-xs text-center mt-1" style={{ color: "hsl(40, 33%, 60%)" }}>
              {t("planner.selectAll")}
            </p>
          </div>
        );

      case 5:
        return (
          <div>
            <Textarea
              placeholder={t("planner.guidePlaceholder")}
              rows={5}
              className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground/60 resize-none text-base leading-relaxed"
              value={guideDescription}
              onChange={(e) => setGuideDescription(e.target.value)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="tour-planner" className="py-24 bg-gradient-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-semibold">{t("planner.badge")}</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: "hsl(40, 33%, 97%)" }}>
            {t("planner.title")}{" "}
            <span className="text-gradient-gold">{t("planner.titleGold")}</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "hsl(40, 33%, 80%)" }}>
            {t("planner.subtitle")}
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {/* === GUIDE MATCHING VIEW === */}
            {showGuides ? (
              <motion.div
                key="guides"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-8 border border-primary/10">
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-primary" />
                    <h3 className="font-display text-2xl font-bold" style={{ color: "hsl(40, 33%, 97%)" }}>
                      {t("planner.matchedGuides")}
                    </h3>
                  </div>
                  <p className="text-sm mb-6" style={{ color: "hsl(40, 33%, 75%)" }}>
                    {t("planner.matchedGuidesSubtitle")}
                  </p>

                  {guides.length === 0 ? (
                    <p style={{ color: "hsl(40, 33%, 70%)" }}>{t("planner.noGuidesAvailable")}</p>
                  ) : (
                    <div className="space-y-4">
                      {guides.map((guide) => {
                        const fd = guide.form_data;
                        const initials = `${fd.firstName?.[0] || ""}${fd.lastName?.[0] || ""}`;
                        return (
                          <div
                            key={guide.id}
                            className="bg-secondary/10 rounded-xl p-5 border border-primary/10 hover:border-primary/30 transition-all"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 rounded-xl bg-primary text-secondary font-display font-bold text-lg flex items-center justify-center flex-shrink-0">
                                {initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-display text-lg font-bold" style={{ color: "hsl(40, 33%, 95%)" }}>
                                  {fd.firstName} {fd.lastName}
                                </h4>
                                <div className="flex items-center gap-1.5 text-sm mb-2" style={{ color: "hsl(40, 33%, 70%)" }}>
                                  <Globe className="w-3.5 h-3.5 text-primary/70" />
                                  <span>{fd.languages?.join(", ")}</span>
                                </div>
                                {fd.biography && (
                                  <p className="text-sm mb-3" style={{ color: "hsl(40, 33%, 75%)" }}>
                                    {fd.biography.length > 150 ? fd.biography.slice(0, 150) + "…" : fd.biography}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-1.5">
                                  {fd.specializations?.slice(0, 4).map((spec) => (
                                    <Badge
                                      key={spec}
                                      variant="secondary"
                                      className="text-xs bg-primary/10 text-primary border-primary/20"
                                    >
                                      {spec}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-primary/30 text-primary hover:bg-primary/10"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t("planner.startOver")}
                </Button>
              </motion.div>

            /* === MAX REFINEMENTS REACHED === */
            ) : showMaxRefinements ? (
              <motion.div
                key="max-refinements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-8 border border-primary/10 text-center">
                  <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-2xl font-bold mb-3" style={{ color: "hsl(40, 33%, 97%)" }}>
                    {t("planner.inquirySaved")}
                  </h3>
                  <p className="text-base mb-2" style={{ color: "hsl(40, 33%, 80%)" }}>
                    {t("planner.inquirySavedMsg")}
                  </p>
                  <p className="text-sm" style={{ color: "hsl(40, 33%, 65%)" }}>
                    {t("planner.maxRefinementsReached")}
                  </p>
                </div>

                {plan && (
                  <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-8 border border-primary/10">
                    <h4 className="text-sm font-semibold text-primary mb-3">{t("planner.yourLatestPlan")}</h4>
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-primary prose-headings:font-display prose-strong:text-primary/90 prose-li:text-[hsl(40,33%,80%)]" style={{ color: "hsl(40, 33%, 80%)" }}>
                      <ReactMarkdown>{plan}</ReactMarkdown>
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-primary/30 text-primary hover:bg-primary/10"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t("planner.startOver")}
                </Button>
              </motion.div>

            /* === WIZARD STEPS === */
            ) : !plan && !isGenerating ? (
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-8 border border-primary/10">
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-8">
                    {stepTitles.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          i <= currentStep ? "bg-primary" : "bg-primary/15"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Step indicator */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {currentStep + 1} / {totalSteps}
                    </span>
                  </div>

                  {/* Step header */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {STEP_ICONS[currentStep]}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold" style={{ color: "hsl(40, 33%, 97%)" }}>
                        {stepTitles[currentStep].title}
                      </h3>
                      <p className="text-sm" style={{ color: "hsl(40, 33%, 65%)" }}>
                        {stepTitles[currentStep].subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Step content */}
                  <div className="mt-6 mb-8">
                    {renderStepContent()}
                  </div>

                  {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                  {/* Navigation */}
                  <div className="flex gap-3">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-primary/30 text-primary hover:bg-primary/10"
                        onClick={handleBack}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t("planner.back")}
                      </Button>
                    )}
                    <Button
                      variant="hero"
                      size="lg"
                      className="flex-1 text-base py-6"
                      onClick={handleNext}
                      disabled={!canProceed()}
                    >
                      {currentStep < totalSteps - 1 ? (
                        <>
                          {t("planner.next")}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          {t("planner.generate")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>

            /* === RESULTS VIEW === */
            ) : (
              <motion.div
                key="result"
                ref={resultRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {isGenerating && !plan && (
                  <div className="text-center py-12">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-lg" style={{ color: "hsl(40, 33%, 80%)" }}>
                      {t("planner.generating")}
                    </p>
                  </div>
                )}

                {plan && (
                  <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-8 border border-primary/10">
                    {isGenerating && (
                      <div className="flex items-center gap-2 mb-4 text-primary text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t("planner.stillGenerating")}</span>
                      </div>
                    )}
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-primary prose-headings:font-display prose-strong:text-primary/90 prose-li:text-[hsl(40,33%,80%)]" style={{ color: "hsl(40, 33%, 80%)" }}>
                      <ReactMarkdown>{plan}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {!isGenerating && plan && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Refinement counter */}
                    {refinementCount > 0 && (
                      <p className="text-xs text-center" style={{ color: "hsl(40, 33%, 60%)" }}>
                        {t("planner.refinementsUsed", { used: refinementCount, max: MAX_REFINEMENTS })}
                      </p>
                    )}

                    {/* Refinement input */}
                    {showRefinementInput && (
                      <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-6 border border-primary/10">
                        <label className="block text-sm font-semibold mb-2 text-primary">
                          {t("planner.whatToChange")}
                        </label>
                        <Textarea
                          placeholder={t("planner.refinePlaceholder")}
                          rows={3}
                          className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground/60 resize-none mb-3"
                          value={refinementText}
                          onChange={(e) => setRefinementText(e.target.value)}
                          autoFocus
                        />
                        <Button
                          variant="hero"
                          size="lg"
                          className="w-full"
                          onClick={handleSubmitRefinement}
                          disabled={refinementText.trim().length < 5}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          {t("planner.submitRefinement")}
                        </Button>
                      </div>
                    )}

                    {/* Action buttons */}
                    {!showRefinementInput && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        {!emailSent ? (
                          <>
                            <Button
                              variant="hero"
                              size="lg"
                              className="flex-1 text-base py-5"
                              onClick={handleSatisfied}
                            >
                              <CheckCircle2 className="w-5 h-5 mr-2" />
                              {t("planner.imSatisfied")}
                            </Button>
                            <Button
                              variant="outline"
                              size="lg"
                              className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
                              onClick={handleRefine}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              {t("planner.refinePlan")}
                            </Button>
                          </>
                        ) : (
                          <div className="w-full space-y-4">
                            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 text-center">
                              <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
                              <p className="font-semibold text-primary">{t("planner.planSentToEmail")}</p>
                              <p className="text-sm" style={{ color: "hsl(40, 33%, 70%)" }}>{t("planner.planSentToEmailSub")}</p>
                            </div>
                            <Button
                              variant="hero"
                              size="lg"
                              className="w-full text-base py-5"
                              onClick={handleMatchGuides}
                            >
                              <Users className="w-5 h-5 mr-2" />
                              {t("planner.matchMeWithGuides")}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Start over */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-primary/60 hover:text-primary hover:bg-primary/5"
                      onClick={handleReset}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      {t("planner.startOver")}
                    </Button>
                  </motion.div>
                )}

                {error && (
                  <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button variant="outline" onClick={handleReset} className="border-primary/30 text-primary">
                      {t("planner.tryAgain")}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default TourPlannerSection;
