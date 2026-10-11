import type { BlockMeta } from "../lib/meta"

export const goalProgressBlockMeta: BlockMeta = {
	name: "GoalProgressBlock",
	family: "Dashboard",
	kind: "card",
	width: { min: "18rem", max: "24rem" },
	summary: "A goals card: a ring per goal in a RadialChart against its track (a full ring is 100%), a legend, and which goals are behind in the footer.",
	intent:
		"Reach for this for progress toward two to four targets — a quarter's goals, a plan's limits, onboarding steps. A single reading in a settings row is a Meter; many goals are a list of Progress bars.",
	notes: [
		"max={100} makes a full ring mean done; each ring draws round from 12 o'clock as the card scrolls into view.",
		"The footer names what is behind, so the card is actionable without reading the rings.",
		"Values are formatted as percents in the tooltip and data table.",
	],
	a11y: [
		"The rings' data table lists each goal and its percent.",
		"Arrowing through the rings announces each goal; the legend names every ring's colour.",
	],
}
