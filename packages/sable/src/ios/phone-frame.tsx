import { type ReactEventHandler, type Ref, useEffect, useRef, useState } from "react"
import { Phone } from "../components/phone"

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
 */
export function PhoneFrame({
	src,
	title = "iPhone prototype",
	size = "standard",
	frameRef,
	onLoad,
}: {
	src: string
	title?: string
	size?: keyof typeof phoneSizes
	frameRef?: Ref<HTMLIFrameElement>
	onLoad?: ReactEventHandler<HTMLIFrameElement>
}) {
	const host = useRef<HTMLDivElement>(null)
	const device = useRef<HTMLDivElement>(null)
	const [fit, setFit] = useState({ scale: 1, width: 0, height: 0 })
	const { width, height } = phoneSizes[size]
	useEffect(() => {
		const hostEl = host.current
		const deviceEl = device.current
		if (!hostEl || !deviceEl) return
		// offsetWidth/Height are the untransformed size.
		const measure = () => {
			const natural = { width: deviceEl.offsetWidth, height: deviceEl.offsetHeight }
			const scale = natural.width ? Math.min(1, hostEl.clientWidth / natural.width) : 1
			setFit({ scale, ...natural })
		}
		const observer = new ResizeObserver(measure)
		observer.observe(hostEl)
		observer.observe(deviceEl)
		return () => observer.disconnect()
	}, [])
	return (
		<div
			ref={host}
			className="ios-preview-host"
			style={{ maxWidth: fit.width || undefined, height: fit.height ? fit.height * fit.scale : height }}
		>
			<div
				ref={device}
				className="ios-phone-frame"
				// Phone's bezel is 3.7% of its width on each side, so the screen is 92.6%.
				style={{ width: width / 0.926, transform: `scale(${fit.scale})` }}
			>
				<Phone statusBar={false} systemChrome={false} className="w-full">
					<iframe ref={frameRef} onLoad={onLoad} src={src} title={title} className="ios-phone-screen" />
				</Phone>
			</div>
		</div>
	)
}
