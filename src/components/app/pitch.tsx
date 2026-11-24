"use client";

import type { ReactNode } from "react";
import { cn } from "@/app/lib/utils";

// Football pitch backdrop matching the official FPL Pick Team look.
// Pure inline SVG — no external images, no CDN dependency, scales to any size.
// Uses two shades of green with painted lines for the 18-yard box, 6-yard
// box, penalty spot, center circle and halfway line. Lines read well in
// both light and dark themes.
export function Pitch({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-emerald-900/30 shadow-inner",
        className,
      )}
    >
      {/* Pitch background */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 150"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <pattern id="pitch-stripes" x="0" y="0" width="100" height="15" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="100" height="15" fill="#1e7a44" />
            <rect x="0" y="7.5" width="100" height="7.5" fill="#1a6c3c" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100" height="150" fill="url(#pitch-stripes)" />
        {/* Outer boundary */}
        <rect x="2" y="2" width="96" height="146" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
        {/* Halfway line */}
        <line x1="2" y1="75" x2="98" y2="75" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
        {/* Center circle */}
        <circle cx="50" cy="75" r="10" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
        <circle cx="50" cy="75" r="0.6" fill="rgba(255,255,255,0.4)" />
        {/* Top penalty area (defending end) */}
        <rect x="25" y="2" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
        <rect x="37" y="2" width="26" height="7" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
        <circle cx="50" cy="12" r="0.6" fill="rgba(255,255,255,0.4)" />
        <path d="M 40 20 A 10 10 0 0 0 60 20" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
        {/* Bottom penalty area (attacking end) */}
        <rect x="25" y="130" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
        <rect x="37" y="141" width="26" height="7" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
        <circle cx="50" cy="138" r="0.6" fill="rgba(255,255,255,0.4)" />
        <path d="M 40 130 A 10 10 0 0 1 60 130" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
      </svg>

      {/* Row content on top of the pitch */}
      <div className="relative z-10 flex flex-col items-stretch justify-between gap-3 px-2 py-4 sm:gap-4 sm:px-4 sm:py-6">
        {children}
      </div>
    </div>
  );
}
