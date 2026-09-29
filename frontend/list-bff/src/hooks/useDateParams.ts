import { setUrlParams, useUrlParam } from './useUrlParam'

/** A list's date params with their defaults. The names are sent as-is to the API. */
export type DateDefaults = { reportDate: string } | { startDate: string; endDate: string }
type DateParams = Partial<{ reportDate: string; startDate: string; endDate: string }>

export function useDateParams(defaults: DateDefaults) {
  const single = 'reportDate' in defaults
  // Always call all three (hooks can't be conditional); unused ones stay ''.
  const reportDate = useUrlParam('reportDate', single ? defaults.reportDate : '')
  const startDate = useUrlParam('startDate', single ? '' : defaults.startDate)
  const endDate = useUrlParam('endDate', single ? '' : defaults.endDate)
  // Changing a filter always goes back to the first page.
  const setDates = (dates: DateParams) => setUrlParams({ ...dates, page: null })
  return { single, reportDate, startDate, endDate, setDates }
}
