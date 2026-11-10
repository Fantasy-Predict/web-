"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, Search, X } from "lucide-react";
import { toast } from "sonner";
import {
  getFplTeam,
  getFplPlayers,
  makeFplTransfer,
  type FplTeam,
  type FplPlayer,
} from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

const POS_LABEL: Record<number, string> = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };
const POS_COLOR: Record<number, string> = {
  1: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  2: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  3: "bg-gold/20 text-gold",
  4: "bg-red-500/20 text-red-700 dark:text-red-400",
};

function formatPrice(tenths: number) {
  return `£${(tenths / 10).toFixed(1)}m`;
}

function StatusDot({ status }: { status: string }) {
  const color = status === "a" ? "bg-success" : status === "d" ? "bg-yellow-500" : "bg-red-500";
  return <span className={cn("inline-block h-2 w-2 rounded-full", color)} />;
}

function PlayerRow({
  player,
  onClick,
  selected,
  disabled,
  highlight,
}: {
  player: FplPlayer;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
        selected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent",
        disabled && "cursor-not-allowed opacity-40",
        highlight && "border-gold/40 bg-gold/5",
      )}
    >
      <div className={cn("flex h-8 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold", POS_COLOR[player.position])}>
        {POS_LABEL[player.position]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold">{player.name}</p>
          <StatusDot status={player.status} />
        </div>
        <p className="text-xs text-muted-foreground">{player.clubName}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold">{formatPrice(player.price)}</p>
        <p className="text-xs text-muted-foreground">{player.totalPoints} pts</p>
      </div>
    </button>
  );
}

export default function FplTransfersPage() {
  const [team, setTeam] = useState<FplTeam | null>(null);
  const [loading, setLoading] = useState(true);

  // Transfer state
  const [playerOut, setPlayerOut] = useState<FplPlayer | null>(null);
  const [playerIn, setPlayerIn] = useState<FplPlayer | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Player browser
  const [candidates, setCandidates] = useState<FplPlayer[]>([]);
  const [search, setSearch] = useState("");
  const [browsePage, setBrowsePage] = useState(1);
  const [browseTotal, setBrowseTotal] = useState(1);
  const [browseLoading, setBrowseLoading] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    let active = true;
    getFplTeam().then(data => {
      if (active) { setTeam(data); setLoading(false); }
    }).catch(err => {
      if (active) { toast.error(err instanceof Error ? err.message : "Failed to load team"); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  const loadCandidates = useCallback(async (pos: number, budget: number, page: number, q: string) => {
    setBrowseLoading(true);
    try {
      const res = await getFplPlayers({ position: pos, page, search: q || undefined, sortBy: "totalPoints" });
      // filter out players already in squad and over budget
      setCandidates(prev => page === 1 ? res.docs : [...prev, ...res.docs]);
      setBrowseTotal(res.totalPages);
    } catch {
      toast.error("Failed to load players");
    } finally {
      setBrowseLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!playerOut || !team) return;
    const budget = team.budget + playerOut.price;
    setBrowsePage(1);
    setCandidates([]);
    loadCandidates(playerOut.position, budget, 1, search);
  }, [playerOut, team, loadCandidates]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (!playerOut || !team) return;
      setBrowsePage(1);
      setCandidates([]);
      loadCandidates(playerOut.position, team.budget + playerOut.price, 1, value);
    }, 400);
  }

  async function confirmTransfer() {
    if (!playerOut || !playerIn) return;
    setConfirming(true);
    try {
      await makeFplTransfer({ playerInId: playerIn.fplId, playerOutId: playerOut.fplId });
      toast.success(`${playerIn.name} in · ${playerOut.name} out`);
      // Reload team to get updated budget/squad
      const updated = await getFplTeam();
      setTeam(updated);
      setPlayerOut(null);
      setPlayerIn(null);
      setCandidates([]);
      setSearch("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <FplShell title="Transfers">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      </FplShell>
    );
  }

  if (!team) {
    return (
      <FplShell title="Transfers">
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No FPL team found. <a href="/fpl/setup" className="text-primary underline">Set up your squad</a>
          </CardContent>
        </Card>
      </FplShell>
    );
  }

  const squadByPos: Record<number, FplPlayer[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const p of (team.playerDetails ?? [])) {
    squadByPos[p.position]?.push(p);
  }

  const budgetAfter = playerOut && playerIn ? team.budget + playerOut.price - playerIn.price : null;
  const priceDiff = playerOut && playerIn ? playerIn.price - playerOut.price : null;
  const isOverBudget = budgetAfter !== null && budgetAfter < 0;
  const transferCost = (team.freeTransfers ?? 0) > 0 ? 0 : 4;

  return (
    <FplShell title="Transfers" description={`${team.freeTransfers} free transfer${team.freeTransfers !== 1 ? "s" : ""} · Budget: ${formatPrice(team.budget)}`}>

      {/* Confirm bar */}
      {playerOut && playerIn && (
        <div className={cn(
          "mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4",
          isOverBudget ? "border-destructive bg-destructive/5" : "border-gold/30 bg-gold/5",
        )}>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <span className="text-muted-foreground line-through">{playerOut.name}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span>{playerIn.name}</span>
            {priceDiff !== null && (
              <span className={cn("text-xs font-medium", priceDiff > 0 ? "text-destructive" : "text-success")}>
                {priceDiff > 0 ? "+" : ""}{formatPrice(priceDiff)}
              </span>
            )}
            {transferCost > 0 && <span className="text-xs text-destructive">−{transferCost} pts</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setPlayerIn(null); }}>
              Change
            </Button>
            <Button size="sm" disabled={isOverBudget || confirming} onClick={confirmTransfer} className="bg-primary text-white hover:bg-primary/90">
              {confirming ? "Confirming…" : "Confirm Transfer"}
            </Button>
          </div>
          {isOverBudget && <p className="w-full text-xs text-destructive">Not enough budget for this transfer.</p>}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT — Your squad */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {playerOut ? "Selected for transfer out" : "Select player to transfer out"}
            </h2>
            {playerOut && (
              <button type="button" onClick={() => { setPlayerOut(null); setPlayerIn(null); setCandidates([]); setSearch(""); }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          {([1, 2, 3, 4] as const).map(pos => (
            <div key={pos} className="mb-4">
              <p className={cn("mb-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest", POS_COLOR[pos])}>
                {POS_LABEL[pos]}
              </p>
              <div className="space-y-2">
                {(squadByPos[pos] ?? []).map(p => (
                  <PlayerRow
                    key={p.fplId}
                    player={p}
                    onClick={() => { setPlayerOut(p); setPlayerIn(null); setSearch(""); setBrowsePage(1); }}
                    selected={playerOut?.fplId === p.fplId}
                    disabled={!!playerOut && playerOut.fplId !== p.fplId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT — Player browser */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {playerOut
              ? `Bring in a ${POS_LABEL[playerOut.position]} (budget: ${formatPrice(team.budget + playerOut.price)})`
              : "Select a player on the left to browse replacements"}
          </h2>

          {!playerOut ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-sm text-muted-foreground">
                <ChevronLeft className="h-8 w-8" />
                <p>Choose a player from your squad to see available replacements.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search players…"
                  value={search}
                  onChange={e => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="space-y-2">
                {candidates
                  .filter(c => !(team.playerDetails ?? []).some(p => p.fplId === c.fplId))
                  .filter(c => c.price <= team.budget + playerOut.price)
                  .map(c => (
                    <PlayerRow
                      key={c.fplId}
                      player={c}
                      onClick={() => setPlayerIn(prev => prev?.fplId === c.fplId ? null : c)}
                      selected={playerIn?.fplId === c.fplId}
                      highlight={playerIn?.fplId === c.fplId}
                    />
                  ))}
                {browseLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                {!browseLoading && candidates.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No players found.</p>
                )}
              </div>

              {browsePage < browseTotal && (
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  disabled={browseLoading}
                  onClick={() => {
                    const next = browsePage + 1;
                    setBrowsePage(next);
                    loadCandidates(playerOut.position, team.budget + playerOut.price, next, search);
                  }}
                >
                  Load more
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </FplShell>
  );
}
