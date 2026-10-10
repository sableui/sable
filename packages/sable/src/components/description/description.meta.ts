import type { ComponentMeta } from "../../lib/meta"

export const descriptionMeta: ComponentMeta = {
	name: "Description",
	summary:
		"A labeled key/value list (definition list). Compose with DescriptionTerm + DescriptionDetail, or the ergonomic DescriptionItem shorthand. Aligns terms and details into a grid; cols=\"2\" packs pairs two-wide.",
	status: "stable",
	keywords: [
		"description list",
		"metadata",
		"details",
		"key value",
	],
	usage: {
		description: "Use Description to present label-value details where each term needs a clear corresponding value.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for object metadata, settings summaries, and read-only record details.",
			},
			{
				guidance: "do",
				description: "Keep terms brief and values scannable so the list works as reference material.",
			},
			{
				guidance: "dont",
				description: "Do not use Description for editable forms; pair Label and form controls instead.",
			},
			{
				guidance: "dont",
				description: "Do not use it for a single key/value. A definition list of one is a labelled value — use a Label and the value, and keep the list semantics for actual lists.",
			},
		],
		anatomy: [
			{
				name: "DescriptionItem",
				required: true,
				description: "One term and detail pair.",
			},
			{
				name: "DescriptionTerm",
				required: true,
				description: "The label for the value.",
			},
			{
				name: "DescriptionDetail",
				required: true,
				description: "The value or explanatory detail.",
			},
		],
	},
	related: {
		components: [
			"Fieldset",
			"Entity",
		],
	},
	props: [
		{
			name: "cols",
			type: '"1" | "2"',
			default: '"1"',
			description:
				"Column density. One term/detail column, or two pairs per row once the list's container is at least @md (28rem) wide; narrower, it stays one column. A container query, not a viewport breakpoint, so a narrow card on a wide screen stays one column. With cols=\"2\" the <dl> is wrapped in an @container div.",
		},
	],
	subcomponents: [
		{
			name: "DescriptionTerm",
			type: "<dt> props + className",
			description: "The key. Muted label tier; sits in the first grid column.",
		},
		{
			name: "DescriptionDetail",
			type: '<dd> props + tone?: "default" | "muted" | "success" | "warning" | "destructive" + className',
			description:
				'The value. Body tier on the foreground; sits in the second grid column. tone colors the value to encode a status (e.g. Ended → muted, Active → success), replacing inline conditional color classes; defaults to "default".',
		},
		{
			name: "DescriptionItem",
			type: '{ term: ReactNode; detail?: ReactNode; tone?: "default" | "muted" | "success" | "warning" | "destructive"; children? }',
			description:
				'Ergonomic shorthand for one term/detail pair — renders a DescriptionTerm followed by a DescriptionDetail. Pass the value via detail or children; tone (defaults to "default") colors the detail value the same way it does on DescriptionDetail.',
		},
	],
	variants: {
		cols: ["1", "2"],
		tone: ["default", "muted", "success", "warning", "destructive"],
	},
	tokensUsed: [
		"muted-foreground",
		"foreground",
		"success",
		"tone-warning",
		"destructive",
	],
	a11y: [
		"Renders semantic <dl>/<dt>/<dd> elements so assistive tech announces the term/detail relationship.",
		"tone is a visual emphasis only — keep the value text itself meaningful (e.g. \"Ended\"), never color alone.",
	],
	examples: [
		{
			label: "Metadata list",
			code: '<Description>\n\t<DescriptionItem term="Network" detail="Solana" />\n\t<DescriptionItem term="Supply" detail="100" />\n\t<DescriptionItem term="Royalty" detail="5%" />\n</Description>',
		},
		{
			label: "Composed term/detail",
			code: '<Description>\n\t<DescriptionTerm>Network</DescriptionTerm>\n\t<DescriptionDetail>Solana</DescriptionDetail>\n\t<DescriptionTerm>Contract</DescriptionTerm>\n\t<DescriptionDetail className="text-mono-sm">7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU</DescriptionDetail>\n</Description>',
		},
		{
			label: "Toned status value",
			code: '<Description>\n\t<DescriptionItem term="Edition" detail="Midnight Archive" />\n\t<DescriptionItem term="Status" detail={isEnded ? "Ended" : "Active"} tone={isEnded ? "muted" : "success"} />\n</Description>',
		},
	],
}
