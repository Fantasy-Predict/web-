"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Copy, Share2, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  getFplLeagueStandings,
  getFplH2HResults,
  getFplCurrentGameweek,
  type FplLeague,
  type FplLeagueMember,
  type FplH2HResult,
  type FplGameweek,
} from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

function RankDelta({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null || previous === current) return <span className="text-xs text-muted-foreground">—</span>;
  const delta = previous - current; // positive = moved up
  return (
    <span className={cn("flex items-center gap-0.5 text-xs font-medium", delta > 0 ? "text-success" : "text-destructive")}>
      {delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(delta)}
    </span>
  );
}

function ClassicStandings({ members }: { members: FplLeagueMember[] }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 w-10">#</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-right">GW</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right hidden sm:table-cell">Move</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={m._id} className={cn(
                "border-b border-border last:border-0 transition-colors hover:bg-accent/50",
                i === 0 && "bg-yellow-500/5",
              )}>
                <td className="px-4 py-3">
                  <span className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    i === 0 ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" :
                    i === 1 ? "bg-slate-400/20 text-slate-600 dark:text-slate-300" :
                    i === 2 ? "bg-amber-700/20 text-amber-700 dark:text-amber-400" :
                    "text-muted-foreground",
                  )}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium truncate max-w-[140px]">{m.teamName}</td>
                <td className="px-4 py-3 text-right font-semibold">{m.gwPoints}</td>
                <td className="px-4 py-3 text-right font-bold">{m.totalPoints}</td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <RankDelta current={m.currentRank} previous={m.previousRank} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function H2HStandings({ members, results, gwId }: { members: FplLeagueMember[]; results: FplH2HResult[]; gwId: number | null }) {
  return (
    <div className="space-y-5">
      {/* Points table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 w-10">#</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3 text-right">H2H Pts</th>
                <th className="px-4 py-3 text-right">GW Pts</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {members
                .slice()
                .sort((a, b) => (b.h2hPoints ?? 0) - (a.h2hPoints ?? 0))
                .map((m, i) => (
                  <tr key={m._id} className={cn("border-b border-border last:border-0 hover:bg-accent/50", i === 0 && "bg-yellow-500/5")}>
                    <td className="px-4 py-3">
                      <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                        i === 0 ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" : "text-muted-foreground")}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium truncate max-w-[140px]">{m.teamName}</td>
                    <td className="px-4 py-3 text-right font-bold">{m.h2hPoints ?? 0}</td>
                    <td className="px-4 py-3 text-right">{m.gwPoints}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{m.totalPoints}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* GW matchups */}
      {results.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {gwId ? `GW${gwId} Matchups` : "Recent Matchups"}
          </h3>
          <div className="space-y-2">
            {results.map(r => {
              const p1Wins = r.points1 > r.points2;
              const p2Wins = r.points2 > r.points1;
              const draw = r.points1 === r.points2;
              return (
                <div key={r._id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <div className={cn("flex-1 text-right", p1Wins && "font-bold text-success")}>
                    <p className="truncate text-sm">{r.teamName1}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn("text-sm font-bold tabular-nums", p1Wins && "text-success")}>{r.points1}</span>
                    <span className="text-xs text-muted-foreground">{draw ? "D" : "–"}</span>
                    <span className={cn("text-sm font-bold tabular-nums", p2Wins && "text-success")}>{r.points2}</span>
                  </div>
                  <div className={cn("flex-1", p2Wins && "font-bold text-success")}>
                    <p className="truncate text-sm">{r.teamName2}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FplLeagueDetailPage({ params }: { params: Promise<{ leagueId: string }> }) {
  const { leagueId } = use(params);
  const [league, setLeague] = useState<FplLeague | null>(null);
  const [members, setMembers] = useState<FplLeagueMember[]>([]);
  const [h2hResults, setH2hResults] = useState<FplH2HResult[]>([]);
  const [currentGw, setCurrentGw] = useState<FplGameweek | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leagueId) return;
    let active = true;

    Promise.all([
      getFplLeagueStandings(leagueId),
      getFplCurrentGameweek(),
    ]).then(async ([standings, gw]) => {
      if (!active) return;
      setLeague(standings.league);
      setMembers(standings.members);
      setCurrentGw(gw);

      if (standings.league?.type === "h2h" && gw) {
        const results = await getFplH2HResults(leagueId, gw.fplId).catch(() => []);
        if (active) setH2hResults(results);
      }
      if (active) setLoading(false);
    }).catch(err => {
      if (!active) return;
      toast.error(err instanceof Error ? err.message : "Failed to load league");
      setLoading(false);
    });

    return () => { active = false; };
  }, [leagueId]);

  if (loading) {
    return (
      <FplShell title="League">
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </FplShell>
    );
  }

  if (!league) {
    return (
      <FplShell title="League">
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            League not found or you are not a member.
          </CardContent>
        </Card>
      </FplShell>
    );
  }

  return (
    <FplShell
      title={league.name}
      description={`${league.type === "classic" ? "Classic" : "Head-to-Head"} · ${league.memberCount} members`}
    >
      {/* League info card */}
      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold",
              league.type === "h2h" ? "bg-primary/15 text-primary" : "bg-gold/20 text-gold",
            )}>
              {league.type === "h2h" ? "H2H" : "CL"}
            </div>
            <div>
              <p className="font-semibold">{league.name}</p>
              <p className="text-xs text-muted-foreground">Code: <span className="font-mono font-semibold">{league.code}</span></p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(league.code); toast.success("Invite code copied"); }}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-accent"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy code
            </button>
            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/fpl/leagues/join`;
                if (navigator.share) {
                  navigator.share({ title: league.name, text: `Join my Fantasy XI league with code ${league.code}`, url });
                } else {
                  navigator.clipboard.writeText(`Join my Fantasy XI league! Code: ${league.code}\n${url}`);
                  toast.success("Share link copied");
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-accent"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Standings */}
      {members.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-sm text-muted-foreground">
            <Trophy className="h-8 w-8" />
            <p>No standings yet — the first gameweek will populate the table.</p>
          </CardContent>
        </Card>
      ) : league.type === "classic" ? (
        <ClassicStandings members={members} />
      ) : (
        <H2HStandings members={members} results={h2hResults} gwId={currentGw?.fplId ?? null} />
      )}
    </FplShell>
  );
}
