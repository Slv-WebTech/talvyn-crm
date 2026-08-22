import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { KanbanSkeleton } from '../components/common/Skeleton.jsx'
import { Button } from '../components/common/Button.jsx'
import { Modal } from '../components/common/Modal.jsx'
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx'
import { KanbanBoard } from '../components/pipeline/KanbanBoard.jsx'
import { OpportunityForm } from '../components/pipeline/OpportunityForm.jsx'
import * as opportunitiesService from '../services/opportunities.service.js'
import { getErrorMessage } from '../services/api.js'

export function PipelinePage() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [banner, setBanner] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    opportunitiesService
      .listOpportunities({ limit: 100 })
      .then((res) => setOpportunities(res.items))
      .finally(() => setLoading(false))
  }, [])

  async function handleStageChange(id, stage) {
    const previous = opportunities
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, stage } : o)))
    setBanner(null)
    try {
      await opportunitiesService.updateOpportunityStage(id, stage)
    } catch (err) {
      setOpportunities(previous)
      setBanner(getErrorMessage(err))
    }
  }

  async function handleDeleteConfirm() {
    const target = deleteTarget
    try {
      await opportunitiesService.deleteOpportunity(target.id)
      setOpportunities((prev) => prev.filter((o) => o.id !== target.id))
    } catch (err) {
      setBanner(getErrorMessage(err))
    } finally {
      setDeleteTarget(null)
    }
  }

  async function handleCreate(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      const opportunity = await opportunitiesService.createOpportunity(payload)
      setOpportunities((prev) => [opportunity, ...prev])
      setShowForm(false)
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Sales Pipeline</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Opportunity
        </Button>
      </div>

      {banner && <div className="form-error">{banner}</div>}

      {loading ? (
        <KanbanSkeleton columns={7} />
      ) : (
        <KanbanBoard opportunities={opportunities} onStageChange={handleStageChange} onDelete={setDeleteTarget} />
      )}

      {showForm && (
        <Modal title="Add Opportunity" onClose={() => setShowForm(false)}>
          <OpportunityForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            submitting={submitting}
            error={formError}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete opportunity?"
          message={`"${deleteTarget.title}" will be permanently removed.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
