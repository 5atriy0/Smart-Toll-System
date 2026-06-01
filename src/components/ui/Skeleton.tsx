export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <div className="rounded-xl bg-card border border-border p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 rounded bg-muted shimmer" />
        <div className="h-8 w-8 rounded-lg bg-muted shimmer" />
      </div>
      <div className="h-8 w-32 rounded bg-muted shimmer mb-2" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 w-full rounded bg-muted shimmer mt-2" />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden animate-pulse">
      <div className="grid grid-cols-5 gap-4 p-4 border-b border-border bg-muted/30">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-3 w-16 rounded bg-muted shimmer" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid grid-cols-5 gap-4 p-4 border-b border-border/50">
          {Array.from({ length: 5 }).map((_, c) => (
            <div key={c} className="h-3 w-full rounded bg-muted/50 shimmer" />
          ))}
        </div>
      ))}
    </div>
  );
}
