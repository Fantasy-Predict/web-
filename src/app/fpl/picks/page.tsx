"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, Star } from "lucide-react";
import { toast } from "sonner";
import {
  getFplTeam,
  getFplCurrentGameweek,
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

const POS_LABEL: Record<number, string> = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };
const POS_COLOR: Record<number, string> = {
  1: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  2: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  3: "bg-gold/20 text-gold",
  4: "bg-red-500/20 text-red-700 dark:text-red-400",
};

type PickState = {
  player: FplPlayer;
  squadPosition: number; // 1-11 starting, 12-15 bench
  isCaptain: boolean;
  isViceCaptain: boolean;
};

function buildInitialPicks(playerDetails: FplPlayer[], existingPicks: FplPick | null): PickState[] {
  if (existingPicks && existingPicks.players.length === 15) {
    const playerMap = new Map(playerDetails.map(p => [p.fplId, p]));
    return existingPicks.players.map(pick => ({
      player: playerMap.get(pick.fplId)!,
      squadPosition: pick.squadPosition,
      isCaptain: pick.isCaptain,
      isViceCaptain: pick.isViceCaptain,
    })).filter(p => p.player != null);
  }

  // Default: sort by position, first 11 start
  const sorted = [...playerDetails].sort((a, b) => a.position - b.position);
  return sorted.map((p, i) => ({
    player: p,
    squadPosition: i + 1,
    isCaptain: false,
    isViceCaptain: false,
  }));
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

const CHIPS = [
  { key: "triple_captain" as const, label: "Triple Captain", chipped: "tripleCaptain" as const, desc: "Captain scores 3×" },
  { key: "bench_boost" as const, label: "Bench Boost", chipped: "benchBoost" as const, desc: "All 15 players score" },
  { key: "free_hit" as const, label: "Free Hit", chipped: "freeHit" as const, desc: "Unlimited free transfers for 1 GW" },
  { key: "wildcard" as const, label: "Wildcard", chipped: "wildcard1" as const, desc: "Unlimited free transfers" },
];

export default function FplPicksPage() {
  const [team, setTeam] = useState<FplTeam | null>(null);
  const [gw, setGw] = useState<FplGameweek | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [picks, setPicks] = useState<PickState[]>([]);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null); // fplId being moved
  const [captainPanel, setCaptainPanel] = useState<number | null>(null); // fplId whose C/V panel is open

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([getFplTeam(), getFplCurrentGameweek()]).then(async ([teamData, gwData]) => {
      if (!active) return;
      if (!teamData || !gwData) { setLoading(false); return; }
      setTeam(teamData);
      setGw(gwData);

      const existingPicks = await getFplPicks(gwData.fplId).catch(() => null);
      if (!active) return;
      if (existingPicks?.chip) setSelectedChip(existingPicks.chip);
      setPicks(buildInitialPicks(teamData.playerDetails ?? [], existingPicks));
      setLoading(false);
    }).catch(err => {
      if (!active) return;
      toast.error(err instanceof Error ? err.message : "Failed to load picks");
      setLoading(false);
    });

    return () => { active = false; };
  }, []);

  function handlePlayerClick(fplId: number) {
    const pick = picks.find(p => p.player.fplId === fplId);
    if (!pick) return;

    if (selectedPlayer === null) {
      // First click — select for swapping
      setSelectedPlayer(fplId);
      return;
    }

    if (selectedPlayer === fplId) {
      // Deselect
      setSelectedPlayer(null);
      return;
    }

    // Swap squadPositions
    const srcPick = picks.find(p => p.player.fplId === selectedPlayer);
    const dstPick = pick;
    if (!srcPick) { setSelectedPlayer(null); return; }

    // If swapping between starting and bench, validate GK rule
    const srcPos = srcPick.squadPosition;
    const dstPos = dstPick.squadPosition;
    const srcIsStarter = srcPos <= 11;
    const dstIsStarter = dstPos <= 11;

    if (srcIsStarter !== dstIsStarter) {
      // Check GK rule: GKP can only swap with GKP
      if (srcPick.player.position === 1 && dstPick.player.position !== 1) {
        toast.error("Goalkeeper can only be swapped with another goalkeeper");
        setSelectedPlayer(null);
        return;
      }
      if (dstPick.player.position === 1 && srcPick.player.position !== 1) {
        toast.error("Goalkeeper can only be swapped with another goalkeeper");
        setSelectedPlayer(null);
        return;
      }
    }

    setPicks(prev => prev.map(p => {
      if (p.player.fplId === selectedPlayer) return { ...p, squadPosition: dstPos, isCaptain: dstIsStarter ? p.isCaptain : false, isViceCaptain: dstIsStarter ? p.isViceCaptain : false };
      if (p.player.fplId === fplId) return { ...p, squadPosition: srcPos, isCaptain: srcIsStarter ? p.isCaptain : false, isViceCaptain: srcIsStarter ? p.isViceCaptain : false };
      return p;
    }));
    setSelectedPlayer(null);
  }

  function makeCaptain(fplId: number) {
    const pick = picks.find(p => p.player.fplId === fplId);
    if (!pick || pick.squadPosition > 11) return;
    // Clear existing captain, set this one; if was VC clear that too
    setPicks(prev => prev.map(p => {
      if (p.player.fplId === fplId) return { ...p, isCaptain: true, isViceCaptain: false };
      return { ...p, isCaptain: false };
    }));
    setCaptainPanel(null);
  }

  function makeViceCaptain(fplId: number) {
    const pick = picks.find(p => p.player.fplId === fplId);
    if (!pick || pick.squadPosition > 11) return;
    // Clear existing VC, set this one; if was captain clear that too
    setPicks(prev => prev.map(p => {
      if (p.player.fplId === fplId) return { ...p, isViceCaptain: true, isCaptain: false };
      return { ...p, isViceCaptain: false };
    }));
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
        multiplier: p.squadPosition <= 11 ? (p.isCaptain ? (selectedChip === "triple_captain" ? 3 : 2) : 1) : 0,
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
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
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

  const starters = [...picks].filter(p => p.squadPosition <= 11).sort((a, b) => a.squadPosition - b.squadPosition);
  const bench = [...picks].filter(p => p.squadPosition > 11).sort((a, b) => a.squadPosition - b.squadPosition);
  const validationError = validateFormation(picks);
  const isDeadlinePassed = gw.isCurrent && !gw.isNext;

  return (
    <FplShell title={`${gw.name} Picks`} description={isDeadlinePassed ? "Deadline passed — picks locked" : "Tap a player to select, tap another to swap"}>

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
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Play a chip (optional)</h2>
          <div className="flex flex-wrap gap-2">
            {CHIPS.map(chip => {
              const used = team.chipUsed[chip.chipped];
              const active = selectedChip === chip.key;
              if (used) return null;
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setSelectedChip(prev => prev === chip.key ? null : chip.key)}
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

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Starting 11 */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Starting 11
            {selectedPlayer && <span className="ml-2 text-primary">· Tap another player to swap</span>}
          </h2>
          <div className="space-y-2">
            {starters.map(pick => {
              const isSelected = selectedPlayer === pick.player.fplId;
              const isPanelOpen = captainPanel === pick.player.fplId;
              return (
                <div key={pick.player.fplId} className="relative">
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 transition-all",
                      isSelected ? "border-primary bg-primary/5" : "border-border bg-card",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (!isDeadlinePassed) setCaptainPanel(null);
                        handlePlayerClick(pick.player.fplId);
                      }}
                      disabled={isDeadlinePassed}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <div className={cn("flex h-8 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold", POS_COLOR[pick.player.position])}>
                        {POS_LABEL[pick.player.position]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{pick.player.name}</p>
                        <p className="text-xs text-muted-foreground">{pick.player.clubShort} · £{(pick.player.price / 10).toFixed(1)}m</p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">{pick.player.currentGwPoints} pts</span>
                    </button>

                    {/* C/V badges (always visible when set) */}
                    {pick.isCaptain && (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-700 dark:text-yellow-400">C</span>
                    )}
                    {pick.isViceCaptain && (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-400/20 text-xs font-bold text-slate-600 dark:text-slate-300">V</span>
                    )}

                    {/* Open panel button */}
                    {!isDeadlinePassed && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setCaptainPanel(prev => prev === pick.player.fplId ? null : pick.player.fplId); setSelectedPlayer(null); }}
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-all",
                          isPanelOpen ? "border-gold bg-gold/15 text-gold" :
                          pick.isCaptain || pick.isViceCaptain ? "border-yellow-500/50 text-yellow-600 dark:text-yellow-400 hover:border-yellow-500" :
                          "border-border text-muted-foreground hover:border-yellow-500/50 hover:text-foreground",
                        )}
                        title="Set captain / vice-captain"
                      >
                        {pick.isCaptain ? "C" : pick.isViceCaptain ? "V" : "C"}
                      </button>
                    )}
                  </div>

                  {/* Official FPL-style captain panel */}
                  {isPanelOpen && (
                    <div className="mt-1 flex gap-2 rounded-xl border border-gold/30 bg-gold/5 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-muted-foreground">{pick.player.name}</p>
                        <p className="text-[10px] text-muted-foreground">{pick.player.clubShort}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => makeCaptain(pick.player.fplId)}
                        className={cn(
                          "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-all",
                          pick.isCaptain
                            ? "border-yellow-500 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                            : "border-border bg-card text-foreground hover:border-yellow-500 hover:bg-yellow-500/10",
                        )}
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/30 text-[10px]">C</span>
                        Make Captain
                      </button>
                      <button
                        type="button"
                        onClick={() => makeViceCaptain(pick.player.fplId)}
                        className={cn(
                          "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-all",
                          pick.isViceCaptain
                            ? "border-slate-400 bg-slate-400/20 text-slate-600 dark:text-slate-300"
                            : "border-border bg-card text-foreground hover:border-slate-400 hover:bg-slate-400/10",
                        )}
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-400/30 text-[10px]">V</span>
                        Make Vice-Captain
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bench */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Bench (priority order)</h2>
          <div className="space-y-2">
            {bench.map((pick, i) => {
              const isSelected = selectedPlayer === pick.player.fplId;
              return (
                <button
                  key={pick.player.fplId}
                  type="button"
                  onClick={() => handlePlayerClick(pick.player.fplId)}
                  disabled={isDeadlinePassed}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                    isSelected ? "border-primary bg-primary/5" : "border-border bg-muted/40 hover:bg-accent",
                  )}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className={cn("flex h-8 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold", POS_COLOR[pick.player.position])}>
                    {POS_LABEL[pick.player.position]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{pick.player.name}</p>
                    <p className="text-xs text-muted-foreground">{pick.player.clubShort} · £{(pick.player.price / 10).toFixed(1)}m</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">{pick.player.currentGwPoints} pts</span>
                </button>
              );
            })}
          </div>

          {/* Instructions */}
          <Card className="mt-4 border-dashed">
            <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
              <p>• Tap a player, then tap another player to swap their positions</p>
              <p>• Tap the <strong>C</strong> button on a player to open the captain panel, then choose Captain or Vice-Captain independently</p>
              <p>• Bench order determines auto-substitution priority</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Validation + Save */}
      {!isDeadlinePassed && (
        <div className="mt-6 flex items-center justify-between gap-4">
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
