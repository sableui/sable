import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

export type IosPreviewTheme = {
  type: 'sable:ios-theme'
  mode: 'light' | 'dark'
  tokens: Record<string, string>
  fonts: string[]
  icons: 'reicon' | 'fallback'
  reducedMotion: boolean
}

export function isIosPreviewTheme(value: unknown): value is IosPreviewTheme {
  if (!value || typeof value !== 'object') return false
  const data = value as IosPreviewTheme
  return data.type === 'sable:ios-theme' && (data.mode === 'light' || data.mode === 'dark') &&
    (data.icons === 'reicon' || data.icons === 'fallback') && typeof data.reducedMotion === 'boolean' &&
    !!data.tokens && !Array.isArray(data.tokens) && typeof data.tokens === 'object' &&
    Object.entries(data.tokens).every(([name, token]) => /^--[\w-]+$/.test(name) && typeof token === 'string') &&
    Array.isArray(data.fonts) && data.fonts.every(url => typeof url === 'string' && url.startsWith('https://fonts.googleapis.com/'))
}

export function loadIosPreviewFonts(fonts: string[]) {
  for (const url of fonts) {
    if (!url.startsWith('https://fonts.googleapis.com/')) continue
    if (Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).some(link => link.href === url)) continue
    const link = document.createElement('link')
    link.rel = 'stylesheet'; link.href = url; document.head.appendChild(link)
  }
}

/** Same-origin frames receive computed tokens and fonts, never competing global CSS. */
export function useIosPreviewBridge(frame: RefObject<HTMLIFrameElement | null>, {
  mode, icons = 'fallback', reducedMotion = false, revision,
}: { mode: 'light' | 'dark'; icons?: 'reicon' | 'fallback'; reducedMotion?: boolean; revision?: unknown }) {
  const sync = useCallback(() => {
    const computed = getComputedStyle(document.documentElement)
    const message: IosPreviewTheme = {
      type: 'sable:ios-theme', mode, icons, reducedMotion,
      tokens: Object.fromEntries(Array.from(computed).filter(name => name.startsWith('--')).map(name => [name, computed.getPropertyValue(name).trim()])),
      fonts: Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map(link => link.href).filter(url => url.startsWith('https://fonts.googleapis.com/')),
    }
    frame.current?.contentWindow?.postMessage(message, location.origin)
  }, [frame, mode, icons, reducedMotion])
  useEffect(() => {
    let pending = 0
    const schedule = () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(sync) }
    const receive = (event: MessageEvent) => {
      if (event.origin === location.origin && event.source === frame.current?.contentWindow && event.data?.type === 'sable:ios-ready') schedule()
    }
    schedule()
    window.addEventListener('message', receive)
    const observer = new MutationObserver(schedule)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-sable-theme', 'style'] })
    observer.observe(document.head, { childList: true, subtree: true, characterData: true })
    return () => { cancelAnimationFrame(pending); observer.disconnect(); window.removeEventListener('message', receive) }
  }, [frame, sync, revision])
  return sync
}

/**
 * The prototype side of the bridge: accept the host's look, set its tokens on
 * <html> (where Sable's styles and the iOS adapter both read them), load its
 * fonts, and return it for mode, icons and motion. Konsta chrome pins its own
 * spacing and radii, so the host's density reaches Sable content only.
 * Returns null until the host has sent a look; render the document's defaults.
 */
export function useIosPreviewTheme() {
  const [look, setLook] = useState<IosPreviewTheme | null>(null)
  const applied = useRef<string[]>([])
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== window.parent || !isIosPreviewTheme(event.data)) return
      const root = document.documentElement
      const { tokens } = event.data
      for (const name of applied.current) if (!(name in tokens)) root.style.removeProperty(name)
      for (const [name, value] of Object.entries(tokens)) root.style.setProperty(name, value)
      applied.current = Object.keys(tokens)
      loadIosPreviewFonts(event.data.fonts)
      setLook(event.data)
    }
    window.addEventListener('message', receive)
    if (window.parent !== window) window.parent.postMessage({ type: 'sable:ios-ready' }, location.origin)
    return () => window.removeEventListener('message', receive)
  }, [])
  return look
}
