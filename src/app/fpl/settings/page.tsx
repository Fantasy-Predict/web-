"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Link2, Link2Off, RefreshCw, Info, Trash2, ExternalLink, CheckCircle2, Smartphone, Laptop, Terminal, Copy } from "lucide-react";
import { toast } from "sonner";
import { deleteMyFplTeam, getFplSyncStatus, linkOfficialFpl, testFplToken, unlinkOfficialFpl, type FplSyncStatus } from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// Bookmarklet: when the user clicks this while on fantasy.premierleague.com,
// it finds the oidc.user:* key in Local Storage, pulls the refresh_token
// out, copies it to the clipboard, and shows a confirmation. Then they
// paste into our textarea. Minified; must stay on a single line.
//
// IMPORTANT: this is applied via setAttribute in a useEffect rather than
// React's href prop, because React blocks `javascript:` URLs in href
// since 16.9 as an XSS mitigation and sanitizes them to "javascript:void"
// before render. We know this string is safe (static constant we
// control), so we set it on the DOM node directly after mount.
const BOOKMARKLET = `javascript:(function(){try{var h=window.location.hostname;if(!h.includes('premierleague.com')){alert('Open fantasy.premierleague.com first, sign in, then click this bookmark.');return;}var k=null;for(var i=0;i<localStorage.length;i++){var n=localStorage.key(i);if(n&&n.indexOf('oidc.user:')===0){k=n;break;}}if(!k){alert('No FPL session found. Sign in to fantasy.premierleague.com first, then try again.');return;}var v=localStorage.getItem(k);var j=JSON.parse(v);var t=j&&j.refresh_token;if(!t){alert('Found an FPL session but no refresh token. Try signing out and back in, then try again.');return;}navigator.clipboard.writeText(t).then(function(){alert('✓ FPL token copied. Paste it on Fantasy Predict.');},function(){prompt('Copy this token manually:',t);});}catch(e){alert('Error reading FPL token: '+e.message);}})();`;

// Console one-liner: same behavior as the bookmarklet but pasted into
// fantasy.premierleague.com's DevTools Console. For users whose
// browser blocks drag-to-bookmarks-bar (corporate networks, Chrome's
// security prompts). Pastes + Enter runs it; token lands on clipboard.
const CONSOLE_COMMAND = `(async()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('oidc.user:'));if(!k){alert('Sign in to FPL first.');return;}const t=JSON.parse(localStorage.getItem(k)).refresh_token;await navigator.clipboard.writeText(t);alert('✓ FPL token copied — paste on Fantasy Predict.');})();`;

// Mirror of the backend parseRefreshToken — accepts any of the four
// shapes real users paste (bare JWT, full JSON blob, DevTools pretty-
// printed numbered row, or a single "refresh_token: ..." line) and
// returns the clean JWT or null. Running this client-side lets us
// auto-prefill the textarea with just the clean token right after
// paste, so the user sees exactly what we understood. The backend
// re-runs the same logic as a safety net.
function extractRefreshToken(input: string): string | null {
  const trimmed = (input || "").trim();
  if (!trimmed) return null;
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(trimmed)) return trimmed;
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed.refresh_token === "string" && parsed.refresh_token.length > 0) {
        return parsed.refresh_token;
      }
    } catch {
      // fall through to regex
    }
  }
  const m = trimmed.match(
    /["']?refresh_token["']?\s*[:=]\s*["']([A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+)["']/,
  );
  if (m && m[1]) return m[1];
  return null;
}

type TokenTest =
  | { kind: "idle" }
  | { kind: "testing" }
  | { kind: "ok"; teamName: string | null }
  | { kind: "error"; message: string };

export default function FplSettingsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<FplSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleCopied, setConsoleCopied] = useState(false);
  const [testState, setTestState] = useState<TokenTest>({ kind: "idle" });
  const [isMobile, setIsMobile] = useState(false);
  const [extractedFromPaste, setExtractedFromPaste] = useState(false);
  const bookmarkletRef = useRef<HTMLAnchorElement>(null);

  // Bypass React's javascript:-URL XSS block by setting the href via
  // DOM API after mount. React only sanitizes URLs that go through its
  // JSX prop pipeline; setAttribute() skips that pipeline entirely.
  useEffect(() => {
    if (bookmarkletRef.current) {
      bookmarkletRef.current.setAttribute("href", BOOKMARKLET);
    }
  }, []);

  async function copyConsoleCommand() {
    try {
      await navigator.clipboard.writeText(CONSOLE_COMMAND);
      setConsoleCopied(true);
      setTimeout(() => setConsoleCopied(false), 2500);
    } catch {
      toast.error("Couldn't copy. Select the command text manually and copy with Ctrl+C / ⌘+C.");
    }
  }

  useEffect(() => {
    getFplSyncStatus().then(setStatus).catch(() => null).finally(() => setLoading(false));
  }, []);

  // Detect mobile viewport once on mount to show the "set this up on
  // laptop" banner. matchMedia stays accurate across orientation
  // changes without needing a listener for this one-shot UX.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsMobile(window.matchMedia("(max-width: 768px)").matches);
  }, []);

  // Clear the test result when the user edits the token — stale "Valid"
  // next to an edited token would be misleading.
  useEffect(() => {
    if (testState.kind !== "idle") setTestState({ kind: "idle" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Auto-extract the refresh_token from whatever the user pasted — DevTools
  // pretty-prints the oidc.user JSON into numbered rows, so copying from
  // there gives `5. refresh_token: "eyJ..."` which our parser understands.
  // We replace the textarea content with the clean JWT so the user sees
  // exactly what we'll send. Safe against infinite loops because once the
  // content is the clean JWT, extraction returns the same value.
  useEffect(() => {
    const trimmed = token.trim();
    if (!trimmed) {
      if (extractedFromPaste) setExtractedFromPaste(false);
      return;
    }
    const clean = extractRefreshToken(trimmed);
    if (clean && clean !== trimmed) {
      setToken(clean);
      setExtractedFromPaste(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleTestToken() {
    if (!token.trim()) { toast.error("Paste your FPL token first"); return; }
    setTestState({ kind: "testing" });
    try {
      const result = await testFplToken({ token: token.trim() });
      if (result.valid) {
        setTestState({ kind: "ok", teamName: result.teamName });
      } else {
        setTestState({ kind: "error", message: result.message });
      }
    } catch (err) {
      setTestState({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not reach our test service. Try again shortly.",
      });
    }
  }

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
              {/* Mobile banner — the bookmarklet flow is painful on phones */}
              {isMobile && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                  <Laptop className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="text-xs">
                    <p className="font-semibold text-amber-700 dark:text-amber-300">Set this up on a laptop — it's much easier</p>
                    <p className="mt-1 text-muted-foreground">
                      The setup takes two minutes on a computer and you only do it once. After that, you can use Fantasy Predict on your phone the normal way.
                    </p>
                  </div>
                </div>
              )}

              {/* What this is + trust-building intro */}
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">What's an FPL token?</p>
                <p className="mt-1">
                  It's a short code your browser already has after you sign in to the official FPL site. We use it to sync your captain, picks and transfers to and from FPL. <strong className="text-foreground">We never see your FPL password</strong> — it stays on FPL. You do this <strong className="text-foreground">once</strong> and it keeps working.
                </p>
                <p className="mt-2">
                  💡 <strong className="text-foreground">Don't worry about getting it perfectly clean</strong> — you can paste the full JSON, a single line, or even the messy numbered DevTools view, and we'll extract the right piece for you automatically.
                </p>
              </div>

              {/* Bookmarklet one-click option */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-primary">
                  🚀 One-click method (recommended)
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  The easiest way. You save a tiny shortcut, click it on FPL once, and your token copies automatically.
                </p>
                <ol className="mt-3 space-y-3 text-xs text-muted-foreground">
                  <li>
                    <p><strong className="text-foreground">Step 1.</strong> Make sure your bookmarks bar is showing.</p>
                    <p className="mt-0.5 ml-5 text-[11px]">
                      Don't see one? Press <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">Ctrl</kbd>+<kbd className="rounded bg-background px-1.5 py-0.5 font-mono">Shift</kbd>+<kbd className="rounded bg-background px-1.5 py-0.5 font-mono">B</kbd> on Windows, or <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">⌘</kbd>+<kbd className="rounded bg-background px-1.5 py-0.5 font-mono">Shift</kbd>+<kbd className="rounded bg-background px-1.5 py-0.5 font-mono">B</kbd> on Mac.
                    </p>
                  </li>
                  <li>
                    <p><strong className="text-foreground">Step 2.</strong> Click and hold this blue button, then drag it up to your bookmarks bar and let go:</p>
                    <div className="mt-2 ml-5">
                      <a
                        ref={bookmarkletRef}
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-primary/90"
                        draggable
                        title="Drag me to your bookmarks bar — don't just click"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Copy FPL Token
                      </a>
                      <p className="mt-1 text-[11px]">You should now see a bookmark called <em>Copy FPL Token</em> on your bar.</p>
                      <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                        <strong>Dragging isn't working?</strong> Use the <em>Console method</em> option below instead.
                      </p>
                    </div>
                  </li>
                  <li>
                    <p>
                      <strong className="text-foreground">Step 3.</strong> Open{" "}
                      <a
                        href="https://fantasy.premierleague.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        fantasy.premierleague.com
                        <ExternalLink className="h-3 w-3" />
                      </a>{" "}
                      in a new tab and sign in like you normally do.
                    </p>
                  </li>
                  <li>
                    <p><strong className="text-foreground">Step 4.</strong> Once you're signed in and seeing your team, click the <em>Copy FPL Token</em> bookmark you just saved.</p>
                    <p className="mt-0.5 ml-5 text-[11px]">A small message will pop up saying <em>"✓ FPL token copied."</em> Your token is now on your clipboard.</p>
                  </li>
                  <li>
                    <p><strong className="text-foreground">Step 5.</strong> Come back to this tab, paste into the box below (<kbd className="rounded bg-background px-1.5 py-0.5 font-mono">Ctrl</kbd>+<kbd className="rounded bg-background px-1.5 py-0.5 font-mono">V</kbd> or <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">⌘</kbd>+<kbd className="rounded bg-background px-1.5 py-0.5 font-mono">V</kbd>), then hit <em>Test token first</em>. If it says Valid, click Link.</p>
                  </li>
                </ol>
              </div>

              {/* Console method — bookmarklet alternative */}
              <button
                type="button"
                onClick={() => setShowConsole(s => !s)}
                className="text-left text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {showConsole ? "Hide the Console method" : "Dragging didn't work? Use the Console method instead"}
              </button>
              {showConsole && (
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-blue-500" />
                    <p className="font-semibold text-foreground">Console method (no bookmark required)</p>
                  </div>
                  <p className="mt-2">
                    Copy the command below, then paste it into your FPL browser's Developer Console. It'll copy your token to your clipboard automatically — same result as the bookmarklet, no drag-and-drop needed.
                  </p>
                  <ol className="mt-3 space-y-2">
                    <li>
                      <p><strong className="text-foreground">Step 1.</strong> Click <em>Copy command</em>:</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2 ml-5"
                        onClick={copyConsoleCommand}
                      >
                        {consoleCopied ? (
                          <><CheckCircle2 className="mr-2 h-3.5 w-3.5 text-success" /> Copied — now paste it in FPL's Console</>
                        ) : (
                          <><Copy className="mr-2 h-3.5 w-3.5" /> Copy command</>
                        )}
                      </Button>
                    </li>
                    <li>
                      <p>
                        <strong className="text-foreground">Step 2.</strong> Open{" "}
                        <a
                          href="https://fantasy.premierleague.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          fantasy.premierleague.com
                          <ExternalLink className="h-3 w-3" />
                        </a>{" "}
                        and sign in.
                      </p>
                    </li>
                    <li>
                      <p><strong className="text-foreground">Step 3.</strong> Press <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">F12</kbd> on your keyboard, then click the <strong>Console</strong> tab at the top of the panel that opens.</p>
                    </li>
                    <li>
                      <p><strong className="text-foreground">Step 4.</strong> Click inside the Console area (where you see a <code className="rounded bg-background px-1 font-mono">&gt;</code> prompt), then paste (<kbd className="rounded bg-background px-1.5 py-0.5 font-mono">Ctrl</kbd>+<kbd className="rounded bg-background px-1.5 py-0.5 font-mono">V</kbd> or <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">⌘</kbd>+<kbd className="rounded bg-background px-1.5 py-0.5 font-mono">V</kbd>) and press <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">Enter</kbd>.</p>
                      <p className="mt-0.5 ml-5 text-[11px]">
                        If the Console warns you about pasting, type <code className="rounded bg-background px-1 font-mono">allow pasting</code> and press Enter, then paste again.
                      </p>
                    </li>
                    <li>
                      <p><strong className="text-foreground">Step 5.</strong> An alert pops up: <em>"✓ FPL token copied — paste on Fantasy Predict."</em> Come back here and paste into the box below.</p>
                    </li>
                  </ol>
                </div>
              )}

              {/* Manual DevTools instructions (collapsible) */}
              <button
                type="button"
                onClick={() => setShowHow(s => !s)}
                className="text-left text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {showHow ? "Hide the manual steps" : "Still stuck? Show me the full manual way"}
              </button>
              {showHow && (
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Manual steps (uses browser Developer Tools)</p>
                  <p className="mt-1">
                    A bit more technical but works in any browser. Good news: you can paste <em>anything</em> from this view — the whole JSON, a single row, numbered list, we extract the refresh token automatically.
                  </p>
                  <ol className="mt-3 space-y-2">
                    <li><strong className="text-foreground">1.</strong> Sign in to <em>fantasy.premierleague.com</em> in Chrome, Edge, or Firefox.</li>
                    <li><strong className="text-foreground">2.</strong> Press <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">F12</kbd> on your keyboard. A split panel opens on the side or bottom of your browser.</li>
                    <li><strong className="text-foreground">3.</strong> At the top of that panel, click the <strong>Application</strong> tab (or <strong>Storage</strong> tab on Firefox).</li>
                    <li><strong className="text-foreground">4.</strong> On the left side: expand <strong>Local Storage</strong>, then click <strong>https://fantasy.premierleague.com</strong>.</li>
                    <li><strong className="text-foreground">5.</strong> You'll see a list of items. Click the row whose name <strong>starts with</strong> <code className="rounded bg-background px-1 font-mono">oidc.user:</code> — ignore everything after the colon.</li>
                    <li>
                      <p><strong className="text-foreground">6.</strong> Look at the panel below the list. You might see either:</p>
                      <ul className="mt-1 ml-5 space-y-1 list-disc">
                        <li>One long piece of text (good — select all with <kbd className="rounded bg-background px-1 py-0.5 font-mono">Ctrl+A</kbd> and copy)</li>
                        <li>A numbered expanded view with rows like <code className="rounded bg-background px-1 font-mono">5. refresh_token: "eyJ..."</code> — just select from "refresh_token" through the end of that line, or triple-click the <em>refresh_token</em> row to select the whole line</li>
                      </ul>
                      <p className="mt-1 ml-5 text-[11px]">Either way works — paste it into our box and we'll pull out the right token automatically.</p>
                    </li>
                    <li><strong className="text-foreground">7.</strong> Come back here, paste into the box below. You'll see <em>"We found your refresh token"</em> appear if we understood it. Then hit <em>Test token first</em>.</li>
                  </ol>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="fpl-token">Your FPL token</Label>
                <textarea
                  id="fpl-token"
                  className="min-h-[88px] w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Paste anything from Local Storage — the full JSON blob, just the refresh_token line, or the clean token. We'll figure it out."
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  spellCheck={false}
                />
                {extractedFromPaste && token && (
                  <p className="flex items-center gap-1.5 text-[11px] text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    We found your refresh token in that paste and cleaned it up. Ready to test.
                  </p>
                )}
              </div>

              {/* Test result banner — shown when the user has clicked Test */}
              {testState.kind === "ok" && (
                <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <div className="text-sm">
                    <p className="font-semibold text-success">Token is valid</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {testState.teamName
                        ? <>Belongs to <strong>{testState.teamName}</strong>. Looks right? Click Link below to finish.</>
                        : <>Exchange succeeded. Click Link below to finish.</>
                      }
                    </p>
                  </div>
                </div>
              )}
              {testState.kind === "error" && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  <div className="text-sm">
                    <p className="font-semibold text-destructive">Token didn't work</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{testState.message}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Button
                  type="submit"
                  disabled={submitting || !token.trim()}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  {submitting ? "Linking…" : "Link Official FPL Account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!token.trim() || testState.kind === "testing"}
                  onClick={handleTestToken}
                >
                  {testState.kind === "testing" ? (
                    <><Smartphone className="mr-2 h-4 w-4 animate-pulse" /> Testing…</>
                  ) : (
                    <>Test token first</>
                  )}
                </Button>
              </div>
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
