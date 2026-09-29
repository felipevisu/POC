import { expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import { useUrlParam } from './useUrlParam'
import { usePagination } from './usePagination'

// pageSize 10, total 25 → pages 0..2
const setup = () =>
  renderHook(() => ({ p: usePagination(25), stored: useUrlParam('page') }))

it('starts on page 0 with no prev', () => {
  const { result } = setup()
  expect(result.current.p).toMatchObject({ page: 0, pageCount: 3, hasPrev: false, hasNext: true })
})

it('last page is pageCount - 1', () => {
  const { result } = setup()
  act(() => result.current.p.setPage(2))
  expect(result.current.p).toMatchObject({ page: 2, hasPrev: true, hasNext: false })
  expect(result.current.stored).toBe('2')
})

it('page 0 is stored as "unset"', () => {
  const { result } = setup()
  act(() => result.current.p.setPage(2))
  act(() => result.current.p.setPage(0))
  expect(result.current.stored).toBe('')
})

it('empty result still has one page and no next', () => {
  const { result } = renderHook(() => usePagination(0))
  expect(result.current).toMatchObject({ page: 0, pageCount: 1, hasPrev: false, hasNext: false })
})
