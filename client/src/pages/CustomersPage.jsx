import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { SearchBar } from '../components/common/SearchBar.jsx'
import { Button } from '../components/common/Button.jsx'
import { Modal } from '../components/common/Modal.jsx'
import { TableSkeleton } from '../components/common/Skeleton.jsx'
import { CustomerTable } from '../components/customers/CustomerTable.jsx'
import { CustomerForm } from '../components/customers/CustomerForm.jsx'
import { useDebounce } from '../hooks/useDebounce.js'
import * as customersService from '../services/customers.service.js'
import { getErrorMessage } from '../services/api.js'

export function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const debouncedSearch = useDebounce(search)

  useEffect(() => {
    setLoading(true)
    customersService
      .listCustomers({ search: debouncedSearch || undefined })
      .then((res) => setCustomers(res.items))
      .finally(() => setLoading(false))
  }, [debouncedSearch])

  async function handleCreate(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      const customer = await customersService.createCustomer(payload)
      setCustomers((prev) => [customer, ...prev])
      setShowForm(false)
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Customers</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Customer
        </Button>
      </div>

      <div className="page-filters">
        <SearchBar value={search} onChange={setSearch} placeholder="Search customers…" />
      </div>

      {loading ? (
        <TableSkeleton columns={4} rows={7} />
      ) : (
        <CustomerTable customers={customers} onCreate={() => setShowForm(true)} />
      )}

      {showForm && (
        <Modal title="Add Customer" onClose={() => setShowForm(false)}>
          <CustomerForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            submitting={submitting}
            error={formError}
          />
        </Modal>
      )}
    </div>
  )
}
