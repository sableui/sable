import type { ComponentMeta } from "../../lib/meta"

export const destructiveActionModalMeta: ComponentMeta = {
	name: "DestructiveActionModal",
	summary:
		"Confirmation modal for irreversible actions, built on AlertDialog (role=alertdialog; a backdrop click does not dismiss). Pairs a secondary Cancel with a destructive confirm; awaits an async onConfirm (spinner + stays open on failure) or takes an external pending flag; optional body slot and type-to-confirm guard for high-stakes deletions.",
	status: "stable",
	keywords: [
		"destructive",
		"modal",
		"confirmation",
		"danger",
	],
	usage: {
		description: "Use DestructiveActionModal to confirm irreversible or high-risk actions before they run.",
		bestPractices: [
			{
				guidance: "do",
				description: "Name the affected object and the consequence of the action in plain language.",
			},
			{
				guidance: "do",
				description: "Make the destructive action visually distinct from the cancel path.",
			},
			{
				guidance: "dont",
				description: "Do not use it for routine low-risk actions where undo or inline confirmation would be faster.",
			},
			{
				guidance: "dont",
				description: "Do not put the destructive action where Cancel usually sits, or make it the default focus. A confirmation dialog exists to add friction; autofocusing Delete removes the friction it was added for.",
			},
		],
	},
	related: {
		components: [
			"Dialog",
			"Button",
			"Banner",
		],
	},
	props: [
		{
			name: "open",
			type: "boolean",
			description: "Controlled open state.",
		},
		{
			name: "onOpenChange",
			type: "(open: boolean) => void",
			description:
				"Called when the open state should change (Esc, Cancel, or confirm). A backdrop click does not dismiss.",
		},
		{
			name: "title",
			type: "ReactNode",
			description: "Modal heading — names the irreversible action.",
		},
		{
			name: "description",
			type: "ReactNode",
			description: "Optional supporting copy explaining the consequence.",
		},
		{
			name: "confirmLabel",
			type: "string",
			default: '"Delete"',
			description: "Label for the destructive confirm button.",
		},
		{
			name: "cancelLabel",
			type: "string",
			default: '"Cancel"',
			description: "Label for the dismissing secondary button.",
		},
		{
			name: "onConfirm",
			type: "() => void | Promise<void>",
			description:
				"Called when the user confirms. If it returns a Promise the modal shows an in-flight spinner, closes on resolve, and stays open on reject; if void it closes immediately (unless pending is controlled).",
		},
		{
			name: "pending",
			type: "boolean",
			description:
				"Externally-driven in-flight state. Overrides the internal await tracking; the parent owns closing (the modal stays open on a synchronous confirm).",
		},
		{
			name: "confirmingLabel",
			type: "string",
			default: "confirmLabel",
			description: "Confirm-button label shown while the action is in flight.",
		},
		{
			name: "children",
			type: "ReactNode",
			description:
				"Body content rendered between the description and the type-to-confirm Input / footer — e.g. a warning <Note>.",
		},
		{
			name: "confirmText",
			type: "string",
			description:
				"When set, renders an Input the user must type matching to enable the destructive confirm button.",
		},
	],
	tokensUsed: [
		"card",
		"card-foreground",
		"border",
		"muted-foreground",
		"foreground",
		"input",
		"destructive",
		"destructive-foreground",
		"secondary",
		"secondary-foreground",
	],
	a11y: [
		"Built on AlertDialog (Base UI): role=\"alertdialog\", focus trapping, scroll lock, and aria-modal. Esc dismisses; a click on the backdrop does not, so a stray click can't throw away the decision.",
		"Focus opens on Cancel — the safe action — even when a type-to-confirm Input comes first, so a reflexive Enter never fires the destructive action.",
		"The title labels the modal; the description describes it.",
		"The type-to-confirm Input is wired to its label via htmlFor; the destructive Button is disabled (not just hidden) until the text matches.",
		"While a confirm is in flight (awaited onConfirm or pending), both buttons disable, the confirm Button sets aria-busy, and Esc dismissal is blocked so the action can't be interrupted or double-fired.",
	],
	examples: [
		{
			label: "Basic",
			code: "<DestructiveActionModal open={open} onOpenChange={setOpen} title='Delete post?' description='This permanently removes the post. This cannot be undone.' onConfirm={handleDelete} />",
		},
		{
			label: "Async confirm (awaited spinner)",
			code: "<DestructiveActionModal open={open} onOpenChange={setOpen} title='Block user?' description='They can no longer interact with you.' confirmLabel='Block' confirmingLabel='Blocking…' onConfirm={() => blockUser(id)} />",
		},
		{
			label: "Body slot + type-to-confirm",
			code: "<DestructiveActionModal open={open} onOpenChange={setOpen} title='Delete this post?' confirmText='gold rush' confirmLabel='Delete forever' onConfirm={handleDelete}><Note tone='warning'>Collectors who minted this edition keep their copies.</Note></DestructiveActionModal>",
		},
	],
}
