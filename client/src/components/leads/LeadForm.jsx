import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { isElevated } from '../../utils/roles.js'
import { LEAD_SOURCES } from '../../utils/constants.js'
import * as usersService from '../../services/users.service.js'

const EMPTY_FORM = { name: '', company: '', email: '', phone: '', source: LEAD_SOURCES[0], notes: '', assignedToId: '' }

export function LeadForm({ initialValue, onSubmit, onCancel, submitting, error }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValue })
  const [reps, setReps] = useState([])

  useEffect(() => {
    if (isElevated(user)) {
      usersService.listUsers().then(setReps).catch(() => setReps([]))
    }
  }, [user])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form }
    if (!payload.assignedToId) delete payload.assignedToId
    onSubmit(payload)
  }

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <label>
        Name
        <input required value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
      </label>
      <label>
        Company
        <input required value={form.company} onChange={(e) => handleChange('company', e.target.value)} />
      </label>
      <label>
        Email
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
      </label>
      <label>
        Phone
        <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
      </label>
      <label>
        Source
        <select value={form.source} onChange={(e) => handleChange('source', e.target.value)}>
          {LEAD_SOURCES.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </label>
      {isElevated(user) && (
        <label>
          Assign to
          <select value={form.assignedToId} onChange={(e) => handleChange('assignedToId', e.target.value)}>
            <option value="">Myself</option>
            {reps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        Notes
        <textarea rows={3} value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} />
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Lead'}
        </button>
      </div>
    </form>
  )
}
