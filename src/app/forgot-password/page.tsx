"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { z } from "zod";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../..//components/ui/label";
import { Card } from "../../components/ui/card";

const schema = z.string().trim().email({ message: "Enter a valid email address" }).max(255);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    setLoading(true);
    // Backend integration point: POST /auth/forgot-password
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 700);
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter the email on your account and we'll send a reset link."
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Back to log in
          </Link>
        </p>
      }
    >
      {sent ? (
        <Card className="gap-0 border-success/40 bg-success/10 p-6">
          <h2 className="text-base font-semibold">Check your inbox</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for {email}, a reset link is on its way. The link expires in 30
            minutes.
          </p>
        </Card>
      ) : (
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
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Sending link…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}