interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export function Skeleton({ className = '', height = 'h-4' }: { className?: string; height?: string }) {
  return <div className={`skeleton ${height} ${className}`} />;
}

export function SkeletonCard({ lines = 3 }: SkeletonProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton height="h-4" className="w-2/3" />
          <Skeleton height="h-3" className="w-1/3" />
        </div>
      </div>
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} height="h-3" className={i === lines - 2 ? 'w-1/2' : 'w-full'} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3, lines }: { count?: number; lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </div>
  );
}
