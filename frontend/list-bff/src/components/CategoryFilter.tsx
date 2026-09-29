import { useId } from 'react'
import { useMultiSelect } from '../hooks/useMultiSelect'

/**
 * Multi-select dropdown: a select-looking button that opens a checkbox list ("All" on top).
 * Native `popover` gives open/close, Esc and click-outside for free; CSS anchor positioning
 * places the list under the button.
 */
export function CategoryFilter({ options }: { options: readonly string[] }) {
  const { selected, toggle, clear } = useMultiSelect('categories')
  const id = useId()
  const anchor = `--categories-${id.replace(/[^\w-]/g, '')}` // one anchor per instance (one per tab)
  const summary = selected.length === 0 ? 'All' : options.filter((o) => selected.includes(o)).join(', ')

  return (
    <div className="field">
      <span id={`${id}-label`}>Categories</span>
      <button
        type="button"
        id={`${id}-button`}
        className="select"
        popoverTarget={`${id}-list`}
        aria-labelledby={`${id}-label ${id}-button`}
        style={{ anchorName: anchor }}
      >
        {summary}
      </button>
      <fieldset id={`${id}-list`} popover="auto" className="select-list" aria-labelledby={`${id}-label`} style={{ positionAnchor: anchor }}>
        <label>
          <input type="checkbox" checked={selected.length === 0} onChange={clear} /> All
        </label>
        {options.map((o) => (
          <label key={o}>
            <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)} /> {o}
          </label>
        ))}
      </fieldset>
    </div>
  )
}
