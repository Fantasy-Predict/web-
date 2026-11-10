"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Pencil } from "lucide-react";
import { getFplTeam } from "../../lib/api/endpoints";
import { Logo } from "@/components/brand/logo";

export default function FplSetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    getFplTeam().then((team) => {
      if (!active) return;
      if (team) {
        router.replace("/fpl");
      } else {
        setChecking(false);
      }
    });
    return () => { active = false; };
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
              FPL
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to FP
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-16">
        <div className="w-full max-w-2xl text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Fantasy Premier League
          </div>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Set up your FPL team</h1>
          <p className="mt-3 text-muted-foreground">
            Pick your 15-player squad, captain your star man, and compete with friends in custom leagues.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {/* Import option */}
            <Link
              href="/fpl/setup/import"
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-emerald-500/50 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15">
                <Download className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Import from FPL</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Already play on the official Fantasy Premier League site? Import your squad using your Team ID.
                </p>
              </div>
              <span className="mt-auto text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline">
                Import my squad →
              </span>
            </Link>

            {/* Build from scratch */}
            <Link
              href="/fpl/setup/build"
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Pencil className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Build from scratch</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  New to FPL? Browse all Premier League players and build your dream 15-player squad.
                </p>
              </div>
              <span className="mt-auto text-sm font-medium text-primary group-hover:underline">
                Build my squad →
              </span>
            </Link>
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            Budget: £100.0m · 15 players (2 GK · 5 DEF · 5 MID · 3 FWD) · Max 3 from same club
          </p>
        </div>
      </main>
    </div>
  );
}
