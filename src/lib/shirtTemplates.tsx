import type { Side, Sleeve } from '../types'
import { CANVAS_W, CANVAS_H, shirtAssetFor, shirtLayoutFor } from './constants'

// Photorealistic shirt rendering.
//
// We use a real white shirt photo (transparent cutout) and recolor it the way
// professional mockup generators do: a solid color layer, masked to the shirt
// shape, composited with `mix-blend-mode: multiply` over the photo. Multiply
// preserves the photo's folds/shadows/highlights, so any chosen color looks
// like real dyed fabric. White (#ffffff) multiplies to a no-op, leaving the
// original white shirt — exactly what we want.

// Validate before injecting into styles; only allow hex, else fall back.
export function sanitizeColor(color: string): string {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color) ? color : '#ffffff'
}

interface ShirtMockupProps {
  sleeve: Sleeve
  color: string
  side?: Side
  className?: string
}

export function ShirtMockup({ sleeve, color, side = 'front', className }: ShirtMockupProps) {
  const asset = shirtAssetFor(sleeve, side)
  const layout = shirtLayoutFor(sleeve, side)
  const fill = sanitizeColor(color)

  const leftPct = (layout.left / CANVAS_W) * 100
  const topPct = (layout.top / CANVAS_H) * 100
  const widthPct = (layout.width / CANVAS_W) * 100

  const maskStyle = {
    WebkitMaskImage: `url(${asset.src})`,
    maskImage: `url(${asset.src})`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  } as const

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-block',
        verticalAlign: 'top',
        aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: `${widthPct}%`,
          aspectRatio: `${asset.w} / ${asset.h}`,
          isolation: 'isolate',
        }}
      >
        <img
          src={asset.src}
          alt={`${sleeve} sleeve t-shirt ${side}`}
          draggable={false}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: fill,
            mixBlendMode: 'multiply',
            ...maskStyle,
          }}
        />
      </div>
    </div>
  )
}
