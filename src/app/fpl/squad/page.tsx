"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Pencil, Shield, Star } from "lucide-react";
import { toast } from "sonner";
import {
  getFplTeam,
  getFplCurrentGameweek,
  getFplPicks,
  getFplFixtures,
  type FplTeam,
  type FplPlayer,
  type FplPick,
  type FplGameweek,
  type FplFixture,
} from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Jersey } from "@/components/app/jersey";
import { Pitch } from "@/components/app/pitch";
import { cn } from "@/app/lib/utils";

// Build a quick lookup: "ARS" → "MCI (H)" — each player's club's next GW
// opponent + home/away marker, same format FPL uses on their Pick Team view.
// Players whose club has a double-gameweek will show the first fixture only.
function buildFixtureLabels(fixtures: FplFixture[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const f of fixtures) {
    if (!map.has(f.homeTeamShort)) map.set(f.homeTeamShort, `${f.awayTeamShort} (H)`);
    if (!map.has(f.awayTeamShort)) map.set(f.awayTeamShort, `${f.homeTeamShort} (A)`);
  }
  return map;
}

// FPL player status codes: a=available, d=doubtful, i=injured, s=suspended,
// u=unavailable, n=not in squad. Anything other than "a" shows a coloured dot
// and exposes the news string (e.g. "Hamstring - 75% chance") on hover.
const STATUS_DOT: Record<string, string> = {
  a: "",
  d: "bg-yellow-500",
  i: "bg-red-500",
  s: "bg-red-500",
  u: "bg-red-600",
  n: "bg-gray-400",
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

function PlayerCard({
  player,
  compact = false,
  fixtureLabel,
}: {
  player: EnrichedPlayer;
  compact?: boolean;
  fixtureLabel?: string;
}) {
  const statusDotClass = STATUS_DOT[player.status] ?? "";
  const statusTitle = player.status !== "a"
    ? (player.news && player.news.length > 0 ? player.news : "Unavailable")
    : "";
  return (
    <div className="flex flex-col items-center" title={statusTitle || undefined}>
      {/* Jersey + captain overlay + injury/suspension dot */}
      <div className="relative">
        <Jersey
          teamCode={player.teamCode}
          position={player.position}
          clubShort={player.clubShort}
          size={compact ? "md" : "lg"}
        />
        {player.isCaptain && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-black shadow-md">C</span>
        )}
        {player.isViceCaptain && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-[10px] font-bold text-black shadow-md">V</span>
        )}
        {statusDotClass && (
          <span
            className={cn(
              "absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full ring-2 ring-white",
              statusDotClass,
            )}
            aria-label={statusTitle}
          />
        )}
      </div>
      {/* White info pill — matches the FPL Pick Team look */}
      <div className="mt-1.5 min-w-[76px] max-w-[112px] rounded-md bg-white px-2 py-1 text-center shadow-md">
        <p className="line-clamp-1 text-xs sm:text-sm font-bold leading-tight text-black">
          {player.name.split(" ").pop()}
        </p>
        <p className="text-[10px] sm:text-[11px] font-medium leading-tight text-gray-700">
          {fixtureLabel ?? player.clubShort}
        </p>
      </div>
      <p className="mt-1 text-[11px] sm:text-xs font-bold text-white drop-shadow">
        {player.currentGwPoints} pts
      </p>
    </div>
  );
}

function PitchRow({
  players,
  fixtureLabels,
}: {
  players: EnrichedPlayer[];
  fixtureLabels: Map<string, string>;
}) {
  if (players.length === 0) return null;
  return (
    <div className="flex flex-wrap items-start justify-center gap-3 sm:gap-6">
      {players.map(p => (
        <PlayerCard key={p.fplId} player={p} fixtureLabel={fixtureLabels.get(p.clubShort)} />
      ))}
    </div>
  );
}

export default function FplSquadPage() {
  const [team, setTeam] = useState<FplTeam | null>(null);
  const [gw, setGw] = useState<FplGameweek | null>(null);
  const [picks, setPicks] = useState<FplPick | null>(null);
  const [fixtures, setFixtures] = useState<FplFixture[]>([]);
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
        const [picksData, fixturesData] = await Promise.all([
          getFplPicks(gwData.fplId).catch(() => null),
          getFplFixtures(gwData.fplId).catch(() => []),
        ]);
        if (active) {
          setPicks(picksData);
          setFixtures(fixturesData);
        }
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
      <FplShell title="Points">
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
      <FplShell title="Points">
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
  const fixtureLabels = buildFixtureLabels(fixtures);

  const rows = {
    gk:  starters.filter(p => p.position === 1),
    def: starters.filter(p => p.position === 2),
    mid: starters.filter(p => p.position === 3),
    fwd: starters.filter(p => p.position === 4),
  };

  const hasPicks = picks && picks.players.length > 0;
  const missedDeadline = gw?.isCurrent && !gw.isFinished && !hasPicks;

  return (
    <FplShell
      title={team.teamName}
      description={gw ? `${gw.name}${hasPicks ? " · Picks saved" : " · No picks yet"}` : undefined}
    >
      {missedDeadline && (
        <div className="mb-5 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
          <p className="text-sm font-semibold text-destructive">
            Deadline passed for {gw?.name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            You didn&apos;t confirm a starting XI before kickoff, so you&apos;ll score 0 this gameweek.
            Set your picks before the next deadline to start earning points — the system will carry
            that lineup forward automatically for any gameweek you don&apos;t touch.
          </p>
        </div>
      )}

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
            <p className="mt-1 text-xl font-bold">{team.liveGwPoints || team.gwPoints || 0}</p>
            {(team.gwHits ?? 0) > 0 && (
              <p className="mt-0.5 text-[11px] font-medium text-destructive">Hits: −{team.gwHits}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pitch — matches the official FPL Pick Team view */}
      <div className="mt-5">
        <Pitch className="min-h-[520px] sm:min-h-[600px]">
          <PitchRow players={rows.gk} fixtureLabels={fixtureLabels} />
          <PitchRow players={rows.def} fixtureLabels={fixtureLabels} />
          <PitchRow players={rows.mid} fixtureLabels={fixtureLabels} />
          <PitchRow players={rows.fwd} fixtureLabels={fixtureLabels} />
        </Pitch>

        {/* Bench — same jersey + white pill treatment, outside the pitch */}
        <div className="mt-3 rounded-2xl border border-border bg-muted/30 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Bench</p>
          <div className="flex flex-wrap justify-center gap-4">
            {bench.map((p, i) => (
              <div key={p.fplId} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground">#{i + 1}</span>
                <PlayerCard player={p} compact fixtureLabel={fixtureLabels.get(p.clubShort)} />
              </div>
            ))}
            {bench.length === 0 && (
              <p className="text-sm text-muted-foreground">No bench set yet — go to Pick Team to arrange your squad.</p>
            )}
          </div>
        </div>
      </div>

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
                  : "border-gold/30 bg-gold/10 text-gold",
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
