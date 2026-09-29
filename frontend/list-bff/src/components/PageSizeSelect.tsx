import { PAGE_SIZES, usePageSize } from '../hooks/usePagination'

export function PageSizeSelect() {
  const { pageSize, setPageSize } = usePageSize()
  return (
    <label>
      Page size
      <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
        {PAGE_SIZES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
    </label>
  )
}
