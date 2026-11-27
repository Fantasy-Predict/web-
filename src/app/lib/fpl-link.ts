/**
 * One-click FPL link — browser side.
 *
 * The "Fantasy Predict – Account Link" extension opens FPL's own sign-in page and
 * catches the one-time code FPL redirects back with. This module generates
 * the PKCE pair (the secret verifier never leaves this page and our backend),
 * talks to the extension over window.postMessage, and resolves with the code.
 *
 * Message protocol (same window + origin only):
 *   page → ext: { source: "fp-page", type: "FP_EXT_PING" }
 *               { source: "fp-page", type: "FP_LINK_START", challenge, state }
 *   ext → page: { source: "fp-extension", type: "FP_EXT_PONG", version }
 *               { source: "fp-extension", type: "FP_LINK_RESULT", ok, code?, state, error? }
 */

const base64Url = (bytes: Uint8Array): string => {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const randomString = (byteLength: number): string => {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
};

export type PkcePair = { verifier: string; challenge: string; state: string };

/** RFC 7636 S256 pair + a random state. Verifier is 64 chars (limit 43–128). */
export async function createPkcePair(): Promise<PkcePair> {
  const verifier = randomString(48); // 48 bytes → 64 base64url chars
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return {
    verifier,
    challenge: base64Url(new Uint8Array(digest)), // 43 chars
    state: randomString(24), // 32 chars
  };
}

const postToExtension = (message: Record<string, unknown>) =>
  window.postMessage({ source: "fp-page", ...message }, window.location.origin);

type ExtensionEvent =
  | { source: "fp-extension"; type: "FP_EXT_PONG"; version?: string }
  | { source: "fp-extension"; type: "FP_LINK_RESULT"; ok: boolean; code?: string; state?: string; error?: string };

const isExtensionEvent = (event: MessageEvent): event is MessageEvent<ExtensionEvent> =>
  event.source === window &&
  event.origin === window.location.origin &&
  !!event.data &&
  event.data.source === "fp-extension";

/** Resolves true if the extension answers a ping within `timeoutMs`. */
export function detectExtension(timeoutMs = 900): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (value: boolean) => {
      if (done) return;
      done = true;
      window.removeEventListener("message", onMessage);
      clearTimeout(timer);
      resolve(value);
    };
    const onMessage = (event: MessageEvent) => {
      if (isExtensionEvent(event) && event.data.type === "FP_EXT_PONG") finish(true);
    };
    window.addEventListener("message", onMessage);
    const timer = setTimeout(() => finish(false), timeoutMs);
    postToExtension({ type: "FP_EXT_PING" });
  });
}

export type LinkCodeResult =
  | { ok: true; code: string }
  | { ok: false; error: string; cancelled?: boolean };

/**
 * Starts the sign-in via the extension and waits for the code. Gives up
 * after `timeoutMs` (default 10 minutes) so a forgotten tab doesn't hang.
 */
export function requestFplSignIn(pkce: PkcePair, timeoutMs = 10 * 60 * 1000): Promise<LinkCodeResult> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (result: LinkCodeResult) => {
      if (done) return;
      done = true;
      window.removeEventListener("message", onMessage);
      clearTimeout(timer);
      resolve(result);
    };
    const onMessage = (event: MessageEvent) => {
      if (!isExtensionEvent(event) || event.data.type !== "FP_LINK_RESULT") return;
      const data = event.data;
      if (data.state !== pkce.state) return; // not our request
      if (data.ok && data.code) return finish({ ok: true, code: data.code });
      if (data.error === "cancelled") return finish({ ok: false, error: "Sign-in was closed before finishing.", cancelled: true });
      finish({ ok: false, error: data.error || "The FPL sign-in did not complete." });
    };
    window.addEventListener("message", onMessage);
    const timer = setTimeout(
      () => finish({ ok: false, error: "The FPL sign-in timed out. Please try again." }),
      timeoutMs,
    );
    postToExtension({ type: "FP_LINK_START", challenge: pkce.challenge, state: pkce.state });
  });
}
