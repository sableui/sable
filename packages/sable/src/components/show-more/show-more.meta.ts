import type { ComponentMeta } from "../../lib/meta"

export const showMoreMeta: ComponentMeta = {
	name: "ShowMore",
	summary:
		"Collapsible content region that clips children to a collapsed height, fades the cut edge, and reveals the rest with a toggle.",
	status: "stable",
	keywords: [
		"show more",
		"disclosure",
		"truncate",
		"expand",
	],
	usage: {
		description: "Use ShowMore to reveal additional content after an intentionally shortened preview.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it when the preview is useful on its own and the rest is optional.",
			},
			{
				guidance: "do",
				description: "Make the expanded state reversible when collapsing helps users regain context.",
			},
			{
				guidance: "dont",
				description: "Do not place it on a card or tinted surface without checking the fade. The cut-edge gradient fades to the page background color, so on any other surface it reads as a visible band.",
			},
			{
				guidance: "dont",
				description: "Do not hide required steps, important warnings, or primary actions behind ShowMore.",
			},
			{
				guidance: "dont",
				description: "Do not use it to hide content search engines or screen readers need. Collapsed content is still in the DOM here, but if the user must read it to act, it should not be behind a toggle.",
			},
		],
	},
	related: {
		components: [
			"Collapsible",
		],
	},
	props: [
		{
			name: "collapsedHeight",
			type: "number",
			default: "96",
			description:
				"Collapsed height of the content region in px. The inner wrapper clips to this height until expanded. The toggle and fade only appear when the measured content is taller than this; content that already fits shows in full with no control. Expanding animates to the measured height.",
		},
		{
			name: "collapsedLines",
			type: "number",
			description:
				"Collapsed height as a count of the content's own lines (measured from its line height). Wins over collapsedHeight, and is the one to prefer: the preview keeps the same number of lines when the type scale or density changes, where a px height shows fewer as type grows.",
		},
		{
			name: "children",
			type: "ReactNode",
			description: "The content to collapse and reveal.",
		},
	],
	tokensUsed: ["background", "foreground", "ring"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "The preview arrives with the content it clips. Its fade and toggle appear only once a measurement proves the content overflows.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Toggle",
			why: "The toggle is a link Button, so its hover and focus ease on Button's recipe.",
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "Content",
			why: "The region eases its max-height between the collapsed and the measured full height on the slow motion token. motion-disclosure keys on Base UI's starting and ending styles, which this self-contained toggle does not have. The text unrolling in place keeps the reader's line; a snap drops them at a different scroll position.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Fade",
			why: "The bottom fade dissolves as the region opens and returns as it closes, so the cut edge and the reveal read as one movement.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Chevron",
			why: "The chevron turns 180° in step with the region (motion-interactive lists `rotate`), so the toggle visibly points at what it will do next.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "Expanding is local and instant; nothing loads.",
		},
	],
	a11y: [
		"The toggle is a real <button> with aria-expanded reflecting the open state.",
		"The fade overlay is pointer-events-none and decorative; it never traps clicks.",
		"Collapsed content stays in the DOM, so screen readers can still reach it.",
	],
	examples: [
		{
			label: "Long paragraph",
			code: '<ShowMore><p className="text-body-md text-foreground">A long paragraph that exceeds the collapsed height…</p></ShowMore>',
		},
		{
			label: "Collapsed to a line count",
			code: '<ShowMore collapsedLines={6}><p className="text-body-md text-foreground">{post.description}</p></ShowMore>',
		},
	],
}
