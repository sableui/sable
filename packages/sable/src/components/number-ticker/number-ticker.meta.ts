import type { ComponentMeta } from "../../lib/meta"

export const numberTickerMeta: ComponentMeta = {
	name: "NumberTicker",
	summary:
		"A number that rolls to its new value digit by digit, like an odometer. Formatted with Intl.NumberFormat (currency, percent, compact, any locale); separators, signs and units hold still while each digit column turns, and a digit that appears or goes away eases its width so nothing around it jumps. At rest on first paint; under subtle or reduced motion the value simply updates.",
	status: "stable",
	keywords: [
		"number",
		"counter",
		"odometer",
		"rolling number",
		"animated number",
		"ticker",
		"count up",
		"stat",
		"kpi",
		"metric",
		"price",
	],
	usage: {
		description:
			"Use NumberTicker for a figure that changes in place while someone is looking at it — a dashboard total after a filter changes, a live count, a price as a plan's options change, a score. The roll says \"this number moved, and by roughly this much\"; the reader sees the change happen instead of noticing, later, that a number is different.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for the headline figure that a control on the same screen changes — the total above a chart, the price beside a quantity stepper — so cause and effect are seen together.",
			},
			{
				guidance: "do",
				description: "Format through `format` (currency, percent, compact) rather than pre-formatting a string, so separators and units stay put while only the digits roll.",
			},
			{
				guidance: "do",
				description: "Pass `aria-live=\"polite\"` only when the change itself is news the reader would otherwise miss; most tickers sit beside the control that changed them and need no announcement.",
			},
			{
				guidance: "dont",
				description: "Do not use it for values that change many times a second (a stopwatch, a stock tick, a progress percentage) — the rolls never land and read as a blur. Render the number as plain tabular text.",
			},
			{
				guidance: "dont",
				description: "Do not use it for numbers that are names rather than amounts — an order ID, a phone number, a year, a version. Rolling implies a quantity going up or down.",
			},
			{
				guidance: "dont",
				description: "Do not animate a number on page load to make it feel alive. The first paint is at rest on purpose; for an entrance, reveal the card it sits in (the Reveal motion primitive).",
			},
			{
				guidance: "dont",
				description: "Do not use it for a value inside a known range that needs a picture of how full it is — show a Meter, with the number beside it.",
				instead: ["Meter"],
			},
		],
	},
	related: {
		components: ["Meter", "NotificationBadge", "PieChart", "RadialChart", "Sparkline"],
	},
	props: [
		{
			name: "value",
			type: "number",
			description: "The number to show. When it changes, the digits roll to it.",
		},
		{
			name: "format",
			type: "Intl.NumberFormatOptions",
			description: "How to write the number — `{ style: \"currency\", currency: \"USD\" }`, `{ style: \"percent\" }`, `{ notation: \"compact\" }`, fraction digits. Passed to Intl.NumberFormat; an inline object is fine (it is compared by value).",
		},
		{
			name: "locales",
			type: "string | string[]",
			default: "runtime locale",
			description: "BCP 47 locale(s) for the formatting. Digits roll through the locale's own numbering system.",
		},
		{
			name: "prefix",
			type: "ReactNode",
			description: "Before the number. A string becomes part of the number's text (and rolls in or out with it); an element is rendered as given.",
		},
		{
			name: "suffix",
			type: "ReactNode",
			description: "After the number (\"+\", \" pts\"). A string becomes part of the number's text; an element is rendered as given.",
		},
		{
			name: "trend",
			type: "\"auto\" | \"up\" | \"down\"",
			default: "\"auto\"",
			description: "Which way the digits roll. `auto` rolls up as the value grows and down as it shrinks; `up` / `down` fix it (a countdown, a score that only climbs).",
		},
		{
			name: "motion",
			type: "\"full\" | \"subtle\" | \"off\"",
			default: "\"full\"",
			description: "How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The roll is expressive, so `subtle` updates the value in place.",
		},
		{
			name: "className",
			type: "string",
			description: "Merged onto the root span. Set the type tier here (`text-heading-2`, `text-display-lg`); the ticker adds tabular figures so widths hold still.",
		},
		{
			name: "...span props",
			type: "Omit<ComponentPropsWithRef<\"span\">, \"children\" | \"prefix\">",
			description: "Remaining span attributes pass through to the root — `aria-live` to announce changes, `id`, data attributes.",
		},
	],
	tokensUsed: [],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "The first paint is at rest. A number counting up on page load is decoration that delays the reading; the roll is kept for the moment the value actually changes.",
		},
		{
			slot: "response",
			recipe: "none",
			part: "Root",
			why: "It is a reading, not a control; the control that changes it gives the feedback.",
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "Digit",
			why: "Each digit column turns to its new place on the expressive roll (the slower token, emphasized easing, staggered from the ones column), and arriving or departing columns ease their width. The roll is what shows a change happened and how big it was — the hundreds turning reads as a bigger move than the ones. No recipe can translate per-digit columns, so it is custom; it is multiplied by --motion-expressive, so `subtle` and reduced motion land the value at once.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "A number has no working state; show a Skeleton while it loads.",
		},
	],
	a11y: [
		"The whole written number (with any string prefix or suffix) is real text in a visually hidden span; the rolling columns are aria-hidden and draw their glyphs as generated content, so screen readers, find-in-page and copy all get \"$1,234.50\", never a stack of digits.",
		"It is not a live region by default — a figure that changes because the reader moved a control is already where their attention is. Pass `aria-live=\"polite\"` when a change elsewhere should be announced.",
		"Tabular figures keep every digit the same width, so a roll never shifts the text around it.",
	],
	examples: [
		{
			label: "Basic",
			code: "<NumberTicker value={1284} className=\"text-heading-2\" />",
		},
		{
			label: "Currency",
			code: "<NumberTicker value={4280.5} format={{ style: \"currency\", currency: \"USD\" }} className=\"text-display-lg\" />",
		},
		{
			label: "Percent, announced",
			code: "<NumberTicker value={0.428} format={{ style: \"percent\", maximumFractionDigits: 1 }} aria-live=\"polite\" />",
		},
		{
			label: "Subtle",
			code: "<NumberTicker value={92} suffix=\" pts\" motion=\"subtle\" />",
		},
	],
}
