export function Skeleton({ width, height = '1em', rounded, circle, style, className = '' }) {
  return (
    <span
      className={`skeleton ${circle ? 'skeleton-circle' : ''} ${className}`.trim()}
      style={{ width, height, borderRadius: circle ? '50%' : rounded, ...style }}
      aria-hidden="true"
    />
  )
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="data-table skeleton-table" aria-hidden="true">
      <div className="skeleton-table-head">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width={i === 0 ? '40%' : '70%'} height="0.7rem" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div className="skeleton-table-row" key={r}>
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} width={c === 0 ? '60%' : '80%'} height="0.9rem" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function StatGridSkeleton({ count = 5 }) {
  return (
    <div className="stat-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="stat-card" key={i}>
          <Skeleton width={32} height={32} rounded="var(--radius-sm)" style={{ marginBottom: 'var(--space-3)' }} />
          <Skeleton width="60%" height="1.6rem" style={{ marginBottom: 'var(--space-2)' }} />
          <Skeleton width="40%" height="0.75rem" />
        </div>
      ))}
    </div>
  )
}

export function DashboardCardsSkeleton() {
  return (
    <div className="dashboard-grid" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="dashboard-card" key={i}>
          <Skeleton width="45%" height="0.95rem" style={{ marginBottom: 'var(--space-4)' }} />
          <Skeleton width="100%" height={190} rounded="var(--radius-sm)" />
        </div>
      ))}
    </div>
  )
}

export function KanbanSkeleton({ columns = 5 }) {
  return (
    <div className="kanban-board" aria-hidden="true">
      {Array.from({ length: columns }).map((_, i) => (
        <div className="kanban-column" key={i}>
          <div className="kanban-column-header">
            <Skeleton width="60%" height="0.8rem" />
            <Skeleton width={20} height={16} rounded="999px" />
          </div>
          <div className="kanban-column-cards">
            {Array.from({ length: 2 }).map((_, c) => (
              <div className="opportunity-card" key={c}>
                <Skeleton width="80%" height="0.9rem" style={{ marginBottom: 'var(--space-2)' }} />
                <Skeleton width="40%" height="0.8rem" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function RecordListSkeleton({ rows = 4 }) {
  return (
    <ul className="record-list" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <li className="record-list-item" key={i}>
          <div style={{ flex: 1 }}>
            <Skeleton width="45%" height="0.9rem" style={{ marginBottom: 'var(--space-2)' }} />
            <Skeleton width="65%" height="0.8rem" />
          </div>
          <Skeleton width={72} height={24} rounded="999px" />
        </li>
      ))}
    </ul>
  )
}

export function DetailSkeleton({ cards = 3 }) {
  return (
    <div className="detail-grid" aria-hidden="true">
      {Array.from({ length: cards }).map((_, i) => (
        <div className="detail-card" key={i}>
          <Skeleton width="30%" height="0.8rem" style={{ marginBottom: 'var(--space-4)' }} />
          <Skeleton width="90%" height="0.9rem" style={{ marginBottom: 'var(--space-2)' }} />
          <Skeleton width="75%" height="0.9rem" style={{ marginBottom: 'var(--space-2)' }} />
          <Skeleton width="60%" height="0.9rem" />
        </div>
      ))}
    </div>
  )
}
