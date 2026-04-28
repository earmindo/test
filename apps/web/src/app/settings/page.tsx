"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useUserStore } from "@/stores/userStore";
import { UpgradeModal } from "@/components/UpgradeModal";
import { PLAN_FEATURES, PLAN_PRICES } from "@musicai/shared";
import { Navbar } from "@/components/Navbar";

type SubData = {
  plan: string;
  subscription: { status: string; current_period_end: string | null; cancel_at_period_end: boolean } | null;
};

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [sub, setSub] = useState<SubData | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState<"pro" | "studio" | null>(null);

  useEffect(() => {
    api.subscriptions.me().then(setSub);
  }, []);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const { portal_url } = await api.subscriptions.portal(
        `${window.location.origin}/settings`
      );
      window.location.href = portal_url;
    } catch {
      setPortalLoading(false);
    }
  }

  const plan = user?.plan ?? sub?.plan ?? "free";
  const features = PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES];
  const isPaid = plan !== "free";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Plan actuel */}
        <section className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current plan</h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold capitalize">{plan}</span>
              {isPaid && sub?.subscription?.current_period_end && (
                <p className="text-sm text-gray-400 mt-1">
                  {sub.subscription.cancel_at_period_end
                    ? `Cancels on ${new Date(sub.subscription.current_period_end).toLocaleDateString()}`
                    : `Renews on ${new Date(sub.subscription.current_period_end).toLocaleDateString()}`}
                </p>
              )}
            </div>

            {isPaid ? (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="text-sm border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {portalLoading ? "Loading…" : "Manage billing"}
              </button>
            ) : (
              <button
                onClick={() => setShowUpgrade("pro")}
                className="text-sm bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Upgrade
              </button>
            )}
          </div>

          {/* Features du plan */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Generations/day", features.generationsPerDay === "unlimited" ? "Unlimited" : `${features.generationsPerDay}`],
              ["Max duration", `${features.maxDuration}s`],
              ["Formats", features.formats.join(", ").toUpperCase()],
              ["Stems", features.stems ? "Yes" : "No"],
              ["Commercial use", features.commercialUse ? "Yes" : "No"],
              ["API access", features.apiAccess ? "Yes" : "No"],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-800 rounded-xl px-4 py-3">
                <p className="text-gray-500 text-xs mb-1">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Upgrade options si free */}
        {!isPaid && (
          <section className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
            <h2 className="text-lg font-semibold mb-4">Upgrade your plan</h2>
            <div className="grid grid-cols-2 gap-4">
              {(["pro", "studio"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setShowUpgrade(p)}
                  className={`rounded-xl p-4 border text-left transition-colors ${
                    p === "pro"
                      ? "border-brand-500/50 hover:border-brand-500 bg-brand-900/20"
                      : "border-gray-700 hover:border-gray-500 bg-gray-800/50"
                  }`}
                >
                  <p className="font-bold capitalize mb-1">{p}</p>
                  <p className="text-2xl font-bold">${PLAN_PRICES[p].monthly}<span className="text-sm text-gray-400">/mo</span></p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Profil */}
        {user && (
          <section className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Member since</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {showUpgrade && (
        <UpgradeModal plan={showUpgrade} onClose={() => setShowUpgrade(null)} />
      )}
    </div>
  );
}
