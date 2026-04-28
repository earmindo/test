"use client";

import { useEffect } from "react";

export default function DashboardError({
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
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <h2 className="text-2xl font-bold mb-3">Dashboard error</h2>
      <p className="text-gray-400 mb-6">Something went wrong loading this page.</p>
      <button
        onClick={reset}
        className="bg-brand-600 hover:bg-brand-700 px-5 py-2.5 rounded-xl font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
