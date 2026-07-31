"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "../../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { EmptyState, LeagueCard } from "../../../components/app/card";
import { leagues } from "../../lib/mock-data";

export default function LeaguesPage() {
  const [query, setQuery] = useState("");
  const joined = leagues.filter((l) => l.rank);
  const discover = leagues
    .filter((l) => !l.rank)
    .filter((l) => l.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <AppShell
      title="Leagues"
      description="Compete season-long in public rooms or private leagues with friends."
      actions={
        <Button asChild>
          <Link href="/dashboard/leagues/create">Create league</Link>
        </Button>
      }
    >
      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">My leagues</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>
        <TabsContent value="mine" className="mt-6">
          {joined.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {joined.map((league) => (
                <LeagueCard key={league.id} league={league} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="You haven't joined a league yet"
              description="Join a public league or create a private room to start earning points this matchweek."
              action={
                <Button asChild>
                  <Link href="/dashboard/leagues/create">Create a league</Link>
                </Button>
              }
            />
          )}
        </TabsContent>
        <TabsContent value="discover" className="mt-6">
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leagues"
              className="h-10 w-full rounded-xl border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {discover.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {discover.map((league) => (
                <LeagueCard key={league.id} league={league} />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="No leagues match that search"
                description="Try a different name, or create your own league and invite players directly."
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}