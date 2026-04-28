"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-2xl font-bold mb-2">Email sent</h2>
          <p className="text-gray-400 mb-6">
            Check your inbox for the password reset link.
          </p>
          <Link href="/login" className="text-brand-400 hover:text-brand-300 text-sm">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center text-2xl font-bold text-brand-500 mb-8">
          MusicAI
        </Link>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h1 className="text-xl font-bold mb-2 text-center">Reset password</h1>
          <p className="text-sm text-gray-400 text-center mb-6">
            Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="you@example.com"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl py-3 font-semibold transition-colors"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link href="/login" className="text-brand-400 hover:text-brand-300">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
