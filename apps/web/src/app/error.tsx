"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-brand-500 font-bold text-xl mb-8">MusicAI</p>
        <h1 className="text-4xl font-bold mb-3">Something went wrong</h1>
        <p className="text-gray-400 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-brand-600 hover:bg-brand-700 px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
