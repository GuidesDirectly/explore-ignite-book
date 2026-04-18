import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LogIn, Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !authData.user) {
      toast({
        title: "Sign-in failed",
        description: error?.message ?? "Unknown error",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({ title: "Welcome back!", description: "You've signed in successfully." });

    // Determine redirect based on role + onboarding status
    const userId = authData.user.id;
    const [{ data: roles }, { data: guideProfile }, { data: travelerProfile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("guide_profiles").select("id").eq("user_id", userId).maybeSingle(),
      supabase.from("traveler_profiles").select("onboarding_complete").eq("user_id", userId).maybeSingle(),
    ]);

    const roleSet = new Set((roles || []).map((r: any) => r.role));
    if (roleSet.has("admin")) {
      navigate("/admin");
    } else if (roleSet.has("guide") || guideProfile) {
      navigate("/guide-dashboard");
    } else if (!travelerProfile?.onboarding_complete) {
      navigate("/traveler/onboarding");
    } else {
      navigate("/traveler/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Sign In
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Welcome back — travelers &amp; guides sign in here.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="/forgot-password"
                    onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Want to offer tours?{" "}
              <a
                href="/guide-register"
                onClick={(e) => { e.preventDefault(); navigate("/guide-register"); }}
                className="text-primary font-medium hover:underline"
              >
                Become a Guide →
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
