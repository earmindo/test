import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MusicAI — Generate music with AI",
  description: "Create original music from text descriptions using ACE-Step 1.5, the most advanced AI music model.",
  openGraph: {
    title: "MusicAI",
    description: "Generate music from text prompts with AI",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">{children}</body>
    </html>
  );
}
