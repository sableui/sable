import { useRef } from "react"
import { CodeBlock } from "@sableui/react"
import { PhoneFrame, useIosPreviewBridge } from "@sableui/react/ios/preview"
import "@sableui/react/ios/frame.css"
import { PageHeader, Section } from "../components/docs-ui"
import { useCustomizer } from "../customizer/CustomizerProvider"
import { useTheme } from "../theme"

const NATIVE_CSS = `@import "tailwindcss";
@import "@sableui/react/styles.css";
@import "@sableui/react/themes.css"; /* or one preset: theme/<id>.css */
@import "@sableui/react/ios/styles.css";
@source "../node_modules/@sableui/react/dist";`

export function IosPrototypePage() {
	// The prototype takes this page's look: preset, Customize changes, mode, icons.
	const frame = useRef<HTMLIFrameElement>(null)
	const { css, look } = useCustomizer()
	const { mode } = useTheme()
	const sync = useIosPreviewBridge(frame, { mode, icons: look.icons, reducedMotion: look.motion === "off", revision: css })
	return (
		<>
			<PageHeader
				title="iOS prototypes"
				lede="Clickable iPhone prototypes for demos and presentations, built from your Sable components and preset inside real iOS chrome."
			/>
			<div className="grid min-w-0 items-start gap-8 lg:grid-cols-2">
				<div className="flex min-w-0 flex-col gap-6">
					<Section title="What you get">
						<p className="text-body-md text-muted-foreground">
							Ask your agent to “build this as an iOS prototype.” Every screen is Sable: cards, lists, settings rows, switches, inputs, search, buttons and toasts, in your preset. The iOS adapter adds only the system chrome around them: status bar, navigation bar, tab bar and sheet presentation. It runs in the browser; it is not a native app.
						</p>
						<p className="mt-4 text-body-md text-muted-foreground">
							Fieldnotes is an invented sample. It takes this site’s current look, so switch the preset or tune it in Customize and the phone follows. Open a note, switch tabs, search, or add a note.
						</p>
					</Section>
					<Section title="One document, one preset">
						<p className="text-body-md text-muted-foreground">
							The prototype is its own page, framed here in an iframe. It loads Sable’s styles, a preset and the iOS adapter together, so the chrome and your components follow the same colors, fonts and light or dark mode.
						</p>
						<CodeBlock className="mt-4" filename="native/styles.css" code={NATIVE_CSS} />
						<CodeBlock className="mt-4" code="pnpm add konsta" />
						<p className="mt-4 text-body-md text-muted-foreground">
							The adapter draws the chrome with Konsta UI, an optional peer installed only for an iOS prototype. Apps never import it directly.
						</p>
					</Section>
					<Section title="What the adapter replaces">
						<CodeBlock code={"sable target ios --component BottomNav --json\nsable target ios --component Switch --json\nsable target ios --component Button --json"} />
						<p className="mt-4 text-body-md text-muted-foreground">
							Only chrome: BottomNav becomes the iOS tab bar, AppHeader the navigation bar. Switch, Card and nearly everything else stay Sable. A Button is an adapter control only inside the navigation bar.
						</p>
					</Section>
					<p className="text-caption text-muted-foreground">
						Targets iOS 27 on a 6.3″ iPhone. The browser approximates the platform’s look and motion. Chrome by{" "}
						<a className="underline" href="https://konstaui.com/react">Konsta UI</a> (MIT).
					</p>
				</div>
				<PhoneFrame frameRef={frame} onLoad={sync} src="/native.html" title="Fieldnotes iOS prototype" />
			</div>
		</>
	)
}
