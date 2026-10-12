import { Button, Glass, Sheet } from 'konsta/react'
import { useEffect, useId, useRef, useState, type ReactNode, type PointerEvent } from 'react'
import { PresentationProvider } from '../lib/presentation'

/**
 * An iOS 26 sheet. At the medium detent it floats inset from the screen edges in
 * Liquid Glass; at the large detent it is opaque and meets the bottom edge. The
 * header is a glass close button and a centered inline title.
 *
 * `background="opaque"` keeps the medium sheet's floating shape but fills it
 * solid, like SwiftUI's `.presentationBackground`: for a form, whose fields
 * would otherwise sit on whatever the glass is blurring.
 * Browser dialog owns focus trapping, Escape, inert background, and restoration.
 */
export function IosSheet({ open, onOpenChange, title, children, detent = 'medium', background = 'glass' }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; children: ReactNode; detent?: 'medium' | 'large'; background?: 'glass' | 'opaque'
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [shown, setShown] = useState(false)
  const [expanded, setExpanded] = useState(detent === 'large')
  const startY = useRef<number | null>(null)
  const dragged = useRef(false)
  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open) {
      setExpanded(detent === 'large')
      if (!el.open) {
        el.showModal()
        // showModal focuses the first control (the grabber); the title tells a reader what opened.
        el.querySelector<HTMLElement>('h2')?.focus()
      }
      const frame = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(frame)
    }
    setShown(false)
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || !!el.closest('[data-reduced-motion]')
    const timer = setTimeout(() => el.close(), reduced ? 0 : 220)
    return () => clearTimeout(timer)
  }, [open, detent])
  return <dialog ref={dialog} className="ios-sheet-dialog" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onOpenChange(false) }}
    onClick={event => { if (event.target === event.currentTarget) onOpenChange(false) }}>
    <Sheet opened={shown} backdrop={false} className="ios-sheet" data-detent={expanded ? 'large' : 'medium'} data-background={background} style={{ height: expanded ? '90%' : '56%' }}>
      <Button clear className="ios-sheet-grabber" aria-label={expanded ? 'Reduce sheet height' : 'Expand sheet'}
        onClick={() => { if (dragged.current) { dragged.current = false; return }; setExpanded(value => !value) }}
        onPointerDown={(event: PointerEvent<HTMLButtonElement>) => { startY.current = event.clientY; dragged.current = false; event.currentTarget.setPointerCapture(event.pointerId) }}
        onPointerUp={(event: PointerEvent<HTMLButtonElement>) => {
          if (startY.current === null) return
          const distance = event.clientY - startY.current
          dragged.current = Math.abs(distance) > 10
          startY.current = null
          if (distance > 80) onOpenChange(false)
          else if (distance < -40) setExpanded(true)
        }}><span className="ios-grabber-mark" /></Button>
      <div className="ios-sheet-heading">{/* Opening focuses the title, not the grabber: a reader hears what opened. */}
        <Glass className="ios-sheet-close">
          <Button inline rounded clear className="ios-icon-action" aria-label="Close" onClick={() => onOpenChange(false)}>
            {/* SF Symbols' xmark: system chrome, so it doesn't follow the app's icon set. */}
            <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M3.5 3.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>
          </Button>
        </Glass>
        <h2 id={titleId} tabIndex={-1}>{title}</h2>
      </div>
      {/* The sheet owns its content's actions: a CardFooter marked `actions` stacks at the bottom (lib/presentation). */}
      <div className="ios-sheet-content"><PresentationProvider value="sheet">{children}</PresentationProvider></div>
    </Sheet>
  </dialog>
}
