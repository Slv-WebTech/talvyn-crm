import { Link } from 'react-router-dom'
import { Users, Plus } from 'lucide-react'
import { Button } from '../common/Button.jsx'

export function CustomerTable({ customers, onCreate }) {
  if (!customers.length) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">
          <Users size={20} strokeWidth={2} />
        </span>
        <p>No customers yet. Add your first customer to get started.</p>
        {onCreate && (
          <Button onClick={onCreate}>
            <Plus size={16} /> Add Customer
          </Button>
        )}
      </div>
    )
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Company</th>
          <th>Email</th>
          <th>Phone</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((customer) => (
          <tr key={customer.id}>
            <td>
              <Link to={`/customers/${customer.id}`}>{customer.name}</Link>
            </td>
            <td>{customer.company ?? '—'}</td>
            <td>{customer.email ?? '—'}</td>
            <td>{customer.phone ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
