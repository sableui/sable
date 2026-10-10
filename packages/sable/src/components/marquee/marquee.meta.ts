import type { ComponentMeta } from "../../lib/meta"

export const marqueeMeta: ComponentMeta = {
	name: "Marquee",
	summary:
		"Seamless, constant-speed infinite loop (logos, tags, testimonials). Zero-dependency: duplicates children to fill the track and advances exactly one group + gap per iteration so it never seams. Pauses on hover/focus; freezes to a scroll region when motion is off/reduced.",
	status: "stable",
	keywords: [
		"marquee",
		"ticker",
		"scrolling",
		"ambient",
	],
	usage: {
		description: "Use Marquee for decorative or ambient continuous content where motion supports the surface.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for low-priority repeated content such as logos, tags, or lightweight highlights.",
			},
			{
				guidance: "do",
				description: "Respect reduced motion and keep the content understandable without relying on animation.",
			},
			{
				guidance: "dont",
				description: "Do not put critical messages, controls, or required reading inside Marquee.",
			},
			{
				guidance: "dont",
				description: "Do not put content that must be read in a Marquee. It moves continuously, so anything longer than a logo or a short label cannot be read reliably — and it must stop for prefers-reduced-motion.",
			},
		],
	},
	related: {
		components: [
			"Scroller",
			"Carousel",
			"Badge",
		],
	},
	props: [
		{
			name: "direction",
			type: '"left" | "right" | "up" | "down"',
			default: '"left"',
			description: "Scroll direction; up/down switch to a vertical loop, which needs a bounded height (e.g. className=\"h-56\").",
		},
		{
			name: "speed",
			type: "number",
			default: "40",
			description: "Constant speed in px/s — independent of content length.",
		},
		{
			name: "gap",
			type: "string",
			default: '"calc(var(--spacing) * 8)"',
			description: "Gap between items (any CSS length). Use a spacing-scale value (calc(var(--spacing) * n)) so it moves with density.",
		},
		{
			name: "pauseOnHover",
			type: "boolean",
			default: "true",
			description: "Pause while hovered or keyboard-focused (WCAG 2.2.2).",
		},
		{
			name: "controls",
			type: "boolean",
			default: "false",
			description:
				"Render a visible pause/play control — recommended for WCAG 2.2.2 when content auto-scrolls.",
		},
		{
			name: "fade",
			type: "boolean",
			default: "false",
			description: "Fade the leading/trailing edges with a mask.",
		},
		{
			name: "label",
			type: "string",
			description: "Accessible label for the scrolling region.",
		},
	],
	tokensUsed: [],
	a11y: [
		"Duplicate groups are aria-hidden, so screen readers read the content once.",
		"Pauses on hover and focus-within; under prefers-reduced-motion / MotionProvider off it stops and becomes a normal scroll region.",
		"Decorative by default — pass a label only when the row conveys meaning.",
	],
	examples: [
		{
			label: "Logo row",
			code: "<Marquee>{logos.map((l) => <img key={l.id} src={l.src} alt={l.name} className=\"h-8\" />)}</Marquee>",
		},
		{
			label: "Reverse, faster",
			code: '<Marquee direction="right" speed={70}>{tags.map((t) => <Badge key={t} appearance="outline">{t}</Badge>)}</Marquee>',
		},
		{
			label: "Vertical",
			code: '<Marquee direction="up" className="h-64">{items}</Marquee>',
		},
	],
}
