import { Crown, AlertTriangle } from "lucide-react";
import type { FoundingProgramData } from "@/hooks/useFoundingProgram";

interface FoundingProgramBannerProps {
  program: FoundingProgramData | null;
}

/**
 * Gold banner shown on the Guide Registration page advertising the
 * Founding Guide program. Switches to a "spots full" message when
 * remaining <= 0.
 */
const FoundingProgramBanner = ({ program }: FoundingProgramBannerProps) => {
  if (!program) return null;

  const { remaining, limit, freeUntil, lockedPrice, isFull } = program;
  const freeUntilLabel = (() => {
    try {
      return new Date(freeUntil + "T12:00:00Z").toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return freeUntil;
    }
  })();

  if (isFull) {
    return (
      <div
        className="rounded-xl p-5 mb-6 text-center"
        style={{
          backgroundColor: "rgba(201,168,76,0.08)",
          border: "1px solid rgba(201,168,76,0.3)",
        }}
      >
        <p className="font-semibold mb-1" style={{ color: "#0A1628", fontSize: 16 }}>
          Founding Guide spots are now full
        </p>
        <p style={{ color: "#475569", fontSize: 14 }}>
          Join as a Pro guide for ${lockedPrice}/mo and start receiving inquiries today.
        </p>
      </div>
    );
  }

  const lowSpots = remaining < 10;

  return (
    <div
      className="rounded-xl p-5 mb-6"
      style={{
        background: "linear-gradient(135deg, #C9A84C 0%, #B8924A 100%)",
        color: "#0A1628",
      }}
    >
      <div className="flex items-start gap-3">
        <Crown className="w-5 h-5 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
        <div className="flex-1">
          <p className="font-bold uppercase tracking-wide" style={{ fontSize: 11, letterSpacing: "0.08em" }}>
            Founding Guide Program
          </p>
          <p className="font-bold mt-1" style={{ fontSize: 18 }}>
            {remaining} of {limit} spots remaining
          </p>
          <p className="mt-2" style={{ fontSize: 14, lineHeight: 1.5 }}>
            <strong>Free until {freeUntilLabel}.</strong> Then locked at{" "}
            <strong>${lockedPrice}/mo — guaranteed forever</strong>
            {" "}(others will pay double).
          </p>
          {lowSpots && (
            <div
              className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ backgroundColor: "#0A1628", color: "#C9A84C", fontSize: 12, fontWeight: 600 }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Only {remaining} spots left — register today
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoundingProgramBanner;
