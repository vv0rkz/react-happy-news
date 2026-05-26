import { useLayoutEffect, useMemo, useRef } from 'react'
import type { StateSnapshot, VirtuosoHandle } from 'react-virtuoso'

/**
 * Persists and restores Virtuoso list scroll state via sessionStorage.
 *
 * Uses useLayoutEffect cleanup to capture state before unmount (layout effects
 * still have access to the ref; passive effects/useEffect do not).
 * Uses useMemo (not useEffect) so the snapshot is available on the very first
 * render — restoreStateFrom is not reactive and is ignored after mount.
 */
export function useVirtuosoState(storageKey: string): {
  virtuosoRef: React.RefObject<VirtuosoHandle | null>
  snapshot: StateSnapshot | undefined
} {
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  const snapshot = useMemo((): StateSnapshot | undefined => {
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (!raw) return undefined
      return JSON.parse(raw) as StateSnapshot
    } catch {
      return undefined
    }
  }, [storageKey])

  useLayoutEffect(() => {
    const ref = virtuosoRef
    return () => {
      ref.current?.getState((state) => {
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(state))
        } catch {
          // sessionStorage may be unavailable (private browsing / quota exceeded)
        }
      })
    }
  }, [storageKey])

  return { virtuosoRef, snapshot }
}
