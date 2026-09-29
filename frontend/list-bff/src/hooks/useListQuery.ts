import { use, useDeferredValue, useMemo, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '../api'
import { useDateParams, type DateDefaults } from './useDateParams'
import { useMultiSelect } from './useMultiSelect'
import { usePage, usePageSize } from './usePagination'
import { useSearch } from './useSearch'
import { TabActiveContext } from './useTabs'

export type Page<T> = { items: T[]; total: number; page: number; pageSize: number }

/** Reads the filters from the URL and fetches that page. Suspends: wrap in <Suspense> + <ErrorBoundary>. */
export function useListQuery<T>(endpoint: string, dateDefaults: DateDefaults) {
  const { single, reportDate, startDate, endDate } = useDateParams(dateDefaults)
  const { raw: categories } = useMultiSelect('categories')
  const { pageSize } = usePageSize()
  const { page } = usePage()
  const search = useSearch()

  // Stable identity matters: isStale compares params by reference.
  const params = useMemo(
    () => ({
      ...(single ? { reportDate } : { startDate, endDate }),
      categories,
      search,
      page: String(page),
      pageSize: String(pageSize),
    }),
    [single, reportDate, startDate, endDate, categories, search, page, pageSize],
  )
  // A hidden tab keeps the params it had while visible: switching tabs rewrites the URL
  // (e.g. clears the other tab's dates), and a hidden tab must not fetch for that.
  const isActive = use(TabActiveContext)
  const [shownParams, setShownParams] = useState(params)
  if (isActive && shownParams !== params) setShownParams(params)
  const current = isActive ? params : shownParams

  // URL-store updates are synchronous; deferring the params keeps the previous page on
  // screen (instead of the Suspense fallback) while the next one loads.
  const deferredParams = useDeferredValue(current)

  const { data } = useSuspenseQuery({
    queryKey: [endpoint, deferredParams],
    // signal lets React Query abort requests nobody needs anymore (e.g. fast paging).
    queryFn: ({ signal }) => api.get<Page<T>>(`/${endpoint}`, { params: deferredParams, signal }).then((r) => r.data),
  })
  return { data, isStale: current !== deferredParams }
}
