import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, LogOut, Mail, Phone, MapPin, Calendar, Users, MessageSquare, BarChart3, EyeOff, Eye, UserCheck, CheckCircle, XCircle, Globe, Briefcase, Map, DollarSign, Clock, Pencil, Save, X, ShieldCheck, LineChart } from "lucide-react";
import VerificationDashboard from "@/components/dashboard/VerificationDashboard";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import UnservedDestinationsWidget from "@/components/dashboard/UnservedDestinationsWidget";
import ActivationFunnel from "@/components/dashboard/ActivationFunnel";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import logoImg from "@/assets/logo.jpg";
import FoundingGuideBadge from "@/components/FoundingGuideBadge";
import { useFoundingProgram } from "@/hooks/useFoundingProgram";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  destination: string;
  group_size: string | null;
  message: string | null;
  created_at: string;
}

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_email: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  hidden: boolean;
}

interface GuideApplication {
  id: string;
  user_id: string;
  status: string;
  service_areas: string[] | null;
  created_at: string;
  subscription_tier?: string;
  subscription_status?: string;
  subscription_plan_id?: string | null;
  form_data: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    biography?: string;
    languages?: string[];
    specializations?: string[];
    tourTypes?: string[];
    insuranceCompanyName?: string;
    insurancePolicyNumber?: string;
    licenseNumber?: string;
    licensingAuthority?: string;
    certifications?: string[];
  };
}

interface TourPlan {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  destination: string;
  days: string | null;
  hours_per_day: string | null;
  budget: string | null;
  experiences: string[] | null;
  guide_description: string | null;
  ai_plan: string | null;
  status: string;
  refinement_count: number;
  created_at: string;
  updated_at: string;
}

interface PublishedTour {
  id: string;
  title: string;
  status: string;
  view_count: number;
  inquiry_count: number;
  created_at: string;
  guide_user_id: string;
  guideName?: string;
}

const Admin = () => {
  const { data: foundingProgram } = useFoundingProgram();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"inquiries" | "reviews" | "guides" | "tours" | "published_tours" | "verification" | "analytics">("inquiries");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [guides, setGuides] = useState<GuideApplication[]>([]);
  const [tourPlans, setTourPlans] = useState<TourPlan[]>([]);
  const [publishedTours, setPublishedTours] = useState<PublishedTour[]>([]);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [editingGuide, setEditingGuide] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<GuideApplication["form_data"] | null>(null);
  const [editServiceAreas, setEditServiceAreas] = useState<string[]>([]);
  const [savingGuide, setSavingGuide] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [expandedTour, setExpandedTour] = useState<string | null>(null);
  const [guidePhotoUrls, setGuidePhotoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    const checkAdmin = async (userId: string) => {
      try {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
        if (isMounted) setIsAdmin(!!data);
      } catch {
        if (isMounted) setIsAdmin(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        checkAdmin(u.id);
      } else {
        setIsAdmin(false);
      }
    });

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await checkAdmin(u.id);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    const [inqRes, revRes, guideRes, tourRes, publishedToursRes] = await Promise.all([
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("guide_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("tour_plans").select("*").order("created_at", { ascending: false }),
      supabase
        .from("tours")
        .select("id, title, status, view_count, inquiry_count, created_at, guide_user_id")
        .order("created_at", { ascending: false }),
    ]);
    if (inqRes.data) setInquiries(inqRes.data);
    if (revRes.data) setReviews(revRes.data);
    if (guideRes.data) {
      setGuides(guideRes.data as any);
      // Fetch profile photos for all guides
      const photoMap: Record<string, string> = {};
      await Promise.all((guideRes.data as any[]).map(async (g: any) => {
        const { data: files } = await supabase.storage.from("guide-photos").list(g.user_id, { limit: 10 });
        const pf = files?.find((f: any) => f.name.startsWith("profile"));
        if (pf) {
          const { data: d } = supabase.storage.from("guide-photos").getPublicUrl(`${g.user_id}/${pf.name}`);
          if (d?.publicUrl) photoMap[g.user_id] = d.publicUrl;
        }
      }));
      setGuidePhotoUrls(photoMap);
    }
    if (tourRes.data) setTourPlans(tourRes.data as any);

    // Hydrate published tours with guide names
    if (publishedToursRes.data && guideRes.data) {
      const guideNameMap: Record<string, string> = {};
      for (const g of guideRes.data as any[]) {
        const fd = g.form_data || {};
        guideNameMap[g.user_id] = `${fd.firstName || ""} ${fd.lastName || ""}`.trim() || "Unnamed Guide";
      }
      setPublishedTours(
        (publishedToursRes.data as any[]).map((t) => ({
          ...t,
          guideName: guideNameMap[t.guide_user_id] || "Unknown",
        }))
      );
    }
  };

  const toggleTourStatus = async (tourId: string, newStatus: "draft" | "published") => {
    const { error } = await supabase
      .from("tours")
      .update({ status: newStatus } as any)
      .eq("id", tourId);
    if (error) {
      toast.error("Failed to update tour status");
      return;
    }
    setPublishedTours((prev) => prev.map((t) => (t.id === tourId ? { ...t, status: newStatus } : t)));
    toast.success(`Tour set to ${newStatus}`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const deleteInquiry = async (id: string) => {
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    toast.success("Inquiry deleted");
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success("Review deleted");
  };

  const toggleHidden = async (id: string, currentHidden: boolean) => {
    const { error } = await supabase.from("reviews").update({ hidden: !currentHidden } as any).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, hidden: !currentHidden } : r));
    toast.success(!currentHidden ? "Review hidden from website" : "Review visible on website");
  };

  const updateGuideStatus = async (id: string, newStatus: "approved" | "rejected") => {
    const guide = guides.find((g) => g.id === id);
    if (!guide) return;

    const { error } = await supabase
      .from("guide_profiles")
      .update({ status: newStatus } as any)
      .eq("id", id);
    if (error) { toast.error("Failed to update guide status"); return; }
    setGuides((prev) => prev.map((g) => g.id === id ? { ...g, status: newStatus } : g));
    toast.success(`Guide ${newStatus === "approved" ? "approved" : "rejected"} successfully`);

    // Send email notification to the guide
    try {
      const fd = guide.form_data;
      await supabase.functions.invoke("send-notification", {
        body: {
          type: "guide_status",
          data: {
            guideName: `${fd.firstName} ${fd.lastName}`,
            guideUserId: guide.user_id,
            guideEmail: (fd as any).email || undefined,
            status: newStatus,
          },
        },
      });
    } catch (e) {
      console.error("Failed to send guide notification email:", e);
    }
  };

  const deleteGuide = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this guide application?")) return;
    const { error } = await supabase.from("guide_profiles").delete().eq("id", id);
    if (error) { toast.error("Failed to delete guide"); return; }
    setGuides((prev) => prev.filter((g) => g.id !== id));
    toast.success("Guide application deleted");
  };

  const startEditGuide = (guide: GuideApplication) => {
    setEditingGuide(guide.id);
    setEditFormData({ ...guide.form_data });
    setEditServiceAreas([...(guide.service_areas || [])]);
    setExpandedGuide(guide.id);
  };

  const cancelEditGuide = () => {
    setEditingGuide(null);
    setEditFormData(null);
    setEditServiceAreas([]);
  };

  const saveGuideEdit = async (guideId: string) => {
    if (!editFormData) return;
    setSavingGuide(true);
    const { error } = await supabase
      .from("guide_profiles")
      .update({ form_data: editFormData as any, service_areas: editServiceAreas } as any)
      .eq("id", guideId);
    if (error) { toast.error("Failed to save"); setSavingGuide(false); return; }
    setGuides((prev) => prev.map((g) => g.id === guideId ? { ...g, form_data: editFormData, service_areas: editServiceAreas } : g));
    setEditingGuide(null);
    setEditFormData(null);
    setSavingGuide(false);
    toast.success("Guide profile updated");
  };

  const AREA_OPTIONS = ["Washington DC", "New York City", "Niagara Falls", "Toronto", "Boston", "Chicago"];

  const pendingGuides = guides.filter((g) => g.status === "pending");
  const approvedGuides = guides.filter((g) => g.status === "approved");
  const rejectedGuides = guides.filter((g) => g.status === "rejected");
  const draftGuides = guides.filter((g) => g.status === "draft");

  const handleSendReminders = async () => {
    setSendingReminders(true);
    try {
      const { data, error } = await supabase.functions.invoke("draft-guide-reminder");
      if (error) throw error;
      const sent = data?.sent ?? 0;
      if (sent > 0) {
        toast.success(`Sent reminders to ${sent} draft guide${sent > 1 ? "s" : ""}`);
      } else {
        toast.info("No draft guides found to remind");
      }
    } catch (e) {
      console.error("Failed to send reminders:", e);
      toast.error("Failed to send reminders — please try again");
    } finally {
      setSendingReminders(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-navy flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <img src={logoImg} alt="iGuide Tours" className="h-16 w-16 rounded-full object-cover mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-primary">Admin Login</h1>
            {user && !isAdmin && (
              <p className="text-destructive text-sm mt-2">This account does not have admin access.</p>
            )}
          </div>
          <form onSubmit={handleLogin} className="space-y-4 bg-card/10 backdrop-blur-sm rounded-2xl p-6 border border-primary/10">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary/50 border-primary/20 text-primary-foreground"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary/50 border-primary/20 text-primary-foreground"
            />
            <Button variant="hero" className="w-full" type="submit">Sign In</Button>
          </form>
          <a href="/forgot-password" className="block text-center text-primary/80 text-sm mt-3 hover:text-primary hover:underline transition-colors">Forgot password?</a>
          <a href="/" className="block text-center text-primary text-sm mt-2 hover:underline">← Back to Home</a>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const renderGuideCard = (guide: GuideApplication) => {
    const fd = guide.form_data;
    const isExpanded = expandedGuide === guide.id;
    const isEditing = editingGuide === guide.id;
    const photoUrl = guidePhotoUrls[guide.user_id] || supabase.storage.from("guide-photos").getPublicUrl(`${guide.user_id}/profile.jpg`).data.publicUrl;

    const ef = editFormData; // shorthand for edit fields

    return (
      <div key={guide.id} className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <img
              src={photoUrl}
              alt={`${fd.firstName} ${fd.lastName}`}
              className="w-14 h-14 rounded-xl object-cover border border-border flex-shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="flex-1 min-w-0">
              {/* Name & Status */}
              <div className="flex items-center gap-3 flex-wrap mb-1">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input value={ef?.firstName || ""} onChange={(e) => setEditFormData((p) => p ? { ...p, firstName: e.target.value } : p)} placeholder="First name" className="h-8 text-sm w-32" />
                    <Input value={ef?.lastName || ""} onChange={(e) => setEditFormData((p) => p ? { ...p, lastName: e.target.value } : p)} placeholder="Last name" className="h-8 text-sm w-32" />
                  </div>
                ) : (
                  <h3 className="font-semibold text-foreground text-lg">{fd.firstName} {fd.lastName}</h3>
                )}
                <Badge variant="secondary" className={`text-xs ${guide.status === "approved" ? "bg-primary/10 text-primary" : guide.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}`}>
                  {guide.status}
                </Badge>
                <Badge variant="outline" className={`text-xs capitalize ${guide.subscription_tier === "featured" ? "border-primary text-primary" : guide.subscription_tier === "pro" ? "border-yellow-500 text-yellow-600" : "border-border text-muted-foreground"}`}>
                  {guide.subscription_tier || "founding"}
                </Badge>
                {foundingProgram?.foundingPlanId &&
                  guide.subscription_plan_id === foundingProgram.foundingPlanId && (
                    <FoundingGuideBadge size="sm" />
                  )}
              </div>

              {/* Contact info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap mb-2">
                {isEditing ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <Input value={ef?.email || ""} onChange={(e) => setEditFormData((p) => p ? { ...p, email: e.target.value } : p)} placeholder="Email" className="h-7 text-xs w-44" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <Input value={ef?.phone || ""} onChange={(e) => setEditFormData((p) => p ? { ...p, phone: e.target.value } : p)} placeholder="Phone" className="h-7 text-xs w-36" />
                    </div>
                  </>
                ) : (
                  <>
                    {fd.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {fd.email}</span>}
                    {fd.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {fd.phone}</span>}
                  </>
                )}
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(guide.created_at).toLocaleDateString()}</span>
              </div>

              {/* Address (edit or display) */}
              {isEditing ? (
                <div className="mb-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address</label>
                  <Input value={ef?.address || ""} onChange={(e) => setEditFormData((p) => p ? { ...p, address: e.target.value } : p)} placeholder="Street, City, State, ZIP" className="h-7 text-xs mt-1" />
                </div>
              ) : fd.address ? (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-3.5 h-3.5 text-primary/70" />
                  <span>{fd.address}</span>
                </div>
              ) : null}

              {/* Service areas */}
              {isEditing ? (
                <div className="mb-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Service Areas</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {AREA_OPTIONS.map((area) => {
                      const selected = editServiceAreas.includes(area);
                      return (
                        <button key={area} type="button" onClick={() => setEditServiceAreas((prev) => selected ? prev.filter((a) => a !== area) : [...prev, area])}
                          className={`text-xs px-2 py-1 rounded-full border transition-all ${selected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : guide.service_areas && guide.service_areas.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <MapPin className="w-3.5 h-3.5 text-primary/70" />
                  {guide.service_areas.map((area) => (
                    <Badge key={area} variant="secondary" className="text-xs">{area}</Badge>
                  ))}
                </div>
              ) : null}

              {/* Languages */}
              {isEditing ? (
                <div className="mb-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Languages (comma-separated)</label>
                  <Input value={(ef?.languages || []).join(", ")} onChange={(e) => setEditFormData((p) => p ? { ...p, languages: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : p)} className="h-7 text-xs mt-1" />
                </div>
              ) : fd.languages && fd.languages.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <Globe className="w-3.5 h-3.5 text-primary/70" />
                  <span className="text-sm text-muted-foreground">{fd.languages.join(", ")}</span>
                </div>
              ) : null}

              {/* Expandable details */}
              {isExpanded && (
                <div className="mt-3 space-y-3">
                  {/* Specializations */}
                  {isEditing ? (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Specializations (comma-separated)</label>
                      <Input value={(ef?.specializations || []).join(", ")} onChange={(e) => setEditFormData((p) => p ? { ...p, specializations: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : p)} className="h-7 text-xs mt-1" />
                    </div>
                  ) : fd.specializations && fd.specializations.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Specializations</p>
                      <div className="flex flex-wrap gap-1.5">
                        {fd.specializations.map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Tour Types */}
                  {isEditing ? (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tour Types (comma-separated)</label>
                      <Input value={(ef?.tourTypes || []).join(", ")} onChange={(e) => setEditFormData((p) => p ? { ...p, tourTypes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : p)} className="h-7 text-xs mt-1" />
                    </div>
                  ) : fd.tourTypes && fd.tourTypes.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Tour Types</p>
                      <div className="flex flex-wrap gap-1.5">
                        {fd.tourTypes.map((tt) => (<Badge key={tt} variant="secondary" className="text-xs">{tt}</Badge>))}
                      </div>
                    </div>
                  ) : null}

                  {/* Biography */}
                  {isEditing ? (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Biography</label>
                      <Textarea value={ef?.biography || ""} onChange={(e) => setEditFormData((p) => p ? { ...p, biography: e.target.value } : p)} rows={3} className="text-xs mt-1" />
                    </div>
                  ) : fd.biography ? (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Biography</p>
                      <p className="text-sm text-foreground/80 bg-muted/50 p-3 rounded-lg">{fd.biography}</p>
                    </div>
                  ) : null}

                  {/* Insurance & License Credentials */}
                  <div className="border-t border-border/50 pt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Credentials & Insurance</p>
                    {isEditing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">Insurance Company</label>
                          <Input value={ef?.insuranceCompanyName || ""} onChange={(e) => setEditFormData((p) => p ? { ...p, insuranceCompanyName: e.target.value } : p)} className="h-7 text-xs mt-0.5" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Policy Number</label>
                          <Input value={ef?.insurancePolicyNumber || ""} onChange={(e) => setEditFormData((p) => p ? { ...p, insurancePolicyNumber: e.target.value } : p)} className="h-7 text-xs mt-0.5" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">License Number</label>
                          <Input value={ef?.licenseNumber || ""} onChange={(e) => setEditFormData((p) => p ? { ...p, licenseNumber: e.target.value } : p)} className="h-7 text-xs mt-0.5" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Licensing Authority</label>
                          <Input value={ef?.licensingAuthority || ""} onChange={(e) => setEditFormData((p) => p ? { ...p, licensingAuthority: e.target.value } : p)} className="h-7 text-xs mt-0.5" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs text-muted-foreground">Certifications (comma-separated)</label>
                          <Input value={(ef?.certifications || []).join(", ")} onChange={(e) => setEditFormData((p) => p ? { ...p, certifications: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : p)} className="h-7 text-xs mt-0.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {fd.insuranceCompanyName && <div><span className="text-muted-foreground">Insurance:</span> <span className="text-foreground">{fd.insuranceCompanyName}</span></div>}
                        {fd.insurancePolicyNumber && <div><span className="text-muted-foreground">Policy #:</span> <span className="text-foreground">{fd.insurancePolicyNumber}</span></div>}
                        {fd.licenseNumber && <div><span className="text-muted-foreground">License #:</span> <span className="text-foreground">{fd.licenseNumber}</span></div>}
                        {fd.licensingAuthority && <div><span className="text-muted-foreground">Authority:</span> <span className="text-foreground">{fd.licensingAuthority}</span></div>}
                        {fd.certifications && fd.certifications.length > 0 && (
                          <div className="sm:col-span-2">
                            <span className="text-muted-foreground">Certifications:</span>{" "}
                            <span className="text-foreground">{fd.certifications.join(", ")}</span>
                          </div>
                        )}
                        {!fd.insuranceCompanyName && !fd.licenseNumber && !fd.certifications?.length && (
                          <p className="text-xs text-muted-foreground italic">No credentials provided</p>
                        )}
                      </div>
                    )}
                   </div>

                  {/* Subscription Tier Override */}
                  <div className="border-t border-border/50 pt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Subscription Tier</p>
                    <select
                      value={guide.subscription_tier || "founding"}
                      onChange={async (e) => {
                        const newTier = e.target.value;
                        const { error } = await supabase
                          .from("guide_profiles")
                          .update({ subscription_tier: newTier } as any)
                          .eq("id", guide.id);
                        if (error) {
                          toast.error("Failed to update subscription tier");
                        } else {
                          setGuides((prev) => prev.map((g) => g.id === guide.id ? { ...g, subscription_tier: newTier } : g));
                          toast.success(`Subscription tier set to ${newTier}`);
                        }
                      }}
                      className="text-sm bg-background border border-border rounded-md px-3 py-1.5 text-foreground"
                    >
                      <option value="founding">Founding ($0/mo)</option>
                      <option value="pro">Pro ($29/mo)</option>
                      <option value="featured">Featured ($59/mo)</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={() => { setExpandedGuide(isExpanded ? null : guide.id); if (isEditing && isExpanded) cancelEditGuide(); }}
                className="text-xs text-primary hover:underline mt-2"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10" onClick={() => saveGuideEdit(guide.id)} disabled={savingGuide}>
                  <Save className="w-3.5 h-3.5 mr-1" /> {savingGuide ? "Saving…" : "Save"}
                </Button>
                <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-muted" onClick={cancelEditGuide}>
                  <X className="w-3.5 h-3.5 mr-1" /> Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10" onClick={() => startEditGuide(guide)}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                {guide.status !== "approved" && (
                  <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10" onClick={() => updateGuideStatus(guide.id, "approved")}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                )}
                {guide.status !== "rejected" && (
                  <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => updateGuideStatus(guide.id, "rejected")}>
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                )}
                <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => deleteGuide(guide.id)}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="iGuide Tours" className="h-8 w-8 rounded-full object-cover" />
          <h1 className="font-display text-xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-5 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-6 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{inquiries.length}</p>
              <p className="text-sm text-muted-foreground">Inquiries</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{reviews.length}</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingGuides.length}</p>
              <p className="text-sm text-muted-foreground">Pending Guides</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Map className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{tourPlans.length}</p>
              <p className="text-sm text-muted-foreground">Tour Plans</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgRating}</p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={tab === "inquiries" ? "default" : "outline"}
            onClick={() => setTab("inquiries")}
          >
            <MessageSquare className="w-4 h-4 mr-2" /> Inquiries ({inquiries.length})
          </Button>
          <Button
            variant={tab === "reviews" ? "default" : "outline"}
            onClick={() => setTab("reviews")}
          >
            <Star className="w-4 h-4 mr-2" /> Reviews ({reviews.length})
          </Button>
          <Button
            variant={tab === "guides" ? "default" : "outline"}
            onClick={() => setTab("guides")}
          >
            <UserCheck className="w-4 h-4 mr-2" /> Guides ({guides.length})
            {pendingGuides.length > 0 && (
              <Badge className="ml-2 bg-primary text-secondary text-xs px-1.5 py-0">{pendingGuides.length}</Badge>
            )}
          </Button>
          <Button
            variant={tab === "tours" ? "default" : "outline"}
            onClick={() => setTab("tours")}
          >
            <Map className="w-4 h-4 mr-2" /> Tour Plans ({tourPlans.length})
          </Button>
          <Button
            variant={tab === "published_tours" ? "default" : "outline"}
            onClick={() => setTab("published_tours")}
          >
            <Briefcase className="w-4 h-4 mr-2" /> Published Tours ({publishedTours.filter(t => t.status === "published").length})
          </Button>
          <Button
            variant={tab === "verification" ? "default" : "outline"}
            onClick={() => setTab("verification")}
          >
            <ShieldCheck className="w-4 h-4 mr-2" /> Verification
          </Button>
          <Button
            variant={tab === "analytics" ? "default" : "outline"}
            onClick={() => setTab("analytics")}
          >
            <LineChart className="w-4 h-4 mr-2" /> Analytics
          </Button>
        </div>

        {/* Analytics Tab */}
        {tab === "analytics" && <AnalyticsDashboard />}

        {/* Inquiries Tab */}
        {tab === "inquiries" && (
          <div className="space-y-4">
            <UnservedDestinationsWidget inquiries={inquiries} />
            {inquiries.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No inquiries yet.</p>
            )}
            {inquiries.map((inq) => (
              <div key={inq.id} className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-foreground text-lg">{inq.name}</h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{inq.destination}</span>
                      {inq.group_size && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" /> {inq.group_size}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {inq.email}</span>
                      {inq.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {inq.phone}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(inq.created_at).toLocaleDateString()}</span>
                    </div>
                    {inq.message && (
                      <p className="text-foreground/80 text-sm mt-2 bg-muted/50 p-3 rounded-lg">{inq.message}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteInquiry(inq.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reviews Tab */}
        {tab === "reviews" && (
          <div className="space-y-4">
            {reviews.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No reviews yet.</p>
            )}
            {reviews.map((rev) => (
              <div key={rev.id} className={`bg-card rounded-xl border border-border p-6 ${rev.hidden ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-foreground">{rev.reviewer_name}</h3>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-4 h-4 ${s <= rev.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                      {rev.hidden && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Hidden</span>
                      )}
                    </div>
                    {rev.reviewer_email && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {rev.reviewer_email}
                      </p>
                    )}
                    {rev.comment && (
                      <p className="text-foreground/80 text-sm bg-muted/50 p-3 rounded-lg">{rev.comment}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleHidden(rev.id, rev.hidden)}
                      title={rev.hidden ? "Show on website" : "Hide from website"}
                    >
                      {rev.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteReview(rev.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Guides Tab */}
        {tab === "guides" && (
          <div className="space-y-6">
            <ActivationFunnel />
            {guides.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No guide applications yet.</p>
            )}

            {/* Draft guide reminder button */}
            {draftGuides.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={handleSendReminders}
                  disabled={sendingReminders}
                  style={{
                    background: "rgba(201,168,76,0.1)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    color: "#C9A84C",
                    fontSize: "13px",
                    fontWeight: 500,
                    borderRadius: "8px",
                    padding: "8px 16px",
                    cursor: sendingReminders ? "not-allowed" : "pointer",
                    opacity: sendingReminders ? 0.6 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Mail className="w-4 h-4" />
                  {sendingReminders ? "Sending..." : `Send Reminders to Draft Guides (${draftGuides.length})`}
                </button>
              </div>
            )}

            {/* Pending section */}
            {pendingGuides.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Pending Review ({pendingGuides.length})
                </h3>
                <div className="space-y-4">
                  {pendingGuides.map(renderGuideCard)}
                </div>
              </div>
            )}

            {/* Approved section */}
            {approvedGuides.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Approved ({approvedGuides.length})
                </h3>
                <div className="space-y-4">
                  {approvedGuides.map(renderGuideCard)}
                </div>
              </div>
            )}

            {/* Rejected section */}
            {rejectedGuides.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Rejected ({rejectedGuides.length})
                </h3>
                <div className="space-y-4">
                  {rejectedGuides.map(renderGuideCard)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verification Tab */}
        {tab === "verification" && <VerificationDashboard />}

        {/* Tour Plans Tab */}
        {tab === "tours" && (
          <div className="space-y-4">
            {tourPlans.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No tour plans yet.</p>
            )}
            {tourPlans.map((plan) => {
              const isExpanded = expandedTour === plan.id;
              const statusColor =
                plan.status === "completed" ? "bg-primary/10 text-primary" :
                plan.status === "planning" ? "bg-accent text-accent-foreground" :
                plan.status === "matched" ? "bg-primary/20 text-primary" :
                "bg-muted text-muted-foreground";

              return (
                <div key={plan.id} className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-foreground text-lg">
                          {plan.first_name} {plan.last_name}
                        </h3>
                        <Badge variant="secondary" className={`text-xs ${statusColor}`}>
                          {plan.status}
                        </Badge>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {plan.destination}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {plan.email}</span>
                        {plan.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {plan.phone}</span>}
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(plan.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        {plan.days && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {plan.days} days{plan.hours_per_day ? `, ${plan.hours_per_day}h/day` : ""}</span>}
                        {plan.budget && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {plan.budget}</span>}
                        {plan.refinement_count > 0 && <span className="text-xs">Refinements: {plan.refinement_count}</span>}
                      </div>

                      {plan.experiences && plan.experiences.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {plan.experiences.map((exp) => (
                            <Badge key={exp} variant="secondary" className="text-xs">{exp}</Badge>
                          ))}
                        </div>
                      )}

                      {isExpanded && (
                        <div className="mt-3 space-y-3">
                          {plan.guide_description && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Guide Preferences</p>
                              <p className="text-sm text-foreground/80 bg-muted/50 p-3 rounded-lg">{plan.guide_description}</p>
                            </div>
                          )}
                          {plan.ai_plan && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">AI-Generated Plan</p>
                              <div className="text-sm text-foreground/80 bg-muted/50 p-3 rounded-lg whitespace-pre-wrap max-h-96 overflow-y-auto">
                                {plan.ai_plan}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => setExpandedTour(isExpanded ? null : plan.id)}
                        className="text-xs text-primary hover:underline mt-2"
                      >
                        {isExpanded ? "Show less" : "Show more"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Published Tours Tab */}
        {tab === "published_tours" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Total Published</p>
                <p className="text-3xl font-bold text-primary">
                  {publishedTours.filter((t) => t.status === "published").length}
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Total Drafts</p>
                <p className="text-3xl font-bold text-muted-foreground">
                  {publishedTours.filter((t) => t.status === "draft").length}
                </p>
              </div>
            </div>

            {/* Table */}
            {publishedTours.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No tours yet.</p>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Guide</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Views</th>
                        <th className="px-4 py-3 text-right">Inquiries</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {publishedTours.map((t) => (
                        <tr key={t.id} className="border-t border-border hover:bg-muted/20">
                          <td className="px-4 py-3 text-foreground font-medium">{t.title}</td>
                          <td className="px-4 py-3 text-muted-foreground">{t.guideName}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${t.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                            >
                              {t.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">{t.view_count}</td>
                          <td className="px-4 py-3 text-right text-foreground">{t.inquiry_count}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(t.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleTourStatus(t.id, t.status === "published" ? "draft" : "published")
                              }
                            >
                              {t.status === "published" ? "Unpublish" : "Publish"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
