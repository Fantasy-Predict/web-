"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { MatchCard, StatCard } from "../../../components/app/card";
import type { Match } from "../../lib/mock-data";
import { getMatches, getMatchScores, getUserCompetitions } from "../../lib/api/endpoints";
import { calculatePoints, getOutcomeFromScore } from "../../lib/scoring";

function formatKickoff(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function ResultsPage() {
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameWeekIndex, setGameWeekIndex] = useState(0);

  const compNameMap = useState(() => new Map<string, string>())[0];

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const comps = await getUserCompetitions().catch(() => []);
        comps?.forEach((c) => compNameMap.set(c._id, c.name));

        const allMatchesData = await Promise.all(
          (comps ?? []).map((c) => getMatches(c._id).catch(() => [])),
        );
        const allScoresData = await Promise.all(
          (comps ?? []).map((c) => getMatchScores(c._id).catch(() => [])),
        );

        if (!active) return;

        const allM = allMatchesData.flat()
          .filter((m) => m && m.id && m.home && m.away)
          .map((m) => ({
            ...m,
            competitionName: compNameMap.get(m.competition) ?? m.competition,
            kickoff: formatKickoff(m.kickoff),
          }));

        const allS = allScoresData.flat()
          .filter((m) => m && m.id && m.home && m.away)
          .map((m) => ({
            ...m,
            competitionName: compNameMap.get(m.competition) ?? m.competition,
            kickoff: formatKickoff(m.kickoff),
          }));

        const mergedIds = new Set(allM.map((m) => m.id));
        for (const sm of allS) {
          if (!mergedIds.has(sm.id)) {
            allM.push(sm);
          }
        }

        setAllMatches(allM);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load your results");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const matchesWithPredictions = useMemo(
    () => allMatches.filter((m) => m.prediction && m.prediction.length > 0 && m.prediction[0].outcome),
    [allMatches],
  );

  const gameWeeks = useMemo(() => {
    const dayMap = new Map<string, Match[]>();
    for (const m of matchesWithPredictions) {
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
  }, [matchesWithPredictions]);

  const currentGW = gameWeeks[gameWeekIndex];
  const currentGWLabel = currentGW ? currentGW[0] : null;
  const currentMatches = currentGW ? currentGW[1] : [];

  let totalPoints = 0;
  const gwPoints = currentMatches.reduce((sum, match) => {
    const outcomeStr = match.prediction?.[0]?.outcome;
    if (!outcomeStr || !outcomeStr.includes("-") || !match.score) return sum;
    const parts = outcomeStr.split("-");
    const pred = {
      outcome: getOutcomeFromScore(parseInt(parts[0]) || 0, parseInt(parts[1]) || 0),
      homeScore: parseInt(parts[0]) || 0,
      awayScore: parseInt(parts[1]) || 0,
    };
    const actual = {
      outcome: getOutcomeFromScore(match.score.home, match.score.away),
      homeScore: match.score.home,
      awayScore: match.score.away,
    };
    return sum + calculatePoints(pred, actual).points;
  }, 0);

  for (const m of matchesWithPredictions) {
    const outcomeStr = m.prediction?.[0]?.outcome;
    if (!outcomeStr || !outcomeStr.includes("-") || !m.score) continue;
    const parts = outcomeStr.split("-");
    const pred = {
      outcome: getOutcomeFromScore(parseInt(parts[0]) || 0, parseInt(parts[1]) || 0),
      homeScore: parseInt(parts[0]) || 0,
      awayScore: parseInt(parts[1]) || 0,
    };
    const actual = {
      outcome: getOutcomeFromScore(m.score.home, m.score.away),
      homeScore: m.score.home,
      awayScore: m.score.away,
    };
    totalPoints += calculatePoints(pred, actual).points;
  }

  const finishedCount = currentMatches.filter((m) => m.status === "finished").length;
  const upcomingCount = currentMatches.filter((m) => m.status === "upcoming").length;

  return (
    <AppShell
      title={currentGWLabel ? `Matchday ${currentGWLabel}` : "My Results"}
      description="Your personal results across all leagues. Navigate past game weeks to review your predictions and points."
    >
      {/* Stats summary */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="gap-0 p-5 shadow-[var(--shadow-card)]">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-7 w-28" />
            </Card>
          ))
        ) : (
          <>
            <StatCard label="Total points" value={String(totalPoints)} accent="primary" hint="All game weeks" />
            <StatCard
              label="Predictions made"
              value={String(matchesWithPredictions.length)}
              hint="Across all leagues"
            />
            <StatCard
              label="Game weeks played"
              value={String(gameWeeks.length)}
              accent="gold"
              hint="With at least 1 prediction"
            />
          </>
        )}
      </div>

      {/* Game week navigation */}
      {gameWeeks.length > 1 && (
        <div className="mb-5 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={gameWeekIndex === 0}
            onClick={() => setGameWeekIndex((i) => i - 1)}
          >
            ← Previous
          </Button>
          <span className="num text-sm font-semibold text-muted-foreground">
            {gameWeekIndex + 1} / {gameWeeks.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={gameWeekIndex >= gameWeeks.length - 1}
            onClick={() => setGameWeekIndex((i) => i + 1)}
          >
            Next →
          </Button>
        </div>
      )}

      {/* Game week points header */}
      {!loading && currentGWLabel && (
        <Card className="mb-6 gap-0 p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Matchday {currentGWLabel}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {finishedCount} finished · {upcomingCount} upcoming · {currentMatches.length} total predictions
              </p>
            </div>
            <div className="text-right">
              <p className="num font-display text-2xl font-bold text-primary">{gwPoints}</p>
              <p className="text-xs text-muted-foreground">points this week</p>
            </div>
          </div>
        </Card>
      )}

      {/* Matches with predictions */}
      <div className="grid gap-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]">
              <Skeleton className="h-3 w-36" />
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-32 justify-self-end" />
              </div>
            </div>
          ))
        ) : currentMatches.length > 0 ? (
          currentMatches.map((match) => {
            const outcomeStr = match.prediction?.[0]?.outcome;
            let scoringResult = null;

            if (outcomeStr && outcomeStr.includes("-") && match.score) {
              const parts = outcomeStr.split("-");
              const prediction = {
                outcome: getOutcomeFromScore(parseInt(parts[0]) || 0, parseInt(parts[1]) || 0),
                homeScore: parseInt(parts[0]) || 0,
                awayScore: parseInt(parts[1]) || 0,
              };
              const actual = {
                outcome: getOutcomeFromScore(match.score.home, match.score.away),
                homeScore: match.score.home,
                awayScore: match.score.away,
              };
              scoringResult = calculatePoints(prediction, actual);
            }

            return (
              <MatchCard
                key={match.id}
                match={match}
                scoringResult={scoringResult}
                footer={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Your pick:</span>
                      <span className="num text-sm font-bold text-primary">{outcomeStr ?? "—"}</span>
                    </div>
                    {match.score && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Actual:</span>
                        <span className="num text-sm font-bold">
                          {match.score.home} - {match.score.away}
                        </span>
                      </div>
                    )}
                  </div>
                }
              />
            );
          })
        ) : (
          <Card className="p-6 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm font-semibold">
              {matchesWithPredictions.length === 0
                ? "No predictions yet"
                : "No predictions in this game week"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {matchesWithPredictions.length === 0
                ? "Start predicting to see your results here."
                : "Try another game week or make predictions for upcoming matches."}
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
