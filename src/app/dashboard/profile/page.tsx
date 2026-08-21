"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Skeleton } from "../../../components/ui/skeleton";
import { StatCard } from "../../../components/app/card";
import { getLeaderboard, getMatches, getProfile, getUserCompetitions, type UserProfile } from "../../lib/api/endpoints";
import type { LeaderboardRow, Match } from "../../lib/mock-data";

const COUNTRY_NAMES: Record<string, string> = {
  NG: "Nigeria",
  GH: "Ghana",
  KE: "Kenya",
  EG: "Egypt",
  ZA: "South Africa",
  GB: "United Kingdom",
  US: "United States",
};

const TOP_LEAGUES = ["Premier League", "La Liga", "Bundesliga", "Ligue 1", "Serie A"];

function formatKickoff(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [board, setBoard] = useState<LeaderboardRow[]>([]);
  const [matchList, setMatchList] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [profileData, rows, comps] = await Promise.all([
          getProfile(),
          getLeaderboard(),
          getUserCompetitions(),
        ]);
        const nameMap = new Map((comps ?? []).map((c) => [c._id, c.name]));
        const topLeagueComps = (comps ?? []).filter((c) => TOP_LEAGUES.includes(c.name));
        const allMatchesData = await Promise.all(
          topLeagueComps.map((c) => getMatches(c._id).catch(() => [])),
        );
        if (!active) return;
        setProfile(profileData ?? null);
        setBoard([...(rows ?? [])].sort((a, b) => b.total - a.total));
        const allMatches = allMatchesData.flat()
          .filter((m) => m && m.id && m.home && m.away)
          .map((m) => ({
            ...m,
            competitionName: nameMap.get(m.competition) ?? m.competition,
            kickoff: formatKickoff(m.kickoff),
          }));
        allMatches.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
        setMatchList(allMatches);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load your profile");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const name = profile?.firstName || profile?.username || profile?.email || "Player";
  const initials = name.slice(0, 2).toUpperCase();
  const country = profile?.countryCode
    ? COUNTRY_NAMES[profile.countryCode] ?? profile.countryCode
    : undefined;
  const ownIndex = board.findIndex((row) => row.id === profile?._id || row.username === name);
  const points = ownIndex >= 0 ? board[ownIndex].total : 0;
  const rank = ownIndex >= 0 ? ownIndex + 1 : null;

  const badges: string[] = [];
  if (points > 0) badges.push("Scoring this season");
  if (rank !== null && rank <= 20) badges.push("Top 20 finisher");
  if (matchList.length > 0) badges.push("Active matchweek");

  return (
    <AppShell
      title="Profile"
      description="Your season record and account details."
      actions={
        <Button asChild variant="outline">
          <Link href="/dashboard/settings">Edit profile</Link>
        </Button>
      }
    >
      <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            {loading ? (
              <>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="mt-2 h-4 w-56" />
              </>
            ) : (
              <>
                <h2 className="truncate text-xl font-bold">{name}</h2>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {profile?.email}
                  {country ? ` · ${country}` : ""}
                  {profile?.phoneNumber ? ` · ${profile.phoneNumber}` : ""}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <Badge key={badge} variant="outline" className="border-gold/50 text-gold">
              {badge}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {loading ? (
          <>
            <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-6 w-20" />
            </Card>
            <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-6 w-20" />
            </Card>
            <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-6 w-20" />
            </Card>
          </>
        ) : (
          <>
            <StatCard label="Total points" value={points.toLocaleString()} accent="primary" />
            <StatCard label="Global rank" value={rank ? `#${rank}` : "—"} accent="gold" />
            <StatCard label="Account status" value={profile?.isActive === false ? "Pending" : "Active"} accent="success" />
          </>
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Match list</h2>
        <Card className="mt-4 gap-0 divide-y divide-border p-0 shadow-[var(--shadow-card)]">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : matchList.length > 0 ? (
            matchList.slice(0, 6).map((match, index) => (
              <div
                key={match.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {match.home} v {match.away}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {match.competitionName ?? match.competition} · {match.kickoff}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={index % 3 === 0 ? "border-success/40 text-success" : "text-muted-foreground"}
                >
                  {match.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold">No matches yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Fixtures will appear here once the matchday is announced.
              </p>
            </div>
          )}
        </Card>
      </section>
    </AppShell>
  );
}
