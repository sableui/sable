import type { DesignNotes } from "."

export default {
	intro: "Groups properties inside a narrow tool panel or inspector. Sections are split by a hairline, never boxed in cards.",
	do: [
		"Title each section by what it controls: Blending, Layout, Fill.",
		"Pair related properties side by side to keep the panel short.",
		"Put a section's own toggle or add button in its header.",
	],
	dont: [
		"Put cards inside a panel. They waste the width on borders and padding.",
		"Repeat the panel's title as the section title.",
		"Use these rows for page forms. Use a regular form field.",
	],
} satisfies DesignNotes
