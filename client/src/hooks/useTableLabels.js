import { useEffect } from 'react'

// Copies each <th> label onto its column's <td>s (data-label) so the mobile
// card layout in components.css can show "Column: value" pairs. Re-runs when
// the DOM under <main> changes (route changes, data loads).
export function useTableLabels(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    function label() {
      root.querySelectorAll('table.data-table').forEach((table) => {
        const heads = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim())
        table.querySelectorAll('tbody tr').forEach((tr) => {
          ;[...tr.children].forEach((td, i) => {
            if (heads[i] && td.dataset.label !== heads[i]) td.dataset.label = heads[i]
          })
        })
      })
    }

    label()
    const observer = new MutationObserver(label)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [rootRef])
}
