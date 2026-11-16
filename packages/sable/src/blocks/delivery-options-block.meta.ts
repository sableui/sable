import type { BlockMeta } from "../lib/meta"

export const deliveryOptionsBlockMeta: BlockMeta = {
	name: "DeliveryOptionsBlock",
	family: "Commerce",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "A checkout step for choosing delivery: a RadioGroup of RadioCards, each with its arrival and price, over a total that rolls to the new amount and a Continue button.",
	intent:
		"Reach for this when one of a few options must be picked and each needs a line of explanation and a price — delivery, a plan, a seat class, a payment schedule. More than five or six options is a Select; options with no description are a plain RadioGroup.",
	notes: [
		"Each option is a RadioCard: the whole card is the target, with the price in `trailing` on the title's line so the prices scan as a column.",
		"A free option says \"Free\" rather than $0.00.",
		"The first option is selected on arrival, so Continue always has an answer and the total is never blank. List the options cheapest first, so that default is the cheapest.",
		"The total is a NumberTicker: choosing Express rolls it up by the fee instead of swapping the number.",
	],
	a11y: [
		"The cards are one radio group with a name: arrow keys move the choice, and Tab leaves the group in one step.",
		"Each card's description and price are part of its accessible name's context, read with the option.",
	],
}
