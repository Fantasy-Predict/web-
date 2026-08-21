"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { MatchCard } from "../../../components/app/card";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { getMatches, getUserCompetitions, type UserCompetition } from "../../lib/api/endpoints";
import type { Match } from "../../lib/mock-data";

const STATUS_FILTERS = ["All", "Upcoming", "Finished"] as const;
const PAGE_SIZE = 10;

function formatKickoff(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function FixturesPage() {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [competitions, setCompetitions] = useState<UserCompetition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const compNameMap = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const comps = await getUserCompetitions().catch(() => []);
        if (!active) return;
        setCompetitions(comps);
        const map = new Map<string, string>();
        comps.forEach((c) => map.set(c._id, c.name));
        compNameMap.current = map;
        if (comps.length > 0) {
          const defaultComp = comps.find((c) => c.default) ?? comps[0];
          setSelectedCompetition(defaultComp._id);
        }
      } catch {
        // competitions failed to load
      }
    }
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!selectedCompetition) return;
      setLoadingMatches(true);
      setVisibleCount(PAGE_SIZE);
      try {
        const data = await getMatches(selectedCompetition);
        if (!active) return;
        const enriched = data.map((m) => ({
          ...m,
          competitionName: compNameMap.current.get(m.competition) ?? m.competition,
          kickoff: formatKickoff(m.kickoff),
        }));
        setMatches(enriched);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load fixtures");
      } finally {
        if (active) setLoadingMatches(false);
      }
    }
    load();
    return () => { active = false; };
  }, [selectedCompetition]);

  const list = matches.filter((match) =>
    statusFilter === "All" ? true : match.status === statusFilter.toLowerCase(),
  );

  const visibleList = list.slice(0, visibleCount);
  const hasMore = visibleCount < list.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, list.length));
  }, [list.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <AppShell
      title="Fixtures"
      description="Kickoff times are shown in your local timezone."
      actions={
        <Button asChild>
          <Link href="/dashboard/predict">Predict matchweek</Link>
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        {competitions.length > 0 && (
          <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
            <SelectTrigger className="w-[180px]">
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
        )}
        <div className="inline-flex rounded-xl border border-border bg-muted/60 p-0.5">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option}
              onClick={() => setStatusFilter(option)}
              className={
                statusFilter === option
                  ? "rounded-[10px] bg-card px-4 py-1.5 text-xs font-semibold shadow-sm"
                  : "rounded-[10px] px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              }
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {loadingMatches
          ? Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="gap-0 p-5 shadow-[var(--shadow-card)]">
                <Skeleton className="h-3 w-24" />
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </Card>
            ))
          : visibleList.length === 0
            ? (
              <Card className="col-span-full gap-2 p-8 text-center shadow-[var(--shadow-card)]">
                <p className="text-sm font-medium">No fixtures found</p>
                <p className="text-xs text-muted-foreground">
                  {matches.length === 0
                    ? "No matches are available yet. Check back closer to kickoff."
                    : "No matches match your current filter."}
                </p>
              </Card>
            )
            : visibleList.map((match) => <MatchCard key={match.id} match={match} />)}
      </div>
      {hasMore && !loadingMatches && (
        <div ref={sentinelRef} className="mt-4 flex justify-center">
          <Skeleton className="h-8 w-32" />
        </div>
      )}
    </AppShell>
  );
}
