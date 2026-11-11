"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, Star } from "lucide-react";
import { toast } from "sonner";
import {
  getFplTeam,
  getFplCurrentGameweek,
  getFplGameweeks,
  getFplPicks,
  saveFplPicks,
  type FplTeam,
  type FplPlayer,
  type FplPick,
  type FplPickPlayer,
  type FplGameweek,
} from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

// --- Types ---

type PickState = {
  player: FplPlayer;
  squadPosition: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
};

type FormationKey = "3-4-3" | "3-5-2" | "4-3-3" | "4-4-2" | "4-5-1" | "5-3-2" | "5-4-1";

// --- Constants ---

const POS_LABEL: Record<number, string> = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };
const POS_COLOR: Record<number, string> = {
  1: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  2: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  3: "bg-gold/20 text-gold",
  4: "bg-red-500/20 text-red-700 dark:text-red-400",
};

const FORMATIONS: Record<FormationKey, { defs: number; mids: number; fwds: number }> = {
  "3-4-3": { defs: 3, mids: 4, fwds: 3 },
  "3-5-2": { defs: 3, mids: 5, fwds: 2 },
  "4-3-3": { defs: 4, mids: 3, fwds: 3 },
  "4-4-2": { defs: 4, mids: 4, fwds: 2 },
  "4-5-1": { defs: 4, mids: 5, fwds: 1 },
  "5-3-2": { defs: 5, mids: 3, fwds: 2 },
  "5-4-1": { defs: 5, mids: 4, fwds: 1 },
};

const CHIPS = [
  { key: "triple_captain" as const, label: "Triple Captain", chipped: "tripleCaptain" as const, desc: "Captain scores 3×" },
  { key: "bench_boost" as const, label: "Bench Boost", chipped: "benchBoost" as const, desc: "All 15 players score" },
  { key: "free_hit" as const, label: "Free Hit", chipped: "freeHit" as const, desc: "Unlimited free transfers for 1 GW" },
  { key: "wildcard" as const, label: "Wildcard", chipped: "wildcard1" as const, desc: "Unlimited free transfers" },
];

// --- Helpers ---

function getSubLabels(position: number, count: number): string[] {
  if (position === 1) return ["GK"];
  if (position === 2) {
    const m: Record<number, string[]> = {
      3: ["CB", "CB", "CB"],
      4: ["LB", "CB", "CB", "RB"],
      5: ["LB", "CB", "CB", "CB", "RB"],
    };
    return m[count] ?? Array(count).fill("DEF");
  }
  if (position === 3) {
    const m: Record<number, string[]> = {
      2: ["CM", "CM"],
      3: ["LM", "CM", "RM"],
      4: ["LM", "CM", "CM", "RM"],
      5: ["LM", "CM", "CAM", "CM", "RM"],
    };
    return m[count] ?? Array(count).fill("MID");
  }
  if (position === 4) {
    const m: Record<number, string[]> = {
      1: ["ST"],
      2: ["ST", "ST"],
      3: ["LW", "ST", "RW"],
    };
    return m[count] ?? Array(count).fill("FWD");
  }
  return [];
}

function detectFormation(picks: PickState[]): string {
  const starters = picks.filter(p => p.squadPosition <= 11);
  const d = starters.filter(p => p.player.position === 2).length;
  const m = starters.filter(p => p.player.position === 3).length;
  const f = starters.filter(p => p.player.position === 4).length;
  if (d === 0 && m === 0 && f === 0) return "4-4-2";
  return `${d}-${m}-${f}`;
}

function applyFormation(picks: PickState[], newFormation: FormationKey): PickState[] {
  const { defs, mids, fwds } = FORMATIONS[newFormation];
  const captainId = picks.find(p => p.isCaptain)?.player.fplId;
  const vcId = picks.find(p => p.isViceCaptain)?.player.fplId;

  const byPos: Record<number, PickState[]> = {};
  for (const p of picks) {
    const pos = p.player.position;
    if (!byPos[pos]) byPos[pos] = [];
    byPos[pos].push(p);
  }
  // Preserve current starters first, then rank remainder by totalPoints
  for (const pos of [1, 2, 3, 4]) {
    if (!byPos[pos]) byPos[pos] = [];
    byPos[pos].sort((a, b) => {
      const aS = a.squadPosition <= 11 ? 0 : 1;
      const bS = b.squadPosition <= 11 ? 0 : 1;
      return aS !== bS ? aS - bS : b.player.totalPoints - a.player.totalPoints;
    });
  }

  const result: PickState[] = [];
  let slot = 1;
  const push = (p: PickState) =>
    result.push({ ...p, squadPosition: slot++, isCaptain: false, isViceCaptain: false });

  if (byPos[1]?.[0]) push(byPos[1][0]);
  (byPos[2] ?? []).slice(0, defs).forEach(push);
  (byPos[3] ?? []).slice(0, mids).forEach(push);
  (byPos[4] ?? []).slice(0, fwds).forEach(push);
  if (byPos[1]?.[1]) push(byPos[1][1]);
  [
    ...(byPos[2] ?? []).slice(defs),
    ...(byPos[3] ?? []).slice(mids),
    ...(byPos[4] ?? []).slice(fwds),
  ]
    .slice(0, 3)
    .forEach(push);

  return result.map(p => ({
    ...p,
    isCaptain: p.player.fplId === captainId && p.squadPosition <= 11,
    isViceCaptain: p.player.fplId === vcId && p.squadPosition <= 11,
  }));
}

function buildInitialPicks(playerDetails: FplPlayer[], existingPicks: FplPick | null): PickState[] {
  if (existingPicks && existingPicks.players.length === 15) {
    const playerMap = new Map(playerDetails.map(p => [p.fplId, p]));
    return existingPicks.players
      .map(pick => ({
        player: playerMap.get(pick.fplId)!,
        squadPosition: pick.squadPosition,
        isCaptain: pick.isCaptain,
        isViceCaptain: pick.isViceCaptain,
      }))
      .filter(p => p.player != null);
  }

  // Default 4-4-2: 1 GK + 4 DEF + 4 MID + 2 FWD starting; GK2 bench slot 1
  const byPos: Record<number, FplPlayer[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const p of playerDetails) (byPos[p.position] ??= []).push(p);
  for (const pos of [1, 2, 3, 4]) byPos[pos].sort((a, b) => b.totalPoints - a.totalPoints);

  const result: PickState[] = [];
  let slot = 1;
  const mk = (p: FplPlayer) => ({ player: p, squadPosition: slot++, isCaptain: false, isViceCaptain: false });

  if (byPos[1][0]) result.push(mk(byPos[1][0]));
  byPos[2].slice(0, 4).forEach(p => result.push(mk(p)));
  byPos[3].slice(0, 4).forEach(p => result.push(mk(p)));
  byPos[4].slice(0, 2).forEach(p => result.push(mk(p)));
  if (byPos[1][1]) result.push(mk(byPos[1][1]));
  [...byPos[2].slice(4), ...byPos[3].slice(4), ...byPos[4].slice(2)]
    .slice(0, 3)
    .forEach(p => result.push(mk(p)));
  return result;
}

function validateFormation(picks: PickState[]): string | null {
  const starters = picks.filter(p => p.squadPosition <= 11);
  const gks = starters.filter(p => p.player.position === 1);
  const defs = starters.filter(p => p.player.position === 2);
  const mids = starters.filter(p => p.player.position === 3);
  const fwds = starters.filter(p => p.player.position === 4);

  if (gks.length !== 1) return "Starting 11 must include exactly 1 goalkeeper";
  if (defs.length < 3) return "Starting 11 must include at least 3 defenders";
  if (mids.length < 2) return "Starting 11 must include at least 2 midfielders";
  if (fwds.length < 1) return "Starting 11 must include at least 1 forward";
  if (starters.filter(p => p.isCaptain).length !== 1) return "Select a captain from your starting 11";
  if (starters.filter(p => p.isViceCaptain).length !== 1) return "Select a vice-captain from your starting 11";
  return null;
}

// --- Sub-components ---

interface PitchCardProps {
  pick: PickState;
  subLabel: string;
  disabled: boolean;
  isSelected: boolean;
  isPanelOpen: boolean;
  onPlayerClick: (id: number) => void;
  onCaptainToggle: (id: number) => void;
}

function PitchCard({
  pick,
  subLabel,
  disabled,
  isSelected,
  isPanelOpen,
  onPlayerClick,
  onCaptainToggle,
}: PitchCardProps) {
  const parts = pick.player.name.split(" ");
  const shortName =
    parts.length > 1
      ? `${parts[0][0]}.${parts[parts.length - 1]}`
      : pick.player.name.slice(0, 9);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && onPlayerClick(pick.player.fplId)}
        disabled={disabled}
        className={cn(
          "flex flex-col items-center rounded-xl border px-1.5 py-2 text-center transition-all",
          isSelected
            ? "border-primary bg-primary/20 shadow-lg shadow-primary/30"
            : "border-white/15 bg-black/40 hover:bg-black/60",
          disabled && "cursor-default opacity-70",
        )}
        style={{ minWidth: "58px", maxWidth: "72px" }}
      >
        <span className="mb-0.5 text-[8px] font-bold uppercase tracking-wide text-white/50">
          {subLabel}
        </span>
        <span className="w-full truncate text-center text-[11px] font-bold leading-tight text-white">
          {shortName}
        </span>
        <span className="text-[8px] text-white/50">{pick.player.clubShort}</span>
        <span className="mt-1 text-[9px] font-semibold text-white/70">
          {pick.player.currentGwPoints}pts
        </span>
      </button>

      {/* Captain / VC badge */}
      {(pick.isCaptain || pick.isViceCaptain) && (
        <span
          className={cn(
            "pointer-events-none absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold",
            pick.isCaptain ? "bg-yellow-400 text-black" : "bg-slate-400 text-black",
          )}
        >
          {pick.isCaptain ? "C" : "V"}
        </span>
      )}

      {/* Captain toggle button */}
      {!disabled && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onCaptainToggle(pick.player.fplId);
          }}
          className={cn(
            "absolute -bottom-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border text-[7px] font-bold transition-all",
            isPanelOpen
              ? "border-gold bg-gold text-navy"
              : "border-white/25 bg-black/50 text-white/50 hover:border-gold/50 hover:text-gold",
          )}
          title="Set captain / vice-captain"
        >
          C
        </button>
      )}
    </div>
  );
}

function RowCaptainPanel({
  pick,
  onCaptain,
  onViceCaptain,
}: {
  pick: PickState;
  onCaptain: (id: number) => void;
  onViceCaptain: (id: number) => void;
}) {
  return (
    <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-gold/30 bg-black/60 px-3 py-2 backdrop-blur">
      <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-white">
        {pick.player.name}
      </span>
      <div className="flex shrink-0 gap-1.5">
        <button
          type="button"
          onClick={() => onCaptain(pick.player.fplId)}
          className={cn(
            "flex h-7 items-center gap-1 rounded-lg border px-2 text-[10px] font-bold transition-all",
            pick.isCaptain
              ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
              : "border-white/20 bg-white/5 text-white/60 hover:border-yellow-500/60 hover:text-yellow-400",
          )}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500/30 text-[8px]">
            C
          </span>
          Captain
        </button>
        <button
          type="button"
          onClick={() => onViceCaptain(pick.player.fplId)}
          className={cn(
            "flex h-7 items-center gap-1 rounded-lg border px-2 text-[10px] font-bold transition-all",
            pick.isViceCaptain
              ? "border-slate-400 bg-slate-400/20 text-slate-300"
              : "border-white/20 bg-white/5 text-white/60 hover:border-slate-400/60 hover:text-slate-300",
          )}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-400/30 text-[8px]">
            V
          </span>
          Vice-C
        </button>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function FplPicksPage() {
  const [team, setTeam] = useState<FplTeam | null>(null);
  const [gw, setGw] = useState<FplGameweek | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [picks, setPicks] = useState<PickState[]>([]);
  const [formation, setFormation] = useState<string>("4-4-2");
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [captainPanel, setCaptainPanel] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([getFplTeam(), getFplCurrentGameweek()]).then(async ([teamData, gwData]) => {
      if (!active) return;
      if (!teamData || !gwData) { setLoading(false); return; }
      setTeam(teamData);

      let activeGw = gwData;
      if (gwData.deadline && new Date() > new Date(gwData.deadline)) {
        const allGws = await getFplGameweeks().catch(() => [] as FplGameweek[]);
        const nextGw = allGws.find(gw => gw.isNext);
        if (nextGw) activeGw = nextGw;
      }
      setGw(activeGw);

      const existingPicks = await getFplPicks(activeGw.fplId).catch(() => null);
      if (!active) return;
      if (existingPicks?.chip) setSelectedChip(existingPicks.chip);
      const built = buildInitialPicks(teamData.playerDetails ?? [], existingPicks);
      setPicks(built);
      setFormation(detectFormation(built));
      setLoading(false);
    }).catch(err => {
      if (!active) return;
      toast.error(err instanceof Error ? err.message : "Failed to load picks");
      setLoading(false);
    });

    return () => { active = false; };
  }, []);

  function handleFormationChange(newFormation: FormationKey) {
    setFormation(newFormation);
    setPicks(prev => applyFormation(prev, newFormation));
    setSelectedPlayer(null);
    setCaptainPanel(null);
  }

  function handlePlayerClick(fplId: number) {
    const pick = picks.find(p => p.player.fplId === fplId);
    if (!pick) return;

    if (selectedPlayer === null) {
      setSelectedPlayer(fplId);
      return;
    }
    if (selectedPlayer === fplId) {
      setSelectedPlayer(null);
      return;
    }

    const srcPick = picks.find(p => p.player.fplId === selectedPlayer);
    const dstPick = pick;
    if (!srcPick) { setSelectedPlayer(null); return; }

    const srcPos = srcPick.squadPosition;
    const dstPos = dstPick.squadPosition;
    const srcIsStarter = srcPos <= 11;
    const dstIsStarter = dstPos <= 11;

    if (srcIsStarter !== dstIsStarter) {
      // Simulate swap and check exactly 1 GK in starting 11
      const startersAfterSwap = picks
        .map(p => {
          if (p.player.fplId === srcPick.player.fplId) return { ...p, squadPosition: dstPos };
          if (p.player.fplId === dstPick.player.fplId) return { ...p, squadPosition: srcPos };
          return p;
        })
        .filter(p => p.squadPosition <= 11);
      const gkCount = startersAfterSwap.filter(p => p.player.position === 1).length;
      if (gkCount !== 1) {
        toast.error("Starting 11 must have exactly 1 goalkeeper");
        setSelectedPlayer(null);
        return;
      }
    }

    setPicks(prev => {
      const updated = prev.map(p => {
        if (p.player.fplId === selectedPlayer)
          return {
            ...p,
            squadPosition: dstPos,
            isCaptain: dstIsStarter ? p.isCaptain : false,
            isViceCaptain: dstIsStarter ? p.isViceCaptain : false,
          };
        if (p.player.fplId === fplId)
          return {
            ...p,
            squadPosition: srcPos,
            isCaptain: srcIsStarter ? p.isCaptain : false,
            isViceCaptain: srcIsStarter ? p.isViceCaptain : false,
          };
        return p;
      });
      setFormation(detectFormation(updated));
      return updated;
    });
    setSelectedPlayer(null);
  }

  function makeCaptain(fplId: number) {
    const pick = picks.find(p => p.player.fplId === fplId);
    if (!pick || pick.squadPosition > 11) return;
    setPicks(prev =>
      prev.map(p => {
        if (p.player.fplId === fplId) return { ...p, isCaptain: true, isViceCaptain: false };
        return { ...p, isCaptain: false };
      }),
    );
    setCaptainPanel(null);
  }

  function makeViceCaptain(fplId: number) {
    const pick = picks.find(p => p.player.fplId === fplId);
    if (!pick || pick.squadPosition > 11) return;
    setPicks(prev =>
      prev.map(p => {
        if (p.player.fplId === fplId) return { ...p, isViceCaptain: true, isCaptain: false };
        return { ...p, isViceCaptain: false };
      }),
    );
    setCaptainPanel(null);
  }

  async function handleSave() {
    if (!gw) return;
    const error = validateFormation(picks);
    if (error) { toast.error(error); return; }

    setSaving(true);
    try {
      const payload: FplPickPlayer[] = picks.map(p => ({
        fplId: p.player.fplId,
        squadPosition: p.squadPosition,
        isCaptain: p.isCaptain,
        isViceCaptain: p.isViceCaptain,
        multiplier:
          p.squadPosition <= 11
            ? p.isCaptain
              ? selectedChip === "triple_captain"
                ? 3
                : 2
              : 1
            : 0,
      }));
      await saveFplPicks({ gwId: gw.fplId, players: payload, chip: selectedChip });
      toast.success("Picks saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save picks");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <FplShell title="GW Picks">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </FplShell>
    );
  }

  if (!team || !gw) {
    return (
      <FplShell title="GW Picks">
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Unable to load gameweek data. Please try again.
          </CardContent>
        </Card>
      </FplShell>
    );
  }

  const starters = [...picks]
    .filter(p => p.squadPosition <= 11)
    .sort((a, b) => a.squadPosition - b.squadPosition);
  const bench = [...picks]
    .filter(p => p.squadPosition > 11)
    .sort((a, b) => a.squadPosition - b.squadPosition);

  const gkRow = starters.filter(p => p.player.position === 1);
  const defRow = starters.filter(p => p.player.position === 2);
  const midRow = starters.filter(p => p.player.position === 3);
  const fwdRow = starters.filter(p => p.player.position === 4);
  const defLabels = getSubLabels(2, defRow.length);
  const midLabels = getSubLabels(3, midRow.length);
  const fwdLabels = getSubLabels(4, fwdRow.length);

  const validationError = validateFormation(picks);
  const isDeadlinePassed = gw.deadline ? new Date() > new Date(gw.deadline) : false;

  const captainToggle = (id: number) => {
    setCaptainPanel(prev => (prev === id ? null : id));
    setSelectedPlayer(null);
  };

  // Renders a pitch row + captain panel if one is open in that row
  const PitchRow = ({
    row,
    labels,
  }: {
    row: PickState[];
    labels: string[];
  }) => {
    const openPick = row.find(p => captainPanel === p.player.fplId);
    return (
      <div className="mb-5">
        <div className="flex items-start justify-center gap-1.5">
          {row.map((pick, i) => (
            <PitchCard
              key={pick.player.fplId}
              pick={pick}
              subLabel={labels[i] ?? ""}
              disabled={isDeadlinePassed}
              isSelected={selectedPlayer === pick.player.fplId}
              isPanelOpen={captainPanel === pick.player.fplId}
              onPlayerClick={handlePlayerClick}
              onCaptainToggle={captainToggle}
            />
          ))}
        </div>
        {openPick && (
          <RowCaptainPanel
            pick={openPick}
            onCaptain={makeCaptain}
            onViceCaptain={makeViceCaptain}
          />
        )}
      </div>
    );
  };

  return (
    <FplShell
      title={`${gw.name} Picks`}
      description={
        isDeadlinePassed
          ? "Deadline passed — picks locked"
          : selectedPlayer
          ? "Player selected — tap another to swap"
          : "Tap a player to select, tap another to swap"
      }
    >
      {/* Deadline notice */}
      {isDeadlinePassed && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
          <Info className="h-4 w-4 shrink-0" />
          GW deadline has passed. Picks are now locked.
        </div>
      )}

      {/* Chips */}
      {!isDeadlinePassed && (
        <div className="mb-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Play a chip (optional)
          </h2>
          <div className="flex flex-wrap gap-2">
            {CHIPS.map(chip => {
              const used = team.chipUsed[chip.chipped];
              const active = selectedChip === chip.key;
              if (used) return null;
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setSelectedChip(prev => (prev === chip.key ? null : chip.key))}
                  className={cn(
                    "flex flex-col rounded-xl border px-4 py-2.5 text-left text-xs transition-all",
                    active
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border bg-card hover:bg-accent text-foreground",
                  )}
                >
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Star className="h-3 w-3" />
                    {chip.label}
                    {active && <CheckCircle2 className="h-3 w-3" />}
                  </span>
                  <span className="mt-0.5 text-muted-foreground">{chip.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Formation selector */}
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Formation
          </h2>
          <span className="rounded-lg border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-xs font-bold text-gold">
            {formation}
          </span>
        </div>
        {!isDeadlinePassed && (
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(FORMATIONS) as FormationKey[]).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => handleFormationChange(f)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-bold transition-all",
                  formation === f
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-border bg-card text-muted-foreground hover:border-gold/40 hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pitch */}
      <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 px-3 pb-4 pt-4">
        {/* Centre line */}
        <div className="mb-5 flex justify-center">
          <div className="h-px w-2/3 bg-white/10" />
        </div>

        {/* GK */}
        <PitchRow row={gkRow} labels={["GK"]} />

        {/* DEF */}
        <PitchRow row={defRow} labels={defLabels} />

        {/* MID */}
        <PitchRow row={midRow} labels={midLabels} />

        {/* FWD */}
        <PitchRow row={fwdRow} labels={fwdLabels} />

        {/* Centre line bottom */}
        <div className="flex justify-center">
          <div className="h-px w-2/3 bg-white/10" />
        </div>
      </div>

      {/* Bench */}
      <div className="mb-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Bench{" "}
          <span className="normal-case font-normal text-muted-foreground/60">
            (priority order)
          </span>
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {bench.map((pick, i) => {
            const isSelected = selectedPlayer === pick.player.fplId;
            return (
              <button
                key={pick.player.fplId}
                type="button"
                onClick={() => handlePlayerClick(pick.player.fplId)}
                disabled={isDeadlinePassed}
                className={cn(
                  "flex flex-col items-center rounded-xl border p-2 text-center transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/40 hover:bg-accent",
                  isDeadlinePassed && "cursor-default opacity-70",
                )}
              >
                <span className="mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <div
                  className={cn(
                    "mb-1 flex h-5 w-full items-center justify-center rounded-md text-[9px] font-bold",
                    POS_COLOR[pick.player.position],
                  )}
                >
                  {POS_LABEL[pick.player.position]}
                </div>
                <p className="w-full truncate text-center text-[11px] font-bold leading-tight">
                  {pick.player.name.split(" ").slice(-1)[0]}
                </p>
                <p className="text-[8px] text-muted-foreground">{pick.player.clubShort}</p>
                <p className="mt-0.5 text-[10px] font-medium">
                  {pick.player.currentGwPoints}pts
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <Card className="mb-5 border-dashed">
        <CardContent className="space-y-1 p-4 text-xs text-muted-foreground">
          <p>• Tap a player on the pitch, then tap another to swap positions</p>
          <p>
            • Tap the small <strong>C</strong> button on a player to open the captain / vice-captain
            panel
          </p>
          <p>• Choose a formation above — it re-arranges your squad automatically</p>
          <p>• Bench order determines auto-substitution priority</p>
        </CardContent>
      </Card>

      {/* Validation + Save */}
      {!isDeadlinePassed && (
        <div className="flex items-center justify-between gap-4">
          {validationError ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4 shrink-0" />
              {validationError}
            </p>
          ) : (
            <p className="flex items-center gap-2 text-sm text-gold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Formation valid — ready to save
            </p>
          )}
          <Button
            onClick={handleSave}
            disabled={!!validationError || saving}
            className="shrink-0 bg-primary text-white hover:bg-primary/90"
          >
            {saving ? "Saving…" : "Save Picks"}
          </Button>
        </div>
      )}
    </FplShell>
  );
}
