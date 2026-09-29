import { expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import { useMultiSelect } from './useMultiSelect'

it('same selection → same URL value regardless of click order (one cache key)', () => {
  const { result } = renderHook(() => useMultiSelect('categories'))
  act(() => result.current.toggle('Fee'))
  act(() => result.current.toggle('Deposit'))
  expect(result.current.raw).toBe('Deposit,Fee')

  act(() => result.current.clear())
  expect(result.current.selected).toEqual([])
})
