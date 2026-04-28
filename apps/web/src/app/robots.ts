import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://musicai.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/privacy", "/terms"],
        disallow: ["/dashboard", "/settings", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
