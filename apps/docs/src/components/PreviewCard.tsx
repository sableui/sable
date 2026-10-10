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

/** Scales a desktop-width iframe to fit its container. */
function ScaledPreview({ src, title }: { src: string; title: string }) {
	const hostRef = useRef<HTMLDivElement>(null)
	const [scale, setScale] = useState(0)

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

	return (
		<div
			ref={hostRef}
			// relative + an absolute iframe: the 1440px frame must not count toward
			// layout, or it widens its grid column and the scale never shrinks.
			className="relative min-w-0 overflow-hidden rounded-lg border border-border bg-background"
			style={{ height: scale ? PREVIEW_HEIGHT * scale : undefined }}
		>
			{scale > 0 ? (
				<iframe
					src={src}
					title={title}
					loading="lazy"
					tabIndex={-1}
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
