"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { ApiError } from "@/app/lib/api/client";
import { adminLogin, login, updateProfile } from "@/app/lib/api/endpoints";

import {
  clearSession,
  setSessionCookies,
  setStoredUserType,
  setToken,
} from "@/app/lib/api/session";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const schema = z.object({
  to: z.string().trim().min(1, { message: "Enter your email or phone number" }).max(255),
  password: z.string().min(1, { message: "Enter your password" }).max(128),
});

export default function LoginPage() {
  const router = useRouter();
  const [values, setValues] = useState({ to: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
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
    clearSession();

    // Single sign-in page: try the user endpoint first, then fall back to the
    // admin endpoint so admin accounts can use the same form.
    try {
      const response = await login(parsed.data);
      completeSession(response, false, parsed.data.to);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        try {
          const adminResponse = await adminLogin({
            email: parsed.data.to,
            password: parsed.data.password,
          });
          completeSession(adminResponse, true, parsed.data.to);
        } catch (adminError) {
          setLoading(false);
          toast.error(adminError instanceof Error ? adminError.message : "Invalid email or password");
        }
      } else {
        setLoading(false);
        toast.error(error instanceof Error ? error.message : "Unable to log in. Please try again.");
      }
    }
  }

  function completeSession(
    response: { token?: string; userType?: "admin" | "user"; verificationStatus?: boolean },
    isAdmin: boolean,
    loginId?: string,
  ) {
    const token = response.token;
    if (!token) {
      setLoading(false);
      toast.error("Login failed — no session token received. Please try again.");
      return;
    }
    const userType: "admin" | "user" = response.userType === "admin" ? "admin" : isAdmin ? "admin" : "user";

    clearSession();
    setToken(token);
    setStoredUserType(userType);
    setSessionCookies(token, userType);

    const pendingTeam = localStorage.getItem("fp_pending_favourite_team");
    if (pendingTeam) {
      localStorage.removeItem("fp_pending_favourite_team");
      updateProfile({ favouriteTeam: pendingTeam }).catch(() => {});
    }

    toast.success(userType === "admin" ? "Welcome back, admin" : "Welcome back");

    let destination = "/dashboard";
    if (userType === "admin") {
      destination = "/admin";
    } else if (response.verificationStatus !== true) {
      destination = `/verify-account?email=${encodeURIComponent(loginId ?? "")}`;
    }
    router.push(destination);
  }

  return (
    <AuthLayout
      title="Log in"
      description="Pick up where you left off — your matchweek is waiting."
      footer={
        <p>
          New to Fantasy Predict?{" "}
          <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      }
    >

      <form className="grid gap-5" onSubmit={submit} noValidate>
        <div className="grid gap-2">
          <Label htmlFor="to">Email or phone number</Label>
          <Input
            id="to"
            type="text"
            autoComplete="username"
            value={values.to}
            onChange={(e) => setValues((v) => ({ ...v, to: e.target.value }))}
            aria-invalid={!!errors.to}
          />
          {errors.to && <p className="text-xs text-destructive">{errors.to}</p>}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
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
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
