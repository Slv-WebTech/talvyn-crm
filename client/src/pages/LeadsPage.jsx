import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { SearchBar } from '../components/common/SearchBar.jsx'
import { Button } from '../components/common/Button.jsx'
import { Modal } from '../components/common/Modal.jsx'
import { TableSkeleton } from '../components/common/Skeleton.jsx'
import { LeadTable } from '../components/leads/LeadTable.jsx'
import { LeadForm } from '../components/leads/LeadForm.jsx'
import { LEAD_STATUSES } from '../utils/constants.js'
import { useDebounce } from '../hooks/useDebounce.js'
import * as leadsService from '../services/leads.service.js'
import { getErrorMessage } from '../services/api.js'

export function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const debouncedSearch = useDebounce(search)

  useEffect(() => {
    setLoading(true)
    leadsService
      .listLeads({ search: debouncedSearch || undefined, status: status || undefined })
      .then((res) => setLeads(res.items))
      .finally(() => setLoading(false))
  }, [debouncedSearch, status])

  async function handleCreate(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      const lead = await leadsService.createLead(payload)
      setLeads((prev) => [lead, ...prev])
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
        <h1>Leads</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Lead
        </Button>
      </div>

      <div className="page-filters">
        <SearchBar value={search} onChange={setSearch} placeholder="Search leads…" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableSkeleton columns={6} rows={7} />
      ) : (
        <LeadTable leads={leads} onCreate={() => setShowForm(true)} />
      )}

      {showForm && (
        <Modal title="Add Lead" onClose={() => setShowForm(false)}>
          <LeadForm
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
