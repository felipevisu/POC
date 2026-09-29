import { describe, expect, it } from '@jest/globals'
import { act, renderHook, waitFor } from '@testing-library/react'
import { setUrlParams, useUrlParam } from './useUrlParam'

describe('useUrlParam', () => {
  it('returns the fallback when the param is missing, else the URL value', () => {
    expect(renderHook(() => useUrlParam('reportDate', '2026-01-01')).result.current).toBe('2026-01-01')
    history.replaceState(null, '', '/?reportDate=2026-09-20')
    expect(renderHook(() => useUrlParam('reportDate', '2026-01-01')).result.current).toBe('2026-09-20')
  })

  it('only re-renders when its own param changes', () => {
    let renders = 0
    renderHook(() => {
      renders++
      return useUrlParam('reportDate')
    })
    act(() => setUrlParams({ page: '2' })) // unrelated param
    expect(renders).toBe(1)
    act(() => setUrlParams({ reportDate: '2026-09-20' }))
    expect(renders).toBe(2)
  })

  it('follows browser Back (popstate)', async () => {
    const { result } = renderHook(() => useUrlParam('page', '0'))
    act(() => setUrlParams({ page: '2' }))
    act(() => setUrlParams({ page: '3' }))
    act(() => history.back())
    await waitFor(() => expect(result.current).toBe('2'))
  })

  it('stops listening after unmount', () => {
    let renders = 0
    const { unmount } = renderHook(() => {
      renders++
      return useUrlParam('page')
    })
    unmount()
    act(() => setUrlParams({ page: '9' }))
    expect(renders).toBe(1)
  })
})

describe('setUrlParams', () => {
  it('patches params, keeping the others; null or "" removes', () => {
    history.replaceState(null, '', '/?tab=daily-cash&page=4&categories=Fee')
    setUrlParams({ page: null, categories: '', search: 'ACC' })
    expect(location.search).toBe('?tab=daily-cash&search=ACC')
  })

  it('pushes a history entry, so Back undoes the change', () => {
    const before = history.length
    setUrlParams({ page: '2' })
    expect(history.length).toBe(before + 1)
  })
})
