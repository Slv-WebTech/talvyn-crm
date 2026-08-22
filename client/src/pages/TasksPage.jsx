import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../components/common/Button.jsx'
import { Modal } from '../components/common/Modal.jsx'
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx'
import { RecordListSkeleton } from '../components/common/Skeleton.jsx'
import { TaskForm } from '../components/tasks/TaskForm.jsx'
import { TaskList } from '../components/tasks/TaskList.jsx'
import { TASK_STATUSES } from '../utils/constants.js'
import * as tasksService from '../services/tasks.service.js'
import { getErrorMessage } from '../services/api.js'
import { useToast } from '../hooks/useToast.js'

export function TasksPage() {
  const { showToast } = useToast()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    setLoading(true)
    tasksService
      .listTasks({ status: status || undefined })
      .then((res) => setTasks(res.items))
      .finally(() => setLoading(false))
  }, [status])

  async function handleCreate(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      const task = await tasksService.createTask(payload)
      setTasks((prev) => [task, ...prev])
      setShowForm(false)
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(id, nextStatus) {
    try {
      const updated = await tasksService.updateTaskStatus(id, nextStatus)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      showToast(getErrorMessage(err))
    }
  }

  async function handleDeleteConfirm() {
    try {
      await tasksService.deleteTask(deleteTarget.id)
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    } catch (err) {
      showToast(getErrorMessage(err))
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tasks</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Task
        </Button>
      </div>

      <div className="page-filters">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <RecordListSkeleton rows={5} />
      ) : (
        <TaskList tasks={tasks} onStatusChange={handleStatusChange} onDelete={setDeleteTarget} />
      )}

      {showForm && (
        <Modal title="Add Task" onClose={() => setShowForm(false)}>
          <TaskForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            submitting={submitting}
            error={formError}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete task?"
          message={`"${deleteTarget.title}" will be permanently removed.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
