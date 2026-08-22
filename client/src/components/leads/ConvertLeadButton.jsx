import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import * as leadsService from '../../services/leads.service.js'
import { getErrorMessage } from '../../services/api.js'
import { Button } from '../common/Button.jsx'

export function ConvertLeadButton({ lead, onConverted }) {
  const navigate = useNavigate()
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState(null)

  if (lead.status === 'CONVERTED') {
    return (
      <span className="badge badge-success">
        <CheckCircle2 size={12} /> Converted
      </span>
    )
  }
  if (lead.status === 'LOST') {
    return null
  }

  async function handleConvert() {
    // Disabled immediately on click — the primary mitigation for the
    // rapid-double-click race noted in docs/TECHNICAL_DEBT.md.
    setConverting(true)
    setError(null)
    try {
      const result = await leadsService.convertLead(lead.id)
      onConverted?.(result)
      navigate(`/customers/${result.customer.id}`)
    } catch (err) {
      setError(getErrorMessage(err))
      setConverting(false)
    }
  }

  return (
    <div className="convert-lead">
      <Button variant="primary" onClick={handleConvert} disabled={converting}>
        {converting ? <Loader2 size={16} className="btn-spin" /> : <Sparkles size={16} />}
        {converting ? 'Converting…' : 'Convert Lead'}
      </Button>
      {error && <div className="form-error">{error}</div>}
    </div>
  )
}
