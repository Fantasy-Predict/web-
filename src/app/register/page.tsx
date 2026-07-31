"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthDivider, AuthLayout, GoogleButton } from "@/components/layout/auth-layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";

const schema = z
  .object({
    email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
    password: z.string().min(8, { message: "Use at least 8 characters" }).max(128),
    confirm: z.string(),
    terms: z.boolean(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  })
  .refine((data) => data.terms, {
    message: "You must accept the terms to continue",
    path: ["terms"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "", confirm: "", terms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    // Backend integration point: POST /auth/register
    setTimeout(() => {
      setLoading(false);
      toast.success("Account created. Check your email to verify.");
      router.push("/onboarding");
    }, 700);
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Free to join. Entry fees only apply to leagues you choose."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <GoogleButton label="Sign up with Google" />
      <AuthDivider />
      <form className="grid gap-5" onSubmit={submit} noValidate>
        <div className="grid gap-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
              aria-invalid={!!errors.password}
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
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={values.confirm}
            onChange={(e) => setValues((v) => ({ ...v, confirm: e.target.value }))}
            aria-invalid={!!errors.confirm}
          />
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
        </div>
        <div className="grid gap-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={values.terms}
              onCheckedChange={(checked) => setValues((v) => ({ ...v, terms: checked === true }))}
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed font-normal">
              I am 18 or older and accept the{" "}
              <Link href="/terms" className="font-semibold text-primary underline-offset-4 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-primary underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
              .
            </Label>
          </div>
          {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}
        </div>
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}