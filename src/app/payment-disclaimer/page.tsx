import type { Metadata } from "next";
import PaymentDisclaimerClient from "./PaymentDisclaimerClient";

export const metadata: Metadata = {
  title: "Payment Disclaimer — Fantasy Predict",
  description:
    "We are committed to providing a secure, transparent, and reliable payment experience. Review our payment policies, processing times, and responsibilities.",
  openGraph: {
    title: "Payment Disclaimer — Fantasy Predict",
    description:
      "We are committed to providing a secure, transparent, and reliable payment experience. Review our payment policies, processing times, and responsibilities.",
  },
};

export default function PaymentDisclaimerPage() {
  return <PaymentDisclaimerClient />;
}