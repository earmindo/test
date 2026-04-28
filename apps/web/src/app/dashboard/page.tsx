"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useGenerationsStore } from "@/stores/generationsStore";
import { useUserStore } from "@/stores/userStore";
import { UpgradeModal } from "@/components/UpgradeModal";
import { AudioPlayer } from "@/components/AudioPlayer";
import type { Generation } from "@musicai/shared";

const GENRES = ["electronic", "classical", "jazz", "rock", "hiphop", "ambient", "pop"];

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const upgradeParam = searchParams.get("upgrade") as "pro" | "studio" | null;
  const successParam = searchParams.get("success");

  const { user, fetch: fetchUser } = useUserStore();
  const { items, generating, generate, updateOne, fetch: fetchGenerations } = useGenerationsStore();

  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(30);
  const [genre, setGenre] = useState("");
  const [showUpgrade, setShowUpgrade] = useState<"pro" | "studio" | null>(null);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchUser();
    fetchGenerations();
    if (upgradeParam === "pro" || upgradeParam === "studio") {
      setShowUpgrade(upgradeParam);
    }
  }, []);

  useEffect(() => {
    if (!pollingId) return;
    pollRef.current = setInterval(async () => {
      const gen = await api.generations.get(pollingId);
      if (gen.status === "done" || gen.status === "failed") {
        clearInterval(pollRef.current!);
        updateOne(pollingId, gen);
        setPollingId(null);
        fetchUser(); // maj compteur du jour
      }
    }, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [pollingId]);

  async function handleGenerate() {
    if (!prompt.trim() || generating) return;

    const id = await generate({ prompt, duration, genre: genre || undefined, format: "mp3" });
    if (id) setPollingId(id);
  }

  const currentGen = pollingId ? items.find((g) => g.id === pollingId) : null;
  const isGenerating = generating || !!pollingId;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Banner succès paiement */}
      {successParam && (
        <div className="bg-green-900/30 border border-green-700 rounded-xl px-5 py-4 mb-6 text-green-300 text-sm">
          Your subscription is now active. Enjoy unlimited generations!
        </div>
      )}

      {/* Quota */}
      {user && user.plan === "free" && (
        <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 mb-6 text-sm">
          <span className="text-gray-400">
            {user.generationsToday ?? 0} / 3 free generations today
          </span>
          <button
            onClick={() => setShowUpgrade("pro")}
            className="text-brand-400 hover:text-brand-300 font-medium"
          >
            Upgrade for unlimited →
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Generate music</h1>

      {/* Form */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-8">
        <textarea
          className="w-full bg-gray-800 rounded-xl p-4 text-white placeholder-gray-500 resize-none mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500"
          rows={3}
          placeholder='Describe your music... e.g. "Chill lo-fi beats with rain sounds, 85 BPM"'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs text-gray-400 mb-2 block">Duration: {duration}s</label>
            <input
              type="range" min={5} max={120} value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="text-xs text-gray-400 mb-2 block">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Any</option>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition-colors"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              {generating ? "Submitting…" : "Generating your music…"}
            </span>
          ) : (
            "Generate"
          )}
        </button>
      </div>

      {/* Résultat en cours */}
      {currentGen && currentGen.status === "done" && currentGen.audioUrl && (
        <div className="mb-8">
          <AudioPlayer src={currentGen.audioUrl} prompt={currentGen.prompt} />
        </div>
      )}

      {/* Historique */}
      {items.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">History</h2>
          <div className="space-y-3">
            {items.map((gen) => (
              <GenerationCard key={gen.id} gen={gen} />
            ))}
          </div>
        </div>
      )}

      {showUpgrade && (
        <UpgradeModal plan={showUpgrade} onClose={() => setShowUpgrade(null)} />
      )}
    </div>
  );
}

function GenerationCard({ gen }: { gen: Generation }) {
  const statusColor = {
    done: "bg-green-900 text-green-400",
    failed: "bg-red-900 text-red-400",
    pending: "bg-yellow-900 text-yellow-400",
    processing: "bg-blue-900 text-blue-400",
  }[gen.status] ?? "bg-gray-800 text-gray-400";

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="flex items-start justify-between mb-2 gap-3">
        <p className="text-sm text-gray-300 flex-1 truncate">{gen.prompt}</p>
        <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statusColor}`}>
          {gen.status}
        </span>
      </div>
      {gen.audioUrl && (
        <div className="mt-3">
          <AudioPlayer src={gen.audioUrl} />
        </div>
      )}
    </div>
  );
}
