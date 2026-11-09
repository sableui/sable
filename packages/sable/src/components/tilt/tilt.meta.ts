import type { ComponentMeta } from "../../lib/meta"

export const tiltMeta: ComponentMeta = {
	name: "Tilt", status: "stable",
	summary: "Optional bounded mouse depth on a surface. Coalesces samples into one requestAnimationFrame and writes transform locally. Static on touch, subtle motion and reduced motion.",
	keywords: ["tilt", "pointer depth", "3d card", "perspective", "mouse movement"],
	usage: {
		description: "Use for one illustrative card or image whose content already works without the effect. The wrapper owns transform; put an independently transformed element inside it rather than overriding the wrapper's transform while tracking.",
		bestPractices: [
			{ guidance: "do", description: "Keep maxAngle small, and inspect the full surface bounds next to neighboring content." },
			{ guidance: "do", description: "Keep the actual action in a Button or link inside the surface. Tilt itself is decorative and never becomes a tab stop." },
			{ guidance: "dont", description: "Do not enable pointer tracking for touch scrolling or when motion is subtle/off. No device-orientation access is required." },
			{ guidance: "dont", description: "Do not apply it to dense reading surfaces or animate pointer samples through React state." },
		],
	},
	props: [
		{ name: "maxAngle", type: "number", default: "6", description: "Maximum rotation per axis in degrees, bounded to 0–15. 0 turns the lean off; a surface that was leaning eases back to flat." },
		{ name: "motion", type: '"full" | "subtle" | "off"', description: "Only turns motion down. Pointer depth is expressive." },
	],
	related: { components: ["Card", "MediaImage", "Button"] },
	tokensUsed: [],
	motion: [
		{ slot: "arrival", recipe: "none", part: "Root", why: "The surface starts flat and still." },
		{ slot: "response", recipe: "custom", part: "Root", why: "The lean ramps up over --motion-duration-base as the pointer arrives (it enters at an edge, where the lean is largest), then follows the pointer once per frame with no easing behind it. Leaving eases back to flat. The surface takes a compositor layer only while it leans, promoted and released while flat, so text and images neither pop mid-gesture nor sit soft at rest." },
	],
	a11y: ["No information or essential action depends on the tilt; touch and keyboard retain the same content.", "Respects full/subtle/off motion at the provider, scope and component levels. Adds no interactive role or tab stop."],
	examples: [
		{ label: "Illustrative surface", code: '<Tilt><Card><CardContent>Studio membership</CardContent></Card></Tilt>' },
		{ label: "Static equivalent", code: '<Tilt motion="off" maxAngle={3}><Card><CardContent>All content remains available</CardContent></Card></Tilt>' },
	],
}
