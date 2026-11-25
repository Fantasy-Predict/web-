/**
 * Vercel-hosted OAuth proxy for Fantasy Premier League.
 *
 * Why this exists: our London Droplet is persistently rate-limited (HTTP 429)
 * by Cloudflare when calling https://account.premierleague.com/as/token
 * because we tripped their enterprise bot defense with earlier Playwright
 * attempts. Vercel's serverless runtime uses AWS Lambda IPs that Cloudflare
 * cannot blanket-block without breaking a large chunk of the internet, so
 * this endpoint reliably reaches FPL's OAuth token endpoint.
 *
 * Flow:
 *   Backend (Droplet) → POST here with refresh_token + shared secret
 *   → we call FPL's /as/token
 *   → return { access_token, refresh_token (rotated), expires_in, token_type }
 *   → Backend uses access_token to call fantasy.premierleague.com/api/my-team/
 *     with X-API-Authorization: Bearer header (Droplet CAN reach that host)
 *
 * The shared secret (FPL_PROXY_SECRET, set in Vercel env + backend .env)
 * stops random internet callers from using our serverless function to proxy
 * token refreshes. It is NOT a replacement for TLS; the secret is only ever
 * sent server-to-server over HTTPS.
 */

import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// FPL's public OAuth client ID. Readable from any FPL page source.
const FPL_CLIENT_ID = "bfcbaf69-aade-4c1b-8f00-c1cb8a193030"
const FPL_TOKEN_URL = "https://account.premierleague.com/as/token"

const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

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
    const refreshToken = body?.refreshToken
    if (!refreshToken || typeof refreshToken !== "string") {
        return NextResponse.json({ error: "missing_refresh_token" }, { status: 400 })
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
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: FPL_CLIENT_ID,
            }),
        })

        const text = await upstream.text()
        // Pass the status through so the Droplet can see 400 / 401 / 429 etc.
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
