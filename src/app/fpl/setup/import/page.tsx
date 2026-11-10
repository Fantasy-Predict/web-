"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { importFplTeam } from "../../../lib/api/endpoints";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FplImportPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [fplId, setFplId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ teamName?: string; fplId?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!teamName.trim()) errs.teamName = "Team name is required";
    if (!fplId.trim()) errs.fplId = "FPL Team ID is required";
    else if (isNaN(Number(fplId)) || Number(fplId) <= 0) errs.fplId = "Must be a valid numeric ID";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await importFplTeam({ teamName: teamName.trim(), fplImportId: Number(fplId) });
      toast.success("Squad imported! Welcome to FPL.");
      router.push("/fpl");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to import team";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
              FPL
            </span>
          </div>
          <Link href="/fpl/setup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold">Import from FPL</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Find your Team ID on the official FPL site under{" "}
            <strong>Points → View gameweek history</strong> — it&apos;s the number in the URL.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team name</Label>
              <Input
                id="teamName"
                placeholder="e.g. The Mighty Reds"
                value={teamName}
                onChange={(e) => { setTeamName(e.target.value); setErrors((v) => ({ ...v, teamName: undefined })); }}
                className={errors.teamName ? "border-destructive" : ""}
              />
              {errors.teamName && <p className="text-xs text-destructive">{errors.teamName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fplId">FPL Team ID</Label>
              <Input
                id="fplId"
                type="number"
                placeholder="e.g. 12345678"
                value={fplId}
                onChange={(e) => { setFplId(e.target.value); setErrors((v) => ({ ...v, fplId: undefined })); }}
                className={errors.fplId ? "border-destructive" : ""}
              />
              {errors.fplId && <p className="text-xs text-destructive">{errors.fplId}</p>}
              <p className="text-xs text-muted-foreground">
                fantasy.premierleague.com/entry/<strong>[YOUR ID]</strong>/history
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Importing..." : "Import my squad"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
