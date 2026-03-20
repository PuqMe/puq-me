import type { Metadata } from "next";
import { env } from "./env";

type PageSeoConfig = {
  title: string;
  description: string;
  path: string;
  icon?: string;
  noIndex?: boolean;
};

export function generatePageMetadata(config: PageSeoConfig): Metadata {
  const { title, description, path, icon, noIndex } = config;
  const fullTitle = `${title} • PuQ.me`;
  const ogImageUrl = `${env.appUrl}/og?title=${encodeURIComponent(title)}&desc=${encodeURIComponent(description)}${icon ? `&icon=${encodeURIComponent(icon)}` : ""}`;
  const canonicalUrl = `${env.appUrl}${path}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: "PuQ.me",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
      type: "website",
      locale: "de_DE",
      alternateLocale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large" as const,
            "max-snippet": -1,
          },
        },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "en": canonicalUrl,
        "de": canonicalUrl,
      },
    },
  };
}
