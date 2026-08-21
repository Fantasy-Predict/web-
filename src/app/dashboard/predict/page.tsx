"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { TeamCrest, MatchCard } from "../../../components/app/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { Match } from "../../lib/mock-data";
import { cn } from "../../lib/utils";
import { createPrediction, getMatches, getUserCompetitions, type UserCompetition } from "../../lib/api/endpoints";
import { calculatePoints, getOutcomeFromScore, type Prediction } from "../../lib/scoring";
import { notifyPrediction } from "../../lib/notifications";

type Pick = {
  outcome?: "home" | "draw" | "away";
  home?: string;
  away?: string;
  locked?: boolean;
  prediction?: Prediction;
};

function formatKickoff(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function PredictPage() {
  const searchParams = useSearchParams();
  const poolId = searchParams.get("pool") ?? undefined;

  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [competitions, setCompetitions] = useState<UserCompetition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [matchdayIndex, setMatchdayIndex] = useState(0);

  const compNameMap = useState(() => new Map<string, string>())[0];

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const comps = await getUserCompetitions().catch(() => []);
        if (!active) return;
        setCompetitions(comps);
        comps.forEach((c) => compNameMap.set(c._id, c.name));
        if (comps.length > 0) {
          const defaultComp = comps.find((c) => c.default) ?? comps[0];
          setSelectedCompetition(defaultComp._id);
        }
      } catch {
        // continue without competition filter
      }
    }
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!selectedCompetition) return;
      setLoading(true);
      setMatchdayIndex(0);
      try {
        const matchesData = await getMatches(selectedCompetition);
        if (!active) return;
        const enriched = (matchesData ?? [])
          .filter((m) => m && m.id && m.home && m.away)
          .map((m) => ({
            ...m,
            competitionName: compNameMap.get(m.competition) ?? m.competition,
            kickoff: formatKickoff(m.kickoff),
          }));
        setAllMatches(enriched);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load fixtures");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [selectedCompetition]);

  const matchdays = useMemo(() => {
    const dayMap = new Map<string, Match[]>();
    for (const m of allMatches) {
      const key = m.matchday ?? "unknown";
      if (!dayMap.has(key)) dayMap.set(key, []);
      dayMap.get(key)!.push(m);
    }
    const sorted = [...dayMap.entries()].sort(([a], [b]) => {
      const na = parseInt(a) || 0;
      const nb = parseInt(b) || 0;
      return na - nb;
    });
    return sorted;
  }, [allMatches]);

  const currentMatchday = matchdays[matchdayIndex];
  const currentDayLabel = currentMatchday ? currentMatchday[0] : null;
  const currentMatches = currentMatchday ? currentMatchday[1] : [];

  const upcoming = currentMatches.filter((m) => m.status === "upcoming");
  const finished = currentMatches.filter((m) => m.status === "finished");

  const completed = upcoming.filter((m) => picks[m.id]?.outcome).length;
  const progress = upcoming.length > 0 ? (completed / upcoming.length) * 100 : 0;

  async function handleSubmit() {
    setSubmitting(true);
    const completedPicks = Object.entries(picks).filter(([, pick]) => pick.outcome);

    try {
      await Promise.all(
        completedPicks.map(([matchId, pick]) => {
          const match = allMatches.find((m) => m.id === matchId);
          if (!match || !pick.outcome) return Promise.resolve();
          return createPrediction({
            match: match.id,
            competition: match.competition,
            outcome: pick.outcome,
            pool: poolId,
          });
        }),
      );
      setSubmitted(true);
      toast.success(`Predictions submitted for Matchday ${currentDayLabel ?? ""}`);
      notifyPrediction(
        "Predictions submitted",
        `You predicted ${completedPicks.length} match${completedPicks.length === 1 ? "" : "es"} for Matchday ${currentDayLabel ?? ""}.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit predictions");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell
      title={currentDayLabel ? `Matchday ${currentDayLabel}` : "Predictions"}
      description="Predictions lock at each match kickoff. You can edit until then."
    >
      {competitions.length > 0 && (
        <div className="mb-4">
          <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All competitions" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {!poolId && (
        <Card className="mb-6 border-primary/30 bg-primary/5 p-5 shadow-[var(--shadow-card)]">
          <p className="text-sm font-semibold">Select a pool first</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Join or create a pool, then come back to make predictions for that pool.
          </p>
          <Button asChild className="mt-3" size="sm" variant="outline">
            <Link href="/dashboard/pools">Browse pools</Link>
          </Button>
        </Card>
      )}

      {/* Matchday navigation */}
      {matchdays.length > 1 && (
        <div className="mb-5 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={matchdayIndex === 0}
            onClick={() => { setMatchdayIndex((i) => i - 1); setSubmitted(false); }}
          >
            ← Previous
          </Button>
          <span className="num text-sm font-semibold text-muted-foreground">
            {matchdayIndex + 1} / {matchdays.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={matchdayIndex >= matchdays.length - 1}
            onClick={() => { setMatchdayIndex((i) => i + 1); setSubmitted(false); }}
          >
            Next →
          </Button>
        </div>
      )}

      <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Progress</span>
          <span className="num text-muted-foreground">
            {completed} of {upcoming.length} matches
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {submitted && (
          <p className="mt-4 rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success-foreground">
            Predictions saved. You can update them until each kickoff.
          </p>
        )}
      </Card>

      {/* Upcoming matches */}
      <div className="mt-6 grid gap-5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Upcoming</h3>
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]">
              <Skeleton className="h-3 w-36" />
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-32 justify-self-end" />
              </div>
              <Skeleton className="mt-5 h-10 w-full" />
            </div>
          ))
        ) : upcoming.length > 0 ? (
          upcoming.map((match, index) => (
            <PredictionRow
              key={match.id}
              match={match}
              locked={index === upcoming.length - 1}
              pick={picks[match.id] ?? {}}
              onChange={(next) => setPicks((prev) => ({
                ...prev,
                [match.id]: {
                  ...prev[match.id],
                  ...next,
                  prediction: next.outcome && next.home && next.away ? {
                    outcome: next.outcome,
                    homeScore: parseInt(next.home) || 0,
                    awayScore: parseInt(next.away) || 0,
                  } : undefined
                }
              }))}
            />
          ))
        ) : (
          <Card className="p-6 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm font-semibold">No upcoming fixtures</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Predictions open when the next matchday is announced.
            </p>
          </Card>
        )}
      </div>

      {/* Finished matches – show scoring */}
      {finished.length > 0 && (
        <div className="mt-10 grid gap-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Results</h3>
          {finished.map((match) => {
            const pick = picks[match.id];
            let scoringResult = null;

            if (pick?.prediction && match.score) {
              const actualResult = {
                outcome: getOutcomeFromScore(match.score.home, match.score.away),
                homeScore: match.score.home,
                awayScore: match.score.away,
              };
              scoringResult = calculatePoints(pick.prediction, actualResult);
            }

            return (
              <MatchCard
                key={match.id}
                match={match}
                scoringResult={scoringResult}
                footer={
                  scoringResult && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">You earned: </span>
                      <span className="font-bold text-primary">{scoringResult.points} points</span>
                      <span className="text-muted-foreground"> ({scoringResult.label})</span>
                    </div>
                  )
                }
              />
            );
          })}
        </div>
      )}

      {/* Submit button */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={submitting || completed === 0 || !poolId}
          size="lg"
          className="w-full sm:w-auto"
        >
          {submitting ? "Submitting…" : !poolId ? "Select a pool first" : "Submit predictions"}
        </Button>
      </div>
    </AppShell>
  );
}

function PredictionRow({
  match,
  pick,
  locked,
  onChange,
}: {
  match: Match;
  pick: Pick;
  locked: boolean;
  onChange: (next: Pick) => void;
}) {
  const options: { key: "home" | "draw" | "away"; label: string }[] = [
    { key: "home", label: "Home win" },
    { key: "draw", label: "Draw" },
    { key: "away", label: "Away win" },
  ];

  return (
    <Card className={cn("gap-0 p-5 shadow-[var(--shadow-card)]", locked && "opacity-70")}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="truncate text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          {match.competitionName ?? match.competition}
        </p>
        {locked ? (
          <Badge variant="secondary" className="shrink-0">
            Locked
          </Badge>
        ) : (
          <span className="num shrink-0 text-xs font-semibold text-muted-foreground">
            {match.kickoff}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <TeamCrest short={match.homeShort} />
          <span className="truncate text-sm font-semibold">{match.home}</span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">v</span>
        <div className="flex min-w-0 items-center justify-end gap-3">
          <span className="truncate text-sm font-semibold">{match.away}</span>
          <TeamCrest short={match.awayShort} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1.6fr_1fr]">
        <div className="grid grid-cols-3 gap-2">
          {options.map((option) => (
            <button
              key={option.key}
              disabled={locked}
              onClick={() => onChange({ outcome: option.key })}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed",
                pick.outcome === option.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card hover:bg-accent",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            inputMode="numeric"
            disabled={locked}
            placeholder="0"
            aria-label={`${match.home} exact score`}
            className="num h-10 text-center"
            value={pick.home ?? ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 2);
              onChange({ home: value });
            }}
          />
          <span className="text-xs font-semibold text-muted-foreground">score</span>
          <Input
            inputMode="numeric"
            disabled={locked}
            placeholder="0"
            aria-label={`${match.away} exact score`}
            className="num h-10 text-center"
            value={pick.away ?? ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 2);
              onChange({ away: value });
            }}
          />
        </div>
      </div>
    </Card>
  );
}
