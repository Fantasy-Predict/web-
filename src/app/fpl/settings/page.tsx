"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Link2, Link2Off, RefreshCw, Info, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { deleteMyFplTeam, getFplSyncStatus, linkOfficialFpl, unlinkOfficialFpl, type FplSyncStatus } from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// Bookmarklet: when the user clicks this while on fantasy.premierleague.com,
// it finds the oidc.user:* key in Local Storage, pulls the refresh_token
// out, copies it to the clipboard, and shows a confirmation. Then they
// paste into our textarea. Minified; must stay on a single line (no new
// lines allowed in a javascript: URL).
const BOOKMARKLET = `javascript:(function(){try{var h=window.location.hostname;if(!h.includes('premierleague.com')){alert('Open fantasy.premierleague.com first, sign in, then click this bookmark.');return;}var k=null;for(var i=0;i<localStorage.length;i++){var n=localStorage.key(i);if(n&&n.indexOf('oidc.user:')===0){k=n;break;}}if(!k){alert('No FPL session found. Sign in to fantasy.premierleague.com first, then try again.');return;}var v=localStorage.getItem(k);var j=JSON.parse(v);var t=j&&j.refresh_token;if(!t){alert('Found an FPL session but no refresh token. Try signing out and back in, then try again.');return;}navigator.clipboard.writeText(t).then(function(){alert('✓ FPL token copied. Paste it on Fantasy Predict.');},function(){prompt('Copy this token manually:',t);});}catch(e){alert('Error reading FPL token: '+e.message);}})();`;

export default function FplSettingsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<FplSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showHow, setShowHow] = useState(false);

  useEffect(() => {
    getFplSyncStatus().then(setStatus).catch(() => null).finally(() => setLoading(false));
  }, []);

  async function handleLink(e: FormEvent) {
    e.preventDefault();
    if (!token.trim()) { toast.error("Paste your FPL token first"); return; }
    setSubmitting(true);
    try {
      await linkOfficialFpl({ token: token.trim() });
      const updated = await getFplSyncStatus();
      setStatus(updated);
      setToken("");
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
      setStatus(prev => prev ? { ...prev, linked: false, enabled: false, lastAt: null, lastSuccessAt: null, lastError: null } : prev);
      toast.success("Official FPL account unlinked");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to unlink");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMyFplTeam();
      toast.success("FPL team deleted. Set up a new one to start over.");
      router.push("/fpl/setup");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete FPL team");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
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
              This only works if you imported your team from the official FPL site. We never see your password — you paste a token from your own browser, encrypted end-to-end on our servers.
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
              {/* Success banner */}
              {!status.lastError && (
                <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3">
                  <Link2 className="h-5 w-5 text-success" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-success">Official FPL linked</p>
                    {status.lastSuccessAt ? (
                      <p className="text-xs text-muted-foreground">
                        Last successful sync: {new Date(status.lastSuccessAt).toLocaleString()}
                      </p>
                    ) : status.lastAt ? (
                      <p className="text-xs text-muted-foreground">
                        Last sync: {new Date(status.lastAt).toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Linked — first sync will run on your next page load.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Error banner */}
              {status.lastError && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-destructive">Sync is not working</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {status.lastError}
                    </p>
                    {status.lastAt && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Last tried: {new Date(status.lastAt).toLocaleString()}
                        {status.lastSuccessAt && (
                          <> · Last good: {new Date(status.lastSuccessAt).toLocaleString()}</>
                        )}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Unlink below and link again with a fresh token from your FPL browser.
                    </p>
                  </div>
                </div>
              )}

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
              {/* Bookmarklet one-click option */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-primary">
                  🚀 One-click method (recommended)
                </p>
                <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <li>
                    <strong className="text-foreground">1.</strong> Drag this button to your browser's bookmarks bar:{" "}
                    <a
                      href={BOOKMARKLET}
                      onClick={(e) => e.preventDefault()}
                      className="ml-1 inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-primary/90"
                      draggable
                      title="Drag me to your bookmarks bar"
                    >
                      <Link2 className="h-3 w-3" />
                      Copy FPL Token
                    </a>
                  </li>
                  <li>
                    <strong className="text-foreground">2.</strong> Open{" "}
                    <a
                      href="https://fantasy.premierleague.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      fantasy.premierleague.com
                      <ExternalLink className="h-3 w-3" />
                    </a>{" "}
                    and sign in
                  </li>
                  <li>
                    <strong className="text-foreground">3.</strong> Click your new <em>Copy FPL Token</em> bookmark — your token lands on your clipboard
                  </li>
                  <li>
                    <strong className="text-foreground">4.</strong> Come back here and paste below
                  </li>
                </ol>
              </div>

              {/* Manual DevTools instructions (collapsible) */}
              <button
                type="button"
                onClick={() => setShowHow(s => !s)}
                className="text-left text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {showHow ? "Hide" : "Can't use the bookmark? Show the manual (DevTools) method"}
              </button>
              {showHow && (
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                  <ol className="space-y-2">
                    <li><strong className="text-foreground">1.</strong> Sign in to fantasy.premierleague.com in Chrome, Edge or Firefox</li>
                    <li><strong className="text-foreground">2.</strong> Press <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">F12</kbd> to open DevTools</li>
                    <li><strong className="text-foreground">3.</strong> Click the <strong>Application</strong> tab (Chrome/Edge) or <strong>Storage</strong> tab (Firefox)</li>
                    <li><strong className="text-foreground">4.</strong> On the left: <strong>Local Storage</strong> → <strong>https://fantasy.premierleague.com</strong></li>
                    <li><strong className="text-foreground">5.</strong> Find the key starting with <code className="rounded bg-background px-1 font-mono">oidc.user:</code></li>
                    <li><strong className="text-foreground">6.</strong> Copy its entire value (the long JSON) and paste it below</li>
                  </ol>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="fpl-token">Your FPL token</Label>
                <textarea
                  id="fpl-token"
                  className="min-h-[88px] w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Paste the token from your FPL browser's Local Storage here…"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  spellCheck={false}
                />
              </div>
              <Button
                type="submit"
                disabled={submitting || !token.trim()}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Link2 className="mr-2 h-4 w-4" />
                {submitting ? "Linking…" : "Link Official FPL Account"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardContent className="py-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Delete FPL team</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Permanently delete your Fantasy XI team for the current season. You can start fresh afterwards by importing or building a new squad. This does not affect your Fan Predictor account, wallet, or prediction pool history.
              </p>
            </div>
          </div>

          {confirmDelete ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  This will permanently remove your squad, your saved picks, your transfers and your private FPL league memberships for the current season. It cannot be undone.
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting ? "Deleting…" : "Yes, delete my FPL team"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={deleting}
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete my FPL team
            </Button>
          )}
        </CardContent>
      </Card>
    </FplShell>
  );
}
