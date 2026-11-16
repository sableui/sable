import type { ComponentMeta } from "../../lib/meta"

export const iconTileMeta: ComponentMeta = {
	name: "IconTile",
	summary:
		"One icon on a small square tile: the mark beside a feature's title, a file type in a result row, a category in a list. Sizes and corners follow the square Avatar; the fill is the surface's well, the muted surface, or a palette family.",
	keywords: ["icon tile", "icon box", "icon square", "feature icon", "file icon", "leading icon", "glyph tile", "icon badge"],
	usage: {
		description:
			"Use IconTile wherever an icon needs a shape of its own: a feature card's mark, the leading slot of a row whose item is a thing rather than a person (a document, a file, an integration), a category in a settings list. It is decorative by default, because a title beside it says what it is.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Pair it with a visible title. Pass `label` only when the tile stands alone and the icon carries meaning nothing else states.",
			},
			{
				guidance: "do",
				description:
					"Match the tile to the row: `size=\"sm\"` (32px) beside a sm Avatar in an Entity row, `md` (40px) on a feature card, `lg` (48px) as a card's lead mark. Use `appearance=\"muted\"` in a list, the default `well` on a card.",
			},
			{
				guidance: "dont",
				description:
					"Hand-build the tile: a `grid size-10 place-items-center rounded-md bg-muted` span around an Icon. The sizes, corners and icon scale drift from each other and from Avatar the moment there are two.",
			},
			{
				guidance: "dont",
				description:
					"Use it for a person, a logo or initials. That is an Avatar (shape=\"square\" for a workspace or a project).",
				instead: ["Avatar"],
			},
			{
				guidance: "dont",
				description: "Use it as a status mark beside text; that is a StatusDot or a Badge with a dot.",
				instead: ["StatusDot", "Badge"],
			},
		],
		anatomy: [
			{ name: "Tile", required: true, description: "The square, sized from the Avatar ladder, filled by appearance or tone." },
			{ name: "Icon", required: true, description: "One semantic icon, scaled to about half the tile." },
		],
	},
	related: {
		components: ["Avatar", "Icon", "Entity", "Card", "StatusDot"],
		patterns: ["LandingPage"],
	},
	status: "stable",
	props: [
		{ name: "icon", type: "string", description: "The semantic icon name, as `<Icon name>` takes it." },
		{ name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "32 / 40 / 48px, with the square Avatar's corner at each size. The icon scales with it." },
		{
			name: "appearance",
			type: '"well" | "muted"',
			default: '"well"',
			description:
				"well: the relative recess of the surface it sits on (sable-well), so it reads on a card, a section or a popover. muted: the flat muted surface with muted ink, quieter, for a row.",
		},
		{
			name: "tone",
			type: '"neutral" | "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "purple" | "pink"',
			default: '"neutral"',
			description: "A palette family's wash and deep ink in place of the appearance's fill — for a category colour, never a status.",
		},
		{
			name: "label",
			type: "string",
			description: "The accessible name, when nothing beside the tile says what it is. Omitted, the tile is aria-hidden.",
		},
	],
	variants: {
		size: ["sm", "md", "lg"],
		appearance: ["well", "muted"],
	},
	tokensUsed: ["muted", "muted-foreground", "foreground", "palette-wash", "palette-text"],
	a11y: [
		"Decorative by default (aria-hidden): the title beside it names the thing.",
		"With `label` it is role=img with that name, for a tile that stands alone.",
		"A palette tone's wash and ink are the pair a soft Badge uses, held to contrast in every theme.",
	],
	examples: [
		{
			label: "Feature card",
			code: '<Card className="max-w-xs"><CardContent className="flex flex-col gap-3"><IconTile icon="layout" /><h3 className="pt-2 text-title-lg">Pages, not just parts</h3><p className="text-body-sm text-muted-foreground">Shells to copy and adapt.</p></CardContent></Card>',
		},
		{
			label: "Row lead",
			code: '<Entity leading={<IconTile icon="file" size="sm" appearance="muted" />} title="Q4 roadmap" subtitle="Edited 2 hours ago" />',
		},
		{
			label: "Sizes and tones",
			code: '<Row gap={3}><IconTile icon="star" size="sm" /><IconTile icon="star" /><IconTile icon="star" size="lg" /><IconTile icon="tag" tone="teal" /><IconTile icon="music" tone="purple" /></Row>',
		},
	],
}
