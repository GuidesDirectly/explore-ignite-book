import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TravelerProfile {
  id?: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  country: string;
  avatar_url: string;
  onboarding_complete: boolean;
  travel_style: string;
  pace: string;
  budget_preference: string;
  dietary_restrictions: string[];
  mobility_needs: string;
  interests: string[];
  group_type: string;
  has_children: boolean;
  children_ages: string;
  preferred_languages: string[];
  previous_destinations: string[];
  notes: string;
}

const DEFAULT_PROFILE: TravelerProfile = {
  first_name: "",
  last_name: "",
  country: "",
  avatar_url: "",
  onboarding_complete: false,
  travel_style: "balanced",
  pace: "moderate",
  budget_preference: "flexible",
  dietary_restrictions: [],
  mobility_needs: "none",
  interests: [],
  group_type: "solo",
  has_children: false,
  children_ages: "",
  preferred_languages: [],
  previous_destinations: [],
  notes: "",
};

export function useTravelerProfile() {
  const [profile, setProfile] = useState<TravelerProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      setUserId(session.user.id);

      const { data } = await supabase
        .from("traveler_profiles" as any)
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) {
        setProfile({ ...DEFAULT_PROFILE, ...(data as any) } as TravelerProfile);
      }
      setLoading(false);
    };
    load();
  }, []);

  const save = useCallback(async (updates: Partial<TravelerProfile>) => {
    if (!userId) return false;
    setSaving(true);
    const merged = { ...profile, ...updates };

    const payload = {
      user_id: userId,
      first_name: merged.first_name,
      last_name: merged.last_name,
      country: merged.country,
      avatar_url: merged.avatar_url,
      onboarding_complete: merged.onboarding_complete,
      travel_style: merged.travel_style,
      pace: merged.pace,
      budget_preference: merged.budget_preference,
      dietary_restrictions: merged.dietary_restrictions,
      mobility_needs: merged.mobility_needs,
      interests: merged.interests,
      group_type: merged.group_type,
      has_children: merged.has_children,
      children_ages: merged.children_ages,
      preferred_languages: merged.preferred_languages,
      previous_destinations: merged.previous_destinations,
      notes: merged.notes,
    };

    const { error } = await (supabase.from("traveler_profiles" as any) as any)
      .upsert(payload, { onConflict: "user_id" });

    setSaving(false);
    if (!error) {
      setProfile(merged);
      return true;
    }
    console.error("Save profile error:", error);
    return false;
  }, [userId, profile]);

  return { profile, setProfile, loading, saving, save, isLoggedIn: !!userId, userId };
}

/** Build a text summary of the profile for AI prompt injection */
export function profileToContext(p: TravelerProfile): string {
  const parts: string[] = [];
  if (p.travel_style !== "balanced") parts.push(`Travel style: ${p.travel_style}`);
  if (p.pace !== "moderate") parts.push(`Pace: ${p.pace}`);
  if (p.budget_preference !== "flexible") parts.push(`Budget: ${p.budget_preference}`);
  if (p.dietary_restrictions.length) parts.push(`Dietary: ${p.dietary_restrictions.join(", ")}`);
  if (p.mobility_needs !== "none") parts.push(`Mobility: ${p.mobility_needs}`);
  if (p.interests.length) parts.push(`Interests: ${p.interests.join(", ")}`);
  if (p.group_type !== "solo") parts.push(`Group: ${p.group_type}`);
  if (p.has_children) parts.push(`Traveling with children${p.children_ages ? ` (ages: ${p.children_ages})` : ""}`);
  if (p.preferred_languages.length) parts.push(`Preferred languages: ${p.preferred_languages.join(", ")}`);
  if (p.previous_destinations.length) parts.push(`Previously visited: ${p.previous_destinations.join(", ")}`);
  if (p.notes.trim()) parts.push(`Additional notes: ${p.notes}`);
  return parts.length ? `\n\nTraveler Profile:\n${parts.join("\n")}` : "";
}
