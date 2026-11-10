"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  getFplGameweeks,
  getFplCurrentGameweek,
  getFplFixtures,
  type FplGameweek,
  type FplFixture,
} from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

function formatKickoff(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
}

function FixtureCard({ fixture }: { fixture: FplFixture }) {
  const inProgress = fixture.started && !fixture.finished;
  const hasScore = fixture.homeScore !== null && fixture.awayScore !== null;

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl border p-3",
      inProgress ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-card",
    )}>
      {/* Home */}
      <div className="flex flex-1 flex-col items-end gap-0.5 text-right">
        <p className="text-sm font-semibold">{fixture.homeTeam}</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{fixture.homeTeamShort}</p>
      </div>

      {/* Score / Time */}
      <div className="flex w-20 shrink-0 flex-col items-center gap-0.5">
        {hasScore ? (
          <>
            <p className={cn("text-lg font-bold tabular-nums", inProgress && "text-emerald-600 dark:text-emerald-400")}>
              {fixture.homeScore} – {fixture.awayScore}
            </p>
            {inProgress && (
              <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Live</span>
            )}
            {fixture.finished && (
              <span className="text-[10px] text-muted-foreground">FT</span>
            )}
          </>
        ) : (
          <>
            <span className="text-xs font-semibold text-muted-foreground">vs</span>
            <span className="text-[10px] text-muted-foreground leading-tight text-center">{formatKickoff(fixture.kickoffTime)}</span>
          </>
        )}
      </div>

      {/* Away */}
      <div className="flex flex-1 flex-col items-start gap-0.5">
        <p className="text-sm font-semibold">{fixture.awayTeam}</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{fixture.awayTeamShort}</p>
      </div>
    </div>
  );
}

export default function FplFixturesPage() {
  const [gameweeks, setGameweeks] = useState<FplGameweek[]>([]);
  const [selectedGw, setSelectedGw] = useState<FplGameweek | null>(null);
  const [fixtures, setFixtures] = useState<FplFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixturesLoading, setFixturesLoading] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getFplGameweeks(), getFplCurrentGameweek()]).then(([gws, current]) => {
      if (!active) return;
      setGameweeks(gws);
      const gw = current ?? gws[0] ?? null;
      setSelectedGw(gw);
      setLoading(false);
    }).catch(err => {
      if (!active) return;
      toast.error(err instanceof Error ? err.message : "Failed to load gameweeks");
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedGw) return;
    let active = true;
    setFixturesLoading(true);
    getFplFixtures(selectedGw.fplId).then(data => {
      if (active) { setFixtures(data); setFixturesLoading(false); }
    }).catch(err => {
      if (!active) return;
      toast.error(err instanceof Error ? err.message : "Failed to load fixtures");
      setFixturesLoading(false);
    });
    return () => { active = false; };
  }, [selectedGw]);

  const currentIdx = gameweeks.findIndex(g => g._id === selectedGw?._id);

  function prev() {
    if (currentIdx > 0) setSelectedGw(gameweeks[currentIdx - 1]);
  }
  function next() {
    if (currentIdx < gameweeks.length - 1) setSelectedGw(gameweeks[currentIdx + 1]);
  }

  if (loading) {
    return (
      <FplShell title="Fixtures">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      </FplShell>
    );
  }

  const liveCount = fixtures.filter(f => f.started && !f.finished).length;

  return (
    <FplShell
      title="Fixtures"
      description={selectedGw ? `${selectedGw.name} · Deadline ${new Date(selectedGw.deadline).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })}` : undefined}
    >
      {/* GW navigator */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={prev}
          disabled={currentIdx <= 0}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-accent disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex flex-1 items-center justify-center gap-2 overflow-x-auto pb-1">
          {gameweeks.map(gw => (
            <button
              key={gw._id}
              type="button"
              onClick={() => setSelectedGw(gw)}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                selectedGw?._id === gw._id
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "border-border text-muted-foreground hover:bg-accent",
                gw.isCurrent && selectedGw?._id !== gw._id && "border-primary/40",
              )}
            >
              GW{gw.fplId}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          disabled={currentIdx >= gameweeks.length - 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-accent disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Live badge */}
      {liveCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {liveCount} match{liveCount !== 1 ? "es" : ""} in progress
          </span>
        </div>
      )}

      {/* Stats strip */}
      {selectedGw && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg score</p>
              <p className="mt-1 text-xl font-bold">{selectedGw.averageScore ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Top score</p>
              <p className="mt-1 text-xl font-bold">{selectedGw.highestScore ?? "—"}</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
              <p className="mt-1 text-sm font-bold">
                {selectedGw.isFinished ? "Finished" : selectedGw.isCurrent ? "In progress" : selectedGw.isNext ? "Next up" : "Upcoming"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fixtures list */}
      {fixturesLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : fixtures.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-sm text-muted-foreground">
            <Calendar className="h-8 w-8" />
            <p>No fixtures available for this gameweek.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {fixtures.map(f => <FixtureCard key={f.id} fixture={f} />)}
        </div>
      )}
    </FplShell>
  );
}
