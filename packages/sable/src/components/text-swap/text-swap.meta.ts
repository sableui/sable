import type { ComponentMeta } from "../../lib/meta"

export const textSwapMeta: ComponentMeta = {
	name: "TextSwap",
	status: "stable",
	summary: "A short label changing in place, with blur, slide or fade replacement. One accessible current string; static first paint, immediate updates under subtle/off motion.",
	keywords: ["text replacement", "text swap", "changing label", "status text", "blur", "crossfade"],
	usage: {
		description: "Use for short supplied labels that change after an action, such as a schedule's day or an invoice's current state. It presents state; it never invents progress or cycles messages on a timer.",
		bestPractices: [
			{ guidance: "do", description: "Keep the label beside the control or object that changed it, so the replacement explains cause and effect." },
			{ guidance: "do", description: "Put aria-live=polite on the root only when the update would otherwise be missed. Visual copies are hidden from accessibility APIs." },
			{ guidance: "dont", description: "Do not replace form fields or focused controls with it: it accepts text, not interactive children." },
			{ guidance: "dont", description: "Do not use it for numeric quantities or streamed paragraphs. NumberTicker preserves digit places; StreamingText preserves appended prose.", instead: ["NumberTicker", "StreamingText"] },
		],
	},
	props: [
		{ name: "text", type: "string", description: "The complete current label." },
		{ name: "effect", type: '"blur" | "slide" | "fade"', default: '"blur"', description: "The visual replacement; all share the same accessible string." },
		{ name: "motion", type: '"full" | "subtle" | "off"', default: '"full"', description: "Only turns motion down. Subtle and off replace the label immediately." },
	],
	related: { components: ["NumberTicker", "StreamingText", "InlineStatus"] },
	tokensUsed: [],
	motion: [
		{ slot: "arrival", recipe: "none", part: "Root", why: "The initial label is already current and appears at rest." },
		{ slot: "transition", recipe: "motion-swap-in", part: "Current label", why: "The new label resolves into place; rapid replacements retain only the latest pair." },
		{ slot: "transition", recipe: "motion-swap-out", part: "Previous label", why: "The previous visual label leaves without duplicating the accessible announcement." },
	],
	a11y: ["Exactly one current string is exposed; visual copies are aria-hidden.", "Motion policy never delays the new text or its announcement. There is no animation on initial mount."],
	examples: [
		{ label: "Action result", code: 'const [saved, setSaved] = useState(false)\n<div className="flex items-center gap-3"><Button onClick={() => setSaved(!saved)}>Toggle saved</Button><TextSwap text={saved ? "Saved" : "Unsaved changes"} aria-live="polite" /></div>' },
		{ label: "Quiet replacement", code: '<TextSwap text="Monday" effect="fade" motion="subtle" />' },
	],
}
