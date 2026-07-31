import type { Metadata } from "next";
import ResponsibleGamingClient from "./ResponsibleGamingClient";

export const metadata: Metadata = {
  title: "Responsible Gaming Guidelines — Fantasy Predict",
  description:
    "At Fantasy Predict, we believe football predictions should be enjoyable, fair, and responsible. Learn about our commitment to responsible participation.",
  openGraph: {
    title: "Responsible Gaming Guidelines — Fantasy Predict",
    description:
      "At Fantasy Predict, we believe football predictions should be enjoyable, fair, and responsible. Learn about our commitment to responsible participation.",
  },
};

export default function ResponsibleGamingPage() {
  return <ResponsibleGamingClient />;
}