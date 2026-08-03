"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { leaderboard, matches } from "../../app/lib/mock-data";

/* ------------------------------------------------------------------ */
/* Team crest orbit — theme-token driven                               */
/* ------------------------------------------------------------------ */

const TOP_SIX = [
  { code: "ARS", name: "Arsenal" },
  { code: "MCI", name: "Man City" },
  { code: "LIV", name: "Liverpool" },
  { code: "CHE", name: "Chelsea" },
  { code: "MUN", name: "Man United" },
  { code: "TOT", name: "Tottenham" },
];

export function TeamCrestOrbit() {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
      data-aos="zoom-in"
      data-aos-delay="150"
    >
      {TOP_SIX.map((club, i) => (
        <div
          key={club.code}
          data-aos="fade-up"
          data-aos-delay={200 + i * 90}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card/80 text-[11px] font-bold text-primary backdrop-blur-sm sm:h-12 sm:w-12"
          title={club.name}
        >
          {club.code}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero prediction widget — layered stack, theme-token driven          */
/* ------------------------------------------------------------------ */

export function HeroPredictionWidget() {
  const [pick, setPick] = useState<"1" | "X" | "2">("1");
  const match = matches[0];
  if (!match) return null;

  return (
    <div className="relative w-full max-w-xs">
      {/* Back card — depth cue only */}
      <div
        className="absolute inset-x-3 -top-3 h-full rounded-2xl border border-border bg-card/60 backdrop-blur-sm"
        style={{ transform: "rotate(-4deg)" }}
        aria-hidden
      />

      {/* Front card */}
      <div className="relative rounded-2xl border border-border bg-card/95 p-5 shadow-[var(--shadow-elevated)] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
            Matchweek 1
          </span>
          <span className="num text-[10px] text-muted-foreground">Locks in 02:14:09</span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-[11px] font-bold text-foreground">
              {match.home.slice(0, 3).toUpperCase()}
            </div>
            <p className="text-xs font-medium text-foreground">{match.home}</p>
          </div>
          <span className="text-xs text-muted-foreground">vs</span>
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-[11px] font-bold text-foreground">
              {match.away.slice(0, 3).toUpperCase()}
            </div>
            <p className="text-xs font-medium text-foreground">{match.away}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {(["1", "X", "2"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPick(option)}
              className={`rounded-lg border py-2 text-sm font-semibold transition-colors ${pick === option
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-accent"
                }`}
            >
              {option}
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Your pick locks automatically at kickoff
        </p>
      </div>

      {/* Floating accuracy badge */}
      <div className="absolute -right-3 -bottom-3 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-[var(--shadow-card)]">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        94% weekly accuracy
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared countdown hook                                               */
/* ------------------------------------------------------------------ */

/** Premier League 2026/27 opening match: Arsenal vs Coventry City, Fri 21 Aug 2026, 20:00 BST */
export const SEASON_KICKOFF = new Date("2026-08-21T19:00:00Z");

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

function useSeasonCountdown() {
  const [time, setTime] = useState<ReturnType<typeof diff> | null>(null);
  useEffect(() => {
    setTime(diff(SEASON_KICKOFF));
    const id = setInterval(() => setTime(diff(SEASON_KICKOFF)), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function SeasonCountdown() {
  const time = useSeasonCountdown();

  const units: [string, number | undefined][] = [
    ["Days", time?.days],
    ["Hours", time?.hours],
    ["Minutes", time?.minutes],
    ["Seconds", time?.seconds],
  ];

  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto grid gap-10 lg:px-36 px-5 py-16 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-8">
        <div data-aos="fade-up">
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Season countdown</p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Kickoff is 21 August <br /> Arsenal vs Coventry</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Matchweek 1 predictions open two weeks before kickoff. Set up your league now so your room is full and
            paid up before the first whistle.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-3 sm:gap-4" data-aos="zoom-in" data-aos-delay="150">
          {units.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-background px-2 py-5 text-center">
              <p className="num font-display text-3xl font-bold text-primary sm:text-4xl">
                {value === undefined ? "--" : String(value).padStart(2, "0")}
              </p>
              <p className="mt-2 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Small inline countdown chip reused in the closing CTA. */
export function CountdownChip() {
  const time = useSeasonCountdown();
  if (!time) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      <span className="num">
        {time.days}d {String(time.hours).padStart(2, "0")}h {String(time.minutes).padStart(2, "0")}m {String(time.seconds).padStart(2, "0")}s
      </span>
      <span className="text-muted-foreground">to kickoff</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stats strip                                                         */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

const STATS = [
  { target: 24000, suffix: "+", label: "Predictions submitted" },
  { target: 380, suffix: "", label: "Active leagues" },
  { target: 18, prefix: "₦", suffix: "m", label: "Prize pools published" },
  { target: 6, suffix: "", label: "Top-flight clubs tracked" },
];

export function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setInView(true), {
      threshold: 0.4,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-14 sm:grid-cols-4 lg:px-8">
        {STATS.map((stat, i) => (
          <StatItem key={stat.label} {...stat} active={inView} delay={i * 100} />
        ))}
      </div>
    </section>
  );
}

function StatItem({
  target,
  prefix = "",
  suffix = "",
  label,
  active,
  delay,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
  active: boolean;
  delay: number;
}) {
  const value = useCountUp(target, active);
  return (
    <div data-aos="fade-up" data-aos-delay={delay}>
      <p className="num font-display text-3xl font-bold text-primary sm:text-4xl">
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* League tiers                                                        */
/* ------------------------------------------------------------------ */

const TIERS = [
  {
    badge: "Free",
    tag: "Play with friends",
    name: "Free League",
    body: "Create or join a free league with no entry fees. Perfect for friends, office groups, or casual competition.",
    prizePool: "Bragging rights",
    detail: "100+ active leagues",
    cta: "Browse Free Leagues",
    href: "/dashboard/leagues?type=free",
    featured: false,
  },
  {
    badge: "Entry fee applies",
    tag: "Monetized",
    name: "Monetized League",
    body: "Create or join a monetized league with entry fees and real prize pools. Set your own stakes and compete for rewards.",
    prizePool: "You decide",
    detail: "Varies by league",
    cta: "Create Monetized League",
    href: "/dashboard/leagues/create",
    featured: true,
  },
  {
    badge: "Flexible",
    tag: "Custom",
    name: "Create Your Own",
    body: "Choose between Free or Monetized when creating your league. Invite your circle and set your own rules.",
    prizePool: "You decide",
    detail: "Instant invite link",
    cta: "Create League",
    href: "/dashboard/leagues/create",
    featured: false,
  },
];

export function LeagueTiers() {
  return (
    <section className="mx-auto lg:px-36 px-5 py-20 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4" data-aos="fade-up">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">Choose How You Want to Play</h2>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            Fantasy Predict is free to join. Once inside, you can browse free leagues, join monetized
            public leagues, or create your own private league with custom entry fees.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {TIERS.map((tier, i) => (
          <Card
            key={tier.name}
            data-aos="fade-up"
            data-aos-delay={i * 120}
            className={`gap-0 p-7 shadow-[var(--shadow-card)] ${tier.featured ? "border-primary ring-1 ring-primary/30" : ""
              }`}
          >
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-border text-muted-foreground">
                {tier.badge}
              </Badge>
              <span className="text-[11px] font-semibold tracking-[0.1em] text-primary uppercase">{tier.tag}</span>
            </div>
            <h3 className="mt-5 text-lg font-semibold">{tier.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tier.body}</p>
            <div className="mt-6 flex items-end justify-between border-t border-border pt-5">
              <div>
                <p className="text-[11px] tracking-[0.1em] text-muted-foreground uppercase">Prize pool</p>
                <p className="num text-lg font-bold text-primary">{tier.prizePool}</p>
              </div>
              <p className="text-xs text-muted-foreground">{tier.detail}</p>
            </div>
            <Button asChild className="mt-6" variant={tier.featured ? "default" : "outline"}>
              <Link href={tier.href}>{tier.cta}</Link>
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Top players                                                         */
/* ------------------------------------------------------------------ */

export function TopPlayersChart() {
  const top = [...leaderboard].sort((a, b) => b.total - a.total).slice(0, 8);
  const max = top[0]?.total ?? 1;

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4" data-aos="fade-up">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">Top players right now</h2>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            Live season standings across every public league. Points come from correct outcomes, exact scores and
            streak bonuses.
          </p>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary">
          Updated after every matchweek
        </Badge>
      </div>

      <Card
        className="mt-8 gap-0 divide-y divide-border p-0 shadow-[var(--shadow-card)]"
        data-aos="fade-up"
        data-aos-delay="150"
      >
        {top.map((row, index) => (
          <div
            key={row.id}
            className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:grid-cols-[2.5rem_10rem_minmax(0,1fr)_5rem]"
          >
            <span className={`num text-sm font-bold ${index === 0 ? "text-primary" : "text-muted-foreground"}`}>
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{row.username}</p>
              <p className="text-xs text-muted-foreground">{row.country}</p>
            </div>
            <div className="hidden h-2.5 overflow-hidden rounded-full bg-muted sm:block">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((row.total / max) * 100)}%` }} />
            </div>
            <span className="num text-right text-sm font-bold">{row.total.toLocaleString()}</span>
          </div>
        ))}
      </Card>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Apps coming soon                                                     */
/* ------------------------------------------------------------------ */

export function AppsComingSoon() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto grid lg:px-36 px-5 gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8">
        <div data-aos="fade-up">
          <Badge variant="outline" className="border-primary/40 text-primary">
            Coming soon
          </Badge>
          <h2 className="mt-5 text-3xl font-bold sm:text-4xl">Fantasy Predict on iOS and Android</h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Native apps land ahead of the new season with kickoff reminders, one-tap predictions, live score push
            notifications and instant wallet top-ups. Everything syncs with the web app.
          </p>
          <ul className="mt-6 grid gap-2 text-sm text-muted-foreground">
            {[
              "Deadline reminders before every matchweek locks",
              "Live points as goals go in",
              "Offline prediction drafts that sync when you reconnect",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-primary">•</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            {["App Store", "Google Play"].map((store) => (
              <div key={store} className="flex items-center gap-3 rounded-xl border border-border bg-background px-5 py-3">
                <div>
                  <p className="text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Soon on</p>
                  <p className="text-sm font-semibold">{store}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="justify-self-center" data-aos="zoom-in" data-aos-delay="150">
          <div className="w-88 rounded-[2.2rem] border-8 border-foreground/10 bg-card p-4 shadow-[var(--shadow-card)]">
            {/* Placeholder brand mark — swap for real in-app screens once the designer sends them */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-navy p-6">
              <div className="flex flex-col items-center">
                {/* ICON - small, at top */}
                <Image src="/icons-white.png" alt="Fantasy Predict icon" width={40} height={40} className="opacity-95" />
                {/* Small gap between icon and logo */}
                <div className="h-2"></div>
                {/* LOGO - big, below icon */}
                <Image src="/logos-white.png" alt="Fantasy Predict" width={254} height={161} />
                {/* App preview text - below logo */}
                <p className="mt-4 text-[10px] tracking-[0.16em] text-navy-foreground/60 uppercase">
                  App preview coming soon
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {["Wallet ₦42,500", "Rank #128", "Weekly points 96"].map((line) => (
                <div key={line} className="rounded-lg border border-border px-3 py-2 text-xs font-medium">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}