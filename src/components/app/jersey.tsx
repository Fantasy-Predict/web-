"use client";

import { useState } from "react";
import { cn } from "@/app/lib/utils";

// Official FPL jersey artwork served from Premier League's CDN.
// Outfield: shirt_{teamCode}-220.png | Goalkeeper: shirt_{teamCode}_1-220.png
// Uses the 220px size (what FPL's own Pick Team page serves) so it's crisper
// at larger render sizes on retina screens.
const jerseyUrl = (teamCode: number, position: number) => {
  const gk = position === 1 ? "_1" : "";
  return `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${teamCode}${gk}-220.png`;
};

const POS_LABEL: Record<number, string> = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };
const POS_COLOR: Record<number, string> = {
  1: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  2: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  3: "bg-gold/20 text-gold",
  4: "bg-red-500/20 text-red-700 dark:text-red-400",
};

export function Jersey({
  teamCode,
  position,
  clubShort,
  size = "md",
  className,
}: {
  teamCode: number | undefined;
  position: number;
  clubShort?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  // onError fallback covers both failure modes: teamCode == 0 (data not synced)
  // AND FPL's CDN returning 404 for a specific club's jersey file — either way
  // we drop back to the coloured position badge instead of showing a broken image.
  const [failed, setFailed] = useState(false);
  const hasTeamCode = (teamCode ?? 0) > 0;

  const sizeClass =
    size === "sm"
      ? "h-9 w-9 sm:h-11 sm:w-11"
      : size === "lg"
        ? "h-16 w-16 sm:h-20 sm:w-20"
        : "h-12 w-12 sm:h-16 sm:w-16";

  if (!hasTeamCode || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full font-bold",
          size === "sm" ? "text-[9px] sm:text-xs" : size === "lg" ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs",
          sizeClass,
          POS_COLOR[position],
          className,
        )}
      >
        {POS_LABEL[position]}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={jerseyUrl(teamCode!, position)}
      alt={`${clubShort ?? ""} ${POS_LABEL[position]} jersey`}
      className={cn("object-contain select-none", sizeClass, className)}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
