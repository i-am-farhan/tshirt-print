import { cloneElement, useCallback, useRef, useState } from 'react'
import type { ReactElement, Ref } from 'react'
import { createPortal } from 'react-dom'

type Side = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  label: string
  side?: Side
  children: ReactElement
}

/**
 * Lightweight hover/focus tooltip. The bubble is rendered in a portal on
 * document.body so it is never clipped by overflow-hidden panels or scroll
 * areas, and positioned relative to the wrapped element.
 */
export function Tooltip({ label, side = 'top', children }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const nodeRef = useRef<HTMLElement | null>(null)

  const show = useCallback(() => {
    if (nodeRef.current) {
      setRect(nodeRef.current.getBoundingClientRect())
      setOpen(true)
    }
  }, [])
  const hide = useCallback(() => setOpen(false), [])

  const setRefs = (node: HTMLElement | null) => {
    nodeRef.current = node
    const ref = (children as unknown as { ref?: Ref<HTMLElement> }).ref
    if (typeof ref === 'function') ref(node)
    else if (ref && typeof ref === 'object') {
      ;(ref as { current: HTMLElement | null }).current = node
    }
  }

  const props = children.props as Record<string, (e: unknown) => void>

  const child = cloneElement(
    children,
    {
      ref: setRefs,
      onMouseEnter: (e: unknown) => {
        show()
        props.onMouseEnter?.(e)
      },
      onMouseLeave: (e: unknown) => {
        hide()
        props.onMouseLeave?.(e)
      },
      onFocus: (e: unknown) => {
        show()
        props.onFocus?.(e)
      },
      onBlur: (e: unknown) => {
        hide()
        props.onBlur?.(e)
      },
    } as Record<string, unknown>,
  )

  return (
    <>
      {child}
      {open && rect
        ? createPortal(<Bubble rect={rect} side={side} label={label} />, document.body)
        : null}
    </>
  )
}

function Bubble({ rect, side, label }: { rect: DOMRect; side: Side; label: string }) {
  const gap = 9
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  let left = cx
  let top = cy
  let transform = 'translate(-50%, -100%)'

  switch (side) {
    case 'bottom':
      top = rect.bottom + gap
      transform = 'translate(-50%, 0)'
      break
    case 'left':
      left = rect.left - gap
      transform = 'translate(-100%, -50%)'
      break
    case 'right':
      left = rect.right + gap
      transform = 'translate(0, -50%)'
      break
    default:
      top = rect.top - gap
      transform = 'translate(-50%, -100%)'
  }

  return (
    <div
      role="tooltip"
      className="tooltip-bubble"
      style={{ position: 'fixed', left, top, transform }}
    >
      {label}
    </div>
  )
}
