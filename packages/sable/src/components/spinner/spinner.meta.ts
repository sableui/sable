import type { ComponentMeta } from "../../lib/meta"

export const spinnerMeta: ComponentMeta = {
	name: "Spinner",
	summary:
		"Pure SVG activity indicator. No Base UI, no icon dependency — a role=status ring (faint track + rounded-cap arc) that inherits the current text color. Size with the size prop (sm / md / lg), color with text-*.",
	status: "stable",
	keywords: [
		"spinner",
		"loading",
		"pending",
		"indeterminate",
	],
	usage: {
		description: "Use Spinner for short indeterminate waits where the user cannot know exact progress.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it in compact panels or places where layout is already stable. In a button, use Button's loading prop rather than placing a Spinner by hand — it disables the button, sets aria-busy and sizes the spinner to the button's icon.",
			},
			{
				guidance: "do",
				description: "Pair it with accessible loading text when the surrounding label is not enough.",
			},
			{
				guidance: "dont",
				description: "Do not use Spinner as the only content for long waits or full page loading.",
			},
			{
				guidance: "dont",
				description: "Do not use it without an accessible name or a nearby status message. A spinning icon is invisible to a screen reader, so the wait is announced as nothing at all.",
			},
		],
	},
	related: {
		components: [
			"Skeleton",
			"Progress",
		],
	},
	props: [
		{
			name: "label",
			type: "string",
			default: '"Loading"',
			description:
				"Accessible label announced by screen readers while visible (sets aria-label on the role=status element).",
		},
		{
			name: "appearance",
			type: '"ring" | "dots"',
			default: '"ring"',
			description: "ring is the default indicator; dots are three bouncing dots, softer, for chat and inline text.",
		},
		{
			name: "size",
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description: "One scale for both appearances: ring 14 / 16 / 24px, dots 4 / 6 / 8px.",
		},
		{
			name: "className",
			type: "string",
			description:
				"Color (text-*); the ring's strokes use currentColor, so it follows the text color. Size with the size prop — a size-* class still overrides the ring for an off-scale context (Button sizes its own spinner this way), but is not the way to pick a size.",
		},
	],
	tokensUsed: ["foreground", "muted-foreground", "primary-foreground"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "A spinner already signals a wait. Fading it in delays the signal for exactly as long as the user most needs it.",
		},
		{
			slot: "response",
			recipe: "none",
			part: "Root",
			why: "It is a status indicator, not a control.",
		},
		{
			slot: "transition",
			recipe: "none",
			part: "Root",
			why: "One state. Whatever replaces it on completion owns that change.",
		},
		{
			slot: "activity",
			recipe: "motion-spin",
			part: "Root",
			why: "The rotation is the whole component — it is the only thing distinguishing 'working' from 'frozen'. motion-spin rather than Tailwind's animate-spin because the built-in ignores --motion-scale, so the reduced-motion policy cannot freeze it.",
		},
	],
	a11y: [
		"Wrapped in role=status, a polite live region, with an aria-label (default 'Loading').",
		"Color comes from currentColor; pair with a text-* token for adequate contrast.",
		"Spins with the motion-spin utility, which follows --motion-scale, so it slows and stops with the motion setting and reduced-motion.",
	],
	variants: {
		appearance: ["ring", "dots"],
		size: ["sm", "md", "lg"],
	},
	examples: [
		{
			label: "Dots",
			code: '<Spinner appearance="dots" label="Assistant is typing" className="text-muted-foreground" />',
		},
		{ label: "Default", code: "<Spinner />" },
		{
			label: "Sized + tinted",
			code: '<Spinner size="lg" className="text-muted-foreground" />',
		},
		{
			label: "Inside a button (Button owns it — use loading)",
			code: '<Button loading>Collecting</Button>',
		},
	],
}
