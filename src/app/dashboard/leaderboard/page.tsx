"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../components/ui/card";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Skeleton } from "../../../components/ui/skeleton";
import { getLeaderboard } from "../../lib/api/endpoints";
import type { LeaderboardRow } from "../../lib/mock-data";
import { cn } from "../../lib/utils";

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getLeaderboard();
        if (!active) return;
        setRows([...(data ?? [])].sort((a, b) => b.total - a.total));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load the leaderboard");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const [first, second, third, ...rest] = rows;
  const podium = [second, first, third];

  return (
    <AppShell title="Leaderboard" description="Global standings for the 2026 season.">
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="items-center gap-0 p-6 text-center shadow-[var(--shadow-card)]">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="mx-auto mt-4 h-14 w-14 rounded-full" />
              <Skeleton className="mx-auto mt-4 h-4 w-24" />
              <Skeleton className="mx-auto mt-4 h-6 w-16" />
            </Card>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm font-semibold">No rankings yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Rankings appear once players start scoring points.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {podium.map((row, index) => {
              if (!row) return null;
              const place = index === 1 ? 1 : index === 0 ? 2 : 3;
              return (
                <Card
                  key={row.id}
                  className={cn(
                    "items-center gap-0 p-6 text-center shadow-[var(--shadow-card)]",
                    place === 1 && "border-gold/50 bg-gold/5 sm:-mt-4",
                  )}
                >
                  <span
                    className={cn(
                      "num font-display text-sm font-bold",
                      place === 1 ? "text-gold" : "text-muted-foreground",
                    )}
                  >
                    #{place}
                  </span>
                  <Avatar className="mt-4 h-14 w-14">
                    <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                      {row.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mt-4 text-sm font-semibold">{row.username}</p>
                  <p className="num mt-4 font-display text-2xl font-bold">{row.total.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-muted-foreground">total points</p>
                </Card>
              );
            })}
          </div>

          <Card className="mt-8 gap-0 overflow-hidden p-0 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_4.5rem] gap-3 border-b border-border px-5 py-3 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase sm:grid-cols-[2.5rem_minmax(0,1fr)_5rem]">
              <span>#</span>
              <span>Player</span>
              <span className="text-right">Total</span>
            </div>
            {rest.map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)_4.5rem] items-center gap-3 border-b border-border px-5 py-3.5 text-sm last:border-0 sm:grid-cols-[2.5rem_minmax(0,1fr)_5rem]"
              >
                <span className="num font-semibold text-muted-foreground">{index + 4}</span>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-muted text-[10px] font-semibold">
                      {row.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium">{row.username}</span>
                  <Movement value={row.movement} />
                </div>
                <span className="num text-right font-bold">{row.total.toLocaleString()}</span>
              </div>
            ))}
          </Card>
        </>
      )}
    </AppShell>
  );
}

function Movement({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-muted-foreground">–</span>;
  return (
    <span
      className={cn(
        "num shrink-0 text-xs font-semibold",
        value > 0 ? "text-success" : "text-destructive",
      )}
    >
      {value > 0 ? `+${value}` : value}
    </span>
  );
}
