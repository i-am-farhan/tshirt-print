import type { Side, Sleeve } from '../types'

// The design canvas / shirt mockup share one coordinate space.
export const CANVAS_W = 480
export const CANVAS_H = 560

export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

export interface ShirtAsset {
  src: string
  w: number
  h: number
}

export interface ShirtLayout {
  left: number
  top: number
  width: number
}

// Photorealistic shirt mockup images (white, transparent background) plus their
// intrinsic pixel sizes (used to compute aspect ratio when placing them). Front
// and back are separate flat-lay photos so the back shows a real back collar.
export const SHIRT_ASSETS: Record<Sleeve, Record<Side, ShirtAsset>> = {
  half: {
    front: { src: '/shirts/half.png', w: 1034, h: 953 },
    back: { src: '/shirts/half-back.png', w: 1119, h: 1013 },
  },
  full: {
    front: { src: '/shirts/full.png', w: 792, h: 957 },
    back: { src: '/shirts/full-back.png', w: 801, h: 1002 },
  },
  polo: {
    front: { src: '/shirts/polo.png', w: 1025, h: 945 },
    back: { src: '/shirts/polo-back.png', w: 1082, h: 949 },
  },
}

export function shirtAssetFor(sleeve: Sleeve, side: Side): ShirtAsset {
  return SHIRT_ASSETS[sleeve][side]
}

// Where each shirt image sits within the CANVAS_W x CANVAS_H design space
// (left/top/width in canvas units; height is derived from the image aspect).
// Per-side so the differently framed back photos still line up with the print
// area on the chest.
export const SHIRT_LAYOUT: Record<Sleeve, Record<Side, ShirtLayout>> = {
  half: {
    front: { left: 10, top: 64, width: 460 },
    back: { left: 14, top: 70, width: 452 },
  },
  full: {
    front: { left: 28, top: 18, width: 424 },
    back: { left: 30, top: 22, width: 420 },
  },
  polo: {
    front: { left: 10, top: 64, width: 460 },
    back: { left: 12, top: 66, width: 456 },
  },
}

export function shirtLayoutFor(sleeve: Sleeve, side: Side): ShirtLayout {
  return SHIRT_LAYOUT[sleeve][side]
}

// Printable "safe zone" (chest area) per sleeve style. Designs are guided to
// this region and exports are cropped to it for print-ready output.
export const PRINT_AREAS: Record<Sleeve, Rect> = {
  half: { left: 158, top: 150, width: 164, height: 188 },
  full: { left: 166, top: 120, width: 148, height: 188 },
  // Nudged down a touch so designs clear the collar + button placket.
  polo: { left: 158, top: 168, width: 164, height: 178 },
}

export function printAreaFor(sleeve: Sleeve): Rect {
  return PRINT_AREAS[sleeve]
}

export interface ShirtColor {
  name: string
  hex: string
}

export const SHIRT_COLORS: ShirtColor[] = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Heather Gray', hex: '#b8bcc2' },
  { name: 'Black', hex: '#141414' },
  { name: 'Navy', hex: '#1f2a44' },
  { name: 'Royal Blue', hex: '#2b50aa' },
  { name: 'Sky', hex: '#74b9ff' },
  { name: 'Forest', hex: '#1e5631' },
  { name: 'Green', hex: '#27ae60' },
  { name: 'Red', hex: '#c0392b' },
  { name: 'Maroon', hex: '#6d1f2c' },
  { name: 'Orange', hex: '#e67e22' },
  { name: 'Gold', hex: '#f1c40f' },
  { name: 'Pink', hex: '#ff6fa5' },
  { name: 'Purple', hex: '#6c3fb5' },
  { name: 'Sand', hex: '#d8c3a5' },
]

export const SLEEVE_LABELS: Record<Sleeve, string> = {
  half: 'Half Sleeve',
  full: 'Full Sleeve',
  polo: 'Polo',
}

export const FONT_OPTIONS = [
  'Inter',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Verdana',
]
