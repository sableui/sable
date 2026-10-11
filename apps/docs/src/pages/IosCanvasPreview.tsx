import { useLayoutEffect, useRef, useState } from "react"
import { IosBarePreview, IosPhonePreview } from "../components/IosPhonePreview"
import { useCustomizer } from "../customizer/CustomizerProvider"
import { PHONE, useMediaQuery } from "../lib/use-media-query"

/**
 * The height from an element's top to the bottom of the screen. Measured, not
 * a calc: what sits above it is spaced in density-scaled units, so a Customize
 * change moves it. Re-measured on resize and on every look change.
 */
function useFillToBottom() {
	const ref = useRef<HTMLDivElement>(null)
	const [top, setTop] = useState<number | null>(null)
	const { css } = useCustomizer()
	useLayoutEffect(() => {
		const measure = () => {
			// Skipped while its tab is hidden (no box), which would measure 0.
			if (ref.current?.getClientRects().length) setTop(ref.current.getBoundingClientRect().top + window.scrollY)
		}
		measure()
		window.addEventListener("resize", measure)
		return () => window.removeEventListener("resize", measure)
	}, [css])
	return { ref, height: top == null ? undefined : `calc(100dvh - ${top}px)` }
}

/**
 * The canvas on iPhone, taking the Customize panel's current look.
 *
 * On a phone it is the prototype itself, edge to edge in the space below the
 * header and platform tabs: tune in Customize (a full settings view there),
 * close it, and the canvas has changed. Elsewhere it is the framed device,
 * sized to the viewport so the whole phone shows while you tune.
 */
export function IosCanvasPreview() {
	const phone = useMediaQuery(PHONE)
	return phone ? <BareCanvas /> : (
		<IosPhonePreview
			src="/ios-canvas.html"
			title="Sable canvas iPhone demo"
			className="h-[max(24rem,calc(100dvh-var(--nav-height,56px)-11rem))] lg:h-[max(32rem,calc(100dvh-var(--nav-height,56px)-11rem))]"
		/>
	)
}

function BareCanvas() {
	const { ref, height } = useFillToBottom()
	return (
		// Bleeds through the page gutter and the page's bottom padding (the same
		// density-scaled unit), so the prototype's tab bar sits on the screen's edge.
		<div ref={ref} className="-mx-(--page-inset) -mb-10">
			<IosBarePreview src="/ios-canvas.html?bare" title="Sable canvas iPhone demo" className="h-dvh" style={{ height }} />
		</div>
	)
}
