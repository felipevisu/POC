import { createContext, useState } from 'react'
import { defaultRange, defaultReportDate, rangeEndingOn } from '../dates'
import { setUrlParams, useUrlParam } from './useUrlParam'

type TabLike = { id: string; dates: 'single' | 'range' }

/** Whether the surrounding tab is the visible one. Outside tabs, everything counts as active. */
export const TabActiveContext = createContext(true)

/**
 * Tabs whose active tab lives in `?tab=`. Tabs mount (and fetch) only once opened,
 * and switching carries the date over between single-date and range tabs.
 */
export function useTabs<T extends TabLike>(tabs: readonly T[]) {
  const tabParam = useUrlParam('tab', tabs[0].id)
  const active = tabs.find((t) => t.id === tabParam) ?? tabs[0]

  // Updated during render so it also covers tab changes via Back/Forward.
  const [opened, setOpened] = useState(() => new Set<string>([active.id]))
  if (!opened.has(active.id)) setOpened(new Set(opened).add(active.id))

  const selectTab = (next: T) => {
    // A new tab starts on its first page.
    const patch: Record<string, string | null> = { tab: next.id, page: null }
    // Each tab's URL only holds its own date params; the date carries over between modes.
    const params = new URLSearchParams(location.search)
    if (active.dates === 'single' && next.dates === 'range') {
      // Range ends on the report date and starts 30 days earlier.
      Object.assign(patch, rangeEndingOn(params.get('reportDate') ?? defaultReportDate()), { reportDate: null })
    } else if (active.dates === 'range' && next.dates === 'single') {
      // Report date is where the range ended (the default end if the URL has none).
      Object.assign(patch, { reportDate: params.get('endDate') ?? defaultRange().endDate, startDate: null, endDate: null })
    }
    setUrlParams(patch)
  }

  return { active, openedTabs: tabs.filter((t) => opened.has(t.id)), selectTab }
}
