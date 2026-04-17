import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Users, Clock, AlertTriangle, Send, Crown, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useFoundingProgram } from "@/hooks/useFoundingProgram";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import FoundingGuideBadge from "@/components/FoundingGuideBadge";

interface FunnelGuide {
  user_id: string;
  form_data: any;
  activation_status: string;
  subscription_tier: string | null;
  subscription_expires_at: string | null;
  payment_reminder_count: number;
  updated_at: string;
}

const ActivationFunnel = () => {
  const { data: foundingProgram } = useFoundingProgram();
  const [loading, setLoading] = useState(true);
  const [inactive, setInactive] = useState<FunnelGuide[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<FunnelGuide[]>([]);
  const [activeFreeCount, setActiveFreeCount] = useState(0);
  const [activeProCount, setActiveProCount] = useState(0);
  const [activeFeaturedCount, setActiveFeaturedCount] = useState(0);
  const [sending, setSending] = useState<string | null>(null);
  const [foundingGuides, setFoundingGuides] = useState<FunnelGuide[]>([]);
  const [foundingOpen, setFoundingOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const [inactiveRes, expRes, freeRes, proRes, featRes] = await Promise.all([
      supabase
        .from("guide_profiles")
        .select("user_id, form_data, activation_status, subscription_tier, subscription_expires_at, payment_reminder_count, updated_at")
        .eq("status", "approved")
        .neq("activation_status", "active")
        .order("updated_at", { ascending: false }),
      supabase
        .from("guide_profiles")
        .select("user_id, form_data, activation_status, subscription_tier, subscription_expires_at, payment_reminder_count, updated_at")
        .eq("activation_status", "active")
        .in("subscription_tier", ["pro", "featured"])
        .not("subscription_expires_at", "is", null)
        .lte("subscription_expires_at", sevenDays)
        .gte("subscription_expires_at", now),
      supabase.from("guide_profiles").select("user_id", { count: "exact", head: true }).eq("activation_status", "active").eq("subscription_tier", "founding"),
      supabase.from("guide_profiles").select("user_id", { count: "exact", head: true }).eq("activation_status", "active").eq("subscription_tier", "pro"),
      supabase.from("guide_profiles").select("user_id", { count: "exact", head: true }).eq("activation_status", "active").eq("subscription_tier", "featured"),
    ]);

    setInactive((inactiveRes.data as any[]) || []);
    setExpiringSoon((expRes.data as any[]) || []);
    setActiveFreeCount(freeRes.count || 0);
    setActiveProCount(proRes.count || 0);
    setActiveFeaturedCount(featRes.count || 0);

    // Founding guides list (by plan UUID, any activation status)
    if (foundingProgram?.foundingPlanId) {
      const { data: founders } = await supabase
        .from("guide_profiles")
        .select("user_id, form_data, activation_status, subscription_tier, subscription_expires_at, payment_reminder_count, updated_at")
        .eq("subscription_plan_id", foundingProgram.foundingPlanId)
        .order("updated_at", { ascending: false });
      setFoundingGuides((founders as any[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => { load(); }, [foundingProgram?.foundingPlanId]);

  const triggerCron = async () => {
    setSending("cron");
    try {
      const { error } = await supabase.functions.invoke("guide-activation-reminders", { body: {} });
      if (error) throw error;
      toast.success("Reminder sweep triggered");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    } finally {
      setSending(null);
    }
  };

  const sendOneReminder = async (guide: FunnelGuide) => {
    setSending(guide.user_id);
    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(guide.user_id);
      // Note: admin.getUserById from client requires service_role — skip and call edge fn instead
      // Use a simple invoke that the daily cron uses
      const fd = guide.form_data || {};
      const name = `${fd.firstName || ""} ${fd.lastName || ""}`.trim() || "Guide";
      const email = fd.email;
      if (!email) throw new Error("No email on profile");
      const { error } = await supabase.functions.invoke("send-notification", {
        body: { type: "activation_reminder", data: { guideName: name, guideEmail: email } },
      });
      if (error) throw error;
      toast.success(`Reminder sent to ${name}`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to send");
    } finally {
      setSending(null);
    }
  };

  const mrr = activeProCount * 29 + activeFeaturedCount * 59;
  const totalActive = activeFreeCount + activeProCount + activeFeaturedCount;

  if (loading) {
    return (
      <div className="rounded-2xl p-6 flex items-center justify-center" style={{ backgroundColor: '#1A2F50' }}>
        <Loader2 className="w-6 h-6 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <section className="rounded-2xl p-6 space-y-6" style={{ backgroundColor: '#1A2F50', border: '1px solid rgba(201,168,76,0.15)' }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold flex items-center gap-2" style={{ color: '#F5F0E8' }}>
          <TrendingUp className="w-5 h-5 text-[#C9A84C]" />
          Activation Funnel
        </h2>
        <Button
          onClick={triggerCron}
          disabled={sending === "cron"}
          variant="outline"
          className="border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10"
        >
          {sending === "cron" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Run Daily Sweep
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Active (free)</p>
          <p className="font-display text-2xl font-bold" style={{ color: '#F5F0E8' }}>{activeFreeCount}</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Active (paid)</p>
          <p className="font-display text-2xl font-bold" style={{ color: '#F5F0E8' }}>{activeProCount + activeFeaturedCount}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{activeProCount} Pro · {activeFeaturedCount} Featured</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>MRR</p>
          <p className="font-display text-2xl font-bold text-[#C9A84C]">${mrr}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>est. monthly recurring</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Total active</p>
          <p className="font-display text-2xl font-bold" style={{ color: '#F5F0E8' }}>{totalActive}</p>
        </div>
      </div>

      {/* Approved but not active */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#F5F0E8' }}>
          <Users className="w-4 h-4" />
          Approved but not active ({inactive.length})
        </h3>
        {inactive.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>All approved guides are active. 🎉</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {inactive.map((g) => {
              const fd = g.form_data || {};
              const name = `${fd.firstName || ""} ${fd.lastName || ""}`.trim() || "Unnamed";
              return (
                <div
                  key={g.user_id}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
                  style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#F5F0E8' }}>{name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {g.activation_status} · {g.payment_reminder_count} reminders sent
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={sending === g.user_id || !fd.email}
                    onClick={() => sendOneReminder(g)}
                    className="border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10"
                  >
                    {sending === g.user_id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Send reminder"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expiring soon */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#F5F0E8' }}>
          <AlertTriangle className="w-4 h-4 text-[#C9A84C]" />
          Expiring in next 7 days ({expiringSoon.length})
        </h3>
        {expiringSoon.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>No paid subscriptions expiring soon.</p>
        ) : (
          <div className="space-y-2">
            {expiringSoon.map((g) => {
              const fd = g.form_data || {};
              const name = `${fd.firstName || ""} ${fd.lastName || ""}`.trim() || "Unnamed";
              return (
                <div key={g.user_id} className="rounded-lg px-3 py-2 flex justify-between items-center" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <span className="text-sm" style={{ color: '#F5F0E8' }}>{name} ({g.subscription_tier})</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    expires {g.subscription_expires_at ? new Date(g.subscription_expires_at).toLocaleDateString() : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivationFunnel;
