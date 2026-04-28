import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SharedPlayer } from "./SharedPlayer";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.musicai.app";

async function fetchTrack(token: string) {
  try {
    const res = await fetch(`${API}/api/v1/share/public/${token}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const track = await fetchTrack(params.token);
  if (!track) return { title: "Track not found | MusicAI" };

  const short = track.prompt.length > 60 ? track.prompt.slice(0, 60) + "…" : track.prompt;

  return {
    title: `"${short}" | MusicAI`,
    description: `Listen to this AI-generated track on MusicAI: "${short}"`,
    openGraph: {
      title: `AI Music: "${short}"`,
      description: "Generated with MusicAI — Create music from text.",
      type: "music.song",
      audio: track.audio_url,
    },
    twitter: {
      card: "summary_large_image",
      title: `AI Music: "${short}"`,
      description: "Generated with MusicAI",
    },
  };
}

export default async function SharedTrackPage({ params }: { params: { token: string } }) {
  const track = await fetchTrack(params.token);
  if (!track) notFound();

  const date = new Date(track.created_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <Link href="/" className="text-brand-500 font-bold text-xl block text-center mb-10">
          MusicAI
        </Link>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <p className="text-gray-400 text-sm mb-1">AI-generated track</p>
          <p className="text-white font-semibold text-lg mb-1 leading-snug">
            "{track.prompt}"
          </p>
          <div className="flex gap-3 text-xs text-gray-500 mb-5">
            {track.genre && <span className="capitalize">{track.genre}</span>}
            <span>{track.duration}s</span>
            <span>{date}</span>
          </div>

          <SharedPlayer src={track.audio_url} />
        </div>

        <div className="mt-6 flex gap-3 justify-center flex-wrap text-sm">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎵 Listen to this AI-generated music: "${track.prompt.slice(0, 60)}" — made with @musicai_app`)}&url=${encodeURIComponent(`https://musicai.app/s/${params.token}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="bg-[#1d9bf0]/10 hover:bg-[#1d9bf0]/20 border border-[#1d9bf0]/30 px-4 py-2 rounded-xl text-[#1d9bf0] transition-colors"
          >
            Share on X
          </a>
          <a
            href={track.audio_url}
            download
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-xl transition-colors"
          >
            Download MP3
          </a>
          <Link
            href="/signup"
            className="bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl font-medium transition-colors"
          >
            Create your own →
          </Link>
        </div>
      </div>
    </main>
  );
}
