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
		"bottom sheet",
		"snap points",
		"detents",
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
				guidance: "do",
				description: "Give a bottom sheet snap points when it shows a summary first and detail on demand (a map result, a now-playing panel): `snapPoints={[0.4, 1]}`. The first stop is where it opens; put what matters at that height, because the rest is a drag away.",
			},
			{
				guidance: "dont",
				description: "Do not use Sheet for simple confirmations or deeply nested workflows.",
				instead: ["Dialog"],
			},
			{
				guidance: "dont",
				description: "Do not use it on desktop where a Dialog fits. A sheet's affordance is edge-anchored travel for thumb reach; on a wide viewport it becomes a dialog that arrives from the wrong place.",
				instead: ["Dialog"],
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
				name: "SheetList",
				required: false,
				description: "Edge-to-edge rows (Entity) aligned with the header — a queue, notifications, a picker.",
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
			type: "Base UI Drawer.Root props (open, defaultOpen, onOpenChange, onOpenChangeComplete, modal, disablePointerDismissal, actionsRef, handle, snapPoints, snapPoint, defaultSnapPoint, onSnapPointChange, snapToSequentialPoints) — minus swipeDirection",
			description: "Controls open state. Uncontrolled by default. The dismiss swipe direction is not a prop: it follows SheetContent's side. onOpenChange reports reason \"swipe\" when a swipe closed it. Records the element focused when the sheet opens, trigger or not, and returns focus there on close.",
		},
		{
			name: "snapPoints",
			type: "(number | string)[]",
			default: "—",
			description: "Stops a bottom sheet rests at, smallest first: a fraction of the viewport (0.4), pixels (320), or a px/rem string (\"20rem\"). The panel is the full stop's height and opens at the first stop; a swipe moves between stops and a swipe below the first closes it. side=\"bottom\" only: other sides ignore them, with a development warning.",
		},
		{
			name: "snapPoint",
			type: "number | string | null",
			default: "—",
			description: "The active stop, controlled. Pair with onSnapPointChange; use defaultSnapPoint to open at a different stop uncontrolled.",
		},
		{
			name: "onSnapPointChange",
			type: "(snapPoint: number | string | null, eventDetails) => void",
			default: "—",
			description: "Fires when a swipe (or your code) moves the sheet to another stop.",
		},
		{
			name: "snapToSequentialPoints",
			type: "boolean",
			default: "false",
			description: "Move one stop per swipe, by distance. Off, a fast flick can skip past a stop.",
		},
	],
	subcomponents: [
		{
			name: "SheetContent",
			type: 'Base UI Drawer.Popup props (initialFocus, finalFocus, …) + side: "right" | "left" | "top" | "bottom" + className',
			description:
				'Backdrop + edge-anchored popup; portals to <body>. side picks which viewport edge the sheet anchors to and slides in from (defaults to "right"). Left/right are full-height side panels; top/bottom span the width up to 80vh. A bottom sheet with snapPoints is as tall as its highest stop allows (the viewport less a top gap), shows a drag handle, and translates down to the active stop; the part below the screen becomes bottom padding, so its scroll area and SheetFooter end at the visible edge. A bottom sheet rides above the on-screen keyboard (measured from visualViewport). On touch it swipes closed toward that same edge (right swipes right, left swipes left, top swipes up, bottom swipes down).',
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
			name: "SheetList",
			type: 'ComponentProps<"div">',
			description:
				"Rows that run edge to edge in the sheet, Entity most often. It bleeds through the sheet's padding (--sheet-p) and hands it back to each row as --entity-px, so row content lines up with SheetHeader and a row's hover fill reaches the panel's edges. Without it a list of Entity rows sits 12px in from the header. The Sheet equivalent of CardList.",
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
		"Focus matches Dialog: the first tabbable on mouse/keyboard open, the panel itself on touch (so the virtual keyboard stays down). On close, focus returns to the element that held it when the sheet opened: the SheetTrigger, or your own button when it drives a controlled open. It is captured before the content mounts, so an autoFocus field inside cannot displace it; an explicit finalFocus on SheetContent wins.",
		"Render a SheetClose inside SheetContent so screen-reader users can escape the popup.",
		"Slide animation runs via data-[starting-style]/data-[ending-style] attributes on the motion-duration token; while swiping the panel tracks the finger directly, and a released swipe finishes on the same token (scaled by flick speed), so reduced motion makes it instant.",
		"A mouse drag that starts on sheet content selects text rather than dragging the panel; mouse dragging only starts from the padding edge.",
		"Snap points add stops, not a gate: at any stop the content scrolls within the visible part and every control stays reachable by keyboard, so nothing needs the drag. The handle is decorative (aria-hidden).",
		"A bottom sheet stays above the on-screen keyboard: its bottom edge is lifted by the height the keyboard takes from the visual viewport, so a focused field is not covered. An app that sets interactive-widget=resizes-content in its viewport meta gets the same result from the browser, and the inset reads 0.",
	],
	examples: [
		{
			label: "List of rows (a queue)",
			code: '<Sheet><SheetTrigger render={<Button variant="secondary">Queue</Button>} /><SheetContent><SheetHeader><SheetTitle>Up next</SheetTitle></SheetHeader><SheetList>{queue.map((track) => <Entity key={track.id} leading={<GradientArt aria-hidden seed={track.title} className="size-10 rounded-sm" />} title={track.title} subtitle={track.artist} />)}</SheetList></SheetContent></Sheet>',
		},
		{
			label: "Basic (right)",
			code: '<Sheet><SheetTrigger render={<Button>Open</Button>} /><SheetContent><SheetHeader><SheetTitle>Filters</SheetTitle><SheetDescription>Narrow the feed.</SheetDescription></SheetHeader><SheetFooter><SheetClose render={<Button variant="secondary">Cancel</Button>} /><SheetClose render={<Button>Apply</Button>} /></SheetFooter></SheetContent></Sheet>',
		},
		{
			label: "Left side",
			code: '<Sheet><SheetTrigger render={<Button variant="secondary">Menu</Button>} /><SheetContent side="left"><SheetHeader><SheetTitle>Navigation</SheetTitle></SheetHeader><SheetFooter><SheetClose render={<Button variant="secondary">Close</Button>} /></SheetFooter></SheetContent></Sheet>',
		},
		{
			label: "Bottom sheet with snap points",
			code: '<Sheet snapPoints={[0.4, 1]}><SheetTrigger render={<Button variant="secondary">Nearby</Button>} /><SheetContent side="bottom"><SheetHeader><SheetTitle>12 places nearby</SheetTitle><SheetDescription>Drag up for the full list.</SheetDescription></SheetHeader><SheetList>{places.map((place) => <Entity key={place.id} title={place.name} subtitle={place.distance} />)}</SheetList></SheetContent></Sheet>',
		},
		{
			label: "Bottom side",
			code: '<Sheet><SheetTrigger render={<Button variant="secondary">Details</Button>} /><SheetContent side="bottom"><SheetHeader><SheetTitle>Order details</SheetTitle></SheetHeader><SheetFooter><SheetClose render={<Button variant="secondary">Close</Button>} /></SheetFooter></SheetContent></Sheet>',
		},
	],
}
