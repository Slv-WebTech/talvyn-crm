import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../components/common/Button.jsx'
import { Modal } from '../components/common/Modal.jsx'
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx'
import { TableSkeleton } from '../components/common/Skeleton.jsx'
import { Badge } from '../components/common/Badge.jsx'
import { formatRole } from '../utils/roles.js'
import * as usersService from '../services/users.service.js'
import { getErrorMessage } from '../services/api.js'
import { useToast } from '../hooks/useToast.js'

const ROLES = ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE']
const EMPTY_FORM = { name: '', email: '', password: '', role: 'SALES_EXECUTIVE' }

export function UsersPage() {
  const { showToast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [deactivateTarget, setDeactivateTarget] = useState(null)

  function load() {
    setLoading(true)
    usersService.listUsers().then(setUsers).finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      const user = await usersService.createUser(form)
      setUsers((prev) => [...prev, user])
      setShowForm(false)
      setForm(EMPTY_FORM)
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRoleChange(id, role) {
    try {
      const updated = await usersService.updateUser(id, { role })
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    } catch (err) {
      showToast(getErrorMessage(err))
    }
  }

  async function handleDeactivate(id) {
    try {
      const updated = await usersService.deactivateUser(id)
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
      setDeactivateTarget(null)
    } catch (err) {
      showToast(getErrorMessage(err))
      setDeactivateTarget(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Users</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add User
        </Button>
      </div>

      {loading ? (
        <TableSkeleton columns={5} rows={5} />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {formatRole(role)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <Badge tone={user.isActive ? 'success' : 'danger'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  {user.isActive && (
                    <Button variant="danger" onClick={() => setDeactivateTarget(user)}>
                      Deactivate
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <Modal title="Add User" onClose={() => setShowForm(false)}>
          <form className="entity-form" onSubmit={handleCreate}>
            {formError && <div className="form-error">{formError}</div>}
            <label>
              Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {formatRole(role)}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deactivateTarget && (
        <ConfirmDialog
          title="Deactivate user?"
          message={`${deactivateTarget.name} will lose access immediately. Their existing records stay assigned to them for history and reporting.`}
          confirmLabel="Deactivate"
          onConfirm={() => handleDeactivate(deactivateTarget.id)}
          onCancel={() => setDeactivateTarget(null)}
        />
      )}
    </div>
  )
}
