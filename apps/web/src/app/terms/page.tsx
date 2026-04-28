export const metadata = {
  title: "Terms of Service — MusicAI",
  description: "Terms of service for MusicAI application.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a href="/" className="text-brand-500 text-sm mb-8 block">← MusicAI</a>

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-400 mb-10">Last updated: April 28, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance</h2>
            <p>
              By creating an account or using MusicAI, you agree to these Terms of Service.
              If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">2. Subscriptions & payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Free plan: 3 generations per day, 30s max, MP3 only, personal use.</li>
              <li>Pro plan: unlimited generations, 120s max, MP3 & WAV, personal use.</li>
              <li>Studio plan: unlimited, all formats, stems, commercial use, API access.</li>
              <li>Subscriptions auto-renew. You can cancel anytime from Settings.</li>
              <li>Refunds follow the refund policy of the platform (Stripe / Apple / Google).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">3. Intellectual property</h2>
            <p>
              You own the music you generate on MusicAI. By using the service you grant us a
              limited, non-exclusive license to store and process your generated audio solely to
              deliver the service to you. Commercial use of generated music requires a Studio plan.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">4. Acceptable use</h2>
            <p>You agree not to use MusicAI to generate content that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Infringes the copyright or intellectual property of others.</li>
              <li>Is designed to harass, defame, or harm individuals or groups.</li>
              <li>Violates any applicable law or regulation.</li>
              <li>Is used to circumvent our rate limiting or usage policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">5. Service availability</h2>
            <p>
              We aim for high availability but do not guarantee uninterrupted service. AI generation
              times depend on server load. We are not liable for temporary unavailability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">6. Limitation of liability</h2>
            <p>
              MusicAI is provided "as is". To the maximum extent permitted by law, we are not liable
              for indirect, incidental, or consequential damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">7. Changes to terms</h2>
            <p>
              We may update these terms. Continued use of MusicAI after changes constitutes acceptance
              of the new terms. Material changes will be communicated via email or in-app notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">8. Contact</h2>
            <p>
              Questions?{" "}
              <a href="mailto:legal@musicai.app" className="text-brand-400 hover:text-brand-300">
                legal@musicai.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
