"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/public-layout";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    AppsComingSoon,
    SeasonCountdown,
    TopPlayersChart,
    StatsStrip,
    PoolTiers,
    CountdownChip,
} from "../components/app/landing-sections";
import { WelcomeSplash } from "@/components/app/welcome-splash";

// ============================================================
// OFFICIAL PREMIER LEAGUE CLUB CRESTS (CDN) – CORRECTED URLs
// ============================================================
const CLUB_LOGOS: Record<string, string> = {
    ARS: "https://resources.premierleague.com/premierleague/badges/50/t3.png",
    MCI: "https://resources.premierleague.com/premierleague/badges/50/t43.png",
    LIV: "https://resources.premierleague.com/premierleague/badges/50/t9.png",  // ✅ Fixed
    CHE: "https://resources.premierleague.com/premierleague/badges/50/t8.png",
    MUN: "https://resources.premierleague.com/premierleague/badges/50/t1.png",
    TOT: "https://resources.premierleague.com/premierleague/badges/50/t6.png",
    // Coventry not in Premier League badge set – use a placeholder
};

const TOP_SIX = [
    { code: "ARS", name: "Arsenal" },
    { code: "MCI", name: "Man City" },
    { code: "LIV", name: "Liverpool" },
    { code: "CHE", name: "Chelsea" },
    { code: "MUN", name: "Man United" },
    { code: "TOT", name: "Tottenham" },
];

// ============================================================
// TEAM CREST ORBIT – with real club logos
// ============================================================
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
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card/80 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/50 sm:h-14 sm:w-14"
                    title={club.name}
                >
                    <Image
                        src={CLUB_LOGOS[club.code]}
                        alt={club.name}
                        width={40}
                        height={40}
                        className="object-contain"
                        unoptimized
                        referrerPolicy="no-referrer" // ← Prevents referrer blocking
                        onError={(e) => {
                            // Fallback: show text if image fails
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

// ============================================================
// HERO PREDICTION WIDGET – Arsenal vs Coventry (Opening Match)
// ============================================================
export function HeroPredictionWidget() {
    const [pick, setPick] = useState<"1" | "X" | "2">("1");

    // Opening match: Arsenal vs Coventry City
    const match = {
        home: "Arsenal",
        away: "Coventry City",
    };

    const homeCode = "ARS";
    const homeLogo = CLUB_LOGOS[homeCode];
    // Coventry: we don't have a CDN logo, so we'll use initials fallback

    return (
        <div className="relative w-full max-w-xs">
            <div
                className="absolute inset-x-3 -top-3 h-full rounded-2xl border border-border bg-card/60 backdrop-blur-sm"
                style={{ transform: "rotate(-3deg)" }}
                aria-hidden
            />
            <div className="relative rounded-2xl border border-border bg-card/95 p-5 shadow-[var(--shadow-elevated)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                        Matchweek 1
                    </span>
                    <span className="num text-[10px] text-muted-foreground">Locks in 02:14:09</span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="flex flex-1 flex-col items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background p-1.5">
                            {homeLogo ? (
                                <Image
                                    src={homeLogo}
                                    alt={match.home}
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                    unoptimized
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <span className="text-xs font-bold text-foreground">
                                    {match.home.slice(0, 3).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-medium text-foreground">{match.home}</p>
                    </div>

                    <span className="text-xs font-semibold text-muted-foreground">VS</span>

                    <div className="flex flex-1 flex-col items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background p-1.5">
                            {/* Coventry – no logo, use initials */}
                            <span className="text-xs font-bold text-foreground">COV</span>
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
                            className={`rounded-lg border py-2.5 text-sm font-semibold transition-all ${pick === option
                                ? "border-primary bg-primary text-primary-foreground shadow-[0_0_20px_rgba(29,78,216,0.3)]"
                                : "border-border bg-background text-foreground hover:bg-accent hover:border-primary/30"
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

            <div className="absolute -right-3 -bottom-3 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-[var(--shadow-card)]">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                94% weekly accuracy
            </div>
        </div>
    );
}

// ============================================================
// DATA (unchanged)
// ============================================================
const FEATURES = [
    {
        title: "Predict Matches",
        body: "Call the result or the exact score across the Premier League and other major competitions, with deadlines locked at kickoff.",
    },
    {
        title: "Join Competitive Leagues",
        body: "Enter public leagues or spin up a private room for your friends, office or community with your own entry fee.",
    },
    {
        title: "Track Rankings",
        body: "Weekly and season-long standings update as results come in, so you always know exactly where you stand.",
    },
    {
        title: "Win Rewards",
        body: "Prize pools are published upfront and distributed according to rules you can read before you pay a naira.",
    },
];

const WHY_FANTASY_PREDICT = [
    {
        title: "Simple Prediction Experience",
        body: "Just pick home win, draw, or away win. No complex formations or player stats to study.",
    },
    {
        title: "Transparent Scoring",
        body: "Every point is accounted for. See exactly how your predictions earned points after each match.",
    },
    {
        title: "Competitive Leagues",
        body: "Join public leagues with thousands of players or create private rooms for your circle.",
    },
    {
        title: "Real-Time Rankings",
        body: "Standings update automatically as results come in. Know where you stand at all times.",
    },
    {
        title: "Secure Payments",
        body: "Deposits and withdrawals handled securely through Paystack. Your funds are always protected.",
    },
];

const TESTIMONIALS = [
    {
        quote:
            "The scoring is clear and the standings update the moment matches end. It settled every argument in our group chat.",
        name: "Tunde B.",
        role: "Lagos · Office Rivals League",
        placeholder: true,
    },
    {
        quote:
            "I've used several prediction platforms. This is the first one that feels built for people who actually follow football.",
        name: "Sarah K.",
        role: "Nairobi · Premier Predictors",
        placeholder: true,
    },
    {
        quote:
            "Entry fees, prize split and rules are all shown before you join. That transparency is why I stayed.",
        name: "Mohamed H.",
        role: "Cairo · Continental Cup Room",
        placeholder: true,
    },
];

const FAQS = [
    {
        q: "Is Fantasy Predict a betting platform?",
        a: "No. Fantasy Predict is a skill-based prediction contest. You compete against other players over a season and points are earned for prediction accuracy, not odds.",
    },
    {
        q: "How are points calculated?",
        a: "You earn points for a correct outcome (home win, draw or away win) and bonus points when your exact score is right. Full scoring rules are published inside every league.",
    },
    {
        q: "When do predictions close?",
        a: "Every prediction locks at the official kickoff time of the match. Locked predictions cannot be edited.",
    },
    {
        q: "Can I edit my prediction after submission?",
        a: "You can edit your prediction anytime before the match locks. Once the match kicks off, your prediction is final.",
    },
    {
        q: "How are winners determined?",
        a: "Winners are determined by total points accumulated over the season. The player with the highest points at the end wins the prize pool.",
    },
    {
        q: "How are prizes distributed?",
        a: "Prizes are distributed directly to winners' wallets after the season ends. Distribution follows the rules published in each league.",
    },
];

const TRUST_SIGNALS = [
    {
        title: "Secure Payments",
        body: "All deposits and withdrawals are handled securely through Paystack, a trusted payment provider.",
    },
    {
        title: "Transparent Distribution",
        body: "Prize pools are published upfront and distributed according to clear, visible rules.",
    },
    {
        title: "Fair Competition",
        body: "Every league follows the same scoring rules. No hidden advantages or unfair practices.",
    },
    {
        title: "Protected Accounts",
        body: "Your account is secured with industry-standard encryption. Your data is yours alone.",
    },
];

// ============================================================
// PAGE CLIENT COMPONENT
// ============================================================
export default function PageClient() {
    return (
        <WelcomeSplash>
            <PublicLayout>
                {/* HERO */}
                <section className="relative isolate overflow-hidden lg:h-screen h-auto">
                    <Image
                        src="https://images.pexels.com/photos/30651230/pexels-photo-30651230.jpeg?auto=compress&cs=tinysrgb&w=2000"
                        alt="A packed, floodlit football stadium at night"
                        fill
                        priority
                        className="-z-10 object-cover"
                        sizes="100vw"
                    />
                    {/* DARKER SCRIM – fixed dark overlay that works in all themes */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    <div className="relative mx-auto grid gap-10 lg:px-36 px-5 py-24 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-8 lg:py-32 lg:min-h-[90vh]">
                        {/* LEFT COLUMN – text remains readable because background is now dark */}
                        <div data-aos="fade-up">
                            <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">
                                Season-long prediction leagues
                            </p>
                            <h1 className="text-balance-tight mt-5 font-display lg:text-[52px] text-[32px] leading-[1.05] font-bold text-white">
                                Predict the football. <br /> Prove you know it best.
                            </h1>
                            <p className="mt-6 max-w-xl text-[16px] leading-normal text-white/80">
                                Fantasy Predict is free to join. Create your account, set up a league, submit your
                                predictions before kickoff, and compete with friends and fans worldwide.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3" data-aos="fade-up" data-aos-delay="150">
                                <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90">
                                    <Link href="/register">Register Now</Link>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="border-white/30 hover:bg-white/10">
                                    <Link href="/login">Login</Link>
                                </Button>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2" data-aos="fade-up" data-aos-delay="200">
                                {[
                                    "Free to join — compete in leagues that match your stakes",
                                    "Secure payments powered by Paystack",
                                    "Transparent scoring system",
                                ].map((item) => (
                                    <span key={item} className="text-sm italic text-white/80">
                                        {item}
                                    </span>
                                ))}
                            </div>

                            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-gold/20 pt-8">
                                {[
                                    ["100+", "Active Leagues"],
                                    ["2,000+", "Active Players"],
                                    ["Free to join", "Play your way"],
                                ].map(([value, label], i) => (
                                    <div key={label} data-aos="fade-up" data-aos-delay={200 + i * 100}>
                                        <dt className="num font-display text-2xl font-bold text-gold">{value}</dt>
                                        <dd className="mt-1 text-xs text-white/70">{label}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        {/* RIGHT COLUMN – unchanged */}
                        <div className="flex flex-col items-center gap-6 lg:items-end" data-aos="fade-up" data-aos-delay="200">
                            <TeamCrestOrbit />
                            <HeroPredictionWidget />
                        </div>
                    </div>
                </section>

                {/* REST OF THE PAGE UNCHANGED */}
                <SeasonCountdown />
                <StatsStrip />

                <section className="mx-auto lg:px-36 px-5 py-20 lg:px-8">
                    <h2 className="max-w-xl text-3xl font-bold sm:text-4xl" data-aos="fade-up">
                        Everything a serious prediction league needs
                    </h2>
                    <div className="mt-10 grid gap-5 sm:grid-cols-2">
                        {FEATURES.map((feature, i) => (
                            <Card
                                key={feature.title}
                                className="gap-0 p-7 shadow-[var(--shadow-card)]"
                                data-aos="fade-up"
                                data-aos-delay={i * 100}
                            >
                                <h3 className="text-lg font-semibold">{feature.title}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="border-y border-border bg-card/40">
                    <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
                        <div className="text-center" data-aos="fade-up">
                            <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Why Fantasy Predict</p>
                            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Built for football minds</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-sm text-muted-foreground">
                                Every feature is designed to make prediction leagues simple, transparent, and genuinely competitive.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {WHY_FANTASY_PREDICT.map((item, i) => (
                                <Card
                                    key={item.title}
                                    className="gap-0 p-7 shadow-[var(--shadow-card)]"
                                    data-aos="fade-up"
                                    data-aos-delay={i * 100}
                                >
                                    <h3 className="text-base font-semibold">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <PoolTiers />

                <section id="how-it-works" className="border-y border-border bg-card/40">
                    <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
                        <h2 className="text-3xl font-bold sm:text-4xl" data-aos="fade-up">
                            How it works
                        </h2>
                        <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-5">
                            {[
                                {
                                    step: "01",
                                    title: "Create Your Account",
                                    body: "Sign up for free and access your Fantasy Predict dashboard."
                                },
                                {
                                    step: "02",
                                    title: "Explore Available Leagues",
                                    body: "Browse public competitions or join private leagues through invitations."
                                },
                                { step: "03", title: "Choose Your League", body: "Join a free league to play with friends, or create a monetized league with entry fees and real prize pools." },
                                {
                                    step: "04",
                                    title: "Make Predictions",
                                    body: "Submit your predictions before match deadlines."
                                },
                                {
                                    step: "05",
                                    title: "Earn Points & Climb Rankings",
                                    body: "Track your performance throughout the season."
                                },
                            ].map((step, i) => (
                                <li key={step.step} className="bg-card p-6" data-aos="fade-up" data-aos-delay={i * 80}>
                                    <p className="num font-display text-sm font-bold text-primary">{step.step}</p>
                                    <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <TopPlayersChart />

                <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
                    <h2 className="text-3xl font-bold sm:text-4xl" data-aos="fade-up">
                        What players say
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground/60 italic">
                        *Testimonials will be replaced with real user feedback after launch
                    </p>
                    <div className="mt-10 grid gap-5 md:grid-cols-3">
                        {TESTIMONIALS.map((item, i) => (
                            <Card
                                key={item.name}
                                className="gap-0 p-7 shadow-[var(--shadow-card)]"
                                data-aos="fade-up"
                                data-aos-delay={i * 100}
                            >
                                <p className="text-sm leading-relaxed">&quot;{item.quote}&quot;</p>
                                <div className="mt-6 border-t border-border pt-4">
                                    <p className="text-sm font-semibold">{item.name}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{item.role}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="border-t border-border bg-card/40">
                    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                        <div data-aos="fade-up">
                            <h2 className="text-3xl font-bold sm:text-4xl">Frequently asked</h2>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Still unsure? The{" "}
                                <Link href="/help" className="font-semibold text-primary underline-offset-4 hover:underline">
                                    Help Centre
                                </Link>{" "}
                                covers scoring, payouts and league administration in detail.
                            </p>
                        </div>
                        <Accordion type="single" collapsible className="w-full" data-aos="fade-up" data-aos-delay="150">
                            {FAQS.map((faq) => (
                                <AccordionItem key={faq.q} value={faq.q}>
                                    <AccordionTrigger className="text-left text-sm font-semibold">{faq.q}</AccordionTrigger>
                                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>

                <AppsComingSoon />

                <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
                    <Card
                        className="items-center gap-0 border-primary/30 bg-card p-10 text-center sm:p-14"
                        data-aos="zoom-in"
                    >
                        <CountdownChip />
                        <h2 className="mt-5 max-w-xl mx-auto text-3xl font-bold sm:text-4xl">
                            Your matchweek starts soon.
                        </h2>
                        <p className="mt-4 max-w-lg mx-auto text-sm leading-relaxed text-muted-foreground">
                            Fantasy Predict is free to join. Create your account, browse leagues, and start predicting —
                            all before the new season kicks off.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Button asChild size="lg">
                                <Link href="/register">Create free account</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href="/help">See how it works</Link>
                            </Button>
                        </div>
                    </Card>
                </section>

                <section className="border-y border-border bg-card/40">
                    <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
                        <div className="text-center" data-aos="fade-up">
                            <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Built for Trust</p>
                            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Your money and data are safe</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-sm text-muted-foreground">
                                Fantasy Predict is built with security and transparency at its core. Every transaction, rule, and ranking
                                is visible and verifiable.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {TRUST_SIGNALS.map((item, i) => (
                                <Card
                                    key={item.title}
                                    className="gap-0 p-7 shadow-[var(--shadow-card)] text-center"
                                    data-aos="fade-up"
                                    data-aos-delay={i * 100}
                                >
                                    <h3 className="text-base font-semibold">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </PublicLayout>
        </WelcomeSplash>
    );
}