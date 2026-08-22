"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "../../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { EmptyState, PoolCard } from "../../../components/app/card";
import { getPools, getPool, joinPool } from "../../lib/api/endpoints";
import { addJoinedPoolId, getJoinedPoolIds } from "../../lib/api/session";
import type { Pool } from "../../lib/mock-data";

export default function PoolsPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [myPools, setMyPools] = useState<Pool[]>([]);
  const [discoverPools, setDiscoverPools] = useState<Pool[]>([]);
  const [allDiscoverPools, setAllDiscoverPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [discoverQuery, setDiscoverQuery] = useState(initialQuery);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialQuery ? "discover" : "mine");
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const loadMyPools = useCallback(async () => {
    try {
      const apiPools = await getPools({ personal: true });
      const apiIds = new Set(apiPools.map((p) => p.id));

      // Also fetch any pools joined locally that the API might not return yet
      const localIds = getJoinedPoolIds().filter((id) => !apiIds.has(id));
      const localPools = await Promise.all(
        localIds.map((id) => getPool(id).catch(() => null)),
      );
      const merged = [...apiPools, ...localPools.filter(Boolean) as Pool[]];
      // Deduplicate by id
      const seen = new Set<string>();
      const unique = merged.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
      setMyPools(unique);
      return unique;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load your pools");
      return [];
    }
  }, []);

  const loadDiscoverPools = useCallback(async (myPoolIds: Set<string>) => {
    setDiscoverLoading(true);
    try {
      const all = await getPools();
      const filtered = all.filter((p) => !myPoolIds.has(p.id));
      setAllDiscoverPools(filtered);
      setDiscoverPools(filtered);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load discover pools");
    } finally {
      setDiscoverLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const mine = await loadMyPools();
        if (!active) return;
        const myIds = new Set(mine.map((p) => p.id));
        await loadDiscoverPools(myIds);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [loadMyPools, loadDiscoverPools]);

  const doSearch = useCallback(async (query: string) => {
    setDiscoverLoading(true);
    try {
      if (!query.trim()) {
        setDiscoverPools(allDiscoverPools);
      } else {
        const myIds = new Set(myPools.map((p) => p.id));
        const results = await getPools({ name: query.trim() }).catch(() => []);
        let filtered = results.filter((p) => !myIds.has(p.id));
        if (filtered.length === 0 && allDiscoverPools.length > 0) {
          const q = query.trim().toLowerCase();
          filtered = allDiscoverPools.filter(
            (p) =>
              !myIds.has(p.id) &&
              (p.name.toLowerCase().includes(q) || p.competition.toLowerCase().includes(q)),
          );
        }
        setDiscoverPools(filtered);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to search pools");
    } finally {
      setDiscoverLoading(false);
    }
  }, [allDiscoverPools, myPools]);

  function searchDiscover() {
    doSearch(discoverQuery);
  }

  function handleQueryChange(value: string) {
    setDiscoverQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => doSearch(value), 300);
  }

  async function handleJoin(pool: Pool) {
    if (pool.privacy === "private") {
      const code = window.prompt("This is a private pool. Enter the invite code:");
      if (!code) return;
      setJoiningId(pool.id);
      try {
        await joinPool({ poolId: pool.id, code });
        toast.success(`Joined ${pool.name}`);
        addJoinedPoolId(pool.id);
        setDiscoverPools((prev) => prev.filter((p) => p.id !== pool.id));
        setMyPools((prev) => [pool, ...prev]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to join this pool");
      } finally {
        setJoiningId(null);
      }
    } else {
      setJoiningId(pool.id);
      try {
        await joinPool({ poolId: pool.id });
        toast.success(`Joined ${pool.name}`);
        addJoinedPoolId(pool.id);
        setDiscoverPools((prev) => prev.filter((p) => p.id !== pool.id));
        setMyPools((prev) => [pool, ...prev]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to join this pool");
      } finally {
        setJoiningId(null);
      }
    }
  }

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery);
    }
  }, [initialQuery, doSearch]);

  return (
    <AppShell
      title="Pools"
      description="Compete season-long in public rooms or private pools with friends."
      actions={
        <Button asChild>
          <Link href="/dashboard/pools/create">Create pool</Link>
        </Button>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="mine">My pools</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>
        <TabsContent value="mine" className="mt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading your pools…</p>
          ) : myPools.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {myPools.map((pool) => (
                <PoolCard key={pool.id} pool={pool} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="You haven't joined a pool yet"
              description="Join a public pool or create a private room to start earning points this matchweek."
              action={
                <Button asChild>
                  <Link href="/dashboard/pools/create">Create a pool</Link>
                </Button>
              }
            />
          )}
        </TabsContent>
        <TabsContent value="discover" className="mt-6">
          <div className="flex gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={discoverQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search pools by name"
                className="h-10 w-full rounded-xl border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          {discoverLoading ? (
            <p className="mt-6 text-sm text-muted-foreground">Searching pools…</p>
          ) : discoverPools.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {discoverPools.map((pool) => (
                <PoolCard
                  key={pool.id}
                  pool={pool}
                  onJoin={() => handleJoin(pool)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title={discoverQuery ? "No pools match that search" : "No other pools available"}
                description={
                  discoverQuery
                    ? "Try a different name, or create your own pool and invite players directly."
                    : "All available pools are in your collection. Create a new one to get started."
                }
                action={
                  !discoverQuery ? (
                    <Button asChild>
                      <Link href="/dashboard/pools/create">Create a pool</Link>
                    </Button>
                  ) : undefined
                }
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
