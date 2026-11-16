import { Card, Icon } from "@sableui/react"
import { useEffect, useRef, useState } from "react"

/**
 * The width these pages were composed at. Previewing one in a ~475px docs
 * column renders its MOBILE layout, which for a desktop landing page reads as
 * an empty box — the hero's whole composition is the thing being previewed. So
 * the iframe is laid out at desktop width and scaled down instead.
 */
const PREVIEW_WIDTH = 1440
const PREVIEW_HEIGHT = 900

/*
 * Each preview is a live iframe running the whole docs app, and same-origin
 * frames share this page's main thread. Booting every tile at once (native
 * `loading="lazy"` reaches about two screens ahead, so the whole gallery
 * qualified) cost about 1.6 s of long tasks before any tile was usable. So a
 * tile mounts its frame only once it is on screen, and frames boot one at a
 * time: the next waits for the previous to load (or for MAX_BOOT_MS).
 */
const MAX_BOOT_MS = 4000
let bootQueue: Promise<void> = Promise.resolve()
function queueBoot(start: (done: () => void) => void) {
	bootQueue = bootQueue.then(
		() =>
			new Promise<void>((resolve) => {
				const timer = setTimeout(resolve, MAX_BOOT_MS)
				start(() => {
					clearTimeout(timer)
					resolve()
				})
			}),
	)
}

/** Scales a desktop-width iframe to fit its container. */
function ScaledPreview({ src, title }: { src: string; title: string }) {
	const hostRef = useRef<HTMLDivElement>(null)
	const loadedRef = useRef<() => void>(() => {})
	const [scale, setScale] = useState(0)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		const host = hostRef.current
		if (!host) return
		const measure = () => setScale(host.clientWidth / PREVIEW_WIDTH)
		measure()
		// The docs column is fluid, so a window resize (or a nav collapse) changes
		// the scale — a scale computed once is wrong the moment the layout moves.
		const observer = new ResizeObserver(measure)
		observer.observe(host)
		return () => observer.disconnect()
	}, [])

	useEffect(() => {
		const host = hostRef.current
		if (!host) return
		if (typeof IntersectionObserver === "undefined") {
			setMounted(true)
			return
		}
		let cancelled = false
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry?.isIntersecting) return
			observer.disconnect()
			queueBoot((done) => {
				if (cancelled) return done()
				loadedRef.current = done
				setMounted(true)
			})
		})
		observer.observe(host)
		return () => {
			cancelled = true
			observer.disconnect()
			loadedRef.current()
		}
	}, [])

	return (
		<div
			ref={hostRef}
			// relative + an absolute iframe: the 1440px frame must not count toward
			// layout, or it widens its grid column and the scale never shrinks. The
			// box keeps the frame's aspect ratio from the first paint, so nothing
			// below it moves when the scale is measured or the frame arrives.
			className="relative aspect-[1440/900] min-w-0 overflow-hidden rounded-lg border border-border bg-background"
		>
			{mounted && scale > 0 ? (
				<iframe
					src={src}
					title={title}
					tabIndex={-1}
					onLoad={() => loadedRef.current()}
					className="absolute left-0 top-0 origin-top-left border-0"
					style={{
						width: PREVIEW_WIDTH,
						height: PREVIEW_HEIGHT,
						transform: `scale(${scale})`,
					}}
				/>
			) : null}
		</div>
	)
}

/**
 * A gallery tile: a scaled, non-interactive preview that opens the real page.
 * The iframe ignores the pointer so the whole tile is one link.
 */
export function PreviewCard({
	href,
	title,
	caption,
}: {
	href: string
	title?: string
	caption?: string
}) {
	return (
		<Card
			variant="flat"
			render={<a href={href} target="_blank" rel="noreferrer" />}
			// No hover fill: the tile has no padding, so flat Card's muted fill sat
			// flush against the caption. The preview's dim carries the hover instead.
			className="grid min-w-0 content-start gap-3 [&:is(a[href],button)]:hover:bg-transparent"
		>
			<div className="pointer-events-none min-w-0 motion-interactive group-hover/card:opacity-90">
				<ScaledPreview src={href} title={title ?? href} />
			</div>
			{title || caption ? (
				<div className="flex items-start justify-between gap-3">
					<div className="grid gap-0.5">
						{title ? <p className="text-title-sm">{title}</p> : null}
						{caption ? (
							<p className="text-body-sm text-muted-foreground">{caption}</p>
						) : null}
					</div>
					<Icon name="expand" className="mt-0.5 shrink-0 text-base text-muted-foreground" />
				</div>
			) : null}
		</Card>
	)
}
