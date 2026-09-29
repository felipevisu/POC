import { useSearchInput } from '../hooks/useSearch'

export function SearchFilter({ label }: { label: string }) {
  const { value, setValue, flush } = useSearchInput()
  return (
    <label>
      {label}
      <input type="search" value={value} placeholder="Search…" onChange={(e) => setValue(e.target.value)} onBlur={flush} />
    </label>
  )
}
