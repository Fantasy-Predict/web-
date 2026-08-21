"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { cn } from "../../../lib/utils";
import { createPool, getUserCompetitions, type UserCompetition } from "../../../lib/api/endpoints";

const schema = z.object({
  name: z.string().trim().min(3, "Pool name must be at least 3 characters").max(60),
  competition: z.string().min(1, "Select a competition"),
  poolType: z.enum(["free", "monetized"]),
  entryFee: z.coerce.number().optional(),
  maxPlayers: z.coerce.number().min(2, "At least 2 players").max(1000),
  privacy: z.string().min(1),
  distribution: z.string().min(1),
  startDate: z.string().min(1, "Choose a season start date"),
  poolFor: z.string().min(1, "Select who the pool is for"),
  prizeType: z.string().min(1, "Select prize type"),
  introduction: z.string().max(1000, "Introduction must be under 1000 characters").optional(),
}).refine((data) => {
  if (data.poolType === "monetized") {
    return data.entryFee !== undefined && data.entryFee > 0;
  }
  return true;
}, {
  message: "Entry fee is required for monetized pools",
  path: ["entryFee"],
});

const POOL_FOR_OPTIONS = [
  { value: "office", label: "Office pool" },
  { value: "friends-family", label: "Friends / family" },
  { value: "open", label: "Open pool - anyone is welcome!" },
  { value: "media-blog", label: "Media / blog" },
  { value: "business", label: "Business / competition" },
  { value: "other", label: "Other" },
];

const PRIZE_OPTIONS = [
  { value: "fun", label: "It's just for fun" },
  { value: "prizes", label: "There are prizes" },
];

export default function CreatePoolPage() {
  const router = useRouter();
  const [competitions, setCompetitions] = useState<UserCompetition[]>([]);
  const [values, setValues] = useState({
    name: "",
    competition: "Premier League",
    poolType: "free" as "free" | "monetized",
    entryFee: "",
    maxPlayers: "20",
    privacy: "private",
    distribution: "top3",
    startDate: "",
    poolFor: "",
    prizeType: "fun",
    introduction: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [invite, setInvite] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserCompetitions()
      .then((list) => {
        if (list.length > 0) {
          setCompetitions(list);
          setValues((v) => ({ ...v, competition: list[0]._id }));
        }
      })
      .catch(() => {});
  }, []);

  function set(key: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function setPoolType(type: "free" | "monetized") {
    setValues((v) => ({ 
      ...v, 
      poolType: type,
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
        if (!next[path]) {
          next[path] = issue.message;
        }
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    void submitPool(parsed.data);
  }

  async function submitPool(data: z.infer<typeof schema>) {
    try {
      const isMonetized = data.poolType === "monetized";
      const created = await createPool({
        name: data.name,
        description: data.introduction || "A fantasy football pool",
        privacy: data.privacy,
        competition: data.competition,
        maxMembers: data.maxPlayers,
        config: {
          amount: isMonetized ? data.entryFee ?? 0 : 0,
          paid: isMonetized,
        },
      });
      toast.success("Pool created");
      router.push("/dashboard/pools");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create your pool");
    } finally {
      setLoading(false);
    }
  }

  const isMonetized = values.poolType === "monetized";

  return (
    <AppShell title="Create a pool" description="You can invite players as soon as the pool is created.">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Form Card */}
        <Card className="gap-0 p-4 sm:p-6 shadow-[var(--shadow-card)]">
          <form className="grid gap-4 sm:gap-5" onSubmit={submit} noValidate>
            {/* Pool Name */}
            <Field label="Pool name" error={errors.name}>
              <Input 
                value={values.name} 
                onChange={(e) => set("name", e.target.value)} 
                placeholder="e.g. Office Rivals"
                className="w-full"
              />
            </Field>

            {/* Pool Type – Free vs Monetized */}
            <Field label="Pool type" error={errors.poolType}>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setPoolType("free")}
                    className={cn(
                      "w-full sm:flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-all",
                      values.poolType === "free"
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_0_20px_rgba(29,78,216,0.2)]"
                        : "border-border bg-background hover:bg-accent hover:border-primary/30"
                    )}
                  >
                    Free Pool
                  </button>
                  <button
                    type="button"
                    onClick={() => setPoolType("monetized")}
                    className={cn(
                      "w-full sm:flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-all",
                      values.poolType === "monetized"
                        ? "border-gold bg-gold text-navy shadow-[0_0_20px_rgba(244,180,0,0.2)]"
                        : "border-border bg-background hover:bg-accent hover:border-gold/30"
                    )}
                  >
                    Monetized Pool
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {values.poolType === "free" 
                    ? "Free pools have no entry fees. Perfect for playing with friends." 
                    : "Monetized pools have entry fees. The platform takes 10% and the remaining 90% goes to winners."}
                </p>
              </div>
            </Field>

            {/* WHO IS THE POOL FOR? */}
            <Field label="Who is the pool for?" error={errors.poolFor}>
              <Select value={values.poolFor} onValueChange={(v) => set("poolFor", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select who this pool is for" />
                </SelectTrigger>
                <SelectContent>
                  {POOL_FOR_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* ANYTHING TO WIN? */}
            <Field label="Anything to win?" error={errors.prizeType}>
              <div className="flex flex-col sm:flex-row gap-3">
                {PRIZE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => set("prizeType", option.value)}
                    className={cn(
                      "w-full sm:flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
                      values.prizeType === option.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-accent"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* INTRODUCTION */}
            <Field label="Introduction" error={errors.introduction}>
              <Textarea
                value={values.introduction}
                onChange={(e) => set("introduction", e.target.value)}
                placeholder="Tell members about your pool..."
                className="h-24 resize-none w-full"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {values.introduction.length}/1000 characters
              </p>
            </Field>

            {/* Sport & Competition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Field label="Sport" error={undefined}>
                <Input value="Football" disabled className="w-full" />
              </Field>
              <Field label="Competition" error={errors.competition}>
                <Select value={values.competition} onValueChange={(v) => set("competition", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {competitions.length > 0 ? (
                      competitions.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.name}
                          </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_default">Premier League</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Entry Fee & Max Players */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {isMonetized ? (
                <Field label="Entry fee per player (NGN)" error={errors.entryFee}>
                  <Input
                    inputMode="numeric"
                    value={values.entryFee}
                    onChange={(e) => set("entryFee", e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 2000"
                    className="w-full"
                  />
                </Field>
              ) : (
                <Field label="Entry fee" error={undefined}>
                  <Input value="Free" disabled className="w-full text-green-600 font-semibold" />
                </Field>
              )}
              <Field label="Maximum players" error={errors.maxPlayers}>
                <Input
                  inputMode="numeric"
                  value={values.maxPlayers}
                  onChange={(e) => set("maxPlayers", e.target.value.replace(/\D/g, ""))}
                  className="w-full"
                />
              </Field>
            </div>

            {/* Platform Fee Notice */}
            {isMonetized && (
              <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 sm:p-4 text-sm">
                <p className="font-semibold text-gold">Platform Fee: 10%</p>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  The platform takes 10% of the total entry fees. The remaining 90% goes to pool 
                  winners based on your prize distribution settings.
                </p>
                {values.entryFee && values.maxPlayers && (
                  <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                    <p>Entry fee: ₦{parseInt(values.entryFee || "0").toLocaleString()} × {values.maxPlayers} players = 
                    ₦{(parseInt(values.entryFee || "0") * parseInt(values.maxPlayers || "0")).toLocaleString()} total</p>
                    <p><span className="text-gold">Platform fee (10%):</span> ₦{Math.round(parseInt(values.entryFee || "0") * parseInt(values.maxPlayers || "0") * 0.1).toLocaleString()}</p>
                    <p><span className="text-green-600 dark:text-green-400">Prize pool (90%):</span> ₦{Math.round(parseInt(values.entryFee || "0") * parseInt(values.maxPlayers || "0") * 0.9).toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            {/* Privacy & Prize Distribution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                  <Input value="No prizes (Free pool)" disabled className="w-full text-muted-foreground" />
                </Field>
              )}
            </div>

            {/* Season start date */}
            <Field label="Season start date" error={errors.startDate}>
              <Input type="date" value={values.startDate} onChange={(e) => set("startDate", e.target.value)} className="w-full" />
            </Field>

            <Button type="submit" size="lg" disabled={loading || !values.name || !values.competition || !values.poolFor || !values.startDate} className="w-full sm:w-auto">
              {loading ? "Creating pool…" : "Create pool"}
            </Button>
          </form>
        </Card>

        {/* Invitation Link Card */}
        <Card className="gap-0 self-start p-4 sm:p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-base font-semibold">Invitation link</h2>
          {invite ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Share this link with players. It expires when the pool fills up.
              </p>
              <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-xs break-all">{invite}</p>
              <Button
                className="mt-4 w-full sm:w-auto"
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
              Your invitation link is generated as soon as the pool is created.
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
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
