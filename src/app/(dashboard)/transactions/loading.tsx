export default function TransactionsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <div className="h-9 w-64 bg-muted/50 rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-muted/30 rounded-md animate-pulse" />
      </div>

      <div className="rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm p-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-40 bg-muted/50 rounded-md animate-pulse" />
          <div className="flex gap-3">
            <div className="h-9 w-48 bg-muted/30 rounded-md animate-pulse" />
            <div className="h-9 w-32 bg-muted/30 rounded-md animate-pulse" />
            <div className="h-9 w-16 bg-muted/30 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Table header skeleton */}
        <div className="grid grid-cols-6 gap-4 py-3 bg-muted/20 rounded-t-lg px-4 mb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 bg-muted/40 rounded animate-pulse" />
          ))}
        </div>

        {/* Table rows skeleton */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 py-4 border-b border-border/30 px-4">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="h-4 bg-muted/20 rounded animate-pulse" style={{ animationDelay: `${(i * 6 + j) * 50}ms` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
