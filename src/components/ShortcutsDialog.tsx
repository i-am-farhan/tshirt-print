import { useEffect } from 'react'
import { CloseIcon, KeyboardIcon } from './icons'

interface ShortcutsDialogProps {
  open: boolean
  onClose: () => void
}

const MOD = navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl'

const GROUPS: { title: string; items: { keys: string[]; label: string }[] }[] = [
  {
    title: 'General',
    items: [
      { keys: [MOD, 'Z'], label: 'Undo' },
      { keys: [MOD, 'Shift', 'Z'], label: 'Redo' },
      { keys: [MOD, 'S'], label: 'Export design' },
      { keys: ['?'], label: 'Show this help' },
    ],
  },
  {
    title: 'Objects',
    items: [
      { keys: [MOD, 'D'], label: 'Duplicate selection' },
      { keys: ['Delete'], label: 'Delete selection' },
      { keys: ['Esc'], label: 'Deselect' },
      { keys: ['←', '↑', '→', '↓'], label: 'Nudge 1px' },
      { keys: ['Shift', 'Arrow'], label: 'Nudge 10px' },
    ],
  },
]

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.6rem] items-center justify-center rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-600 shadow-sm">
      {children}
    </kbd>
  )
}

export function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="panel modal-in max-h-[90vh] w-full max-w-md overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-100 p-2 text-indigo-600">
              <KeyboardIcon className="h-5 w-5" />
            </span>
            <h2 id="shortcuts-title" className="text-lg font-extrabold text-slate-900">
              Keyboard shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-500/10 hover:text-slate-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {group.title}
              </h3>
              <ul className="space-y-1.5">
                {group.items.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-3 text-sm text-slate-600"
                  >
                    <span>{item.label}</span>
                    <span className="flex items-center gap-1">
                      {item.keys.map((k) => (
                        <Key key={k}>{k}</Key>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
