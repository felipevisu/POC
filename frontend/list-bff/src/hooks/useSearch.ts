import { useEffect, useState } from 'react'
import { setUrlParams, useUrlParam } from './useUrlParam'

/** Committed search term (what the list query uses). */
export const useSearch = () => useUrlParam('search')

/**
 * Search input state: updates instantly while typing, but only commits the filter
 * (→ refetch) after `delay` ms without typing.
 */
export function useSearchInput(delay = 300) {
  const search = useSearch()
  const [value, setValue] = useState(search)

  // Search changed from outside (Back/Forward): follow it.
  // "Adjust state during render" pattern; avoids an extra effect + render.
  const [prevSearch, setPrevSearch] = useState(search)
  if (search !== prevSearch) {
    setPrevSearch(search)
    setValue(search)
  }

  useEffect(() => {
    if (value === search) return
    const t = setTimeout(() => setUrlParams({ search: value, page: null }), delay)
    return () => clearTimeout(t) // typing again restarts the timer
  }, [value, search, delay])

  return { value, setValue }
}
