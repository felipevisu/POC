import { setUrlParams, useUrlParam } from './useUrlParam'

/** Multi-value filter stored as `a,b,c`. Empty selection means "all". */
export function useMultiSelect(key: string) {
  const raw = useUrlParam(key)
  const selected = raw ? raw.split(',') : []
  // Sorted, so the same selection is always the same URL/cache key regardless of click order.
  const set = (values: string[]) => setUrlParams({ [key]: [...values].sort().join(','), page: null })
  const toggle = (value: string) =>
    set(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  return { raw, selected, toggle, clear: () => set([]) }
}
