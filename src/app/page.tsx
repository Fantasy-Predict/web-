import type { Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Fantasy Predict — Predict Football, Compete, Win",
  description:
    "Join season-long football prediction pools. Predict fixtures, earn points for accuracy and climb transparent leaderboards with friends or the world.",
  openGraph: {
    title: "Fantasy Predict — Predict Football, Compete, Win",
    description:
      "Season-long football prediction pools with transparent scoring, secure payments and live leaderboards.",
  },
};

export default function Page() {
  return <PageClient />;
}