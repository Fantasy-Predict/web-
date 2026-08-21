"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

// Premium timing
const MIN_DISPLAY_MS = 1500; // 1.5s for progress animation
const HOLD_MS = 500;         // 0.5s hold at 100%
const MAX_DISPLAY_MS = 4000; // Safety fallback

const STATUS_STEPS = [
  { at: 0, label: "Loading" },
  { at: 30, label: "Preparing" },
  { at: 60, label: "Almost there" },
  { at: 85, label: "Finalising" },
];

const CIRCLE_R = 64; // Increased from 56 for more space
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

export function PageLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPathnameRef = useRef(pathname);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRenderRef = useRef(true);

  const startLoading = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    setIsLoading(true);
    setVisible(true);
    setProgress(0);
    startTimeRef.current = performance.now();

    const animateProgress = (now: number) => {
      const elapsed = now - (startTimeRef.current || 0);
      const pct = Math.min(elapsed / MIN_DISPLAY_MS, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setProgress(Math.round(eased * 100));

      if (pct < 1) {
        animationFrameRef.current = requestAnimationFrame(animateProgress);
      } else {
        timeoutRef.current = setTimeout(() => {
          setIsLoading(false);
          setVisible(false);
          setTimeout(() => setProgress(0), 100);
        }, HOLD_MS);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateProgress);

    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setVisible(false);
      setProgress(100);
    }, MAX_DISPLAY_MS);
  };

  // Detect route changes
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      prevPathnameRef.current = pathname;
      return;
    }

    if (pathname !== prevPathnameRef.current) {
      prevPathnameRef.current = pathname;
      startLoading();
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!visible) return null;

  const status = [...STATUS_STEPS].reverse().find((s) => progress >= s.at)?.label ?? STATUS_STEPS[0].label;
  const dashOffset = CIRCUMFERENCE - (Math.min(progress, 100) / 100) * CIRCUMFERENCE;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-background transition-opacity duration-300 ease-in"
      style={{ opacity: isLoading ? 1 : 0 }}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--color-primary) 22%, transparent) 0%, transparent 65%)",
          animation: "welcome-glow-pulse 2.6s ease-in-out infinite",
        }}
        aria-hidden
      />

      <div className="relative flex h-full w-full flex-col items-center justify-center gap-7">
        {/* Circular progress with logo – more padding around logo */}
        <div className="relative flex h-44 w-44 items-center justify-center">
          <svg
            viewBox="0 0 160 160"
            className="absolute inset-0 h-full w-full -rotate-90"
            aria-hidden
          >
            <circle
              cx="80"
              cy="80"
              r={CIRCLE_R}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="1.5"
            />
            <circle
              cx="80"
              cy="80"
              r={CIRCLE_R}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 80ms linear" }}
            />
          </svg>

          {/* FULL LOGO – smaller, with more padding inside the circle */}
          <div className="relative h-12 w-28">
            <Image
              src="/logos.png"
              alt="Fantasy Predict"
              fill
              priority
              className="object-contain block dark:hidden"
            />
            <Image
              src="/logos-white.png"
              alt="Fantasy Predict"
              fill
              priority
              className="object-contain hidden dark:block"
            />
          </div>
        </div>

        {/* Percentage */}
        <p className="num font-display text-3xl font-bold text-primary tabular-nums">
          {progress}%
        </p>

        {/* Status message */}
        <p className="text-xs font-medium tracking-[0.1em] text-muted-foreground uppercase">
          {status}
        </p>
      </div>
    </div>
  );
}