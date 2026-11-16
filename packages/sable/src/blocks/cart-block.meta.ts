import type { BlockMeta } from "../lib/meta"

export const cartBlockMeta: BlockMeta = {
	name: "CartBlock",
	family: "Commerce",
	kind: "card",
	width: { min: "20rem", max: "24rem" },
	summary: "A cart and its order summary: a CardList of lines, each a thumbnail, a NumberField for the quantity and a remove button, over a subtotal, shipping and a total that rolls, and Check out.",
	intent:
		"Reach for this as a cart drawer, the cart page's summary column, or the review step before payment. One product to buy is ProductCardBlock; choosing how it arrives is DeliveryOptionsBlock, the step after this one.",
	notes: [
		"Lines are Entity rows in a CardList, so they inset to the card's padding at any density and the thumbnails line up with the title above.",
		"Quantity is a NumberField with steppers, floored at 1: taking a line out is the remove button, a separate decision with its own name, not a quantity of zero.",
		"The summary is a description list (Subtotal, Shipping, Total), and the total is a NumberTicker, so the cost of a change is seen changing.",
		"Shipping says how far the cart is from free, in one templated sentence, until it is free.",
		"An empty cart is an EmptyState in place of the lines, and the summary and Check out leave with them.",
		"`onCheckout` receives the lines (id and quantity) and the total; price them again on the server.",
	],
	a11y: [
		"Each quantity field and remove button is named for its product (\"Quantity of Stoneware mug\", \"Remove Stoneware mug\").",
		"Removing a line moves focus to the cart's heading, since the row and its button are gone, and a status region mounted from the start says what was removed.",
		"The product thumbnails are decorative beside their titles.",
	],
}
