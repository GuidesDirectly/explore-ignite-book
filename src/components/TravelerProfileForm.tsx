import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  User, Heart, DollarSign, Accessibility, Utensils, Globe,
  Users, Baby, Loader2, CheckCircle2, Sparkles,
} from "lucide-react";
import { useTravelerProfile, type TravelerProfile } from "@/hooks/useTravelerProfile";
import { toast } from "sonner";

const TRAVEL_STYLES = [
  { value: "adventurous", label: "Adventurous", icon: "🏔️" },
  { value: "cultural", label: "Cultural Explorer", icon: "🏛️" },
  { value: "relaxed", label: "Relaxed & Leisurely", icon: "🌴" },
  { value: "balanced", label: "Balanced Mix", icon: "⚖️" },
  { value: "foodie", label: "Food-Focused", icon: "🍽️" },
  { value: "luxury", label: "Luxury", icon: "✨" },
];

const PACE_OPTIONS = [
  { value: "slow", label: "Slow & Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "fast", label: "Fast-Paced" },
];

const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget-Friendly" },
  { value: "moderate", label: "Mid-Range" },
  { value: "premium", label: "Premium" },
  { value: "luxury", label: "Luxury" },
  { value: "flexible", label: "Flexible" },
];

const DIETARY_OPTIONS = [
  "Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher",
  "Nut Allergy", "Dairy-Free", "No Restrictions",
];

const MOBILITY_OPTIONS = [
  { value: "none", label: "No limitations" },
  { value: "limited_walking", label: "Limited walking" },
  { value: "wheelchair", label: "Wheelchair accessible" },
  { value: "stroller", label: "Stroller-friendly" },
];

const INTEREST_OPTIONS = [
  "History", "Art & Museums", "Architecture", "Food & Drink",
  "Nature & Parks", "Nightlife", "Shopping", "Photography",
  "Local Hidden Gems", "Street Art", "Music & Theater",
  "Sports", "Wine & Craft Beer", "Markets & Bazaars",
];

const GROUP_OPTIONS = [
  { value: "solo", label: "Solo Traveler" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "friends", label: "Group of Friends" },
  { value: "corporate", label: "Corporate/Team" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const TravelerProfileForm = ({ open, onClose }: Props) => {
  const { profile, loading, saving, save, isLoggedIn } = useTravelerProfile();
  const [form, setForm] = useState<TravelerProfile>(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading) setForm(profile);
  }, [loading, profile]);

  const toggle = (field: "dietary_restrictions" | "interests", value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSave = async () => {
    const ok = await save(form);
    if (ok) {
      setSaved(true);
      toast.success("Travel preferences saved!");
      setTimeout(() => { setSaved(false); onClose(); }, 1200);
    } else {
      toast.error("Failed to save. Please try again.");
    }
  };

  if (!isLoggedIn) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Personalize Your Experience
            </DialogTitle>
            <DialogDescription>
              Sign in to save your travel preferences. The AI will use them to create better, personalized recommendations.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm mb-4">
              Log in or create an account to unlock AI-powered personalization.
            </p>
            <Button variant="hero" onClick={onClose}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            My Travel Preferences
          </DialogTitle>
          <DialogDescription>
            These preferences help our AI create perfectly tailored recommendations for you.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {/* Travel Style */}
            <section>
              <Label className="flex items-center gap-2 mb-3 text-base font-semibold">
                <User className="w-4 h-4 text-primary" /> Travel Style
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TRAVEL_STYLES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setForm(prev => ({ ...prev, travel_style: s.value }))}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      form.travel_style === s.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className="mr-1.5">{s.icon}</span>{s.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Pace & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-primary" /> Pace
                </Label>
                <Select value={form.pace} onValueChange={v => setForm(p => ({ ...p, pace: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PACE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" /> Budget
                </Label>
                <Select value={form.budget_preference} onValueChange={v => setForm(p => ({ ...p, budget_preference: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BUDGET_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Interests */}
            <section>
              <Label className="flex items-center gap-2 mb-3 text-base font-semibold">
                <Heart className="w-4 h-4 text-primary" /> Interests
              </Label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(i => (
                  <Badge
                    key={i}
                    variant={form.interests.includes(i) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      form.interests.includes(i)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:border-primary/40"
                    }`}
                    onClick={() => toggle("interests", i)}
                  >
                    {i}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Dietary */}
            <section>
              <Label className="flex items-center gap-2 mb-3">
                <Utensils className="w-4 h-4 text-primary" /> Dietary Restrictions
              </Label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map(d => (
                  <Badge
                    key={d}
                    variant={form.dietary_restrictions.includes(d) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      form.dietary_restrictions.includes(d)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:border-primary/40"
                    }`}
                    onClick={() => toggle("dietary_restrictions", d)}
                  >
                    {d}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Mobility */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Accessibility className="w-4 h-4 text-primary" /> Mobility Needs
              </Label>
              <Select value={form.mobility_needs} onValueChange={v => setForm(p => ({ ...p, mobility_needs: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MOBILITY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Group Type & Children */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" /> Group Type
                </Label>
                <Select value={form.group_type} onValueChange={v => setForm(p => ({ ...p, group_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GROUP_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.has_children}
                    onCheckedChange={v => setForm(p => ({ ...p, has_children: v }))}
                  />
                  <Label className="flex items-center gap-2">
                    <Baby className="w-4 h-4 text-primary" /> Traveling with Children
                  </Label>
                </div>
                {form.has_children && (
                  <Input
                    placeholder="Ages (e.g. 4, 8, 12)"
                    value={form.children_ages}
                    onChange={e => setForm(p => ({ ...p, children_ages: e.target.value }))}
                    maxLength={50}
                  />
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <Label className="mb-2 block">Additional Notes</Label>
              <Textarea
                placeholder="Any other preferences, allergies, special occasions, accessibility needs..."
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                maxLength={500}
                rows={3}
              />
            </div>

            {/* Save */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button variant="hero" onClick={handleSave} disabled={saving || saved}>
                {saved ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved!</>
                ) : saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TravelerProfileForm;
