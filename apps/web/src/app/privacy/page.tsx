export const metadata = {
  title: "Privacy Policy — MusicAI",
  description: "Privacy policy for MusicAI application.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a href="/" className="text-brand-500 text-sm mb-8 block">← MusicAI</a>

        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-10">Last updated: April 28, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">1. Who we are</h2>
            <p>
              MusicAI ("we", "our", "us") operates the MusicAI mobile application and website
              located at musicai.app. This policy explains how we collect, use, and protect your
              personal data when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">2. Data we collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account data:</strong> email address, name, profile photo (if you sign in with Google).</li>
              <li><strong>Usage data:</strong> music prompts you enter, generated audio files, generation history, plan and subscription status.</li>
              <li><strong>Payment data:</strong> managed entirely by Stripe (web) or Apple/Google (mobile). We never store full card numbers.</li>
              <li><strong>Device data:</strong> push notification token, device OS version (to send generation-complete notifications).</li>
              <li><strong>Log data:</strong> IP address, request timestamps, HTTP status codes — retained for up to 30 days for security purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">3. How we use your data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, maintain and improve the MusicAI service.</li>
              <li>To process payments and manage your subscription.</li>
              <li>To send push notifications about your music generation status.</li>
              <li>To enforce our usage limits and prevent abuse.</li>
              <li>To comply with legal obligations.</li>
            </ul>
            <p className="mt-3">We do <strong>not</strong> sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">4. Your generated content</h2>
            <p>
              Audio files you generate are stored on our servers (AWS S3) and linked to your account.
              You retain full ownership of the music you create, subject to the license terms of your plan.
              We may use aggregated, anonymized usage statistics (e.g., popular genres) to improve our AI model.
              We will never use your specific prompts or audio to train external models without explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">5. Data sharing</h2>
            <p>We share data only with the following trusted third-party providers:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase</strong> — authentication and database hosting.</li>
              <li><strong>Stripe</strong> — payment processing (web subscriptions).</li>
              <li><strong>RevenueCat</strong> — in-app purchase management (mobile).</li>
              <li><strong>Amazon Web Services (S3)</strong> — audio file storage.</li>
              <li><strong>Expo / EAS</strong> — push notification delivery.</li>
            </ul>
            <p className="mt-3">All providers are contractually bound to handle your data securely and in compliance with GDPR.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">6. Data retention</h2>
            <p>
              We retain your account data as long as your account is active. Generated audio files are
              kept for 12 months after creation, then automatically deleted. You may request earlier
              deletion at any time. Log data is purged after 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">7. Your rights (GDPR)</h2>
            <p>If you are in the European Economic Area, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate data.</li>
              <li>Delete your account and all associated data.</li>
              <li>Export your data in a portable format.</li>
              <li>Withdraw consent for non-essential processing at any time.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at <strong>privacy@musicai.app</strong>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">8. Cookies</h2>
            <p>
              Our website uses only essential cookies required for authentication (session tokens).
              We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">9. Children</h2>
            <p>
              MusicAI is not directed at children under 13. We do not knowingly collect personal data
              from children. If you believe we have done so inadvertently, contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">10. Changes to this policy</h2>
            <p>
              We may update this policy periodically. We will notify you of significant changes via
              email or an in-app notification at least 14 days before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">11. Contact</h2>
            <p>
              Questions about this policy? Email us at{" "}
              <a href="mailto:privacy@musicai.app" className="text-brand-400 hover:text-brand-300">
                privacy@musicai.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
