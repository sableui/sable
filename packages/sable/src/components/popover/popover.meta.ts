import type { ComponentMeta } from "../../lib/meta"

export const popoverMeta: ComponentMeta = {
	name: "Popover",
	summary:
		"Click-triggered overlay over Base UI Popover (focus management, collision-aware positioning, Esc/outside dismissal). Holds interactive content; 18rem-wide surface.",
	status: "stable",
	keywords: [
		"popover",
		"floating panel",
		"anchored",
		"disclosure",
	],
	usage: {
		description: "Use Popover for anchored secondary content that needs more room than a tooltip but less commitment than a dialog.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for small pickers, summaries, or contextual controls tied to a trigger.",
			},
			{
				guidance: "do",
				description: "Keep focus behavior and dismissal predictable.",
			},
			{
				guidance: "dont",
				description: "Do not use Popover for blocking confirmations, long forms, or critical information.",
			},
			{
				guidance: "dont",
				description: "Do not put a form that can fail validation inside one. A popover dismisses on outside click, which discards what the user typed with no warning — that is a Dialog.",
			},
		],
		anatomy: [
			{
				name: "PopoverTrigger",
				required: true,
				description: "The element that anchors and opens the popover.",
			},
			{
				name: "PopoverContent",
				required: true,
				description: "The floating content surface.",
			},
			{
				name: "PopoverTitle",
				required: false,
				description: "An optional heading for the content.",
			},
			{
				name: "PopoverDescription",
				required: false,
				description: "Optional supporting copy.",
			},
			{
				name: "PopoverClose",
				required: false,
				description: "An explicit close control when helpful.",
			},
			{
				name: "PopoverArrow",
				required: false,
				description: "An optional arrow pointing to the trigger.",
			},
		],
	},
	related: {
		components: [
			"Tooltip",
			"ContextCard",
			"Dialog",
		],
	},
	props: [
		{
			name: "Popover (Root)",
			type: "Base UI Popover.Root props (open, defaultOpen, onOpenChange, modal)",
			description: "Groups the trigger and content. Uncontrolled by default.",
		},
	],
	subcomponents: [
		{
			name: "PopoverTrigger",
			type: "Base UI Trigger props + render",
			description:
				"The anchor element. Use render={<Button/>} to compose with another component.",
		},
		{
			name: "PopoverContent",
			type: 'Base UI Popup props + side: "top" | "bottom" | "left" | "right" | "inline-*" + align: "start" | "center" | "end" + sideOffset: number + anchor: Element | Ref | (() => Element) | VirtualElement + className',
			description:
				'Portals + positions + paints the popup. side picks which side of the trigger to render against (auto-flips on collision; defaults to "bottom"); align sets alignment along that side (defaults to "center"); sideOffset is the gap in px (defaults to 8). anchor positions against a different element/ref/getter than the trigger — Base UI 1.5 has no separate Anchor part, so pass it here to decouple the open-location from the trigger.',
		},
		{
			name: "PopoverTitle",
			type: "Base UI Title props + className",
			description: "Accessible heading; Base UI wires aria-labelledby to the popup.",
		},
		{
			name: "PopoverDescription",
			type: "Base UI Description props + className",
			description:
				"Supplementary copy; Base UI wires aria-describedby to the popup.",
		},
		{
			name: "PopoverClose",
			type: "Base UI Close props + render",
			description:
				"A button that closes the popover. Use render={<Button/>} to compose.",
		},
		{
			name: "PopoverArrow",
			type: "Base UI Arrow props + className",
			description:
				"Optional pointer connecting the popup to its trigger. Place inside PopoverContent.",
		},
	],
	tokensUsed: [
		"popover",
		"popover-foreground",
		"border-floating",
		"muted-foreground",
	],
	a11y: [
		"Base UI manages focus into and out of the popup, traps focus when modal, and restores focus to the trigger on close.",
		"Opens on trigger press (click/Enter/Space); dismisses on Esc and outside press.",
		"PopoverTitle/PopoverDescription wire aria-labelledby/aria-describedby on the popup.",
		"Enters and exits on the motion-pop recipe (Base UI starting/ending-style attributes), so it follows the motion policy.",
	],
	examples: [
		{
			label: "Basic",
			code: '<Popover><PopoverTrigger render={<Button variant="secondary">Details</Button>} /><PopoverContent><PopoverTitle>Edition details</PopoverTitle><PopoverDescription>A limited run of 100, stored permanently on Arweave.</PopoverDescription></PopoverContent></Popover>',
		},
		{
			label: "With close",
			code: '<Popover><PopoverTrigger render={<Button variant="secondary">Open</Button>} /><PopoverContent><PopoverTitle>Heads up</PopoverTitle><PopoverDescription>Collecting mints a compressed NFT to your wallet.</PopoverDescription><PopoverClose render={<Button size="sm">Got it</Button>} /></PopoverContent></Popover>',
		},
	],
}
