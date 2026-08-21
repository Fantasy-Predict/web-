"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { verifyPayment } from "@/app/lib/api/endpoints";
import { notifyPayment } from "@/app/lib/notifications";

function WalletReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    const trxError = searchParams.get("error");

    if (trxError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("failed");
      setError("Payment was cancelled or failed on Paystack.");
      return;
    }

    if (!reference) {
      setStatus("failed");
      setError("No payment reference found. Please check your wallet.");
      return;
    }

    let active = true;
    verifyPayment({ reference })
      .then(() => {
        if (active) {
          setStatus("success");
          notifyPayment("Payment confirmed", "Your deposit has been credited to your wallet.");
        }
      })
      .catch((err) => {
        if (active) {
          setStatus("failed");
          setError(err instanceof Error ? err.message : "Could not verify payment. Check your wallet.");
        }
      });

    return () => {
      active = false;
    };
  }, [searchParams]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <Card className="max-w-md gap-0 p-8 text-center shadow-[var(--shadow-card)]">
        {status === "verifying" ? (
          <>
            <Skeleton className="mx-auto h-6 w-48" />
            <Skeleton className="mx-auto mt-4 h-4 w-64" />
            <Skeleton className="mx-auto mt-8 h-10 w-32" />
          </>
        ) : status === "success" ? (
          <>
            <h2 className="text-lg font-semibold text-success">Payment confirmed</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your deposit has been credited to your wallet.
            </p>
            <Button className="mt-8" onClick={() => router.push("/dashboard/wallet")}>
              Back to wallet
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-destructive">Payment failed</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <div className="mt-8 flex justify-center gap-3">
              <Button variant="outline" onClick={() => router.push("/dashboard/wallet")}>
                Back to wallet
              </Button>
              <Button onClick={() => router.back()}>Try again</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default function WalletReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center p-8">
          <Card className="max-w-md gap-0 p-8 text-center shadow-[var(--shadow-card)]">
            <Skeleton className="mx-auto h-6 w-48" />
            <Skeleton className="mx-auto mt-4 h-4 w-64" />
          </Card>
        </div>
      }
    >
      <WalletReturnContent />
    </Suspense>
  );
}
