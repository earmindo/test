import Link from "next/link";
import { PLAN_PRICES, PLAN_FEATURES } from "@musicai/shared";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold text-brand-500">MusicAI</span>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Start free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-6 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-brand-500 to-purple-400 bg-clip-text text-transparent">
          Generate music with AI
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Describe the music you imagine. Our AI powered by ACE-Step 1.5 creates it in seconds.
          No instruments required.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/signup"
            className="bg-brand-600 hover:bg-brand-700 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            Try for free
          </Link>
          <Link
            href="#demo"
            className="border border-gray-700 hover:border-gray-500 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            See examples
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Text to music", desc: "Describe any style, mood or tempo. Our AI understands your vision." },
            { title: "High quality audio", desc: "MP3, WAV and FLAC up to 120 seconds of studio-quality audio." },
            { title: "Separate stems", desc: "Get drums, bass, melody and other tracks separately. Studio plan." },
          ].map((f) => (
            <div key={f.title} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 max-w-5xl mx-auto" id="pricing">
        <h2 className="text-3xl font-bold text-center mb-12">Simple pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {(["free", "pro", "studio"] as const).map((plan) => {
            const price = PLAN_PRICES[plan];
            const features = PLAN_FEATURES[plan];
            const isPopular = plan === "pro";
            return (
              <div
                key={plan}
                className={`rounded-2xl p-6 border ${
                  isPopular ? "border-brand-500 bg-brand-900/20" : "border-gray-800 bg-gray-900"
                }`}
              >
                {isPopular && (
                  <span className="text-xs font-bold bg-brand-600 px-3 py-1 rounded-full mb-4 inline-block">
                    POPULAR
                  </span>
                )}
                <h3 className="text-xl font-bold capitalize mb-1">{plan}</h3>
                <div className="text-3xl font-bold mb-6">
                  {price.monthly === 0 ? "Free" : `$${price.monthly}`}
                  {price.monthly > 0 && <span className="text-lg text-gray-400">/mo</span>}
                </div>
                <ul className="space-y-2 text-sm text-gray-300 mb-8">
                  <li>
                    {features.generationsPerDay === "unlimited"
                      ? "Unlimited generations"
                      : `${features.generationsPerDay} generations/day`}
                  </li>
                  <li>Up to {features.maxDuration}s per track</li>
                  <li>{features.formats.join(", ").toUpperCase()} formats</li>
                  {features.stems && <li>Separate stems</li>}
                  {features.commercialUse && <li>Commercial use</li>}
                  {features.apiAccess && <li>API access</li>}
                </ul>
                <Link
                  href={plan === "free" ? "/signup" : `/signup?plan=${plan}`}
                  className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
                    isPopular
                      ? "bg-brand-600 hover:bg-brand-700"
                      : "border border-gray-700 hover:border-gray-500"
                  }`}
                >
                  {plan === "free" ? "Get started" : "Subscribe"}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="text-center py-10 text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} MusicAI. All rights reserved.
      </footer>
    </main>
  );
}
