"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftRight, ArrowUpRight, BarChart2, Calendar, Clock, Layers, Star, Trophy, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import {
  getFplTeam,
  getFplCurrentGameweek,
  getMyFplLeagues,
  type FplTeam,
  type FplGameweek,
  type FplLeague,
} from "../lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

function getCountdown(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "Deadline passed";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function formatRank(rank: number | null): string {
  if (rank == null) return "—";
  return rank.toLocaleString("en-NG");
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).replace(",", " ·");
}

const QUICK_ACTIONS = [
  { href: "/fpl/squad", label: "View Squad", icon: Users, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { href: "/fpl/picks", label: "My Picks", icon: Layers, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { href: "/fpl/transfers", label: "Transfers", icon: ArrowLeftRight, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  { href: "/fpl/fixtures", label: "Fixtures", icon: Calendar, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { href: "/fpl/leagues", label: "Leagues", icon: Trophy, color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
  { href: "/fpl/history", label: "History", icon: BarChart2, color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
];

export default function FplDashboardPage() {
  const router = useRouter();
  const [team, setTeam] = useState<FplTeam | null>(null);
  const [gw, setGw] = useState<FplGameweek | null>(null);
  const [leagues, setLeagues] = useState<FplLeague[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      getFplTeam(),
      getFplCurrentGameweek().catch(() => null),
      getMyFplLeagues().catch(() => [] as typeof leagues),
    ]).then(([teamData, gwData, leagueData]) => {
      if (!active) return;
      if (!teamData) {
        router.replace("/fpl/setup");
        return;
      }
      setTeam(teamData);
      setGw(gwData);
      setLeagues(leagueData);
      setLoading(false);
    }).catch((err) => {
      if (!active) return;
      toast.error(err instanceof Error ? err.message : "Failed to load FPL data");
      setLoading(false);
    });

    return () => { active = false; };
  }, [router]);

  if (loading || !team) {
    return (
      <FplShell title="FPL Dashboard">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </FplShell>
    );
  }

  const hasDeadline = gw && !gw.isFinished;
  const nextGw = gw?.isNext ? gw : null;

  return (
    <FplShell
      title={team.teamName}
      description={gw ? `${gw.name} · Season ${team.season}` : `Season ${team.season}`}
    >
      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">GW Points</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{team.gwPoints ?? 0}</p>
            {gw && (
              <p className="mt-1 text-xs text-muted-foreground">
                Avg {gw.averageScore ?? "—"} · High {gw.highestScore ?? "—"}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Points</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{team.totalPoints}</p>
            <p className="mt-1 text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Overall Rank</p>
                <p className="mt-2 text-3xl font-bold tabular-nums">{formatRank(team.overallRank)}</p>
              </div>
              <TrendingUp className="mt-1 h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Free Transfers</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{team.freeTransfers}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Budget: £{(team.budget / 10).toFixed(1)}m
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deadline countdown */}
      {hasDeadline && (
        <Card className={cn("border-0 mt-5", nextGw ? "bg-emerald-500/10" : "bg-muted/50")}>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", nextGw ? "bg-emerald-500/20" : "bg-primary/10")}>
                <Clock className={cn("h-5 w-5", nextGw ? "text-emerald-600 dark:text-emerald-400" : "text-primary")} />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {nextGw ? `${gw!.name} Deadline` : `${gw!.name} in progress`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(gw!.deadline)}
                </p>
              </div>
            </div>
            {nextGw && (
              <div className={cn("rounded-xl px-4 py-2 text-center", "bg-emerald-500/20")}>
                <p className="text-xs text-muted-foreground">Time remaining</p>
                <p className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {getCountdown(gw!.deadline)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-all hover:border-border/80 hover:shadow-sm"
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", action.color)}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Chips status */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Chips</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Wildcard 1", key: "wildcard1" as const },
            { label: "Wildcard 2", key: "wildcard2" as const },
            { label: "Triple Captain", key: "tripleCaptain" as const },
            { label: "Bench Boost", key: "benchBoost" as const },
            { label: "Free Hit", key: "freeHit" as const },
          ].map((chip) => (
            <div
              key={chip.key}
              className={cn(
                "rounded-xl border p-3 text-center",
                team.chipUsed?.[chip.key]
                  ? "border-border bg-muted/40 opacity-60"
                  : "border-emerald-500/30 bg-emerald-500/5",
              )}
            >
              <Star className={cn("mx-auto mb-1 h-4 w-4", team.chipUsed?.[chip.key] ? "text-muted-foreground" : "text-emerald-500")} />
              <p className="text-xs font-medium">{chip.label}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{team.chipUsed?.[chip.key] ? "Used" : "Available"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leagues */}
      {leagues.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">My Leagues</h2>
            <Link href="/fpl/leagues" className="flex items-center gap-1 text-xs text-primary hover:underline">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {leagues.slice(0, 3).map((league) => (
              <Link
                key={league._id}
                href={`/fpl/leagues/${league._id}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/15">
                  <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{league.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {league.type} · {league.memberCount} member{league.memberCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <ArrowUpRight size={14} className="shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {leagues.length === 0 && (
        <div className="mt-6">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/15">
                <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="font-semibold">No leagues yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Join or create a league to compete with friends</p>
              </div>
              <Link href="/fpl/leagues" className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
                Go to Leagues
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </FplShell>
  );
}
