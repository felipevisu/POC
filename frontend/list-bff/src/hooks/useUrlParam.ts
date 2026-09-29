import { useSyncExternalStore } from 'react'

// The URL is the store: tab, filters and page survive a refresh and are shareable.
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())
window.addEventListener('popstate', notify)
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}

/** Patch search params; null/'' removes the key. Pushes a history entry (Back undoes it). */
export function setUrlParams(patch: Record<string, string | null>) {
  const url = new URL(location.href)
  for (const [k, v] of Object.entries(patch)) (v ? url.searchParams.set(k, v) : url.searchParams.delete(k))
  history.pushState(null, '', url) // fires no event, so notify ourselves
  notify()
}

/**
 * Subscribes to a single search param. The snapshot is a string, so a component
 * only re-renders when *its* param changes, not on every URL update.
 */
export function useUrlParam(key: string, fallback = '') {
  return useSyncExternalStore(subscribe, () => new URLSearchParams(location.search).get(key) ?? fallback)
}

/** Whole query string; for things that must react to *any* change. */
export const useUrlSearch = () => useSyncExternalStore(subscribe, () => location.search)
