"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../components/ui/card";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  getGlobalLeaderboard,
  getMyProfile,
  getNigeriaLeaderboard,
  getPoolsLeaderboard,
  getUserCompetitions,
  type PlatformBoardResponse,
  type PlatformBoardRow,
  type UserCompetition,
} from "../../lib/api/endpoints";
import { cn } from "../../lib/utils";

type TabKey = "global" | "nigeria" | "pools";

const EMPTY: PlatformBoardResponse = {
  board: [],
  personalRank: null,
  meta: { page: 1, limit: 20, total: 0, matchdayLabel: null },
};

/** Green up / red down / em-dash. Shown to the right of the rank number. */
function DeltaChip({ delta }: { delta: number | null }) {
  if (delta === null) {
    return <span className="inline-flex w-10 justify-center text-xs text-muted-foreground">—</span>;
  }
  if (delta === 0) {
    return <span className="inline-flex w-10 justify-center text-xs text-muted-foreground">—</span>;
  }
  const up = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex w-10 items-center justify-center gap-0.5 text-xs font-semibold",
        up ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
      )}
    >
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      {Math.abs(delta)}
    </span>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return `${a}${b}`.toUpperCase();
}

function LeaderboardSkeleton() {
  return (
    <Card className="gap-0 p-0 shadow-[var(--shadow-card)]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[2rem_2.5rem_1fr_3.5rem] items-center gap-3 border-b border-border px-4 py-3 last:border-0"
        >
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-3 w-7" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-10 justify-self-end" />
        </div>
      ))}
    </Card>
  );
}

function PersonalRankCard({ row, label }: { row: PlatformBoardRow; label: string }) {
  return (
    <Card className="mb-6 gap-0 border-primary/30 bg-primary/5 p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            {label}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <p className="font-display text-3xl font-bold text-primary">#{row.rank}</p>
            <DeltaChip delta={row.delta} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase">Total</p>
          <p className="num font-display text-2xl font-bold">{row.totalPoints}</p>
        </div>
      </div>
    </Card>
  );
}

function UserBoard({
  data,
  loading,
  currentUserId,
}: {
  data: PlatformBoardResponse;
  loading: boolean;
  currentUserId: string | null;
}) {
  if (loading) return <LeaderboardSkeleton />;
  if (data.board.length === 0) {
    return (
      <Card className="p-8 text-center shadow-[var(--shadow-card)]">
        <p className="text-sm font-semibold">No rankings yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Rankings appear once matches are scored.
        </p>
      </Card>
    );
  }

  return (
    <>
      {data.personalRank && (
        <PersonalRankCard row={data.personalRank} label="Your Rank" />
      )}

      <Card className="gap-0 overflow-hidden p-0 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-[2rem_2.5rem_1fr_3.5rem] items-center gap-3 border-b border-border px-4 py-3 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          <span>#</span>
          <span></span>
          <span>Player</span>
          <span className="text-right">Tot</span>
        </div>
        {data.board.map((row) => {
          const me = currentUserId && row.entityId === currentUserId;
          return (
            <div
              key={row.entityId}
              className={cn(
                "grid grid-cols-[2rem_2.5rem_1fr_3.5rem] items-center gap-3 border-b border-border px-4 py-3 text-sm last:border-0",
                me && "bg-primary/5",
              )}
            >
              <span className="num font-semibold text-muted-foreground">{row.rank}</span>
              <DeltaChip delta={row.delta} />
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-muted text-[10px] font-semibold">
                    {initials(row.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 items-center gap-2 font-medium">
                  <span className="truncate">{row.name}</span>
                  {me && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">You</span>
                  )}
                </span>
              </div>
              <span className="num justify-self-end font-bold">{row.totalPoints}</span>
            </div>
          );
        })}
      </Card>
    </>
  );
}

function PoolsBoard({ data, loading }: { data: PlatformBoardResponse; loading: boolean }) {
  if (loading) return <LeaderboardSkeleton />;
  if (data.board.length === 0) {
    return (
      <Card className="p-8 text-center shadow-[var(--shadow-card)]">
        <p className="text-sm font-semibold">No pools yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Public pools appear here once they have members and scored matches.
        </p>
      </Card>
    );
  }

  // When nothing has scored this week (e.g. international break, pre-season),
  // every pool is tied at 0 and dense rank shows #1 across the board, which
  // reads as broken. Hide the rank numbers in that state and show a banner.
  const nothingScoredThisWeek = data.board.every((r) => r.totalPoints === 0);

  return (
    <>
      {data.personalRank && !nothingScoredThisWeek && (
        <PersonalRankCard row={data.personalRank} label="Your Top Pool" />
      )}
      {nothingScoredThisWeek && (
        <Card className="mb-4 gap-0 border-muted bg-muted/30 p-4 shadow-[var(--shadow-card)]">
          <p className="text-sm font-semibold">No scores yet this week</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Rankings move once the next round of matches finishes.
          </p>
        </Card>
      )}
      <div className="grid gap-3">
        {data.board.map((row) => (
          <Card
            key={row.entityId}
            className="gap-0 p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex w-10 flex-col items-center">
                {row.totalPoints > 0 ? (
                  <>
                    <span className="num text-sm font-bold text-muted-foreground">#{row.rank}</span>
                    <DeltaChip delta={row.delta} />
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate font-semibold">{row.name}</p>
                <p className="text-xs text-muted-foreground">
                  {row.memberCount ?? 0} member{(row.memberCount ?? 0) === 1 ? "" : "s"}
                  {row.isFull && <span className="ml-2 text-amber-600 dark:text-amber-400">· Full</span>}
                </p>
              </div>
              <div className="text-right">
                <p className="num font-display text-lg font-bold">{row.totalPoints}</p>
                <p className="text-[10px] text-muted-foreground uppercase">This week</p>
              </div>
            </div>
            {row.joinCode && !row.isFull && (
              <div className="mt-3 flex justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/pools/join?code=${encodeURIComponent(row.joinCode)}`}>Join pool</Link>
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<TabKey>("global");
  const [loading, setLoading] = useState(false);

  const [global, setGlobal] = useState<PlatformBoardResponse>(EMPTY);
  const [nigeria, setNigeria] = useState<PlatformBoardResponse>(EMPTY);
  const [pools, setPools] = useState<PlatformBoardResponse>(EMPTY);

  const [competitions, setCompetitions] = useState<UserCompetition[]>([]);
  const [selectedComp, setSelectedComp] = useState<string>("");
  const [myUserId, setMyUserId] = useState<string | null>(null);

  // Load competitions + profile once
  useEffect(() => {
    let active = true;
    (async () => {
      const [comps, me] = await Promise.all([
        getUserCompetitions().catch(() => [] as UserCompetition[]),
        getMyProfile().catch(() => null),
      ]);
      if (!active) return;
      setCompetitions(comps);
      if (me?._id) setMyUserId(String(me._id));
    })();
    return () => { active = false; };
  }, []);

  // Load data for the active tab
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        if (tab === "global") {
          const data = await getGlobalLeaderboard(1, 50, selectedComp || undefined);
          if (active) setGlobal(data);
        } else if (tab === "nigeria") {
          const data = await getNigeriaLeaderboard(1, 50, selectedComp || undefined);
          if (active) setNigeria(data);
        } else {
          const data = await getPoolsLeaderboard(1, 50);
          if (active) setPools(data);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load the leaderboard");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [tab, selectedComp]);

  return (
    <AppShell
      title="Leaderboards"
      description="See who's on top — global, Nigeria, and the hottest pools."
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="nigeria">Nigeria</TabsTrigger>
            <TabsTrigger value="pools">Pools</TabsTrigger>
          </TabsList>

          {tab !== "pools" && competitions.length > 0 && (
            <Select value={selectedComp || "__all__"} onValueChange={(v) => setSelectedComp(v === "__all__" ? "" : v)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All competitions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All competitions</SelectItem>
                {competitions.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="global" className="mt-0">
          <UserBoard data={global} loading={loading} currentUserId={myUserId} />
        </TabsContent>
        <TabsContent value="nigeria" className="mt-0">
          <UserBoard data={nigeria} loading={loading} currentUserId={myUserId} />
        </TabsContent>
        <TabsContent value="pools" className="mt-0">
          <PoolsBoard data={pools} loading={loading} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
