"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Jersey } from "@/components/app/jersey";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFplPlayerStats, type FplPlayer } from "@/app/lib/api/endpoints";
import { cn } from "@/app/lib/utils";

const POS_LABEL: Record<number, string> = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };

type MetricConfig = {
  key: string;
  label: string;
  short: string;
  valueOf: (p: FplPlayer) => number | string;
  position?: number; // optional default position filter
};

const METRICS: MetricConfig[] = [
  { key: "totalPoints", label: "Top Scorers", short: "Points", valueOf: p => p.totalPoints },
  { key: "form", label: "Best Form", short: "Form", valueOf: p => p.form },
  { key: "goalsScored", label: "Top Goals", short: "Goals", valueOf: p => p.goalsScored ?? 0 },
  { key: "assists", label: "Top Assists", short: "Assists", valueOf: p => p.assists ?? 0 },
  { key: "cleanSheets", label: "Clean Sheets", short: "CS", valueOf: p => p.cleanSheets ?? 0 },
  { key: "bonus", label: "Bonus Points", short: "Bonus", valueOf: p => p.bonus ?? 0 },
  { key: "ictIndex", label: "ICT Index", short: "ICT", valueOf: p => p.ictIndex ?? "0.0" },
  { key: "expectedGoals", label: "Expected Goals", short: "xG", valueOf: p => p.expectedGoals ?? "0.00" },
  { key: "expectedAssists", label: "Expected Assists", short: "xA", valueOf: p => p.expectedAssists ?? "0.00" },
  { key: "saves", label: "Saves", short: "Saves", valueOf: p => p.saves ?? 0, position: 1 },
];

function formatPrice(tenths: number): string {
  return `£${(tenths / 10).toFixed(1)}m`;
}

function StatRow({ player, metric, rank }: { player: FplPlayer; metric: MetricConfig; rank: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold tabular-nums",
          rank === 1 ? "bg-gold text-navy" : rank <= 3 ? "bg-gold/30 text-gold" : "bg-muted text-muted-foreground",
        )}
      >
        {rank}
      </span>
      <Jersey teamCode={player.teamCode} position={player.position} clubShort={player.clubShort} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{player.name}</p>
        <p className="text-xs text-muted-foreground">
          {player.clubShort} · {POS_LABEL[player.position]} · {formatPrice(player.price)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold tabular-nums text-gold">{metric.valueOf(player)}</p>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{metric.short}</p>
      </div>
    </div>
  );
}

function StatsPanel({ metricKey }: { metricKey: string }) {
  const metric = METRICS.find(m => m.key === metricKey)!;
  const [players, setPlayers] = useState<FplPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<number | undefined>(metric.position);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getFplPlayerStats({ metric: metric.key, limit: 25, position })
      .then(data => {
        if (active) setPlayers(data.players);
      })
      .catch(err => {
        toast.error(err instanceof Error ? err.message : "Could not load stats");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [metric.key, position]);

  return (
    <div className="space-y-3">
      {/* Position filter — hidden when the metric is already position-locked (e.g. saves for GKs) */}
      {metric.position === undefined && (
        <div className="flex flex-wrap gap-2">
          {[
            { label: "All", val: undefined },
            { label: "GK", val: 1 },
            { label: "DEF", val: 2 },
            { label: "MID", val: 3 },
            { label: "FWD", val: 4 },
          ].map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPosition(p.val)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                position === p.val
                  ? "border-gold bg-gold/20 text-gold"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No players found for this filter.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {players.map((p, i) => (
            <StatRow key={p.fplId} player={p} metric={metric} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FplStatsPage() {
  return (
    <FplShell title="Statistics" description="Season leaderboards from the official FPL data, updated every 5 minutes.">
      <Tabs defaultValue={METRICS[0].key} className="space-y-4">
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="w-max">
            {METRICS.map(m => (
              <TabsTrigger key={m.key} value={m.key}>
                {m.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {METRICS.map(m => (
          <TabsContent key={m.key} value={m.key}>
            <StatsPanel metricKey={m.key} />
          </TabsContent>
        ))}
      </Tabs>
    </FplShell>
  );
}
