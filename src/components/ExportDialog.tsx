import { useEffect, useState } from 'react'
import { useDesignStore } from '../store/useDesignStore'
import { getActiveCanvas } from '../lib/fabricCanvas'
import {
  exportPrintPng,
  exportFullDesignPng,
  exportMockupPng,
  exportPdf,
  renderMockupDataUrl,
} from '../lib/exportDesign'
import { DownloadIcon } from './icons'
import { toast } from '../store/useToastStore'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
}

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const sleeve = useDesignStore((s) => s.sleeve)
  const color = useDesignStore((s) => s.color)
  const side = useDesignStore((s) => s.side)
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    const canvas = getActiveCanvas()
    if (!canvas) return
    let cancelled = false
    setPreview(null)
    renderMockupDataUrl(canvas, sleeve, color, side, 1.5)
      .then((url) => {
        if (!cancelled) setPreview(url)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [open, sleeve, color, side])

  if (!open) return null

  const fileBase = `tee-${sleeve}-${side}`

  const run = async (label: string, fn: () => void | Promise<void>) => {
    const canvas = getActiveCanvas()
    if (!canvas) return
    setBusy(true)
    try {
      await fn()
      toast.success(`${label} downloaded`)
    } catch {
      toast.error(`Couldn't export ${label.toLowerCase()}. Please try again.`)
    } finally {
      setBusy(false)
    }
  }

  const options: { title: string; desc: string; action: () => void | Promise<void> }[] = [
    {
      title: 'Print-ready PNG',
      desc: 'Design only, transparent background, cropped to the print area at 4× resolution.',
      action: () => {
        const canvas = getActiveCanvas()
        if (canvas) exportPrintPng(canvas, sleeve, `${fileBase}-print.png`)
      },
    },
    {
      title: 'Full design PNG',
      desc: 'The entire design layer (transparent) at high resolution.',
      action: () => {
        const canvas = getActiveCanvas()
        if (canvas) exportFullDesignPng(canvas, `${fileBase}-design.png`)
      },
    },
    {
      title: 'Mockup PNG',
      desc: 'The colored shirt with your design composited on top — great for sharing.',
      action: async () => {
        const canvas = getActiveCanvas()
        if (canvas) await exportMockupPng(canvas, sleeve, color, side, `${fileBase}-mockup.png`)
      },
    },
    {
      title: 'Mockup PDF',
      desc: 'A print-ready PDF of the shirt mockup.',
      action: async () => {
        const canvas = getActiveCanvas()
        if (canvas) await exportPdf(canvas, sleeve, color, side, `${fileBase}-mockup.pdf`)
      },
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="panel max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Export your design</h2>
            <p className="text-sm text-slate-500">
              Exporting the <span className="font-semibold capitalize">{side}</span> side. Switch
              sides and export again for the other.
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost">
            Close
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
          <div className="canvas-checkerboard flex items-center justify-center rounded-xl border border-slate-200 p-2">
            {preview ? (
              <img src={preview} alt="Mockup preview" className="max-h-64 w-auto" />
            ) : (
              <span className="text-xs text-slate-400">Rendering preview…</span>
            )}
          </div>

          <div className="space-y-2">
            {options.map((opt) => (
              <button
                key={opt.title}
                type="button"
                disabled={busy}
                onClick={() => void run(opt.title, opt.action)}
                className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40 disabled:opacity-50"
              >
                <span className="mt-0.5 text-indigo-600">
                  <DownloadIcon />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-800">{opt.title}</span>
                  <span className="block text-xs text-slate-500">{opt.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
