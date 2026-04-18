import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PasswordStrengthMeter, { isPasswordStrong } from "@/components/PasswordStrengthMeter";
import { checkPasswordBreached } from "@/lib/hibp";
import { LogIn, UserPlus, Mail, Lock } from "lucide-react";

const Login = () => {
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  // Sign in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Sign up state
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suTerms, setSuTerms] = useState(false);
  const [suLoading, setSuLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const routeAfterAuth = async (userId: string) => {
    const [{ data: roles }, { data: guideProfile }, { data: travelerProfile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("guide_profiles").select("id").eq("user_id", userId).maybeSingle(),
      supabase.from("traveler_profiles").select("onboarding_complete").eq("user_id", userId).maybeSingle(),
    ]);

    const roleSet = new Set((roles || []).map((r: any) => r.role));
    console.log("[Login] Post-auth routing", {
      userId,
      roles: Array.from(roleSet),
      hasGuideProfile: !!guideProfile,
      onboardingComplete: travelerProfile?.onboarding_complete ?? null,
    });

    if (roleSet.has("admin")) {
      navigate("/admin");
    } else if (roleSet.has("guide") || guideProfile) {
      navigate("/guide-dashboard");
    } else if (!travelerProfile?.onboarding_complete) {
      navigate("/traveler/onboarding");
    } else {
      navigate("/traveler/dashboard");
    }
  };

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
    await routeAfterAuth(authData.user.id);
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!suEmail || !/^\S+@\S+\.\S+$/.test(suEmail)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (!isPasswordStrong(suPassword)) {
      toast({
        title: "Password too weak",
        description: "Please meet all the password requirements below.",
        variant: "destructive",
      });
      return;
    }
    if (suPassword !== suConfirm) {
      toast({ title: "Passwords don't match", description: "Please re-enter your password.", variant: "destructive" });
      return;
    }
    if (!suTerms) {
      toast({ title: "Please agree to the Terms", description: "You must accept the Terms to create an account.", variant: "destructive" });
      return;
    }

    setSuLoading(true);

    // HIBP breach check (fail-open)
    try {
      const breached = await checkPasswordBreached(suPassword);
      if (breached) {
        toast({
          title: "Password found in data breaches",
          description: "Please choose a different password — this one has been exposed in a known breach.",
          variant: "destructive",
        });
        setSuLoading(false);
        return;
      }
    } catch {
      // fail open
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: suEmail,
      password: suPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Sign-up failed",
        description: error.message,
        variant: "destructive",
      });
      setSuLoading(false);
      return;
    }

    if (authData.session && authData.user) {
      // Email confirmation disabled — user is signed in immediately
      toast({ title: "Welcome!", description: "Your account has been created." });
      await routeAfterAuth(authData.user.id);
    } else {
      // Email confirmation required
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete sign-up.",
      });
      setTab("signin");
    }

    setSuLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                {tab === "signin" ? (
                  <LogIn className="w-6 h-6 text-primary" />
                ) : (
                  <UserPlus className="w-6 h-6 text-primary" />
                )}
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {tab === "signin" ? "Sign In" : "Create your account"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {tab === "signin"
                  ? "Welcome back — travelers & guides sign in here."
                  : "Join to discover guides and plan your tours."}
              </p>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")} className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
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
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="su-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="su-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={suEmail}
                        onChange={(e) => setSuEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="su-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="su-password"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={suPassword}
                        onChange={(e) => setSuPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <PasswordStrengthMeter password={suPassword} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="su-confirm">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="su-confirm"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={suConfirm}
                        onChange={(e) => setSuConfirm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {suConfirm && suConfirm !== suPassword && (
                      <p className="text-xs text-destructive">Passwords don't match.</p>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="su-terms"
                      checked={suTerms}
                      onCheckedChange={(v) => setSuTerms(v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="su-terms" className="text-xs text-muted-foreground font-normal leading-relaxed cursor-pointer">
                      By signing up, I agree to the{" "}
                      <a
                        href="/privacy-policy"
                        onClick={(e) => { e.preventDefault(); navigate("/privacy-policy"); }}
                        className="text-primary hover:underline"
                      >
                        Terms & Privacy Policy
                      </a>.
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={suLoading}>
                    {suLoading ? "Creating account…" : "Create account"}
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
