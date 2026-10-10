import type { ComponentMeta } from "../../lib/meta"

export const feedbackMeta: ComponentMeta = {
	name: "Feedback",
	summary:
		"A compact feedback popover. Composes Popover + Textarea + Button + Toggle into a rating row plus a message field; submitting reports the rating + message and closes the popover.",
	status: "stable",
	keywords: [
		"feedback",
		"sentiment",
		"rating",
		"prompt",
	],
	usage: {
		description: "Use Feedback to collect lightweight sentiment, usefulness, or quality signals from users.",
		bestPractices: [
			{
				guidance: "do",
				description: "Ask for feedback at a moment when the user has enough context to answer.",
			},
			{
				guidance: "do",
				description: "Keep the prompt short and optional unless feedback is required by the workflow.",
			},
			{
				guidance: "dont",
				description: "Do not use Feedback for errors, alerts, or required support forms.",
			},
			{
				guidance: "dont",
				description: "Do not require the message field. Most feedback is a rating with no comment, and forcing prose is how a feedback control stops being used.",
			},
		],
	},
	related: {
		components: [
			"Toast",
			"Banner",
			"Form",
		],
	},
	props: [
		{
			name: "label",
			type: "string",
			default: '"Feedback"',
			description: "Trigger button text.",
		},
		{
			name: "heading",
			type: "string",
			default: '"Send feedback"',
			description: "Heading shown above the rating row.",
		},
		{
			name: "placeholder",
			type: "string",
			default: '"What can we improve?"',
			description: "Placeholder for the message field.",
		},
		{
			name: "submitLabel",
			type: "string",
			default: '"Send"',
			description: "Submit button text.",
		},
		{
			name: "ratings",
			type: "FeedbackRating[]",
			default: "🙁 / 😐 / 🙂",
			description:
				"The rating options shown as a row of toggles. Each is { value, label }.",
		},
		{
			name: "onSubmit",
			type: "(data: { rating?: string; message: string }) => void",
			description:
				"Called with the selected rating + message when the form is submitted.",
		},
	],
	tokensUsed: [
		"popover",
		"popover-foreground",
		"border",
		"input",
		"card",
		"foreground",
		"muted-foreground",
		"accent",
		"accent-foreground",
		"ring",
	],
	a11y: [
		"Trigger opens the popover on press; Base UI manages focus into the form and restores it to the trigger on close.",
		"The rating row is a Base UI ToggleGroup with arrow-key roving focus; each toggle carries an aria-label.",
		"The form is named by its heading (aria-labelledby), so it is announced as \"Send feedback\" rather than an unnamed form.",
		"The message field carries an aria-label matching its placeholder.",
		"Submit is disabled until there is a rating or a non-whitespace message. Either alone is a complete answer.",
	],
	examples: [
		{
			label: "Basic",
			code: "<Feedback onSubmit={({ rating, message }) => console.log(rating, message)} />",
		},
		{
			label: "Custom labels",
			code: '<Feedback label="Tell us" submitLabel="Send it" placeholder="Describe the issue…" />',
		},
	],
}
