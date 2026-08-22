import { useEffect, useState } from 'react'
import * as leadsService from '../../services/leads.service.js'
import * as customersService from '../../services/customers.service.js'
import * as opportunitiesService from '../../services/opportunities.service.js'
import { Combobox } from './Combobox.jsx'

const NONE = 'none'

const ENTITY_OPTIONS = [
  { key: 'leadId', label: 'Lead', fetch: () => leadsService.listLeads({ limit: 100 }).then((r) => r.items) },
  {
    key: 'customerId',
    label: 'Customer',
    fetch: () => customersService.listCustomers({ limit: 100 }).then((r) => r.items),
  },
  {
    key: 'opportunityId',
    label: 'Opportunity',
    fetch: () => opportunitiesService.listOpportunities({ limit: 100 }).then((r) => r.items),
  },
]

// Lets a form link its record to a Lead, Customer, or Opportunity by picking
// the entity type first, then a specific record of that type.
export function LinkPicker({ value, onChange, allowNone = false }) {
  const [entityKey, setEntityKey] = useState(allowNone ? NONE : 'leadId')
  const [options, setOptions] = useState([])

  useEffect(() => {
    if (entityKey === NONE) {
      setOptions([])
      return
    }
    const entity = ENTITY_OPTIONS.find((e) => e.key === entityKey)
    entity.fetch().then(setOptions).catch(() => setOptions([]))
  }, [entityKey])

  function handleEntityChange(key) {
    setEntityKey(key)
    onChange(key === NONE ? {} : { [key]: '' })
  }

  function handleTargetChange(targetId) {
    onChange({ [entityKey]: targetId })
  }

  return (
    <div className="link-picker">
      <label>
        Link to
        <select value={entityKey} onChange={(e) => handleEntityChange(e.target.value)}>
          {allowNone && <option value={NONE}>None</option>}
          {ENTITY_OPTIONS.map((entity) => (
            <option key={entity.key} value={entity.key}>
              {entity.label}
            </option>
          ))}
        </select>
      </label>
      {entityKey !== NONE && (
        <label>
          Record
          <Combobox
            options={options.map((option) => ({ id: option.id, label: option.name ?? option.title }))}
            value={value?.[entityKey] ?? ''}
            onChange={(id) => handleTargetChange(id)}
            placeholder="Search…"
          />
        </label>
      )}
    </div>
  )
}
