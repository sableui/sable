import type { BlockMeta } from "../lib/meta"

export const commandPaletteBlockMeta: BlockMeta = {
	name: "CommandPaletteBlock",
	family: "Navigation",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "An inline command palette: CommandMenuPanel with a filter field and grouped actions, each with an icon and its keyboard shortcut.",
	intent:
		"Reach for this to show a command list in place — an empty state that teaches shortcuts, an onboarding step, a quick-actions card. The ⌘K palette that opens over the app is CommandMenu; this is its panel without the dialog.",
	notes: [
		"Each command shows its shortcut as a Kbd hint, so the palette also teaches the keys.",
		"`onCommand` receives the command's id; ids also key the rows, so two commands may share a label.",
		"No card around it: the panel is its own surface, lifted with `shadow-sm` when it sits on a muted section.",
	],
	a11y: [
		"CommandMenuPanel wires the filter input to the list as a combobox, with arrow-key navigation and the active row announced.",
		"Shortcut hints are Kbd elements, read as keys.",
	],
}
