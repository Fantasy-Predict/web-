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
import { DeltaChip } from "../../../components/app/delta-chip";

type TabKey = "global" | "nigeria" | "pools";

const PAGE_SIZE = 20;

const EMPTY: PlatformBoardResponse = {
  board: [],
  personalRank: null,
  meta: { page: 1, limit: PAGE_SIZE, total: 0, matchdayLabel: null },
};

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

/** "#3 of 79" — Mr. Simi asked for this on 2026-11-23 so players see where they
 * stand against the whole field at a glance. */
function PersonalRankCard({ row, label, total }: { row: PlatformBoardRow; label: string; total: number }) {
  return (
    <Card className="mb-6 gap-0 border-primary/30 bg-primary/5 p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="font-display text-3xl font-bold text-primary">#{row.rank}</p>
            {total > 0 && (
              <p className="text-sm font-medium text-muted-foreground">of {total}</p>
            )}
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

/** "Show more" / "Show less" pagination controls. First 20 by default; expands
 * in 20-row batches. Reads `page.total` from the server to know when to stop. */
function Pagination({
  shown,
  total,
  busy,
  onMore,
  onLess,
}: {
  shown: number;
  total: number;
  busy: boolean;
  onMore: () => void;
  onLess: () => void;
}) {
  const hasMore = shown < total;
  const canShowLess = shown > PAGE_SIZE;
  if (!hasMore && !canShowLess) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <p className="text-xs text-muted-foreground">
        Showing {shown} of {total}
      </p>
      {hasMore && (
        <Button size="sm" variant="outline" disabled={busy} onClick={onMore}>
          {busy ? "Loading…" : "Show more"}
        </Button>
      )}
      {canShowLess && (
        <Button size="sm" variant="ghost" disabled={busy} onClick={onLess}>
          Show less
        </Button>
      )}
    </div>
  );
}

function UserBoard({
  data,
  loading,
  currentUserId,
  pagination,
}: {
  data: PlatformBoardResponse;
  loading: boolean;
  currentUserId: string | null;
  pagination: React.ReactNode;
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
        <PersonalRankCard row={data.personalRank} label="Your Rank" total={data.meta.total} />
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
      {pagination}
    </>
  );
}

function PoolsBoard({
  data,
  loading,
  pagination,
}: {
  data: PlatformBoardResponse;
  loading: boolean;
  pagination: React.ReactNode;
}) {
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

  const nothingScoredThisWeek = data.board.every((r) => r.totalPoints === 0);

  return (
    <>
      {data.personalRank && !nothingScoredThisWeek && (
        <PersonalRankCard row={data.personalRank} label="Your Top Pool" total={data.meta.total} />
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
      {pagination}
    </>
  );
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<TabKey>("global");
  const [loading, setLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);

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

  // Fetch first page for all three tabs on mount / competition change so the
  // tab labels can show totals immediately and switching tabs is instant.
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [g, n, p] = await Promise.all([
          getGlobalLeaderboard(1, PAGE_SIZE, selectedComp || undefined),
          getNigeriaLeaderboard(1, PAGE_SIZE, selectedComp || undefined),
          getPoolsLeaderboard(1, PAGE_SIZE),
        ]);
        if (!active) return;
        setGlobal(g);
        setNigeria(n);
        setPools(p);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load the leaderboard");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [selectedComp]);

  const activeData = tab === "global" ? global : tab === "nigeria" ? nigeria : pools;

  const loadMore = async () => {
    setMoreLoading(true);
    try {
      const nextPage = activeData.meta.page + 1;
      let fetched: PlatformBoardResponse;
      if (tab === "global") {
        fetched = await getGlobalLeaderboard(nextPage, PAGE_SIZE, selectedComp || undefined);
        setGlobal({
          board: [...global.board, ...fetched.board],
          personalRank: global.personalRank,
          meta: fetched.meta,
        });
      } else if (tab === "nigeria") {
        fetched = await getNigeriaLeaderboard(nextPage, PAGE_SIZE, selectedComp || undefined);
        setNigeria({
          board: [...nigeria.board, ...fetched.board],
          personalRank: nigeria.personalRank,
          meta: fetched.meta,
        });
      } else {
        fetched = await getPoolsLeaderboard(nextPage, PAGE_SIZE);
        setPools({
          board: [...pools.board, ...fetched.board],
          personalRank: pools.personalRank,
          meta: fetched.meta,
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't load more");
    } finally {
      setMoreLoading(false);
    }
  };

  const showLess = async () => {
    setMoreLoading(true);
    try {
      if (tab === "global") {
        const data = await getGlobalLeaderboard(1, PAGE_SIZE, selectedComp || undefined);
        setGlobal(data);
      } else if (tab === "nigeria") {
        const data = await getNigeriaLeaderboard(1, PAGE_SIZE, selectedComp || undefined);
        setNigeria(data);
      } else {
        const data = await getPoolsLeaderboard(1, PAGE_SIZE);
        setPools(data);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setMoreLoading(false);
    }
  };

  const pagination = (
    <Pagination
      shown={activeData.board.length}
      total={activeData.meta.total}
      busy={moreLoading}
      onMore={loadMore}
      onLess={showLess}
    />
  );

  return (
    <AppShell
      title="Leaderboards"
      description="See who's on top — global, Nigeria, and the hottest pools."
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="global">
              Global{global.meta.total > 0 ? ` (${global.meta.total})` : ""}
            </TabsTrigger>
            <TabsTrigger value="nigeria">
              Nigeria{nigeria.meta.total > 0 ? ` (${nigeria.meta.total})` : ""}
            </TabsTrigger>
            <TabsTrigger value="pools">
              Pools{pools.meta.total > 0 ? ` (${pools.meta.total})` : ""}
            </TabsTrigger>
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
          <UserBoard data={global} loading={loading} currentUserId={myUserId} pagination={pagination} />
        </TabsContent>
        <TabsContent value="nigeria" className="mt-0">
          <UserBoard data={nigeria} loading={loading} currentUserId={myUserId} pagination={pagination} />
        </TabsContent>
        <TabsContent value="pools" className="mt-0">
          <PoolsBoard data={pools} loading={loading} pagination={pagination} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
