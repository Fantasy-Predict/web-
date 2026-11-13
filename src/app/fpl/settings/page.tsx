"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Link2, Link2Off, RefreshCw, Info, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getFplSyncStatus, linkOfficialFpl, unlinkOfficialFpl, type FplSyncStatus } from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function FplSettingsPage() {
  const [status, setStatus] = useState<FplSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getFplSyncStatus().then(setStatus).catch(() => null).finally(() => setLoading(false));
  }, []);

  async function handleLink(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error("Enter your FPL email and password"); return; }
    setSubmitting(true);
    try {
      await linkOfficialFpl({ email: email.trim(), password });
      const updated = await getFplSyncStatus();
      setStatus(updated);
      setEmail(""); setPassword("");
      toast.success("Official FPL account linked! Your picks will now sync automatically.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to link account");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnlink() {
    setSubmitting(true);
    try {
      await unlinkOfficialFpl();
      setStatus(prev => prev ? { ...prev, linked: false, enabled: false, lastAt: null } : prev);
      toast.success("Official FPL account unlinked");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to unlink");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FplShell title="FPL Settings">
      {/* Official FPL sync card */}
      <Card className="mb-5">
        <CardContent className="py-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <RefreshCw className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Official FPL Auto-Sync</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Link your official Fantasy Premier League account so any captain or squad changes you make here are pushed to the official FPL site automatically.
              </p>
            </div>
          </div>

          {/* Info box */}
          <div className="mb-5 flex gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              This only works if you imported your team from the official FPL site. Your credentials are stored with strong encryption and never shared.
            </span>
          </div>

          {loading ? (
            <Skeleton className="h-24 w-full rounded-xl" />
          ) : !status?.hasImportId ? (
            <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
              <p>Official FPL sync requires an imported team.</p>
              <p className="mt-1">Go to <strong>Setup</strong> and import your team using your FPL Team ID to enable this feature.</p>
            </div>
          ) : status.linked ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3">
                <Link2 className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-success">Official FPL linked</p>
                  {status.lastAt && (
                    <p className="text-xs text-muted-foreground">
                      Last sync: {new Date(status.lastAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleUnlink}
                disabled={submitting}
              >
                <Link2Off className="mr-2 h-4 w-4" />
                {submitting ? "Unlinking…" : "Unlink Official FPL Account"}
              </Button>
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={handleLink}>
              <div className="grid gap-2">
                <Label htmlFor="fpl-email">FPL Email</Label>
                <Input
                  id="fpl-email"
                  type="email"
                  placeholder="Your official FPL login email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fpl-password">FPL Password</Label>
                <div className="relative">
                  <Input
                    id="fpl-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your official FPL password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Link2 className="mr-2 h-4 w-4" />
                {submitting ? "Linking…" : "Link Official FPL Account"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </FplShell>
  );
}
