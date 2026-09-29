import { expect, it } from '@jest/globals'
import { daysBefore, rangeEndingOn } from './dates'

it('daysBefore crosses months, years and leap days', () => {
  expect(daysBefore('2026-09-28', 30)).toBe('2026-08-29')
  expect(daysBefore('2026-01-15', 30)).toBe('2025-12-16')
  expect(daysBefore('2024-03-01', 1)).toBe('2024-02-29')
})

it('rangeEndingOn: report date becomes the end, start is 30 days earlier', () => {
  expect(rangeEndingOn('2026-09-28')).toEqual({ startDate: '2026-08-29', endDate: '2026-09-28' })
})
