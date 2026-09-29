import { useEffect, useEffectEvent, useState } from 'react'

/**
 * Local draft of a committed value (search text, a date being typed): the input updates
 * instantly, but `commit` only runs once the draft is valid and `delay` ms passed without
 * changes, or on `flush` (blur). Invalid drafts never commit; `flush` reverts them.
 */
export function useDraft(committed: string, commit: (value: string) => void, delay: number, isValid = (_: string) => true) {
  const [draft, setDraft] = useState(committed)

  // Committed value changed from outside (Back/Forward, tab switch): follow it.
  // "Adjust state during render" pattern; avoids an extra effect + render.
  const [prev, setPrev] = useState(committed)
  if (committed !== prev) {
    setPrev(committed)
    setDraft(committed)
  }

  const onCommit = useEffectEvent(commit)
  /** Commit now if the draft is pending (e.g. on blur); an invalid draft reverts. */
  const flush = () => {
    if (draft === committed) return
    if (isValid(draft)) commit(draft)
    else setDraft(committed)
  }

  const pending = draft !== committed && isValid(draft) // a boolean dep: isValid may be a new function each render
  useEffect(() => {
    if (!pending) return
    const t = setTimeout(() => onCommit(draft), delay)
    return () => clearTimeout(t) // changing again restarts the timer
  }, [pending, draft, delay])

  // Fallback when there was no blur (e.g. Back button): hidden tab (<Activity> runs effect
  // cleanups) or unmount mid-debounce commits now instead of dropping the draft.
  const flushPending = useEffectEvent(flush)
  useEffect(() => () => flushPending(), [])

  return { draft, setDraft, flush }
}
