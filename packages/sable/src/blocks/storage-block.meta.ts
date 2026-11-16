import type { BlockMeta } from "../lib/meta"

export const storageBlockMeta: BlockMeta = {
	name: "StorageBlock",
	family: "Settings & team",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "Storage used against a plan: a Meter with its reading, what takes the space, and a two-press Clear cache that turns into a Progress bar and ends in a toast.",
	intent:
		"Reach for this on a settings or account page to show a quota and offer one way to win some back — storage, seats, API calls, credits. A breakdown by category with no limit is SegmentedBar; a task with no level behind it is Progress alone.",
	notes: [
		"The level is a Meter and the clear is a Progress. They look alike and mean different things: one is how full, the other is how far along.",
		"The Meter's tone comes from thresholds the block owns: warning from 75% of the plan, destructive from 90%. Clearing the cache drops it back under the first.",
		"While the cache is being cleared its size is a Skeleton, not the old number: the value is not known until the work is done.",
		"The outcome is a toast, so it is seen even if the person has scrolled on. A ToastProvider must be mounted in the app for it to show.",
		"Once cleared, the button stays in place, disabled and saying why, instead of disappearing.",
	],
	a11y: [
		"The Meter is announced as a level with its reading in gigabytes; the Progress as a task with its percentage.",
		"The footer keeps focus while the button and the progress bar swap, so a keyboard user is not sent back to the top of the page.",
		"The toast is announced through the provider's live region.",
	],
}
