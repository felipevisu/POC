import { expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import { useDateParams, type DateDefaults } from './useDateParams'
import { setUrlParams, useUrlParam } from './useUrlParam'

const setup = (defaults: DateDefaults) =>
  renderHook(() => ({ d: useDateParams(defaults), page: useUrlParam('page'), set: setUrlParams }))

it('single date: uses reportDate with its default, and resets the page', () => {
  const { result } = setup({ reportDate: '2026-09-28' })
  expect(result.current.d).toMatchObject({ single: true, reportDate: '2026-09-28', startDate: '', endDate: '' })

  act(() => result.current.set({ page: '3' }))
  act(() => result.current.d.setDates({ reportDate: '2026-09-20' }))
  expect(result.current.d.reportDate).toBe('2026-09-20')
  expect(result.current.page).toBe('')
})

it('range: uses startDate/endDate and changes one end at a time', () => {
  const { result } = setup({ startDate: '2026-09-01', endDate: '2026-09-28' })
  expect(result.current.d).toMatchObject({ single: false, startDate: '2026-09-01', endDate: '2026-09-28', reportDate: '' })

  act(() => result.current.d.setDates({ endDate: '2026-09-10' }))
  expect(result.current.d).toMatchObject({ startDate: '2026-09-01', endDate: '2026-09-10' })
})
