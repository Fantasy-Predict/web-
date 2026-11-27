# Fantasy Predict – FPL Link (browser extension)

One-click linking of a user's official FPL account to Fantasy XI. The user signs
in on **FPL's own page**; the extension catches the one-time sign-in code FPL
redirects back with and hands it to our settings page. Our server exchanges it
for tokens (via the Vercel `/api/fpl-exchange` route). Passwords never reach us.

Desktop Chromium browsers only (Chrome, Edge, Brave). Phones keep the manual
methods on `/fpl/settings`.

## How it works
1. `/fpl/settings` → "Link my FPL account" generates a PKCE pair in the page
   (verifier stays in the page) and posts the challenge + state to `content.js`.
2. `background.js` opens `account.premierleague.com/as/authorize` with those
   values, watches that tab, reads `?code=…&state=…` when FPL redirects to
   `fantasy.premierleague.com/`, closes the tab, and returns the code to the
   settings tab.
3. The page sends `{ code, codeVerifier }` to `POST /v1/fpl/team/sync/link-code`.

Permissions are minimal: `storage` (session state across worker restarts) and
host access to `fantasy.premierleague.com` (to read the redirect address). The
content script runs only on `fantasy-predict.com`.

## Test it locally (unpacked)
1. Chrome → `chrome://extensions` → turn on **Developer mode** → **Load unpacked**
   → pick this folder (`extension/fpl-link`).
2. Open `https://fantasy-predict.com/fpl/settings` (backend + player app with
   this change deployed), signed in with an account that has an **imported FPL
   team** and is not yet linked.
3. The card should say **Link my FPL account** (if it says "coming soon", the
   extension wasn't detected — refresh the page).
4. Click it, sign in on the FPL tab with the matching FPL account. The tab
   closes and the page shows "Official FPL linked".

Logic tests (no browser needed): `node extension/fpl-link/test/extension.test.js`

## Publish to the Chrome Web Store (needed for real users)
- One-time developer account (US$5) at the Chrome Web Store developer dashboard.
- Zip the **contents** of this folder (not the folder itself), excluding `test/`
  and this README.
- Listing needs: description, screenshots, a privacy policy URL, and the
  single-purpose / permission justifications above.
- After approval, set `NEXT_PUBLIC_FPL_EXTENSION_URL` on Vercel to the listing
  URL so the settings card shows a "Get the extension" button.
- Edge/Brave install from the same Chrome listing; Edge also has its own store.

## Notes
- FPL's sign-in address and client id are public (same as fantasy.premierleague.com
  itself). If FPL changes them, update the constants at the top of `background.js`
  and `src/app/api/fpl-exchange/route.ts`.
- Bump `version` in `manifest.json` for every store upload.
