"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_CATEGORIES = [
  {
    id: "getting-started",
    label: "Getting Started",
    questions: [
      {
        q: "What is Fantasy Predict?",
        a: "Fantasy Predict is a football prediction platform where users compete by predicting match outcomes, joining leagues, earning points, and climbing leaderboards.",
      },
      {
        q: "How does Fantasy Predict work?",
        a: "Users create an account, join or create leagues, submit predictions before match deadlines, earn points based on accuracy, and compete on leaderboards.",
      },
      {
        q: "Is Fantasy Predict free to use?",
        a: "Creating an account and accessing the Fantasy Predict dashboard is completely free. Users only make payments when joining leagues that require an entry fee.",
      },
      {
        q: "How do I create an account?",
        a: "Click the registration option, provide the required details, verify your account, and start exploring available leagues.",
      },
    ],
  },
  {
    id: "predictions",
    label: "Predictions",
    questions: [
      {
        q: "How do I make a prediction?",
        a: "Select an upcoming match, choose your prediction option, and submit before the deadline.",
      },
      {
        q: "What types of predictions can I make?",
        a: "Depending on the competition, users may predict match outcomes such as Home Win, Draw, Away Win, or Exact Score.",
      },
      {
        q: "When do predictions close?",
        a: "Predictions close at the specified deadline before each match begins.",
      },
      {
        q: "Can I change my prediction after submitting?",
        a: "Changes are only possible before the prediction deadline. Once predictions are locked, they cannot be modified.",
      },
      {
        q: "What happens if I forget to submit a prediction?",
        a: "You will not receive points for that match if no prediction was submitted before the deadline.",
      },
      {
        q: "Are predictions available for every football match?",
        a: "Available matches depend on the competitions supported on Fantasy Predict.",
      },
    ],
  },
  {
    id: "leagues",
    label: "Leagues",
    questions: [
      {
        q: "What is a league on Fantasy Predict?",
        a: "A league is a competition where users compete against each other based on their prediction performance.",
      },
      {
        q: "What is the difference between Free and Monetized leagues?",
        a: "Free leagues have no entry fees and are perfect for playing with friends, office groups, or casual competition. Monetized leagues have entry fees and real prize pools, allowing you to compete for rewards.",
      },
      {
        q: "How do I join a league?",
        a: "Browse available leagues, select your preferred league, review the details, and join.",
      },
      {
        q: "Can I create my own league?",
        a: "Yes. Users can create private or public leagues depending on the available options. When creating a league, you can choose between Free or Monetized.",
      },
      {
        q: "Who sets the entry fee for a Monetized league?",
        a: "Entry fees for monetized leagues are set by the league creator, subject to platform guidelines. The platform may also offer curated monetized leagues with fixed entry fees.",
      },
      {
        q: "Can I convert a Free league to Monetized later?",
        a: "Once a league is created, the league type (Free or Monetized) cannot be changed. You would need to create a new league with the desired type.",
      },
      {
        q: "What information can I see before joining a league?",
        a: "Users can view available details such as entry fee, prize pool, number of participants, and league rules.",
      },
      {
        q: "Can I invite friends to my league?",
        a: "Yes. Private leagues can include invitation options.",
      },
      {
        q: "Can I participate in multiple leagues?",
        a: "Yes, depending on the platform rules and availability.",
      },
    ],
  },
  {
    id: "points-rankings",
    label: "Points & Rankings",
    questions: [
      {
        q: "How are points calculated?",
        a: "Points are awarded based on prediction accuracy: Exact score → 5 points | Close (correct goal margin) → 3 points | Correct outcome → 2 points | Wrong → 0 points.",
      },
      {
        q: "What is considered a 'Close' prediction?",
        a: "A 'Close' prediction means you predicted the correct goal margin (for example, predicting 2-1 when the actual score is 3-2, or 1-0 when the actual score is 2-1).",
      },
      {
        q: "Where can I view my ranking?",
        a: "Your ranking can be viewed through the leaderboard section.",
      },
      {
        q: "Are rankings updated automatically?",
        a: "Yes. Rankings update based on match results and completed predictions.",
      },
      {
        q: "What happens if two players have the same points?",
        a: "Tie-breaking rules will be determined according to the league scoring system.",
      },
    ],
  },
  {
    id: "payments-wallet",
    label: "Payments & Wallet",
    questions: [
      {
        q: "Do I need to pay to create an account?",
        a: "No. Registration and dashboard access are free. Payments are only required when joining monetized leagues or private leagues with entry fees.",
      },
      {
        q: "How do I pay for a league entry?",
        a: "Users can complete payment through the available payment options when joining a paid league.",
      },
      {
        q: "What payment method does Fantasy Predict support?",
        a: "Payments are processed through supported payment providers available on the platform.",
      },
      {
        q: "What is the wallet used for?",
        a: "The wallet allows users to manage funds related to league participation and rewards.",
      },
      {
        q: "Can I withdraw my winnings?",
        a: "Eligible winnings can be withdrawn based on the platform's withdrawal rules.",
      },
    ],
  },
  {
    id: "rewards",
    label: "Rewards",
    questions: [
      {
        q: "How do I win rewards?",
        a: "Users earn rewards by performing well in eligible leagues based on the announced prize structure.",
      },
      {
        q: "Where can I see the prize pool?",
        a: "Prize information is displayed within the league details before participation.",
      },
      {
        q: "When are prizes distributed?",
        a: "Prize distribution happens after the league concludes and results are verified.",
      },
    ],
  },
  {
    id: "account-security",
    label: "Account & Security",
    questions: [
      {
        q: "How do I reset my password?",
        a: "Use the password reset option on the login page and follow the instructions.",
      },
      {
        q: "Can I update my profile information?",
        a: "Yes. Profile details can be updated through account settings.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. Payments are processed through secure payment systems.",
      },
      {
        q: "Can I delete my account?",
        a: "Users can request account deletion according to the platform's account management policy.",
      },
    ],
  },
];

export default function FaqClient() {
  const [searchQuery, setSearchQuery] = useState("");

  const isSearching = searchQuery.trim().length > 0;
  const query = searchQuery.toLowerCase();

  const filteredCategories = isSearching
    ? FAQ_CATEGORIES.map((category) => ({
        ...category,
        questions: category.questions.filter(
          (faq) =>
            faq.q.toLowerCase().includes(query) ||
            faq.a.toLowerCase().includes(query)
        ),
      })).filter((category) => category.questions.length > 0)
    : FAQ_CATEGORIES;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy via-navy to-primary/10">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 40%, var(--gold) 1px, transparent 1px),
                               radial-gradient(circle at 70% 60%, var(--gold) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:py-20 lg:py-24 lg:px-8">
          <Badge variant="outline" className="border-gold/40 text-gold">FAQ</Badge>
          <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm leading-relaxed text-white/70">
            Find answers to common questions about predictions, leagues, payments, rankings,
            and everything you need to know about Fantasy Predict.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search questions… e.g. How do I join a league?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border-white/10 bg-white/5 px-6 py-4 pr-[5.5rem] text-sm text-white placeholder:text-white/40 backdrop-blur-sm focus:border-gold focus:ring-gold"
              />
              <button className="absolute inset-y-1.5 right-1.5 rounded-xl bg-gold px-6 text-sm font-semibold text-navy transition-colors hover:bg-gold/90">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CATEGORIES — Sidebar + Content Layout */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar – Category Navigation */}
          {!isSearching && (
            <div className="space-y-1" data-aos="fade-up">
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Topics
              </p>
              <nav className="mt-4 space-y-0.5">
                {FAQ_CATEGORIES.map((category) => (
                  <a
                    key={category.id}
                    href={`#${category.id}`}
                    className="block rounded-lg px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-gold/5 hover:text-gold"
                  >
                    {category.label}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* Main Content – FAQ Accordions */}
          <div className="space-y-10">
            {filteredCategories.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  No results found for &ldquo;{searchQuery}&rdquo;. Try a different search term.
                </p>
              </div>
            ) : (
              filteredCategories.map((category, index) => (
                <div
                  key={category.id}
                  id={category.id}
                  data-aos="fade-up"
                  data-aos-delay={index * 60}
                >
                  <div className="flex items-center gap-4 border-b border-border pb-3">
                    <span className="text-xs font-bold tracking-[0.18em] text-gold uppercase">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-xl font-bold">{category.label}</h2>
                  </div>
                  <Accordion type="single" collapsible className="mt-4 w-full">
                    {category.questions.map((faq, i) => (
                      <AccordionItem
                        key={faq.q}
                        value={`${category.id}-${i}`}
                        className="border-b border-border/50 last:border-0"
                      >
                        <AccordionTrigger className="text-left text-sm font-medium hover:text-gold">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* STILL NEED HELP */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Still Need Help?</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Can&apos;t Find Your Answer?</h2>
          <p className="mt-3 max-w-xl mx-auto text-sm text-muted-foreground">
            Our support team is ready to help with any questions or issues you may have.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90">
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/help">Visit Help Center</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <Card
          className="items-center gap-0 border-gold/30 bg-gradient-to-br from-card to-card/80 p-10 text-center sm:p-14"
          data-aos="zoom-in"
        >
          <h2 className="max-w-xl mx-auto text-2xl font-bold sm:text-3xl">
            Ready To Test Your Football Knowledge?
          </h2>
          <p className="mt-3 max-w-lg mx-auto text-sm leading-relaxed text-muted-foreground">
            Join thousands of fans already competing. Create your league or join an existing one today.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90">
              <Link href="/dashboard/pools/create">Create League</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard/pools">Join Pool</Link>
            </Button>
          </div>
        </Card>
      </section>
    </>
  );
}
