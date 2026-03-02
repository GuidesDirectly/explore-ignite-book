import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ConnectStatus {
  has_account: boolean;
  onboarding_complete: boolean;
  account_status: {
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
  } | null;
}

const StripeConnectCard = () => {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    const { data, error } = await supabase.functions.invoke("create-connect-account", {
      body: { action: "status" },
    });
    if (!error && data) setStatus(data);
    setLoading(false);
  };

  const handleOnboard = async () => {
    setActionLoading(true);
    const { data, error } = await supabase.functions.invoke("create-connect-account", {
      body: {
        action: "onboard",
        return_url: `${window.location.origin}/guide-dashboard`,
      },
    });
    if (error) {
      toast.error("Failed to start onboarding.");
      setActionLoading(false);
      return;
    }
    if (data?.url) window.location.href = data.url;
  };

  const handleDashboard = async () => {
    setActionLoading(true);
    const { data, error } = await supabase.functions.invoke("create-connect-account", {
      body: { action: "dashboard" },
    });
    if (error) {
      toast.error("Failed to open Stripe dashboard.");
      setActionLoading(false);
      return;
    }
    if (data?.url) window.open(data.url, "_blank");
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 p-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="h-16 bg-muted rounded" />
      </div>
    );
  }

  const isFullyOnboarded = status?.onboarding_complete && status?.account_status?.payouts_enabled;
  const needsCompletion = status?.has_account && !isFullyOnboarded;

  return (
    <section className="bg-card rounded-2xl border border-border/50 p-6">
      <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-primary" />
        Stripe Payouts
      </h2>

      {isFullyOnboarded ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-foreground font-medium">Connected — payouts enabled</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Earnings from bookings are automatically split (85% to you, 15% platform fee) and deposited to your connected bank account.
          </p>
          <Button variant="outline" size="sm" onClick={handleDashboard} disabled={actionLoading}>
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <ExternalLink className="w-4 h-4 mr-1" />}
            Open Stripe Dashboard
          </Button>
        </div>
      ) : needsCompletion ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-foreground font-medium">Onboarding incomplete</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Complete your Stripe account setup to start receiving payouts from tour bookings.
          </p>
          <Button size="sm" onClick={handleOnboard} disabled={actionLoading}>
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CreditCard className="w-4 h-4 mr-1" />}
            Complete Setup
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your bank account via Stripe to receive direct payouts from tour bookings. You'll earn 85% of each booking — the platform retains a 15% service fee.
          </p>
          <Button size="sm" onClick={handleOnboard} disabled={actionLoading}>
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CreditCard className="w-4 h-4 mr-1" />}
            Connect with Stripe
          </Button>
        </div>
      )}
    </section>
  );
};

export default StripeConnectCard;
