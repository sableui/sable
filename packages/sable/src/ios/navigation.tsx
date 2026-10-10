import { createContext, useContext, useRef, useState, useEffect, type ReactNode, type PointerEvent } from 'react'

type Entry = { id: string; content: ReactNode; returnFocus: HTMLElement | null }
type Navigation = { push: (id: string, content: ReactNode) => void; pop: () => void; depth: number }
const Context = createContext<Navigation | null>(null)

export function useNavigation() {
  const value = useContext(Context)
  if (!value) throw new Error('useNavigation needs a NavigationStack')
  return value
}

/** Keep one mounted stack per tab so each tab retains its route and scroll. */
export function NavigationStack({ children, active = true, label }: { children: ReactNode; active?: boolean; label: string }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [direction, setDirection] = useState('push')
  const gesture = useRef<{ x: number; y: number } | null>(null)
  const host = useRef<HTMLDivElement>(null)
  const focusTarget = useRef<HTMLElement | null>(null)
  const push = (id: string, content: ReactNode) => {
    const returnFocus = document.activeElement as HTMLElement
    setDirection('push')
    setEntries(previous => [...previous, { id, content, returnFocus }])
  }
  const pop = () => { setDirection('pop'); setEntries(previous => { focusTarget.current = previous.at(-1)?.returnFocus || null; return previous.slice(0, -1) }) }
  useEffect(() => {
    if (!active) return
    if (direction === 'pop' && focusTarget.current?.isConnected) focusTarget.current.focus({ preventScroll: true })
    else if (entries.length) host.current?.querySelector<HTMLElement>('[data-ios-route]:last-child h1, [data-ios-route]:last-child [data-ios-title]')?.focus({ preventScroll: true })
  }, [entries.length, active, direction])
  const endGesture = (event: PointerEvent) => {
    const start = gesture.current
    gesture.current = null
    if (start && entries.length && event.clientX - start.x > 80 && Math.abs(event.clientY - start.y) < 50) pop()
  }
  return <Context.Provider value={{ push, pop, depth: entries.length }}>
    <div ref={host} className="ios-navigation-stack" hidden={!active} aria-label={label} data-direction={direction}
      onPointerDown={event => { if (event.clientX < 24 && event.isPrimary) gesture.current = { x: event.clientX, y: event.clientY } }}
      onPointerUp={endGesture} onPointerCancel={() => { gesture.current = null }}>
      <div className="ios-route" data-ios-route="root" hidden={entries.length > 0}>{children}</div>
      {entries.map((entry, index) => <div key={`${index}:${entry.id}`} className="ios-route" data-ios-route={entry.id} hidden={index !== entries.length - 1}>{entry.content}</div>)}
    </div>
  </Context.Provider>
}
