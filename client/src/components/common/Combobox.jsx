import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Search…',
  disabled = false,
  emptyMessage = 'No matches',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const listboxId = useId()

  const selected = options.find((option) => option.id === value) ?? null

  const filtered = query.trim()
    ? options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options

  useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  function openList() {
    if (disabled) return
    setOpen(true)
    setActiveIndex(0)
  }

  function selectOption(option) {
    onChange(option.id)
    setOpen(false)
    setQuery('')
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) {
        openList()
        return
      }
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (open) setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (!open) {
        e.preventDefault()
        openList()
        return
      }
      e.preventDefault()
      if (filtered[activeIndex]) selectOption(filtered[activeIndex])
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        setOpen(false)
        setQuery('')
      }
    }
  }

  return (
    <div className="combobox" ref={rootRef}>
      <div className="combobox-control" onClick={openList}>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          placeholder={selected ? selected.label : placeholder}
          value={open ? query : selected?.label ?? ''}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(0)
            if (!open) setOpen(true)
          }}
          onFocus={openList}
          onKeyDown={handleKeyDown}
        />
        <ChevronDown size={14} className="combobox-caret" />
      </div>
      {open && (
        <ul className="combobox-listbox" id={listboxId} role="listbox">
          {filtered.length === 0 && <li className="combobox-empty">{emptyMessage}</li>}
          {filtered.map((option, index) => (
            <li
              key={option.id}
              role="option"
              aria-selected={option.id === value}
              className={`combobox-option${index === activeIndex ? ' combobox-option-active' : ''}${
                option.id === value ? ' combobox-option-selected' : ''
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectOption(option)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {option.label}
              {option.id === value && <Check size={14} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
