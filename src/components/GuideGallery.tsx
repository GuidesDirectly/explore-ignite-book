import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Images, X, ChevronLeft, ChevronRight } from "lucide-react";

interface GuideGalleryProps {
  guideUserId: string;
}

const GuideGallery = ({ guideUserId }: GuideGalleryProps) => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase.storage
        .from("guide-photos")
        .list(guideUserId, { limit: 20, sortBy: { column: "name", order: "asc" } });

      if (error || !data) return;

      const portfolioFiles = data.filter(
        (f) => f.name.startsWith("portfolio-") && /\.(jpg|jpeg|png|webp)$/i.test(f.name)
      );

      const urls = portfolioFiles.map((f) => {
        const { data: urlData } = supabase.storage
          .from("guide-photos")
          .getPublicUrl(`${guideUserId}/${f.name}`);
        return urlData.publicUrl;
      });

      setPhotos(urls);
    };

    fetchPhotos();
  }, [guideUserId]);

  if (photos.length === 0) return null;

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const prevPhoto = () => setLightboxIdx((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null));
  const nextPhoto = () => setLightboxIdx((i) => (i !== null ? (i + 1) % photos.length : null));

  return (
    <>
      <section className="bg-card rounded-2xl border border-border/50 p-6">
        <h2 className="font-display text-xl font-bold text-foreground mb-4">
          <Images className="w-5 h-5 inline mr-2 text-primary" />
          {t("guideProfile.gallery", "Tour Gallery")}
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({photos.length})
          </span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((url, idx) => (
            <motion.button
              key={url}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => openLightbox(idx)}
              className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <img
                src={url}
                alt={`Tour photo ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-foreground/90 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-background/80 hover:text-background transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                  className="absolute left-4 text-background/80 hover:text-background transition-colors z-10"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                  className="absolute right-4 text-background/80 hover:text-background transition-colors z-10"
                  aria-label="Next"
                >
                  <ChevronRight className="w-10 h-10" />
                </button>
              </>
            )}

            {/* Image */}
            <motion.img
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={photos[lightboxIdx]}
              alt={`Tour photo ${lightboxIdx + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-background/70 text-sm">
              {lightboxIdx + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GuideGallery;
