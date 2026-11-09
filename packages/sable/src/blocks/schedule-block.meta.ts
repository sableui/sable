import type { BlockMeta } from "../lib/meta"
export const scheduleBlockMeta: BlockMeta = {
	name: "ScheduleBlock", family: "Dashboard", kind: "card", width: { min: "18rem", max: "20rem" },
	summary: "A three-day schedule: the day as the card title, its events below, and a card height that eases between days, driven by Tabs.",
	intent: "A compact day planner where selecting a day changes the amount of content in place. Edit the sample days after copying.",
	notes: ["Tabs owns selection and keyboard navigation; useAutoSize measures the current panel's actual layout height.", "TextSwap reflects the selected day. No automatic rotation or timers.", "The day is the CardTitle, so it sits where every card's title does; the events are Entity rows on the content edge."],
	a11y: ["The tablist has a name and each panel follows its tab.", "The current day and event details remain present when motion is subtle or off."],
}
