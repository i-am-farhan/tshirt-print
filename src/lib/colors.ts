// Color helpers for choosing tasteful default fills that read well on the
// currently selected shirt color. Uses a curated Material Design accent palette
// and WCAG-style contrast + hue distance so pre-filled shapes/text always pop.

// Material Design vibrant accents (500 / 600 level).
export const MATERIAL_ACCENTS = [
  '#F44336', // Red
  '#EC407A', // Pink
  '#AB47BC', // Purple
  '#7E57C2', // Deep Purple
  '#5C6BC0', // Indigo
  '#2196F3', // Blue
  '#00BCD4', // Cyan
  '#009688', // Teal
  '#43A047', // Green
  '#7CB342', // Light Green
  '#FDD835', // Yellow
  '#FFB300', // Amber
  '#FB8C00', // Orange
  '#F4511E', // Deep Orange
]

interface Rgb {
  r: number
  g: number
  b: number
}

function hexToRgb(hex: string): Rgb {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim())
  if (!m) return { r: 0, g: 0, b: 0 }
  let h = m[1]
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function relLuminance({ r, g, b }: Rgb): number {
  const lin = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relLuminance(a)
  const lb = relLuminance(b)
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

function hue({ r, g, b }: Rgb): number {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  if (d === 0) return 0
  let h = 0
  if (max === rn) h = ((gn - bn) / d) % 6
  else if (max === gn) h = (bn - rn) / d + 2
  else h = (rn - gn) / d + 4
  h *= 60
  return h < 0 ? h + 360 : h
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/**
 * Whether the shirt color is dark enough that light text reads better on it.
 */
export function isDarkShirt(shirtHex: string): boolean {
  return relLuminance(hexToRgb(shirtHex)) <= 0.45
}

/**
 * Ink color (for text / lines) that stays legible on the given shirt color:
 * a near-black on light shirts, a near-white on dark shirts.
 */
export function inkColorFor(shirtHex: string): string {
  return isDarkShirt(shirtHex) ? '#f8fafc' : '#1f2937'
}

/**
 * Readable colors for the canvas overlay UI (print-area label, guide border,
 * and the empty-state hint) chosen against the current shirt color so they
 * stay legible on both light and dark fabrics.
 */
export interface OverlayInk {
  label: string
  border: string
  hintTitle: string
  hintBody: string
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min
  let s = 0
  let h = 0
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s, l }
}

function hslCss(h: number, s: number, l: number): string {
  return `hsl(${h.toFixed(0)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%)`
}

/**
 * A soft, low-saturation "studio sweep" gradient tinted toward the shirt's hue,
 * so the canvas backdrop feels coordinated with the fabric while keeping enough
 * lightness separation for the shirt (and its edges) to stand out clearly.
 */
export function stageGradientFor(shirtHex: string): string {
  const { h, s } = hexToHsl(shirtHex)
  const dark = isDarkShirt(shirtHex)
  // Near-neutral fabrics (white / gray / black / sand) have an unreliable hue,
  // so fall back to a calm cool-gray studio backdrop.
  const grayish = s < 0.12
  const hue = grayish ? 222 : h
  const sat = grayish ? 0.08 : Math.min(0.2, 0.1 + s * 0.16)

  // Dark shirts sit on a brighter, airier sweep; light shirts on a slightly
  // deeper one so their edges don't melt into the background.
  const [top, mid, bot] = dark ? [0.95, 0.9, 0.83] : [0.91, 0.86, 0.79]

  const c1 = hslCss(hue, sat, top)
  const c2 = hslCss(hue, sat, mid)
  const c3 = hslCss(hue, Math.min(0.24, sat + 0.02), bot)
  return `radial-gradient(140% 120% at 50% 0%, ${c1} 0%, ${c2} 55%, ${c3} 100%)`
}

export function overlayInkFor(shirtHex: string): OverlayInk {
  if (isDarkShirt(shirtHex)) {
    return {
      label: 'rgba(255, 255, 255, 0.92)',
      border: 'rgba(255, 255, 255, 0.78)',
      hintTitle: 'rgba(255, 255, 255, 0.95)',
      hintBody: 'rgba(255, 255, 255, 0.78)',
    }
  }
  return {
    label: 'rgba(67, 56, 202, 0.95)', // indigo-700
    border: 'rgba(79, 70, 229, 0.7)', // indigo-600
    hintTitle: 'rgba(30, 41, 59, 0.92)', // slate-800
    hintBody: 'rgba(71, 85, 105, 0.88)', // slate-600
  }
}

/**
 * Picks a Material accent that contrasts nicely with the shirt color. `seed`
 * lets different shape types land on different accents for visual variety while
 * still ranking by contrast and avoiding hues too close to the shirt.
 */
export function materialFillFor(shirtHex: string, seed = 0): string {
  const shirt = hexToRgb(shirtHex)
  const shirtHue = hue(shirt)

  const ranked = MATERIAL_ACCENTS.map((hex) => {
    const rgb = hexToRgb(hex)
    const contrast = contrastRatio(shirt, rgb)
    const hd = hueDistance(shirtHue, hue(rgb))
    // Penalize accents whose hue is close to the shirt (muddy / low separation).
    const huePenalty = hd < 50 ? (50 - hd) / 50 : 0
    return { hex, score: contrast - huePenalty * 2.2 }
  }).sort((a, b) => b.score - a.score)

  const idx = ((seed % ranked.length) + ranked.length) % ranked.length
  return ranked[idx]?.hex ?? MATERIAL_ACCENTS[0]
}
