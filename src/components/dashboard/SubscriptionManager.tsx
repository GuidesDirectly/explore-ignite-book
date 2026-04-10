import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Crown, Sparkles, Star, Check } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface SubscriptionManagerProps {
  userId: string;
}

interface SubscriptionData {
  subscription_tier: string;
  subscription_status: string;
  subscription_current_period_end: string | null;
}

const PRICE_IDS = {
  founding: "price_1TGrIRC1U7SmvwepwpRmbWkU",
  pro: "price_1TGrLvC1U7SmvwepyB5krby7",
  featured: "price_1TGrOMC1U7Smvwep4HvHeBiF",
};

const PLANS = [
  {
    tier: "founding" as const,
    name: "Founding Guide",
    price: "$0",
    period: "/month",
    icon: Star,
    features: [
      "Basic profile listing",
      "Direct messaging",
      "City & language search visibility",
      "Free forever for founding guides",
    ],
  },
  {
    tier: "pro" as const,
    name: "Pro Guide",
    price: "$29",
    period: "/month",
    icon: Sparkles,
    features: [
      "Everything in Founding",
      "AI Content Co-Pilot (21 languages)",
      "Priority placement in search",
      "Video embed on profile",
      "Analytics dashboard",
    ],
  },
  {
    tier: "featured" as const,
    name: "Featured Guide",
    price: "$59",
    period: "/month",
    icon: Crown,
    features: [
      "Everything in Pro",
      "Homepage featuring",
      "Hotel concierge referrals",
      "Verified badge upgrade",
      "Priority support",
    ],
  },
];

const TIER_ORDER = { founding: 0, pro: 1, featured: 2 };

const SubscriptionManager = ({ userId }: SubscriptionManagerProps) => {
  const { t } = useTranslation();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data: profile } = await supabase
        .from("guide_profiles")
        .select("subscription_tier, subscription_status, subscription_current_period_end")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile) {
        setData(profile as unknown as SubscriptionData);
      }
      setLoading(false);
    };
    fetch();
  }, [userId]);

  const handleUpgrade = async (tier: "pro" | "featured") => {
    setUpgrading(tier);
    try {
      const priceId = PRICE_IDS[tier];
      const { data: result, error } = await supabase.functions.invoke("guide-subscribe", {
        body: {
          guide_user_id: userId,
          price_id: priceId,
          success_url: `${window.location.origin}/guide-dashboard?subscription=success`,
          cancel_url: `${window.location.origin}/guide-dashboard?subscription=cancelled`,
        },
      });

      if (error) throw error;
      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e: any) {
      console.error("Subscription error:", e);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <section className="rounded-2xl p-6" style={{ backgroundColor: '#1A2F50', border: '1px solid rgba(201,168,76,0.15)' }}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#C9A84C]" />
        </div>
      </section>
    );
  }

  const currentTier = data?.subscription_tier || "founding";
  const currentStatus = data?.subscription_status || "active";
  const periodEnd = data?.subscription_current_period_end;

  const tierLabel = currentTier === "featured" ? "Featured Guide" : currentTier === "pro" ? "Pro Guide" : "Founding Guide";
  const statusColor = currentStatus === "active" ? "bg-primary/10 text-primary" : currentStatus === "past_due" ? "bg-yellow-500/10 text-yellow-600" : "bg-destructive/10 text-destructive";

  return (
    <section className="rounded-2xl p-6" style={{ backgroundColor: '#1A2F50', border: '1px solid rgba(201,168,76,0.15)' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold flex items-center gap-2" style={{ color: '#F5F0E8' }}>
          <Crown className="w-5 h-5 text-[#C9A84C]" />
          {t("guideDashboard.subscription", "Subscription")}
        </h2>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${statusColor}`}>{tierLabel}</Badge>
          <Badge variant="outline" className="text-xs capitalize border-[#C9A84C]/30 text-[#C9A84C]">{currentStatus}</Badge>
        </div>
      </div>

      {periodEnd && currentTier !== "founding" && (
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Next billing date: {new Date(periodEnd).toLocaleDateString()}
        </p>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = currentTier === plan.tier && currentStatus === "active";
          const currentTierOrder = TIER_ORDER[currentTier as keyof typeof TIER_ORDER] ?? 0;
          const planTierOrder = TIER_ORDER[plan.tier];
          const isDowngrade = planTierOrder < currentTierOrder;
          const isUpgrade = planTierOrder > currentTierOrder;

          return (
            <div
              key={plan.tier}
              className="rounded-xl p-5 flex flex-col"
              style={{
                backgroundColor: isCurrent ? 'rgba(201,168,76,0.08)' : 'transparent',
                border: isCurrent ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(201,168,76,0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${isCurrent ? "text-[#C9A84C]" : ""}`} style={isCurrent ? undefined : { color: 'rgba(255,255,255,0.65)' }} />
                <h3 className="font-display font-bold" style={{ color: '#F5F0E8' }}>{plan.name}</h3>
              </div>

              <div className="mb-4">
                <span className="font-display text-3xl font-bold" style={{ color: '#F5F0E8' }}>{plan.price}</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{plan.period}</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    <Check className="w-4 h-4 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button disabled variant="outline" className="w-full">
                  Current Plan
                </Button>
              ) : isUpgrade ? (
                <Button
                  onClick={() => handleUpgrade(plan.tier as "pro" | "featured")}
                  disabled={!!upgrading}
                  className="w-full font-semibold border-none hover:opacity-90"
                  style={{ backgroundColor: '#C9A84C', color: '#0A1628' }}
                >
                  {upgrading === plan.tier ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Upgrade to {plan.name.split(" ")[0]}
                </Button>
              ) : isDowngrade ? (
                <Button disabled variant="outline" className="w-full text-muted-foreground">
                  {plan.tier === "founding" ? "Free Tier" : "Downgrade"}
                </Button>
              ) : (
                <Button disabled variant="outline" className="w-full">
                  Current Plan
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Fallback contact */}
      <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.65)' }}>
        Having billing issues? Contact us at{" "}
        <a href="mailto:michael@iguidetours.net" className="text-[#C9A84C] hover:underline">
          michael@iguidetours.net
        </a>{" "}
        and we will manually activate your plan.
      </p>
    </section>
  );
};

export default SubscriptionManager;
