"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Link2, Loader2, PlugZap } from "lucide-react";
import { toast } from "sonner";
import { linkOfficialFplWithCode } from "@/app/lib/api/endpoints";
import { createPkcePair, detectExtension, requestFplSignIn } from "@/app/lib/fpl-link";
import { Button } from "@/components/ui/button";

// Where users install the extension from (Chrome Web Store listing). Empty
// until the listing is published — then the card says it's coming and the
// manual methods below remain the way to link.
const EXTENSION_URL = process.env.NEXT_PUBLIC_FPL_EXTENSION_URL || "";

type Props = {
  /** Called after a successful link so the page can refresh its status. */
  onLinked: () => void | Promise<void>;
};

/**
 * One-click "Link FPL" using the browser extension. The user signs in on
 * FPL's own page; we never see their password. Desktop only — hides itself
 * on phones, where the extension can't run.
 */
export function OneClickLink({ onLinked }: Props) {
  const [mobile, setMobile] = useState(false);
  const [extension, setExtension] = useState<"checking" | "installed" | "missing">("checking");
  const [busy, setBusy] = useState<null | "signin" | "linking">(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 768px)").matches);
    let active = true;
    detectExtension().then((found) => {
      if (active) setExtension(found ? "installed" : "missing");
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleLink() {
    setError(null);
    setBusy("signin");
    try {
      const pkce = await createPkcePair();
      const result = await requestFplSignIn(pkce);
      if (!result.ok) {
        if (!result.cancelled) setError(result.error);
        return;
      }
      setBusy("linking");
      const linked = await linkOfficialFplWithCode({ code: result.code, codeVerifier: pkce.verifier });
      const who = [linked?.managerName, linked?.teamId ? `Team ${linked.teamId}` : null]
        .filter(Boolean)
        .join(", ");
      toast.success(
        who
          ? `Linked to ${who}. Your picks will now sync automatically.`
          : "Official FPL account linked! Your picks will now sync automatically.",
      );
      await onLinked();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not link your FPL account. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  if (mobile) return null;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <PlugZap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary">Link with one click</p>
          <p className="mt-1 text-xs text-muted-foreground">
            A new tab opens on FPL&apos;s own sign-in page. Sign in as you normally do and you&apos;re done —{" "}
            <strong className="text-foreground">we never see your FPL password</strong>.
          </p>

          {extension === "checking" && (
            <p className="mt-3 text-xs text-muted-foreground">Checking for the extension…</p>
          )}

          {extension === "installed" && (
            <div className="mt-3">
              <Button type="button" onClick={handleLink} disabled={busy !== null}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                {busy === "signin" ? "Waiting for FPL sign-in…" : busy === "linking" ? "Linking…" : "Link my FPL account"}
              </Button>
              {busy === "signin" && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Finish signing in on the FPL tab. It closes by itself and brings you back here.
                </p>
              )}
            </div>
          )}

          {extension === "missing" && (
            <div className="mt-3 space-y-2">
              {EXTENSION_URL ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    Install our small browser extension once (Chrome, Edge or Brave on a computer), then come back
                    and refresh this page.
                  </p>
                  <Button type="button" asChild variant="outline">
                    <a href={EXTENSION_URL} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Get the extension
                    </a>
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  The one-click extension is coming soon. For now, use one of the methods below.
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
