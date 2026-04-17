import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, ArrowUp, ArrowDown, ImageIcon } from "lucide-react";

interface TourPhotosUploaderProps {
  userId: string;
  tourId?: string | null;
  photos: string[];
  onChange: (photos: string[]) => void;
  required: number;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const MAX_PHOTOS = 12;

const TourPhotosUploader = ({
  userId,
  tourId,
  photos,
  onChange,
  required,
}: TourPhotosUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const folder = tourId ? `tour-${tourId}` : `tour-draft-${Date.now()}`;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (photos.length + files.length > MAX_PHOTOS) {
      toast.error(`You can upload up to ${MAX_PHOTOS} photos per tour.`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (!ACCEPTED.includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG, or WebP allowed.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name}: max 6 MB per photo.`);
        continue;
      }

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${folder}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from("guide-photos")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${file.name}.`);
        continue;
      }

      const { data } = supabase.storage.from("guide-photos").getPublicUrl(path);
      if (data?.publicUrl) newUrls.push(data.publicUrl);
    }

    if (newUrls.length > 0) {
      onChange([...photos, ...newUrls]);
      toast.success(
        `Uploaded ${newUrls.length} photo${newUrls.length > 1 ? "s" : ""}.`
      );
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (idx: number) => {
    onChange(photos.filter((_, i) => i !== idx));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...photos];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const shortfall = Math.max(0, required - photos.length);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {photos.length} / {MAX_PHOTOS} photos •{" "}
          <span className={shortfall > 0 ? "text-destructive font-medium" : "text-primary"}>
            {shortfall > 0
              ? `${shortfall} more required to publish`
              : `Minimum met (${required})`}
          </span>
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || photos.length >= MAX_PHOTOS}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-1" /> Add Photos
            </>
          )}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {photos.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
          <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-1">
            Add at least {required} photos to publish your tour
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP — up to 6 MB each
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((url, idx) => (
            <div
              key={url + idx}
              className="relative group rounded-lg overflow-hidden border border-border/50 aspect-[4/3] bg-muted"
            >
              <img
                src={url}
                alt={`Tour photo ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded">
                  COVER
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-1.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="bg-white/90 hover:bg-white text-foreground p-1 rounded disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === photos.length - 1}
                    className="bg-white/90 hover:bg-white text-foreground p-1 rounded disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="bg-destructive/90 hover:bg-destructive text-destructive-foreground p-1 rounded"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TourPhotosUploader;
