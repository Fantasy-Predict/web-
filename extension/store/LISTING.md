# Chrome Web Store listing pack — Fantasy Predict – Account Link

Copy each block into the matching field in the Chrome Web Store developer dashboard.
This folder is NOT part of the upload zip.

## Store listing tab

**Name** (must match manifest): Fantasy Predict – Account Link

**Summary** (max 132 chars):
Link your Fantasy Premier League account to Fantasy Predict in one click. Sign in on the official page; we never see your password.

**Category**: Fun (or Social & Communication)

**Language**: English

**Detailed description**:

Fantasy Predict – Account Link connects your official Fantasy Premier League account to Fantasy XI on fantasy-predict.com in one click.

How it works
1. On fantasy-predict.com, open FPL Settings and press "Link my FPL account".
2. A new tab opens on the official Fantasy Premier League sign-in page. Sign in there, as you normally do.
3. The tab closes by itself and you are back on Fantasy Predict, linked.

Once linked, captain, vice-captain, lineup and transfer changes you make in Fantasy XI are sent to your official team, and changes you make on the official site show up in Fantasy XI.

Your privacy
- You sign in only on the official Fantasy Premier League page. The extension never sees or stores your password.
- It does nothing outside the linking step and only runs on fantasy-predict.com.
- No analytics, no ads, no selling or sharing of data.
- You can unlink at any time from FPL Settings.

Requirements
- A Fantasy Predict account with an imported FPL team.
- A desktop browser based on Chromium (Chrome, Edge, Brave). On phones, use the manual steps on the FPL Settings page.

Fantasy Predict is not affiliated with or endorsed by the Premier League or Fantasy Premier League.

## Privacy practices tab

**Single purpose**:
Let a Fantasy Predict user connect their own official Fantasy Premier League account to Fantasy XI by catching the one-time sign-in code that FPL returns after the user signs in, and handing it to the Fantasy Predict page that started the link.

**Permission justifications**
- `storage`: Keeps the in-progress link (which tab started it, a random state value, and the start time) in session storage only, because the browser can stop and restart the extension's background worker while the user types their password. Cleared when the link finishes or after 15 minutes.
- Host permission `https://fantasy.premierleague.com/*`: Needed to read the address of the sign-in tab the extension itself opened, at the moment FPL redirects back to fantasy.premierleague.com carrying the one-time code. No page content, cookies or storage on that site are read.
- Content script on `https://fantasy-predict.com/*` and `https://www.fantasy-predict.com/*`: Passes messages between the Fantasy Predict settings page and the extension. Runs on no other site.

**Remote code**: No, I am not using remote code.

**Data usage disclosures** (tick only these)
- Authentication information: YES — the one-time sign-in code is handed to Fantasy Predict to complete linking. The password is never accessed.
- Everything else (personal info, health, financial, location, web history, user activity, website content, communications): NO.

Certify all three:
- I do not sell or transfer user data to third parties outside approved use cases.
- I do not use or transfer user data for purposes unrelated to the item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL**: https://fantasy-predict.com/privacy  (the "Browser Extension" section is added in this change — deploy the player app first, then submit)

## Assets Marvel needs to produce
- Store icon 128x128: `icons/icon128.png` is already in the zip (our own logo: blue arch with gold ball).
- Screenshots: at least 1, up to 5, size 1280x800 (or 640x400). Suggested set: (1) the "Link my FPL account" card on FPL Settings, (2) the official FPL sign-in tab, (3) the "Linked to {name}, Team {id}" confirmation, (4) the green "Official FPL linked" banner.
- Small promo tile 440x280 (optional but helps listing).
- Do NOT show Premier League or FPL logos in screenshots or the promo tile.

## Submission steps (Marvel)
1. Deploy the player app (privacy page + settings page changes) to Vercel.
2. Create the developer account with the COMPANY Google account (US$5 one-time) at chrome.google.com/webstore/devconsole.
3. New item → upload `extension/fantasy-predict-account-link-1.0.0.zip`.
4. Fill the Store listing and Privacy practices tabs from this file; add screenshots.
5. Distribution: Public. Regions: all.
6. Submit for review (first review: days to about two weeks).
7. When approved, copy the listing URL → Vercel env `NEXT_PUBLIC_FPL_EXTENSION_URL` → redeploy.
8. For every future upload: bump `version` in `manifest.json`.
