import type { ComponentMeta } from "../../lib/meta"

export const scrollerMeta: ComponentMeta = {
	name: "Scroller",
	summary:
		"Scroll container that fades its leading/trailing edges when content overflows. Tracks scroll position to toggle the fades.",
	status: "stable",
	keywords: [
		"scroller",
		"overflow",
		"horizontal scroll",
		"carousel",
	],
	usage: {
		description: "Use Scroller to create a contained overflow region for content that naturally extends beyond the viewport.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for chip rows, media strips, or comparison sets where horizontal browsing is expected.",
			},
			{
				guidance: "do",
				description: "Keep scroll affordances visible enough that overflow is discoverable.",
			},
			{
				guidance: "do",
				description: "Put everything on `className` — sizing (`max-h-80`, `h-64`, `flex-1 min-h-0`) and chrome (`rounded-lg border`, `bg-card`) alike. It styles the Scroller's outer box, and the scrolling element inside it is `flex-1 min-h-0`, so a cap on the Scroller is still a cap on what scrolls.",
			},
			{
				guidance: "do",
				description:
					"Pass `label` on any Scroller with real content. It is a focusable region, and an unnamed one announces as a bare group — \"Tags\" or \"Recent covers\" costs a word and is the difference between navigable and not.",
			},
			{
				guidance: "dont",
				description: "Do not use Scroller to hide primary page layout or required controls.",
			},
			{
				guidance: "dont",
				description:
					"Do not add your own wheel handler to make a horizontal strip mouse-scrollable — it already is. A second handler double-scrolls and usually loses the end-release, which traps the page.",
			},
			{
				guidance: "dont",
				description: "Do not reach past it with a child selector (`[&>div]:snap-x`). The scrolling element is addressable by name: `viewportClassName`.",
			},
			{
				guidance: "dont",
				description: "Do not use it to hide overflow you should have laid out. It exists to make an intentionally scrolling strip legible, not to contain content that overflowed by accident.",
			},
		],
	},
	related: {
		components: [
			"Carousel",
			"Marquee",
		],
	},
	props: [
		{
			name: "orientation",
			type: '"vertical" | "horizontal"',
			default: '"vertical"',
			description:
				'"vertical" scrolls and fades top/bottom; "horizontal" scrolls and fades left/right.',
		},
		{
			name: "wheelScroll",
			type: "boolean",
			default: "true",
			description:
				"On a horizontal Scroller, let a vertical mouse wheel scroll it sideways. Ignored when vertical. Turn it off only if the region is inside something that owns the wheel itself (a map, a canvas).",
		},
		{
			name: "smoothWheel",
			type: "boolean",
			default: "true",
			description:
				"Ease mouse-wheel steps toward their target, on either axis: the inertia a smooth-scroll library such as Lenis adds, scoped to this region. Only a mouse wheel is eased; trackpads and touch keep their own momentum, keys and scrollbar drags stay native, and reduced motion (the OS preference or MotionProvider) turns it off. Anything else that moves the region (scrollIntoView, a stick-to-bottom chat) stops the easing at once. For a scroll container of your own, `useSmoothWheel()` returns the same behaviour as a ref callback.",
		},
		{
			name: "label",
			type: "string",
			description:
				"Accessible name for the scroll region. The region takes focus, so it should say what it contains; without one a screen reader announces an unnamed group.",
		},
		{
			name: "viewportClassName",
			type: "string",
			description:
				"Classes for the inner element that actually scrolls. Narrow on purpose — `className` is what you want almost always. This is for the few utilities that only mean something on the scrolling box: `snap-x`, `scroll-smooth`, `scroll-p-*`.",
		},
		{
			name: "...div props",
			type: "ComponentPropsWithRef<'div'>",
			description:
				"Everything except `className`/`style` spreads onto the SCROLLING element — `role`, `id`, `aria-*`, `data-*` and event handlers all describe the thing that scrolls, and CommandMenu relies on it to make this component its listbox. `ref` and `onScroll` likewise address the scroller, and compose with the component's own.",
		},
	],
	variants: {
		orientation: ["vertical", "horizontal"],
		wheelScroll: ["true", "false"],
	},
	tokensUsed: ["ring"],
	a11y: [
		"The edge fades are a CSS mask-image on the scrolling element, not overlay elements — there is nothing in the DOM to intercept a pointer or be read by assistive tech, and the content under a fade stays fully interactive.",
		"Two boxes: a chrome box carrying `className` (border, background, radius, sizing) and, inside it, the element that actually scrolls and carries the fade mask. They are split because a `mask-image` applies to its element's own border — so with both on one box, a bordered Scroller watched its frame dissolve at the scrolling edge. The axis is published as `data-orientation`, not `aria-orientation`, which is invalid on `role=\"group\"`.",
		"The scroll region uses native overflow and contains overscroll, so a gesture that runs out of content does not scroll the page behind it.",
		"It is focusable (`tabIndex=0`, `role=\"group\"`) and handles arrows, Home/End and PageUp/PageDown along its own axis. Chrome 128+ and Firefox make scrollable regions focusable on their own; Safari does not, so a strip with a hidden scrollbar and no focusable children is unreachable there. Declaring it makes the behaviour a property of the component, not of the reader's browser. Pass `label` to name it — an unnamed focusable region announces as a bare group.",
		"On a horizontal Scroller, a vertical mouse wheel scrolls it sideways, because most mice have no horizontal wheel and the content past the fold is otherwise unreachable on them. The strip releases the wheel at both ends so it never traps the page, and leaves trackpad `deltaX` gestures and `shift+wheel` to the browser.",
		"Cross-axis arrow keys are deliberately not captured, and a consumer can take the arrows entirely by calling `preventDefault()` in their own `onKeyDown` — a strip of interactive chips usually wants them for roving focus.",
	],
	examples: [
		{
			label: "Vertical with overflow",
			code: '<Scroller label="Projects" className="h-64"><ul className="space-y-2 p-4">{items.map((item) => (<li key={item.id} className="text-body-sm">{item.title}</li>))}</ul></Scroller>',
		},
		{
			label: "Capped, scrolls past the cap",
			code: '<Scroller label="Versions" className="max-h-80 rounded-md border border-border"><ul className="divide-y divide-border">{versions.map((v) => (<li key={v.id} className="px-3 py-2 text-body-sm">{v.label}</li>))}</ul></Scroller>',
		},
		{
			label: "Horizontal",
			code: '<Scroller orientation="horizontal" label="Recent covers" className="w-full"><div className="flex gap-3 p-4">{covers.map((src) => (<img key={src} src={src} alt="" className="h-32 w-32 rounded-lg object-cover" />))}</div></Scroller>',
		},
		{
			label: "Snap points on the scrolling box",
			code: '<Scroller orientation="horizontal" label="Covers" className="w-full rounded-lg border border-border" viewportClassName="snap-x snap-mandatory scroll-smooth"><div className="flex gap-3 p-4">{covers.map((src) => (<img key={src} src={src} alt="" className="h-32 w-32 snap-start rounded-lg object-cover" />))}</div></Scroller>',
		},
	],
}
