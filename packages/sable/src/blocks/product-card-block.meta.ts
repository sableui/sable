import type { BlockMeta } from "../lib/meta"

export const productCardBlockMeta: BlockMeta = {
	name: "ProductCardBlock",
	family: "Commerce",
	kind: "card",
	width: { min: "16rem", max: "20rem" },
	summary: "A product card: edge-to-edge artwork, title and maker, an edition Badge, and the price beside a single buy action.",
	intent:
		"Reach for this for a product, edition or listing in a grid or a featured slot. For a row in a dense list, use an Entity with the image as `leading` instead.",
	notes: [
		"The artwork runs to the card's edges; the card clips it to its own corners (overflow-hidden).",
		"Prices are `text-mono-lg` — the metric mono tier with tabular figures — never a heading tier.",
		"The placeholder art is painted from the palette's decorative tones so it follows the theme; swap it for the product image with real alt text.",
	],
	a11y: [
		"The placeholder art is aria-hidden. A real product image needs alt text naming the product.",
		"The card is not a link: it holds its own button. To make the whole card navigate, move the action to the detail page and render the Card as an <a>.",
	],
}
