import { createPortal } from 'react-dom'
import { useToastStore } from '../store/useToastStore'
import type { ToastKind } from '../store/useToastStore'
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from './icons'

const ICONS: Record<ToastKind, typeof CheckIcon> = {
  success: CheckIcon,
  error: AlertIcon,
  info: InfoIcon,
}

const ACCENT: Record<ToastKind, string> = {
  success: 'text-emerald-600',
  error: 'text-rose-600',
  info: 'text-indigo-600',
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const Icon = ICONS[t.kind]
        return (
          <div
            key={t.id}
            role="status"
            className="lg-surface toast-in pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 shadow-stage"
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ACCENT[t.kind]}`} />
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="-mr-1 -mt-1 rounded-full p-1 text-slate-400 transition hover:bg-slate-500/10 hover:text-slate-600"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}
