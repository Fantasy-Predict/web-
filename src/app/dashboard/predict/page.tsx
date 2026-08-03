"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { TeamCrest, MatchCard } from "../../../components/app/card";
import { matches, type Match } from "../../lib/mock-data";
import { cn } from "../../lib/utils";
import { calculatePoints, getOutcomeFromScore, type Prediction } from "../../lib/scoring";

type Pick = { 
  outcome?: "home" | "draw" | "away"; 
  home?: string; 
  away?: string; 
  locked?: boolean;
  prediction?: Prediction;
};

export default function PredictPage() {
  const [allMatches] = useState<Match[]>(matches);
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const upcoming = allMatches.filter((m) => m.status === "upcoming");
  const finished = allMatches.filter((m) => m.status === "finished");

  const completed = upcoming.filter((m) => picks[m.id]?.outcome).length;

  function handleSubmit() {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("Predictions submitted for matchweek 21");
    }, 800);
  }

  return (
    <AppShell
      title="Matchweek 21"
      description="Predictions lock at each match kickoff. You can edit until then."
    >
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
            style={{ width: `${(completed / upcoming.length) * 100}%` }}
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
        {upcoming.map((match, index) => (
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
        ))}
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
          disabled={submitting || completed === 0}
          size="lg"
          className="w-full sm:w-auto"
        >
          {submitting ? "Submitting…" : "Submit predictions"}
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
          {match.competition}
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