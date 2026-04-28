"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import type { Generation } from "@musicai/shared";

type GenerationStatus = "idle" | "pending" | "polling" | "done" | "failed";

export default function DashboardPage() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(30);
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [currentGen, setCurrentGen] = useState<Generation | null>(null);
  const [history, setHistory] = useState<Generation[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    api.generations.list().then((r) => setHistory(r.items));
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  async function handleGenerate() {
    if (!prompt.trim() || status === "pending" || status === "polling") return;
    setStatus("pending");
    setCurrentGen(null);

    try {
      const { generation_id } = await api.generations.create({
        prompt,
        duration,
        genre: genre || undefined,
        format: "mp3",
      });

      setStatus("polling");
      pollingRef.current = setInterval(async () => {
        const gen = await api.generations.get(generation_id);
        if (gen.status === "done" || gen.status === "failed") {
          clearInterval(pollingRef.current!);
          setCurrentGen(gen);
          setStatus(gen.status === "done" ? "done" : "failed");
          setHistory((prev) => [gen, ...prev]);
        }
      }, 2000);
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Generate music</h1>

      {/* Form */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-8">
        <textarea
          className="w-full bg-gray-800 rounded-xl p-4 text-white placeholder-gray-500 resize-none mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500"
          rows={3}
          placeholder="Describe your music... e.g. 'Upbeat lo-fi hip hop with rainy day vibes, 90 BPM'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="flex gap-4 flex-wrap mb-4">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-400 mb-1 block">Duration: {duration}s</label>
            <input
              type="range"
              min={5}
              max={120}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-400 mb-1 block">Genre (optional)</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Any genre</option>
              {["electronic", "classical", "jazz", "rock", "hiphop", "ambient", "pop"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || status === "pending" || status === "polling"}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition-colors"
        >
          {status === "pending" || status === "polling" ? "Generating..." : "Generate"}
        </button>
      </div>

      {/* Current result */}
      {currentGen && currentGen.status === "done" && currentGen.audio_url && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-brand-500 mb-8">
          <p className="text-sm text-gray-400 mb-2">{currentGen.prompt}</p>
          <audio controls src={currentGen.audio_url} className="w-full" />
          <a
            href={currentGen.audio_url}
            download
            className="inline-block mt-3 text-sm text-brand-400 hover:text-brand-300"
          >
            Download MP3
          </a>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">History</h2>
          <div className="space-y-3">
            {history.map((gen) => (
              <div key={gen.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-300 truncate flex-1">{gen.prompt}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ml-3 ${
                      gen.status === "done"
                        ? "bg-green-900 text-green-400"
                        : gen.status === "failed"
                        ? "bg-red-900 text-red-400"
                        : "bg-yellow-900 text-yellow-400"
                    }`}
                  >
                    {gen.status}
                  </span>
                </div>
                {gen.audio_url && <audio controls src={gen.audio_url} className="w-full" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
