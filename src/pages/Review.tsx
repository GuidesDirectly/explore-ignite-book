import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import logoImg from "@/assets/logo.jpg";

const GUIDE_USER_ID = "26477b85-de16-4946-935a-f6e238a0fd8d";

const Review = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rating === 0) {
      toast.error(t("review.required"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("reviews").insert({
      reviewer_name: name.trim(),
      reviewer_email: email.trim() || null,
      rating,
      comment: comment.trim() || null,
      guide_user_id: GUIDE_USER_ID,
    });
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-navy flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
          <h2 className="font-display text-3xl font-bold mb-4" style={{ color: "hsl(40, 33%, 97%)" }}>
            {t("review.thankYou")}
          </h2>
          <p className="text-lg mb-8" style={{ color: "hsl(40, 33%, 80%)" }}>
            {t("review.thankYouMsg")}
          </p>
          <div className="flex gap-1 justify-center mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-8 h-8 ${s <= rating ? "text-primary fill-primary" : "text-muted"}`} />
            ))}
          </div>
          <a href="/" className="text-primary underline hover:no-underline">
            {t("review.backHome")}
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-navy">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-3">
          <img src={logoImg} alt="iGuide Tours" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-display text-xl font-bold text-primary">iGuide Tours</span>
        </a>
        <LanguageSwitcher />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-semibold">{t("review.label")}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3" style={{ color: "hsl(40, 33%, 97%)" }}>
              {t("review.title")}
            </h1>
            <p className="text-lg" style={{ color: "hsl(40, 33%, 80%)" }}>
              {t("review.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card/10 backdrop-blur-sm rounded-2xl p-8 border border-primary/10 space-y-6">
            {/* Star Rating */}
            <div className="text-center">
              <label className="block text-sm font-medium mb-3" style={{ color: "hsl(40, 33%, 85%)" }}>
                {t("review.yourRating")} *
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoveredStar(s)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        s <= (hoveredStar || rating)
                          ? "text-primary fill-primary"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-primary text-sm mt-2 font-medium">
                  {rating}/5
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>
                {t("review.name")} *
              </label>
              <Input
                placeholder="John Doe"
                className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>
                {t("review.email")}
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>
                {t("review.comment")}
              </label>
              <Textarea
                placeholder={t("review.commentPlaceholder")}
                rows={4}
                className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground resize-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <Button variant="hero" size="lg" className="w-full text-base py-6" type="submit" disabled={loading}>
              <Star className="w-5 h-5 mr-2" />
              {loading ? "..." : t("review.submit")}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Review;
