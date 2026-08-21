"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { forgotPassword } from "@/app/lib/api/endpoints";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const schema = z.string().trim().email({ message: "Enter a valid email address" }).max(255);

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await forgotPassword({ email: parsed.data });
      toast.success("We've sent you a reset code");
      router.push(`/reset-password?email=${encodeURIComponent(parsed.data)}`);
    } catch (err) {
      setLoading(false);
      toast.error(err instanceof Error ? err.message : "Unable to send the code");
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter the email on your account and we'll send a reset code."
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Back to log in
          </Link>
        </p>
      }
    >
      <form className="grid gap-5" onSubmit={submit} noValidate>
        <div className="grid gap-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <Button type="submit" size="lg" disabled={loading || !email.trim()}>
          {loading ? "Sending code…" : "Send reset code"}
        </Button>
      </form>
    </AuthLayout>
  );
}
