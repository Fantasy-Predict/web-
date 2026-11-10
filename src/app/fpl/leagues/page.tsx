"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import { getMyFplLeagues, type FplLeague } from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

export default function FplLeaguesPage() {
  const [leagues, setLeagues] = useState<FplLeague[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyFplLeagues().then(data => {
      if (active) { setLeagues(data); setLoading(false); }
    }).catch(err => {
      if (!active) return;
      toast.error(err instanceof Error ? err.message : "Failed to load leagues");
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <FplShell title="Leagues">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      </FplShell>
    );
  }

  return (
    <FplShell
      title="Leagues"
      description={leagues.length > 0 ? `${leagues.length} league${leagues.length !== 1 ? "s" : ""}` : undefined}
      actions={
        <div className="flex gap-2">
          <Link href="/fpl/leagues/join">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Users className="h-4 w-4" />
              Join
            </Button>
          </Link>
          <Link href="/fpl/leagues/create">
            <Button size="sm" className="gap-1.5 bg-primary text-white hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </Link>
        </div>
      }
    >
      {leagues.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-semibold">No leagues yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create a league or join one with an invite code.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/fpl/leagues/join">
                <Button variant="outline" size="sm">Join a league</Button>
              </Link>
              <Link href="/fpl/leagues/create">
                <Button size="sm" className="bg-primary text-white hover:bg-primary/90">Create league</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leagues.map(league => (
            <Link key={league._id} href={`/fpl/leagues/${league._id}`}>
              <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:bg-accent">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                  league.type === "h2h" ? "bg-primary/15 text-primary" : "bg-gold/20 text-gold",
                )}>
                  {league.type === "h2h" ? "H2H" : "CL"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{league.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {league.type === "classic" ? "Classic" : "Head-to-Head"} · {league.memberCount} member{league.memberCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                    league.status === "active" ? "bg-gold/15 text-gold" : "bg-muted text-muted-foreground",
                  )}>
                    {league.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </FplShell>
  );
}
