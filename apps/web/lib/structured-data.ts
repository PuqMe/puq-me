import {
  BRAND_NAME,
  BRAND_DESCRIPTION,
  BRAND_TAGLINE,
} from "@puqme/config";

// ── JSON-LD Schema.org Structured Data ──
// Covers: SEO (Google), AIO (AI Optimization), GEO (Generative Engine Optimization),
// AEO (Answer Engine Optimization)

export function getWebsiteSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    alternateName: "PuQ",
    url: baseUrl,
    description: BRAND_DESCRIPTION,
    inLanguage: "de",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/radar?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getOrganizationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: baseUrl,
    logo: `${baseUrl}/icon-512.png`,
    description: BRAND_DESCRIPTION,
    foundingDate: "2024",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${baseUrl}/settings`,
      availableLanguage: ["English", "German"],
    },
  };
}

export function getSoftwareAppSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BRAND_NAME,
    description: BRAND_DESCRIPTION,
    url: baseUrl,
    applicationCategory: "SocialNetworkingApplication",
    applicationSubCategory: "Dating & Begegnungen",
    additionalType: "https://schema.org/MobileApplication",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.6",
      ratingCount: "128",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Stadtbasiertes Dating-Radar",
      "Echtzeit-Entdeckung von Personen in der Nähe",
      "Intelligenter Matching-Algorithmus",
      "Gruppenaktivitäten und Begegnungen",
      "Datenschutz-First mit Auto-Vanish-Modus",
      "Personalisierter Feed basierend auf Interaktion",
      "Ruhemodus für achtsames Dating",
    ],
    screenshot: `${baseUrl}/opengraph-image.png`,
  };
}

// AEO: FAQ Schema for Answer Engine snippets
export function getFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is PuQ.me?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${BRAND_NAME} is a mobile-first dating app focused on city-based encounters. It uses a presence-aware radar to discover people nearby in real time, with features like smart matching, group activities, and privacy controls including auto-vanish mode.`,
        },
      },
      {
        "@type": "Question",
        name: "How does the PuQ.me radar work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The radar shows people near your current location in real time. It uses watch-time tracking and engagement scoring to personalize your feed, showing you the most relevant profiles first based on your interaction patterns.",
        },
      },
      {
        "@type": "Question",
        name: "Is PuQ.me free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes, ${BRAND_NAME} is free to use. Core features including the radar, matching, chat, and group encounters are available at no cost.`,
        },
      },
      {
        "@type": "Question",
        name: "How does PuQ.me protect my privacy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${BRAND_NAME} offers multiple privacy features: Auto-Vanish mode automatically hides your profile after a set time, Phantom mode makes you invisible, and Calm mode limits daily interactions. All data processing follows DSGVO/GDPR regulations.`,
        },
      },
      {
        "@type": "Question",
        name: "Was ist PuQ.me?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${BRAND_NAME} ist eine Mobile-First-Dating-App, die auf stadtbasierte Begegnungen setzt. Sie nutzt ein Präsenz-Radar, um Menschen in der Nähe in Echtzeit zu entdecken, mit Funktionen wie Smart-Matching, Gruppenaktivitäten und Datenschutzkontrollen einschließlich Auto-Vanish-Modus.`,
        },
      },
    ],
  };
}

// GEO: Speakable content for voice assistants and generative engines
export function getSpeakableSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${BRAND_NAME} – ${BRAND_TAGLINE}`,
    url: baseUrl,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "[data-speakable='true']",
        "meta[name='description']",
        "h1",
      ],
    },
    description: BRAND_DESCRIPTION,
  };
}

// Social media posting schema for shared content
export function getSocialPostSchema(baseUrl: string, postData?: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
}) {
  if (!postData) return null;

  return {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    headline: postData.title,
    description: postData.description,
    url: postData.url,
    image: postData.imageUrl || `${baseUrl}/opengraph-image.png`,
    author: {
      "@type": "Organization",
      name: BRAND_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: BRAND_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon-512.png`,
      },
    },
  };
}

// Breadcrumb Schema for site navigation structure
export function getBreadcrumbSchema(baseUrl: string, crumbs: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url.startsWith("http") ? crumb.url : `${baseUrl}${crumb.url}`,
    })),
  };
}

// Geo/Place Schema for location-based features
export function getGeoSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: "PuQ.me – Stadtbasiertes Dating-Radar",
    description: "Standortbasierte Dating- und Begegnungsplattform in Städten in ganz Europa",
    url: baseUrl,
    geo: {
      "@type": "GeoShape",
      description: "Verfügbar in großen europäischen Städten",
    },
    hasMap: `${baseUrl}/nearby`,
  };
}

// CollectionPage schema for feed/list pages
export function getCollectionPageSchema(baseUrl: string, pagePath: string, title: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description: description,
    url: `${baseUrl}${pagePath}`,
    isPartOf: {
      "@type": "WebSite",
      name: "PuQ.me",
      url: baseUrl,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
        { "@type": "ListItem", position: 2, name: title, item: `${baseUrl}${pagePath}` },
      ],
    },
  };
}

// Event schema for group activities
export function getEventSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SocialEvent",
    name: "PuQ.me Gruppenaktivität",
    description: "Spontane Gruppenaktivitäten und Begegnungen in deiner Stadt",
    url: `${baseUrl}/groups`,
    organizer: {
      "@type": "Organization",
      name: "PuQ.me",
      url: baseUrl,
    },
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: "Deine Stadt",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
  };
}

// SearchAction for smart-match
export function getSearchActionSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Smart Match – KI-basiertes Matching",
    url: `${baseUrl}/smart-match`,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/smart-match?filter={search_term}`,
      },
      "query-input": "required name=search_term",
    },
  };
}

// Combine all schemas for the root layout
export function getAllStructuredData(baseUrl: string) {
  return [
    getWebsiteSchema(baseUrl),
    getOrganizationSchema(baseUrl),
    getSoftwareAppSchema(baseUrl),
    getFAQSchema(),
    getSpeakableSchema(baseUrl),
    getGeoSchema(baseUrl),
  ];
}
