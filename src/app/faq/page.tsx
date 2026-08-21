import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Fantasy Predict",
  description:
    "Find answers to common questions about predictions, leagues, payments, rankings, and everything you need to know about Fantasy Predict.",
  openGraph: {
    title: "Frequently Asked Questions — Fantasy Predict",
    description:
      "Find answers to common questions about predictions, leagues, payments, rankings, and everything you need to know about Fantasy Predict.",
  },
};

export default function FAQPage() {
  return (
    <PublicLayout>
      <FaqClient />
    </PublicLayout>
  );
}
