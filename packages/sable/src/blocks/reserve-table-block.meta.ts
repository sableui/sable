import type { BlockMeta } from "../lib/meta"

export const reserveTableBlockMeta: BlockMeta = {
	name: "ReserveTableBlock",
	family: "Commerce",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "A booking card: a bare Calendar for the day, a NumberField for the party size, a Reserve button that names the day picked, then a confirmation that replaces the picker with a DateTile, the party size and a ConfirmButton to cancel.",
	intent:
		"Reach for this to book one slot on one day — a table, a class, a viewing, a pickup. Picking a range of nights is a Calendar in range mode; a date inside a longer form is DatePicker.",
	notes: [
		"The Calendar is `bare`: the card is already the surface, and a framed calendar inside it would read as a card in a card.",
		"The button says what it will do with the choice (\"Reserve for Fri, Nov 13\"), so the day is confirmed before the press, not after.",
		"Days before the first bookable one are disabled rather than hidden, so the month keeps its shape.",
		"Once booked, the picker leaves and the card becomes the confirmation: \"Table booked\" as its title, the day as a DateTile, and the party size. A disabled calendar with a small status line under it buries the one thing the person wants to know.",
		"The card eases to the confirmation's shorter height (`useAutoSize`) rather than snapping.",
		"Cancel is a ConfirmButton, not a dialog: a second press is enough for something this easy to redo. It returns to the picker with the day and party size kept, so it also serves as change.",
	],
	a11y: [
		"Focus moves to the confirmation's header when the picker leaves, and back to Reserve after a cancel. The header is a role=status region, so \"Table booked\" is announced.",
		"The party size is a labelled NumberField clamped to the venue's range by typing, arrows and steppers alike.",
		"ConfirmButton announces that it is armed and what a second press does.",
	],
}
