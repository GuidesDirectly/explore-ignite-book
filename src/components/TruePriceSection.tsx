import { Link } from "react-router-dom";

const TruePriceSection = () => {
  return (
    <section
      className="w-full py-[72px]"
      style={{ backgroundColor: "#F0E6C8" }}
    >
      <div className="mx-auto px-4 text-center" style={{ maxWidth: 720 }}>
        {/* Eyebrow */}
        <p
          className="font-bold uppercase mb-6"
          style={{
            fontSize: 11,
            color: "#C9A84C",
            letterSpacing: "0.12em",
          }}
        >
          THE GUIDES DIRECTLY DIFFERENCE
        </p>

        {/* Main statement */}
        <h2
          className="font-serif font-bold mb-6 text-[28px] md:text-[40px]"
          style={{ color: "#0A1628", lineHeight: 1.3 }}
        >
          On other platforms, your guide keeps 70&nbsp;cents of every dollar you
          spend. Here, they keep 100%.
        </h2>

        {/* Supporting text */}
        <p
          className="mx-auto mb-10"
          style={{
            fontSize: 18,
            color: "rgba(10,22,40,0.7)",
            lineHeight: 1.8,
            maxWidth: 560,
          }}
        >
          That means better guides, fairer prices, and a human who is genuinely
          invested in your experience — not just fulfilling a booking.
        </p>

        {/* Stat pills */}
        <div className="flex justify-center gap-4 flex-wrap mb-10">
          {/* 30% pill */}
          <div
            className="rounded-xl px-8 py-5"
            style={{
              background: "rgba(192,57,43,0.08)",
              border: "1px solid rgba(192,57,43,0.25)",
            }}
          >
            <span
              className="block font-serif font-bold text-[36px] md:text-[48px] mb-1"
              style={{ color: "#C0392B" }}
            >
              30%
            </span>
            <span style={{ color: "rgba(10,22,40,0.6)", fontSize: 14 }}>
              taken by other platforms
            </span>
          </div>

          {/* 0% pill */}
          <div
            className="rounded-xl px-8 py-5"
            style={{
              background: "rgba(45,106,79,0.08)",
              border: "1px solid rgba(45,106,79,0.3)",
            }}
          >
            <span
              className="block font-serif font-bold text-[36px] md:text-[48px] mb-1"
              style={{ color: "#2D6A4F" }}
            >
              0%
            </span>
            <span style={{ color: "rgba(10,22,40,0.6)", fontSize: 14 }}>
              taken by Guides Directly
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link
          to="/guides"
          className="inline-block font-semibold rounded-lg transition-colors"
          style={{
            backgroundColor: "#C9A84C",
            color: "#0A1628",
            fontSize: 16,
            padding: "14px 32px",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#B8924A")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#C9A84C")
          }
        >
          Find a Guide — Pay Them Directly
        </Link>
      </div>
    </section>
  );
};

export default TruePriceSection;
