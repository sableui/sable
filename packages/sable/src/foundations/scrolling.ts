import type { Foundation } from "./types"

const scrolling: Foundation = {
	slug: "scrolling",
	title: "Scrolling",
	summary:
		"Every scroll container declares a policy. Vertical regions get a quiet bar that appears only while you are in them; horizontal strips get edge fades instead of a rail.",
	headline: "2 policies · vertical gets a bar · horizontal gets a fade",
	vocabularies: [
		{
			title: "Policies",
			terms: [
				{ name: "scrollbar-quiet", value: "4px thumb · hidden at rest → 12% active → 16% hovered → 20% dragging", use: "The default for vertical scrolling. Grows to 6px under the pointer." },
				{ name: "scrollbar-hidden", value: "no bar", use: "Only when something else carries the affordance — and you can name it (an edge fade, paging controls)." },
				{ name: "<Scroller>", value: "edge fades + wheel mapping", use: "Horizontal strips: media rows, chip rows, tab overflow." },
				{ name: "useScrollActivity", value: "data-scrolling for ~600ms", use: "Lets the bar respond to touch drags and programmatic scrolls, which hover cannot see." },
			],
		},
	],
	rules: [
		{
			rule: "Every overflow-*-auto|scroll declares scrollbar-quiet or scrollbar-hidden.",
			why: "Left bare, the platform draws its own: on Windows, stepper arrows hard against the padding edge that poke out of rounded corners.",
			enforcedBy: "sable-lint: unmanaged-overflow (also checked over every registry example)",
		},
		{
			rule: "Vertical regions get a bar; horizontal regions get an edge fade.",
			why: "A vertical list needs position feedback. A horizontal strip needs 'there is more this way', which a fade says better than a 4px rail.",
		},
		{
			rule: "A horizontal region must work without a horizontal input.",
			why: "Most mice have no horizontal wheel. Scroller maps the vertical wheel sideways and handles arrow keys, Home and End.",
		},
		{
			rule: "Reveal on scrolling, not only on hover.",
			why: "Touch drags and programmatic scrolls (a chat following a reply) hover nothing, and those are the moments a reader needs to see where they are.",
		},
	],
	noGos: [
		{
			never: "scrollbar-hidden on a vertical list with no fade or paging.",
			instead: "scrollbar-quiet.",
			why: "It leaves the reader with no sense of position and nothing to discover.",
		},
		{
			never: "A styled ::-webkit-scrollbar written per component.",
			instead: "The scrollbar-quiet utility.",
			why: "Chromium ignores ::-webkit-scrollbar once scrollbar-width is set; the utility handles both engines.",
		},
	],
	details: [
		{
			title: "A scrolling panel",
			before: '<div className="overflow-y-auto">',
			after: '<div className="overflow-y-auto scrollbar-quiet" ref={useScrollActivity()}>',
			why: "No bar at rest; it appears while scrolling, hovered or focused, and fades a beat after. Content cut off at the edge is what says the region scrolls.",
		},
	],
	related: ["surfaces", "accessibility", "sable component Scroller"],
}

export default scrolling
