"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Users, Wallet, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { previewFplLeague, joinFplLeague, type FplLeaguePreview } from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "code" | "confirm";

export default function FplJoinLeaguePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<FplLeaguePreview | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookupLeague(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { toast.error("Enter an invite code"); return; }
    setLoading(true);
    try {
      const data = await previewFplLeague(trimmed);
      setPreview(data);
      setStep("confirm");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid or expired invite code");
    } finally {
      setLoading(false);
    }
  }

  async function confirmJoin() {
    if (!preview) return;
    setLoading(true);
    try {
      await joinFplLeague({ code: code.trim().toUpperCase() });
      toast.success("Joined league!");
      router.push("/fpl/leagues");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to join league");
    } finally {
      setLoading(false);
    }
  }

  if (step === "confirm" && preview) {
    return (
      <FplShell title="Join League">
        <Card className="mx-auto max-w-md">
          <CardContent className="py-8">
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/20">
                <Users className="h-7 w-7 text-gold" />
              </div>
              <div>
                <p className="text-lg font-bold">{preview.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Classic league · {preview.memberCount} member{preview.memberCount !== 1 ? "s" : ""}
                  {preview.maxMembers ? ` / ${preview.maxMembers} max` : ""}
                </p>
              </div>
            </div>

            {/* League subtype badge */}
            {preview.subType && (
              <div className="mb-3 flex justify-center">
                <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold capitalize">
                  {preview.subType === "weekly" ? "Weekly" : "Season"} League
                </span>
              </div>
            )}

            {!preview.isFree ? (
              <div className="mb-4 flex gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <div className="text-sm">
                  <p className="font-semibold text-warning">Paid League — Entry fee required</p>
                  <p className="mt-1 text-muted-foreground">
                    Joining this league will deduct{" "}
                    <span className="font-bold text-foreground">₦{preview.entryFee.toLocaleString()}</span>{" "}
                    from your wallet.{" "}
                    {preview.subType === "weekly"
                      ? "90% of total entry fees is split across remaining gameweeks — highest scorer each GW wins that week's share."
                      : "90% of total entry fees is paid out at season end based on final standings."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-4 flex gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
                <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <p className="text-sm text-muted-foreground">
                  This is a free league — no entry fee required.
                </p>
              </div>
            )}

            {/* Prize distribution (season paid leagues) */}
            {!preview.isFree && preview.subType === "season" && preview.prizeDistribution?.length > 0 && (
              <div className="mb-4 rounded-xl border border-border bg-muted/30 p-4">
                <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prize Distribution</p>
                <div className="grid gap-1">
                  {preview.prizeDistribution.map(slot => (
                    <div key={slot.position} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {slot.position === 1 ? "1st place" : slot.position === 2 ? "2nd place" : slot.position === 3 ? "3rd place" : `${slot.position}th place`}
                      </span>
                      <span className="font-semibold text-gold">{slot.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-3">
              <Button
                onClick={confirmJoin}
                disabled={loading}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {loading ? "Joining…" : preview.isFree ? "Join League" : `Join · Pay ₦${preview.entryFee.toLocaleString()}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("code")}
                disabled={loading}
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </FplShell>
    );
  }

  return (
    <FplShell title="Join League">
      <Card className="mx-auto max-w-md">
        <CardContent className="py-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/20">
              <Users className="h-7 w-7 text-gold" />
            </div>
            <div>
              <p className="font-semibold">Enter an invite code</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask the league admin for their invite code, then paste it below.
              </p>
            </div>
          </div>

          <form className="grid gap-5" onSubmit={lookupLeague}>
            <div className="grid gap-2">
              <Label htmlFor="code">Invite code</Label>
              <Input
                id="code"
                placeholder="e.g. ABC123"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="font-mono text-center tracking-widest uppercase text-lg"
                maxLength={12}
                autoComplete="off"
                autoCapitalize="characters"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !code.trim()}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {loading ? "Looking up…" : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </FplShell>
  );
}
