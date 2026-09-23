import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CanvasJSON, Screen, Side, Sleeve, Tool } from '../types'
import { SHIRT_COLORS } from '../lib/constants'

interface DesignState {
  // App flow
  screen: Screen

  // Shirt config
  sleeve: Sleeve
  color: string

  // Editor working state
  side: Side
  tool: Tool
  penColor: string
  penWidth: number

  // Serialized design per side (round-tripped through Fabric)
  front: CanvasJSON
  back: CanvasJSON

  // Canvas display zoom (1 = 100%). Not persisted.
  zoom: number

  // Bumped whenever the live canvas changes so contextual UI can re-read it.
  canvasVersion: number
  canvasReady: boolean

  // History availability for the active side (drives undo/redo button state).
  canUndo: boolean
  canRedo: boolean

  // actions
  setSleeve: (s: Sleeve) => void
  setColor: (c: string) => void
  openEditor: () => void
  backToPicker: () => void
  setSide: (s: Side) => void
  setTool: (t: Tool) => void
  setPenColor: (c: string) => void
  setPenWidth: (w: number) => void
  saveSide: (side: Side, json: CanvasJSON) => void
  setZoom: (z: number) => void
  bumpCanvas: () => void
  setCanvasReady: (ready: boolean) => void
  setHistoryFlags: (canUndo: boolean, canRedo: boolean) => void
  resetDesign: () => void
}

export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 2.5
const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z))

export const useDesignStore = create<DesignState>()(
  persist(
    (set) => ({
      screen: 'picker',
      sleeve: 'half',
      color: SHIRT_COLORS[0].hex,
      side: 'front',
      tool: 'select',
      penColor: '#1f2937',
      penWidth: 4,
      front: null,
      back: null,
      zoom: 1,
      canvasVersion: 0,
      canvasReady: false,
      canUndo: false,
      canRedo: false,

      setSleeve: (sleeve) => set({ sleeve }),
      setColor: (color) => set({ color }),
      openEditor: () => set({ screen: 'editor' }),
      backToPicker: () => set({ screen: 'picker', tool: 'select' }),
      setSide: (side) => set({ side }),
      setTool: (tool) => set({ tool }),
      setPenColor: (penColor) => set({ penColor }),
      setPenWidth: (penWidth) => set({ penWidth }),
      saveSide: (side, json) =>
        set(side === 'front' ? { front: json } : { back: json }),
      setZoom: (z) => set({ zoom: clampZoom(z) }),
      bumpCanvas: () => set((s) => ({ canvasVersion: s.canvasVersion + 1 })),
      setCanvasReady: (canvasReady) => set({ canvasReady }),
      setHistoryFlags: (canUndo, canRedo) => set({ canUndo, canRedo }),
      resetDesign: () =>
        set({ front: null, back: null, side: 'front', tool: 'select' }),
    }),
    {
      name: 'tee-studio-design',
      // Don't persist transient editor flags; only the actual design + config.
      partialize: (s) => ({
        sleeve: s.sleeve,
        color: s.color,
        side: s.side,
        front: s.front,
        back: s.back,
        penColor: s.penColor,
        penWidth: s.penWidth,
      }),
    },
  ),
)
