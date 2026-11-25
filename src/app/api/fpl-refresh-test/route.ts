/**
 * TEMPORARY TEST ROUTE — DELETE after we confirm Vercel's IP can talk
 * to FPL's OAuth token endpoint.
 *
 * Background: our London Droplet is persistently rate-limited (429) by
 * Cloudflare when calling https://account.premierleague.com/as/token,
 * because we hammered that host with failed stealth-Playwright attempts
 * earlier in the day. This endpoint proxies the same call from Vercel's
 * serverless runtime (AWS Lambda IPs) — IPs Cloudflare cannot blanket-
 * block without breaking a huge chunk of the internet.
 *
 * Success criteria: HTTP 400 with body containing "invalid_grant" and
 * "Failed to decode refresh token". That proves Vercel's IP reaches the
 * origin, got a proper OAuth-spec response, and we can build the real
 * fpl-refresh proxy on this foundation.
 *
 * Failure (429 / 403): Vercel IPs are also blocked and we commit to the
 * browser-extension path.
 */

import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(_req: NextRequest) {
    const start = Date.now()
    try {
        const upstream = await fetch("https://account.premierleague.com/as/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                Origin: "https://fantasy.premierleague.com",
                Referer: "https://fantasy.premierleague.com/",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: "obviously-fake-test-token-from-vercel-proxy-test",
                client_id: "bfcbaf69-aade-4c1b-8f00-c1cb8a193030",
            }),
        })

        const bodyText = await upstream.text()
        const elapsed = Date.now() - start

        return NextResponse.json({
            verdict:
                upstream.status === 400 && bodyText.includes("invalid_grant")
                    ? "WIN - Vercel IP reaches FPL, build the real proxy"
                    : upstream.status === 429 || upstream.status === 403
                    ? "FAIL - Vercel IP is also blocked, commit to extension plan"
                    : "UNKNOWN - unexpected response, check body",
            upstreamStatus: upstream.status,
            elapsedMs: elapsed,
            upstreamBody: bodyText.slice(0, 500),
            vercelRegion: process.env.VERCEL_REGION || "unknown",
        })
    } catch (err) {
        return NextResponse.json(
            {
                verdict: "ERROR",
                error: err instanceof Error ? err.message : String(err),
                elapsedMs: Date.now() - start,
            },
            { status: 500 },
        )
    }
}
