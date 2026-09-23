import { useEffect, useState } from 'react'
import { useDesignStore } from './store/useDesignStore'
import { toast } from './store/useToastStore'
import { TemplatePicker } from './components/TemplatePicker'
import { Toolbar } from './components/Editor/Toolbar'
import { CanvasStage } from './components/Editor/CanvasStage'
import { PropertiesPanel } from './components/Editor/PropertiesPanel'
import { ExportDialog } from './components/ExportDialog'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ShortcutsDialog } from './components/ShortcutsDialog'
import { Toaster } from './components/Toaster'
import { SaveStatus } from './components/SaveStatus'
import { ColorSwatches } from './components/ColorSwatches'
import { Tooltip } from './components/Tooltip'
import { ShirtMockup } from './lib/shirtTemplates'
import { SLEEVE_LABELS } from './lib/constants'
import { getActiveCanvas } from './lib/fabricCanvas'
import { ArrowLeftIcon, DownloadIcon, KeyboardIcon, ShirtIcon } from './components/icons'
import type { Sleeve } from './types'

export default function App() {
  const screen = useDesignStore((s) => s.screen)
  return (
    <>
      {screen === 'picker' ? <TemplatePicker /> : <Editor />}
      <Toaster />
    </>
  )
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

function Editor() {
  const [exportOpen, setExportOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const backToPicker = useDesignStore((s) => s.backToPicker)
  const resetDesign = useDesignStore((s) => s.resetDesign)
  const bumpCanvas = useDesignStore((s) => s.bumpCanvas)

  const doReset = () => {
    getActiveCanvas()?.clear()
    resetDesign()
    bumpCanvas()
    setConfirmOpen(false)
    toast.success('Design cleared — fresh canvas ready')
  }

  // App-level shortcuts: ⌘/Ctrl+S exports, "?" opens the shortcuts cheat sheet.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault()
        setExportOpen(true)
        return
      }
      if (e.key === '?' && !isTypingTarget(e.target)) {
        const editing = getActiveCanvas()?.getActiveObject()
        const isEditing =
          editing && 'isEditing' in editing && (editing as { isEditing?: boolean }).isEditing
        if (!isEditing) {
          e.preventDefault()
          setShortcutsOpen(true)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="studio-bg flex h-screen flex-col">
      <header className="lg-surface relative z-20 flex items-center justify-between rounded-none px-4 py-3">
        <div className="flex items-center gap-3">
          <Tooltip label="Back to templates — choose another shirt style" side="bottom">
            <button type="button" className="btn-ghost" onClick={backToPicker}>
              <ArrowLeftIcon /> <span className="hidden sm:inline">Templates</span>
            </button>
          </Tooltip>
          <span className="hidden h-6 w-px bg-slate-200 sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/30">
              <ShirtIcon width={18} height={18} />
            </span>
            <div className="leading-tight">
              <span className="block font-extrabold tracking-tight">Tee Studio</span>
              <span className="block text-[11px] font-medium text-slate-400">Design workspace</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SaveStatus />
          <Tooltip label="Keyboard shortcuts (?)" side="bottom">
            <button
              type="button"
              className="btn-ghost"
              aria-label="Keyboard shortcuts"
              onClick={() => setShortcutsOpen(true)}
            >
              <KeyboardIcon />
            </button>
          </Tooltip>
          <Tooltip label="New design — clear the front and back canvases" side="bottom">
            <button type="button" className="btn-secondary" onClick={() => setConfirmOpen(true)}>
              New
            </button>
          </Tooltip>
          <Tooltip label="Export — download print-ready PNG or PDF (⌘/Ctrl + S)" side="bottom">
            <button type="button" className="btn-primary" onClick={() => setExportOpen(true)}>
              <DownloadIcon /> Export
            </button>
          </Tooltip>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_340px] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-4 lg:overflow-hidden lg:p-4">
        {/* Toolbar: horizontal bar on small screens, left rail on desktop */}
        <div className="order-1 lg:order-none lg:col-start-1 lg:row-start-1">
          <Toolbar />
        </div>

        {/* Canvas: always the focal point */}
        <div className="order-2 relative flex min-h-[58vh] items-center justify-center overflow-auto lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:min-h-0 lg:p-4">
          <CanvasStage />
        </div>

        {/* Shirt config: hidden left rail item on desktop, below canvas on mobile */}
        <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-2 lg:self-start">
          <ShirtCard />
        </div>

        {/* Properties + layers */}
        <div className="order-4 lg:order-none lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
          <PropertiesPanel />
        </div>
      </main>

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <ConfirmDialog
        open={confirmOpen}
        title="Start a new design?"
        message="This clears your artwork on both the front and back. This can't be undone."
        confirmLabel="Clear design"
        cancelLabel="Keep editing"
        destructive
        onConfirm={doReset}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

function ShirtCard() {
  const sleeve = useDesignStore((s) => s.sleeve)
  const color = useDesignStore((s) => s.color)
  const setSleeve = useDesignStore((s) => s.setSleeve)
  const setColor = useDesignStore((s) => s.setColor)

  return (
    <div className="panel flex w-full flex-col gap-3 p-4 lg:w-56">
      <h3 className="field-label">Shirt</h3>
      <div className="canvas-checkerboard flex justify-center rounded-xl py-2">
        <ShirtMockup sleeve={sleeve} color={color} className="h-24 w-auto" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(['half', 'full', 'polo'] as Sleeve[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSleeve(s)}
            className={`rounded-lg border px-1.5 py-2 text-center text-[11px] font-semibold leading-tight transition ${
              sleeve === s
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {SLEEVE_LABELS[s]}
          </button>
        ))}
      </div>
      <ColorSwatches value={color} onChange={setColor} />
    </div>
  )
}
