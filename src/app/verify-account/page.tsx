"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { resendCode, verifyAccount } from "@/app/lib/api/endpoints";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "../../components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../../components/ui/input-otp";

export default function VerifyAccountPage() {
  return (
    <Suspense>
      <VerifyAccountContent />
    </Suspense>
  );
}

function VerifyAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function verify() {
    if (otp.length < 6) {
      toast.error("Enter the 6-digit code from your email");
      return;
    }
    setLoading(true);
    try {
      await verifyAccount({ email, otp });
      toast.success("Account verified. You can now log in.");
      router.push("/login");
    } catch (error) {
      setLoading(false);
      toast.error(error instanceof Error ? error.message : "That code didn't work. Try again.");
    }
  }

  async function resend() {
    setResending(true);
    try {
      await resendCode({ email });
      toast.success("A new code has been sent to your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to resend the code");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout
      title="Verify your account"
      description={`We sent a 6-digit code to ${email}. Enter it below to activate your account.`}
      footer={
        <p>
          Wrong email?{" "}
          <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
            Start again
          </Link>
        </p>
      }
    >
      <div className="grid gap-6">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          inputMode="numeric"
          pattern="[0-9]*"
        >
          <InputOTPGroup className="w-full">
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot key={index} index={index} className="h-12 flex-1 text-base" />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <Button size="lg" onClick={verify} disabled={loading || otp.length < 6}>
          {loading ? "Verifying…" : "Verify account"}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="font-semibold text-primary underline-offset-4 hover:underline disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
