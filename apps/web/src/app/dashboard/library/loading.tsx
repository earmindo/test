function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-800 rounded-xl animate-pulse ${className ?? ""}`} />;
}

export default function LibraryLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-6 space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36 ml-auto" />
        </div>
      </div>

      {/* Track cards skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900 rounded-2xl p-5 border border-gray-800 space-y-3">
            <div className="flex justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full ml-4 shrink-0" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
