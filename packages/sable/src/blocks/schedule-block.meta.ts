import type { BlockMeta } from "../lib/meta"
export const scheduleBlockMeta: BlockMeta = {
	name: "ScheduleBlock", family: "Dashboard", kind: "card", width: { min: "18rem", max: "20rem" },
	summary: "A three-day agenda: the day as the card title, its events down a column of start times, each a block in its calendar's colour with the people in it, and a card height that eases between days, driven by Tabs.",
	intent: "A compact day planner where selecting a day changes the amount of content in place. Edit the sample days after copying.",
	notes: ["Tabs owns selection and keyboard navigation; useAutoSize measures the current panel's actual layout height.", "TextSwap reflects the selected day. No automatic rotation or timers.", "An event's colour is a palette family on data-palette: the block, its text and the avatars' ring read the slots, so no step is named and it follows the theme in both modes.", "The days are dated from the page load, today first."],
	a11y: ["The tablist has a name and each panel follows its tab.", "The current day and event details remain present when motion is subtle or off."],
}
