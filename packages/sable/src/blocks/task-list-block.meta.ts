import type { BlockMeta } from "../lib/meta"

export const taskListBlockMeta: BlockMeta = {
	name: "TaskListBlock",
	family: "Dashboard",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "A checklist card: a titled list of Checkbox rows with a category Badge each, a live count of what is left, and a quiet Add task action.",
	intent:
		"Reach for this for a short, personal to-do list on a dashboard or in onboarding. A team's task board with assignees and status columns needs a Table or DataTable.",
	notes: [
		"Finishing a task strikes it through and mutes it rather than removing it, so the list does not jump under the pointer.",
		"The count in CardAction updates with every check, so progress reads without counting rows.",
		"Add task is a ghost Button in the footer — present, but quieter than the list.",
	],
	a11y: [
		"Every Checkbox has a real <Label htmlFor>, so the whole title is the click target and the accessible name.",
		"Category Badges carry text; the tone only groups them visually.",
	],
}
