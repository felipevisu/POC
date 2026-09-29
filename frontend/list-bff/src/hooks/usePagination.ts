import { setUrlParams, useUrlParam } from './useUrlParam'

export const PAGE_SIZES = [10, 25, 50, 100]

export function usePageSize() {
  const pageSize = Number(useUrlParam('pageSize', '10'))
  const setPageSize = (size: number) => setUrlParams({ pageSize: String(size), page: null })
  return { pageSize, setPageSize }
}

/** Current page, zero-based (store, API and hook); only the UI shows it +1. Needs no `total`, so it's usable before fetching. */
export function usePage() {
  const page = Number(useUrlParam('page', '0'))
  const setPage = (p: number) => setUrlParams({ page: p > 0 ? String(p) : null })
  return { page, setPage }
}

/** Page navigation; needs `total`, so it's only usable once the data is loaded. */
export function usePagination(total: number) {
  const { page, setPage } = usePage()
  const { pageSize } = usePageSize()
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  return { page, pageCount, setPage, hasPrev: page > 0, hasNext: page < pageCount - 1 }
}
