import { useRef } from "react"
import { PhoneFrame, useIosPreviewBridge } from "@sableui/react/ios/preview"
import "@sableui/react/ios/frame.css"
import { useCustomizer } from "../customizer/CustomizerProvider"
import { useTheme } from "../theme"

/** The canvas on iPhone, taking the Customize panel's current look. */
export function IosCanvasPreview() {
	const frame = useRef<HTMLIFrameElement>(null)
	const { css, look } = useCustomizer()
	const { mode } = useTheme()
	const sync = useIosPreviewBridge(frame, { mode, icons: look.icons, reducedMotion: look.motion === "off", revision: css })
	return <PhoneFrame frameRef={frame} onLoad={sync} src="/ios-canvas.html" title="Sable canvas iPhone demo" />
}
