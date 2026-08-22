import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { DetailSkeleton } from '../components/common/Skeleton.jsx'
import { Badge } from '../components/common/Badge.jsx'
import { Button } from '../components/common/Button.jsx'
import { Modal } from '../components/common/Modal.jsx'
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx'
import { ConvertLeadButton } from '../components/leads/ConvertLeadButton.jsx'
import { FollowUpForm } from '../components/followups/FollowUpForm.jsx'
import { FollowUpList } from '../components/followups/FollowUpList.jsx'
import { TaskForm } from '../components/tasks/TaskForm.jsx'
import { TaskList } from '../components/tasks/TaskList.jsx'
import { formatDate } from '../utils/formatters.js'
import * as leadsService from '../services/leads.service.js'
import * as followUpsService from '../services/followups.service.js'
import * as tasksService from '../services/tasks.service.js'
import { getErrorMessage } from '../services/api.js'
import { useToast } from '../hooks/useToast.js'

export function LeadDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [lead, setLead] = useState(null)
  const [followUps, setFollowUps] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [leadData, followUpData, taskData] = await Promise.all([
      leadsService.getLead(id),
      followUpsService.listFollowUps({ leadId: id }),
      tasksService.listTasks({ leadId: id }),
    ])
    setLead(leadData)
    setFollowUps(followUpData.items)
    setTasks(taskData.items)
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleAddFollowUp(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      const followUp = await followUpsService.createFollowUp(payload)
      setFollowUps((prev) => [followUp, ...prev])
      setModal(null)
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCompleteFollowUp(followUpId) {
    try {
      const updated = await followUpsService.completeFollowUp(followUpId)
      setFollowUps((prev) => prev.map((f) => (f.id === followUpId ? updated : f)))
    } catch (err) {
      showToast(getErrorMessage(err))
    }
  }

  async function handleAddTask(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      const task = await tasksService.createTask(payload)
      setTasks((prev) => [task, ...prev])
      setModal(null)
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleTaskStatusChange(taskId, status) {
    try {
      const updated = await tasksService.updateTaskStatus(taskId, status)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
    } catch (err) {
      showToast(getErrorMessage(err))
    }
  }

  async function handleConfirmDelete() {
    const { kind, record } = deleteTarget
    try {
      if (kind === 'lead') {
        await leadsService.deleteLead(record.id)
        navigate('/leads', { replace: true })
        return
      }
      if (kind === 'task') {
        await tasksService.deleteTask(record.id)
        setTasks((prev) => prev.filter((t) => t.id !== record.id))
      } else if (kind === 'followup') {
        await followUpsService.deleteFollowUp(record.id)
        setFollowUps((prev) => prev.filter((f) => f.id !== record.id))
      }
      setDeleteTarget(null)
    } catch (err) {
      showToast(getErrorMessage(err))
      setDeleteTarget(null)
    }
  }

  const deleteDialogCopy = deleteTarget && {
    lead: {
      title: 'Delete lead?',
      message: `${deleteTarget.record.name} and its history will be permanently removed.`,
    },
    task: {
      title: 'Delete task?',
      message: `"${deleteTarget.record.title}" will be permanently removed.`,
    },
    followup: {
      title: 'Delete follow-up?',
      message: `This ${deleteTarget.record.type.toLowerCase()} follow-up will be permanently removed.`,
    },
  }[deleteTarget.kind]

  if (loading || !lead)
    return (
      <div className="page">
        <DetailSkeleton cards={3} />
      </div>
    )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/leads" className="back-link">
            <ArrowLeft size={14} /> Back to Leads
          </Link>
          <h1>{lead.name}</h1>
        </div>
        <div className="page-header-actions">
          <Button variant="danger" onClick={() => setDeleteTarget({ kind: 'lead', record: lead })}>
            <Trash2 size={14} /> Delete
          </Button>
          <ConvertLeadButton lead={lead} onConverted={load} />
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-card">
          <h2>Details</h2>
          <dl className="detail-list">
            <dt>Company</dt>
            <dd>{lead.company}</dd>
            <dt>Email</dt>
            <dd>{lead.email}</dd>
            <dt>Phone</dt>
            <dd>{lead.phone ?? '—'}</dd>
            <dt>Source</dt>
            <dd>{lead.source ?? '—'}</dd>
            <dt>Status</dt>
            <dd>
              <Badge tone={lead.status === 'LOST' ? 'danger' : 'default'}>{lead.status}</Badge>
            </dd>
            <dt>Created</dt>
            <dd>{formatDate(lead.createdAt)}</dd>
            {lead.notes && (
              <>
                <dt>Notes</dt>
                <dd>{lead.notes}</dd>
              </>
            )}
          </dl>
        </section>

        <section className="detail-card">
          <div className="detail-card-header">
            <h2>Follow-ups</h2>
            <Button variant="secondary" onClick={() => setModal('followup')}>
              <Plus size={14} /> Schedule
            </Button>
          </div>
          <FollowUpList
            followUps={followUps}
            onComplete={handleCompleteFollowUp}
            onDelete={(followUp) => setDeleteTarget({ kind: 'followup', record: followUp })}
          />
        </section>

        <section className="detail-card">
          <div className="detail-card-header">
            <h2>Tasks</h2>
            <Button variant="secondary" onClick={() => setModal('task')}>
              <Plus size={14} /> Add Task
            </Button>
          </div>
          <TaskList
            tasks={tasks}
            onStatusChange={handleTaskStatusChange}
            onDelete={(task) => setDeleteTarget({ kind: 'task', record: task })}
          />
        </section>
      </div>

      {modal === 'followup' && (
        <Modal title="Schedule Follow-up" onClose={() => setModal(null)}>
          <FollowUpForm
            linkContext={{ leadId: lead.id }}
            onSubmit={handleAddFollowUp}
            onCancel={() => setModal(null)}
            submitting={submitting}
            error={formError}
          />
        </Modal>
      )}

      {modal === 'task' && (
        <Modal title="Add Task" onClose={() => setModal(null)}>
          <TaskForm
            linkContext={{ leadId: lead.id }}
            onSubmit={handleAddTask}
            onCancel={() => setModal(null)}
            submitting={submitting}
            error={formError}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={deleteDialogCopy.title}
          message={deleteDialogCopy.message}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
