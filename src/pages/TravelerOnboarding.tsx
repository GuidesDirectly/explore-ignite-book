import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useTravelerProfile } from "@/hooks/useTravelerProfile";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Upload, ArrowRight, ArrowLeft, Check } from "lucide-react";

const LANGUAGE_OPTIONS = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Mandarin", "Japanese", "Korean", "Arabic", "Hindi"];
const INTEREST_OPTIONS = [
  { id: "history", label: "History" },
  { id: "food", label: "Food & Cuisine" },
  { id: "art", label: "Art & Museums" },
  { id: "nature", label: "Nature & Outdoors" },
  { id: "adventure", label: "Adventure" },
  { id: "nightlife", label: "Nightlife" },
];

const TravelerOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, setProfile, save, loading, isLoggedIn, userId } = useTravelerProfile();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const totalSteps = 5;

  useEffect(() => {
    if (!loading && !isLoggedIn) navigate("/login");
  }, [loading, isLoggedIn, navigate]);

  const updateField = <K extends keyof typeof profile>(key: K, value: typeof profile[K]) => {
    setProfile({ ...profile, [key]: value });
  };

  const toggleArrayItem = (key: "preferred_languages" | "interests", item: string) => {
    const current = profile[key];
    const next = current.includes(item) ? current.filter((i) => i !== item) : [...current, item];
    setProfile({ ...profile, [key]: next });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `traveler-avatars/${userId}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("guide-photos").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("guide-photos").getPublicUrl(path);
    updateField("avatar_url", data.publicUrl);
    setUploading(false);
  };

  const canAdvance = () => {
    if (step === 1) return profile.first_name.trim() && profile.last_name.trim();
    if (step === 2) return profile.country.trim();
    return true;
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const ok = await save({ onboarding_complete: true });
      if (ok) {
        toast({ title: "Welcome aboard!", description: "Your profile is set up." });
        navigate("/traveler/dashboard");
      } else {
        toast({ title: "Save failed", description: "Please try again.", variant: "destructive" });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-xl">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Step {step} of {totalSteps}
                </span>
                <span className="text-xs text-muted-foreground">{Math.round((step / totalSteps) * 100)}%</span>
              </div>
              <Progress value={(step / totalSteps) * 100} />
            </div>

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-display font-bold text-foreground">What's your name?</h2>
                <p className="text-sm text-muted-foreground">Help guides know who they're meeting.</p>
                <div className="space-y-2">
                  <Label htmlFor="first">First name</Label>
                  <Input id="first" value={profile.first_name} onChange={(e) => updateField("first_name", e.target.value)} maxLength={50} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last">Last name</Label>
                  <Input id="last" value={profile.last_name} onChange={(e) => updateField("last_name", e.target.value)} maxLength={50} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-display font-bold text-foreground">Where are you from?</h2>
                <p className="text-sm text-muted-foreground">Your country of origin.</p>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="e.g. United States" value={profile.country} onChange={(e) => updateField("country", e.target.value)} maxLength={80} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-display font-bold text-foreground">Languages you speak</h2>
                <p className="text-sm text-muted-foreground">We'll match you with guides who speak them.</p>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <label key={lang} className="flex items-center gap-2 p-2 border border-border rounded-md cursor-pointer hover:bg-muted">
                      <Checkbox checked={profile.preferred_languages.includes(lang)} onCheckedChange={() => toggleArrayItem("preferred_languages", lang)} />
                      <span className="text-sm">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-display font-bold text-foreground">What interests you?</h2>
                <p className="text-sm text-muted-foreground">Pick anything that excites you.</p>
                <div className="grid grid-cols-2 gap-2">
                  {INTEREST_OPTIONS.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2 p-3 border border-border rounded-md cursor-pointer hover:bg-muted">
                      <Checkbox checked={profile.interests.includes(opt.id)} onCheckedChange={() => toggleArrayItem("interests", opt.id)} />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-display font-bold text-foreground">Profile photo</h2>
                <p className="text-sm text-muted-foreground">Optional — adds a personal touch.</p>
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt="Profile" />}
                    <AvatarFallback className="text-xl">
                      {(profile.first_name[0] || "") + (profile.last_name[0] || "") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                    <span className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted text-sm font-medium">
                      <Upload className="w-4 h-4" />
                      {uploading ? "Uploading…" : profile.avatar_url ? "Change photo" : "Upload photo"}
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={handleNext} disabled={!canAdvance() || uploading}>
                {step === totalSteps ? (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Finish
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TravelerOnboarding;
