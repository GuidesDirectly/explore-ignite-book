import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle, MapPin, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import logoImg from "@/assets/logo.jpg";
import { reviewSchema } from "@/lib/formSchemas";

const GUIDE_USER_ID = "26477b85-de16-4946-935a-f6e238a0fd8d";
const GOOGLE_REVIEW_URL = "https://g.page/r/CdOtbvUwpEGLEBI/review";

type Step = "rating" | "google-redirect" | "review-form" | "submitted";

const Review = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("rating");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleScoreSelect = (value: number) => {
    setScore(value);
  };

  const handleScoreContinue = () => {
    if (score === null) {
      toast.error(t("review.required", "Please select a rating"));
      return;
    }
    if (score >= 9) {
      setStep("google-redirect");
    } else {
      setStep("review-form");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = reviewSchema.safeParse({ name, email, comment, score });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast.error(t("review.required", "Please fill in required fields"));
      return;
    }

    setLoading(true);
    const starRating = Math.max(1, Math.round(result.data.score / 2));
    const { data: insertedData, error } = await supabase.from("reviews").insert({
      reviewer_name: result.data.name,
      reviewer_email: result.data.email || null,
      rating: starRating,
      comment: result.data.comment || null,
      guide_user_id: GUIDE_USER_ID,
    }).select("id").single();
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setStep("submitted");
    supabase.functions.invoke("send-notification", {
      body: {
        type: "review",
        data: {
          reviewer_name: result.data.name,
          reviewer_email: result.data.email || null,
          rating: starRating,
          comment: result.data.comment || null,
        },
      },
    }).catch(console.error);
    if (insertedData?.id && result.data.comment) {
      supabase.functions.invoke("translate-content", {
        body: {
          table: "reviews",
          record_id: insertedData.id,
          fields: ["comment", "reviewer_name"],
        },
      }).catch(console.error);
    }
  };

  const getScoreLabel = (value: number) => {
    if (value <= 2) return "😞";
    if (value <= 4) return "😐";
    if (value <= 6) return "🙂";
    if (value <= 8) return "😊";
    return "🤩";
  };

  const getScoreColor = (value: number, selected: number | null) => {
    if (selected === null) return "border-border bg-accent text-muted-foreground";
    if (value !== selected) return "border-border/50 bg-accent/50 text-muted-foreground/50";
    if (value <= 3) return "border-destructive bg-destructive/10 text-destructive ring-2 ring-destructive/30";
    if (value <= 6) return "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 ring-2 ring-yellow-500/30";
    if (value <= 8) return "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30";
    return "border-primary bg-primary/10 text-primary ring-2 ring-primary/30";
  };

  const fieldError = (field: string) =>
    errors[field] ? <p className="text-destructive text-xs mt-1">{errors[field]}</p> : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <a href="/" className="flex items-center gap-3">
          <img src={logoImg} alt="iGuide Tours" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-display text-xl font-bold text-primary">iGuide Tours</span>
        </a>
        <LanguageSwitcher />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-lg">
        <AnimatePresence mode="wait">
          {step === "rating" && (
            <motion.div
              key="rating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-primary text-sm font-semibold">{t("review.label", "Share Your Experience")}</span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-3 text-foreground">
                  {t("review.npsQuestion", "How did you like our service?")}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t("review.npsSubtitle", "Rate your experience from 1 to 10")}
                </p>
              </div>

              <div className="bg-card rounded-2xl p-8 border border-border shadow-card">
                <div className="grid grid-cols-5 gap-3 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleScoreSelect(value)}
                      className={`relative flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${getScoreColor(value, score)}`}
                    >
                      <span className="text-2xl font-bold">{value}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between px-1 mb-6">
                  <span className="text-xs text-muted-foreground">
                    {t("review.notLikely", "Not great")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("review.veryLikely", "Excellent!")}
                  </span>
                </div>

                {score !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-center mb-6"
                  >
                    <span className="text-4xl">{getScoreLabel(score)}</span>
                    <p className="text-sm mt-2 text-muted-foreground">
                      {t("review.youSelected", "You selected")} <strong className="text-primary">{score}/10</strong>
                    </p>
                  </motion.div>
                )}

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full text-base py-6"
                  onClick={handleScoreContinue}
                  disabled={score === null}
                >
                  {t("review.continue", "Continue")}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "google-redirect" && (
            <motion.div
              key="google"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="bg-card rounded-2xl p-10 border border-border shadow-card">
                <span className="text-6xl mb-6 block">🎉</span>
                <h2 className="font-display text-3xl font-bold mb-4 text-foreground">
                  {t("review.amazingTitle", "We're thrilled you loved it!")}
                </h2>
                <p className="text-lg mb-8 text-muted-foreground">
                  {t("review.googleAsk", "Would you mind sharing your experience on Google? It helps other travelers find us!")}
                </p>

                <a
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity mb-4 w-full justify-center"
                >
                  <ExternalLink className="w-5 h-5" />
                  {t("review.leaveGoogleReview", "Leave a Google Review")}
                </a>

                <button
                  onClick={() => setStep("review-form")}
                  className="block w-full text-sm mt-4 underline hover:no-underline text-muted-foreground"
                >
                  {t("review.orLeaveHere", "Or leave a review here instead")}
                </button>
              </div>
            </motion.div>
          )}

          {step === "review-form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 text-foreground">
                  {t("review.tellUsMore", "Tell us more about your experience")}
                </h2>
                <p className="text-muted-foreground">
                  {t("review.feedbackHelps", "Your feedback helps us improve our tours")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 border border-border shadow-card space-y-6">
                {/* Score badge */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
                    <span className="text-lg">{getScoreLabel(score!)}</span>
                    <span className="text-primary font-semibold">{score}/10</span>
                    <button
                      type="button"
                      onClick={() => setStep("rating")}
                      className="text-xs underline text-muted-foreground ml-1"
                    >
                      {t("review.change", "Change")}
                    </button>
                  </span>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    {t("review.name", "Your Name")} *
                  </label>
                  <Input
                    placeholder="John Doe"
                    className="bg-accent border-border text-foreground placeholder:text-muted-foreground"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                  {fieldError("name")}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    {t("review.email", "Email (optional)")}
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    className="bg-accent border-border text-foreground placeholder:text-muted-foreground"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                  />
                  {fieldError("email")}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    {t("review.comment", "Your Review")}
                  </label>
                  <Textarea
                    placeholder={t("review.commentPlaceholder", "Tell us about your experience...")}
                    rows={4}
                    className="bg-accent border-border text-foreground placeholder:text-muted-foreground resize-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={2000}
                  />
                  {fieldError("comment")}
                </div>

                <Button variant="hero" size="lg" className="w-full text-base py-6" type="submit" disabled={loading}>
                  <Star className="w-5 h-5 mr-2" />
                  {loading ? "..." : t("review.submit", "Submit Review")}
                </Button>
              </form>
            </motion.div>
          )}

          {step === "submitted" && (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full text-center mx-auto"
            >
              <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
              <h2 className="font-display text-3xl font-bold mb-4 text-foreground">
                {t("review.thankYou", "Thank You!")}
              </h2>
              <p className="text-lg mb-8 text-muted-foreground">
                {t("review.thankYouMsg", "Your feedback means the world to us.")}
              </p>
              <a href="/" className="text-primary underline hover:no-underline">
                {t("review.backHome", "Back to Home")}
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Review;
