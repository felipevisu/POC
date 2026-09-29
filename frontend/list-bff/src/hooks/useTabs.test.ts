import { expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import { useTabs } from './useTabs'

const tabs = [
  { id: 'daily-cash', dates: 'single' },
  { id: 'account-summary', dates: 'single' },
  { id: 'outstanding-principal', dates: 'range' },
] as const
const [dc, as, op] = tabs
const query = () => Object.fromEntries(new URLSearchParams(location.search))
const setup = () => renderHook(() => useTabs(tabs))

it('starts on the first tab with only that tab opened', () => {
  const { result } = setup()
  expect(result.current.active).toBe(dc)
  expect(result.current.openedTabs).toEqual([dc])
})

it('restores the active tab from the URL (refresh)', () => {
  history.replaceState(null, '', '/?tab=account-summary')
  expect(setup().result.current.active).toBe(as)
})

it('opens tabs as they are selected and keeps them opened', () => {
  const { result } = setup()
  act(() => result.current.selectTab(op))
  act(() => result.current.selectTab(dc))
  expect(result.current.active).toBe(dc)
  expect(result.current.openedTabs).toEqual([dc, op])
})

it('single → range: range ends on the report date, starts 30 days earlier; reportDate and page cleared', () => {
  history.replaceState(null, '', '/?reportDate=2026-09-20&page=3&categories=Fee')
  const { result } = setup()
  act(() => result.current.selectTab(op))
  expect(query()).toEqual({ categories: 'Fee', tab: 'outstanding-principal', startDate: '2026-08-21', endDate: '2026-09-20' })
})

it('range → single: report date is where the range ended; range cleared', () => {
  history.replaceState(null, '', '/?tab=outstanding-principal&startDate=2026-08-26&endDate=2026-09-25')
  const { result } = setup()
  act(() => result.current.selectTab(dc))
  expect(query()).toEqual({ tab: 'daily-cash', reportDate: '2026-09-25' })
})

it('single → single keeps the report date', () => {
  history.replaceState(null, '', '/?reportDate=2026-09-20')
  const { result } = setup()
  act(() => result.current.selectTab(as))
  expect(query()).toEqual({ reportDate: '2026-09-20', tab: 'account-summary' })
})
