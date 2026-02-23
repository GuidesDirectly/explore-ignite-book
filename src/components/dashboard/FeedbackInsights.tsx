import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, TrendingUp, TrendingDown, Minus,
  ThumbsUp, ThumbsDown, AlertTriangle, Star, BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { trackFeedbackViewed } from "@/lib/analytics";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Theme {
  theme: string;
  count: number;
  sentiment: "positive" | "neutral" | "negative";
  examples: string[];
}

interface Recommendation {
  priority: "high" | "medium" | "low";
  action: string;
  impact: string;
}

interface FeedbackAnalysis {
  summary: string;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  themes: Theme[];
  recommendations: Recommendation[];
  strengths?: string[];
  improvementAreas?: string[];
  totalReviews: number;
  avgRating: number;
  analyzedAt?: string;
}

const SentimentBar = ({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) => {
  const total = positive + neutral + negative;
  if (total === 0) return null;
  return (
    <div className="w-full h-3 rounded-full overflow-hidden flex bg-muted">
      <div className="bg-primary h-full transition-all" style={{ width: `${positive}%` }} />
      <div className="bg-accent h-full transition-all" style={{ width: `${neutral}%` }} />
      <div className="bg-destructive h-full transition-all" style={{ width: `${negative}%` }} />
    </div>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-accent/50 text-accent-foreground border-accent/30",
    low: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={`text-xs ${colors[priority] || colors.low}`}>
      {priority}
    </Badge>
  );
};

const FeedbackInsights = ({ userId }: { userId: string }) => {
  const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/analyze-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ guideUserId: userId }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Analysis failed");
      }

      const data = await resp.json();
      setAnalysis(data);
      trackFeedbackViewed(userId);
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze feedback");
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) {
    return (
      <section className="bg-card rounded-2xl border border-border/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Feedback Insights
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Get AI-powered analysis of your traveler reviews — sentiment trends, recurring themes, and actionable recommendations to improve your tours.
        </p>
        <Button onClick={fetchAnalysis} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
          {loading ? "Analyzing Reviews..." : "Analyze My Reviews"}
        </Button>
      </section>
    );
  }

  return (
    <section className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Feedback Insights
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {analysis.totalReviews} reviews analyzed
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchAnalysis} disabled={loading}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-primary fill-primary" />
          <span className="font-semibold text-foreground">
            {analysis.avgRating}/10 Average Rating
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{analysis.summary}</p>
      </div>

      {/* Sentiment */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Sentiment Breakdown</h3>
        <SentimentBar {...analysis.sentimentBreakdown} />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3 text-primary" /> Positive {analysis.sentimentBreakdown.positive}%
          </span>
          <span className="flex items-center gap-1">
            <Minus className="w-3 h-3" /> Neutral {analysis.sentimentBreakdown.neutral}%
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown className="w-3 h-3 text-destructive" /> Negative {analysis.sentimentBreakdown.negative}%
          </span>
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {analysis.strengths && analysis.strengths.length > 0 && (
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Strengths
            </h3>
            <ul className="space-y-1">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {analysis.improvementAreas && analysis.improvementAreas.length > 0 && (
          <div className="rounded-xl border border-destructive/10 bg-destructive/5 p-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1 mb-2">
              <TrendingDown className="w-4 h-4 text-destructive" /> Areas to Improve
            </h3>
            <ul className="space-y-1">
              {analysis.improvementAreas.map((a, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                  <span className="text-destructive mt-0.5">•</span> {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Themes */}
      {analysis.themes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recurring Themes</h3>
          <div className="space-y-2">
            {analysis.themes.map((theme, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div className="flex items-center gap-2">
                  {theme.sentiment === "positive" ? (
                    <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                  ) : theme.sentiment === "negative" ? (
                    <ThumbsDown className="w-3.5 h-3.5 text-destructive" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">{theme.theme}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{theme.count}x mentioned</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1 mb-3">
            <AlertTriangle className="w-4 h-4 text-accent-foreground" /> Recommendations
          </h3>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className="rounded-lg border border-border/50 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground">{rec.action}</span>
                  <PriorityBadge priority={rec.priority} />
                </div>
                <p className="text-xs text-muted-foreground">{rec.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default FeedbackInsights;
