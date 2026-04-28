"use client";

import { useEffect, useState, useMemo } from "react";
import { useGenerationsStore } from "@/stores/generationsStore";
import { AudioPlayer } from "@/components/AudioPlayer";
import { api } from "@/lib/api";
import type { Generation } from "@musicai/shared";

const GENRES = ["all", "electronic", "classical", "jazz", "rock", "hiphop", "ambient", "pop"];
const STATUSES = ["all", "done", "pending", "processing", "failed"] as const;

export default function LibraryPage() {
  const { items, loading, loadingMore, hasMore, fetch, fetchMore } = useGenerationsStore();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");
  const [status, setStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "longest">("newest");

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filtered = useMemo(() => {
    let list = [...items];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((g) => g.prompt.toLowerCase().includes(q));
    }
    if (genre !== "all") {
      list = list.filter((g) => g.genre === genre);
    }
    if (status !== "all") {
      list = list.filter((g) => g.status === status);
    }

    list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return b.duration - a.duration;
    });

    return list;
  }, [items, search, genre, status, sortBy]);

  const doneCount = items.filter((g) => g.status === "done").length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Library</h1>
          <p className="text-gray-500 text-sm mt-1">{doneCount} track{doneCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-6 space-y-3">
        {/* Recherche */}
        <input
          type="text"
          placeholder="Search by prompt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <div className="flex flex-wrap gap-3">
          {/* Genre */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>{g === "all" ? "All genres" : g}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-gray-500">Sort</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="longest">Longest first</option>
            </select>
          </div>
        </div>
      </div>

      {/* Résultats */}
      {loading && (
        <div className="text-center py-16 text-gray-500">Loading your library…</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          {items.length === 0 ? "No tracks yet. Generate your first music!" : "No tracks match your filters."}
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((gen) => (
          <TrackCard key={gen.id} gen={gen} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={fetchMore}
            disabled={loadingMore}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

function TrackCard({ gen }: { gen: Generation }) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);

  async function handleShare() {
    setCopying(true);
    try {
      const { share_token } = await api.share.create(gen.id);
      const url = `${window.location.origin}/s/${share_token}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
    } finally {
      setCopying(false);
    }
  }

  const date = new Date(gen.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const statusColors: Record<string, string> = {
    done: "text-green-400 bg-green-900/30",
    failed: "text-red-400 bg-red-900/30",
    pending: "text-yellow-400 bg-yellow-900/30",
    processing: "text-blue-400 bg-blue-900/30",
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{gen.prompt}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>{date}</span>
            <span>{gen.duration}s</span>
            {gen.genre && <span className="capitalize">{gen.genre}</span>}
            {gen.format && <span className="uppercase">{gen.format}</span>}
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${statusColors[gen.status] ?? "text-gray-400 bg-gray-800"}`}>
          {gen.status}
        </span>
      </div>

      {gen.audioUrl && <AudioPlayer src={gen.audioUrl} />}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {gen.status === "done" && (
          <button
            onClick={handleShare}
            disabled={copying}
            className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {copying ? "Copying…" : shareUrl ? "✓ Link copied!" : "Share"}
          </button>
        )}
        {shareUrl && (
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-400 hover:text-brand-300"
          >
            Open link →
          </a>
        )}
      </div>

      {gen.stemUrls && Object.keys(gen.stemUrls).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(gen.stemUrls).map(([name, url]) => (
            <a
              key={name}
              href={url as string}
              download
              className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-lg capitalize transition-colors"
            >
              ↓ {name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
