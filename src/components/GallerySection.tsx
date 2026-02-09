import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";

import galleryLincoln from "@/assets/gallery-lincoln.jpg";
import galleryCentralPark from "@/assets/gallery-centralpark.jpg";
import galleryNiagara from "@/assets/gallery-niagara-selfie.jpg";
import galleryCapitol from "@/assets/gallery-capitol.jpg";
import galleryBrooklyn from "@/assets/gallery-brooklyn.jpg";
import galleryVip from "@/assets/gallery-vip.jpg";

const photos = [
  { src: galleryLincoln, alt: "Group tour at the Lincoln Memorial", caption: "Lincoln Memorial, DC" },
  { src: galleryCentralPark, alt: "Walking tour through Central Park in autumn", caption: "Central Park, NYC" },
  { src: galleryNiagara, alt: "Selfie at Niagara Falls with rainbow", caption: "Niagara Falls" },
  { src: galleryCapitol, alt: "Tour guide at the US Capitol", caption: "US Capitol Tour" },
  { src: galleryBrooklyn, alt: "Happy family on Brooklyn Bridge at sunset", caption: "Brooklyn Bridge, NYC" },
  { src: galleryVip, alt: "VIP sunset tour at the National Mall", caption: "VIP Sunset Tour, DC" },
];

const GallerySection = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const { t } = useTranslation();

  return (
    <section id="gallery" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
            {t("gallery.label")}
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("gallery.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("gallery.subtitle")}
          </p>
        </motion.div>

        {/* Masonry-style grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.caption}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setSelected(i)}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/40 transition-colors duration-300 flex items-end">
                <div className="p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 w-full">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium" style={{ color: "hsl(40, 33%, 97%)" }}>
                      {photo.caption}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-secondary/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 text-primary-foreground/70 hover:text-primary transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={photos[selected].src}
              alt={photos[selected].alt}
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="absolute bottom-8 text-center font-display text-lg" style={{ color: "hsl(40, 33%, 90%)" }}>
              {photos[selected].caption}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;
