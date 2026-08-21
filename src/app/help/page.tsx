import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";
import HelpClient from "./HelpClient";

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

export default function HelpPage() {
  return (
    <PublicLayout>
      <HelpClient />
    </PublicLayout>
  );
}
