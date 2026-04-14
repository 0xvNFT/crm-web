import { useEffect, useState } from 'react'

const STORAGE_KEY = 'crm_whats_new_seen'

export interface ChangelogEntry {
  version: string
  date: string
  title: string
  items: string[]
}

interface WhatsNewState {
  entry: ChangelogEntry | null
  dismiss: () => void
}

/**
 * Fetches /changelog.json and returns the latest entry if the user hasn't
 * seen it yet for the current app version. Uses localStorage to track seen state
 * so the popover only shows once per deploy.
 *
 * The "version" field in changelog.json is decoupled from the build hash on
 * purpose — you control when "what's new" appears by updating changelog.json
 * as part of a deploy, not on every hash change.
 */
export function useWhatsNew(): WhatsNewState {
  const [entry, setEntry] = useState<ChangelogEntry | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/changelog.json?t=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) return
        const entries = (await res.json()) as ChangelogEntry[]
        if (!Array.isArray(entries) || entries.length === 0) return

        const latest = entries[0]
        const seenKey = `${STORAGE_KEY}_${latest.version}`

        // Already seen this version — don't show again
        if (localStorage.getItem(seenKey) === '1') return

        setEntry(latest)
      } catch {
        // Network error or malformed JSON — silently skip
      }
    }

    // Small delay so the page content renders first — popover feels less jarring
    const t = setTimeout(() => void load(), 1200)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    if (!entry) return
    localStorage.setItem(`${STORAGE_KEY}_${entry.version}`, '1')
    setEntry(null)
  }

  return { entry, dismiss }
}
