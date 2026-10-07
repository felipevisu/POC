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

it('starts on the first tab', () => {
  expect(setup().result.current.active).toBe(dc)
})

it('restores the active tab from the URL (refresh)', () => {
  history.replaceState(null, '', '/?tab=account-summary')
  expect(setup().result.current.active).toBe(as)
})

it('selecting a tab makes it active', () => {
  const { result } = setup()
  act(() => result.current.selectTab(op))
  expect(result.current.active).toBe(op)
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

it('single → range: the 30 days cross month, year and leap-day boundaries', () => {
  for (const [reportDate, startDate] of [
    ['2026-01-15', '2025-12-16'],
    ['2024-03-30', '2024-02-29'],
  ]) {
    history.replaceState(null, '', `/?reportDate=${reportDate}`)
    const { result, unmount } = setup()
    act(() => result.current.selectTab(op))
    expect(query()).toMatchObject({ startDate, endDate: reportDate })
    unmount()
  }
})
