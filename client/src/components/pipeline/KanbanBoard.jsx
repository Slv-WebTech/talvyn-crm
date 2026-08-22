import { DndContext, closestCorners } from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn.jsx'
import { OPPORTUNITY_STAGES } from '../../utils/constants.js'

export function KanbanBoard({ opportunities, onStageChange, onDelete }) {
  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return

    const opportunity = opportunities.find((o) => o.id === active.id)
    const nextStage = over.id
    if (!opportunity || opportunity.stage === nextStage) return

    onStageChange(opportunity.id, nextStage)
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {OPPORTUNITY_STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            opportunities={opportunities.filter((o) => o.stage === stage)}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DndContext>
  )
}
