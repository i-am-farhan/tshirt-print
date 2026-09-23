import { useCallback, useEffect, useRef } from 'react'
import * as fabric from 'fabric'
import { useDesignStore, ZOOM_MIN, ZOOM_MAX } from '../../store/useDesignStore'
import { ShirtMockup } from '../../lib/shirtTemplates'
import { CANVAS_W, CANVAS_H, printAreaFor } from '../../lib/constants'
import {
  setActiveCanvas,
  editorActions,
  History,
  setPenMode,
  deleteSelected,
  duplicateSelected,
  nudgeSelected,
} from '../../lib/fabricCanvas'
import { ZoomInIcon, ZoomOutIcon, FitIcon } from '../icons'
import { Tooltip } from '../Tooltip'
import { overlayInkFor, stageGradientFor } from '../../lib/colors'
import type { CanvasJSON, Side } from '../../types'

export function CanvasStage() {
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fcRef = useRef<fabric.Canvas | null>(null)
  const historyRef = useRef(new History())
  const loadingRef = useRef(false)
  const sideRef = useRef<Side>('front')
  const wrapRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef(1)
  const didFitRef = useRef(false)

  const sleeve = useDesignStore((s) => s.sleeve)
  const color = useDesignStore((s) => s.color)
  const side = useDesignStore((s) => s.side)
  const tool = useDesignStore((s) => s.tool)
  const penColor = useDesignStore((s) => s.penColor)
  const penWidth = useDesignStore((s) => s.penWidth)
  const zoom = useDesignStore((s) => s.zoom)
  const canvasVersion = useDesignStore((s) => s.canvasVersion)
  const setSide = useDesignStore((s) => s.setSide)
  const setZoom = useDesignStore((s) => s.setZoom)
  const saveSide = useDesignStore((s) => s.saveSide)
  const bumpCanvas = useDesignStore((s) => s.bumpCanvas)
  const setCanvasReady = useDesignStore((s) => s.setCanvasReady)
  const setHistoryFlags = useDesignStore((s) => s.setHistoryFlags)

  // Keep undo/redo button state in sync with the history stack.
  const syncHistory = useCallback(() => {
    setHistoryFlags(historyRef.current.canUndo(), historyRef.current.canRedo())
  }, [setHistoryFlags])

  // Keep a live ref of the active side for use inside stable event handlers.
  useEffect(() => {
    sideRef.current = side
  }, [side])

  // Apply zoom by scaling the Fabric canvas (internal size == CSS size keeps
  // pointer mapping accurate) while the shirt underlay scales with the box.
  const applyZoom = useCallback((z: number) => {
    const canvas = fcRef.current
    if (!canvas) return
    canvas.setDimensions({ width: CANVAS_W * z, height: CANVAS_H * z })
    canvas.setZoom(z)
    canvas.requestRenderAll()
  }, [])

  useEffect(() => {
    zoomRef.current = zoom
    applyZoom(zoom)
  }, [zoom, applyZoom])

  // Fit the shirt to the available area once the canvas is ready.
  const fitToScreen = useCallback(() => {
    const parent = wrapRef.current?.parentElement
    if (!parent) return
    const availW = parent.clientWidth - 32
    const availH = parent.clientHeight - 110
    const z = Math.min(availW / CANVAS_W, availH / CANVAS_H)
    if (Number.isFinite(z) && z > 0) setZoom(z)
  }, [setZoom])

  // ---- Create the Fabric canvas once on mount -----------------------------
  useEffect(() => {
    if (!canvasElRef.current) return
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      preserveObjectStacking: true,
      selection: true,
    })
    fcRef.current = canvas
    setActiveCanvas(canvas)

    const initial = useDesignStore.getState()
    const startJSON = initial.side === 'front' ? initial.front : initial.back
    const finishInit = () => {
      historyRef.current.base(canvas)
      applyZoom(zoomRef.current)
      canvas.renderAll()
      loadingRef.current = false
      setCanvasReady(true)
      bumpCanvas()
      syncHistory()
      if (!didFitRef.current) {
        didFitRef.current = true
        // Defer so the surrounding flex layout has its final size.
        requestAnimationFrame(() => fitToScreen())
      }
    }
    loadingRef.current = true
    if (startJSON) {
      canvas.loadFromJSON(startJSON).then(finishInit)
    } else {
      finishInit()
    }

    const persist = () => {
      if (loadingRef.current) return
      saveSide(sideRef.current, canvas.toJSON() as CanvasJSON)
    }
    const onChange = () => {
      if (loadingRef.current) return
      persist()
      historyRef.current.record(canvas)
      bumpCanvas()
      syncHistory()
    }
    const onSelection = () => bumpCanvas()

    canvas.on('object:added', onChange)
    canvas.on('object:modified', onChange)
    canvas.on('object:removed', onChange)
    canvas.on('path:created', onChange)
    canvas.on('selection:created', onSelection)
    canvas.on('selection:updated', onSelection)
    canvas.on('selection:cleared', onSelection)

    // Wire undo/redo (the loading guard lives here, alongside the canvas).
    const applyState = async (state: string | null) => {
      if (!state) return
      loadingRef.current = true
      await canvas.loadFromJSON(JSON.parse(state))
      canvas.renderAll()
      loadingRef.current = false
      saveSide(sideRef.current, canvas.toJSON() as CanvasJSON)
      bumpCanvas()
      syncHistory()
    }
    editorActions.undo = () => {
      void applyState(historyRef.current.undoState())
    }
    editorActions.redo = () => {
      void applyState(historyRef.current.redoState())
    }

    return () => {
      setActiveCanvas(null)
      setCanvasReady(false)
      editorActions.undo = () => {}
      editorActions.redo = () => {}
      canvas.dispose()
      fcRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Load the design when switching sides --------------------------------
  useEffect(() => {
    const canvas = fcRef.current
    if (!canvas) return
    // Skip the very first run; mount already loaded the initial side.
    if (!useDesignStore.getState().canvasReady) return

    const json = side === 'front' ? useDesignStore.getState().front : useDesignStore.getState().back
    loadingRef.current = true
    const done = () => {
      applyZoom(zoomRef.current)
      canvas.renderAll()
      loadingRef.current = false
      historyRef.current.base(canvas)
      bumpCanvas()
      syncHistory()
    }
    if (json) {
      canvas.loadFromJSON(json).then(done)
    } else {
      canvas.clear()
      done()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side])

  // ---- Tool / pen mode -----------------------------------------------------
  useEffect(() => {
    if (!fcRef.current) return
    setPenMode(tool === 'pen', penColor, penWidth)
  }, [tool, penColor, penWidth])

  // ---- Refit on viewport changes (e.g. device rotation / window resize) -----
  useEffect(() => {
    let t = 0
    const onResize = () => {
      window.clearTimeout(t)
      t = window.setTimeout(() => fitToScreen(), 150)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      window.clearTimeout(t)
    }
  }, [fitToScreen])

  // ---- Keyboard shortcuts --------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const canvas = fcRef.current
      if (!canvas) return
      const active = canvas.getActiveObject()
      const editingText =
        active && 'isEditing' in active && (active as fabric.IText).isEditing
      if (editingText) return

      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) editorActions.redo()
        else editorActions.undo()
      } else if (meta && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        editorActions.redo()
      } else if (meta && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        void duplicateSelected()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (active) {
          e.preventDefault()
          deleteSelected()
        }
      } else if (e.key === 'Escape') {
        if (active) {
          canvas.discardActiveObject()
          canvas.requestRenderAll()
        }
      } else if (e.key.startsWith('Arrow')) {
        if (!active) return
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        nudgeSelected(dx, dy)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const printArea = printAreaFor(sleeve)
  // canvasVersion drives this re-read so the hint appears/disappears with edits.
  const objectCount = canvasVersion >= 0 ? fcRef.current?.getObjects().length ?? 0 : 0
  const showEmptyHint = objectCount === 0 && tool !== 'pen'
  // The print box gets small at low zoom (phones) — keep only the short title
  // then so the hint doesn't overflow the box and collide with the label.
  const showHintDetail = printArea.width * zoom > 230
  // Overlay text/border colors that stay legible on the chosen shirt color.
  const ink = overlayInkFor(color)

  return (
    <div ref={wrapRef} className="flex w-full flex-col items-center gap-4">
      <SideToggle side={side} onChange={setSide} />

      <div
        className="canvas-stage-surface relative rounded-2xl shadow-stage ring-1 ring-slate-200/70 transition-[background] duration-500"
        style={{
          width: CANVAS_W * zoom,
          height: CANVAS_H * zoom,
          background: stageGradientFor(color),
        }}
      >
        {/* Shirt underlay (non-interactive) */}
        <div className="pointer-events-none absolute inset-0">
          <ShirtMockup sleeve={sleeve} color={color} side={side} className="h-full w-full" />
        </div>

        {/* Fabric design canvas */}
        <div className="absolute inset-0">
          <canvas ref={canvasElRef} />
        </div>

        {/* Print safe-zone guide */}
        <div
          className="pointer-events-none absolute rounded-md border-2 border-dashed"
          style={{
            left: printArea.left * zoom,
            top: printArea.top * zoom,
            width: printArea.width * zoom,
            height: printArea.height * zoom,
            borderColor: ink.border,
          }}
        >
          <span
            className="absolute -top-5 left-0 text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: ink.label }}
          >
            Print area
          </span>
        </div>

        {/* Empty-state hint, shown inside the print area when nothing is placed. */}
        {showEmptyHint ? (
          <div
            className="pointer-events-none absolute flex flex-col items-center justify-center gap-1 px-4 text-center"
            style={{
              left: printArea.left * zoom,
              top: printArea.top * zoom,
              width: printArea.width * zoom,
              height: printArea.height * zoom,
            }}
          >
            <p className="text-sm font-semibold" style={{ color: ink.hintTitle }}>
              Start designing
            </p>
            {showHintDetail ? (
              <p
                className="max-w-[14rem] text-xs leading-relaxed"
                style={{ color: ink.hintBody }}
              >
                Add text, shapes, or upload artwork — it&apos;ll appear right here, inside the print
                area.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
        <div className="pointer-events-auto">
          <ZoomControls
            zoom={zoom}
            onZoom={setZoom}
            onFit={fitToScreen}
            onReset={() => setZoom(1)}
          />
        </div>
      </div>
    </div>
  )
}

function ZoomControls({
  zoom,
  onZoom,
  onFit,
  onReset,
}: {
  zoom: number
  onZoom: (z: number) => void
  onFit: () => void
  onReset: () => void
}) {
  const pct = Math.round(zoom * 100)
  return (
    <div className="lg-control inline-flex items-center gap-1 rounded-full px-1.5 py-1">
      <Tooltip label="Zoom out" side="top">
        <button
          type="button"
          className="zoom-btn"
          onClick={() => onZoom(zoom - 0.1)}
          disabled={zoom <= ZOOM_MIN + 0.001}
          aria-label="Zoom out"
        >
          <ZoomOutIcon width={18} height={18} />
        </button>
      </Tooltip>
      <Tooltip label="Reset zoom to 100%" side="top">
        <button
          type="button"
          className="min-w-[3.25rem] rounded-full px-2 py-1 text-xs font-bold tabular-nums text-slate-700 hover:bg-slate-100"
          onClick={onReset}
        >
          {pct}%
        </button>
      </Tooltip>
      <Tooltip label="Zoom in" side="top">
        <button
          type="button"
          className="zoom-btn"
          onClick={() => onZoom(zoom + 0.1)}
          disabled={zoom >= ZOOM_MAX - 0.001}
          aria-label="Zoom in"
        >
          <ZoomInIcon width={18} height={18} />
        </button>
      </Tooltip>
      <span className="mx-0.5 h-5 w-px bg-slate-200" />
      <Tooltip label="Fit shirt to the screen" side="top">
        <button
          type="button"
          className="zoom-btn"
          onClick={onFit}
          aria-label="Fit to screen"
        >
          <FitIcon width={18} height={18} />
        </button>
      </Tooltip>
    </div>
  )
}

function SideToggle({ side, onChange }: { side: Side; onChange: (s: Side) => void }) {
  return (
    <div className="seg">
      {(['front', 'back'] as Side[]).map((s) => (
        <Tooltip key={s} label={`Design the ${s} of the shirt`} side="bottom">
          <button
            type="button"
            onClick={() => onChange(s)}
            className={`seg-item ${side === s ? 'seg-item-active' : ''}`}
          >
            {s}
          </button>
        </Tooltip>
      ))}
    </div>
  )
}
