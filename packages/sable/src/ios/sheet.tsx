import { Button, Sheet } from 'konsta/react'
import { useEffect, useId, useRef, useState, type ReactNode, type PointerEvent } from 'react'

/** Browser dialog owns focus trapping, Escape, inert background, and restoration. */
export function IosSheet({ open, onOpenChange, title, children, detent = 'medium' }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; children: ReactNode; detent?: 'medium' | 'large'
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
    <Sheet opened={shown} backdrop={false} className="ios-sheet" style={{ height: expanded ? '90%' : '56%' }}>
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
        <h2 id={titleId} tabIndex={-1}>{title}</h2><Button clear onClick={() => onOpenChange(false)}>Cancel</Button></div>
      <div className="ios-sheet-content">{children}</div>
    </Sheet>
  </dialog>
}
