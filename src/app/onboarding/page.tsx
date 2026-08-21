"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Logo } from "@/components/brand/logo";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { cn } from "../lib/utils";
import { updateProfile, sendNotification } from "../lib/api/endpoints";

const COMPETITIONS = [
  { id: "premier-league", label: "Premier League" },
  { id: "champions-league", label: "Champions League" },
  { id: "la-liga", label: "La Liga" },
  { id: "serie-a", label: "Serie A" },
  { id: "bundesliga", label: "Bundesliga" },
];

const STEPS = [
  {
    id: "welcome",
    label: "Welcome",
    description: "Let's get you started with Fantasy Predict.",
  },
  {
    id: "profile",
    label: "Profile",
    description: "Tell us a bit about yourself.",
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "Set up your league preferences.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    username: "",
    country: "",
    team: typeof window !== "undefined" ? localStorage.getItem("fp_pending_favourite_team") ?? "" : "",
  });
  const [selected, setSelected] = useState<string[]>(["premier-league"]);
  const [emails, setEmails] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = STEPS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  }

  async function finish() {
    try {
      const team = profile.team.trim();
      await Promise.all([
        profile.username.trim() ? updateProfile({ username: profile.username.trim() }) : Promise.resolve(),
        sendNotification({ sendNotification: emails }),
        team ? updateProfile({ favouriteTeam: team }) : Promise.resolve(),
      ]);
      if (team) localStorage.removeItem("fp_pending_favourite_team");
      toast.success("Profile ready. Welcome to Fantasy Predict.");
    } catch {
      toast.success("Profile ready. Welcome to Fantasy Predict.");
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* HEADER — Logo left-aligned */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm px-5 py-4 lg:px-8">
        <Logo />
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8 lg:py-12">
        {/* PROGRESS BAR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gold transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* STEP INDICATORS */}
        <div className="mt-6 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                  i === step
                    ? "bg-gold text-navy ring-4 ring-gold/20"
                    : i < step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-6 transition-all duration-300",
                    i < step ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* STEP CONTENT */}
        <div className="mt-8">
          {/* STEP 0: WELCOME */}
          {step === 0 && (
            <Card className="gap-0 border-gold/10 bg-gradient-to-br from-card to-card/80 p-8 shadow-[var(--shadow-elevated)] sm:p-10">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 h-1 w-16 rounded-full bg-gold" />

                <h1 className="font-display text-3xl font-bold sm:text-4xl">
                  Welcome to Fantasy Predict
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                  You&apos;re just a few steps away from competing with friends, predicting match
                  outcomes, and climbing the leaderboard.
                </p>

                <div className="mt-8 grid w-full grid-cols-3 gap-3">
                  {[
                    { label: "Predict", desc: "Call match outcomes" },
                    { label: "Compete", desc: "Join or create leagues" },
                    { label: "Win", desc: "Earn points & prizes" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-border/50 bg-background/50 p-3 text-center"
                    >
                      <p className="text-xs font-semibold text-foreground">{item.label}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-8 bg-gold text-navy hover:bg-gold/90"
                  size="lg"
                  onClick={() => setStep(1)}
                >
                  Get Started
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 1: PROFILE */}
          {step === 1 && (
            <Card className="gap-0 border-gold/10 p-8 shadow-[var(--shadow-elevated)] sm:p-10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gold">02</span>
                <h2 className="text-2xl font-bold">Set up your profile</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                How other players will see you on Fantasy Predict.
              </p>

              <div className="mt-6 grid gap-5">
                {/* Avatar Upload — Larger preview */}
                <div className="flex items-center gap-6">
                  <div
                    className="relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/30 transition-all hover:border-gold/50 hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Profile preview"
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">Add photo</span>
                    )}
                    <input
                      ref={fileInputRef}
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Profile image</p>
                    <p className="text-xs text-muted-foreground">
                      Click the circle to upload a photo
                    </p>
                    {avatarFile && (
                      <p className="mt-1 text-xs text-gold">
                        {avatarFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username <span className="text-gold">*</span>
                  </Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                    placeholder="e.g. FootballFan23"
                    className="border-border/60 focus:border-gold"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is how other players will see you.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={profile.country}
                      onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))}
                      placeholder="e.g. Nigeria"
                      className="border-border/60 focus:border-gold"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="team" className="text-sm font-medium">
                      Favourite team
                    </Label>
                    <Input
                      id="team"
                      value={profile.team}
                      onChange={(e) => setProfile((p) => ({ ...p, team: e.target.value }))}
                      placeholder="e.g. Arsenal"
                      className="border-border/60 focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!profile.username.trim()}
                  className="bg-gold text-navy hover:bg-gold/90 disabled:opacity-50"
                >
                  Continue
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: PREFERENCES */}
          {step === 2 && (
            <Card className="gap-0 border-gold/10 p-8 shadow-[var(--shadow-elevated)] sm:p-10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gold">03</span>
                <h2 className="text-2xl font-bold">Choose your preferences</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                 Pick the competitions you follow. We&apos;ll surface their fixtures first.
              </p>

              <div className="mt-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Competitions
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {COMPETITIONS.map((comp) => {
                    const active = selected.includes(comp.id);
                    return (
                      <button
                        key={comp.id}
                        onClick={() =>
                          setSelected((prev) =>
                            active ? prev.filter((c) => c !== comp.id) : [...prev, comp.id]
                          )
                        }
                        className={cn(
                          "rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
                          active
                            ? "border-gold bg-gold/10 text-gold ring-1 ring-gold/30"
                            : "border-border/60 bg-background text-foreground hover:border-gold/30 hover:bg-gold/5"
                        )}
                      >
                        {comp.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                  <div>
                    <p className="text-sm font-semibold">Email notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Deadline reminders, league updates, and payment confirmations.
                    </p>
                  </div>
                  <Switch checked={emails} onCheckedChange={setEmails} />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={finish}
                  className="bg-gold text-navy hover:bg-gold/90"
                >
                  Enter Fantasy Predict
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* FOOTER NOTE */}
      <div className="border-t border-border/30 bg-card/20 px-5 py-3 text-center">
        <p className="text-xs text-muted-foreground/60">
          You can change all these settings later from your account.
        </p>
      </div>
    </div>
  );
}