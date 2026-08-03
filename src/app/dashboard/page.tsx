import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { LeagueCard, MatchCard, StatCard } from "../../../src/components/app/card";
import { currentUser, formatNaira, leaderboard, leagues, matches } from "../../app/lib/mock-data";
import { calculatePoints, getOutcomeFromScore } from "../../app/lib/scoring";

export const metadata: Metadata = {
  title: "Dashboard — Fantasy Predict",
  description:
    "Your Fantasy Predict dashboard: wallet balance, points, active leagues, upcoming fixtures and weekly rankings.",
  openGraph: {
    title: "Dashboard — Fantasy Predict",
    description: "Track your points, leagues and upcoming fixtures.",
  },
};

export default function DashboardPage() {
  const upcoming = matches.filter((m) => m.status === "upcoming").slice(0, 3);
  const finished = matches.filter((m) => m.status === "finished");

  // Calculate points from finished matches (example)
  const totalPointsFromFinished = finished.reduce((total, match) => {
    if (match.score) {
      // Mock prediction for demonstration
      const mockPrediction = {
        outcome: getOutcomeFromScore(match.score.home, match.score.away),
        homeScore: match.score.home - 1,
        awayScore: match.score.away + 1,
      };
      const actualResult = {
        outcome: getOutcomeFromScore(match.score.home, match.score.away),
        homeScore: match.score.home,
        awayScore: match.score.away,
      };
      const result = calculatePoints(mockPrediction, actualResult);
      return total + result.points;
    }
    return total;
  }, 0);

  return (
    <AppShell
      title={`Welcome back, ${currentUser.username}`}
      description="Matchweek 21 predictions close on Saturday at 15:00."
      actions={
        <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90">
          <Link href="/dashboard/predict">Make Predictions</Link>
        </Button>
      }
    >
      {/* Upcoming Matches */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming Matches</h2>
          <Link href="/dashboard/fixtures" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            View all fixtures
          </Link>
        </div>
        <div className="mt-4 grid gap-4">
          {upcoming.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              footer={
                <div className="grid grid-cols-3 gap-2">
                  {["Home win", "Draw", "Away win"].map((option) => (
                    <Button key={option} asChild variant="outline" size="sm">
                      <Link href="/dashboard/predict">{option}</Link>
                    </Button>
                  ))}
                </div>
              }
            />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90">
            <Link href="/dashboard/predict">View All Predictions</Link>
          </Button>
        </div>
      </section>

      {/* Stats Row */}
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Wallet balance" value={formatNaira(currentUser.balance)} hint="Available for entry fees" />
        <StatCard 
          label="Total points" 
          value={(currentUser.points + totalPointsFromFinished).toLocaleString()} 
          accent="primary" 
          hint={`+${currentUser.weeklyPoints} this week`} 
        />
        <StatCard label="Global rank" value={`#${currentUser.rank}`} accent="gold" hint="Up 2 positions" />
        <StatCard label="Win rate" value={`${currentUser.winRate}%`} accent="success" hint="Correct outcomes this season" />
      </div>

      {/* Scoring System Quick Reference */}
      <div className="mt-6">
        <Card className="p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Scoring System
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Exact", points: 5, color: "text-green-600 dark:text-green-400" },
              { label: "Close", points: 3, color: "text-blue-600 dark:text-blue-400" },
              { label: "Correct", points: 2, color: "text-gold" },
              { label: "Wrong", points: 0, color: "text-red-600 dark:text-red-400" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className={`font-display text-xl font-bold ${item.color}`}>{item.points}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Secondary Sections */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Active Leagues */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Leagues</h2>
            <Link href="/dashboard/leagues" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Manage leagues
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {leagues
              .filter((l) => l.rank)
              .slice(0, 2)
              .map((league) => (
                <LeagueCard key={league.id} league={league} />
              ))}
            {leagues.filter((l) => l.rank).length > 2 && (
              <div className="text-center text-sm text-muted-foreground">
                +{leagues.filter((l) => l.rank).length - 2} more leagues
              </div>
            )}
          </div>
        </section>

        {/* Right Column */}
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Weekly Rankings</h2>
              <Link href="/dashboard/leaderboard" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
                View all
              </Link>
            </div>
            <Card className="mt-4 gap-0 divide-y divide-border p-0 shadow-[var(--shadow-card)]">
              {leaderboard.slice(0, 5).map((row, index) => (
                <div key={row.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
                  <span className="num w-6 text-sm font-bold text-muted-foreground">{index + 1}</span>
                  <span className="truncate text-sm font-semibold">{row.username}</span>
                  <span className="num text-sm font-bold">{row.weekly}</span>
                </div>
              ))}
            </Card>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Notifications</h2>
            <Card className="mt-4 gap-0 divide-y divide-border p-0 shadow-[var(--shadow-card)]">
              {[
                ["Prediction deadline", "Matchweek 21 closes in 2 days"],
                ["League update", "Office Rivals added 2 new members"],
                ["Payment confirmed", "₦20,000 deposit was successful"],
              ].map(([title, body]) => (
                <div key={title} className="px-5 py-4">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{body}</p>
                </div>
              ))}
            </Card>
          </section>
        </div>
      </div>
    </AppShell>
  );
}