import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../components/common/Button.jsx'
import { Modal } from '../components/common/Modal.jsx'
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx'
import { RecordListSkeleton } from '../components/common/Skeleton.jsx'
import { FollowUpForm } from '../components/followups/FollowUpForm.jsx'
import { FollowUpList } from '../components/followups/FollowUpList.jsx'
import * as followUpsService from '../services/followups.service.js'
import { getErrorMessage } from '../services/api.js'
import { useToast } from '../hooks/useToast.js'
import { formatDateTime } from '../utils/formatters.js'

const STATUS_FILTERS = ['', 'PENDING', 'COMPLETED', 'CANCELLED']

export function FollowUpsPage() {
  const { showToast } = useToast()
  const [followUps, setFollowUps] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    setLoading(true)
    followUpsService
      .listFollowUps({ status: status || undefined })
      .then((res) => setFollowUps(res.items))
      .finally(() => setLoading(false))
  }, [status])

  async function handleCreate(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      const followUp = await followUpsService.createFollowUp(payload)
      setFollowUps((prev) => [followUp, ...prev])
      setShowForm(false)
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleComplete(id) {
    try {
      const updated = await followUpsService.completeFollowUp(id)
      setFollowUps((prev) => prev.map((f) => (f.id === id ? updated : f)))
    } catch (err) {
      showToast(getErrorMessage(err))
    }
  }

  async function handleDeleteConfirm() {
    try {
      await followUpsService.deleteFollowUp(deleteTarget.id)
      setFollowUps((prev) => prev.filter((f) => f.id !== deleteTarget.id))
    } catch (err) {
      showToast(getErrorMessage(err))
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Follow-ups</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Schedule Follow-up
        </Button>
      </div>

      <div className="page-filters">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_FILTERS.map((s) => (
            <option key={s || 'all'} value={s}>
              {s || 'All statuses'}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <RecordListSkeleton rows={5} />
      ) : (
        <FollowUpList followUps={followUps} onComplete={handleComplete} onDelete={setDeleteTarget} />
      )}

      {showForm && (
        <Modal title="Schedule Follow-up" onClose={() => setShowForm(false)}>
          <FollowUpForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            submitting={submitting}
            error={formError}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete follow-up?"
          message={`This ${deleteTarget.type.toLowerCase()} follow-up scheduled for ${formatDateTime(deleteTarget.scheduledAt)} will be permanently removed.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
