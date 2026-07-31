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
  title: "Fantasy Predict — Football Prediction Leagues",
  description:
    "Fantasy Predict is a premium football prediction platform. Create leagues, predict fixtures, earn points and climb the leaderboard.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Fantasy Predict — Football Prediction Leagues",
    description: "Predict football fixtures, compete in leagues and climb the leaderboard.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
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