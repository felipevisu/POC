import { Activity } from 'react'
import { TabActiveContext, useTabs } from './hooks/useTabs'
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
  const { active, openedTabs, selectTab } = useTabs(tabs)

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
            aria-controls={`panel-${t.id}`}
            onClick={() => selectTab(t)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Activity hides opened-but-inactive tabs without unmounting them (keeps scroll,
          input state, fetched data). While hidden they don't re-render, so they don't fetch. */}
      {openedTabs.map(({ id, Page }) => (
        <Activity key={id} mode={id === active.id ? 'visible' : 'hidden'}>
          <section role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`}>
            <TabActiveContext value={id === active.id}>
              <Page />
            </TabActiveContext>
          </section>
        </Activity>
      ))}
    </main>
  )
}
