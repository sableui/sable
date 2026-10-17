import type { ComponentMeta } from "../../lib/meta"

export const inputGroupMeta: ComponentMeta = {
	name: "InputGroup",
	summary:
		"An Input with addons inside the same field: a prefix or suffix (\"https://\", \".com\", \"$\"), an icon, or a borderless Button such as copy or reveal. One shell, one focus ring, one error state; a Field's label and error wiring reaches the Input inside.",
	keywords: [
		"input group",
		"input addon",
		"prefix",
		"suffix",
		"adornment",
		"url input",
		"currency input",
		"password reveal",
		"copy field",
		"icon in input",
	],
	usage: {
		description:
			"Use InputGroup when something belongs inside the field with the text: a unit, a fixed prefix, an icon, or a small action on the value itself (copy, reveal, clear). Use Field's `trailing` for an action beside the field (Apply next to a promo code), SearchInput for search, and NumberField for numbers with steppers.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Keep text addons short and fixed (\"https://\", \"kg\", \"USD\"). They are part of the field, not its label.",
			},
			{
				guidance: "do",
				description:
					"For a button addon, use a borderless Button (`variant=\"ghost\"`, `size=\"icon-sm\"`) with an aria-label. The addon tightens around it, so it sits as far from the edge as from the top and bottom.",
			},
			{
				guidance: "do",
				description:
					"Wrap the group in Field for a label and errors: `<Field label=\"Website\"><InputGroup leading=\"https://\"><Input /></InputGroup></Field>`.",
			},
			{
				guidance: "dont",
				description:
					"Do not put the value's meaning only in an addon. A screen reader hears the label and the text, so \"Price (USD)\" belongs in the label too.",
			},
			{
				guidance: "dont",
				description: "Do not restyle an Input to fake an addon; the group owns the border, the fill and the ring.",
			},
		],
	},
	related: {
		components: ["Input", "Field", "SearchInput", "NumberField", "Button"],
	},
	status: "stable",
	props: [
		{
			name: "leading",
			type: "ReactNode",
			default: "—",
			description: "Inside the field, before the text: a prefix (\"https://\", \"$\"), an icon, or a borderless Button.",
		},
		{
			name: "trailing",
			type: "ReactNode",
			default: "—",
			description: "Inside the field, after the text: a suffix (\".com\", \"kg\"), an icon, or a borderless Button (copy, reveal, clear).",
		},
		{
			name: "children",
			type: "ReactElement",
			default: "—",
			description: "The single `<Input />`. It keeps its own props and type; the group takes over its border, fill and focus ring.",
		},
		{
			name: "id / required / disabled / aria-describedby / aria-invalid",
			type: "control props",
			default: "—",
			description:
				"Forwarded to the Input, not set on the group. This is how a Field's wiring reaches the text box when the group is its child.",
		},
		{
			name: "className",
			type: "string",
			default: "—",
			description: "Layout classes for the group (width, margins).",
		},
	],
	tokensUsed: ["input", "card", "ring", "destructive", "muted-foreground", "foreground"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "It arrives with the form it belongs to. A field that animated in on its own would be briefly unusable for no stated reason.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Root",
			why: "The shell owns one focus ring for the input and its addons and eases it in, so focusing the text, or tabbing to a copy button inside the field, reads as the one field taking focus.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Root",
			why: "An invalid value turns the shell's edge destructive on the same ease, so the error lands as the field changing state rather than a red box swapping in.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "A field does no work of its own. A pending check (an availability lookup) puts a Spinner in `trailing`, which is where its answer will appear.",
		},
	],
	a11y: [
		"The Input stays the focusable control; the group draws the focus ring around the whole field while it is focused.",
		"Inside a Field, the label, description and error are wired to the Input itself, not the group.",
		"Text addons are plain text beside the input, read in order; put a unit or currency in the label as well so it is not only visual.",
		"A button addon is a real Button with its own focus stop and needs an aria-label.",
	],
	examples: [
		{
			label: "Prefix and suffix",
			code: '<Field label="Website"><InputGroup leading="https://" trailing=".com"><Input placeholder="example" /></InputGroup></Field>',
		},
		{
			label: "Leading icon",
			code: '<Field label="Email"><InputGroup leading={<Icon name="mail" />}><Input type="email" placeholder="you@example.com" /></InputGroup></Field>',
		},
		{
			label: "Copy button",
			code: '<Field label="API key"><InputGroup trailing={<Button variant="ghost" size="icon-sm" aria-label="Copy key" onClick={copy}><span aria-hidden="true" className="motion-icon-swap"><span data-active={!copied} className="inline-flex"><Icon name="copy" /></span><span data-active={copied} className="inline-flex"><Icon name="check" /></span></span></Button>}><Input readOnly value={key} /></InputGroup></Field>',
		},
		{
			label: "Password with reveal",
			code: '<Field label="Password"><InputGroup trailing={<Button variant="ghost" size="icon-sm" aria-label={shown ? "Hide password" : "Show password"} aria-pressed={shown} onClick={() => setShown(!shown)}><Icon name={shown ? "eye-off" : "eye"} /></Button>}><Input type={shown ? "text" : "password"} autoComplete="current-password" /></InputGroup></Field>',
		},
	],
}
