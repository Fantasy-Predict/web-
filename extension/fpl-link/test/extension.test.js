// Plain-Node tests for the extension logic with a fake `chrome` API.
// Run:  node extension/fpl-link/test/extension.test.js
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
// Objects created inside the vm context have a different prototype; compare by value.
const eq = (actual, expected) => assert.deepStrictEqual(JSON.parse(JSON.stringify(actual)), expected);

const root = path.join(__dirname, "..");
const CHALLENGE = "A".repeat(43);
const STATE = "S".repeat(32);

function makeChrome() {
  const calls = { created: [], removed: [], tabUpdates: [], windowUpdates: [], sent: [] };
  const store = {};
  const listeners = { message: null, updated: null, removed: null };
  const chrome = {
    runtime: {
      onMessage: { addListener: (fn) => (listeners.message = fn) },
      getManifest: () => ({ version: "1.0.0" }),
      sendMessage: (msg, cb) => { calls.sentToBackground = msg; if (cb) cb({ ok: true }); },
      lastError: undefined,
    },
    storage: { session: {
      get: async (k) => ({ [k]: store[k] }),
      set: async (o) => Object.assign(store, JSON.parse(JSON.stringify(o))),
    } },
    tabs: {
      create: async (o) => { calls.created.push(o); return { id: 77 }; },
      remove: async (id) => calls.removed.push(id),
      update: async (id, o) => calls.tabUpdates.push([id, o]),
      sendMessage: async (id, m) => calls.sent.push([id, m]),
      onUpdated: { addListener: (fn) => (listeners.updated = fn) },
      onRemoved: { addListener: (fn) => (listeners.removed = fn) },
    },
    windows: { update: async (id, o) => calls.windowUpdates.push([id, o]) },
  };
  return { chrome, calls, listeners };
}

async function backgroundTests() {
  const { chrome, calls, listeners } = makeChrome();
  vm.runInNewContext(fs.readFileSync(path.join(root, "background.js"), "utf8"), { chrome, URL, URLSearchParams, Date, Object, JSON, Promise });
  const send = (msg, sender) => new Promise((resolve) => { const keep = listeners.message(msg, sender, resolve); if (!keep) resolve(undefined); });
  const sender = { tab: { id: 5, windowId: 9 } };

  // invalid input never opens a tab
  eq(await send({ type: "FP_START_LINK", challenge: "short", state: STATE }, sender), { ok: false });
  eq(await send({ type: "FP_START_LINK", challenge: CHALLENGE, state: "x" }, sender), { ok: false });
  assert.strictEqual(calls.created.length, 0, "no tab for invalid input");

  // valid start opens FPL's own sign-in with OUR values
  eq(await send({ type: "FP_START_LINK", challenge: CHALLENGE, state: STATE }, sender), { ok: true });
  const opened = new URL(calls.created[0].url);
  assert.strictEqual(opened.origin + opened.pathname, "https://account.premierleague.com/as/authorize");
  assert.strictEqual(opened.searchParams.get("code_challenge"), CHALLENGE);
  assert.strictEqual(opened.searchParams.get("state"), STATE);
  assert.strictEqual(opened.searchParams.get("code_challenge_method"), "S256");
  assert.strictEqual(opened.searchParams.get("redirect_uri"), "https://fantasy.premierleague.com/");

  // unrelated tabs / other addresses / a second sign-in with someone else's state are ignored
  await listeners.updated(999, { url: "https://fantasy.premierleague.com/?code=ZZZZZZZZ&state=" + STATE }, {});
  await listeners.updated(77, { url: "https://account.premierleague.com/as/authorize?x=1" }, {});
  await listeners.updated(77, { url: "https://fantasy.premierleague.com/?code=OTHERCODE1&state=SOMETHINGELSE" }, {});
  assert.strictEqual(calls.sent.length, 0, "nothing reported for non-matching events");

  // the real redirect: code captured, FPL tab closed, origin refocused, code handed back
  await listeners.updated(77, { url: "https://fantasy.premierleague.com/?code=ABCD1234&state=" + STATE }, {});
  eq(calls.removed, [77]);
  eq(calls.sent[0], [5, { type: "FP_LINK_RESULT", state: STATE, ok: true, code: "ABCD1234" }]);
  eq(calls.tabUpdates[0], [5, { active: true }]);
  eq(calls.windowUpdates[0], [9, { focused: true }]);

  // a repeat event for the same tab does not report twice, and closing it is not "cancelled"
  await listeners.updated(77, { url: "https://fantasy.premierleague.com/?code=ABCD1234&state=" + STATE }, {});
  await listeners.removed(77);
  assert.strictEqual(calls.sent.length, 1);

  // FPL error redirect is reported as a failure
  await send({ type: "FP_START_LINK", challenge: CHALLENGE, state: STATE }, sender);
  await listeners.updated(77, { url: "https://fantasy.premierleague.com/?error=access_denied&state=" + STATE }, {});
  assert.strictEqual(calls.sent[1][1].ok, false);
  assert.match(calls.sent[1][1].error, /access_denied/);

  // the user closing the FPL tab reports "cancelled"
  await send({ type: "FP_START_LINK", challenge: CHALLENGE, state: STATE }, sender);
  await listeners.removed(77);
  eq(calls.sent[2][1], { type: "FP_LINK_RESULT", state: STATE, ok: false, error: "cancelled" });
  console.log("background.js: all checks passed");
}

async function contentTests() {
  const { chrome } = makeChrome();
  let bgListener;
  chrome.runtime.onMessage = { addListener: (fn) => (bgListener = fn) };
  const posted = [];
  let pageHandler;
  const win = {
    location: { origin: "https://fantasy-predict.com" },
    postMessage: (m, origin) => posted.push([m, origin]),
    addEventListener: (type, fn) => { if (type === "message") pageHandler = fn; },
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, "content.js"), "utf8"), { chrome, window: win, Object });
  const fire = (data, over = {}) => pageHandler({ source: win, origin: win.location.origin, data, ...over });

  assert.strictEqual(posted[0][0].type, "FP_EXT_PONG", "announces itself on load");
  posted.length = 0;
  fire({ source: "fp-page", type: "FP_EXT_PING" });
  assert.strictEqual(posted[0][0].type, "FP_EXT_PONG");
  assert.strictEqual(posted[0][1], "https://fantasy-predict.com", "replies only to its own origin");

  // messages from other windows/origins or other senders are ignored
  posted.length = 0;
  fire({ source: "fp-page", type: "FP_EXT_PING" }, { source: {} });
  fire({ source: "fp-page", type: "FP_EXT_PING" }, { origin: "https://evil.example" });
  fire({ source: "someone-else", type: "FP_EXT_PING" });
  assert.strictEqual(posted.length, 0);

  // start is forwarded; the background's result is forwarded back to the page
  fire({ source: "fp-page", type: "FP_LINK_START", challenge: CHALLENGE, state: STATE });
  eq(JSON.parse(JSON.stringify(chrome.runtime.sendMessage ? {} : {})), {});
  bgListener({ type: "FP_LINK_RESULT", ok: true, code: "ABCD1234", state: STATE });
  eq(JSON.parse(JSON.stringify(posted.pop()[0])), { source: "fp-extension", type: "FP_LINK_RESULT", ok: true, code: "ABCD1234", state: STATE });
  console.log("content.js: all checks passed");
}

(async () => { await backgroundTests(); await contentTests(); })().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
