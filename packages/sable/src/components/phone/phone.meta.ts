import type { ComponentMeta } from "../../lib/meta"

export const phoneMeta: ComponentMeta = {
	name: "Phone",
	summary:
		"A current smartphone frame at iPhone proportions: a dark body with a titanium band, thin bezels, an island, an optional status bar and a scrollable screen.",
	status: "stable",
	keywords: [
		"phone",
		"device mockup",
		"mobile preview",
		"frame",
	],
	usage: {
		description: "Use Phone to frame a mobile product preview when the device context is useful.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for mobile UI demos, screenshots, and responsive previews.",
			},
			{
				guidance: "do",
				description: "Keep the framed content legible and avoid stuffing full desktop layouts into the phone frame.",
			},
			{
				guidance: "dont",
				description: "Do not use Phone as a generic panel, card, or production app shell.",
			},
			{
				guidance: "dont",
				description: "Do not use it to test responsive behaviour. The frame is a fixed aspect box, not a viewport, so media queries inside key off the real window.",
			},
		],
	},
	related: {
		components: [
			"Browser",
		],
	},
	props: [
		{
			name: "children",
			type: "ReactNode",
			description: "Content rendered inside the scrollable screen region.",
		},
		{
			name: "statusBar",
			type: "boolean",
			default: "true",
			description: "Draw a status bar (time, signal, battery) across the top of the screen. Turn it off to frame a screenshot that already has one.",
		},
		{
			name: "systemChrome",
			type: "boolean",
			default: "true",
			description: "Draw the camera pill and home indicator. Turn it off when the content draws its own system chrome, such as an iOS prototype framed by PhoneFrame from @sableui/react/ios/preview.",
		},
		{
			name: "className",
			type: "string",
			description: "Additional classes merged onto the outer wrapper (set the width here; the screen keeps its proportions).",
		},
	],
	tokensUsed: ["background", "foreground"],
	a11y: [
		"Purely presentational frame; the screen region scrolls when content overflows. Add headings/landmarks in the content as needed.",
		"The frame's chrome (status bar, camera, buttons) is aria-hidden, so the content inside carries the entire accessible meaning. A screenshot with no alt text makes the whole mockup announce as nothing at all.",
	],
	examples: [
		{
			label: "Framing a mobile layout",
			code: '<Phone><div className="p-4"><h2 className="text-title-lg">Activity</h2><p className="text-body-sm text-muted-foreground">3 new collects today.</p></div></Phone>',
		},
		{
			label: "Mockup, not a responsive preview",
			code: `// Phone is DECORATIVE framing for a mobile screenshot on a marketing surface.

<Phone>
  <img src="/screenshots/mobile.png" alt="The mobile app" />
</Phone>

// ✗ Using it to test responsive layout. The frame is a fixed aspect box, not a
//   viewport — media queries inside it key off the real window, so what you see
//   is not what a phone renders. Resize the browser, or use device emulation.
// ✗ Wrapping live, interactive app UI (forms, buttons that act). Same as Browser: the frame says "picture of
//   software", so real controls inside it read as a screenshot that moves. Static composed content is fine.
//   The exception is a clickable iOS prototype: PhoneFrame (@sableui/react/ios/preview)
//   frames a whole phone-sized document in an iframe, where the frame is the device.`,
		},
	],
}
