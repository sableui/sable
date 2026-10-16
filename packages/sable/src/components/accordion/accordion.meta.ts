import type { ComponentMeta } from "../../lib/meta"

export const accordionMeta: ComponentMeta = {
	name: "Accordion",
	summary:
		"Stacked, collapsible disclosure sections over Base UI Accordion — roving focus, arrow-key navigation, ARIA region/heading/button wiring, and an animated height transition. Each item pairs a full-width trigger (with a rotating chevron) and a panel.",
	status: "stable",
	keywords: [
		"accordion",
		"disclosure",
		"collapse",
		"faq",
	],
	usage: {
		description: "Use Accordion to reveal a vertical set of related sections while keeping the surrounding page scannable.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use concise trigger text that describes the content revealed below it.",
			},
			{
				guidance: "do",
				description: "Keep section content focused so expanding one item does not feel like navigating to a new page.",
			},
			{
				guidance: "dont",
				description: "Do not hide required fields, primary actions, or critical errors inside collapsed sections.",
			},
			{
				guidance: "dont",
				description: "Do not nest an Accordion inside an Accordion. Two layers of roving focus fight each other, and the arrow keys become ambiguous — flatten the hierarchy or use a Tree.",
				instead: ["Tree"],
			},
		],
		anatomy: [
			{
				name: "AccordionItem",
				required: true,
				description: "One expandable section in the group.",
			},
			{
				name: "AccordionTrigger",
				required: true,
				description: "The button-like control that opens the section.",
			},
			{
				name: "AccordionPanel",
				required: true,
				description: "The content revealed by the trigger.",
			},
		],
	},
	related: {
		components: [
			"Collapsible",
			"Tabs",
		],
	},
	props: [
		{
			name: "Accordion (Root)",
			type: "Base UI Accordion.Root props (value, defaultValue, multiple, disabled, onValueChange, orientation, loopFocus, keepMounted, hiddenUntilFound)",
			default: "—",
			description:
				"Groups all items and owns the open value(s). Uncontrolled via defaultValue, controlled via value.",
		},
		{
			name: "defaultValue",
			type: "Value[]",
			default: "[]",
			description:
				"Uncontrolled set of item values that start expanded (e.g. ['faq-1']).",
		},
		{
			name: "value",
			type: "Value[]",
			default: "—",
			description:
				"Controlled set of expanded item values; pair with onValueChange.",
		},
		{
			name: "onValueChange",
			type: "(value: Value[]) => void",
			description: "Called with the new set of expanded item values when an item opens or closes.",
		},
		{
			name: "multiple",
			type: "boolean",
			default: "false",
			description:
				"Whether more than one item can be open at the same time. When false, opening one closes the others.",
		},
	],
	subcomponents: [
		{
			name: "AccordionItem",
			type: "Base UI Accordion.Item props + className (value, disabled, onOpenChange)",
			description:
				"Pairs a header with its panel. Give each a stable `value` to control or set initial open state.",
		},
		{
			name: "AccordionTrigger",
			type: "Base UI Accordion.Trigger props + className + indicator?: ReactNode",
			description:
				"The header button (Header + Trigger composed). Renders children plus a chevron that rotates via data-[panel-open] by default; pass `indicator` to replace the icon and its open-state behavior entirely (e.g. a plus that becomes an × for a FAQ-style toggle).",
		},
		{
			name: "AccordionPanel",
			type: "Base UI Accordion.Panel props + className (keepMounted, hiddenUntilFound)",
			description:
				"The collapsible body. Animates height using the --accordion-panel-height CSS var; fades on data-[starting-style]/data-[ending-style].",
		},
	],
	tokensUsed: ["border", "foreground", "muted-foreground", "ring"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "An accordion is page furniture that is present from first paint. Animating it in would stage content the reader is already scanning past.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "AccordionTrigger",
			why: "The whole header row is the hit target, and it looks like a heading rather than a control. The hover shift is what tells the reader it can be clicked before they click it.",
		},
		{
			slot: "transition",
			recipe: "motion-disclosure",
			part: "AccordionPanel",
			why: "Panel height is the only cue that content came from THIS header rather than appearing at the bottom of the page. Snapping it open moves everything below by a screenful with nothing connecting cause to effect.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "Nothing here is indeterminate — the panel content is already resident. A panel that loads on expand should put its own loader inside the panel.",
		},
	],
	a11y: [
		"Base UI renders the trigger inside an <h3> heading and wires aria-expanded / aria-controls to the panel region.",
		"Arrow keys move roving focus between triggers; Home/End jump to the first/last; loopFocus wraps by default.",
		"Each trigger toggles its panel with Enter/Space; the panel is announced as a labelled region.",
		"A disabled AccordionItem dims and is skipped by keyboard focus while neighbouring items stay interactive.",
		"The chevron rotation is driven by data-[panel-open] and the focus ring by focus-visible — both honor reduced-motion via the consumer's transitions.",
	],
	examples: [
		{
			label: "Single (default)",
			code: '<Accordion defaultValue={["a"]}><AccordionItem value="a"><AccordionTrigger>Can I cancel anytime?</AccordionTrigger><AccordionPanel>Yes — from billing settings.</AccordionPanel></AccordionItem><AccordionItem value="b"><AccordionTrigger>How much?</AccordionTrigger><AccordionPanel>$16 per seat each month.</AccordionPanel></AccordionItem></Accordion>',
		},
		{
			label: "Multiple open",
			code: '<Accordion multiple defaultValue={["a", "b"]}><AccordionItem value="a"><AccordionTrigger>First</AccordionTrigger><AccordionPanel>One.</AccordionPanel></AccordionItem><AccordionItem value="b"><AccordionTrigger>Second</AccordionTrigger><AccordionPanel>Two.</AccordionPanel></AccordionItem></Accordion>',
		},
		{
			label: "Custom indicator (plus-becomes-×)",
			code: '<Accordion defaultValue={["a"]}><AccordionItem value="a"><AccordionTrigger indicator={<Icon name="plus" className="text-xs text-muted-foreground transition-transform [[data-panel-open]_&]:rotate-45" />}>Can I cancel anytime?</AccordionTrigger><AccordionPanel>Yes — from billing settings.</AccordionPanel></AccordionItem></Accordion>',
		},
	],
}
