"use client";

import { useEffect, useState } from "react";
import { BarChart2, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  getFplTeamHistory,
  getFplGameweeks,
  type FplGameweek,
} from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

type HistoryEntry = {
  gwId: number;
  points: number;
  totalPoints: number;
  rank: number;
};

export default function FplHistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [gameweeks, setGameweeks] = useState<FplGameweek[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getFplTeamHistory(), getFplGameweeks()]).then(([hist, gws]) => {
      if (!active) return;
      setHistory(hist);
      setGameweeks(gws);
      setLoading(false);
    }).catch(err => {
      if (!active) return;
      toast.error(err instanceof Error ? err.message : "Failed to load history");
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const gwMap = new Map(gameweeks.map(g => [g.fplId, g]));

  const totalPoints = history.at(-1)?.totalPoints ?? 0;
  const bestGw = history.length > 0 ? history.reduce((a, b) => a.points >= b.points ? a : b) : null;
  const worstGw = history.length > 0 ? history.reduce((a, b) => a.points <= b.points ? a : b) : null;
  const avgPoints = history.length > 0 ? Math.round(history.reduce((s, h) => s + h.points, 0) / history.length) : 0;

  if (loading) {
    return (
      <FplShell title="GW History">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </FplShell>
    );
  }

  if (history.length === 0) {
    return (
      <FplShell title="GW History">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-sm text-muted-foreground">
            <BarChart2 className="h-8 w-8" />
            <p>No history yet — complete a gameweek to see your scores here.</p>
          </CardContent>
        </Card>
      </FplShell>
    );
  }

  return (
    <FplShell title="GW History" description={`${history.length} gameweek${history.length !== 1 ? "s" : ""} played`}>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total points</p>
            <p className="mt-1 text-xl font-bold">{totalPoints}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg / GW</p>
            <p className="mt-1 text-xl font-bold">{avgPoints}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Best GW</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <p className="text-xl font-bold">{bestGw?.points ?? "—"}</p>
              {bestGw && <span className="text-xs text-muted-foreground">GW{bestGw.gwId}</span>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Worst GW</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <p className="text-xl font-bold">{worstGw?.points ?? "—"}</p>
              {worstGw && <span className="text-xs text-muted-foreground">GW{worstGw.gwId}</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GW-by-GW table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Gameweek</th>
                <th className="px-4 py-3 text-right">GW Pts</th>
                <th className="px-4 py-3 text-right">Total Pts</th>
                <th className="px-4 py-3 text-right">Rank</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Trend</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().map((h, i, arr) => {
                const prev = arr[i + 1];
                const rankDelta = prev ? prev.rank - h.rank : null; // positive = improved
                const gw = gwMap.get(h.gwId);
                const isBest = h.gwId === bestGw?.gwId;

                return (
                  <tr
                    key={h.gwId}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors hover:bg-accent/50",
                      isBest && "bg-emerald-500/5",
                    )}
                  >
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {gw?.name ?? `GW${h.gwId}`}
                        {isBest && (
                          <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                            Best
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{h.points}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{h.totalPoints}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {h.rank > 0 ? h.rank.toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      {rankDelta !== null && rankDelta !== 0 ? (
                        <span className={cn("flex items-center justify-end gap-1 text-xs font-medium", rankDelta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
                          {rankDelta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(rankDelta).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </FplShell>
  );
}
