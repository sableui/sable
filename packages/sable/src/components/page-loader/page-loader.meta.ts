import type { ComponentMeta } from "../../lib/meta"

export const pageLoaderMeta: ComponentMeta = {
	name: "PageLoader",
	summary:
		"Full-screen branded loading splash: the screen fades in, the mark breathes, and an indeterminate Progress bar pulses beneath it. All motion is token-driven, so it freezes to a calm static screen when motion is off/reduced.",
	status: "stable",
	keywords: [
		"page loader",
		"loading",
		"route",
		"pending",
	],
	usage: {
		description: "Use PageLoader for full-route or full-page pending states where the entire view is not ready yet.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it during route transitions, auth checks, or initial data loading.",
			},
			{
				guidance: "do",
				description: "Prefer a clear page-level message when the wait may take noticeable time.",
			},
			{
				guidance: "dont",
				description: "Do not use PageLoader for small inline waits; use Spinner, an indeterminate Progress, or Skeleton.",
				instead: ["Spinner", "Progress", "Skeleton"],
			},
			{
				guidance: "dont",
				description: "Do not leave it mounted if the route's data can fail. It covers the whole viewport, so a PageLoader that never resolves is indistinguishable from a hung application — always give it a failure path.",
			},
		],
	},
	related: {
		components: [
			"Spinner",
			"Skeleton",
			"Progress",
		],
	},
	props: [
		{
			name: "children",
			type: "ReactNode",
			description:
				"Brand mark / logo shown at center. Falls back to a neutral pulsing mark.",
		},
		{
			name: "label",
			type: "string",
			default: '"Loading"',
			description:
				"Caption beneath the mark; also the accessible label on the role=status region.",
		},
		{
			name: "fullscreen",
			type: "boolean",
			default: "true",
			description:
				"Cover the viewport (fixed) vs fill the nearest positioned parent (absolute).",
		},
		{
			name: "hideBar",
			type: "boolean",
			default: "false",
			description: "Hide the indeterminate Progress bar under the mark.",
		},
	],
	tokensUsed: ["background", "foreground", "secondary", "primary", "muted-foreground"],
	a11y: [
		"role=status with an aria-label (the label prop) announces the loading state politely.",
		"Decorative mark and bar are aria-hidden.",
		"Motion respects the policy: under off/reduced the pulses hold their first frame (static).",
	],
	examples: [
		{ label: "Default", code: "<PageLoader label=\"Loading Studio\" />" },
		{
			label: "With a logo",
			code: '<PageLoader label="Loading"><img src="/logo.svg" alt="" className="h-10 w-auto" /></PageLoader>',
		},
		{
			label: "Contained (fills parent)",
			code: '<div className="relative h-80"><PageLoader fullscreen={false} hideBar /></div>',
		},
	],
}
