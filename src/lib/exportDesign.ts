import type * as fabric from 'fabric'
import { jsPDF } from 'jspdf'
import type { Side, Sleeve } from '../types'
import {
  CANVAS_W,
  CANVAS_H,
  shirtAssetFor,
  shirtLayoutFor,
  printAreaFor,
} from './constants'
import { sanitizeColor } from './shirtTemplates'

// Native download helper (avoids a file-saver dependency).
function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image for export.'))
    img.src = src
  })
}

// High resolution multiplier for crisp, print-quality output.
const EXPORT_MULTIPLIER = 4

/**
 * Print-ready PNG: the design only (transparent background), cropped to the
 * printable safe zone and rendered at high DPI. This is what a print shop uses.
 */
export function exportPrintPng(
  canvas: fabric.Canvas,
  sleeve: Sleeve,
  filename: string,
): void {
  const area = printAreaFor(sleeve)
  const dataUrl = canvas.toDataURL({
    format: 'png',
    multiplier: EXPORT_MULTIPLIER,
    left: area.left,
    top: area.top,
    width: area.width,
    height: area.height,
  })
  downloadDataUrl(dataUrl, filename)
}

/**
 * Full design PNG: the entire canvas design area at high DPI (transparent bg).
 */
export function exportFullDesignPng(canvas: fabric.Canvas, filename: string): void {
  const dataUrl = canvas.toDataURL({
    format: 'png',
    multiplier: EXPORT_MULTIPLIER,
  })
  downloadDataUrl(dataUrl, filename)
}

// Recolors the white shirt photo with `color` (multiply), clipped to the shirt
// shape — the same technique used on screen — and returns it as a canvas.
function tintedShirt(
  img: HTMLImageElement,
  color: string,
  rw: number,
  rh: number,
): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(rw))
  c.height = Math.max(1, Math.round(rh))
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0, c.width, c.height)
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, c.width, c.height)
  // Restore the shirt's alpha so the fill stays within the shirt shape.
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(img, 0, 0, c.width, c.height)
  ctx.globalCompositeOperation = 'source-over'
  return c
}

/**
 * Renders a mockup (recolored shirt + the design composited on top) at high DPI.
 */
export async function renderMockupDataUrl(
  canvas: fabric.Canvas,
  sleeve: Sleeve,
  color: string,
  side: Side,
  scale = EXPORT_MULTIPLIER,
): Promise<string> {
  const off = document.createElement('canvas')
  off.width = CANVAS_W * scale
  off.height = CANVAS_H * scale
  const ctx = off.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable.')

  const asset = shirtAssetFor(sleeve, side)
  const layout = shirtLayoutFor(sleeve, side)
  const shirtImg = await loadImage(asset.src)

  const rw = layout.width * scale
  const rh = layout.width * (asset.h / asset.w) * scale
  const shirt = tintedShirt(shirtImg, sanitizeColor(color), rw, rh)
  ctx.drawImage(shirt, layout.left * scale, layout.top * scale, rw, rh)

  // Design layer on top (shares the CANVAS_W x CANVAS_H coordinate space).
  const designUrl = canvas.toDataURL({ format: 'png', multiplier: scale })
  const designImg = await loadImage(designUrl)
  ctx.drawImage(designImg, 0, 0, off.width, off.height)

  return off.toDataURL('image/png')
}

/**
 * Mockup PNG download (shirt + design) for sharing / preview.
 */
export async function exportMockupPng(
  canvas: fabric.Canvas,
  sleeve: Sleeve,
  color: string,
  side: Side,
  filename: string,
): Promise<void> {
  const dataUrl = await renderMockupDataUrl(canvas, sleeve, color, side)
  downloadDataUrl(dataUrl, filename)
}

/**
 * Print-ready PDF containing the mockup, sized to the shirt aspect ratio.
 */
export async function exportPdf(
  canvas: fabric.Canvas,
  sleeve: Sleeve,
  color: string,
  side: Side,
  filename: string,
): Promise<void> {
  const dataUrl = await renderMockupDataUrl(canvas, sleeve, color, side)
  const orientation = CANVAS_W >= CANVAS_H ? 'landscape' : 'portrait'
  const pdf = new jsPDF({ orientation, unit: 'pt', format: [CANVAS_W, CANVAS_H] })
  pdf.addImage(dataUrl, 'PNG', 0, 0, CANVAS_W, CANVAS_H)
  pdf.save(filename)
}
