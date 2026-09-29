import { afterEach, beforeEach, expect, it, jest } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import { useSearchInput } from './useSearch'
import { setUrlParams, useUrlParam } from './useUrlParam'

beforeEach(() => {
  jest.useFakeTimers()
})
afterEach(() => {
  jest.useRealTimers()
})

// The input state plus what's committed to the tab's filters.
const setup = () =>
  renderHook(() => ({ input: useSearchInput(300), search: useUrlParam('search'), page: useUrlParam('page') }))

it('updates the input instantly but commits the filter only after the debounce', () => {
  const { result } = setup()
  act(() => result.current.input.setValue('ACC'))
  expect(result.current.input.value).toBe('ACC')
  expect(result.current.search).toBe('')

  act(() => jest.advanceTimersByTime(299))
  expect(result.current.search).toBe('')
  act(() => jest.advanceTimersByTime(1))
  expect(result.current.search).toBe('ACC')
  expect(result.current.page).toBe('') // new search → first page
})

it('typing again restarts the timer: one commit for a burst of keystrokes', () => {
  const { result } = setup()
  const before = history.length
  for (const v of ['A', 'AC', 'ACC', 'ACC-1']) {
    act(() => result.current.input.setValue(v))
    act(() => jest.advanceTimersByTime(200))
  }
  expect(result.current.search).toBe('')
  act(() => jest.advanceTimersByTime(300))
  expect(result.current.search).toBe('ACC-1')
  expect(history.length).toBe(before + 1) // one URL write
})

it('follows the URL when it changes from outside (Back/Forward)', () => {
  const { result } = setup()
  act(() => setUrlParams({ search: 'ACC-1' }))
  expect(result.current.input.value).toBe('ACC-1')
})
