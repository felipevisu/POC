import { useDraft } from './useDraft'
import { setUrlParams, useUrlParam } from './useUrlParam'

/** Committed search term (what the list query uses). */
export const useSearch = () => useUrlParam('search')

/**
 * Search input state: updates instantly while typing, but only commits the filter
 * (→ refetch) after `delay` ms without typing, or on blur.
 */
export function useSearchInput(delay = 300) {
  const { draft, setDraft, flush } = useDraft(useSearch(), (search) => setUrlParams({ search, page: null }), delay)
  return { value: draft, setValue: setDraft, flush }
}
