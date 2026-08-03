"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { cn } from "../../../lib/utils";

// Updated schema – entryFee only required for monetized leagues
const schema = z.object({
  name: z.string().trim().min(3, "League name must be at least 3 characters").max(60),
  competition: z.string().min(1, "Select a competition"),
  leagueType: z.enum(["free", "monetized"]),
  entryFee: z.coerce.number().optional(),
  maxPlayers: z.coerce.number().min(2, "At least 2 players").max(1000),
  privacy: z.string().min(1),
  distribution: z.string().min(1),
  startDate: z.string().min(1, "Choose a season start date"),
}).refine((data) => {
  // If monetized, entryFee must be provided and greater than 0
  if (data.leagueType === "monetized") {
    return data.entryFee !== undefined && data.entryFee > 0;
  }
  return true;
}, {
  message: "Entry fee is required for monetized leagues",
  path: ["entryFee"],
});

export default function CreateLeaguePage() {
  const [values, setValues] = useState({
    name: "",
    competition: "Premier League",
    leagueType: "free" as "free" | "monetized",
    entryFee: "",
    maxPlayers: "20",
    privacy: "private",
    distribution: "top3",
    startDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [invite, setInvite] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(key: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function setLeagueType(type: "free" | "monetized") {
    setValues((v) => ({ 
      ...v, 
      leagueType: type,
      // Reset entry fee when switching to free
      entryFee: type === "free" ? "" : v.entryFee,
    }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = String(issue.path[0]);
        // Don't override with duplicate messages
        if (!next[path]) {
          next[path] = issue.message;
        }
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    // Backend integration point: POST /leagues
    setTimeout(() => {
      setLoading(false);
      setInvite(`https://fantasypredict.app/join/${values.name.toLowerCase().replace(/\s+/g, "-")}`);
      toast.success("League created");
    }, 800);
  }

  const isMonetized = values.leagueType === "monetized";

  return (
    <AppShell title="Create a league" description="You can invite players as soon as the league is created.">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
          <form className="grid gap-5" onSubmit={submit} noValidate>
            {/* League Name */}
            <Field label="League name" error={errors.name}>
              <Input value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="Office Rivals" />
            </Field>

            {/* League Type – Free vs Monetized Toggle */}
            <Field label="League type" error={errors.leagueType}>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setLeagueType("free")}
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-all",
                      values.leagueType === "free"
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_0_20px_rgba(29,78,216,0.2)]"
                        : "border-border bg-background hover:bg-accent hover:border-primary/30"
                    )}
                  >
                    Free League
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeagueType("monetized")}
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-all",
                      values.leagueType === "monetized"
                        ? "border-gold bg-gold text-navy shadow-[0_0_20px_rgba(244,180,0,0.2)]"
                        : "border-border bg-background hover:bg-accent hover:border-gold/30"
                    )}
                  >
                    Monetized League
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {values.leagueType === "free" 
                    ? "Free leagues have no entry fees. Perfect for playing with friends." 
                    : "Monetized leagues have entry fees and real prize pools."}
                </p>
              </div>
            </Field>

            {/* Sport & Competition */}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Sport" error={undefined}>
                <Input value="Football" disabled />
              </Field>
              <Field label="Competition" error={errors.competition}>
                <Select value={values.competition} onValueChange={(v) => set("competition", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Premier League", "Champions League", "La Liga", "Serie A"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Entry Fee & Max Players – Entry Fee only shown for monetized */}
            <div className="grid gap-5 sm:grid-cols-2">
              {isMonetized ? (
                <Field label="Entry fee (NGN)" error={errors.entryFee}>
                  <Input
                    inputMode="numeric"
                    value={values.entryFee}
                    onChange={(e) => set("entryFee", e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 2000"
                  />
                </Field>
              ) : (
                <Field label="Entry fee" error={undefined}>
                  <Input value="Free" disabled className="text-green-600 font-semibold" />
                </Field>
              )}
              <Field label="Maximum players" error={errors.maxPlayers}>
                <Input
                  inputMode="numeric"
                  value={values.maxPlayers}
                  onChange={(e) => set("maxPlayers", e.target.value.replace(/\D/g, ""))}
                />
              </Field>
            </div>

            {/* Privacy & Prize Distribution – Distribution only shown for monetized */}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Privacy" error={errors.privacy}>
                <Select value={values.privacy} onValueChange={(v) => set("privacy", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private — invite only</SelectItem>
                    <SelectItem value="public">Public — anyone can join</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {isMonetized ? (
                <Field label="Prize distribution" error={errors.distribution}>
                  <Select value={values.distribution} onValueChange={(v) => set("distribution", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="winner">Winner takes all</SelectItem>
                      <SelectItem value="top3">Top 3 — 60 / 30 / 10</SelectItem>
                      <SelectItem value="top5">Top 5 — 40 / 25 / 15 / 12 / 8</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              ) : (
                <Field label="Prize distribution" error={undefined}>
                  <Input value="No prizes (Free league)" disabled className="text-muted-foreground" />
                </Field>
              )}
            </div>

            {/* Start Date */}
            <Field label="Season start date" error={errors.startDate}>
              <Input type="date" value={values.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </Field>

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Creating league…" : "Create league"}
            </Button>
          </form>
        </Card>

        {/* Invitation Link Card */}
        <Card className="gap-0 self-start p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-base font-semibold">Invitation link</h2>
          {invite ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Share this link with players. It expires when the league fills up.
              </p>
              <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-xs break-all">{invite}</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  navigator.clipboard?.writeText(invite);
                  toast.success("Invitation link copied");
                }}
              >
                Copy link
              </Button>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Your invitation link is generated as soon as the league is created.
            </p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}