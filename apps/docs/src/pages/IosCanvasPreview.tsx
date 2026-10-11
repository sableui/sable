import { IosPhonePreview } from "../components/IosPhonePreview"

/**
 * The canvas on iPhone, taking the Customize panel's current look: the framed
 * device, sized to the viewport so the whole phone shows while you tune. Not
 * offered on a phone, where the web canvas already is the phone view (see
 * CustomizeCanvasPage).
 */
export function IosCanvasPreview() {
	return (
		<IosPhonePreview
			src="/ios-canvas.html"
			title="Sable canvas iPhone demo"
			className="h-[max(24rem,calc(100dvh-var(--nav-height,56px)-11rem))] lg:h-[max(32rem,calc(100dvh-var(--nav-height,56px)-11rem))]"
		/>
	)
}
