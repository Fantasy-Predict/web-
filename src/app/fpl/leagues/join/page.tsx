"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { joinFplLeague } from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FplJoinLeaguePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { toast.error("Enter an invite code"); return; }
    setLoading(true);
    try {
      await joinFplLeague({ code: trimmed });
      toast.success("Joined league!");
      router.push("/fpl/leagues");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid or expired invite code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FplShell title="Join League">
      <Card className="mx-auto max-w-md">
        <CardContent className="py-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20">
              <Users className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold">Enter an invite code</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask the league admin for their invite code, then paste it below.
              </p>
            </div>
          </div>

          <form className="grid gap-5" onSubmit={submit}>
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
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {loading ? "Joining…" : "Join League"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </FplShell>
  );
}
