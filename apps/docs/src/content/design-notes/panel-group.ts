import type { DesignNotes } from "."

export default {
	intro: "Docked side panels around a flexible canvas, for tool workspaces. People can resize the panels.",
	do: [
		"Give side panels a set width and let the canvas take the rest.",
		"Name every panel, like Layers or Properties.",
		"Let people resize panels that hold trees or property lists.",
	],
	dont: [
		"Use it for page content columns. Use a grid.",
		"Let the whole group scroll. Only panels and the canvas scroll.",
	],
} satisfies DesignNotes
