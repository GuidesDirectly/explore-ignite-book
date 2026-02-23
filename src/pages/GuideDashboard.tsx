import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Images,
  Loader2,
  Plus,
  BarChart3,
  Star,
  MessageSquare,
  CalendarCheck,
  TrendingUp,
  Eye,
} from "lucide-react";
import logoImg from "@/assets/logo.jpg";
import { scanFileForViruses } from "@/lib/scanUpload";
import BookingsManager from "@/components/dashboard/BookingsManager";
import AvailabilityManager from "@/components/dashboard/AvailabilityManager";
import GuideVerificationUpload from "@/components/dashboard/GuideVerificationUpload";

interface PhotoItem {
  name: string;
  url: string;
}

interface AnalyticsData {
  totalReviews: number;
  avgRating: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalConversations: number;
  totalPhotos: number;
  recentReviews: { reviewer_name: string; rating: number; comment: string | null; created_at: string }[];
}

const MAX_PHOTOS = 20;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  accent = false,
}: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  accent?: boolean;
}) => (
  <div className="bg-card rounded-xl border border-border/50 p-5 flex flex-col gap-2">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className={`w-4 h-4 ${accent ? "text-primary" : ""}`} />
      <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
    </div>
    <p className={`font-display text-3xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>
      {value}
    </p>
    {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
  </div>
);

const GuideDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [guideName, setGuideName] = useState("");
  const [guideProfileId, setGuideProfileId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalReviews: 0,
    avgRating: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalConversations: 0,
    totalPhotos: 0,
    recentReviews: [],
  });

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      if (!u) {
        navigate("/guide-register");
        return;
      }
      setUser(u);

      // Fetch guide profile
      const { data: profile } = await supabase
        .from("guide_profiles")
        .select("id, form_data")
        .eq("user_id", u.id)
        .maybeSingle();

      if (!profile) {
        navigate("/guide-register");
        return;
      }

      const fd = profile.form_data as any;
      setGuideName(`${fd.firstName || ""} ${fd.lastName || ""}`.trim());
      setGuideProfileId(profile.id);
      setLoading(false);
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) navigate("/guide-register");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch analytics data
  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      // Fetch reviews, bookings, conversations in parallel
      const [reviewsRes, bookingsRes, conversationsRes] = await Promise.all([
        supabase
          .from("reviews" as any)
          .select("rating, reviewer_name, comment, created_at")
          .eq("guide_user_id", user.id)
          .eq("hidden", false)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("bookings")
          .select("status")
          .eq("guide_user_id", user.id),
        supabase
          .from("conversations")
          .select("id")
          .eq("guide_user_id", user.id),
      ]);

      const reviews = (reviewsRes.data as any[]) || [];
      const bookings = bookingsRes.data || [];
      const conversations = conversationsRes.data || [];

      const totalRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);

      setAnalytics({
        totalReviews: reviews.length >= 5 ? reviews.length : reviews.length, // limited to 5 recent
        avgRating: reviews.length > 0 ? Math.round((totalRating / reviews.length) * 10) / 10 : 0,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter((b) => b.status === "pending").length,
        confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
        totalConversations: conversations.length,
        totalPhotos: 0, // will be set from photos state
        recentReviews: reviews.slice(0, 3).map((r: any) => ({
          reviewer_name: r.reviewer_name,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
        })),
      });

      // Get full review count (the query above is limited)
      const { count } = await supabase
        .from("reviews" as any)
        .select("id", { count: "exact", head: true })
        .eq("guide_user_id", user.id)
        .eq("hidden", false);

      if (count !== null) {
        setAnalytics((prev) => ({ ...prev, totalReviews: count }));
      }
    };

    fetchAnalytics();
  }, [user]);

  // Update photo count in analytics
  useEffect(() => {
    setAnalytics((prev) => ({ ...prev, totalPhotos: photos.length }));
  }, [photos]);

  const fetchPhotos = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.storage
      .from("guide-photos")
      .list(user.id, { limit: 30, sortBy: { column: "name", order: "asc" } });

    if (error || !data) return;

    const portfolioFiles = data.filter(
      (f) =>
        f.name.startsWith("portfolio-") &&
        /\.(jpg|jpeg|png|webp)$/i.test(f.name)
    );

    const items: PhotoItem[] = portfolioFiles.map((f) => {
      const { data: urlData } = supabase.storage
        .from("guide-photos")
        .getPublicUrl(`${user.id}/${f.name}`);
      return { name: f.name, url: urlData.publicUrl };
    });

    setPhotos(items);
  }, [user]);

  useEffect(() => {
    if (user) fetchPhotos();
  }, [user, fetchPhotos]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_PHOTOS} portfolio photos allowed.`);
      return;
    }

    const validFiles = Array.from(files).slice(0, remaining);
    const invalidFiles: string[] = [];

    for (const file of validFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        invalidFiles.push(`${file.name} (invalid type)`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name} (exceeds 5MB)`);
        continue;
      }
    }

    if (invalidFiles.length > 0) {
      toast.error(`Skipped: ${invalidFiles.join(", ")}`);
    }

    const toUpload = validFiles.filter(
      (f) => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE
    );

    if (toUpload.length === 0) return;

    setUploading(true);
    let successCount = 0;
    const rejectedFiles: string[] = [];

    for (const file of toUpload) {
      // Virus scan before committing to storage
      const scanResult = await scanFileForViruses(file);
      if (!scanResult.clean) {
        rejectedFiles.push(file.name);
        console.warn(`File rejected by virus scan: ${file.name}`);
        continue;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `portfolio-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

      const { error } = await supabase.storage
        .from("guide-photos")
        .upload(`${user.id}/${fileName}`, file, {
          contentType: file.type,
          upsert: false,
        });

      if (!error) successCount++;
      else console.error("Upload error:", error);
    }

    if (rejectedFiles.length > 0) {
      toast.error(`Rejected (malicious content detected): ${rejectedFiles.join(", ")}`);
    }
    if (successCount > 0) {
      toast.success(`${successCount} photo${successCount > 1 ? "s" : ""} uploaded!`);
      await fetchPhotos();
    }

    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (photo: PhotoItem) => {
    if (!user) return;
    setDeleting(photo.name);

    const { error } = await supabase.storage
      .from("guide-photos")
      .remove([`${user.id}/${photo.name}`]);

    if (error) {
      toast.error("Failed to delete photo.");
    } else {
      toast.success("Photo deleted.");
      setPhotos((prev) => prev.filter((p) => p.name !== photo.name));
    }
    setDeleting(null);
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${star <= rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <a href="/">
            <img
              src={logoImg}
              alt="iGuide Tours"
              className="h-8 w-8 rounded-full object-cover"
            />
          </a>
          <h1 className="font-display text-xl font-bold text-foreground">
            {t("guideDashboard.title", "Guide Dashboard")}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {guideName}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/guide-register")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("guideDashboard.editProfile", "Edit Profile")}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Analytics Overview */}
        <section>
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            {t("guideDashboard.analytics", "Analytics Overview")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              icon={Star}
              label={t("guideDashboard.avgRating", "Avg Rating")}
              value={analytics.avgRating > 0 ? analytics.avgRating : "—"}
              subValue={
                analytics.totalReviews > 0
                  ? `${analytics.totalReviews} ${analytics.totalReviews === 1 ? "review" : "reviews"}`
                  : "No reviews yet"
              }
              accent
            />
            <StatCard
              icon={Star}
              label={t("guideDashboard.reviews", "Reviews")}
              value={analytics.totalReviews}
            />
            <StatCard
              icon={CalendarCheck}
              label={t("guideDashboard.bookings", "Bookings")}
              value={analytics.totalBookings}
              subValue={
                analytics.pendingBookings > 0
                  ? `${analytics.pendingBookings} pending`
                  : undefined
              }
            />
            <StatCard
              icon={MessageSquare}
              label={t("guideDashboard.messages", "Conversations")}
              value={analytics.totalConversations}
            />
            <StatCard
              icon={Images}
              label={t("guideDashboard.photos", "Photos")}
              value={analytics.totalPhotos}
              subValue={`${MAX_PHOTOS - analytics.totalPhotos} slots left`}
            />
          </div>
        </section>

        {/* Recent Reviews */}
        {analytics.recentReviews.length > 0 && (
          <section className="bg-card rounded-2xl border border-border/50 p-6">
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t("guideDashboard.recentReviews", "Recent Reviews")}
            </h2>
            <div className="space-y-4">
              {analytics.recentReviews.map((review, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-1 pb-4 border-b border-border/30 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {review.reviewer_name}
                    </span>
                    {renderStars(review.rating)}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {review.comment}
                    </p>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
            {guideProfileId && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate(`/guide/${guideProfileId}`)}
              >
                <Eye className="w-4 h-4 mr-1" />
                {t("guideDashboard.viewProfile", "View Public Profile")}
              </Button>
            )}
          </section>
        )}

        {/* Credential Verification */}
        {user && <GuideVerificationUpload userId={user.id} />}

        {/* Bookings Management */}
        {user && <BookingsManager userId={user.id} guideName={guideName} />}

        {/* Availability Manager */}
        {user && <AvailabilityManager userId={user.id} />}

        {/* Portfolio Photos Section */}
        <section className="bg-card rounded-2xl border border-border/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Images className="w-5 h-5 text-primary" />
              {t("guideDashboard.portfolioPhotos", "Portfolio Photos")}
              <span className="text-sm font-normal text-muted-foreground">
                ({photos.length}/{MAX_PHOTOS})
              </span>
            </h2>

            <label
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                uploading || photos.length >= MAX_PHOTOS
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {uploading
                ? t("guideDashboard.uploading", "Uploading...")
                : t("guideDashboard.addPhotos", "Add Photos")}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleUpload}
                disabled={uploading || photos.length >= MAX_PHOTOS}
              />
            </label>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {t(
              "guideDashboard.portfolioHint",
              "Upload photos from your tours to showcase your experience. Accepted formats: JPG, PNG, WebP. Max 5MB each."
            )}
          </p>

          {photos.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {t(
                  "guideDashboard.noPhotosYet",
                  "No portfolio photos yet. Upload some to attract more travelers!"
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.name}
                  className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-border/50"
                >
                  <img
                    src={photo.url}
                    alt="Portfolio"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-200 flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(photo)}
                      disabled={deleting === photo.name}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/90"
                      aria-label="Delete photo"
                    >
                      {deleting === photo.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default GuideDashboard;
