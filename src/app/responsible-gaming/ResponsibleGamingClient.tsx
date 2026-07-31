"use client";

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

// ============================================================
// DATA
// ============================================================

const COMMITMENTS = [
  {
    title: "Fair Competition",
    description:
      "We promote skill-based competition built around football knowledge, transparency, and fairness.",
  },
  {
    title: "Responsible Participation",
    description:
      "We encourage users to play responsibly and make informed decisions about their participation.",
  },
  {
    title: "Player Wellbeing",
    description:
      "The enjoyment of our community is more important than excessive participation.",
  },
  {
    title: "Transparency",
    description:
      "Clear rules, fair scoring, and transparent prize structures are central to the Fantasy Predict experience.",
  },
];

const GUIDELINES = [
  "Participate for enjoyment first.",
  "Only join leagues you can comfortably afford.",
  "Understand the rules before entering a competition.",
  "Avoid chasing losses or making emotional decisions.",
  "Take regular breaks from the platform.",
  "Maintain a healthy balance between football, work, family, and personal life.",
  "Users are encouraged to participate responsibly, especially when joining paid leagues or competitions involving entry fees.",
];

const WARNING_SIGNS = [
  "Spending more than you intended.",
  "Feeling pressured to recover previous losses.",
  "Neglecting work, school, or family responsibilities.",
  "Feeling anxious or frustrated because of participation.",
  "Continuing to play when it is no longer enjoyable.",
];

const TOOLS = [
  {
    title: "Account Limits",
    description: "Set limits on participation where available.",
  },
  {
    title: "Notification Preferences",
    description: "Manage reminders and platform notifications.",
  },
  {
    title: "Account Breaks",
    description: "Take a break whenever you need one.",
  },
  {
    title: "Self-Exclusion",
    description: "Request temporary or permanent account suspension if necessary.",
  },
];

const FAQS = [
  {
    q: "Is Fantasy Predict a betting platform?",
    a: "Fantasy Predict is a football prediction platform focused on skill-based competition. Participation may involve paid leagues depending on the competition.",
  },
  {
    q: "Can I participate for free?",
    a: "Some leagues may be free to join, while others may require an entry fee. You can choose the option that suits you best.",
  },
  {
    q: "Can I take a break from my account?",
    a: "Where supported, users may request temporary account restrictions or account closure. Contact our support team for assistance.",
  },
  {
    q: "How can I manage my notifications?",
    a: "Notification preferences can be updated within your account settings at any time.",
  },
];

// ============================================================
// PAGE COMPONENT
// ============================================================

export default function ResponsibleGamingClient() {
  return (
    <PublicLayout>
      {/* =============================================================
          HERO — Warmer, softer feel
          ============================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-primary/15">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 20%, var(--gold) 1px, transparent 1px),
                               radial-gradient(circle at 70% 80%, var(--gold) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:py-20 lg:py-24 lg:px-8">
          <Badge variant="outline" className="border-gold/40 text-gold">Responsible Gaming</Badge>
          <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Play Responsibly. <br /> Stay in Control.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm leading-relaxed text-white/70">
            At Fantasy Predict, we believe football predictions should be enjoyable, fair, and
            responsible. We encourage every user to participate within their means and maintain
            a healthy balance while enjoying the platform.
          </p>
        </div>
      </section>

      {/* =============================================================
          OUR COMMITMENT — 4 Cards
          ============================================================= */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <div className="text-center" data-aos="fade-up">
          <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">
            Our Values
          </p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Our Commitment to You</h2>
          <p className="mt-2 max-w-2xl mx-auto text-sm text-muted-foreground">
            We are committed to creating a platform where competition is fair, participation is
            responsible, and player wellbeing comes first.
          </p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {COMMITMENTS.map((item, i) => (
            <Card
              key={item.title}
              className="gap-0 border-t-4 border-t-gold p-6 shadow-[var(--shadow-card)]"
              data-aos="fade-up"
              data-aos-delay={i * 80}
            >
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* =============================================================
          PLAY RESPONSIBLY GUIDELINES — Checklist style
          ============================================================= */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">
              Guidelines
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Play Responsibly</h2>
            <p className="mt-2 max-w-xl mx-auto text-sm text-muted-foreground">
              Simple principles to help you maintain a healthy and enjoyable experience on
              Fantasy Predict.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2" data-aos="fade-up" data-aos-delay="100">
            {GUIDELINES.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
              >
                <span className="mt-0.5 text-gold text-sm font-bold">✓</span>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================
          RECOGNIZING UNHEALTHY HABITS
          ============================================================= */}
      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <div className="text-center" data-aos="fade-up">
          <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">
            Awareness
          </p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Know the Warning Signs</h2>
          <p className="mt-2 max-w-xl mx-auto text-sm text-muted-foreground">
            Being aware of these signs can help you recognize when participation is becoming
            difficult to manage.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-aos="fade-up" data-aos-delay="100">
          {WARNING_SIGNS.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/60 bg-card/40 p-4 text-center"
            >
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* =============================================================
          TOOLS TO HELP YOU STAY IN CONTROL
          ============================================================= */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">
              Tools
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Stay in Control</h2>
            <p className="mt-2 max-w-xl mx-auto text-sm text-muted-foreground">
              We are developing features to help you manage your participation on the platform.
              These tools are part of our commitment to responsible gaming.
            </p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-aos="fade-up" data-aos-delay="100">
            {TOOLS.map((item, i) => (
              <Card
                key={item.title}
                className="gap-0 border-border p-6 text-center shadow-[var(--shadow-card)]"
                data-aos="fade-up"
                data-aos-delay={i * 80}
              >
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                <Badge variant="outline" className="mt-3 border-gold/30 text-gold text-[10px]">
                  Planned
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================
          SUPPORT & RESOURCES
          ============================================================= */}
      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <Card
          className="gap-0 border-gold/20 bg-card p-10 text-center shadow-[var(--shadow-card)] sm:p-12"
          data-aos="zoom-in"
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">
            Support & Resources
          </p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Need Support?</h2>
          <p className="mt-3 max-w-xl mx-auto text-sm leading-relaxed text-muted-foreground">
            If you feel your participation is becoming difficult to manage, consider speaking
            with someone you trust or seeking professional guidance. If you need assistance
            with your Fantasy Predict account, our support team is here to help.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90">
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/help">Visit Help Center</Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* =============================================================
          FREQUENTLY ASKED QUESTIONS
          ============================================================= */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">
              Questions
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Frequently Asked Questions</h2>
          </div>
          <div className="mt-8" data-aos="fade-up" data-aos-delay="100">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq) => (
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
        </div>
      </section>

      {/* =============================================================
          FINAL CTA
          ============================================================= */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <Card
          className="items-center gap-0 border-primary/30 bg-gradient-to-br from-card to-card/80 p-10 text-center sm:p-14"
          data-aos="zoom-in"
        >
          <h2 className="max-w-xl mx-auto text-2xl font-bold sm:text-3xl">
            Ready To Start Predicting?
          </h2>
          <p className="mt-3 max-w-lg mx-auto text-sm leading-relaxed text-muted-foreground">
            Join thousands of fans already competing. Remember to play responsibly and enjoy
            the game.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90">
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