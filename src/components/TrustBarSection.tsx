import { useRef, useState, useEffect, useCallback } from "react";
import { ShieldCheck, DollarSign, Globe, MessageCircle } from "lucide-react";

interface StatCard {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  isText?: boolean;
  textValue?: string;
}

const stats: StatCard[] = [
  { icon: ShieldCheck, value: 0, suffix: "%", label: "Commission — ever" },
  { icon: DollarSign, value: 100, suffix: "%", label: "Goes directly to your guide" },
  { icon: Globe, value: 21, suffix: "", label: "Languages spoken by our guides" },
  { icon: MessageCircle, value: 0, suffix: "", label: "Guide to traveler connection", isText: true, textValue: "Direct" },
];

const DURATION = 1200;

const TrustBarSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));
  const [visible, setVisible] = useState(false);

  const animate = useCallback(() => {
    const start = performance.now();
    const targets = stats.map((s) => s.value);

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);

      setCounts(targets.map((t) => Math.round(eased * t)));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          setVisible(true);
          animate();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, animate]);

  return (
    <section
      ref={sectionRef}
      className="w-full py-12 border-t"
      style={{
        backgroundColor: "#0A1628",
        borderTopColor: "rgba(201,168,76,0.2)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center transition-opacity duration-700 ${
                visible ? "opacity-100" : "opacity-0"
              } ${
                i < stats.length - 1
                  ? "md:border-r md:border-[rgba(201,168,76,0.2)]"
                  : ""
              }`}
            >
              <stat.icon className="w-5 h-5 mb-2" style={{ color: "#C9A84C" }} />
              <span
                className="font-serif font-bold text-4xl md:text-[48px] leading-none"
                style={{ color: "#C9A84C" }}
              >
                {stat.isText
                  ? stat.textValue
                  : `${counts[i]}${stat.suffix}`}
              </span>
              <span
                className="text-sm mt-1"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBarSection;
