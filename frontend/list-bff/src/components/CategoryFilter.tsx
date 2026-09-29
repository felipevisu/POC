import { useMultiSelect } from '../hooks/useMultiSelect'

export function CategoryFilter({ options }: { options: readonly string[] }) {
  const { selected, toggle, clear } = useMultiSelect('categories')

  return (
    <fieldset className="chips">
      <legend>Categories</legend>
      <button type="button" aria-pressed={selected.length === 0} onClick={clear}>
        All
      </button>
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={selected.includes(o)} onClick={() => toggle(o)}>
          {o}
        </button>
      ))}
    </fieldset>
  )
}
