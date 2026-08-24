"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle, LogIn } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { joinPoolByCode } from "@/app/lib/api/endpoints";
import { getToken } from "@/app/lib/api/session";
import { notifyPool } from "@/app/lib/notifications";

function JoinPoolContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error" | "need-login">("loading");
  const [poolId, setPoolId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setErrorMsg("No invite code provided.");
      return;
    }

    const token = getToken();
    if (!token) {
      setStatus("need-login");
      return;
    }

    let active = true;
    joinPoolByCode(code)
      .then((res) => {
        if (!active) return;
        setPoolId(res.poolId ?? null);
        setStatus("success");
        notifyPool("Pool joined", `You joined a pool using code ${code}. Start making predictions!`);
      })
      .catch((err) => {
        if (!active) return;
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Unable to join pool");
      });

    return () => {
      active = false;
    };
  }, [code]);

  const loginRedirect = `/login?redirect=${encodeURIComponent(`/pools/join?code=${code}`)}`;

  return (
    <Card className="w-full max-w-md items-center gap-0 p-8 text-center shadow-[var(--shadow-card)]">
      {!code ? (
        <>
          <XCircle className="h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-lg font-bold">Invalid Link</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No invite code was found in the link. Please check the URL and try again.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/pools">Browse Pools</Link>
          </Button>
        </>
      ) : status === "loading" ? (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h1 className="mt-4 text-lg font-bold">Joining pool…</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hold on, we&apos;re adding you to the pool.
          </p>
        </>
      ) : status === "need-login" ? (
        <>
          <LogIn className="h-12 w-12 text-primary" />
          <h1 className="mt-4 text-lg font-bold">Login required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need to be logged in to join this pool.
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href={loginRedirect}>Login to Join</Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href={`/register?redirect=${encodeURIComponent(`/pools/join?code=${code}`)}`} className="font-semibold text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </>
      ) : status === "success" ? (
        <>
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          <h1 className="mt-4 text-lg font-bold">You&apos;re in!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;ve successfully joined the pool. Start making predictions to earn points!
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href={poolId ? `/dashboard/pools/${poolId}` : "/dashboard/pools"}>
              Go to Pool
            </Link>
          </Button>
        </>
      ) : (
        <>
          <XCircle className="h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-lg font-bold">Couldn&apos;t join pool</h1>
          <p className="mt-2 text-sm text-muted-foreground">{errorMsg}</p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/pools">Browse Pools</Link>
          </Button>
        </>
      )}
    </Card>
  );
}

export default function JoinPoolPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8">
        <Link href="/" aria-label="Fantasy Predict home">
          <Logo />
        </Link>
      </div>
      <Suspense
        fallback={
          <Card className="w-full max-w-md items-center gap-0 p-8 text-center shadow-[var(--shadow-card)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h1 className="mt-4 text-lg font-bold">Loading…</h1>
          </Card>
        }
      >
        <JoinPoolContent />
      </Suspense>
    </div>
  );
}
