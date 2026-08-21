import type { MetadataRoute } from "next";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "https://fantasy-predict.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: {
    path: string;
    changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority?: number;
  }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1.0 },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/help", changeFrequency: "monthly", priority: 0.6 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/dashboard/leaderboard", changeFrequency: "daily", priority: 0.7 },
    { path: "/login", changeFrequency: "yearly", priority: 0.4 },
    { path: "/register", changeFrequency: "yearly", priority: 0.5 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/responsible-gaming", changeFrequency: "yearly", priority: 0.3 },
    { path: "/payment-disclaimer", changeFrequency: "yearly", priority: 0.3 },
  ];

  return entries.map((entry) => ({
    url: `${BASE_URL}${entry.path}`,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}