import { useEffect, useRef, useState } from 'react'
import { useDesignStore } from '../store/useDesignStore'
import { CheckIcon, SaveIcon } from './icons'

// Reflects the autosave that happens on every canvas change (persisted to
// localStorage). Shows a brief "Saving…" pulse, then settles on "Saved".
export function SaveStatus() {
  const canvasVersion = useDesignStore((s) => s.canvasVersion)
  const ready = useDesignStore((s) => s.canvasReady)
  const [saving, setSaving] = useState(false)
  const firstRun = useRef(true)

  useEffect(() => {
    if (!ready) return
    // Skip the initial mount bump so it doesn't flash "Saving…" on load.
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setSaving(true)
    const t = window.setTimeout(() => setSaving(false), 700)
    return () => window.clearTimeout(t)
  }, [canvasVersion, ready])

  if (!ready) return null

  return (
    <span
      className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-slate-500 sm:inline-flex"
      aria-live="polite"
    >
      {saving ? (
        <>
          <SaveIcon className="h-3.5 w-3.5 animate-pulse text-indigo-500" />
          Saving…
        </>
      ) : (
        <>
          <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
          Saved
        </>
      )}
    </span>
  )
}
