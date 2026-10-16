import type { ComponentMeta } from "../../lib/meta"

export const tooltipMeta: ComponentMeta = {
	name: "Tooltip",
	summary:
		"Hover/focus label over Base UI Tooltip (collision-aware positioning, ARIA wiring, delay grouping via TooltipProvider). Compact popover surface.",
	status: "stable",
	keywords: [
		"tooltip",
		"hint",
		"hover",
		"assistive",
	],
	usage: {
		description: "Use Tooltip for brief nonessential hints tied to a specific control or piece of text.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it to name icon-only controls or clarify compact UI when the label cannot be visible.",
			},
			{
				guidance: "do",
				description: "Keep tooltip content short and noninteractive.",
			},
			{
				guidance: "dont",
				description: "Do not put critical instructions, errors, or interactive content inside Tooltip.",
				instead: ["Popover", "InlineStatus"],
			},
			{
				guidance: "dont",
				description: "Do not let a tooltip serve as an icon button's accessible name. A tooltip is not a name — without its own aria-label the button announces as \"button\", and the tooltip never opens for a screen reader at all.",
			},
		],
		anatomy: [
			{
				name: "TooltipProvider",
				required: false,
				description: "Optional provider for shared tooltip timing.",
			},
			{
				name: "TooltipTrigger",
				required: true,
				description: "The element that owns the hint.",
			},
			{
				name: "TooltipContent",
				required: true,
				description: "The short hint content.",
			},
			{
				name: "TooltipArrow",
				required: false,
				description: "An optional pointer toward the trigger.",
			},
			{
				name: "SimpleTooltip",
				required: false,
				description: "A convenience wrapper for common tooltip usage.",
			},
		],
	},
	related: {
		components: [
			"Popover",
			"ContextCard",
		],
	},
	props: [
		{
			name: "side",
			type: '"top" | "right" | "bottom" | "left"',
			default: '"top"',
			description:
				"On TooltipContent: which side of the trigger to render against. Flips automatically when there is no room.",
		},
		{
			name: "Tooltip (Root)",
			type: "Base UI Tooltip.Root props (open, defaultOpen, onOpenChange, disabled)",
			description: "Groups the trigger and content. Uncontrolled by default.",
		},
	],
	subcomponents: [
		{
			name: "TooltipProvider",
			type: "Base UI Tooltip.Provider props (delay, closeDelay, timeout)",
			description:
				"Wraps an app or group of Tooltips to share open/close delays. Once one tooltip is open, adjacent tooltips open instantly.",
		},
		{
			name: "TooltipTrigger",
			type: "Base UI Trigger props + render",
			description:
				"The anchor element. Use render={<Button/>} to compose with another component.",
		},
		{
			name: "TooltipContent",
			type: "Base UI Popup props + side | align | sideOffset + className",
			description:
				'Portals + positions + paints the popup. side ("top" | "bottom" | "left" | "right" | "inline-*") picks which side of the trigger to render against, defaults to "top", and auto-flips on collision; align ("start" | "center" | "end") defaults to "center"; sideOffset (gap between trigger and popup, in pixels) defaults to 6.',
		},
		{
			name: "TooltipArrow",
			type: "Base UI Arrow props + className",
			description:
				"Optional pointer connecting the popup to its trigger — a popover-coloured square turned 45° that carries the border on its outward edges. Place inside TooltipContent.",
		},
		{
			name: "SimpleTooltip",
			type: "Base UI Tooltip.Root props + content: ReactNode + children: ReactElement + side | align | sideOffset",
			description:
				"Shorthand wrapping Root + Trigger + Content for the common case. The single child becomes the trigger (via Base UI render); content sets the body; side / align / sideOffset forward to the content with the same defaults. Composition parts remain for advanced use.",
		},
	],
	tokensUsed: ["popover", "popover-foreground", "border-floating"],
	motion: [
		{
			slot: "arrival",
			recipe: "motion-pop",
			part: "Content",
			why: "The transform-origin follows the anchor, so the tooltip appears to grow out of the element it describes. That is what binds it to its trigger — a bubble that materialises at full size near two possible triggers belongs to neither.",
		},
		{
			slot: "response",
			recipe: "none",
			part: "Content",
			why: "The tooltip is not a hover target; pointing at it is how you dismiss it. Styling it for the pointer would suggest otherwise.",
		},
		{
			slot: "transition",
			recipe: "motion-pop",
			part: "Content",
			why: "Same recipe, exit direction — it collapses back toward the anchor. Content that fades from a fixed size on close reads as a second, unrelated element disappearing.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Content",
			why: "Tooltip copy is resident before the tooltip opens. Anything that has to be fetched is a Popover with its own loading state.",
		},
	],
	a11y: [
		"Base UI wires aria-describedby from trigger to popup and manages hover + focus open.",
		"Opens on keyboard focus, not just hover; dismisses on Esc and blur.",
		"Animate via data-[starting-style]/data-[ending-style] opacity attributes.",
		"Tooltip text is supplementary — never put essential-only actions inside a tooltip.",
	],
	examples: [
		{
			label: "Basic",
			code: '<TooltipProvider><Tooltip><TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Info"><Icon name="info" /></Button>} /><TooltipContent>Saved to your workspace.</TooltipContent></Tooltip></TooltipProvider>',
		},
		{
			label: "Sides",
			code: '<Tooltip><TooltipTrigger render={<Button variant="secondary">Right</Button>} /><TooltipContent side="right">Opens to the right</TooltipContent></Tooltip>',
		},
		{
			label: "Shorthand (SimpleTooltip)",
			code: '<SimpleTooltip content="Saved to your workspace."><Button variant="ghost" size="icon-sm" aria-label="Info"><Icon name="info" /></Button></SimpleTooltip>',
		},
	],
}
