import { useState } from 'react'
import { LinkPicker } from '../common/LinkPicker.jsx'

const EMPTY_FORM = { title: '', description: '', dueDate: '' }

export function TaskForm({ linkContext, onSubmit, onCancel, submitting, error }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [link, setLink] = useState(linkContext ?? {})

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...link, title: form.title, description: form.description }
    if (form.dueDate) payload.dueDate = new Date(form.dueDate).toISOString()
    onSubmit(payload)
  }

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      {!linkContext && <LinkPicker value={link} onChange={setLink} allowNone />}
      <label>
        Title
        <input required value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
      </label>
      <label>
        Description
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </label>
      <label>
        Due date
        <input type="date" value={form.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)} />
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Task'}
        </button>
      </div>
    </form>
  )
}
