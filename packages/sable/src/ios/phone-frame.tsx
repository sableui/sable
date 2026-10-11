import { type ReactEventHandler, type Ref, useEffect, useRef, useState } from "react"
import { Phone } from "../components/phone"
import { cn } from "../lib/cn"

export const phoneSizes = {
	compact: { width: 375, height: 812 },
	/** A current 6.3" iPhone Pro. */
	standard: { width: 402, height: 874 },
	/** A current 6.9" iPhone Pro Max. */
	large: { width: 440, height: 956 },
} as const

/**
 * A logical iPhone viewport in Sable's Phone frame, scaled down to fit its host.
 *
 * The prototype is a separate document in an iframe, so Konsta's theme and the
 * prototype's fixed overlays, safe areas and fonts never touch the host page.
 * The iframe keeps the logical size (402×874 by default); the whole device is
 * scaled, never the viewport, so the prototype lays out as it would on a phone.
 * The document draws its own status bar, island and home indicator, so the
 * frame draws neither.
 *
 * `fit="width"` (the default) scales the device to its host's width and sizes
 * the host to match. `fit="contain"` scales it to fit BOTH of the host's
 * dimensions and centres it, so the whole device stays in view: give the host
 * a height through `className` (a viewport-relative one keeps the phone on
 * screen beside other controls).
 */
export function PhoneFrame({
	src,
	title = "iPhone prototype",
	size = "standard",
	fit = "width",
	className,
	frameRef,
	onLoad,
}: {
	src: string
	title?: string
	size?: keyof typeof phoneSizes
	/** "width" fills the host's width; "contain" fits the host's width and height. @default "width" */
	fit?: "width" | "contain"
	/** Classes for the host box. With fit="contain", this is where its height comes from. */
	className?: string
	frameRef?: Ref<HTMLIFrameElement>
	onLoad?: ReactEventHandler<HTMLIFrameElement>
}) {
	const host = useRef<HTMLDivElement>(null)
	const device = useRef<HTMLDivElement>(null)
	const [box, setBox] = useState({ scale: 1, width: 0, height: 0, offset: 0 })
	const { width, height } = phoneSizes[size]
	useEffect(() => {
		const hostEl = host.current
		const deviceEl = device.current
		if (!hostEl || !deviceEl) return
		// offsetWidth/Height are the untransformed size.
		const measure = () => {
			const natural = { width: deviceEl.offsetWidth, height: deviceEl.offsetHeight }
			if (!natural.width) return setBox({ scale: 1, ...natural, offset: 0 })
			// fit="contain" needs a host with a height (className); without one, width decides.
			const byHeight = fit === "contain" && hostEl.clientHeight ? hostEl.clientHeight / natural.height : 1
			const scale = Math.min(1, hostEl.clientWidth / natural.width, byHeight)
			const offset = fit === "contain" ? Math.max(0, (hostEl.clientWidth - natural.width * scale) / 2) : 0
			setBox({ scale, ...natural, offset })
		}
		const observer = new ResizeObserver(measure)
		observer.observe(hostEl)
		observer.observe(deviceEl)
		return () => observer.disconnect()
	}, [fit])
	return (
		<div
			ref={host}
			className={cn("ios-preview-host", className)}
			style={
				fit === "contain"
					? undefined
					: { maxWidth: box.width || undefined, height: box.height ? box.height * box.scale : height }
			}
		>
			<div
				ref={device}
				className="ios-phone-frame"
				// Phone's bezel is 3.7% of its width on each side, so the screen is 92.6%.
				style={{ width: width / 0.926, insetInlineStart: box.offset, transform: `scale(${box.scale})` }}
			>
				<Phone statusBar={false} systemChrome={false} className="w-full">
					<iframe ref={frameRef} onLoad={onLoad} src={src} title={title} className="ios-phone-screen" />
				</Phone>
			</div>
		</div>
	)
}
