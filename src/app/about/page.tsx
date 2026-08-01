import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Fantasy Predict — The Story Behind the Platform",
  description:
    "Fantasy Predict brings football fans together to test their knowledge, compete with friends, and climb the leaderboard through strategic match predictions.",
  openGraph: {
    title: "About Fantasy Predict — The Story Behind the Platform",
    description:
      "Fantasy Predict brings football fans together to test their knowledge, compete with friends, and climb the leaderboard through strategic match predictions.",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}