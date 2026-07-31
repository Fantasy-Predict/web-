import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

export const metadata: Metadata = {
  title: "Privacy Policy — Fantasy Predict",
  description:
    "Your privacy matters to us. This Privacy Policy explains what information we collect, how we use it, and the choices you have regarding your personal data while using Fantasy Predict.",
  openGraph: {
    title: "Privacy Policy — Fantasy Predict",
    description:
      "Your privacy matters to us. This Privacy Policy explains what information we collect, how we use it, and the choices you have regarding your personal data while using Fantasy Predict.",
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}