"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-3">Something went wrong</h1>
          <p className="text-gray-400 mb-8">
            A critical error occurred. Please refresh the page.
          </p>
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
