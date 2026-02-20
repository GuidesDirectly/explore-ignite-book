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
  GripVertical,
} from "lucide-react";
import logoImg from "@/assets/logo.jpg";

interface PhotoItem {
  name: string;
  url: string;
}

const MAX_PHOTOS = 20;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const GuideDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [guideName, setGuideName] = useState("");

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

      // Fetch guide profile name
      const { data: profile } = await supabase
        .from("guide_profiles")
        .select("form_data")
        .eq("user_id", u.id)
        .maybeSingle();

      if (!profile) {
        navigate("/guide-register");
        return;
      }

      const fd = profile.form_data as any;
      setGuideName(`${fd.firstName || ""} ${fd.lastName || ""}`.trim());
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

    for (const file of toUpload) {
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

    if (successCount > 0) {
      toast.success(`${successCount} photo${successCount > 1 ? "s" : ""} uploaded!`);
      await fetchPhotos();
    }

    setUploading(false);
    // Reset file input
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
