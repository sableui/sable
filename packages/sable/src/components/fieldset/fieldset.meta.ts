import type { ComponentMeta } from "../../lib/meta"

export const fieldsetMeta: ComponentMeta = {
	name: "Fieldset",
	summary:
		"Form section panel (Card-like bordered surface) over Base UI Fieldset, with Legend/Description/Content/Footer parts.",
	status: "stable",
	keywords: [
		"fieldset",
		"form group",
		"legend",
		"fields",
	],
	usage: {
		description: "Use Fieldset to group related controls under a shared label or explanation.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for grouped form sections such as contact details, preferences, or permissions.",
			},
			{
				guidance: "do",
				description: "Keep the legend meaningful so assistive tech and agents understand the group purpose.",
			},
			{
				guidance: "dont",
				description: "Do not use Fieldset as a generic spacing wrapper outside forms.",
			},
			{
				guidance: "dont",
				description: "Do not use a Legend that is really a heading. A legend names the group's question for assistive technology; using it as a section title puts a question mark where the outline should be.",
			},
		],
		anatomy: [
			{
				name: "Fieldset",
				required: true,
				description: "The bordered group: a native <fieldset> whose disabled state reaches every control inside it.",
			},
			{
				name: "Legend",
				required: true,
				description: "FieldsetLegend: the question the group's controls answer, announced before each of them.",
			},
			{
				name: "Description",
				required: false,
				description: "FieldsetDescription: muted copy under the legend.",
			},
			{
				name: "Content",
				required: true,
				description: "FieldsetContent: the stacked body, one Field per control.",
			},
			{
				name: "Footer",
				required: false,
				description: "FieldsetFooter: the group's actions on a muted wash.",
			},
		],
	},
	related: {
		components: [
			"Form",
			"Label",
			"Description",
		],
	},
	props: [
		{
			name: "disabled",
			type: "boolean",
			description:
				"Disables the whole group. Renders <fieldset disabled> (native control disabling) and surfaces data-[disabled] for dimming.",
		},
		{
			name: "render",
			type: "ReactElement | function",
			description:
				"Base UI render prop to replace or compose the underlying element.",
		},
		{
			name: "className",
			type: "string",
			description: "Merged onto each part via cn() for one-off overrides.",
		},
	],
	subcomponents: [
		{
			name: "FieldsetLegend",
			type: 'ComponentPropsWithRef<typeof Fieldset.Legend>',
			description:
				"The group's name — the question its controls answer. Base UI renders it as a <div> wired to the <fieldset> through aria-labelledby, so a screen reader announces it before each control in the group. This is the whole reason to reach for Fieldset.",
		},
		{
			name: "FieldsetDescription",
			type: 'ComponentPropsWithRef<"p">',
			description: "Muted supporting copy under the legend.",
		},
		{
			name: "FieldsetContent",
			type: 'ComponentPropsWithRef<"div">',
			description: "The stacked body holding one Field per control.",
		},
		{
			name: "FieldsetFooter",
			type: 'ComponentPropsWithRef<"div">',
			description: "Optional right-aligned action bar on a muted wash.",
		},
	],
	tokensUsed: [
		"card",
		"card-foreground",
		"border",
		"foreground",
		"muted-foreground",
		"muted",
	],
	a11y: [
		"Base.Root renders a native <fieldset>; Base.Legend renders an auto-associated label, so screen readers announce the group name.",
		"disabled propagates as native <fieldset disabled>, disabling all contained controls.",
		"Wrap each control inside FieldsetContent in a Field, which wires its own label, description and error to the control.",
	],
	examples: [
		{
			label: "A grouped question",
			code: `<Fieldset>
	<FieldsetLegend>Notify me about</FieldsetLegend>
	<FieldsetDescription>Pick what reaches your inbox.</FieldsetDescription>
	<FieldsetContent>
		<Field label="Mentions" orientation="horizontal"><Checkbox defaultChecked /></Field>
		<Field label="Replies" orientation="horizontal"><Checkbox /></Field>
		<Field label="Direct messages" orientation="horizontal"><Checkbox /></Field>
	</FieldsetContent>
	<FieldsetFooter>
		<Button>Save preferences</Button>
	</FieldsetFooter>
</Fieldset>`,
		},
		{
			label: "Why a fieldset, and when it is wrong",
			code: `// Fieldset groups inputs that are ONE question with multiple parts, and gives
// the group a single accessible name — which is the part you cannot do with a
// div and a heading.

<Fieldset>
  <FieldsetLegend>Digest frequency</FieldsetLegend>
  <FieldsetContent>
    <RadioGroup defaultValue="weekly">
      <Field label="Daily" orientation="horizontal"><Radio value="daily" /></Field>
      <Field label="Weekly" orientation="horizontal"><Radio value="weekly" /></Field>
    </RadioGroup>
  </FieldsetContent>
</Fieldset>

// ✓ Required for radio groups: without a fieldset the options have no shared
//   name, so a screen reader announces "Weekly, radio" with no question.
// ✗ Not for visual grouping of unrelated fields. Use PanelSection on a panel or
//   a Card section on a page; a legend that is really a heading lies to
//   assistive technology about the form's structure.`,
		},
	],
}
