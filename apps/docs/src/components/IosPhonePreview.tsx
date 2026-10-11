import { type CSSProperties, useRef } from "react"
import { Button, Dialog, DialogContent, DialogTrigger, Icon, cn } from "@sableui/react"
import { PhoneFrame, useIosPreviewBridge } from "@sableui/react/ios/preview"
import "@sableui/react/ios/frame.css"
import { useCustomizer } from "../customizer/CustomizerProvider"
import { useTheme } from "../theme"

/** Sends the site's current look to a framed prototype: preset, Customize changes, mode, icons. */
function useSyncedFrame() {
	const frame = useRef<HTMLIFrameElement>(null)
	const { css, look } = useCustomizer()
	const { mode } = useTheme()
	const sync = useIosPreviewBridge(frame, { mode, icons: look.icons, reducedMotion: look.motion === "off", revision: css })
	return { frame, sync }
}

function SyncedPhone({ src, title, className }: { src: string; title: string; className?: string }) {
	const { frame, sync } = useSyncedFrame()
	return <PhoneFrame fit="contain" className={className} frameRef={frame} onLoad={sync} src={src} title={title} />
}

/**
 * The prototype with no device around it, for a visitor already holding a
 * phone: a picture of an iPhone on an iPhone only spends their screen. `src`
 * must render without its own status bar and home indicator (NativeApp
 * systemChrome={false}); the real phone draws both.
 */
export function IosBarePreview({
	src,
	title,
	className,
	style,
}: { src: string; title: string; className?: string; style?: CSSProperties }) {
	const { frame, sync } = useSyncedFrame()
	return <iframe ref={frame} onLoad={sync} src={src} title={title} className={cn("block w-full border-0", className)} style={style} />
}

/**
 * An iOS prototype on a docs page, sized to stay on screen: the whole device
 * fits the height it is given, so the page never scrolls past half a phone.
 *
 * On a wide screen it is the prototype, live in place. On a small one a
 * scaled phone inside a scrolling page is a trap — a touch that lands on it
 * scrolls the prototype, not the page, and its controls are too small to hit —
 * so there it is a look-only preview, and "Try it" opens the prototype full
 * screen, the only thing on the page.
 */
export function IosPhonePreview({ src, title, className }: { src: string; title: string; className?: string }) {
	return (
		<div className="relative min-w-0">
			<SyncedPhone src={src} title={title} className={cn("max-lg:pointer-events-none", className)} />
			<Dialog>
				<DialogTrigger
					render={
						<Button variant="floating" className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:hidden" />
					}
				>
					<Icon name="expand" />
					Try it
				</DialogTrigger>
				<DialogContent size="fullscreen" aria-label={title}>
					{/* Room at the top for the close button, so it never sits on the device. */}
					<div className="box-border h-dvh w-full px-4 pt-16 pb-4">
						<SyncedPhone src={src} title={title} className="h-full" />
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
