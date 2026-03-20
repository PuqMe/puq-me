import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.appUrl;
  const now = new Date().toISOString();

  // Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // App feature pages (discoverable for SEO but require auth)
  const featurePages = [
    "radar",
    "nearby",
    "swipe",
    "matches",
    "chat",
    "circle",
    "profile",
    "settings",
    "smart-match",
    "groups",
    "buzz",
    "cards",
    "followers",
    "intent",
    "calm",
    "auto-vanish",
    "visibility",
    "interests",
    "badges",
  ];

  const featureSitemap: MetadataRoute.Sitemap = featurePages.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...featureSitemap];
}
