"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Jersey } from "@/components/app/jersey";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFplPriceChanges, type FplPlayer } from "@/app/lib/api/endpoints";

const POS_LABEL: Record<number, string> = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };

function formatPrice(tenths: number): string {
  return `£${(tenths / 10).toFixed(1)}m`;
}

function PriceRow({ player, direction }: { player: FplPlayer; direction: "up" | "down" }) {
  const change = Math.abs(player.costChangeEvent ?? 0);
  const oldPrice = direction === "up" ? player.price - change : player.price + change;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <Jersey teamCode={player.teamCode} position={player.position} clubShort={player.clubShort} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{player.name}</p>
        <p className="text-xs text-muted-foreground">
          {player.clubShort} · {POS_LABEL[player.position]} · {player.totalPoints} pts
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground line-through">{formatPrice(oldPrice)}</p>
        <p className="text-sm font-bold tabular-nums">{formatPrice(player.price)}</p>
      </div>
      <div
        className={
          "flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold " +
          (direction === "up"
            ? "bg-green-500/15 text-green-600 dark:text-green-400"
            : "bg-red-500/15 text-red-600 dark:text-red-400")
        }
      >
        {direction === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        {formatPrice(change)}
      </div>
    </div>
  );
}

function PriceList({ players, direction, emptyLabel }: { players: FplPlayer[]; direction: "up" | "down"; emptyLabel: string }) {
  if (players.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">{emptyLabel}</CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {players.map(p => (
        <PriceRow key={p.fplId} player={p} direction={direction} />
      ))}
    </div>
  );
}

export default function FplPricesPage() {
  const [risers, setRisers] = useState<FplPlayer[]>([]);
  const [fallers, setFallers] = useState<FplPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getFplPriceChanges(50)
      .then(data => {
        if (!active) return;
        setRisers(data.risers);
        setFallers(data.fallers);
      })
      .catch(err => {
        toast.error(err instanceof Error ? err.message : "Could not load price changes");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <FplShell
      title="Price Changes"
      description="FPL updates player prices around 2am UK time each morning based on net transfers."
    >
      <Tabs defaultValue="risers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="risers">Risers {risers.length > 0 && <span className="ml-1 text-xs text-muted-foreground">({risers.length})</span>}</TabsTrigger>
          <TabsTrigger value="fallers">Fallers {fallers.length > 0 && <span className="ml-1 text-xs text-muted-foreground">({fallers.length})</span>}</TabsTrigger>
        </TabsList>

        <TabsContent value="risers">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <PriceList players={risers} direction="up" emptyLabel="No price risers today — check back tomorrow morning." />
          )}
        </TabsContent>

        <TabsContent value="fallers">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <PriceList players={fallers} direction="down" emptyLabel="No price fallers today — check back tomorrow morning." />
          )}
        </TabsContent>
      </Tabs>
    </FplShell>
  );
}
