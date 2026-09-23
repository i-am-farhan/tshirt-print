import * as fabric from 'fabric'
import { printAreaFor } from './constants'
import { useDesignStore } from '../store/useDesignStore'
import { inkColorFor, materialFillFor } from './colors'

// ---------------------------------------------------------------------------
// Active canvas singleton
//
// This is a single-canvas app, so a module-level reference lets the toolbar and
// properties panel operate on the canvas without threading refs through props.
// ---------------------------------------------------------------------------
let activeCanvas: fabric.Canvas | null = null

export function setActiveCanvas(canvas: fabric.Canvas | null): void {
  activeCanvas = canvas
}

export function getActiveCanvas(): fabric.Canvas | null {
  return activeCanvas
}

// Editor actions wired up by CanvasStage (undo/redo own the loading guard there).
export const editorActions = {
  undo: () => {},
  redo: () => {},
}

// ---------------------------------------------------------------------------
// Placement helpers
// ---------------------------------------------------------------------------
function printCenter(): { x: number; y: number } {
  const area = printAreaFor(useDesignStore.getState().sleeve)
  return {
    x: area.left + area.width / 2,
    y: area.top + area.height / 2,
  }
}

function placeAndSelect(canvas: fabric.Canvas, obj: fabric.Object): void {
  const { x, y } = printCenter()
  obj.set({ left: x, top: y, originX: 'center', originY: 'center' })
  canvas.add(obj)
  canvas.setActiveObject(obj)
  canvas.requestRenderAll()
}

// ---------------------------------------------------------------------------
// Object creation
// ---------------------------------------------------------------------------
// Current shirt color, used to derive tasteful default fills for new objects.
function shirtColor(): string {
  return useDesignStore.getState().color
}

export function addText(text = 'Your text'): void {
  const canvas = activeCanvas
  if (!canvas) return
  const obj = new fabric.IText(text, {
    fontFamily: 'Inter',
    fontSize: 36,
    fill: inkColorFor(shirtColor()),
    textAlign: 'center',
  })
  placeAndSelect(canvas, obj)
}

export function addRect(): void {
  const canvas = activeCanvas
  if (!canvas) return
  const obj = new fabric.Rect({
    width: 110,
    height: 110,
    fill: materialFillFor(shirtColor(), 0),
    rx: 8,
    ry: 8,
  })
  placeAndSelect(canvas, obj)
}

export function addCircle(): void {
  const canvas = activeCanvas
  if (!canvas) return
  const obj = new fabric.Circle({ radius: 60, fill: materialFillFor(shirtColor(), 1) })
  placeAndSelect(canvas, obj)
}

export function addLine(): void {
  const canvas = activeCanvas
  if (!canvas) return
  const { x, y } = printCenter()
  const obj = new fabric.Line([x - 70, y, x + 70, y], {
    stroke: inkColorFor(shirtColor()),
    strokeWidth: 6,
    strokeLineCap: 'round',
  })
  canvas.add(obj)
  canvas.setActiveObject(obj)
  canvas.requestRenderAll()
}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024 // 8 MB

// Validates and adds an uploaded image. The file is read in-browser as a data
// URL only; per security rules it is never passed to any file-system, require,
// eval, or shell API.
export async function addImageFromFile(file: File): Promise<void> {
  const canvas = activeCanvas
  if (!canvas) return

  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (PNG, JPG, SVG, or WEBP).')
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Image is too large. Please use a file under 8 MB.')
  }

  const dataUrl = await readFileAsDataURL(file)
  const img = await fabric.FabricImage.fromURL(dataUrl)

  // Scale the image to comfortably fit inside the print area.
  const area = printAreaFor(useDesignStore.getState().sleeve)
  const maxW = area.width * 0.9
  const maxH = area.height * 0.9
  const scale = Math.min(maxW / (img.width ?? maxW), maxH / (img.height ?? maxH), 1)
  img.scale(scale)
  placeAndSelect(canvas, img)
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read the selected file.'))
    reader.readAsDataURL(file)
  })
}

// ---------------------------------------------------------------------------
// Object operations
// ---------------------------------------------------------------------------
export function deleteSelected(): void {
  const canvas = activeCanvas
  if (!canvas) return
  const active = canvas.getActiveObjects()
  if (!active.length) return
  active.forEach((obj) => canvas.remove(obj))
  canvas.discardActiveObject()
  canvas.requestRenderAll()
}

// Removes a specific object (used by the Layers list).
export function removeObject(obj: fabric.Object): void {
  const canvas = activeCanvas
  if (!canvas) return
  if (canvas.getActiveObject() === obj) canvas.discardActiveObject()
  canvas.remove(obj)
  canvas.requestRenderAll()
}

export async function duplicateSelected(): Promise<void> {
  const canvas = activeCanvas
  if (!canvas) return
  const active = canvas.getActiveObject()
  if (!active) return
  const clone = await active.clone()
  clone.set({
    left: (active.left ?? 0) + 20,
    top: (active.top ?? 0) + 20,
  })
  canvas.add(clone)
  canvas.setActiveObject(clone)
  canvas.requestRenderAll()
}

export function bringForward(): void {
  const canvas = activeCanvas
  if (!canvas) return
  const active = canvas.getActiveObject()
  if (active) {
    canvas.bringObjectForward(active)
    canvas.requestRenderAll()
  }
}

export function sendBackward(): void {
  const canvas = activeCanvas
  if (!canvas) return
  const active = canvas.getActiveObject()
  if (active) {
    canvas.sendObjectBackwards(active)
    canvas.requestRenderAll()
  }
}

// ---------------------------------------------------------------------------
// Alignment & nudging (relative to the print area)
// ---------------------------------------------------------------------------
export function centerHorizontally(): void {
  const canvas = activeCanvas
  if (!canvas) return
  const active = canvas.getActiveObject()
  if (!active) return
  const { x } = printCenter()
  const c = active.getCenterPoint()
  active.setXY(new fabric.Point(x, c.y), 'center', 'center')
  active.setCoords()
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: active })
}

export function centerVertically(): void {
  const canvas = activeCanvas
  if (!canvas) return
  const active = canvas.getActiveObject()
  if (!active) return
  const { y } = printCenter()
  const c = active.getCenterPoint()
  active.setXY(new fabric.Point(c.x, y), 'center', 'center')
  active.setCoords()
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: active })
}

// Moves the selection by (dx, dy) canvas units (used by arrow-key nudging).
export function nudgeSelected(dx: number, dy: number): void {
  const canvas = activeCanvas
  if (!canvas) return
  const active = canvas.getActiveObject()
  if (!active) return
  active.set({ left: (active.left ?? 0) + dx, top: (active.top ?? 0) + dy })
  active.setCoords()
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: active })
}

// ---------------------------------------------------------------------------
// Free drawing (pen)
// ---------------------------------------------------------------------------
export function setPenMode(enabled: boolean, color: string, width: number): void {
  const canvas = activeCanvas
  if (!canvas) return
  canvas.isDrawingMode = enabled
  if (enabled) {
    const brush = new fabric.PencilBrush(canvas)
    brush.color = color
    brush.width = width
    canvas.freeDrawingBrush = brush
  }
}

export function updateBrush(color: string, width: number): void {
  const canvas = activeCanvas
  if (!canvas || !canvas.freeDrawingBrush) return
  canvas.freeDrawingBrush.color = color
  canvas.freeDrawingBrush.width = width
}

// ---------------------------------------------------------------------------
// Selected-object property updates
// ---------------------------------------------------------------------------
export function updateActiveProp(
  prop: string,
  value: string | number,
): void {
  const canvas = activeCanvas
  if (!canvas) return
  const active = canvas.getActiveObject()
  if (!active) return
  active.set(prop as keyof fabric.Object, value as never)
  active.setCoords()
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: active })
}

// ---------------------------------------------------------------------------
// History (undo / redo) — snapshot based
// ---------------------------------------------------------------------------
export class History {
  private states: string[] = []
  private index = -1

  base(canvas: fabric.Canvas): void {
    this.states = [JSON.stringify(canvas.toJSON())]
    this.index = 0
  }

  record(canvas: fabric.Canvas): void {
    this.states = this.states.slice(0, this.index + 1)
    this.states.push(JSON.stringify(canvas.toJSON()))
    if (this.states.length > 60) {
      this.states.shift()
    }
    this.index = this.states.length - 1
  }

  canUndo(): boolean {
    return this.index > 0
  }

  canRedo(): boolean {
    return this.index < this.states.length - 1
  }

  undoState(): string | null {
    if (!this.canUndo()) return null
    this.index -= 1
    return this.states[this.index]
  }

  redoState(): string | null {
    if (!this.canRedo()) return null
    this.index += 1
    return this.states[this.index]
  }
}
