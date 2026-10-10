import type { DesignNotes } from "."

export default {
	intro: "A color swatch that opens a themed picker, for color properties in tool panels.",
	do: [
		"Offer transparent inside the picker when \"no color\" is a real choice.",
		"Add a preset row when the product has a house palette.",
		"Use it wherever a color is a property, like a fill, stroke, or background.",
	],
	dont: [
		"Put a separate opacity slider next to one that already has alpha.",
		"Add a transparent switch beside it. Transparent is a value, not a second control.",
	],
} satisfies DesignNotes
