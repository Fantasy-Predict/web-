import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Fantasy Predict — Nigeria's Football Prediction Platform",
  description:
    "Learn about Fantasy Predict — the Nigerian football prediction platform where fans predict match scores, compete in leagues, and win real money. Built for Nigerian football lovers.",
  alternates: { canonical: "https://www.fantasy-predict.com/about" },
  openGraph: {
    title: "About Fantasy Predict — Nigeria's Football Prediction Platform",
    description:
      "Fantasy Predict is built for Nigerian football fans — predict scores, join paid pools, earn points and win real money.",
    url: "https://www.fantasy-predict.com/about",
  },
};

export default function AboutPage() {
  return (
    <PublicLayout>
      <AboutClient />
    </PublicLayout>
  );
}