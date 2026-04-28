"use client";

import { useState } from "react";
import { PLAN_FEATURES, PLAN_PRICES } from "@musicai/shared";
import { api } from "@/lib/api";

interface Props {
  plan: "pro" | "studio";
  onClose: () => void;
}

export function UpgradeModal({ plan, onClose }: Props) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);

  const features = PLAN_FEATURES[plan];
  const price = PLAN_PRICES[plan];
  const priceKey = `${plan}_${billing}`;

  async function handleSubscribe() {
    setLoading(true);
    try {
      const { checkout_url } = await api.subscriptions.checkout(
        priceKey,
        `${window.location.origin}/dashboard?success=1`,
        `${window.location.origin}/dashboard`
      );
      window.location.href = checkout_url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl"
        >
          ✕
        </button>

        <div className="mb-6">
          <span className="text-xs font-bold bg-brand-600 px-3 py-1 rounded-full capitalize">
            {plan}
          </span>
          <h2 className="text-2xl font-bold mt-3">
            Upgrade to {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </h2>
        </div>

        {/* Billing toggle */}
        <div className="flex gap-2 mb-6 bg-gray-800 rounded-xl p-1">
          {(["monthly", "yearly"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                billing === b ? "bg-brand-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {b === "monthly" ? "Monthly" : "Yearly"}
              {b === "yearly" && (
                <span className="ml-1 text-xs text-green-400">
                  Save {Math.round(100 - (price.yearly / (price.monthly * 12)) * 100)}%
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="text-4xl font-bold mb-6">
          ${billing === "monthly" ? price.monthly : Math.round(price.yearly / 12)}
          <span className="text-lg text-gray-400">/mo</span>
          {billing === "yearly" && (
            <p className="text-sm text-gray-500 mt-1">Billed ${price.yearly}/year</p>
          )}
        </div>

        <ul className="space-y-2 mb-8 text-sm text-gray-300">
          <li>✓ {features.generationsPerDay === "unlimited" ? "Unlimited" : features.generationsPerDay} generations/day</li>
          <li>✓ Up to {features.maxDuration}s per track</li>
          <li>✓ {features.formats.join(", ").toUpperCase()} formats</li>
          {features.stems && <li>✓ Separate stems (drums, bass, melody…)</li>}
          {features.commercialUse && <li>✓ Commercial use license</li>}
          {features.apiAccess && <li>✓ API access</li>}
        </ul>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 py-4 rounded-xl font-semibold transition-colors"
        >
          {loading ? "Redirecting to Stripe..." : `Subscribe — $${billing === "monthly" ? price.monthly : price.yearly}/${billing === "monthly" ? "mo" : "yr"}`}
        </button>

        <p className="text-xs text-gray-600 text-center mt-4">
          Cancel anytime · Secured by Stripe
        </p>
      </div>
    </div>
  );
}
