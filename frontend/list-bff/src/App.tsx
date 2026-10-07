import { useTabs } from './hooks/useTabs'
import AccountSummary from './pages/AccountSummary'
import DailyCash from './pages/DailyCash'
import OutstandingPrincipal from './pages/OutstandingPrincipal'

// All filters are plain query params shared by the tabs, e.g. ?tab=daily-cash&categories=Fee&page=2
const tabs = [
  { id: 'daily-cash', dates: 'single', label: 'Daily Cash Transactions', Page: DailyCash },
  { id: 'account-summary', dates: 'single', label: 'Account Summary', Page: AccountSummary },
  { id: 'outstanding-principal', dates: 'range', label: 'Outstanding Principal', Page: OutstandingPrincipal },
] as const

export function App() {
  const { active, selectTab } = useTabs(tabs)

  return (
    <main>
      <title>{active.label}</title>
      <div role="tablist" aria-label="Reports" className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={t === active}
            aria-controls={t === active ? `panel-${t.id}` : undefined}
            onClick={() => selectTab(t)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Only the active tab is mounted: filters are global URL params, so a tab re-reads them
          when it comes back (cached keys are instant) instead of flashing stale data. */}
      <section role="tabpanel" id={`panel-${active.id}`} aria-labelledby={`tab-${active.id}`}>
        <active.Page />
      </section>
    </main>
  )
}
