"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { MatchCard } from "../../../components/app/card";
import { Button } from "../../../components/ui/button";
import { matches } from "../../lib/mock-data";

const FILTERS = ["All", "Upcoming", "Live", "Finished"] as const;

export default function FixturesPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const list = matches.filter((match) =>
    filter === "All" ? true : match.status === filter.toLowerCase(),
  );

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
      <div className="inline-flex rounded-xl border border-border bg-muted/60 p-0.5">
        {FILTERS.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={
              filter === option
                ? "rounded-[10px] bg-card px-4 py-1.5 text-xs font-semibold shadow-sm"
                : "rounded-[10px] px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            }
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {list.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </AppShell>
  );
}