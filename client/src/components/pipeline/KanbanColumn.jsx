import { useDroppable } from '@dnd-kit/core'
import { OpportunityCard } from './OpportunityCard.jsx'
import { STAGE_LABELS } from '../../utils/constants.js'

export function KanbanColumn({ stage, opportunities, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div ref={setNodeRef} className={`kanban-column${isOver ? ' kanban-column-over' : ''}`}>
      <div className="kanban-column-header">
        <h3>{STAGE_LABELS[stage]}</h3>
        <span className="kanban-column-count">{opportunities.length}</span>
      </div>
      <div className="kanban-column-cards">
        {opportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}
