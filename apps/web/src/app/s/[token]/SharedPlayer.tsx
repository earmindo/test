"use client";

import { AudioPlayer } from "@/components/AudioPlayer";

export function SharedPlayer({ src }: { src: string }) {
  return <AudioPlayer src={src} />;
}
