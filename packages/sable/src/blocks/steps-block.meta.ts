import type { BlockMeta } from "../lib/meta"

export const stepsBlockMeta: BlockMeta = {
	name: "StepsBlock",
	family: "Marketing",
	kind: "section",
	summary: "A how-it-works section: the heading, lede and a guide link on the left; three numbered steps on the right, each under a strong rule.",
	intent:
		"Reach for this when the pitch is a sequence — onboarding, a workflow, a setup. Parallel benefits with no order are FeatureGridBlock; progress through a live process is a Stepper.",
	notes: [
		"Copied from the BrandLandingPage page shell's how-it-works section.",
		"The steps are an <ol>, so the order is semantic and the 01 / 02 / 03 numbers are its visual echo, set in the mono tier.",
		"Three steps fit the 1 : 2 split on desktop; on a phone everything stacks with the intro first.",
	],
	a11y: [
		"Each step has an h3 under the section's h2.",
		"The guide link is an <a> styled as an outline Button, because it navigates.",
	],
}
