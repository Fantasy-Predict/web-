/**
 * Vercel serverless proxy: FPL authorization-code → tokens.
 *
 * Why this exists: same reason as /api/fpl-refresh. Our London Droplet is
 * rate-limited by Cloudflare at account.premierleague.com, but Vercel's
 * serverless runtime reaches it fine.
 *
 * Flow (one-click "Link FPL" with the browser extension):
 *   1. The extension opens FPL's real sign-in page with OUR PKCE challenge.
 *   2. After sign-in FPL redirects to fantasy.premierleague.com/?code=…; the
 *      extension catches the code and hands it to our settings page.
 *   3. The settings page sends { code, codeVerifier } to our backend, which
 *      POSTs them here with the shared secret.
 *   4. We call FPL's /as/token with grant_type=authorization_code and return
 *      FPL's JSON (access_token, refresh_token, …) unchanged.
 *
 * The code is single-use and short-lived, and useless without the
 * code_verifier, which only the user's own browser and our backend ever see.
 * Auth: x-fp-proxy-secret header (same FPL_PROXY_SECRET as /api/fpl-refresh).
 */

import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// FPL's public OAuth client ID. Readable from any FPL page source.
const FPL_CLIENT_ID = "bfcbaf69-aade-4c1b-8f00-c1cb8a193030"
const FPL_TOKEN_URL = "https://account.premierleague.com/as/token"
// Fixed by FPL: the only redirect address their sign-in accepts for this client.
const FPL_REDIRECT_URI = "https://fantasy.premierleague.com/"

const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

// RFC 7636: verifier is 43–128 chars of unreserved characters.
const VERIFIER_RE = /^[A-Za-z0-9\-._~]{43,128}$/
// Codes are opaque; accept a sane charset and length only.
const CODE_RE = /^[A-Za-z0-9\-._~]{8,512}$/

export async function POST(req: NextRequest) {
    const expectedSecret = process.env.FPL_PROXY_SECRET
    if (!expectedSecret) {
        return NextResponse.json(
            { error: "proxy_not_configured", message: "FPL_PROXY_SECRET env var not set on Vercel" },
            { status: 500 },
        )
    }

    const providedSecret = req.headers.get("x-fp-proxy-secret")
    if (providedSecret !== expectedSecret) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const code = body?.code
    const codeVerifier = body?.codeVerifier
    if (typeof code !== "string" || !CODE_RE.test(code)) {
        return NextResponse.json({ error: "invalid_code_format" }, { status: 400 })
    }
    if (typeof codeVerifier !== "string" || !VERIFIER_RE.test(codeVerifier)) {
        return NextResponse.json({ error: "invalid_verifier_format" }, { status: 400 })
    }

    try {
        const upstream = await fetch(FPL_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
                "User-Agent": UA,
                Origin: "https://fantasy.premierleague.com",
                Referer: "https://fantasy.premierleague.com/",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: FPL_REDIRECT_URI,
                client_id: FPL_CLIENT_ID,
                code_verifier: codeVerifier,
            }),
        })

        const text = await upstream.text()
        // Pass the status through so the backend can see 400 / 401 / 429 etc.
        try {
            const json = JSON.parse(text)
            return NextResponse.json(json, { status: upstream.status })
        } catch {
            return NextResponse.json(
                { error: "upstream_non_json", upstreamStatus: upstream.status, body: text.slice(0, 500) },
                { status: 502 },
            )
        }
    } catch (err) {
        return NextResponse.json(
            { error: "proxy_fetch_failed", message: err instanceof Error ? err.message : String(err) },
            { status: 502 },
        )
    }
}

// Reject other methods explicitly so curl -X GET doesn't look like it worked.
export async function GET() {
    return NextResponse.json({ error: "method_not_allowed", message: "Use POST" }, { status: 405 })
}
