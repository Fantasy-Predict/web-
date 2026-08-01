"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ============================================================
// DATA
// ============================================================

const STORIES = [
  {
    year: "2024",
    title: "The Idea",
    body: "Fantasy Predict was born from late-night football conversations — a group of friends arguing about who really knows the game best.",
  },
  {
    year: "2025",
    title: "Building the Platform",
    body: "A small team of designers and engineers began crafting a prediction experience that puts transparency and fairness at the center.",
  },
  {
    year: "Early 2026",
    title: "Beta Launch",
    body: "A limited group of football fans tested the platform, providing feedback that shaped the scoring system and league mechanics.",
  },
  {
    year: "Mid 2026",
    title: "Community Growth",
    body: "Word spread. Leagues formed organically. Friends invited friends. The competition became real.",
  },
  {
    year: "2026 & Beyond",
    title: "The Future",
    body: "With a growing community, we're building mobile apps, real-time notifications, and deeper match experiences.",
  },
];

const MISSION_VISION = [
  {
    title: "Our Mission",
    description:
      "To create the most engaging football prediction experience where fans can compete, connect, and showcase their football knowledge.",
  },
  {
    title: "Our Vision",
    description:
      "To become the leading football prediction community where every match creates an opportunity to compete.",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Create Your Account", body: "Create your profile and enter the Fantasy Predict community." },
  { step: "02", title: "Join or Create a League", body: "Compete privately with friends or join public competitions." },
  { step: "03", title: "Make Your Predictions", body: "Predict match outcomes before deadlines." },
  { step: "04", title: "Earn Points", body: "Get rewarded for accurate predictions." },
  { step: "05", title: "Climb The Leaderboard", body: "Track your performance throughout the season." },
];

const DIFFERENTIATORS = [
  {
    title: "Competitive Experience",
    body: "Compete against friends and football fans worldwide.",
  },
  {
    title: "Transparent Scoring",
    body: "Clear rules and visible rankings.",
  },
  {
    title: "Real Football Data",
    body: "Predictions powered by live football information.",
  },
  {
    title: "Community Driven",
    body: "Football is better when shared.",
  },
];

const TRUST_SIGNALS = [
  {
    title: "Transparent Rankings",
    body: "Everyone competes under the same scoring system.",
  },
  {
    title: "Clear Prize Distribution",
    body: "League rewards are visible before participation.",
  },
  {
    title: "Secure Payments",
    body: "Payments handled through trusted payment systems.",
  },
  {
    title: "Responsible Competition",
    body: "Focused on football knowledge and skill.",
  },
];

const STATS = [
  { value: "100+", label: "Active Leagues" },
  { value: "2,000+", label: "Active Players" },
  { value: "50,000+", label: "Predictions Submitted" },
];

// ============================================================
// CLIENT COMPONENT
// ============================================================

export default function AboutClient() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-primary/20">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, var(--gold) 1px, transparent 1px),
                               radial-gradient(circle at 80% 30%, var(--primary) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center lg:py-32 lg:px-8">
          <Badge variant="outline" className="border-gold/40 text-gold">About Fantasy Predict</Badge>
          <h1 className="mt-6 font-display text-4xl font-bold text-white sm:text-5xl">
            Where Football Knowledge <br /> Meets Competition.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base leading-relaxed text-white/70">
            Fantasy Predict brings football fans together to test their knowledge, compete with friends,
            and climb the leaderboard through strategic match predictions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90">
              <Link href="/dashboard/leagues/create">Create Your League</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Link href="/dashboard/leagues">Start Predicting</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* OUR STORY — 5-step timeline */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-5 py-20 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Our Journey</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">The Story Behind Fantasy Predict</h2>
          </div>
          <div className="mt-14 relative">
            <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gold/20" />
            {STORIES.map((story, index) => (
              <div
                key={story.year}
                className={`relative flex flex-col items-center gap-4 pb-14 last:pb-0 ${
                  index % 2 === 0 ? 'lg:flex-row lg:items-start lg:gap-8' : 'lg:flex-row-reverse lg:items-start lg:gap-8'
                }`}
                data-aos="fade-up"
                data-aos-delay={index * 120}
              >
                <div className="absolute left-1/2 top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-gold bg-background lg:static lg:translate-x-0" />
                <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-8 lg:text-right' : 'lg:pl-8 lg:text-left'}`}>
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                    <span className="text-xs font-bold tracking-[0.18em] text-gold uppercase">{story.year}</span>
                    <h3 className="mt-2 text-lg font-semibold">{story.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{story.body}</p>
                  </div>
                </div>
                <div className="hidden lg:block lg:w-5/12" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <div className="text-center" data-aos="fade-up">
          <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Our Purpose</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Mission &amp; Vision</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {MISSION_VISION.map((item, i) => (
            <Card
              key={item.title}
              className="gap-0 border-primary/20 bg-card p-8 shadow-[var(--shadow-card)] text-center"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Getting Started</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">How Fantasy Predict Works</h2>
            <p className="mt-4 max-w-2xl mx-auto text-sm text-muted-foreground">
              Five simple steps to start competing and proving your football knowledge.
            </p>
          </div>
          <ol className="mt-12 mx-auto max-w-2xl space-y-4">
            {HOW_IT_WORKS.map((step, i) => (
              <li
                key={step.step}
                className="flex items-start gap-5 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
                data-aos="fade-up"
                data-aos-delay={i * 80}
              >
                <span className="font-display text-2xl font-bold text-gold">{step.step}</span>
                <div>
                  <h3 className="text-base font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* WHAT MAKES US DIFFERENT */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <div className="text-center" data-aos="fade-up">
          <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Why Choose Us</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">What Makes Us Different</h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm text-muted-foreground">
            Fantasy Predict is built differently — with transparency, community, and real football at its core.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {DIFFERENTIATORS.map((item, i) => (
            <Card
              key={item.title}
              className="gap-0 border-l-4 border-l-gold p-7 shadow-[var(--shadow-card)]"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* TRUST & FAIR PLAY */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Trust &amp; Fair Play</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Built Around Fair Competition</h2>
            <p className="mt-4 max-w-2xl mx-auto text-sm text-muted-foreground">
              Every league, every prediction, and every prize follows the same transparent rules.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_SIGNALS.map((item, i) => (
              <Card
                key={item.title}
                className="gap-0 bg-card p-7 shadow-[var(--shadow-card)] text-center"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">✓</div>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/2744040/pexels-photo-2744040.jpeg?auto=compress&cs=tinysrgb&w=2000"
          alt="Football stadium pitch with green grass and stands"
          fill
          className="-z-10 object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Join the Community</p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            Every Match Creates A New Opportunity
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm leading-relaxed text-white/70">
            Thousands of fans are already competing. Every matchweek brings new challenges, new rivalries,
            and new chances to prove your football knowledge.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-bold text-gold">{stat.value}</p>
                <p className="text-xs text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUTURE VISION */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div data-aos="fade-up">
              <Badge variant="outline" className="border-primary/40 text-primary">Coming soon</Badge>
              <h2 className="mt-5 text-3xl font-bold sm:text-4xl">The Future Of Fantasy Predict</h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Fantasy Predict is continuously evolving, with upcoming mobile experiences designed to
                make predictions, rankings, and match updates even more accessible.
              </p>
              <ul className="mt-6 grid gap-2 text-sm text-muted-foreground">
                {[
                  "Native mobile apps for iOS and Android",
                  "Real-time push notifications for match updates",
                  "Enhanced match experiences with live stats",
                  "Offline prediction drafts that sync when you reconnect",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-gold">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="justify-self-center" data-aos="zoom-in" data-aos-delay="150">
              <div className="w-88 rounded-[2.2rem] border-8 border-foreground/10 bg-card p-4 shadow-[var(--shadow-card)]">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-navy p-6">
                  <div className="flex flex-col items-center">
                    <Image src="/icons-white.png" alt="Fantasy Predict icon" width={40} height={40} className="opacity-95" />
                    <div className="h-2" />
                    <Image src="/logos-white.png" alt="Fantasy Predict" width={254} height={161} />
                    <p className="mt-4 text-[10px] tracking-[0.16em] text-navy-foreground/60 uppercase">
                      Mobile app coming soon
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
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <Card
          className="items-center gap-0 border-gold/30 bg-card p-10 text-center sm:p-14"
          data-aos="zoom-in"
        >
          <h2 className="max-w-xl mx-auto text-3xl font-bold sm:text-4xl">
            Ready To Prove Your Football Knowledge?
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-sm leading-relaxed text-muted-foreground">
            Join thousands of fans already competing. Create your league or join an existing one today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90">
              <Link href="/dashboard/leagues/create">Create Your League</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard/leagues">Join A League</Link>
            </Button>
          </div>
        </Card>
      </section>
    </>
  );
}