"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, Pencil, Trophy, Zap, Users, Star, ArrowRight, Shield, Swords, Gift, RefreshCw, Clock, TrendingUp, Mail } from "lucide-react";
import { Logo } from "@/components/brand/logo";

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.95]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

const POINTS_TABLE = [
  { event: "Playing 60+ minutes", pts: "+2" },
  { event: "Playing up to 60 minutes", pts: "+1" },
  { event: "Goal scored (Goalkeeper / Defender)", pts: "+6" },
  { event: "Goal scored (Midfielder)", pts: "+5" },
  { event: "Goal scored (Forward)", pts: "+4" },
  { event: "Assist", pts: "+3" },
  { event: "Clean sheet (Goalkeeper / Defender)", pts: "+4" },
  { event: "Clean sheet (Midfielder)", pts: "+1" },
  { event: "Bonus points (top performers)", pts: "+1–3" },
  { event: "Yellow card", pts: "−1" },
  { event: "Red card", pts: "−3" },
  { event: "Own goal", pts: "−2" },
];

const CHIPS = [
  {
    icon: <RefreshCw className="h-5 w-5" />,
    name: "Wildcard",
    desc: "Make unlimited free transfers in one gameweek. The new squad is permanent.",
  },
  {
    icon: <Star className="h-5 w-5" />,
    name: "Triple Captain",
    desc: "Your captain's points are tripled instead of doubled for one gameweek.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    name: "Bench Boost",
    desc: "All 15 players score points, not just your starting 11, for one gameweek.",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    name: "Free Hit",
    desc: "Unlimited free transfers for one gameweek. Your squad reverts back afterwards.",
  },
];

export default function FplGuidePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-md bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-gold">
              FPL GUIDE
            </span>
          </div>
          <Link
            href="/fpl/setup"
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-24">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="py-16 text-center sm:py-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-sm font-semibold text-gold">
              ✦ Fantasy XI — Everything You Need to Know
            </span>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Your complete guide to
              <br />
              <span className="text-gold">Fantasy XI</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Pick 15 real Premier League players, earn points from their real performances,
              and compete with friends in private leagues — all from inside the FantasyPredict app.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/fpl/setup"
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90"
              >
                Set Up My Team <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/fpl"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Go to My Dashboard
              </Link>
            </div>
          </Reveal>

          {/* Stats row */}
          <div className="mt-14 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card">
            {[
              { value: "15", label: "Players per squad" },
              { value: "38", label: "Gameweeks in a season" },
              { value: "90%", label: "Prize pool to winners" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={150 + i * 80}>
                <div className="py-5 text-center">
                  <div className="text-2xl font-extrabold text-gold sm:text-3xl">{s.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Getting Started ──────────────────────────────── */}
        <Section label="Step 1" title="Getting Started — Two Ways to Join">
          <p className="mt-3 text-muted-foreground">
            Every Fantasy XI player goes through a one-time setup. After that, you are in for the entire season.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Reveal delay={0}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-gold/30 bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15">
                  <Download className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Import from Official FPL</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Already play on the official Fantasy Premier League site? Enter your FPL Team ID and your squad is copied into our platform instantly as your starting point.
                  </p>
                  <p className="mt-3 rounded-lg bg-gold/10 p-3 text-sm text-gold">
                    <strong>Budget note:</strong> You will not get a fresh £100m. Your actual remaining balance from the official game is carried over — so your budget here matches exactly what you have there.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-primary/30 bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Pencil className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Build From Scratch</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    New to fantasy football entirely? Browse all 500+ Premier League players and build your own 15-player dream squad from scratch.
                  </p>
                  <p className="mt-3 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                    <strong>Starting budget:</strong> You get the full £100 million to spend across your 15-player squad.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </Section>

        <Divider />

        {/* ── Building a Squad ─────────────────────────────── */}
        <Section label="Step 2" title="Building Your Squad of 15">
          <p className="mt-3 text-muted-foreground">
            Every squad has exactly 15 players across four positions. These are the rules you must stay within.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { pos: "GK", count: 2, color: "gold", bg: "bg-gold/15", text: "text-gold", label: "Goalkeepers" },
              { pos: "DEF", count: 5, color: "primary", bg: "bg-primary/10", text: "text-primary", label: "Defenders" },
              { pos: "MID", count: 5, color: "primary", bg: "bg-primary/10", text: "text-primary", label: "Midfielders" },
              { pos: "FWD", count: 3, color: "gold", bg: "bg-gold/15", text: "text-gold", label: "Forwards" },
            ].map((p, i) => (
              <Reveal key={p.pos} delay={i * 80}>
                <div className={`rounded-2xl border border-border ${p.bg} p-5 text-center`}>
                  <div className={`text-3xl font-black ${p.text}`}>{p.count}</div>
                  <div className={`mt-1 rounded-md px-2 py-0.5 text-xs font-bold tracking-wider ${p.bg} ${p.text} inline-block`}>
                    {p.pos}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{p.label}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Reveal>
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-lg font-black text-gold">
                  £
                </div>
                <div>
                  <div className="font-semibold">£100 Million Budget</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    The combined value of your 15 players cannot exceed £100m. Prices reflect real-world player performance.
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-black text-primary">
                  3
                </div>
                <div>
                  <div className="font-semibold">Maximum 3 Per Club</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    You cannot pick more than 3 players from the same Premier League club in your squad of 15.
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Section>

        <Divider />

        {/* ── Weekly Picks ─────────────────────────────────── */}
        <Section label="Step 3" title="Setting Your Picks Every Gameweek">
          <p className="mt-3 text-muted-foreground">
            Before each gameweek deadline, you choose which 11 of your 15 players will start, pick a formation, and assign a captain.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: <Users className="h-5 w-5 text-gold" />,
                bg: "bg-gold/15",
                title: "Starting 11",
                desc: "Pick exactly 11 from your 15 to start. The other 4 sit on the bench as backup in case a starter does not play.",
              },
              {
                icon: <Shield className="h-5 w-5 text-primary" />,
                bg: "bg-primary/10",
                title: "Formation",
                desc: "Choose from 7 formations: 4-4-2, 4-3-3, 4-5-1, 3-5-2, 3-4-3, 5-4-1, or 5-3-2. Your picks page shows your squad arranged on a visual pitch.",
              },
              {
                icon: <Star className="h-5 w-5 text-gold" />,
                bg: "bg-gold/15",
                title: "Captain",
                desc: "Pick a captain and a vice-captain. The captain's points are doubled that week. If the captain does not play, the vice-captain gets the double instead.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 100}>
                <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="mt-5 flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15">
                <Clock className="h-5 w-5 text-gold" />
              </div>
              <div>
                <div className="font-semibold">The Deadline</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Each gameweek has a deadline — usually 1–2 hours before the first match kicks off. Once the deadline passes, all picks lock and no changes are allowed while matches are being played. This is a core part of what makes it a game of skill: you commit your decisions before the action starts.
                </div>
              </div>
            </div>
          </Reveal>
        </Section>

        <Divider />

        {/* ── Points ───────────────────────────────────────── */}
        <Section label="How It Works" title="How Points Are Earned">
          <p className="mt-3 text-muted-foreground">
            Our platform pulls player scores automatically from the official Premier League data feed after each match. If a player earned 12 points on the official game that week, they earn 12 points on ours too — same source.
          </p>

          <Reveal delay={100}>
            <div className="mt-8 overflow-hidden rounded-2xl border border-border">
              <div className="grid grid-cols-[1fr_auto] border-b border-border bg-muted/50 px-5 py-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Points</div>
              </div>
              {POINTS_TABLE.map((row, i) => (
                <div
                  key={row.event}
                  className={`grid grid-cols-[1fr_auto] px-5 py-3 ${
                    i < POINTS_TABLE.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="text-sm">{row.event}</div>
                  <div
                    className={`text-sm font-bold tabular-nums ${
                      row.pts.startsWith("−") ? "text-destructive" : "text-gold"
                    }`}
                  >
                    {row.pts}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-4 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
              Scores update automatically every 15 minutes while matches are being played — so you can watch your points tick up in real time as the action unfolds.
            </div>
          </Reveal>
        </Section>

        <Divider />

        {/* ── Transfers ────────────────────────────────────── */}
        <Section label="Transfers" title="Changing Your Squad Each Week">
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              {
                val: "1",
                label: "Free transfer per gameweek",
                desc: "Every gameweek you get one free swap — bring in any player who fits your budget and position.",
                color: "text-gold",
                bg: "bg-gold/15",
              },
              {
                val: "−4",
                label: "Points per extra transfer",
                desc: "Make more than one transfer in a week? Each additional one costs 4 points from your gameweek score.",
                color: "text-destructive",
                bg: "bg-destructive/10",
              },
              {
                val: "2",
                label: "Maximum you can carry over",
                desc: "If you do not use your free transfer, it rolls over to next week. You can save at most 2 at a time — it does not stack further.",
                color: "text-primary",
                bg: "bg-primary/10",
              },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 100}>
                <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5">
                  <div className={`text-3xl font-black ${item.color}`}>{item.val}</div>
                  <div>
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ── Chips ────────────────────────────────────────── */}
        <Section label="Chips" title="Special Powers — Use Each Once Per Season">
          <p className="mt-3 text-muted-foreground">
            Every manager gets four chips. Each can be used only once across the entire season — choose your moment wisely.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {CHIPS.map((chip, i) => (
              <Reveal key={chip.name} delay={i * 80}>
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    {chip.icon}
                  </div>
                  <div>
                    <div className="font-semibold">{chip.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{chip.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ── Leagues ──────────────────────────────────────── */}
        <Section label="Leagues" title="Competing With Others">
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Reveal>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Classic League</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Members are ranked by their total accumulated points across the season. Whoever has the most points at the end wins. Simple and straightforward.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15">
                  <Swords className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold">Head-to-Head League</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Each gameweek, you are paired against one other member. The person with more points that week wins the matchup. Wins, draws, and losses determine the final standings — not raw points totals.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* How to create/join */}
          <Reveal delay={150}>
            <div className="mt-5 rounded-2xl border border-border bg-card p-6">
              <h3 className="font-semibold">How to Create or Join a League</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { step: "01", text: "Any user creates a league — give it a name, pick Classic or H2H." },
                  { step: "02", text: "The platform generates a unique invite code. Share it via WhatsApp, DM, or any channel." },
                  { step: "03", text: "Friends open the app, go to Leagues → Join, paste the code, and they are in." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3">
                    <div className="shrink-0 font-black text-gold opacity-60">{s.step}</div>
                    <div className="text-sm text-muted-foreground">{s.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Paid leagues */}
          <Reveal delay={200}>
            <div className="mt-5 flex items-start gap-4 rounded-2xl border border-gold/30 bg-gold/5 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15">
                <Trophy className="h-5 w-5 text-gold" />
              </div>
              <div>
                <div className="font-semibold text-gold">Paid Leagues</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Leagues can have an entry fee drawn from your NGN wallet — the same one you use for prediction pools. 90% of all fees go into the prize pool. The platform retains 10%. Paid league launch timing will be announced separately.
                </div>
              </div>
            </div>
          </Reveal>
        </Section>

        <Divider />

        {/* ── Automation ───────────────────────────────────── */}
        <Section label="Automated" title="What Runs Without You Doing Anything">
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <TrendingUp className="h-5 w-5 text-gold" />,
                bg: "bg-gold/15",
                title: "Live Scores",
                desc: "During an active gameweek, player scores update automatically every 15 minutes. You watch your team total rise in real time.",
              },
              {
                icon: <RefreshCw className="h-5 w-5 text-primary" />,
                bg: "bg-primary/10",
                title: "Data Sync",
                desc: "Player data, prices, and gameweek information sync automatically from the official Premier League data feed every day. No manual work needed.",
              },
              {
                icon: <Mail className="h-5 w-5 text-gold" />,
                bg: "bg-gold/15",
                title: "Deadline Reminders",
                desc: "24 hours before each gameweek deadline, every Fantasy XI user gets an email reminder — including whether their picks are already saved.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ── Two platforms explainer ──────────────────────── */}
        <Section label="Important" title="Two Completely Separate Games">
          <Reveal delay={100}>
            <div className="mt-6 rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                FantasyPredict and the official Fantasy Premier League site are two independent games. The only thing shared between them is the underlying player score data, which we read from the Premier League's public data feed. Your picks on our platform have zero effect on your official FPL account, and vice versa. If you import your squad and then make different captain choices here vs. on the official site, you will get different scores on each platform — they diverge permanently the moment any decision differs.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/50 p-4">
                  <div className="text-sm font-semibold text-gold">FantasyPredict Rank</div>
                  <div className="mt-1 text-sm text-muted-foreground">Based on what you do on our platform, among all our users. We calculate and control this.</div>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <div className="text-sm font-semibold text-primary">Official FPL Rank</div>
                  <div className="mt-1 text-sm text-muted-foreground">Based on what you do on the official Premier League site, among millions of players. We display it as a reference — we have no influence over it.</div>
                </div>
              </div>
            </div>
          </Reveal>
        </Section>

        <Divider />

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="py-16 text-center">
          <Reveal>
            <div className="rounded-2xl border border-gold/30 bg-gold/5 px-8 py-12">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/20 mb-4">
                <Gift className="h-7 w-7 text-gold" />
              </div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">Ready to play?</h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Setup takes under 2 minutes. Import your existing squad or build from scratch — then compete in your first league.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/fpl/setup"
                  className="inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3 font-semibold text-black transition-opacity hover:opacity-90"
                >
                  Set Up My Team <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/fpl"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-7 py-3 font-semibold transition-colors hover:bg-muted"
                >
                  My Dashboard
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
}

function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-12">
      <Reveal>
        <div className="mb-1 text-xs font-bold uppercase tracking-widest text-gold">{label}</div>
        <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
      </Reveal>
      {children}
    </section>
  );
}

function Divider() {
  return <div className="h-px w-full bg-border" />;
}
