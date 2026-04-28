import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://musicai.app";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "MusicAI — Generate music with AI",
    template: "%s | MusicAI",
  },
  description:
    "Create original music from text descriptions using ACE-Step 1.5. No instruments required.",
  keywords: ["AI music", "music generator", "text to music", "ACE-Step", "AI composer"],
  authors: [{ name: "MusicAI" }],
  creator: "MusicAI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "MusicAI",
    title: "MusicAI — Generate music with AI",
    description: "Create original music from text descriptions using ACE-Step 1.5.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MusicAI — Generate music with AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MusicAI — Generate music with AI",
    description: "Create original music from text descriptions using ACE-Step 1.5.",
    images: ["/og-image.png"],
    creator: "@musicai_app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export function pageMetadata(overrides: Partial<Metadata>): Metadata {
  return { ...defaultMetadata, ...overrides };
}
