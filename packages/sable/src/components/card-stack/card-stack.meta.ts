import type { ComponentMeta } from "../../lib/meta"

export const cardStackMeta: ComponentMeta = {
	name: "CardStack", status: "stable",
	summary: "A compact collection of overlapping cards, opened by pressing the front card or a separate button. Expanded cards return to normal flow; back-card controls are inert while collapsed. Opening and closing is one eased movement: the height and every card travel together.",
	keywords: ["card stack", "collection", "fan", "stacked cards", "browse collection"],
	usage: {
		description: "Use for a small collection someone can inspect together: documents, photographs or project summaries. Supply the cards; CardStack owns overlap and expansion without a second overlay or gesture dependency.",
		bestPractices: [
			{ guidance: "do", description: "Use trigger=\"stack\" for presentational cards. Pressing the front card expands or collapses the collection without a separate control." },
			{ guidance: "do", description: "Give label a collection name and expandLabel a concrete action, including the item count when useful." },
			{ guidance: "do", description: "Keep the collection small. Use stable child keys so expanding does not reset state inside a card." },
			{ guidance: "dont", description: "Do not put an essential action exclusively on a covered card. The visible expansion control must reach it by keyboard and touch." },
			{ guidance: "dont", description: "Do not use the front card as a trigger when it contains links, inputs or other controls. Keep the separate button trigger for interactive cards." },
			{ guidance: "dont", description: "Do not use this for a long feed or a multi-page gallery; use a Grid or Carousel instead.", instead: ["Carousel"] },
		],
	},
	props: [
		{ name: "label", type: "string", description: "Accessible collection name." },
		{ name: "expanded", type: "boolean", description: "Controlled expansion." },
		{ name: "defaultExpanded", type: "boolean", default: "false", description: "Initial uncontrolled expansion." },
		{ name: "onExpandedChange", type: "(expanded: boolean) => void", description: "Called by the expansion control." },
		{ name: "trigger", type: '"button" | "stack"', default: '"button"', description: "A separate button, or the front card itself. Use stack only when the front card contains no interactive controls." },
		{ name: "expandLabel", type: "string", default: '"Browse collection"', description: "Expansion action. Visible on the button trigger; an accessible description on the stack trigger, whose name comes from its visible content." },
		{ name: "collapseLabel", type: "string", default: '"Collapse collection"', description: "Collapse action. Visible on the button trigger; an accessible description on the stack trigger." },
		{ name: "motion", type: '"full" | "subtle" | "off"', description: "Only turns motion down. Expansion remains available at every level." },
	],
	related: { components: ["Card", "Carousel", "Collapsible"] },
	tokensUsed: [],
	motion: [
		{ slot: "arrival", recipe: "none", part: "Collection", why: "The collection starts at rest, without a page-load stagger." },
		{ slot: "transition", recipe: "custom", part: "Collection and cards", why: "Height and each card's position ease together on --motion-duration-slow and --motion-ease-standard (WAAPI, read from the tokens), so the cards never hang outside the box or snap into place. Expressive: subtle and off change layout at once. A toggle mid-way starts from what is on screen." },
		{ slot: "transition", recipe: "motion-stack-card", part: "Cards", why: "The fan straightens and returns on the same duration and curve as the travel; expanded cards read normally." },
	],
	a11y: ["The trigger exposes aria-expanded and aria-controls. A stack trigger keeps its visible card content as its accessible name; its description names the expansion or collapse action.", "Base UI owns Enter/Space activation on the stack trigger, which retains focus through expansion and collapse.", "Covered cards are inert and aria-hidden until expanded. Expansion is explicit on touch and keyboard; hover is never required."],
	examples: [
		{ label: "Project collection", code: '<CardStack label="Projects" trigger="stack" expandLabel="Show 2 projects"><Card><CardContent>Research</CardContent></Card><Card><CardContent>Design</CardContent></Card></CardStack>' },
		{ label: "Controlled and still", code: 'const [open, setOpen] = useState(true)\n<CardStack label="Documents" expanded={open} onExpandedChange={setOpen} motion="off"><Card><CardContent>Brief</CardContent></Card><Card><CardContent>Notes</CardContent></Card></CardStack>' },
	],
}
