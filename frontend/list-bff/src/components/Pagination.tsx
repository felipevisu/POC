import { usePagination } from '../hooks/usePagination'

export function Pagination({ total }: { total: number }) {
  const { page, pageCount, setPage, hasPrev, hasNext } = usePagination(total)
  return (
    <nav className="pagination" aria-label="Pagination">
      <button disabled={!hasPrev} onClick={() => setPage(0)}>«</button>
      <button disabled={!hasPrev} onClick={() => setPage(page - 1)}>‹ Prev</button>
      <span>
        Page {page + 1} of {pageCount} · {total} rows
      </span>
      <button disabled={!hasNext} onClick={() => setPage(page + 1)}>Next ›</button>
      <button disabled={!hasNext} onClick={() => setPage(pageCount - 1)}>»</button>
    </nav>
  )
}
