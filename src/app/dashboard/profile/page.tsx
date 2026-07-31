import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { StatCard } from "../../../components/app/card";
import { currentUser, matches } from "../../lib/mock-data";

interface Match {
  id: string;
  home: string;
  away: string;
  competition: string;
}

interface User {
  username: string;
  country: string;
  favouriteTeam: string;
  points: number;
  winRate: number;
  rank: number;
}

export const metadata: Metadata = {
  title: "Profile — Fantasy Predict",
  description:
    "Your Fantasy Predict profile: total points, win percentage, badges and full prediction history.",
  openGraph: {
    title: "Profile — Fantasy Predict",
    description: "Points, win percentage, badges and prediction history.",
  },
};

export default function ProfilePage() {
  return (
    <AppShell title="Profile" description="Your season record and prediction history.">
      <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
              {currentUser.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold">{currentUser.username}</h2>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {currentUser.country} · Supports {currentUser.favouriteTeam}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {["Perfect week", "Top 20 finisher", "50 predictions", "League founder"].map((badge) => (
            <Badge key={badge} variant="outline" className="border-gold/50 text-gold">
              {badge}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <StatCard label="Total points" value={currentUser.points.toLocaleString()} accent="primary" />
        <StatCard label="Win percentage" value={`${currentUser.winRate}%`} accent="success" />
        <StatCard label="Global rank" value={`#${currentUser.rank}`} accent="gold" />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Prediction history</h2>
        <Card className="mt-4 gap-0 divide-y divide-border p-0 shadow-[var(--shadow-card)]">
          {matches.map((match, index) => (
            <div
              key={match.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {match.home} v {match.away}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {match.competition} · Predicted {index % 2 === 0 ? "home win" : "2 – 1"}
                </p>
              </div>
              <Badge
                variant="outline"
                className={index % 3 === 0 ? "border-success/40 text-success" : "text-muted-foreground"}
              >
                {index % 3 === 0 ? "+5 pts" : index % 3 === 1 ? "+3 pts" : "0 pts"}
              </Badge>
            </div>
          ))}
        </Card>
      </section>
    </AppShell>
  );
}