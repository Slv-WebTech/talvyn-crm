import { formatCurrency } from '../../utils/formatters.js'

export function SalesPerformanceTable({ rows }) {
  return (
    <div className="dashboard-card">
      <h3>Sales Performance</h3>
      {!rows.length && <p className="empty-hint">No won deals yet.</p>}
      {rows.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Rep</th>
              <th>Deals Won</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.userId}>
                <td>{row.name}</td>
                <td>{row.dealsWon}</td>
                <td>{formatCurrency(row.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
