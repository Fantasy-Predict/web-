import type { Metadata } from "next";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Help Centre — Fantasy Predict",
  description:
    "Find answers about predictions, leagues, payments, rankings, and everything else you need to enjoy Fantasy Predict.",
  openGraph: {
    title: "Help Centre — Fantasy Predict",
    description:
      "Find answers about predictions, leagues, payments, rankings, and everything else you need to enjoy Fantasy Predict.",
  },
};

// ============================================================
// DATA
// ============================================================

const CATEGORIES = [
  {
    title: "Getting Started",
    topics: ["Creating an account", "Setting up your profile", "Understanding the dashboard"],
  },
  {
    title: "Predictions",
    topics: ["How to make predictions", "Prediction deadlines", "Editing predictions", "Scoring system"],
  },
  {
    title: "Leagues",
    topics: ["Joining a league", "Creating a league", "Private vs public leagues", "League rules"],
  },
  {
    title: "Payments & Wallet",
    topics: ["Adding funds", "Entry fees", "Prize payments", "Withdrawal process"],
  },
  {
    title: "Rankings & Points",
    topics: ["Leaderboard system", "Weekly rankings", "Season rankings", "Points calculation"],
  },
  {
    title: "Account & Settings",
    topics: ["Password reset", "Profile updates", "Notification settings"],
  },
];

const POPULAR_QUESTIONS = [
  {
    q: "How do I join a league?",
    a: "Browse available leagues from your dashboard, select the one you're interested in, review the entry fee and prize structure, complete payment if required, and confirm your participation. You'll receive a confirmation once you're in.",
  },
  {
    q: "How are points calculated?",
    a: "Points are awarded based on prediction accuracy. You earn points for correct outcomes (home win, draw, or away win) and bonus points when your exact score prediction is correct. Full scoring rules are published inside each league.",
  },
  {
    q: "When do predictions close?",
    a: "Predictions must be submitted before the official kickoff time of each match. Once a match locks, predictions cannot be edited. You'll see countdown timers on each match card.",
  },
  {
    q: "Can I change my prediction?",
    a: "Yes, you can edit your predictions anytime before the match locks. Once the match kicks off, your prediction is final and cannot be changed.",
  },
  {
    q: "How do I receive prizes?",
    a: "Winners receive prizes directly to their Fantasy Predict wallet after the season or league ends. Prize distribution follows the rules published in each league. You can then withdraw to your bank account.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create Your Account",
    body: "Register with your email or Google account. Complete your profile and set up your preferences.",
  },
  {
    step: "02",
    title: "Join A League",
    body: "Browse available leagues from your dashboard. Select one that interests you and review the details before joining.",
  },
  {
    step: "03",
    title: "Make Predictions",
    body: "Select upcoming matches, choose your predicted outcome (home win, draw, or away win), and submit before the deadline.",
  },
  {
    step: "04",
    title: "Track Your Progress",
    body: "View your points, check your position on the leaderboard, and see how you're performing against other players.",
  },
];

const STATUS_ITEMS = [
  { label: "Predictions System", status: "Operational" },
  { label: "Payments System", status: "Operational" },
  { label: "Match Updates", status: "Operational" },
  { label: "Leaderboard", status: "Operational" },
];

// ============================================================
// PAGE COMPONENT
// ============================================================

export default function HelpPage() {
  return (
    <PublicLayout>
      {/* =============================================================
          HERO — Minimal, search-focused
          ============================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-primary/5">
        <div className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:py-20 lg:py-24 lg:px-8">
          <Badge variant="outline" className="border-primary/40 text-primary">Help Centre</Badge>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            How Can We Help?
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm leading-relaxed text-muted-foreground">
            Find answers about predictions, leagues, payments, rankings, and everything else you need
            to enjoy Fantasy Predict.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for answers… e.g. How do I join a league?"
                className="w-full rounded-2xl border border-border bg-card/80 px-6 py-4 text-sm text-foreground placeholder:text-muted-foreground/50 shadow-[var(--shadow-card)] backdrop-blur-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="absolute inset-y-1.5 right-1.5 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================
          QUICK HELP CATEGORIES
          ============================================================= */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Quick Help Categories</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Browse topics to find what you're looking for.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category, i) => (
              <Card
                key={category.title}
                className="gap-0 border-border p-6 shadow-[var(--shadow-card)] transition-all hover:border-primary/30 hover:shadow-[var(--shadow-elevated)]"
                data-aos="fade-up"
                data-aos-delay={i * 60}
              >
                <h3 className="text-base font-semibold">{category.title}</h3>
                <ul className="mt-4 space-y-1.5">
                  {category.topics.map((topic) => (
                    <li key={topic}>
                      <Link
                        href={`/help/${topic.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {topic}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================
          POPULAR QUESTIONS
          ============================================================= */}
      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <div className="text-center" data-aos="fade-up">
          <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Quick Answers</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Frequently Asked Questions</h2>
        </div>
        <div className="mt-8" data-aos="fade-up" data-aos-delay="100">
          <Accordion type="single" collapsible className="w-full">
            {POPULAR_QUESTIONS.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger className="text-left text-sm font-semibold hover:text-gold">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* =============================================================
          STEP-BY-STEP GUIDES
          ============================================================= */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Guides</p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Step-by-Step Guides</h2>
            <p className="mt-2 max-w-2xl mx-auto text-sm text-muted-foreground">
              Follow these simple steps to get started and make the most of Fantasy Predict.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {STEPS.map((step, i) => (
              <Card
                key={step.step}
                className="gap-0 border-border p-6 shadow-[var(--shadow-card)]"
                data-aos="fade-up"
                data-aos-delay={i * 80}
              >
                <div className="flex items-start gap-4">
                  <span className="font-display text-2xl font-bold text-gold">{step.step}</span>
                  <div>
                    <h3 className="text-base font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================
          CONTACT SUPPORT
          ============================================================= */}
      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <div className="text-center" data-aos="fade-up">
          <h2 className="text-2xl font-bold sm:text-3xl">Still Need Help?</h2>
          <p className="mt-3 max-w-xl mx-auto text-sm text-muted-foreground">
            Our support team is ready to assist you with any questions or issues you may have.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card className="gap-0 border-border p-6 text-center shadow-[var(--shadow-card)]">
            <h3 className="text-sm font-semibold">Email Support</h3>
            <a
              href="mailto:support@fantasypredict.com"
              className="mt-2 inline-block text-sm text-primary hover:underline"
            >
              support@fantasypredict.com
            </a>
          </Card>
          <Card className="gap-0 border-border p-6 text-center shadow-[var(--shadow-card)]">
            <h3 className="text-sm font-semibold">Live Chat</h3>
            <p className="mt-2 text-sm text-muted-foreground">Chat with our support team</p>
          </Card>
          <Card className="gap-0 border-border p-6 text-center shadow-[var(--shadow-card)]">
            <h3 className="text-sm font-semibold">Submit Ticket</h3>
            <p className="mt-2 text-sm text-muted-foreground">Describe your issue and we'll respond</p>
          </Card>
        </div>
      </section>

      {/* =============================================================
          SYSTEM STATUS
          ============================================================= */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-4xl px-5 py-12 text-center lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">System Status</p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">Platform Status</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-6">
            {STATUS_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground"> — {item.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================
          FINAL CTA
          ============================================================= */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <Card
          className="items-center gap-0 border-primary/30 bg-card p-10 text-center sm:p-14"
          data-aos="zoom-in"
        >
          <h2 className="max-w-xl mx-auto text-2xl font-bold sm:text-3xl">
            Ready To Start Predicting?
          </h2>
          <p className="mt-3 max-w-lg mx-auto text-sm leading-relaxed text-muted-foreground">
            Join thousands of fans already competing. Create your league or join an existing one today.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard/leagues/create">Create League</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard/leagues">Join League</Link>
            </Button>
          </div>
        </Card>
      </section>
    </PublicLayout>
  );
}