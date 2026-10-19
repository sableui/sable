import type { ComponentMeta } from "../../lib/meta"

export const pillMeta: ComponentMeta = {
	name: "Pill",
	summary:
		"A chip someone clicks: a filter, a tag choice, an option in a row. Always a button with aria-pressed. appearance=\"solid\" (filters; selected lifts onto the primary surface) or \"outline\" (quiet chips that annotate content, like reactions); size lg, md or sm. A static label is a Badge.",
	status: "stable",
	keywords: [
		"pill",
		"chip",
		"filter",
		"tag",
		"toggle chip",
		"category",
	],
	usage: {
		description: "Use Pill for a row of filters or choices a person clicks to narrow or toggle what they see. For a label that only describes something, use Badge.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use short text that names the filter or choice.",
			},
			{
				guidance: "do",
				description: "Reflect the current choice with selected, so the active filter reads at a glance.",
			},
			{
				guidance: "do",
				description: "In a toolbar where filter chips share a row with a search field (\"All 8 · Products 5 · Open source 2 … [Find a project]\"), pair Pill size=\"lg\" with SearchInput size=\"sm\", and Button size=\"sm\" for any action beside them. All three stand on --control-sm (32px, 28 compact), the rung the spacing doctrine gives toolbar controls, so the row is one height in either density. Pill md (28px) has no text field of its height in the page register, so md beside a field always reads as a mismatch.",
			},
			{
				guidance: "dont",
				description: "Do not use Pill as a static label. A pressable-looking chip that does nothing is the most common cause of dead clicks in a filter row — that is a Badge.",
				instead: ["Badge"],
			},
			{
				guidance: "dont",
				description: "Do not use Pill for primary actions or important system status.",
			},
			{
				guidance: "dont",
				description: "Do not restyle a Pill with border or background classes to get a quieter chip. That is appearance=\"outline\" (and size=\"sm\" for a small one); an override is a look that exists nowhere else in the system. Likewise never set h-* on a Pill to match a neighbour: pick the size that shares its rung.",
			},
		],
	},
	related: {
		components: [
			"Badge",
			"ToggleGroup",
			"SearchInput",
		],
	},
	props: [
		{
			name: "selected",
			type: "boolean",
			default: "false",
			description:
				"Marks the pill as chosen. Solid lifts onto the primary surface; outline takes a primary tint and soft primary edge. Sets aria-pressed.",
		},
		{
			name: "appearance",
			type: '"solid" | "outline"',
			default: '"solid"',
			description:
				"solid for a filter row; outline for quiet chips that annotate other content (a reaction under a message, a tag on a card), where a filled chip would compete with what it annotates.",
		},
		{
			name: "size",
			type: '"lg" | "md" | "sm"',
			default: '"md"',
			description: "lg sits on --control-sm (32px, 28 compact), the toolbar rung it shares with SearchInput sm and Button sm, for a filter row beside a search field. md sits on --control-xs (28px, 24 compact), the chip in a row of its own or among content. sm is a fixed 24px (the target floor, which density does not shrink), for chips under or inside other content.",
		},
		{
			name: "tone",
			type: '"neutral" | "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "purple" | "pink"',
			default: '"neutral"',
			description:
				"neutral is the chip as described. A palette family colours it as a category, like the choices in a tag picker: a wash at rest, the solid family colour when selected. Painted from the theme's generated palette.",
		},
		{
			name: "icon",
			type: "ReactNode",
			description:
				"Optional leading glyph (e.g. <Icon name=\"lock\" />), rendered before the children with the base gap.",
		},
	],
	variants: {
		appearance: ["solid", "outline"],
		size: ["lg", "md", "sm"],
		selected: ["true", "false"],
		tone: ["neutral", "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"],
	},
	tokensUsed: [
		"palette-wash",
		"palette-wash-strong",
		"palette-edge",
		"palette-solid",
		"palette-text",
		"palette-solid-ink",
		"secondary",
		"secondary-foreground",
		"accent",
		"accent-foreground",
		"primary",
		"primary-foreground",
		"card",
		"border",
		"muted-foreground",
		"foreground",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "Pills arrive with the filter row or the content they annotate. A chip that animated in alone would read as a filter someone just added.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Root",
			why: "The hover wash eases, so sweeping the pointer along a filter row reads as one cursor moving rather than chips flashing in turn.",
		},
		{
			slot: "response",
			recipe: "motion-press",
			part: "Root",
			why: "A pill often toggles a filter that takes a moment to reach the results; the settle on press confirms the click landed before they change.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Root",
			why: "`selected` lifts the chip onto its selected surface on the same ease, so toggling reads as this chip changing state, not a different chip appearing in its place.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "A chip is a choice, not a process. If applying it is slow, the results show it.",
		},
	],
	a11y: [
		"Renders a native <button type=\"button\"> for focus and keyboard activation.",
		"Selected state is exposed via aria-pressed.",
	],
	examples: [
		{
			label: "Tag picker",
			code: '<Row gap={1}><Pill tone="blue" selected onClick={() => {}}>Design</Pill><Pill tone="teal" onClick={() => {}}>Research</Pill><Pill tone="orange" onClick={() => {}}>Marketing</Pill></Row>',
		},
		{
			label: "Filter row",
			code: '<Row gap={1}><Pill selected onClick={() => {}}>All</Pill><Pill onClick={() => {}}>Projects</Pill><Pill onClick={() => {}}>Reports</Pill></Row>',
		},
		{
			label: "Filters with search",
			code: "const [filter, setFilter] = useState(\"all\")\nconst [q, setQ] = useState(\"\")\n\n<Row gap={2} align=\"center\" justify=\"between\" wrap>\n\t<Row gap={1}>\n\t\t<Pill size=\"lg\" selected={filter === \"all\"} onClick={() => setFilter(\"all\")}>All 8</Pill>\n\t\t<Pill size=\"lg\" selected={filter === \"products\"} onClick={() => setFilter(\"products\")}>Products 5</Pill>\n\t\t<Pill size=\"lg\" selected={filter === \"oss\"} onClick={() => setFilter(\"oss\")}>Open source 2</Pill>\n\t</Row>\n\t<SearchInput size=\"sm\" value={q} onValueChange={setQ} placeholder=\"Find a project…\" aria-label=\"Find a project\" className=\"max-w-64\" />\n</Row>",
		},
		{
			label: "Outline, small (reactions)",
			code: '<Row gap={1}><Pill appearance="outline" size="sm" selected onClick={() => {}}>🎉 3</Pill><Pill appearance="outline" size="sm" onClick={() => {}}>👀</Pill></Row>',
		},
		{
			label: "With icon",
			code: '<Pill icon={<Icon name="lock" />} onClick={() => {}}>Locked</Pill>',
		},
	],
}
