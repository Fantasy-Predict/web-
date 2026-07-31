"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import Image from "next/image";

const SESSION_KEY = "fp-welcome-shown";

// Step definitions
const STEPS = [
  { progress: 20, message: "Predict Matches" },
  { progress: 40, message: "Join Competitive Leagues" },
  { progress: 60, message: "Earn Points" },
  { progress: 80, message: "Climb the Leaderboard" },
  { progress: 100, message: "Claim Victory!" },
];

const TOTAL_DURATION = 5000; // 5 seconds total loading time

export function WelcomeSplash({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"unknown" | "playing" | "fading" | "done">("unknown");
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [ballX, setBallX] = useState(0);
  const [goalScored, setGoalScored] = useState(false);
  const [showGoalText, setShowGoalText] = useState(false);
  const [showNet, setShowNet] = useState(false);

  useLayoutEffect(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    if (alreadyShown) {
      setPhase("done");
    } else {
      sessionStorage.setItem(SESSION_KEY, "1");
      setPhase("playing");
    }
  }, []);

  // Progress animation
  useEffect(() => {
    if (phase !== "playing") return;

    const startTime = performance.now();
    let animationFrame: number;

    const updateProgress = (now: number) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
      const currentProgress = Math.round(rawProgress);
      setProgress(currentProgress);

      const ballPosition = Math.min((rawProgress / 100) * 85, 85);
      setBallX(ballPosition);

      if (currentProgress < 100) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else {
        setGoalScored(true);
        setShowGoalText(true);
        setShowNet(true);
        setTimeout(() => {
          setShowGoalText(false);
          setPhase("fading");
        }, 800);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(animationFrame);
  }, [phase]);

  // Update current step message based on progress
  useEffect(() => {
    let newIndex = -1;
    for (let i = 0; i < STEPS.length; i++) {
      if (progress >= STEPS[i].progress) {
        newIndex = i;
      }
    }
    setCurrentStepIndex(newIndex);
  }, [progress]);

  // Fade out transition
  useEffect(() => {
    if (phase !== "fading") return;
    const id = setTimeout(() => setPhase("done"), 600);
    return () => clearTimeout(id);
  }, [phase]);

  if (phase === "unknown" || phase === "done") return <>{children}</>;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-background"
        style={{
          clipPath: phase === "fading" ? "circle(0% at 50% 50%)" : "circle(150% at 50% 50%)",
          transition: `clip-path 600ms cubic-bezier(0.65, 0, 0.35, 1)`,
        }}
        role="status"
        aria-live="polite"
        aria-label="Loading Fantasy Predict"
      >
        {/* Subtle ambient glow – adapts to theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />

        {/* Main content */}
        <div className="relative flex flex-col items-center justify-center w-full max-w-3xl px-6 gap-6 sm:gap-8">

          {/* Header: Logo + Brand + Tagline */}
          <div className="text-center space-y-3">
            {/* Logo – adapts to light/dark mode like your navbar */}
            <div className="flex justify-center">
              <div className="relative h-12 w-[200px]">
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

            {/* Tagline – adapts to theme */}
            <p className="font-sans text-sm text-muted-foreground sm:text-base tracking-wide">
              Where Every Prediction Counts.
            </p>
          </div>

          {/* Football animation area – adapts to theme */}
          <div className="relative w-full h-40 sm:h-48 bg-muted/10 rounded-2xl overflow-hidden border border-border/30">
            {/* Goal net – positioned on the right side */}
            <div
              className="absolute right-0 top-0 h-full w-20 border-l-2 border-gold/30 transition-opacity duration-700"
              style={{ opacity: showNet || goalScored ? 1 : 0 }}
            >
              <div className="absolute inset-0 bg-gradient-to-l from-gold/5 to-transparent" />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(244,180,0,0.08) 8px, rgba(244,180,0,0.08) 9px),
                    repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(244,180,0,0.08) 8px, rgba(244,180,0,0.08) 9px)
                  `
                }}
              />
              {/* Goal posts */}
              <div className="absolute top-0 left-0 h-full w-0.5 bg-gold/20" />
              <div className="absolute top-0 right-0 h-full w-0.5 bg-gold/20" />
              <div className="absolute top-0 left-0 h-0.5 w-full bg-gold/20" />
            </div>

            {/* Football – moves from left to right */}
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-200 ease-linear"
              style={{
                left: `${Math.min(ballX, 85)}%`,
                transform: `translateX(-50%) translateY(-50%)`,
              }}
            >
              <div
                className="h-16 w-16 sm:h-20 sm:w-20"
                style={{
                  animation: goalScored
                    ? "welcome-ball-spin 0.5s linear infinite"
                    : `welcome-ball-spin ${2 - progress / 100 * 1.5}s linear infinite`,
                }}
              >
                <Image
                  src="/soccer_ball.svg"
                  alt="Football"
                  width={80}
                  height={80}
                  priority
                  className="h-full w-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                  unoptimized
                />
              </div>
            </div>

            {/* GOAL! burst – adapts to theme */}
            {showGoalText && (
              <div className="absolute inset-0 flex items-center justify-center animate-welcome-goal-burst">
                <span className="font-display text-5xl sm:text-6xl font-extrabold text-gold drop-shadow-[0_0_40px_rgba(244,180,0,0.3)]">
                  GOAL!
                </span>
              </div>
            )}
          </div>

          {/* Loading status: percentage + message – adapts to theme */}
          <div className="text-center space-y-1">
            <p className="font-sans text-sm font-medium text-muted-foreground tracking-wider">
              Loading... {progress}%
            </p>
            <div className="h-6 flex items-center justify-center">
              {currentStepIndex >= 0 && (
                <p
                  key={currentStepIndex}
                  className="font-display text-base font-semibold text-foreground transition-opacity duration-300"
                >
                  {STEPS[currentStepIndex].message}
                </p>
              )}
            </div>
          </div>

          {/* Progress bar – adapts to theme */}
          <div className="w-full max-w-xs h-0.5 rounded-full overflow-hidden bg-border/30">
            <div
              className="h-full rounded-full bg-gold transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Subtle bottom fade – adapts to theme */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>
      {children}
    </>
  );
}