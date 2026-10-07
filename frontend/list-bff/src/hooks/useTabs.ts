import { defaultRange, defaultReportDate } from '../dates'
import { setUrlParams, useUrlParam } from './useUrlParam'

type TabLike = { id: string; dates: 'single' | 'range' }

/**
 * Tabs whose active tab lives in `?tab=`. Switching carries the date over between single-date and range tabs.
 */
export function useTabs<T extends TabLike>(tabs: readonly T[]) {
  const tabParam = useUrlParam('tab', tabs[0].id)
  const active = tabs.find((t) => t.id === tabParam) ?? tabs[0]

  const selectTab = (next: T) => {
    const url = new URLSearchParams(location.search)
    // A new tab starts on its first page.
    const patch: Record<string, string | null> = { tab: next.id, page: null }

    // Single date → range: the range ends on the report date and starts 30 days earlier.
    if (active.dates === 'single' && next.dates === 'range') {
      const end = url.get('reportDate') ?? defaultReportDate()
      const [y, m, d] = end.split('-').map(Number)
      patch.startDate = new Date(y, m - 1, d - 30).toLocaleDateString('en-CA') // calendar math, DST-safe
      patch.endDate = end
      patch.reportDate = null
    }

    // Range → single date: the report date is where the range ended.
    if (active.dates === 'range' && next.dates === 'single') {
      patch.reportDate = url.get('endDate') ?? defaultRange().endDate
      patch.startDate = null
      patch.endDate = null
    }

    setUrlParams(patch)
  }

  return { active, selectTab }
}
