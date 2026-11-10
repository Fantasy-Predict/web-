"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Pencil, Shield, Star } from "lucide-react";
import { toast } from "sonner";
import {
  getFplTeam,
  getFplCurrentGameweek,
  getFplPicks,
  type FplTeam,
  type FplPlayer,
  type FplPick,
  type FplGameweek,
} from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

const POS_LABEL: Record<number, string> = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };
const POS_COLOR: Record<number, string> = {
  1: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  2: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  3: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  4: "bg-red-500/20 text-red-700 dark:text-red-400",
};

type EnrichedPlayer = FplPlayer & {
  squadPosition: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
};

function buildSquad(playerDetails: FplPlayer[], picks: FplPick | null): { starters: EnrichedPlayer[]; bench: EnrichedPlayer[] } {
  if (!picks || picks.players.length === 0) {
    // No picks yet — lay out by position
    const sorted = [...playerDetails].sort((a, b) => a.position - b.position);
    const starters = sorted.slice(0, 11).map((p, i) => ({ ...p, squadPosition: i + 1, isCaptain: false, isViceCaptain: false }));
    const bench = sorted.slice(11).map((p, i) => ({ ...p, squadPosition: 12 + i, isCaptain: false, isViceCaptain: false }));
    return { starters, bench };
  }

  const playerMap = new Map(playerDetails.map(p => [p.fplId, p]));
  const enriched: EnrichedPlayer[] = picks.players.map(pick => ({
    ...playerMap.get(pick.fplId)!,
    squadPosition: pick.squadPosition,
    isCaptain: pick.isCaptain,
    isViceCaptain: pick.isViceCaptain,
  }));

  return {
    starters: enriched.filter(p => p.squadPosition <= 11).sort((a, b) => a.squadPosition - b.squadPosition),
    bench: enriched.filter(p => p.squadPosition > 11).sort((a, b) => a.squadPosition - b.squadPosition),
  };
}

function PlayerCard({ player, compact = false }: { player: EnrichedPlayer; compact?: boolean }) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-1.5 sm:p-2 text-center transition-all",
      compact ? "min-w-[52px] sm:min-w-[64px] max-w-[80px]" : "min-w-[56px] sm:min-w-[72px] max-w-[90px]",
    )}>
      {/* Position badge + captain overlay */}
      <div className="relative">
        <div className={cn("flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full text-[9px] sm:text-xs font-bold", POS_COLOR[player.position])}>
          {POS_LABEL[player.position]}
        </div>
        {player.isCaptain && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[9px] font-bold text-white">C</span>
        )}
        {player.isViceCaptain && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-500 text-[9px] font-bold text-white">V</span>
        )}
      </div>
      <p className="line-clamp-1 w-full text-[11px] font-semibold leading-tight">{player.name.split(" ").pop()}</p>
      <p className="text-[10px] text-muted-foreground">{player.clubShort}</p>
      <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">{player.currentGwPoints} pts</p>
    </div>
  );
}

function PitchRow({ players, label }: { players: EnrichedPlayer[]; label: string }) {
  if (players.length === 0) return null;
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
        {players.map(p => <PlayerCard key={p.fplId} player={p} />)}
      </div>
    </div>
  );
}

export default function FplSquadPage() {
  const [team, setTeam] = useState<FplTeam | null>(null);
  const [gw, setGw] = useState<FplGameweek | null>(null);
  const [picks, setPicks] = useState<FplPick | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getFplTeam().then(async (teamData) => {
      if (!active) return;
      if (!teamData) { setLoading(false); return; }
      setTeam(teamData);

      const gwData = await getFplCurrentGameweek();
      if (!active) return;
      setGw(gwData);

      if (gwData) {
        const picksData = await getFplPicks(gwData.fplId).catch(() => null);
        if (active) setPicks(picksData);
      }
      if (active) setLoading(false);
    }).catch((err) => {
      if (!active) return;
      toast.error(err instanceof Error ? err.message : "Failed to load squad");
      setLoading(false);
    });

    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <FplShell title="My Squad">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </FplShell>
    );
  }

  if (!team) {
    return (
      <FplShell title="My Squad">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Shield className="h-12 w-12 text-muted-foreground" />
            <p className="font-semibold">No squad found</p>
            <Link href="/fpl/setup" className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Set up your squad
            </Link>
          </CardContent>
        </Card>
      </FplShell>
    );
  }

  const { starters, bench } = buildSquad(team.playerDetails ?? [], picks);

  const rows = {
    gk:  starters.filter(p => p.position === 1),
    def: starters.filter(p => p.position === 2),
    mid: starters.filter(p => p.position === 3),
    fwd: starters.filter(p => p.position === 4),
  };

  const hasPicks = picks && picks.players.length > 0;

  return (
    <FplShell
      title={team.teamName}
      description={gw ? `${gw.name}${hasPicks ? " · Picks saved" : " · No picks yet"}` : undefined}
    >
      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Budget left</p>
            <p className="mt-1 text-xl font-bold">£{(team.budget / 10).toFixed(1)}m</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Squad value</p>
            <p className="mt-1 text-xl font-bold">£{(team.squadValue / 10).toFixed(1)}m</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Free transfers</p>
            <p className="mt-1 text-xl font-bold">{team.freeTransfers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">GW points</p>
            <p className="mt-1 text-xl font-bold">{team.gwPoints ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pitch */}
      <Card className="mt-5 overflow-hidden">
        <div className="relative min-h-[420px] bg-gradient-to-b from-emerald-700 to-emerald-900 p-3 sm:p-6">
          {/* Pitch lines */}
          <div className="pointer-events-none absolute inset-x-6 top-1/2 h-px bg-white/10" />
          <div className="pointer-events-none absolute left-1/2 top-6 h-32 w-32 -translate-x-1/2 rounded-full border border-white/10" />

          <div className="relative flex flex-col gap-6">
            <PitchRow players={rows.gk} label="GKP" />
            <PitchRow players={rows.def} label="DEF" />
            <PitchRow players={rows.mid} label="MID" />
            <PitchRow players={rows.fwd} label="FWD" />
          </div>
        </div>

        {/* Bench */}
        <div className="border-t border-border bg-muted/30 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Bench</p>
          <div className="flex flex-wrap justify-center gap-3">
            {bench.map((p, i) => (
              <div key={p.fplId} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">#{i + 1}</span>
                <PlayerCard player={p} compact />
              </div>
            ))}
            {bench.length === 0 && (
              <p className="text-sm text-muted-foreground">No bench set yet — go to Picks to arrange your squad.</p>
            )}
          </div>
        </div>
      </Card>

      {/* Chips status */}
      <div className="mt-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Chips</h2>
        <div className="flex flex-wrap gap-2">
          {([
            { key: "wildcard1" as const, label: "Wildcard 1" },
            { key: "wildcard2" as const, label: "Wildcard 2" },
            { key: "tripleCaptain" as const, label: "Triple Captain" },
            { key: "benchBoost" as const, label: "Bench Boost" },
            { key: "freeHit" as const, label: "Free Hit" },
          ] as const).map(chip => (
            <span
              key={chip.key}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                team.chipUsed?.[chip.key]
                  ? "border-border bg-muted/40 text-muted-foreground line-through opacity-60"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
              )}
            >
              {!team.chipUsed?.[chip.key] && <Star className="h-3 w-3" />}
              {chip.label}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/fpl/picks"
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          <Pencil className="h-4 w-4" />
          Edit Picks &amp; Captain
        </Link>
        <Link
          href="/fpl/transfers"
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Make Transfers
        </Link>
      </div>
    </FplShell>
  );
}
