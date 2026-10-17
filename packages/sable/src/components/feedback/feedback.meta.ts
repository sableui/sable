import type { ComponentMeta } from "../../lib/meta"

export const feedbackMeta: ComponentMeta = {
	name: "Feedback",
	summary:
		"A compact feedback popover. Composes Popover + Textarea + Button + Toggle into a rating row plus a message field; submitting reports the rating + message, shows a brief drawn-check thanks, and closes the popover.",
	status: "stable",
	composition: "Popover, Textarea, ToggleGroup, Button",
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
				"Called with the selected rating + message when the form is submitted. The thanks shows right away; send the report in the background.",
		},
		{
			name: "successMessage",
			type: "string",
			default: '"Thanks for the feedback."',
			description:
				"The line shown, and read out, for about 1.2s after sending, before the popover closes on its own.",
		},
		{
			name: "motion",
			type: '"full" | "subtle" | "off"',
			default: '"full"',
			description:
				"How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The drawn check is the flourish; the thanks line and its dwell stay.",
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
		"success",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "motion-pop",
			part: "Popover",
			why: "The form opens from its trigger, so the eye goes from the button it pressed to the field it should type in. Popover owns the recipe.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Rating toggles",
			why: "The rating row is a choice among a few similar marks. The eased selected fill is what makes the pick read as made, not just hovered.",
		},
		{
			slot: "transition",
			recipe: "motion-tick",
			part: "Thanks",
			why: "Sending is the one moment the person needs to know their words arrived. The form fades out in place and a check draws itself in over it, then the popover closes. Without it the popover just vanished, which looks the same as the form being dismissed or the message lost.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "The thanks shows as soon as the form is sent; delivery is the app's background work. A spinner for a one-line report would make a quick, optional gesture feel heavy.",
		},
	],
	a11y: [
		"Trigger opens the popover on press; Base UI manages focus into the form and restores it to the trigger on close.",
		"The rating row is a Base UI ToggleGroup with arrow-key roving focus; each toggle carries an aria-label.",
		"The form is named by its heading (aria-labelledby), so it is announced as \"Send feedback\" rather than an unnamed form.",
		"The message field carries an aria-label matching its placeholder.",
		"Submit is disabled until there is a rating or a non-whitespace message. Either alone is a complete answer.",
		"On send, focus moves to the thanks line (tabIndex=-1), which reads it out, and the form becomes inert so focus cannot land in invisible fields. The line is not also a live region, which read it twice. When the popover closes, Base UI returns focus to the trigger.",
		"The thanks dwell (about 1.2s) is a reading time, not motion, so it is the same under reduced motion.",
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
		{
			label: "Custom thanks",
			code: '<Feedback successMessage="Got it — thank you." onSubmit={({ rating, message }) => report(rating, message)} />',
		},
	],
}
