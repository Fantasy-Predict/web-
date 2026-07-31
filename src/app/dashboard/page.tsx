import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { LeagueCard, MatchCard, StatCard } from "../../../src/components/app/card";
import { currentUser, formatNaira, leaderboard, leagues, matches } from "../../app/lib/mock-data";

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

  return (
    <AppShell
      title={`Welcome back, ${currentUser.username}`}
      description="Matchweek 21 predictions close on Saturday at 15:00."
      actions={
        <Button asChild>
          <Link href="/dashboard/predict">Make predictions</Link>
        </Button>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Wallet balance" value={formatNaira(currentUser.balance)} hint="Available for entry fees" />
        <StatCard label="Total points" value={currentUser.points.toLocaleString()} accent="primary" hint={`+${currentUser.weeklyPoints} this week`} />
        <StatCard label="Global rank" value={`#${currentUser.rank}`} accent="gold" hint="Up 2 positions" />
        <StatCard label="Win rate" value={`${currentUser.winRate}%`} accent="success" hint="Correct outcomes this season" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quick predictions</h2>
            <Link href="/dashboard/fixtures" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
              All fixtures
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
        </section>

        <div className="grid gap-8">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Weekly rankings</h2>
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

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active leagues</h2>
          <Link href="/dashboard/leagues" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Manage leagues
          </Link>
        </div>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {leagues
            .filter((l) => l.rank)
            .map((league) => (
              <LeagueCard key={league.id} league={league} />
            ))}
        </div>
      </section>
    </AppShell>
  );
}