import { useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Crown, Sparkles, Star, Check, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";

interface ActivationGateProps {
  userId: string;
  children: ReactNode;
}

interface GateState {
  status: "approved" | "pending" | "draft" | "rejected";
  activation_status: "active" | "inactive" | "suspended";
  suspension_reason: string | null;
  subscription_tier: string | null;
}

interface PlanRow {
  id: string;
  slug: string;
  name: string;
  price_monthly: number;
  features: any;
}

const TIER_ICONS: Record<string, any> = { founding: Star, pro: Sparkles, featured: Crown };

const PRICE_IDS: Record<string, string> = {
  founding: "price_1TGrIRC1U7SmvwepwpRmbWkU",
  pro: "price_1TGrLvC1U7SmvwepyB5krby7",
  featured: "price_1TGrOMC1U7Smvwep4HvHeBiF",
};

const ActivationGate = ({ userId, children }: ActivationGateProps) => {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<GateState | null>(null);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: profile }, { data: planRows }] = await Promise.all([
        supabase
          .from("guide_profiles")
          .select("status, activation_status, suspension_reason, subscription_tier")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("subscription_plans")
          .select("id, slug, name, price_monthly, features")
          .eq("is_active", true)
          .order("sort_order"),
      ]);
      if (profile) setState(profile as unknown as GateState);
      if (planRows) setPlans(planRows as unknown as PlanRow[]);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  const handleActivate = async (slug: string) => {
    setActivating(slug);
    try {
      const priceId = PRICE_IDS[slug];
      if (!priceId) throw new Error("Unknown plan");
      const { data: result, error } = await supabase.functions.invoke("guide-subscribe", {
        body: {
          guide_user_id: userId,
          price_id: priceId,
          success_url: `${window.location.origin}/guide-dashboard?activated=1`,
          cancel_url: `${window.location.origin}/guide-dashboard?activation=cancelled`,
        },
      });
      if (error) throw error;
      if (result?.free) {
        toast.success("Your profile is now live!");
        window.location.reload();
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to activate. Please try again.");
    } finally {
      setActivating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A1628' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  // Pass through if active, or if not yet approved (let dashboard handle pending/draft state)
  if (!state || state.activation_status === "active" || state.status !== "approved") {
    return <>{children}</>;
  }

  const isSuspendedNonPayment = state.activation_status === "suspended" && state.suspension_reason === "non_payment";
  const isSuspendedOther = state.activation_status === "suspended" && state.suspension_reason !== "non_payment";

  // Suspended for reasons other than non-payment → contact admin
  if (isSuspendedOther) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0A1628' }}>
        <div className="max-w-lg w-full rounded-2xl p-8 text-center" style={{ backgroundColor: '#1A2F50', border: '1px solid rgba(201,168,76,0.15)' }}>
          <Lock className="w-12 h-12 mx-auto mb-4 text-[#C9A84C]" />
          <h1 className="font-display text-2xl font-bold mb-3" style={{ color: '#F5F0E8' }}>Profile Suspended</h1>
          <p className="mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Your profile has been suspended. Please contact us to discuss reactivation.
          </p>
          <a
            href="mailto:michael@iguidetours.net"
            className="inline-block px-6 py-3 rounded-lg font-semibold"
            style={{ backgroundColor: '#C9A84C', color: '#0A1628' }}
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  // Inactive OR suspended for non-payment → show activation chooser (with self-reactivation)
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#0A1628' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          {isSuspendedNonPayment ? (
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#C9A84C]" />
          ) : (
            <Crown className="w-12 h-12 mx-auto mb-4 text-[#C9A84C]" />
          )}
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3" style={{ color: '#F5F0E8' }}>
            {isSuspendedNonPayment ? "Reactivate your profile" : "Activate your Guides Directly profile"}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {isSuspendedNonPayment
              ? "Your profile is currently hidden. Choose a plan below to restore visibility — instantly."
              : "Choose a plan to make your profile visible to travelers worldwide. Founding guides stay free forever."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const Icon = TIER_ICONS[plan.slug] || Star;
            const featuresArr: string[] = Array.isArray(plan.features) ? plan.features : [];
            const isFree = Number(plan.price_monthly) === 0;
            return (
              <div
                key={plan.id}
                className="rounded-2xl p-6 flex flex-col"
                style={{ backgroundColor: '#1A2F50', border: '1px solid rgba(201,168,76,0.15)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 text-[#C9A84C]" />
                  <h3 className="font-display text-xl font-bold" style={{ color: '#F5F0E8' }}>{plan.name}</h3>
                </div>
                <div className="mb-5">
                  <span className="font-display text-4xl font-bold" style={{ color: '#F5F0E8' }}>${Number(plan.price_monthly).toFixed(0)}</span>
                  <span className="text-sm ml-1" style={{ color: 'rgba(255,255,255,0.65)' }}>/month</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {featuresArr.length > 0 ? featuresArr.slice(0, 5).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      <Check className="w-4 h-4 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  )) : (
                    <li className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>—</li>
                  )}
                </ul>
                <Button
                  onClick={() => handleActivate(plan.slug)}
                  disabled={!!activating}
                  className="w-full font-semibold border-none hover:opacity-90"
                  style={{ backgroundColor: '#C9A84C', color: '#0A1628' }}
                >
                  {activating === plan.slug ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isFree ? "Activate Free" : `Subscribe — $${Number(plan.price_monthly).toFixed(0)}/mo`}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm mt-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Questions? Contact{" "}
          <a href="mailto:michael@iguidetours.net" className="text-[#C9A84C] hover:underline">
            michael@iguidetours.net
          </a>
        </p>
      </div>
    </div>
  );
};

export default ActivationGate;
