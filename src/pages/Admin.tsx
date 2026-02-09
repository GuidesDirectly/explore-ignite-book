import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Trash2, LogOut, Mail, Phone, MapPin, Calendar, Users, MessageSquare, BarChart3, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import logoImg from "@/assets/logo.jpg";

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

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"inquiries" | "reviews">("inquiries");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id).eq("role", "admin").maybeSingle();
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    supabase.auth.getSession();
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    const [inqRes, revRes] = await Promise.all([
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
    ]);
    if (inqRes.data) setInquiries(inqRes.data);
    if (revRes.data) setReviews(revRes.data);
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
          <a href="/" className="block text-center text-primary text-sm mt-4 hover:underline">← Back to Home</a>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

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
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
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
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgRating}</p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
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
        </div>

        {/* Inquiries Tab */}
        {tab === "inquiries" && (
          <div className="space-y-4">
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
      </div>
    </div>
  );
};

export default Admin;
