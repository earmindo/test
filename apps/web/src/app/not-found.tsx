import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-brand-500 font-bold text-xl mb-8">MusicAI</p>
        <h1 className="text-7xl font-bold text-gray-700 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-3">Page not found</h2>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="bg-brand-600 hover:bg-brand-700 px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/dashboard"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-5 py-2.5 rounded-xl transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
