import { useState } from 'react'
import { FOLLOWUP_TYPES } from '../../utils/constants.js'
import { LinkPicker } from '../common/LinkPicker.jsx'

const EMPTY_FORM = { type: FOLLOWUP_TYPES[0], notes: '', scheduledAt: '' }

export function FollowUpForm({ linkContext, onSubmit, onCancel, submitting, error }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [link, setLink] = useState(linkContext ?? {})

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      ...link,
      type: form.type,
      notes: form.notes,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
    })
  }

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      {!linkContext && <LinkPicker value={link} onChange={setLink} />}
      <label>
        Type
        <select value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
          {FOLLOWUP_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label>
        Scheduled at
        <input
          type="datetime-local"
          required
          value={form.scheduledAt}
          onChange={(e) => handleChange('scheduledAt', e.target.value)}
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
          {submitting ? 'Scheduling…' : 'Schedule Follow-up'}
        </button>
      </div>
    </form>
  )
}
