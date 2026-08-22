import { useEffect, useState } from 'react'
import * as customersService from '../../services/customers.service.js'
import { Combobox } from '../common/Combobox.jsx'

const EMPTY_FORM = { title: '', customerId: '', value: '', expectedCloseDate: '', notes: '' }

export function OpportunityForm({ onSubmit, onCancel, submitting, error }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    customersService
      .listCustomers({ limit: 100 })
      .then((res) => setCustomers(res.items))
      .catch(() => setCustomers([]))
  }, [])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { title: form.title, customerId: form.customerId }
    if (form.value) payload.value = Number(form.value)
    if (form.expectedCloseDate) payload.expectedCloseDate = new Date(form.expectedCloseDate).toISOString()
    if (form.notes) payload.notes = form.notes
    onSubmit(payload)
  }

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <label>
        Title
        <input required value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
      </label>
      <label>
        Customer
        <Combobox
          options={customers.map((customer) => ({ id: customer.id, label: customer.name }))}
          value={form.customerId}
          onChange={(id) => handleChange('customerId', id)}
          placeholder="Search customers…"
        />
      </label>
      <label>
        Value (USD)
        <input type="number" min="0" value={form.value} onChange={(e) => handleChange('value', e.target.value)} />
      </label>
      <label>
        Expected close date
        <input
          type="date"
          value={form.expectedCloseDate}
          onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
        />
      </label>
      <label>
        Notes
        <textarea rows={3} value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} />
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Opportunity'}
        </button>
      </div>
    </form>
  )
}
