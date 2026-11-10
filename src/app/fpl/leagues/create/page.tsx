"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trophy } from "lucide-react";
import { toast } from "sonner";
import { createFplLeague } from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/app/lib/utils";

export default function FplCreateLeaguePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<"classic" | "h2h">("classic");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ id: string; code: string; name: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Enter a league name"); return; }
    setLoading(true);
    try {
      const res = await createFplLeague({ name: name.trim(), type });
      setCreated({ id: res._id, code: res.code, name: name.trim() });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create league");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    return (
      <FplShell title="League Created">
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20">
              <Trophy className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{created.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">Your league is ready. Share the invite code with friends.</p>
            </div>
            <div className="flex w-full items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
              <p className="flex-1 text-center font-mono text-2xl font-bold tracking-widest text-emerald-700 dark:text-emerald-400">
                {created.code}
              </p>
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(created.code); toast.success("Invite code copied"); }}
                className="rounded-lg border border-border p-2 hover:bg-accent"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <Button
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => router.push(`/fpl/leagues/${created.id}`)}
            >
              View League
            </Button>
          </CardContent>
        </Card>
      </FplShell>
    );
  }

  return (
    <FplShell title="Create League">
      <Card className="mx-auto max-w-md">
        <CardContent className="py-8">
          <form className="grid gap-6" onSubmit={submit}>
            <div className="grid gap-2">
              <Label htmlFor="name">League name</Label>
              <Input
                id="name"
                placeholder="e.g. The Invincibles"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={40}
              />
            </div>

            <div className="grid gap-2">
              <Label>League type</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["classic", "h2h"] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex flex-col rounded-xl border p-4 text-left transition-all",
                      type === t ? "border-emerald-500 bg-emerald-500/10" : "border-border bg-card hover:bg-accent",
                    )}
                  >
                    <span className={cn("text-sm font-semibold", type === t && "text-emerald-700 dark:text-emerald-400")}>
                      {t === "classic" ? "Classic" : "Head-to-Head"}
                    </span>
                    <span className="mt-1 text-[11px] text-muted-foreground leading-snug">
                      {t === "classic"
                        ? "Rank by total points accumulated over the season"
                        : "Face one member each week — win, draw or lose"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {loading ? "Creating…" : "Create League"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </FplShell>
  );
}
