"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { MatchCard, StatCard } from "../../../src/components/app/card";
import { formatNaira, type Match } from "../../app/lib/mock-data";
import {
  getMatches,
  getMatchScores,
  getProfile,
  getUserCompetitions,
  getWallet,
  getCompLeaderboard,
  type UserCompetition,
  type UserProfile,
} from "../../app/lib/api/endpoints";
import { useNotifications, notifySystem } from "../../app/lib/notifications";

function formatKickoff(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState(0);
  const [matchList, setMatchList] = useState<Match[]>([]);
  const [recentPredictions, setRecentPredictions] = useState<Match[]>([]);
  const [competitions, setCompetitions] = useState<UserCompetition[]>([]);
  const [board, setBoard] = useState<{ id: string; username: string; total: number; exact: number; close: number; slam: number; rank: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const compNameMap = useRef<Map<string, string>>(new Map());
  const { notifications } = useNotifications();

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [profileData, wallet, comps] = await Promise.all([
          getProfile(),
          getWallet(),
          getUserCompetitions(),
        ]);
        comps?.forEach((c) => compNameMap.current.set(c._id, c.name));

        const defaultComp = comps?.find((c) => c.default) ?? comps?.[0];
        let lbBoard: typeof board = [];
        if (defaultComp) {
          try {
            const lb = await getCompLeaderboard(defaultComp._id);
            lbBoard = (lb.board ?? []).map((e) => ({
              id: e.userId,
              username: e.username || `${e.firstName} ${e.lastName}`.trim(),
              total: e.total,
              exact: e.exact,
              close: e.close,
              slam: e.slam,
              rank: e.rank,
            }));
          } catch {
            // leaderboard fetch failed silently
          }
        }

        const allMatchesData = await Promise.all(
          (comps ?? []).map((c) => getMatches(c._id).catch(() => [])),
        );
        const allScoresData = await Promise.all(
          (comps ?? []).map((c) => getMatchScores(c._id).catch(() => [])),
        );

        if (!active) return;

        const allMatches = allMatchesData.flat()
          .filter((m) => m && m.id && m.home && m.away)
          .map((m) => ({
            ...m,
            competitionName: compNameMap.current.get(m.competition) ?? m.competition,
            kickoff: formatKickoff(m.kickoff),
          }));

        const allScores = allScoresData.flat()
          .filter((m) => m && m.id && m.home && m.away)
          .map((m) => ({
            ...m,
            competitionName: compNameMap.current.get(m.competition) ?? m.competition,
            kickoff: formatKickoff(m.kickoff),
          }));

        const mergedAll = [...allMatches];
        const mergedIds = new Set(allMatches.map((m) => m.id));
        for (const sm of allScores) {
          if (!mergedIds.has(sm.id)) {
            mergedAll.push(sm);
          }
        }

        const upcoming = mergedAll
          .filter((m) => m.status === "upcoming")
          .sort((a, b) => {
            const da = a.kickoff.length > 10 ? new Date(a.kickoff).getTime() : 0;
            const db = b.kickoff.length > 10 ? new Date(b.kickoff).getTime() : 0;
            return da - db;
          })
          .slice(0, 5);
        setMatchList(upcoming);

        const withPredictions = mergedAll
          .filter((m) => m.prediction && m.prediction.length > 0 && m.prediction[0].outcome)
          .sort((a, b) => {
            const da = a.kickoff.length > 10 ? new Date(a.kickoff).getTime() : 0;
            const db = b.kickoff.length > 10 ? new Date(b.kickoff).getTime() : 0;
            return db - da;
          })
          .slice(0, 3);
        setRecentPredictions(withPredictions);

        setProfile(profileData ?? null);
        setBalance(wallet?.balance ?? 0);
        setCompetitions(comps ?? []);
        setBoard([...lbBoard].sort((a, b) => a.rank - b.rank));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load your dashboard");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const displayName = profile?.firstName || profile?.username || profile?.email || "champ";
  const upcoming = matchList;
  const ownEntry = board.find((row) => row.id === profile?._id);
  const ownPoints = ownEntry?.total ?? 0;
  const ownRank = ownEntry?.rank ?? null;

  return (
    <AppShell
      title={`Welcome back, ${loading ? "champ" : displayName}`}
      description="Your season dashboard — predictions, points and standings in one place."
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
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]">
                <Skeleton className="h-3 w-36" />
                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-32 justify-self-end" />
                </div>
              </div>
            ))
          ) : upcoming.length > 0 ? (
            upcoming.map((match) => (
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
            ))
          ) : (
            <Card className="p-6 text-center shadow-[var(--shadow-card)]">
              <p className="text-sm font-semibold">No upcoming fixtures right now</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Check back when the next matchday is announced.
              </p>
            </Card>
          )}
        </div>
        <div className="mt-6 text-center">
          <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90">
            <Link href="/dashboard/predict">View All Predictions</Link>
          </Button>
        </div>
      </section>

      {/* Your Recent Predictions */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Recent Predictions</h2>
          <Link href="/dashboard/predict" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Make more
          </Link>
        </div>
        <div className="mt-4 grid gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]">
                <Skeleton className="h-3 w-36" />
                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-32 justify-self-end" />
                </div>
                <Skeleton className="mt-5 h-8 w-40" />
              </div>
            ))
          ) : recentPredictions.length > 0 ? (
            recentPredictions.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                footer={
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Your prediction</span>
                    <span className="num text-sm font-bold text-primary">
                      {match.prediction?.[0]?.outcome ?? "—"}
                    </span>
                  </div>
                }
              />
            ))
          ) : (
            <Card className="p-6 text-center shadow-[var(--shadow-card)]">
              <p className="text-sm font-semibold">No predictions yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Start predicting to see your recent picks here.
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* Stats Row */}
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="gap-0 p-5 shadow-[var(--shadow-card)]">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-7 w-28" />
            </Card>
          ))
        ) : (
          <>
            <StatCard label="Wallet balance" value={formatNaira(balance)} hint="Available for entry fees" />
            <StatCard
              label="Total points"
              value={ownPoints.toLocaleString()}
              accent="primary"
              hint="Season standings"
            />
            <StatCard label="Global rank" value={ownRank ? `#${ownRank}` : "—"} accent="gold" hint="Across all players" />
            <StatCard label="Active pools" value={competitions.length.toLocaleString()} accent="success" hint="Competitions available" />
          </>
        )}
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
        {/* Active Pools */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Pools</h2>
            <Link href="/dashboard/pools" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Manage pools
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)]">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-3 w-20" />
                </div>
              ))
            ) : competitions.length > 0 ? (
              competitions.slice(0, 6).map((competition) => (
                <div
                  key={competition._id}
                  className="flex items-center justify-between rounded-2xl border bg-card px-4 py-3 shadow-[var(--shadow-card)]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{competition.name}</p>
                    <p className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                      {competition.type}
                    </p>
                  </div>
                  <Badge variant="secondary">{competition.code}</Badge>
                </div>
              ))
            ) : (
              <Card className="p-6 text-center shadow-[var(--shadow-card)]">
                <p className="text-sm font-semibold">No pools available yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Join or create a pool to get started.
                </p>
              </Card>
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
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                  ))
                : board.slice(0, 5).map((row, index) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5"
                    >
                      <span className="num w-6 text-sm font-bold text-muted-foreground">{row.rank || index + 1}</span>
                      <span className="truncate text-sm font-semibold">{row.username}</span>
                      <span className="num text-sm font-bold">{row.total}</span>
                    </div>
                  ))}
            </Card>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Notifications</h2>
            <Card className="mt-4 gap-0 divide-y divide-border p-0 shadow-[var(--shadow-card)]">
              {notifications.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm font-semibold">No notifications</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You&apos;ll see updates about predictions, pools and payments here.
                  </p>
                </div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="px-5 py-4">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                  </div>
                ))
              )}
            </Card>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
