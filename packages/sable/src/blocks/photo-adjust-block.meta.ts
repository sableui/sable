import type { BlockMeta } from "../lib/meta"

export const photoAdjustBlockMeta: BlockMeta = {
	name: "PhotoAdjustBlock",
	family: "Media & files",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "A photo with its adjustments under it: PropertyRows that pair a Slider with a ScrubField, a ColorField tint, and Reset and Save at the foot — all applied live to the preview.",
	intent:
		"Reach for this as the inspector of an image, video or canvas tool: a few numeric properties and a colour, changed while watching the result. A whole editor with layers and panels is the Workspace shell with PanelSections; a single percentage a reader sets once is a Slider.",
	notes: [
		"Every row is a PropertyRow, so the labels form one column and the controls another. Do not hand-lay a label and a field per property.",
		"Each adjustment has one drag, the Slider, and a ScrubField beside it for the exact value, typing and arrow keys. A row with no slider would make its name the drag handle instead (`scrub` on PropertyRow).",
		"The actions come after the controls, in the card's footer: Reset to undo every adjustment, Save as the primary. Two actions of one kind, so both are plain Buttons.",
		"Reset is disabled until something has changed, so it never looks like it did nothing.",
		"The tint starts transparent (`allowTransparent`): no tint is a value, not a missing one.",
	],
	a11y: [
		"Each adjustment is a named slider and a labelled number input, so it can be set by dragging, arrow keys or typing.",
		"The photo's alt is its title. The tint overlay is decorative and hidden from assistive technology.",
	],
}
