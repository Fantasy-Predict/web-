"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Minus, Plus, Search, X } from "lucide-react";
import { createFplTeam, getFplPlayers, type FplPlayer } from "../../../lib/api/endpoints";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/app/lib/utils";

const POSITION_LABEL: Record<number, string> = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };
const QUOTA: Record<number, number> = { 1: 2, 2: 5, 3: 5, 4: 3 };
const TOTAL_BUDGET = 1000; // tenths-of-millions: 1000 = £100.0m

function countByPosition(selected: FplPlayer[], pos: number) {
  return selected.filter((p) => p.position === pos).length;
}

function clubCount(selected: FplPlayer[], clubName: string) {
  return selected.filter((p) => p.clubName === clubName).length;
}

function formatPrice(tenths: number) {
  return `£${(tenths / 10).toFixed(1)}m`;
}

function getStatusColor(status: string) {
  if (status === "injured") return "text-red-500";
  if (status === "suspended") return "text-orange-500";
  if (status === "doubt") return "text-yellow-500";
  return "text-emerald-500";
}

const POSITION_TABS = [
  { id: null, label: "All" },
  { id: 1, label: "GK" },
  { id: 2, label: "DEF" },
  { id: 3, label: "MID" },
  { id: 4, label: "FWD" },
];

export default function FplBuildPage() {
  const router = useRouter();

  // Squad state
  const [teamName, setTeamName] = useState("");
  const [selected, setSelected] = useState<FplPlayer[]>([]);
  const budgetLeft = TOTAL_BUDGET - selected.reduce((s, p) => s + p.price, 0);

  // Player browser state
  const [players, setPlayers] = useState<FplPlayer[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [positionFilter, setPositionFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

  // Squad browser tab on mobile
  const [mobileTab, setMobileTab] = useState<"browser" | "squad">("browser");

  // Submit state
  const [submitting, setSubmitting] = useState(false);

  const loadPlayers = useCallback(async (pg: number, pos: number | null, q: string, append = false) => {
    setLoadingPlayers(true);
    try {
      const res = await getFplPlayers({ page: pg, position: pos ?? undefined, search: q || undefined, sortBy: "totalPoints" });
      setPlayers((prev) => append ? [...prev, ...res.docs] : res.docs);
      setTotalPages(res.totalPages);
    } catch {
      // silent
    } finally {
      setLoadingPlayers(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    loadPlayers(1, positionFilter, search, false);
  }, [positionFilter, loadPlayers, search]);

  function handleSearchChange(val: string) {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 400);
  }

  function canAdd(player: FplPlayer): { ok: boolean; reason?: string } {
    if (selected.some((p) => p.fplId === player.fplId)) return { ok: false, reason: "Already selected" };
    if (countByPosition(selected, player.position) >= QUOTA[player.position])
      return { ok: false, reason: `${QUOTA[player.position]} ${POSITION_LABEL[player.position]} already selected` };
    if (clubCount(selected, player.clubName) >= 3) return { ok: false, reason: "Max 3 from same club" };
    if (player.price > budgetLeft) return { ok: false, reason: "Insufficient budget" };
    return { ok: true };
  }

  function addPlayer(player: FplPlayer) {
    const { ok, reason } = canAdd(player);
    if (!ok) { toast.error(reason); return; }
    setSelected((prev) => [...prev, player]);
  }

  function removePlayer(fplId: number) {
    setSelected((prev) => prev.filter((p) => p.fplId !== fplId));
  }

  async function handleSubmit() {
    if (!teamName.trim()) { toast.error("Enter a team name"); return; }
    if (selected.length !== 15) { toast.error("Select exactly 15 players"); return; }
    setSubmitting(true);
    try {
      await createFplTeam({ teamName: teamName.trim(), players: selected.map((p) => p.fplId) });
      toast.success("Squad created! Welcome to FPL.");
      router.push("/fpl");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  }

  const isComplete = selected.length === 15;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
              FPL
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn("text-sm font-semibold tabular-nums", budgetLeft < 50 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400")}>
              {formatPrice(budgetLeft)} left
            </span>
            <span className="text-sm text-muted-foreground">{selected.length}/15</span>
            <Link href="/fpl/setup" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-6">
        {/* Team name + budget bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Team name, e.g. The Mighty Reds"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {([1, 2, 3, 4] as const).map((pos) => (
              <span key={pos} className={cn(
                "rounded-md px-2 py-1 font-medium",
                countByPosition(selected, pos) >= QUOTA[pos]
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground",
              )}>
                {POSITION_LABEL[pos]} {countByPosition(selected, pos)}/{QUOTA[pos]}
              </span>
            ))}
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="mb-4 flex gap-1 rounded-xl border border-border bg-card p-1 sm:hidden">
          <button
            onClick={() => setMobileTab("browser")}
            className={cn("flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
              mobileTab === "browser" ? "bg-background shadow-sm" : "text-muted-foreground")}
          >
            Player Browser
          </button>
          <button
            onClick={() => setMobileTab("squad")}
            className={cn("flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
              mobileTab === "squad" ? "bg-background shadow-sm" : "text-muted-foreground")}
          >
            My Squad ({selected.length})
          </button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Player browser */}
          <div className={cn("flex-1 min-w-0", mobileTab === "squad" ? "hidden sm:block" : "")}>
            {/* Position tabs + search */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex gap-1 overflow-x-auto">
                {POSITION_TABS.map((tab) => (
                  <button
                    key={tab.id ?? "all"}
                    onClick={() => setPositionFilter(tab.id)}
                    className={cn(
                      "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      positionFilter === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search players..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-9 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Player list */}
            <div className="rounded-xl border border-border overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <span>Player</span>
                <span className="text-right">Price</span>
                <span className="text-right hidden sm:block">Form</span>
                <span className="text-right hidden sm:block">Pts</span>
                <span />
              </div>

              {loadingPlayers && players.length === 0 ? (
                <div className="space-y-0 divide-y divide-border">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                      <div className="h-4 w-4 rounded bg-muted" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3.5 w-32 rounded bg-muted" />
                        <div className="h-3 w-20 rounded bg-muted" />
                      </div>
                      <div className="h-4 w-10 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : players.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">No players found</p>
              ) : (
                <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
                  {players.map((player) => {
                    const isSelected = selected.some((p) => p.fplId === player.fplId);
                    const { ok } = canAdd(player);
                    return (
                      <div
                        key={player.fplId}
                        className={cn("grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-3 text-sm", isSelected && "bg-emerald-500/5")}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[10px] font-bold text-muted-foreground">
                              {POSITION_LABEL[player.position]}
                            </span>
                            <span className="truncate font-medium">{player.name}</span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">{player.clubShort}</span>
                            <span className={cn("text-[10px] font-medium", getStatusColor(player.status))}>●</span>
                          </div>
                        </div>
                        <span className="text-right tabular-nums text-xs font-semibold">{formatPrice(player.price)}</span>
                        <span className="hidden text-right text-xs text-muted-foreground sm:block">{player.form}</span>
                        <span className="hidden text-right text-xs font-semibold sm:block">{player.totalPoints}</span>
                        <button
                          onClick={() => isSelected ? removePlayer(player.fplId) : addPlayer(player)}
                          disabled={!isSelected && !ok}
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors",
                            isSelected
                              ? "border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20"
                              : ok
                                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                : "border-border text-muted-foreground opacity-40 cursor-not-allowed",
                          )}
                        >
                          {isSelected ? <Minus size={12} /> : <Plus size={12} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Load more */}
            {page < totalPages && (
              <button
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  loadPlayers(next, positionFilter, search, true);
                }}
                disabled={loadingPlayers}
                className="mt-3 w-full rounded-xl border border-border py-2 text-sm text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                {loadingPlayers ? "Loading..." : "Load more players"}
              </button>
            )}
          </div>

          {/* Selected squad panel */}
          <div className={cn("w-full lg:w-72 shrink-0", mobileTab === "browser" ? "hidden sm:block" : "")}>
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold">My Squad</h3>
                <span className="text-xs text-muted-foreground">{selected.length}/15</span>
              </div>

              {([1, 2, 3, 4] as const).map((pos) => (
                <div key={pos} className="border-b border-border last:border-0">
                  <div className="flex items-center justify-between bg-muted/30 px-4 py-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {POSITION_LABEL[pos]} ({countByPosition(selected, pos)}/{QUOTA[pos]})
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {selected.filter((p) => p.position === pos).map((player) => (
                      <div key={player.fplId} className="flex items-center gap-2 px-4 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-medium">{player.name}</p>
                          <p className="text-[10px] text-muted-foreground">{player.clubShort} · {formatPrice(player.price)}</p>
                        </div>
                        <button
                          onClick={() => removePlayer(player.fplId)}
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-destructive"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {/* Empty slots */}
                    {Array.from({ length: QUOTA[pos] - countByPosition(selected, pos) }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded border border-dashed border-border">
                          <Plus size={10} className="text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">Empty slot</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Budget summary */}
              <div className="border-t border-border px-4 py-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Squad cost</span>
                  <span className="font-medium">{formatPrice(TOTAL_BUDGET - budgetLeft)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className={cn("font-semibold", budgetLeft < 50 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400")}>
                    {formatPrice(budgetLeft)}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              className="mt-4 w-full gap-2"
              disabled={!isComplete || submitting || !teamName.trim()}
              onClick={handleSubmit}
            >
              {submitting ? "Creating..." : isComplete ? (
                <><Check size={14} /> Create Squad</>
              ) : (
                `Select ${15 - selected.length} more player${15 - selected.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
