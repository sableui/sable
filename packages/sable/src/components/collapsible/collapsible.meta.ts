import type { ComponentMeta } from "../../lib/meta"

export const collapsibleMeta: ComponentMeta = {
	name: "Collapsible",
	summary:
		"Show/hide a panel of content over Base UI Collapsible — open/close state, ARIA expanded wiring, and the animated height transition. The minimal primitive behind Accordion: a trigger that toggles an overflow-clipped panel.",
	status: "stable",
	keywords: [
		"collapsible",
		"disclosure",
		"expand",
		"collapse",
	],
	usage: {
		description: "Use Collapsible for a single piece of optional content that can expand in place.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for local detail, advanced settings, or secondary context.",
			},
			{
				guidance: "do",
				description: "Make the trigger label describe the hidden content, not the mechanism.",
			},
			{
				guidance: "dont",
				description: "Do not use Collapsible for multi-section navigation; use Accordion or Tabs instead.",
				instead: ["Accordion", "Tabs"],
			},
			{
				guidance: "dont",
				description: "Do not animate it by transitioning height from auto. Use the motion-disclosure recipe, which transitions to the measured panel height — `auto` does not animate and the panel will snap.",
			},
		],
		anatomy: [
			{
				name: "CollapsibleTrigger",
				required: true,
				description: "The control that toggles the panel.",
			},
			{
				name: "CollapsiblePanel",
				required: true,
				description: "The content that expands or collapses.",
			},
			{
				name: "CollapsibleIndicator",
				required: false,
				description: "A visual affordance for open or closed state.",
			},
		],
	},
	related: {
		components: [
			"Accordion",
			"ShowMore",
		],
	},
	props: [
		{
			name: "Collapsible (Root)",
			type: "Base UI Collapsible.Root props (open, defaultOpen, onOpenChange, disabled)",
			default: "—",
			description:
				"Groups the trigger and panel and owns open state. Uncontrolled by default; pass `open` + `onOpenChange` to control it.",
		},
		{
			name: "defaultOpen",
			type: "boolean",
			default: "false",
			description: "Whether the panel starts open in the uncontrolled case.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Disables the trigger and prevents toggling.",
		},
	],
	subcomponents: [
		{
			name: "CollapsibleTrigger",
			type: "Base UI Collapsible.Trigger props + render",
			description:
				"The button that toggles the panel. Compose with render={<Button variant=\"ghost\" … />}.",
		},
		{
			name: "CollapsiblePanel",
			type: "Base UI Collapsible.Panel props + className (keepMounted, hiddenUntilFound)",
			description:
				"The collapsible contents. Overflow-hidden; animates height via the --collapsible-panel-height var Base UI sets.",
		},
		{
			name: "CollapsibleIndicator",
			type: "{ className? }",
			description:
				"Auto-rotating disclosure chevron. Place it inside the trigger content and add the `group/collapsible` class to the trigger so it flips 180° on open.",
		},
	],
	tokensUsed: ["foreground", "muted-foreground"],
	a11y: [
		"Base UI wires aria-expanded on the trigger and aria-controls/id between trigger and panel.",
		"Trigger is a real <button>; toggles on click and Enter/Space.",
		"Animate open/close via data-[starting-style]/data-[ending-style]; data-[panel-open] marks the open state.",
		"Set hiddenUntilFound on the panel to let in-page browser search expand it.",
	],
	examples: [
		{
			label: "Basic",
			code: '<Collapsible><CollapsibleTrigger render={<Button variant="ghost">Details</Button>} /><CollapsiblePanel><p className="pt-3">Hidden content revealed on toggle.</p></CollapsiblePanel></Collapsible>',
		},
		{
			label: "Open by default",
			code: '<Collapsible defaultOpen><CollapsibleTrigger render={<Button variant="ghost">Summary</Button>} /><CollapsiblePanel><p className="pt-3">Visible on first render.</p></CollapsiblePanel></Collapsible>',
		},
		{
			label: "With rotating chevron",
			code: '<Collapsible><CollapsibleTrigger className="group/collapsible" render={<Button variant="ghost">Details <CollapsibleIndicator /></Button>} /><CollapsiblePanel><p className="pt-3">Revealed on toggle.</p></CollapsiblePanel></Collapsible>',
		},
	],
}
