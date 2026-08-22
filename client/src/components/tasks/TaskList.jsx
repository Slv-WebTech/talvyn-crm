import { Trash2 } from 'lucide-react'
import { Button } from '../common/Button.jsx'
import { TASK_STATUSES, TASK_STATUS_LABELS } from '../../utils/constants.js'
import { formatDate } from '../../utils/formatters.js'

export function TaskList({ tasks, onStatusChange, onDelete }) {
  if (!tasks.length) {
    return <p className="empty-hint">No tasks yet.</p>
  }

  return (
    <ul className="record-list">
      {tasks.map((task) => (
        <li key={task.id} className="record-list-item">
          <div>
            <strong>{task.title}</strong>
            {task.description && <p className="record-notes">{task.description}</p>}
            {task.dueDate && <span className="record-meta">Due {formatDate(task.dueDate)}</span>}
          </div>
          <div className="record-list-actions">
            <select value={task.status} onChange={(e) => onStatusChange(task.id, e.target.value)}>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            {onDelete && (
              <Button variant="danger" onClick={() => onDelete(task)} aria-label="Delete task">
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
