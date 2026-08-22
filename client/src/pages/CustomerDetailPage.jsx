import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { DetailSkeleton } from '../components/common/Skeleton.jsx'
import { Button } from '../components/common/Button.jsx'
import { Modal } from '../components/common/Modal.jsx'
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx'
import { Badge } from '../components/common/Badge.jsx'
import { CustomerForm } from '../components/customers/CustomerForm.jsx'
import { FollowUpForm } from '../components/followups/FollowUpForm.jsx'
import { FollowUpList } from '../components/followups/FollowUpList.jsx'
import { TaskForm } from '../components/tasks/TaskForm.jsx'
import { TaskList } from '../components/tasks/TaskList.jsx'
import { STAGE_LABELS } from '../utils/constants.js'
import { formatCurrency } from '../utils/formatters.js'
import * as customersService from '../services/customers.service.js'
import * as followUpsService from '../services/followups.service.js'
import * as tasksService from '../services/tasks.service.js'
import { getErrorMessage } from '../services/api.js'
import { useToast } from '../hooks/useToast.js'

export function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [customer, setCustomer] = useState(null)
  const [opportunities, setOpportunities] = useState([])
  const [followUps, setFollowUps] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [customerData, opportunityData, followUpData, taskData] = await Promise.all([
      customersService.getCustomer(id),
      customersService.getCustomerOpportunities(id),
      followUpsService.listFollowUps({ customerId: id }),
      tasksService.listTasks({ customerId: id }),
    ])
    setCustomer(customerData)
    setOpportunities(opportunityData)
    setFollowUps(followUpData.items)
    setTasks(taskData.items)
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleUpdate(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      const updated = await customersService.updateCustomer(id, payload)
      setCustomer(updated)
      setModal(null)
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

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
      if (kind === 'customer') {
        await customersService.deleteCustomer(record.id)
        navigate('/customers', { replace: true })
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

  if (loading || !customer)
    return (
      <div className="page">
        <DetailSkeleton cards={4} />
      </div>
    )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/customers" className="back-link">
            <ArrowLeft size={14} /> Back to Customers
          </Link>
          <h1>{customer.name}</h1>
        </div>
        <div className="page-header-actions">
          <Button variant="secondary" onClick={() => setModal('edit')}>
            <Pencil size={14} /> Edit
          </Button>
          <Button variant="danger" onClick={() => setDeleteTarget({ kind: 'customer', record: customer })}>
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-card">
          <h2>Profile</h2>
          <dl className="detail-list">
            <dt>Company</dt>
            <dd>{customer.company ?? '—'}</dd>
            <dt>Email</dt>
            <dd>{customer.email ?? '—'}</dd>
            <dt>Phone</dt>
            <dd>{customer.phone ?? '—'}</dd>
            <dt>Address</dt>
            <dd>{customer.address ?? '—'}</dd>
            {customer.notes && (
              <>
                <dt>Notes</dt>
                <dd>{customer.notes}</dd>
              </>
            )}
          </dl>
        </section>

        <section className="detail-card">
          <h2>Opportunities</h2>
          {!opportunities.length && <p className="empty-hint">No opportunities yet.</p>}
          <ul className="record-list">
            {opportunities.map((opportunity) => (
              <li key={opportunity.id} className="record-list-item">
                <div>
                  <strong>{opportunity.title}</strong>
                  <p className="record-notes">{formatCurrency(opportunity.value)}</p>
                </div>
                <Badge tone={opportunity.stage === 'WON' ? 'success' : opportunity.stage === 'LOST' ? 'danger' : 'default'}>
                  {STAGE_LABELS[opportunity.stage]}
                </Badge>
              </li>
            ))}
          </ul>
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

      {modal === 'edit' && (
        <Modal title="Edit Customer" onClose={() => setModal(null)}>
          <CustomerForm
            initialValue={customer}
            onSubmit={handleUpdate}
            onCancel={() => setModal(null)}
            submitting={submitting}
            error={formError}
          />
        </Modal>
      )}

      {modal === 'followup' && (
        <Modal title="Schedule Follow-up" onClose={() => setModal(null)}>
          <FollowUpForm
            linkContext={{ customerId: customer.id }}
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
            linkContext={{ customerId: customer.id }}
            onSubmit={handleAddTask}
            onCancel={() => setModal(null)}
            submitting={submitting}
            error={formError}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={
            deleteTarget.kind === 'customer'
              ? 'Delete customer?'
              : deleteTarget.kind === 'task'
                ? 'Delete task?'
                : 'Delete follow-up?'
          }
          message={
            deleteTarget.kind === 'customer'
              ? `${deleteTarget.record.name} and its history will be permanently removed.`
              : deleteTarget.kind === 'task'
                ? `"${deleteTarget.record.title}" will be permanently removed.`
                : `This ${deleteTarget.record.type.toLowerCase()} follow-up will be permanently removed.`
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
