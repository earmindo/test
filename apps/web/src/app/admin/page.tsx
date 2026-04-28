"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Stats = {
  users: { total: number; new_24h: number; new_7d: number; by_plan: Record<string, number> };
  generations: { total: number; last_24h: number; last_7d: number; success_rate: number; failed: number };
  popular_genres: { genre: string; count: number }[];
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  async function loadStats(s: string) {
    setError("");
    try {
      const { data } = await axios.get<Stats>(`${API}/api/v1/admin/stats`, {
        headers: { "X-Admin-Secret": s },
      });
      setStats(data);
      setAuthed(true);
    } catch {
      setError("Wrong secret or server error.");
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold mb-6">Admin access</h1>
          <input
            type="password"
            placeholder="Admin secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadStats(secret)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            onClick={() => loadStats(secret)}
            className="w-full bg-brand-600 hover:bg-brand-700 py-3 rounded-xl font-semibold transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const planColors: Record<string, string> = {
    free: "bg-gray-700",
    pro: "bg-brand-600",
    studio: "bg-purple-600",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => { setAuthed(false); setStats(null); }}
          className="text-sm text-gray-500 hover:text-white"
        >
          Logout
        </button>
      </div>

      {/* Users */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-400">Users</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Total users", stats.users.total],
            ["New (24h)", stats.users.new_24h],
            ["New (7d)", stats.users.new_7d],
            ["Paid", (stats.users.by_plan.pro ?? 0) + (stats.users.by_plan.studio ?? 0)],
          ].map(([label, value]) => (
            <StatCard key={String(label)} label={String(label)} value={String(value)} />
          ))}
        </div>

        {/* Plan breakdown */}
        <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-sm text-gray-400 mb-3">Users by plan</p>
          <div className="space-y-2">
            {Object.entries(stats.users.by_plan).map(([plan, count]) => {
              const pct = Math.round((count / stats.users.total) * 100);
              return (
                <div key={plan}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{plan}</span>
                    <span className="text-gray-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${planColors[plan] ?? "bg-gray-600"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Générations */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-400">Generations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Total", stats.generations.total],
            ["Last 24h", stats.generations.last_24h],
            ["Last 7d", stats.generations.last_7d],
            ["Success rate", `${stats.generations.success_rate}%`],
          ].map(([label, value]) => (
            <StatCard key={String(label)} label={String(label)} value={String(value)} />
          ))}
        </div>
      </section>

      {/* Genres populaires */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-gray-400">Top genres (30d)</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="space-y-2">
            {stats.popular_genres.map(({ genre, count }, i) => (
              <div key={genre} className="flex items-center gap-3 text-sm">
                <span className="text-gray-600 w-4">{i + 1}</span>
                <span className="capitalize flex-1">{genre}</span>
                <span className="text-gray-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
