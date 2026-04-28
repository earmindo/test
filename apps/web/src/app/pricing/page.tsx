import type { Metadata } from "next";
import Link from "next/link";
import { PLAN_FEATURES, PLAN_PRICES } from "@musicai/shared";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description: "Simple, transparent pricing. Start free with 3 generations/day. Upgrade to Pro or Studio for unlimited music creation.",
  openGraph: { title: "MusicAI Pricing", url: "/pricing" },
});

const FEATURES_LABELS = [
  { key: "generationsPerDay", label: "Generations per day" },
  { key: "maxDuration", label: "Max track duration" },
  { key: "formats", label: "Audio formats" },
  { key: "stems", label: "Separate stems" },
  { key: "commercialUse", label: "Commercial use" },
  { key: "apiAccess", label: "API access" },
] as const;

function formatValue(key: string, value: unknown): string {
  if (key === "generationsPerDay") return value === "unlimited" ? "Unlimited" : `${value}/day`;
  if (key === "maxDuration") return `${value}s`;
  if (Array.isArray(value)) return value.join(", ").toUpperCase();
  if (value === true) return "✓";
  if (value === false) return "—";
  return String(value);
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto border-b border-gray-900">
        <Link href="/" className="text-xl font-bold text-brand-500">MusicAI</Link>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Login</Link>
          <Link href="/signup" className="bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Start free
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="text-center py-16 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Start free, upgrade when you need more. No hidden fees.
        </p>
      </section>

      {/* Plans */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {(["free", "pro", "studio"] as const).map((plan) => {
            const price = PLAN_PRICES[plan];
            const features = PLAN_FEATURES[plan];
            const isPopular = plan === "pro";

            return (
              <div
                key={plan}
                className={`rounded-2xl p-7 border flex flex-col ${
                  isPopular
                    ? "border-brand-500 bg-gradient-to-b from-brand-900/30 to-transparent"
                    : "border-gray-800 bg-gray-900/50"
                }`}
              >
                {isPopular && (
                  <span className="self-start text-xs font-bold bg-brand-600 px-3 py-1 rounded-full mb-4">
                    MOST POPULAR
                  </span>
                )}

                <h2 className="text-2xl font-bold capitalize mb-2">{plan}</h2>

                <div className="mb-6">
                  {price.monthly === 0 ? (
                    <span className="text-4xl font-bold">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">${price.monthly}</span>
                      <span className="text-gray-400">/month</span>
                      <p className="text-sm text-gray-500 mt-1">
                        or ${price.yearly}/year (save {Math.round(100 - (price.yearly / (price.monthly * 12)) * 100)}%)
                      </p>
                    </>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {FEATURES_LABELS.map(({ key, label }) => {
                    const value = features[key as keyof typeof features];
                    const isNegative = value === false;
                    return (
                      <li key={key} className={`flex items-start gap-3 text-sm ${isNegative ? "text-gray-600" : "text-gray-300"}`}>
                        <span className={`mt-0.5 ${isNegative ? "text-gray-700" : "text-brand-500"}`}>
                          {isNegative ? "✗" : "✓"}
                        </span>
                        <span>
                          <strong>{formatValue(key, value)}</strong> {label}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <Link
                  href={plan === "free" ? "/signup" : `/signup?plan=${plan}`}
                  className={`block text-center py-3 rounded-xl font-semibold transition-colors text-sm ${
                    isPopular
                      ? "bg-brand-600 hover:bg-brand-700"
                      : plan === "free"
                      ? "border border-gray-700 hover:border-gray-500"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  {plan === "free" ? "Get started free" : `Get ${plan}`}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="border border-gray-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 bg-gray-900/80 px-6 py-4 text-sm font-semibold border-b border-gray-800">
            <div className="text-gray-400">Feature</div>
            <div className="text-center">Free</div>
            <div className="text-center text-brand-400">Pro</div>
            <div className="text-center">Studio</div>
          </div>
          {FEATURES_LABELS.map(({ key, label }, i) => (
            <div
              key={key}
              className={`grid grid-cols-4 px-6 py-4 text-sm ${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900/30"}`}
            >
              <div className="text-gray-400">{label}</div>
              {(["free", "pro", "studio"] as const).map((plan) => {
                const value = PLAN_FEATURES[plan][key as keyof typeof PLAN_FEATURES.free];
                return (
                  <div
                    key={plan}
                    className={`text-center ${value === false ? "text-gray-700" : plan === "pro" ? "text-brand-300" : "text-white"}`}
                  >
                    {formatValue(key, value)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes. You can cancel your subscription at any time. You'll keep access until the end of the billing period.",
              },
              {
                q: "What happens when I hit my daily limit?",
                a: "On the free plan, you get 3 generations per day. The counter resets at midnight UTC. Upgrade to Pro or Studio for unlimited generations.",
              },
              {
                q: "Can I use the music commercially?",
                a: "Commercial use is available on the Studio plan. Free and Pro tracks are for personal, non-commercial use only.",
              },
              {
                q: "What is a stem?",
                a: "Stems are the individual tracks that make up a song: drums, bass, melody, vocals, etc. Available on Studio plan only.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
