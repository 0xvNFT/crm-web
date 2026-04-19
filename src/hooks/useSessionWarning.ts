import { useEffect, useState } from 'react'

export const WARN_BEFORE_MS = 2 * 60 * 1000  // show dialog 2 min before expiry
const TICK_INTERVAL_MS = 1000                 // countdown ticks every second

interface SessionWarningState {
  show: boolean
  secondsLeft: number
}

/**
 * Watches the session expiry time and returns a warning state when < 2 minutes remain.
 * Returns `show: false` when expiresAt is undefined (dedicated deployments without the field).
 */
export function useSessionWarning(expiresAt: number | undefined): SessionWarningState {
  const [state, setState] = useState<SessionWarningState>({ show: false, secondsLeft: 0 })

  useEffect(() => {
    if (!expiresAt) return

    function tick() {
      const msLeft = expiresAt! - Date.now()
      if (msLeft <= 0) {
        setState({ show: true, secondsLeft: 0 })
        return
      }
      if (msLeft <= WARN_BEFORE_MS) {
        setState({ show: true, secondsLeft: Math.ceil(msLeft / 1000) })
      } else {
        setState({ show: false, secondsLeft: 0 })
      }
    }

    tick()
    const id = setInterval(tick, TICK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [expiresAt])

  return state
}
