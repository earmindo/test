function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-800 rounded-xl animate-pulse ${className ?? ""}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <Skeleton className="h-9 w-48" />

      {/* Quota banner skeleton */}
      <Skeleton className="h-12 w-full rounded-2xl" />

      {/* Form skeleton */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <Skeleton className="h-11 w-full" />
      </div>

      {/* Results skeleton */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-900 rounded-2xl p-5 border border-gray-800 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
