export function DashboardSkeleton() {
  return (
    <div className="dashboard__grid" aria-label="Loading blueprints" role="status">
      <span className="sr-only">Loading blueprints…</span>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton skeleton--card" />
      ))}
    </div>
  );
}
