"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { resetPassword } from "@/app/lib/api/endpoints";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../../components/ui/input-otp";

const passwordSchema = z
  .string()
  .min(8, { message: "Use at least 8 characters" })
  .max(128);

export default function ResetPasswordPage() {
  return (  
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (otp.length < 6) {
      setError("Enter the 6-digit code from your email");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword({ email, otp, password: parsed.data });
      toast.success("Password reset. Log in with your new password.");
      router.push("/login");
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Unable to reset your password");
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      description={`Enter the 6-digit code sent to ${email || "your email"} and choose a new password.`}
      footer={
        <p>
          Back to{" "}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            log in
          </Link>
        </p>
      }
    >
      <div className="grid gap-6">
        <InputOTP maxLength={6} value={otp} onChange={setOtp} inputMode="numeric" pattern="[0-9]*">
          <InputOTPGroup className="w-full">
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot key={index} index={index} className="h-12 flex-1 text-base" />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <div className="grid gap-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button size="lg" onClick={submit} disabled={loading || otp.length < 6 || !password || !confirm}>
          {loading ? "Resetting…" : "Reset password"}
        </Button>
      </div>
    </AuthLayout>
  );
}
