"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../components/ui/card";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Skeleton } from "../../../components/ui/skeleton";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  getCompLeaderboard,
  getUserCompetitions,
  type CompLeaderboardEntry,
  type UserCompetition,
} from "../../lib/api/endpoints";
import { cn } from "../../lib/utils";

export default function LeaderboardPage() {
  const [board, setBoard] = useState<CompLeaderboardEntry[]>([]);
  const [personalRank, setPersonalRank] = useState<CompLeaderboardEntry | null>(null);
  const [competitions, setCompetitions] = useState<UserCompetition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const comps = await getUserCompetitions().catch(() => []);
        if (!active) return;
        setCompetitions(comps);
        if (comps.length > 0) {
          const defaultComp = comps.find((c) => c.name === "Premier League" || c.code === "PL") ?? comps.find((c) => c.default) ?? comps[0];
          setSelectedCompetition(defaultComp._id);
        }
      } catch {
        // continue
      }
    }
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!selectedCompetition) return;
      setLoading(true);
      try {
        const data = await getCompLeaderboard(selectedCompetition);
        if (!active) return;
        setBoard([...(data.board ?? [])].sort((a, b) => a.rank - b.rank));
        setPersonalRank(data.personalRank?.[0] ?? null);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load the leaderboard");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [selectedCompetition]);

  const [first, second, third, ...rest] = board;
  const podium = [second, first, third];

  return (
    <AppShell title="Leaderboard" description="Standings ranked by prediction accuracy.">
      {competitions.length > 0 && (
        <div className="mb-6">
          <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All competitions" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {personalRank && (
        <Card className="mb-6 gap-0 border-primary/30 bg-primary/5 p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">Your Rank</p>
              <p className="mt-2 font-display text-3xl font-bold text-primary">#{personalRank.rank}</p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="num font-display text-xl font-bold text-green-600 dark:text-green-400">{personalRank.exact}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Exact</p>
              </div>
              <div>
                <p className="num font-display text-xl font-bold text-blue-600 dark:text-blue-400">{personalRank.close}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Close</p>
              </div>
              <div>
                <p className="num font-display text-xl font-bold text-gold">{personalRank.slam}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Outcome</p>
              </div>
              <div>
                <p className="num font-display text-xl font-bold">{personalRank.total}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Total</p>
              </div>
            </div>
          </div>
        </Card>
      )}

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
      ) : board.length === 0 ? (
        <Card className="p-8 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm font-semibold">No rankings yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Rankings appear once matches are scored.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {podium.map((entry, index) => {
              if (!entry) return null;
              const place = index === 1 ? 1 : index === 0 ? 2 : 3;
              const name = entry.username || `${entry.firstName} ${entry.lastName}`.trim();
              return (
                <Card
                  key={entry.userId}
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
                  <Avatar className="mx-auto mt-4 h-14 w-14">
                    <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                      {`${entry.firstName?.[0] ?? ""}${entry.lastName?.[0] ?? ""}`.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mt-4 text-sm font-semibold">
                    {name}
                    {entry.userId === personalRank?.userId && (
                      <span className="ml-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">You</span>
                    )}
                  </p>
                  <p className="num mt-4 font-display text-2xl font-bold">{entry.total}</p>
                  <p className="mt-1 text-xs text-muted-foreground">points</p>
                  <div className="mt-3 flex gap-3 text-[10px] text-muted-foreground">
                    <span>{entry.exact} exact</span>
                    <span>{entry.close} close</span>
                    <span>{entry.slam} outcome</span>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="mt-8 gap-0 overflow-hidden p-0 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_3rem_3rem_3rem_4.5rem] gap-2 border-b border-border px-5 py-3 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              <span>#</span>
              <span>Player</span>
              <span className="text-center">Exc</span>
              <span className="text-center">Cls</span>
              <span className="text-center">Slm</span>
              <span className="text-right">Total</span>
            </div>
            {rest.map((entry, index) => {
              const name = entry.username || `${entry.firstName} ${entry.lastName}`.trim();
              return (
                <div
                  key={entry.userId}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)_3rem_3rem_3rem_4.5rem] items-center gap-2 border-b border-border px-5 py-3.5 text-sm last:border-0"
                >
                  <span className="num font-semibold text-muted-foreground">{index + 4}</span>
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-muted text-[10px] font-semibold">
                        {`${entry.firstName?.[0] ?? ""}${entry.lastName?.[0] ?? ""}`.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex min-w-0 items-center gap-2 truncate font-medium">
                      {name}
                      {entry.userId === personalRank?.userId && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">You</span>
                      )}
                    </span>
                  </div>
                  <span className="num text-center text-xs font-semibold text-green-600 dark:text-green-400">{entry.exact}</span>
                  <span className="num text-center text-xs font-semibold text-blue-600 dark:text-blue-400">{entry.close}</span>
                  <span className="num text-center text-xs font-semibold text-gold">{entry.slam}</span>
                  <span className="num text-right font-bold">{entry.total}</span>
                </div>
              );
            })}
          </Card>
        </>
      )}
    </AppShell>
  );
}
