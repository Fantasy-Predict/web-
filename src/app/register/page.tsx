"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { register, type RegisterPayload } from "@/app/lib/api/endpoints";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { cn } from "../lib/utils";

const GENDERS = ["Male", "Female", "Other"] as const;

const COUNTRIES = [
  { code: "NG", label: "Nigeria" },
  { code: "GH", label: "Ghana" },
  { code: "KE", label: "Kenya" },
  { code: "EG", label: "Egypt" },
  { code: "ZA", label: "South Africa" },
  { code: "GB", label: "United Kingdom" },
  { code: "US", label: "United States" },
] as const;

const accountSchema = z
  .object({
    email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?\d{7,15}$/, { message: "Enter a valid phone number" }),
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
  const [step, setStep] = useState(0);
  const [account, setAccount] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [profile, setProfile] = useState({
    username: "",
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    favouriteTeam: "",
    countryCode: "NG",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  function next() {
    const parsed = accountSchema.safeParse(account);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setStep(1);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();

    if (profile.dateOfBirth) {
      const dob = new Date(profile.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) {
        toast.error("You must be at least 18 years old to create an account");
        return;
      }
    }

    setLoading(true);

    const payload: RegisterPayload = {
      email: account.email,
      password: account.password,
      phoneNumber: account.phoneNumber,
      username: profile.username.trim() || undefined,
      firstName: profile.firstName.trim() || undefined,
      lastName: profile.lastName.trim() || undefined,
      gender: profile.gender || undefined,
      dateOfBirth: profile.dateOfBirth || undefined,
      countryCode: profile.countryCode || undefined,
    };

    try {
      await register(payload);
      if (profile.favouriteTeam.trim()) {
        localStorage.setItem("fp_pending_favourite_team", profile.favouriteTeam.trim());
      }
      toast.success("Account created. Enter the code we emailed you to verify.");
      router.push(`/verify-account?email=${encodeURIComponent(account.email)}`);
    } catch (error) {
      setLoading(false);
      toast.error(error instanceof Error ? error.message : "Unable to create your account");
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Free to join. Entry fees only apply to pools you choose."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        {["Account", "Profile"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all",
                i === step
                  ? "bg-gold text-navy ring-4 ring-gold/20"
                  : i < step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
            <span className={cn("text-xs font-semibold", i === step ? "text-foreground" : "text-muted-foreground")}>
              {label}
            </span>
            {i === 0 && <span className="h-0.5 w-5 rounded-full bg-muted" />}
          </div>
        ))}
      </div>

      {step === 0 ? (
        <>

          <form className="grid gap-5" onSubmit={next} noValidate>
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={account.email}
              onChange={(e) => setAccount((v) => ({ ...v, email: e.target.value }))}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phoneNumber">Phone number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={account.phoneNumber}
              onChange={(e) => setAccount((v) => ({ ...v, phoneNumber: e.target.value }))}
              placeholder="e.g. +2348012345678"
              aria-invalid={!!errors.phoneNumber}
            />
            {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={show ? "text" : "password"}
                autoComplete="new-password"
                value={account.password}
                onChange={(e) => setAccount((v) => ({ ...v, password: e.target.value }))}
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
              value={account.confirm}
              onChange={(e) => setAccount((v) => ({ ...v, confirm: e.target.value }))}
              aria-invalid={!!errors.confirm}
            />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>
          <div className="grid gap-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={account.terms}
                onCheckedChange={(checked) => setAccount((v) => ({ ...v, terms: checked === true }))}
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
          <Button type="submit" size="lg" disabled={!account.email.trim() || !account.phoneNumber.trim() || !account.password || !account.confirm || !account.terms}>
            Continue
          </Button>
          </form>
        </>
      ) : (
        <form className="grid gap-5" onSubmit={submit} noValidate>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="nickname"
              value={profile.username}
              onChange={(e) => setProfile((v) => ({ ...v, username: e.target.value }))}
              placeholder="e.g. FootballFan23"
            />
            <p className="text-xs text-muted-foreground">Optional — how other players will see you.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                value={profile.firstName}
                onChange={(e) => setProfile((v) => ({ ...v, firstName: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                value={profile.lastName}
                onChange={(e) => setProfile((v) => ({ ...v, lastName: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Gender</Label>
              <Select
                value={profile.gender || undefined}
                onValueChange={(value) => setProfile((v) => ({ ...v, gender: value }))}
              >
                <SelectTrigger aria-label="Gender">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Country</Label>
              <Select
                value={profile.countryCode}
                onValueChange={(value) => setProfile((v) => ({ ...v, countryCode: value }))}
              >
                <SelectTrigger aria-label="Country">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) => setProfile((v) => ({ ...v, dateOfBirth: e.target.value }))}
            />
            {profile.dateOfBirth && (() => {
              const dob = new Date(profile.dateOfBirth);
              const today = new Date();
              let age = today.getFullYear() - dob.getFullYear();
              const m = today.getMonth() - dob.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
              return age < 18 ? <p className="text-xs text-destructive">You must be at least 18 years old</p> : null;
            })()}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="favouriteTeam">Favourite team</Label>
            <Input
              id="favouriteTeam"
              autoComplete="off"
              placeholder="e.g. Arsenal"
              value={profile.favouriteTeam}
              onChange={(e) => setProfile((v) => ({ ...v, favouriteTeam: e.target.value }))}
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button type="submit" size="lg" className="flex-1" disabled={loading || !profile.firstName.trim() || !profile.lastName.trim()}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
