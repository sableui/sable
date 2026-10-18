import type { ComponentMeta } from "../../lib/meta"

export const stepperMeta: ComponentMeta = {
	name: "Stepper",
	summary:
		"Where the user is in a multi-step flow — an ordered list of numbered steps, horizontal or vertical, each complete, current, upcoming or in error, with aria-current=\"step\" on the current one. `indicator=\"dot\"` turns it into a timeline of events (an order's delivery) with dots instead of numbers.",
	status: "stable",
	keywords: [
		"stepper",
		"steps",
		"wizard",
		"multi-step form",
		"checkout steps",
		"onboarding progress",
		"progress steps",
		"timeline",
	],
	usage: {
		description:
			"Use Stepper above or beside a flow that is split into a known, small number of named steps — checkout, onboarding, an import wizard — so the user can see how far they have come and what is left. It reports position; the flow's own Back and Continue buttons move it.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Drive it from one number (`current`) and override a single step's `status` only for what a number cannot say — a completed step that now needs attention is `status=\"error\"`.",
			},
			{
				guidance: "do",
				description:
					"Name steps with a word or two (\"Shipping\", \"Payment\"). Go vertical when steps need a description or there are more than five; horizontal titles truncate first.",
			},
			{
				guidance: "do",
				description:
					"Give completed steps `onSelect` only when going back to edit them actually works, and keep the user's later answers when they do.",
			},
			{
				guidance: "dont",
				description:
					"Do not use Stepper for a task with unknown length or for a percentage. That is Progress; a stepper promises a fixed set of named stops.",
				instead: ["Progress"],
			},
			{
				guidance: "dont",
				description:
					"Do not use it as navigation between independent sections. Sections the user can visit in any order are Tabs; a stepper implies each step depends on the one before.",
				instead: ["Tabs"],
			},
			{
				guidance: "dont",
				description:
					"Do not make upcoming steps pressable to skip ahead. A step that looks reachable but is not is worse than one that is plainly locked.",
			},
		],
		anatomy: [
			{
				name: "Stepper",
				required: true,
				description: "The ordered list. Takes `current` and `orientation`, and an aria-label naming the flow.",
			},
			{
				name: "StepperItem",
				required: true,
				description:
					"One step: a numbered disc (a check when complete, a warning mark on error) — or, with `indicator=\"dot\"`, a dot centred on the title's first line — a title, and an optional description.",
			},
			{
				name: "Connector",
				required: false,
				description:
					"The line to the next step, filled once this step is complete. Drawn automatically between items.",
			},
		],
	},
	related: {
		components: ["Progress", "Tabs", "Form", "Button"],
	},
	props: [
		{
			name: "current",
			type: "number",
			default: "0",
			description:
				"Zero-based index of the current step. Earlier steps derive complete, later ones upcoming.",
		},
		{
			name: "orientation",
			type: '"horizontal" | "vertical"',
			default: '"horizontal"',
			description:
				"Horizontal for a short flow across the top of a form; vertical for long flows, narrow columns or steps with descriptions. A horizontal stepper narrower than 28rem (a phone) compacts itself: every disc stays, only the current step's title shows, and the other titles stay for screen readers. No breakpoint code needed.",
		},
		{
			name: "indicator",
			type: '"number" | "dot"',
			default: '"number"',
			description:
				"`number` for a flow the user moves through; `dot` for a timeline of events (delivery tracking, a document's history) where the position number adds nothing. The dot centres on the title's first line and scales with its type at every density.",
		},
		{
			name: "statusLabels",
			type: "Partial<Record<StepStatus, string>>",
			description:
				"Screen-reader status words appended to each title (Completed, Current step, Not started, Needs attention). Override to localize.",
		},
		{
			name: "aria-label",
			type: "string",
			description: "Names the flow (\"Checkout progress\"). Every Stepper needs one.",
		},
	],
	subcomponents: [
		{
			name: "StepperItem",
			type: "{ title: ReactNode; description?: ReactNode; status?: StepStatus; onSelect?: () => void } + li props",
			description:
				"One step. `status` overrides the derived state; `onSelect` makes the disc and title a button for returning to the step.",
		},
	],
	variants: {
		orientation: ["horizontal", "vertical"],
		indicator: ["number", "dot"],
		status: ["complete", "current", "upcoming", "error"],
	},
	tokensUsed: [
		"primary",
		"primary-foreground",
		"background",
		"foreground",
		"muted-foreground",
		"border-strong",
		"destructive",
		"destructive-foreground",
		"ring",
		"destructive-mark",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Stepper",
			why: "The stepper frames the flow and is on screen before any step is. Animating it in would compete with the step content, which is what changed.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "StepperItem",
			why: "Only steps with onSelect respond, and the eased underline is what tells a returning user that this completed step can be reopened while the upcoming ones cannot.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Indicator",
			why: "When the user continues, the disc they leave fills and its connector darkens. Easing the colour makes that read as one step completing rather than the whole bar re-rendering.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Stepper",
			why: "A step is a place, not a process. Saving or validating between steps belongs on the Continue button's loading state; a pulsing disc would suggest the step itself is busy.",
		},
	],
	a11y: [
		"Renders an ordered list, so assistive tech announces the step count and each step's position.",
		"The current step carries aria-current=\"step\"; every title also gets a visually hidden status word (Completed, Not started, Needs attention), so state never depends on colour or the disc glyph.",
		"Discs and connectors are aria-hidden — the number is already the list position.",
		"Steps with onSelect render as native buttons with a visible focus ring; steps without it are not focusable.",
	],
	examples: [
		{
			label: "Checkout",
			code: `<Stepper current={1} aria-label="Checkout progress">
	<StepperItem title="Cart" />
	<StepperItem title="Shipping" />
	<StepperItem title="Payment" />
	<StepperItem title="Review" />
</Stepper>`,
		},
		{
			label: "Vertical with descriptions",
			code: `<Stepper orientation="vertical" current={2} aria-label="Workspace setup">
	<StepperItem title="Create account" description="Email verified" />
	<StepperItem title="Invite team" description="3 people invited" />
	<StepperItem title="Connect data" description="Choose a source to import from" />
	<StepperItem title="Launch" />
</Stepper>`,
		},
		{
			label: "Delivery timeline (dots)",
			code: `<Stepper orientation="vertical" indicator="dot" current={2} aria-label="Delivery status">
	<StepperItem title="Order placed" description="Oct 9, 10:14 AM" />
	<StepperItem title="Printed and packed" description="Oct 10, 4:02 PM" />
	<StepperItem title="Out for delivery" description="Arriving today by 6 PM" />
	<StepperItem title="Delivered" />
</Stepper>`,
		},
		{
			label: "A completed step with an error",
			code: `<Stepper current={2} aria-label="Checkout progress">
	<StepperItem title="Cart" onSelect={() => console.log("cart")} />
	<StepperItem title="Shipping" status="error" description="Address needs a postcode" onSelect={() => console.log("shipping")} />
	<StepperItem title="Payment" />
</Stepper>`,
		},
	],
}
