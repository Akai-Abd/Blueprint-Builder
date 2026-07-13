export function CardSkeleton() {
  return (
    <div className="skeleton skeleton--card" aria-hidden="true" />
  );
}

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

export function SummarySkeleton() {
  return (
    <div style={{ padding: 'var(--space-md)' }} aria-hidden="true">
      <div className="skeleton skeleton--text-lg" />
      <div className="skeleton skeleton--text" style={{ width: '80%' }} />
      <div className="skeleton skeleton--text" style={{ width: '60%' }} />
      <div className="skeleton skeleton--bar" style={{ width: '100%' }} />
      <div style={{ height: 'var(--space-lg)' }} />
      <div className="skeleton skeleton--text-lg" />
      <div className="skeleton skeleton--text" style={{ width: '70%' }} />
      <div className="skeleton skeleton--text" style={{ width: '50%' }} />
    </div>
  );
}
