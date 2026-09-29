import { setUrlParams, useUrlParam } from './useUrlParam'

/** Multi-value filter stored as `a,b,c`. Empty selection means "all". */
export function useMultiSelect(key: string) {
  const raw = useUrlParam(key)
  const selected = raw ? raw.split(',') : []
  const set = (values: string[]) => setUrlParams({ [key]: values.join(','), page: null })
  const toggle = (value: string) =>
    set(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  return { raw, selected, toggle, clear: () => set([]) }
}
