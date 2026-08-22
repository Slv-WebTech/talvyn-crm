import { useState } from 'react'

const EMPTY_FORM = { name: '', email: '', phone: '', company: '', address: '', notes: '' }

export function CustomerForm({ initialValue, onSubmit, onCancel, submitting, error }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValue })

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <label>
        Name
        <input required value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
      </label>
      <label>
        Email
        <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
      </label>
      <label>
        Phone
        <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
      </label>
      <label>
        Company
        <input value={form.company} onChange={(e) => handleChange('company', e.target.value)} />
      </label>
      <label>
        Address
        <input value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
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
          {submitting ? 'Saving…' : 'Save Customer'}
        </button>
      </div>
    </form>
  )
}
