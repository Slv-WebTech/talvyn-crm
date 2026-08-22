export function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="stat-card">
      {Icon && (
        <span className="stat-card-icon">
          <Icon size={16} strokeWidth={2.25} />
        </span>
      )}
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  )
}
