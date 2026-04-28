"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  src: string;
  prompt?: string;
}

const BAR_COUNT = 48;

export function AudioPlayer({ src, prompt }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Initialise le Web Audio API une seule fois
  const initAudio = useCallback(() => {
    if (ctxRef.current || !audioRef.current) return;

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;

    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    ctxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
  }, []);

  // Boucle d'animation canvas
  const drawBars = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const barW = Math.floor(w / BAR_COUNT) - 2;

    for (let i = 0; i < BAR_COUNT; i++) {
      const value = data[Math.floor((i / BAR_COUNT) * data.length)] / 255;
      const barH = Math.max(4, value * h);
      const x = i * (barW + 2);
      const y = (h - barH) / 2;

      // Dégradé violet → brand
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      grad.addColorStop(0, "#a78bfa");
      grad.addColorStop(1, "#6366f1");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 2);
      ctx.fill();
    }

    animRef.current = requestAnimationFrame(drawBars);
  }, []);

  // Barres statiques (idle)
  const drawIdle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const barW = Math.floor(w / BAR_COUNT) - 2;
    const heights = Array.from({ length: BAR_COUNT }, (_, i) =>
      Math.abs(Math.sin(i * 0.4)) * 0.4 + 0.05
    );

    for (let i = 0; i < BAR_COUNT; i++) {
      const barH = Math.max(4, heights[i]! * h);
      const x = i * (barW + 2);
      const y = (h - barH) / 2;
      ctx.fillStyle = "#374151";
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 2);
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    drawIdle();
  }, [drawIdle]);

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    initAudio();
    if (ctxRef.current?.state === "suspended") await ctxRef.current.resume();

    if (playing) {
      audio.pause();
      cancelAnimationFrame(animRef.current);
      drawIdle();
      setPlaying(false);
    } else {
      await audio.play();
      setPlaying(true);
      drawBars();
    }
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress(audio.currentTime);
  }

  function handleLoadedMetadata() {
    setDuration(audioRef.current?.duration ?? 0);
  }

  function handleEnded() {
    setPlaying(false);
    setProgress(0);
    cancelAnimationFrame(animRef.current);
    drawIdle();
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
    setProgress(audio.currentTime);
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
      {prompt && (
        <p className="text-sm text-gray-400 italic mb-3 truncate">"{prompt}"</p>
      )}

      {/* Canvas waveform */}
      <canvas
        ref={canvasRef}
        width={560}
        height={64}
        className="w-full h-16 rounded-xl mb-3 cursor-pointer"
        onClick={togglePlay}
      />

      {/* Progress bar */}
      <input
        type="range"
        min={0}
        max={duration || 1}
        step={0.1}
        value={progress}
        onChange={handleSeek}
        className="w-full accent-brand-500 mb-2"
      />

      <div className="flex items-center justify-between gap-4">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 flex items-center justify-center transition-colors shrink-0"
        >
          {playing ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Temps */}
        <span className="text-xs text-gray-500 tabular-nums w-20">
          {fmt(progress)} / {fmt(duration)}
        </span>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <svg className="w-4 h-4 text-gray-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          <input
            type="range" min={0} max={1} step={0.05} value={volume}
            onChange={handleVolume}
            className="w-20 accent-brand-500"
          />
        </div>

        {/* Download */}
        <a href={src} download className="text-xs text-brand-400 hover:text-brand-300 shrink-0">
          Download
        </a>
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
    </div>
  );
}
