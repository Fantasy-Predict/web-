// Fantasy Predict – Account Link: background service worker (Manifest V3).
//
// What it does, and ONLY this:
//   1. Our settings page asks it to start a link (page → content.js → here)
//      with a PKCE challenge + state that the PAGE generated.
//   2. It opens FPL's own sign-in page in a new tab with those values.
//   3. When FPL redirects that tab back to fantasy.premierleague.com with a
//      one-time `code`, it reads the code from the tab's address (before
//      FPL's own page rewrites it), closes the tab, and hands the code back
//      to the settings tab that asked.
//
// It never sees or stores a password, never reads FPL cookies or storage,
// and keeps nothing after the link completes. The code is useless without the
// PKCE verifier, which stays in the user's own browser page.
//
// State lives in chrome.storage.session (not memory) because MV3 service
// workers are stopped and restarted while the user is typing their password.

const FPL_AUTHORIZE = "https://account.premierleague.com/as/authorize";
const FPL_CLIENT_ID = "bfcbaf69-aade-4c1b-8f00-c1cb8a193030"; // FPL's public client id
const FPL_REDIRECT = "https://fantasy.premierleague.com/";
const FPL_SCOPE = "openid profile email offline_access p1:update:user consent interest";

const SESSION_KEY = "pendingLinks"; // { [fplTabId]: { originTabId, originWindowId, state, startedAt } }
const MAX_AGE_MS = 15 * 60 * 1000;

const CHALLENGE_RE = /^[A-Za-z0-9\-_]{43}$/; // base64url(SHA-256) is exactly 43 chars
const STATE_RE = /^[A-Za-z0-9\-_]{16,128}$/;

async function getPending() {
  const stored = await chrome.storage.session.get(SESSION_KEY);
  const pending = stored[SESSION_KEY] || {};
  // Drop anything abandoned.
  const now = Date.now();
  let changed = false;
  for (const id of Object.keys(pending)) {
    if (now - pending[id].startedAt > MAX_AGE_MS) {
      delete pending[id];
      changed = true;
    }
  }
  if (changed) await chrome.storage.session.set({ [SESSION_KEY]: pending });
  return pending;
}

function setPending(pending) {
  return chrome.storage.session.set({ [SESSION_KEY]: pending });
}

async function tellOriginTab(entry, payload) {
  try {
    await chrome.tabs.update(entry.originTabId, { active: true });
    await chrome.windows.update(entry.originWindowId, { focused: true });
  } catch (_) {
    // origin tab or window is gone — nothing to return to
  }
  try {
    await chrome.tabs.sendMessage(entry.originTabId, { type: "FP_LINK_RESULT", state: entry.state, ...payload });
  } catch (_) {
    // origin tab closed
  }
}

// 1. The settings page (via content.js) asks us to start.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.type !== "FP_START_LINK") return;

  (async () => {
    if (!sender.tab || typeof sender.tab.id !== "number") {
      sendResponse({ ok: false });
      return;
    }
    if (!CHALLENGE_RE.test(msg.challenge || "") || !STATE_RE.test(msg.state || "")) {
      sendResponse({ ok: false });
      return;
    }

    // We build the FPL address ourselves; the page only supplies the PKCE
    // challenge and state. So this extension can't be used to open arbitrary URLs.
    const url = new URL(FPL_AUTHORIZE);
    url.search = new URLSearchParams({
      response_type: "code",
      client_id: FPL_CLIENT_ID,
      redirect_uri: FPL_REDIRECT,
      scope: FPL_SCOPE,
      code_challenge: msg.challenge,
      code_challenge_method: "S256",
      state: msg.state,
    }).toString();

    const tab = await chrome.tabs.create({ url: url.toString(), active: true, windowId: sender.tab.windowId });
    const pending = await getPending();
    pending[tab.id] = {
      originTabId: sender.tab.id,
      originWindowId: sender.tab.windowId,
      state: msg.state,
      startedAt: Date.now(),
    };
    await setPending(pending);
    sendResponse({ ok: true });
  })().catch(() => sendResponse({ ok: false }));

  return true; // async response
});

// 2. Watch OUR sign-in tab for FPL's redirect carrying the one-time code.
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const url = changeInfo.url || (tab && tab.url);
  if (!url || !url.startsWith(FPL_REDIRECT)) return;

  const pending = await getPending();
  const entry = pending[tabId];
  if (!entry) return;

  let params;
  try {
    params = new URL(url).searchParams;
  } catch (_) {
    return;
  }
  const hasCode = params.has("code");
  const hasError = params.has("error");
  if (!hasCode && !hasError) return;
  // FPL's own page can start a second sign-in with its own state — ignore it.
  if (params.get("state") !== entry.state) return;

  delete pending[tabId];
  await setPending(pending);

  // Close the FPL tab first so the code is out of sight, then report back.
  try {
    await chrome.tabs.remove(tabId);
  } catch (_) {
    // already closed
  }

  if (hasCode) {
    await tellOriginTab(entry, { ok: true, code: params.get("code") });
  } else {
    await tellOriginTab(entry, {
      ok: false,
      error: params.get("error_description") || params.get("error") || "FPL sign-in was not completed.",
    });
  }
});

// 3. The user closed the FPL tab themselves before finishing.
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const pending = await getPending();
  const entry = pending[tabId];
  if (!entry) return;
  delete pending[tabId];
  await setPending(pending);
  await tellOriginTab(entry, { ok: false, error: "cancelled" });
});
