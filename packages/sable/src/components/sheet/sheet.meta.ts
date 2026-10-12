import type { ComponentMeta } from "../../lib/meta"

export const sheetMeta: ComponentMeta = {
	name: "Sheet",
	summary:
		"Edge-anchored drawer over Base UI Drawer — focus trap, scroll lock, Esc/outside dismissal, portal backdrop, plus swipe-to-dismiss on touch. Slides in from a viewport edge via side and swipes back out toward the same edge.",
	status: "stable",
	keywords: [
		"sheet",
		"drawer",
		"side panel",
		"overlay",
		"swipe to dismiss",
	],
	usage: {
		description: "Use Sheet for secondary workflows that slide in while preserving context from the underlying page.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for inspect, edit, filter, or create flows that relate to the current page.",
			},
			{
				guidance: "do",
				description: "Include clear title, close path, and footer actions for task-oriented sheets.",
			},
			{
				guidance: "dont",
				description: "Do not use Sheet for simple confirmations or deeply nested workflows.",
			},
			{
				guidance: "dont",
				description: "Do not use it on desktop where a Dialog fits. A sheet's affordance is edge-anchored travel for thumb reach; on a wide viewport it becomes a dialog that arrives from the wrong place.",
			},
		],
		anatomy: [
			{
				name: "SheetTrigger",
				required: false,
				description: "The element that opens the sheet.",
			},
			{
				name: "SheetContent",
				required: true,
				description: "The sliding panel content.",
			},
			{
				name: "SheetClose",
				required: false,
				description: "An explicit close control.",
			},
			{
				name: "SheetHeader",
				required: false,
				description: "The title and description region.",
			},
			{
				name: "SheetTitle",
				required: false,
				description: "The sheet heading.",
			},
			{
				name: "SheetDescription",
				required: false,
				description: "Supporting context for the sheet.",
			},
			{
				name: "SheetFooter",
				required: false,
				description: "Footer actions for the workflow.",
			},
		],
	},
	related: {
		components: [
			"Dialog",
			"Popover",
			"Sidebar",
		],
	},
	props: [
		{
			name: "Sheet (Root)",
			type: "Base UI Drawer.Root props (open, defaultOpen, onOpenChange, onOpenChangeComplete, modal, disablePointerDismissal, actionsRef, handle) — minus swipeDirection and snap points",
			description: "Controls open state. Uncontrolled by default. The dismiss swipe direction is not a prop: it follows SheetContent's side. onOpenChange reports reason \"swipe\" when a swipe closed it.",
		},
	],
	subcomponents: [
		{
			name: "SheetContent",
			type: 'Base UI Drawer.Popup props (initialFocus, finalFocus, …) + side: "right" | "left" | "top" | "bottom" + className',
			description:
				'Backdrop + edge-anchored popup; portals to <body>. side picks which viewport edge the sheet anchors to and slides in from (defaults to "right"). Left/right are full-height side panels; top/bottom span the width up to 80vh. On touch it swipes closed toward that same edge (right swipes right, left swipes left, top swipes up, bottom swipes down).',
		},
		{
			name: "SheetTrigger",
			type: "Base UI Drawer.Trigger props (render)",
			description: "Element that opens the sheet. Compose via render prop.",
		},
		{
			name: "SheetClose",
			type: "Base UI Drawer.Close props (render)",
			description: "Element that dismisses the sheet. Compose via render prop.",
		},
		{
			name: "SheetHeader",
			type: 'ComponentProps<"div">',
			description: "Top section holding SheetTitle/SheetDescription.",
		},
		{
			name: "SheetTitle",
			type: "Base UI Drawer.Title props + className",
			description:
				"The sheet's accessible name — wires aria-labelledby on the popup.",
		},
		{
			name: "SheetDescription",
			type: "Base UI Drawer.Description props + className",
			description: "Muted supporting line; wires aria-describedby.",
		},
		{
			name: "SheetFooter",
			type: 'ComponentProps<"div">',
			description: "Bottom row for actions, pinned after the scrollable body. In a bottom sheet it stacks: full width, the primary on top, every button at the cta height.",
		},
	],
	variants: {
		side: ["right", "left", "top", "bottom"],
	},
	tokensUsed: ["popover", "popover-foreground", "border", "muted-foreground"],
	a11y: [
		"Base UI provides focus trapping, scroll lock, aria-modal, and labelled-by wiring (SheetTitle).",
		"The panel scrolls its own content (thin scrollbar, contained overscroll) when it outgrows its bound — the full height on left/right, 80vh on top/bottom.",
		"Esc and click-outside dismiss by default; on touch, a swipe toward the sheet's own edge dismisses too. A short or slow drag springs back.",
		"Swipe is an extra path, never the only one: Esc, click-outside and SheetClose all still work.",
		"Focus matches Dialog: the first tabbable on mouse/keyboard open, the panel itself on touch (so the virtual keyboard stays down); focus returns to the trigger on close.",
		"Render a SheetClose inside SheetContent so screen-reader users can escape the popup.",
		"Slide animation runs via data-[starting-style]/data-[ending-style] attributes on the motion-duration token; while swiping the panel tracks the finger directly, and a released swipe finishes on the same token (scaled by flick speed), so reduced motion makes it instant.",
		"A mouse drag that starts on sheet content selects text rather than dragging the panel; mouse dragging only starts from the padding edge.",
	],
	examples: [
		{
			label: "Basic (right)",
			code: '<Sheet><SheetTrigger render={<Button>Open</Button>} /><SheetContent><SheetHeader><SheetTitle>Filters</SheetTitle><SheetDescription>Narrow the feed.</SheetDescription></SheetHeader><SheetFooter><SheetClose render={<Button variant="secondary">Cancel</Button>} /><SheetClose render={<Button>Apply</Button>} /></SheetFooter></SheetContent></Sheet>',
		},
		{
			label: "Left side",
			code: '<Sheet><SheetTrigger render={<Button variant="secondary">Menu</Button>} /><SheetContent side="left"><SheetHeader><SheetTitle>Navigation</SheetTitle></SheetHeader><SheetFooter><SheetClose render={<Button variant="secondary">Close</Button>} /></SheetFooter></SheetContent></Sheet>',
		},
		{
			label: "Bottom side",
			code: '<Sheet><SheetTrigger render={<Button variant="secondary">Details</Button>} /><SheetContent side="bottom"><SheetHeader><SheetTitle>Edition details</SheetTitle></SheetHeader><SheetFooter><SheetClose render={<Button variant="secondary">Close</Button>} /></SheetFooter></SheetContent></Sheet>',
		},
	],
}
