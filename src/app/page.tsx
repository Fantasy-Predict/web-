import type { Metadata } from "next";
import PageClient from "./page.client";

export const metadata: Metadata = {
  title: "Fantasy Predict — Nigeria's #1 Football Prediction & Fantasy League Platform",
  description:
    "Predict football match scores, join paid prediction pools, earn points and win real money (NGN). Nigeria's leading football prediction platform — now with Fantasy Premier League (FPL). Free to join.",
  alternates: {
    canonical: "https://www.fantasy-predict.com",
  },
  openGraph: {
    title: "Fantasy Predict — Nigeria's #1 Football Prediction & Fantasy League Platform",
    description:
      "Predict football match scores, join paid prediction pools and win real money in Nigeria. FPL coming soon.",
    url: "https://www.fantasy-predict.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Fantasy Predict",
  url: "https://www.fantasy-predict.com",
  description:
    "Nigeria's #1 football prediction platform. Predict match scores, join paid leagues, compete in pools and win real money (NGN). Fantasy Premier League (FPL) coming soon.",
  applicationCategory: "SportsApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "NGN",
    description: "Free to join. Paid pool entry fees optional.",
  },
  audience: {
    "@type": "Audience",
    geographicArea: {
      "@type": "Country",
      name: "Nigeria",
    },
  },
  publisher: {
    "@type": "Organization",
    name: "Fantasy Predict",
    url: "https://www.fantasy-predict.com",
    logo: {
      "@type": "ImageObject",
      url: "https://www.fantasy-predict.com/logos.png",
    },
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageClient />
    </>
  );
}