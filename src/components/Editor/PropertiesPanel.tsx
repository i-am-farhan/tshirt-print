import * as fabric from 'fabric'
import { useDesignStore } from '../../store/useDesignStore'
import {
  getActiveCanvas,
  updateActiveProp,
  bringForward,
  sendBackward,
  removeObject,
  centerHorizontally,
  centerVertically,
} from '../../lib/fabricCanvas'
import { FONT_OPTIONS } from '../../lib/constants'
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  UnlockIcon,
  ForwardIcon,
  BackwardIcon,
  LayersIcon,
  TrashIcon,
  AlignCenterHIcon,
  AlignCenterVIcon,
} from '../icons'
import { Tooltip } from '../Tooltip'

function objectLabel(obj: fabric.Object): string {
  switch (obj.type) {
    case 'i-text':
    case 'text':
      return (obj as fabric.IText).text?.slice(0, 18) || 'Text'
    case 'rect':
      return 'Rectangle'
    case 'circle':
      return 'Circle'
    case 'line':
      return 'Line'
    case 'image':
      return 'Image'
    case 'path':
      return 'Drawing'
    default:
      return obj.type ?? 'Object'
  }
}

export function PropertiesPanel() {
  // Re-render whenever the canvas signals a change.
  const version = useDesignStore((s) => s.canvasVersion)
  const ready = useDesignStore((s) => s.canvasReady)
  const tool = useDesignStore((s) => s.tool)
  const penColor = useDesignStore((s) => s.penColor)
  const penWidth = useDesignStore((s) => s.penWidth)
  const setPenColor = useDesignStore((s) => s.setPenColor)
  const setPenWidth = useDesignStore((s) => s.setPenWidth)
  const bumpCanvas = useDesignStore((s) => s.bumpCanvas)
  void version // dependency for re-render

  const canvas = getActiveCanvas()
  const active = ready ? canvas?.getActiveObject() ?? null : null
  const objects = ready ? canvas?.getObjects() ?? [] : []
  const isText = active?.type === 'i-text' || active?.type === 'text'

  const selectObject = (obj: fabric.Object) => {
    if (!canvas) return
    canvas.setActiveObject(obj)
    canvas.requestRenderAll()
    bumpCanvas()
  }

  const toggleVisible = (obj: fabric.Object) => {
    obj.visible = !obj.visible
    canvas?.requestRenderAll()
    canvas?.fire('object:modified', { target: obj })
    bumpCanvas()
  }

  const toggleLock = (obj: fabric.Object) => {
    const locked = obj.selectable === false
    obj.selectable = locked
    obj.evented = locked
    canvas?.requestRenderAll()
    bumpCanvas()
  }

  const removeLayer = (obj: fabric.Object) => {
    removeObject(obj)
    bumpCanvas()
  }

  return (
    <div className="flex flex-col gap-4 lg:h-full">
      {/* Pen settings */}
      {tool === 'pen' && (
        <section className="panel p-4">
          <h3 className="field-label">Pen</h3>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-slate-300 p-0.5"
            />
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>Brush size</span>
                <span>{penWidth}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={40}
                value={penWidth}
                onChange={(e) => setPenWidth(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </section>
      )}

      {/* Selection properties */}
      <section className="panel p-4">
        <h3 className="field-label">Properties</h3>
        {!active && (
          <p className="text-sm text-slate-400">
            Select an element on the canvas to edit its properties.
          </p>
        )}

        {active && (
          <div className="space-y-4">
            {isText && (
              <TextProps obj={active as fabric.IText} onBump={bumpCanvas} />
            )}

            {!isText && active.type !== 'image' && (
              <div>
                <label className="field-label">Fill color</label>
                <input
                  type="color"
                  value={normalizeColor((active.get('fill') as string) || '#000000')}
                  onChange={(e) => updateActiveProp('fill', e.target.value)}
                  className="h-9 w-full cursor-pointer rounded border border-slate-300 p-0.5"
                />
              </div>
            )}

            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wide">Opacity</span>
                <span>{Math.round((active.opacity ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={active.opacity ?? 1}
                onChange={(e) => updateActiveProp('opacity', Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <label className="field-label">Align in print area</label>
              <div className="flex gap-2">
                <Tooltip label="Center horizontally within the print area" side="top">
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => centerHorizontally()}
                  >
                    <AlignCenterHIcon /> Center H
                  </button>
                </Tooltip>
                <Tooltip label="Center vertically within the print area" side="top">
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => centerVertically()}
                  >
                    <AlignCenterVIcon /> Center V
                  </button>
                </Tooltip>
              </div>
            </div>

            <div className="flex gap-2">
              <Tooltip label="Bring one step forward (above other layers)" side="top">
                <button type="button" className="btn-secondary flex-1" onClick={bringForward}>
                  <ForwardIcon /> Forward
                </button>
              </Tooltip>
              <Tooltip label="Send one step backward (behind other layers)" side="top">
                <button type="button" className="btn-secondary flex-1" onClick={sendBackward}>
                  <BackwardIcon /> Backward
                </button>
              </Tooltip>
            </div>
          </div>
        )}
      </section>

      {/* Layers */}
      <section className="panel flex min-h-0 flex-1 flex-col p-4">
        <h3 className="field-label flex items-center gap-1">
          <LayersIcon width={14} height={14} /> Layers
        </h3>
        {objects.length === 0 ? (
          <p className="text-sm text-slate-400">No elements yet.</p>
        ) : (
          <ul className="flex-1 space-y-1 overflow-y-auto pr-1">
            {[...objects].reverse().map((obj, i) => {
              const selected = obj === active
              const locked = obj.selectable === false
              return (
                <li
                  key={objects.length - 1 - i}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                    selected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    className="flex-1 truncate text-left"
                    onClick={() => selectObject(obj)}
                    disabled={locked}
                  >
                    {objectLabel(obj)}
                  </button>
                  <Tooltip label={obj.visible ? 'Hide layer' : 'Show layer'} side="top">
                    <button
                      type="button"
                      aria-label={obj.visible ? 'Hide layer' : 'Show layer'}
                      onClick={() => toggleVisible(obj)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {obj.visible ? (
                        <EyeIcon width={16} height={16} />
                      ) : (
                        <EyeOffIcon width={16} height={16} />
                      )}
                    </button>
                  </Tooltip>
                  <Tooltip label={locked ? 'Unlock layer' : 'Lock layer (prevent edits)'} side="top">
                    <button
                      type="button"
                      aria-label={locked ? 'Unlock layer' : 'Lock layer'}
                      onClick={() => toggleLock(obj)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {locked ? (
                        <LockIcon width={16} height={16} />
                      ) : (
                        <UnlockIcon width={16} height={16} />
                      )}
                    </button>
                  </Tooltip>
                  <Tooltip label="Delete this layer" side="top">
                    <button
                      type="button"
                      aria-label="Delete layer"
                      onClick={() => removeLayer(obj)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <TrashIcon width={16} height={16} />
                    </button>
                  </Tooltip>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function TextProps({ obj, onBump }: { obj: fabric.IText; onBump: () => void }) {
  const fontFamily = (obj.fontFamily as string) || 'Inter'
  const fontSize = (obj.fontSize as number) || 36
  const fill = normalizeColor((obj.fill as string) || '#111827')
  const align = (obj.textAlign as string) || 'left'
  const bold = obj.fontWeight === 'bold' || obj.fontWeight === 700
  const italic = obj.fontStyle === 'italic'

  return (
    <div className="space-y-3">
      <div>
        <label className="field-label">Text</label>
        <input
          className="input"
          value={obj.text ?? ''}
          onChange={(e) => {
            obj.set('text', e.target.value)
            obj.canvas?.requestRenderAll()
            obj.canvas?.fire('object:modified', { target: obj })
            onBump()
          }}
        />
      </div>
      <div>
        <label className="field-label">Font</label>
        <select
          className="input"
          value={fontFamily}
          onChange={(e) => updateActiveProp('fontFamily', e.target.value)}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="field-label">Size</label>
          <input
            type="number"
            min={6}
            max={200}
            className="input"
            value={fontSize}
            onChange={(e) => updateActiveProp('fontSize', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="field-label">Color</label>
          <input
            type="color"
            value={fill}
            onChange={(e) => updateActiveProp('fill', e.target.value)}
            className="h-[38px] w-12 cursor-pointer rounded border border-slate-300 p-0.5"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Tooltip label="Bold" side="top">
          <button
            type="button"
            aria-label="Bold"
            className={`btn-secondary flex-1 ${bold ? 'tool-btn-active' : ''}`}
            onClick={() => updateActiveProp('fontWeight', bold ? 'normal' : 'bold')}
          >
            <span className="font-bold">B</span>
          </button>
        </Tooltip>
        <Tooltip label="Italic" side="top">
          <button
            type="button"
            aria-label="Italic"
            className={`btn-secondary flex-1 ${italic ? 'tool-btn-active' : ''}`}
            onClick={() => updateActiveProp('fontStyle', italic ? 'normal' : 'italic')}
          >
            <span className="italic">I</span>
          </button>
        </Tooltip>
        {(['left', 'center', 'right'] as const).map((a) => (
          <Tooltip key={a} label={`Align ${a}`} side="top">
            <button
              type="button"
              aria-label={`Align ${a}`}
              className={`btn-secondary flex-1 capitalize ${align === a ? 'tool-btn-active' : ''}`}
              onClick={() => updateActiveProp('textAlign', a)}
            >
              {a[0].toUpperCase()}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

// Fabric fills can be gradients/patterns; the <input type="color"> needs a hex.
function normalizeColor(value: string): string {
  if (typeof value === 'string' && value.startsWith('#') && (value.length === 7 || value.length === 4)) {
    return value
  }
  return '#000000'
}
