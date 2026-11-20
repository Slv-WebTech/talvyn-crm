import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters.js'
import { OPPORTUNITY_STAGES, STAGE_LABELS } from '../../utils/constants.js'

export function OpportunityCard({ opportunity, onDelete, onStageChange }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opportunity.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="opportunity-card">
      <div className="opportunity-card-header">
        <div className="opportunity-card-title">{opportunity.title}</div>
        {onDelete && (
          <button
            type="button"
            className="opportunity-card-delete"
            aria-label="Delete opportunity"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(opportunity)}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="opportunity-card-value">{formatCurrency(opportunity.value)}</div>
      {/* stopPropagation keeps this click from being swallowed by the drag sensor's pointerdown listener */}
      <Link
        to={`/customers/${opportunity.customerId}`}
        onPointerDown={(e) => e.stopPropagation()}
      >
        View customer
      </Link>
      {onStageChange && (
        // Keyboard/touch alternative to dragging.
        <select
          className="opportunity-card-stage"
          aria-label={`Move ${opportunity.title} to stage`}
          value={opportunity.stage}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) => onStageChange(opportunity.id, e.target.value)}
        >
          {OPPORTUNITY_STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
