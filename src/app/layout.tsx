import type { Metadata } from "next";
import { themeBootstrapScript } from "@/components/theme-provider";
import { Providers } from "./providers";
import { exo2, montserrat } from "./fonts";
import { AOSInit } from "./aos-init";
import { PageLoader } from "@/components/PageLoader";
import { WelcomeSplash } from "@/components/app/welcome-splash";
import "aos/dist/aos.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.fantasy-predict.com"),
  title: {
    default: "Fantasy Predict — Football Prediction Leagues",
    template: "%s | Fantasy Predict",
  },
  description:
    "Fantasy Predict is Nigeria's #1 football prediction platform. Predict match scores, join leagues, compete in pools and win real money. Now including FPL — Fantasy Premier League Nigeria.",
  keywords: [
    "football prediction Nigeria",
    "fantasy football Nigeria",
    "predict football matches Nigeria",
    "FPL Nigeria",
    "fantasy premier league Nigeria",
    "football prediction app Nigeria",
    "football prediction pool Nigeria",
    "win money predicting football Nigeria",
    "Fantasy Predict",
    "match prediction platform Nigeria",
    "football contest Nigeria",
    "paid football prediction league Nigeria",
    "predict match score",
    "football fantasy game",
    "fantasy predict",
  ],
  authors: [{ name: "Fantasy Predict", url: "https://www.fantasy-predict.com" }],
  creator: "Fantasy Predict",
  publisher: "Fantasy Predict",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon-logo.png",
    apple: "/icon-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://www.fantasy-predict.com",
    siteName: "Fantasy Predict",
    title: "Fantasy Predict — Football Prediction Leagues",
    description:
      "Nigeria's #1 football prediction platform. Predict match scores, join leagues, compete in pools and win real money.",
    images: [
      {
        url: "/logos.png",
        width: 1200,
        height: 630,
        alt: "Fantasy Predict — Football Prediction Leagues",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fantasy Predict — Football Prediction Leagues",
    description:
      "Nigeria's #1 football prediction platform. Predict match scores, join leagues, compete in pools and win real money.",
    images: ["/logos.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${exo2.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <AOSInit />
        <Providers>
          {/* 
            PageLoader – shows on ALL page navigations EXCEPT the first visit to landing page.
            The WelcomeSplash handles the first visit to landing page.
          */}
          <PageLoader />
          
          {/* 
            WelcomeSplash – ONLY shows on first visit to landing page (session check internally).
            After that, it renders children directly (no splash).
          */}
          <WelcomeSplash>
            {children}
          </WelcomeSplash>
        </Providers>
      </body>
    </html>
  );
}