import { beforeEach, expect, it } from '@jest/globals'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { InternalAxiosRequestConfig } from 'axios'
import { api, createQueryClient } from './api'
import { App } from './App'
import { daysAgo } from './dates'

// Records every API call ("/daily-cash {params}") instead of hitting the network.
let calls: string[] = []
api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
  calls.push(`${config.url} ${JSON.stringify(config.params)}`)
  return { data: { items: [], total: 25, page: 0, pageSize: 10 }, status: 200, statusText: 'OK', headers: {}, config }
}
const callsTo = (endpoint: string) => calls.filter((c) => c.startsWith(`/${endpoint} `))

// Let Suspense, deferred renders and the fake-latency-free adapter settle.
const settle = () => act(() => new Promise((r) => setTimeout(r, 20)))
const openTab = async (name: string) => {
  fireEvent.click(screen.getByRole('tab', { name }))
  await settle()
}
const query = () => Object.fromEntries(new URLSearchParams(location.search))
// Type into an input and leave it, like a user clicking elsewhere (commits without waiting for the debounce).
const enter = (label: string, value: string) => {
  const input = screen.getByLabelText(label)
  fireEvent.change(input, { target: { value } })
  fireEvent.blur(input)
}

beforeEach(async () => {
  calls = []
  history.replaceState(null, '', '/') // also done in test-setup.ts; repeated so IDE runners that skip it work
  render(
    <QueryClientProvider client={createQueryClient()}>
      <App />
    </QueryClientProvider>,
  )
  await settle()
})

it('fetches only the visible tab, once per tab, and never on revisit', async () => {
  expect(calls.map((c) => c.split(' ')[0])).toEqual(['/daily-cash'])

  await openTab('Account Summary')
  await openTab('Outstanding Principal')
  await openTab('Daily Cash Transactions')
  await openTab('Account Summary')
  expect(calls.map((c) => c.split(' ')[0])).toEqual(['/daily-cash', '/account-summary', '/outstanding-principal'])
})

it('leaving a tab rewrites its dates in the URL but does not refetch it while hidden', async () => {
  enter('Report date', '2026-09-20')
  await settle()
  await openTab('Outstanding Principal') // clears reportDate from the URL
  await openTab('Daily Cash Transactions') // clears startDate/endDate
  expect(callsTo('daily-cash')).toHaveLength(2) // initial + the date change, nothing on leaving
  expect(callsTo('outstanding-principal')).toHaveLength(1)
})

it('search changes do not refetch a list without search', async () => {
  await openTab('Outstanding Principal')
  await openTab('Daily Cash Transactions')
  fireEvent.change(screen.getByLabelText('Account'), { target: { value: 'ACC-1' } })
  await act(() => new Promise((r) => setTimeout(r, 350))) // debounce
  await openTab('Outstanding Principal')
  expect(callsTo('outstanding-principal')).toHaveLength(1)
  expect(callsTo('outstanding-principal')[0]).not.toContain('search')
})

it('a search typed right before switching tabs is applied once, not dropped', async () => {
  const input = screen.getByLabelText('Account')
  fireEvent.change(input, { target: { value: 'ACC-1' } })
  fireEvent.blur(input) // a mouse click on a tab blurs the input first
  await openTab('Account Summary') // well within the 300ms debounce
  expect(query().search).toBe('ACC-1')
  expect(callsTo('account-summary')).toEqual([expect.stringContaining('"search":"ACC-1"')])
})

it('without a blur (e.g. Back button), a pending search still is not dropped', async () => {
  fireEvent.change(screen.getByLabelText('Account'), { target: { value: 'ACC-1' } })
  await openTab('Account Summary')
  expect(query().search).toBe('ACC-1')
})

it('single → range → single carries the date over', async () => {
  enter('Report date', '2026-09-20')
  await openTab('Outstanding Principal')
  expect(query()).toEqual({ tab: 'outstanding-principal', startDate: '2026-08-21', endDate: '2026-09-20' })

  enter('End date', '2026-09-25')
  await openTab('Daily Cash Transactions')
  expect(query()).toEqual({ tab: 'daily-cash', reportDate: '2026-09-25' })
})

it('range tab opened without dates: switching uses the end date shown on screen', async () => {
  await openTab('Outstanding Principal')
  history.replaceState(null, '', '/?tab=outstanding-principal') // e.g. a fresh load of this tab
  await openTab('Daily Cash Transactions')
  expect(query().reportDate).toBe(daysAgo(0))
})

it('typing a date fetches once for the final date, not per keystroke', async () => {
  const input = screen.getByLabelText('Report date')
  const historyBefore = history.length
  // What Chrome reports while typing the year 2025, then the day 15.
  for (const value of ['0002-09-20', '0020-09-20', '0202-09-20', '2025-09-20', '2025-09-01', '2025-09-15']) {
    fireEvent.change(input, { target: { value } })
    await act(() => new Promise((r) => setTimeout(r, 100))) // typing speed, below the debounce
  }
  expect(callsTo('daily-cash')).toHaveLength(1) // just the initial load so far
  await act(() => new Promise((r) => setTimeout(r, 550)))
  expect(query().reportDate).toBe('2025-09-15')
  expect(callsTo('daily-cash')).toHaveLength(2)
  expect(history.length).toBe(historyBefore + 1) // one entry for the date, not one per keystroke
})

it('an invalid date left in the field reverts instead of becoming the filter', async () => {
  enter('Report date', '0202-09-20')
  expect((screen.getByLabelText('Report date') as HTMLInputElement).value).toBe(daysAgo(1))
  expect(query().reportDate).toBeUndefined()
})

it('category dropdown: checking options filters, the button summarizes, All clears', async () => {
  const button = screen.getByRole('button', { name: /Categories/ })
  expect(button.textContent).toBe('All')

  fireEvent.click(screen.getByRole('checkbox', { name: 'Fee' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'Deposit' }))
  await settle()
  expect(query().categories).toBe('Deposit,Fee')
  expect(button.textContent).toBe('Deposit, Fee') // options order
  expect((screen.getByRole('checkbox', { name: 'All' }) as HTMLInputElement).checked).toBe(false)
  expect(callsTo('daily-cash').at(-1)).toContain('"categories":"Deposit,Fee"')

  fireEvent.click(screen.getByRole('checkbox', { name: 'All' }))
  await settle()
  expect(query().categories).toBeUndefined()
  expect(button.textContent).toBe('All')
  expect((screen.getByRole('checkbox', { name: 'All' }) as HTMLInputElement).checked).toBe(true)
})
