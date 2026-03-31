import { useEffect, useState } from 'react'

const POLL_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const CURRENT_VERSION = __APP_VERSION__

export function useVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) return
        const { version } = (await res.json()) as { version: string }
        if (version && version !== CURRENT_VERSION) {
          setUpdateAvailable(true)
        }
      } catch {
        // network error — silently skip
      }
    }

    // Run immediately on mount so users who load the page after a deploy are notified
    // right away, rather than waiting up to POLL_INTERVAL_MS before the first check.
    void check()
    const id = setInterval(check, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return updateAvailable
}
