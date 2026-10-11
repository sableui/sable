import type { BlockMeta } from "../lib/meta"

export const deviceComparisonBlockMeta: BlockMeta = {
	name: "DeviceComparisonBlock",
	family: "Dashboard",
	kind: "card",
	width: { min: "20rem", max: "48rem" },
	summary: "A comparison card: each series' total sits in the header as a pressable tile, and the one pressed is plotted below as a daily BarChart.",
	intent:
		"Reach for this when two or three measures share a page and the reader looks at one at a time — devices, regions, plans. To see them together, plot both in one BarChart or LineChart instead.",
	notes: [
		"The totals are the switch: Toggles in a labelled ToggleGroup, so the number and the control are one thing, with the group's own pressed and hover states.",
		"Switching eases every bar to its new height rather than redrawing.",
		"Below sm the tiles stack under the title and divide with a top rule instead of a side rule.",
	],
	a11y: [
		"Each total is a Toggle (aria-pressed) named by its label and value, in a ToggleGroup labelled \"Device\" with arrow-key movement between tiles.",
		"The chart's name says which series is plotted, so the data table is unambiguous.",
	],
}
