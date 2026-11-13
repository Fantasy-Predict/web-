"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trophy, Wallet, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createFplLeague, type FplPrizeSlot } from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/app/lib/utils";

export default function FplCreateLeaguePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [subType, setSubType] = useState<"season" | "weekly">("season");
  const [entryFee, setEntryFee] = useState("");
  const [prizeSlots, setPrizeSlots] = useState<FplPrizeSlot[]>([
    { position: 1, percentage: 60 },
    { position: 2, percentage: 30 },
  ]);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ id: string; code: string; name: string } | null>(null);

  const totalPct = prizeSlots.reduce((s, p) => s + (Number(p.percentage) || 0), 0);

  function addSlot() {
    const nextPos = prizeSlots.length + 1;
    setPrizeSlots(prev => [...prev, { position: nextPos, percentage: 0 }]);
  }

  function removeSlot(idx: number) {
    setPrizeSlots(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, position: i + 1 })));
  }

  function updateSlotPct(idx: number, val: string) {
    setPrizeSlots(prev => prev.map((s, i) => i === idx ? { ...s, percentage: Number(val) || 0 } : s));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Enter a league name"); return; }
    const fee = isFree ? 0 : parseInt(entryFee, 10);
    if (!isFree && (!fee || fee < 100)) { toast.error("Entry fee must be at least ₦100"); return; }
    if (!isFree && subType === "season" && prizeSlots.length > 0 && totalPct > 90) {
      toast.error("Prize distribution total must not exceed 90%"); return;
    }
    setLoading(true);
    try {
      const res = await createFplLeague({
        name: name.trim(),
        type: "classic",
        subType,
        isFree,
        entryFee: fee,
        isPrivate: true,
        prizeDistribution: (!isFree && subType === "season") ? prizeSlots.filter(s => s.percentage > 0) : [],
      });
      setCreated({ id: res.leagueId, code: res.code, name: name.trim() });
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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/20">
              <Trophy className="h-8 w-8 text-gold" />
            </div>
            <div>
              <p className="text-lg font-bold">{created.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">Your league is ready. Share the invite code with friends.</p>
            </div>
            <div className="flex w-full items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3">
              <p className="flex-1 text-center font-mono text-2xl font-bold tracking-widest text-gold">
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
              className="w-full bg-primary text-white hover:bg-primary/90"
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
            {/* League name */}
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

            {/* League type (Season vs Weekly) */}
            <div className="grid gap-2">
              <Label>League type</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["season", "weekly"] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSubType(t)}
                    className={cn(
                      "flex flex-col rounded-xl border p-4 text-left transition-all",
                      subType === t ? "border-gold bg-gold/10" : "border-border bg-card hover:bg-accent",
                    )}
                  >
                    <span className={cn("text-sm font-semibold capitalize", subType === t && "text-gold")}>{t}</span>
                    <span className="mt-1 text-[11px] text-muted-foreground leading-snug">
                      {t === "season"
                        ? "Winner paid out at end of season based on final standings"
                        : "Highest scorer each gameweek wins that week's share"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Entry fee */}
            <div className="grid gap-2">
              <Label>Entry fee</Label>
              <div className="grid grid-cols-2 gap-3">
                {([true, false] as const).map(free => (
                  <button
                    key={String(free)}
                    type="button"
                    onClick={() => setIsFree(free)}
                    className={cn(
                      "flex flex-col rounded-xl border p-4 text-left transition-all",
                      isFree === free ? "border-gold bg-gold/10" : "border-border bg-card hover:bg-accent",
                    )}
                  >
                    <span className={cn("text-sm font-semibold", isFree === free && "text-gold")}>
                      {free ? "Free" : "Paid"}
                    </span>
                    <span className="mt-1 text-[11px] text-muted-foreground leading-snug">
                      {free ? "No entry fee — compete for bragging rights" : "Collect entry fees, 90% goes to prize pool"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {!isFree && (
              <div className="grid gap-2">
                <Label htmlFor="fee">Entry fee amount (₦)</Label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fee"
                    type="number"
                    min={100}
                    step={100}
                    placeholder="e.g. 500"
                    value={entryFee}
                    onChange={e => setEntryFee(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {subType === "weekly"
                    ? "90% of total entry fees split equally across all remaining gameweeks. Highest scorer each GW wins that week's share."
                    : "90% of total entry fees paid out at season end · 10% platform fee. Deducted from wallet on create."}
                </p>
              </div>
            )}

            {/* Prize distribution — season paid leagues only */}
            {!isFree && subType === "season" && (
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Prize distribution (optional)</Label>
                  <span className={cn("text-xs font-medium", totalPct > 90 ? "text-destructive" : "text-muted-foreground")}>
                    {totalPct}% / 90% max
                  </span>
                </div>
                <p className="text-xs text-muted-foreground -mt-1">
                  Set the percentage each finishing position receives. Leave blank for winner-takes-all.
                </p>
                {prizeSlots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-sm text-muted-foreground">
                      {idx === 0 ? "1st" : idx === 1 ? "2nd" : idx === 2 ? "3rd" : `${idx + 1}th`}
                    </span>
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        min={0}
                        max={90}
                        step={1}
                        value={slot.percentage || ""}
                        onChange={e => updateSlotPct(idx, e.target.value)}
                        placeholder="0"
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                    {prizeSlots.length > 1 && (
                      <button type="button" onClick={() => removeSlot(idx)} className="rounded p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {prizeSlots.length < 5 && (
                  <button type="button" onClick={addSlot} className="flex items-center gap-1 text-xs text-gold hover:underline">
                    <Plus className="h-3 w-3" /> Add position
                  </button>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {loading ? "Creating…" : "Create League"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </FplShell>
  );
}
