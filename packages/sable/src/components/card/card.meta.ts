import type { ComponentMeta } from "../../lib/meta"

export const cardMeta: ComponentMeta = {
	name: "Card",
	summary:
		"Raised surface container (rounded-lg) with optional Header/Title/Description/Action/Content/Footer parts. A density knob trades the part padding (comfortable vs compact) for denser section panels. `render` makes the whole card one link or button, with a hover, a full-card focus ring and motion.",
	keywords: [
		"card",
		"surface",
		"panel",
		"container",
		"tile",
		"section",
		"header",
		"footer",
		"settings",
		"link card",
		"clickable card",
		"nav card",
	],
	usage: {
		description:
			"Use Card for a discrete thing with its own boundary, such as one product, one notification, one metric, or one setting cluster. Do not use Card as the default way to group every page section; whitespace, headings, Stack, Section, and dividers often create cleaner hierarchy.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Use Card when the item could be reordered, removed, selected, or compared independently.",
			},
			{
				guidance: "do",
				description:
					"Keep sibling cards on the same density and padding rhythm so lists and grids scan cleanly.",
			},
			{
				guidance: "do",
				description:
					"Use CardHeader, CardContent, and CardFooter when the card has a stable title/body/action structure.",
			},
			{
				guidance: "do",
				description:
					'Make the whole card one link (`render={<a href="…" />}`) when the card IS a single destination — a nav tile, a gallery item, a news teaser — and nothing inside it is interactive. All of the card text becomes the accessible name of the link, so keep it short: a title and a line.',
			},
			{
				guidance: "dont",
				description:
					"Make a card a link when it holds its own buttons, menus, switches or links. Interactive content nested in a link is invalid HTML and announces twice; keep the card a plain surface and put the link on its title or in CardFooter instead.",
			},
			{
				guidance: "dont",
				description:
					"Wrap every settings section or form group in a card; use headings, Stack, or the SettingsPage pattern instead.",
			},
			{
				guidance: "dont",
				description:
					"Nest cards inside cards. Flatten the hierarchy or use dividers and spacing inside one card.",
			},
		],
		anatomy: [
			{
				name: "Container",
				required: true,
				description:
					"The raised or flat surface that creates the item boundary.",
			},
			{
				name: "Header",
				required: false,
				description:
					"Optional title, description, and aligned action area for the card's identity.",
			},
			{
				name: "Content",
				required: true,
				description:
					"The body region. It should contain the information or controls that belong to this one item.",
			},
			{
				name: "Footer",
				required: false,
				description:
					"Optional action or metadata row, usually lower-emphasis than the header.",
			},
		],
	},
	related: {
		components: ["Region", "Stack", "Separator", "Button", "Badge"],
		patterns: ["DashboardPage", "SettingsPage", "ListDetailPage"],
	},
	status: "stable",
	props: [
		{
			name: "variant",
			type: '"default" | "flat"',
			default: '"default"',
			description:
				'"default" raises with bg-card + border + soft shadow; "flat" is transparent, for a card inside a section that already frames it. A flat card made a link or button shows its shape only on hover (the muted fill), so over a photo with square bottom corners it reads as a cropped image at rest: give a linked media card the default variant.',
		},
		{
			name: "density",
			type: '"comfortable" | "compact"',
			default: '"comfortable"',
			description:
				"Padding of the Header/Content/Footer parts: comfortable = p-6 (default), compact = p-4 for denser section panels (pair compact with the flat variant for a settings / form section panel). Threaded to the parts via the inherited --card-p custom property. Card sets --card-p via inline style, which beats a plain (non-!important) stylesheet override of the same property on the same element — use this prop rather than a className override; if an external override is unavoidable, it needs !important.",
		},
		{
			name: "render",
			type: "useRender.RenderProp",
			description:
				'Replace the rendered element through the Base UI render prop — most often `render={<a href="/x" />}` (or a router Link) to make the whole card one link. When the rendered element is a link (a[href]) or a button, the card gains a hover state (stronger border and shadow; a muted fill when flat), a full-card focus-visible ring and motion-interactive easing. Any other element (article, li) stays a static surface. Children can answer the hover with `group-hover/card:`.',
		},
	],
	subcomponents: [
		{
			name: "CardHeader",
			type: 'ComponentPropsWithRef<"div">',
			description:
				"Top section holding CardTitle/CardDescription (and optionally CardAction). Padding follows the density knob.",
		},
		{
			name: "CardTitle",
			type: 'ComponentPropsWithRef<"div"> & { render?: useRender.RenderProp }',
			description: "The card's name (text-title-lg). A div by default; pass `render={<h2 />}` (or h3…) to make it a heading in the page outline, at the level the card's position calls for.",
		},
		{
			name: "CardDescription",
			type: 'ComponentPropsWithRef<"div">',
			description: "Muted supporting line under the title.",
		},
		{
			name: "CardAction",
			type: 'ComponentPropsWithRef<"div">',
			description:
				"Header-aligned top-right action slot (e.g. an overflow menu, switch, or close button). Place inside CardHeader, which becomes a 2-column grid when present and collapses to a single column otherwise. A ghost or link Button that ends the slot bleeds by its own padding at the end, so a \"View all\" label or a \"⋯\" glyph sits on the card's content edge; filled buttons keep their edge there.",
		},
		{
			name: "CardContent",
			type: 'ComponentPropsWithRef<"div"> & { flush?: boolean }',
			description:
				"The body region. Padding follows the density knob on all sides — does not assume a preceding CardHeader, so it is safe to use standalone (e.g. no CardHeader in the card). When paired with CardHeader, the seam stays tight because CardHeader zeroes its own bottom padding. `flush` runs it edge to edge for a table: the Table insets its first and last columns by exactly the card padding, so it lines up with the header — never hand-set pl-6/pr-6 on columns.",
		},
		{
			name: "CardList",
			type: 'ComponentPropsWithRef<"div">',
			description:
				"Rows that run edge to edge in the card (Entity rows, most often), divided by hairlines. Insets each row to the card's own padding, so a list card lines up with every other card at any density — no hand-tuned px-* on the rows. Under a CardHeader it opens with a hairline and a gap; alone it fills the card.",
		},
		{
			name: "CardFooter",
			type: 'ComponentPropsWithRef<"div"> & { actions?: boolean }',
			description:
				"Bottom row for actions/meta. Padding follows the density knob. `actions` marks it as the card's action row (buttons only): in a sheet (IosSheet, a bottom SheetContent) it becomes a full-width stack pinned to the bottom, primary on top; on a page nothing changes.",
		},
	],
	variants: {
		variant: ["default", "flat"],
		density: ["comfortable", "compact"],
	},
	tokensUsed: [
		"card",
		"card-foreground",
		"border",
		"border-strong",
		"muted",
		"muted-foreground",
		"ring",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Container",
			why: "A card is part of the layout it ships in; whatever stages that region owns the entrance. A card that fades in on its own delays reading the thing it holds.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Container",
			why: "Only when the card is rendered as a link or button. The border, shadow and ring ease in so the pointer reads as landing on one target, not as the grid flickering. No motion-press: a 0.97 settle on a surface this large reads as the layout lurching. A static card has no response, so it gets no transition.",
		},
		{
			slot: "transition",
			recipe: "none",
			part: "Container",
			why: "A card has no states of its own to move between. Selection is CheckboxCard or RadioCard; disclosure is Collapsible or Accordion.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Container",
			why: "A card does not work on anything. Loading content inside it is a Skeleton's job.",
		},
	],
	a11y: [
		"Purely presentational by default; add headings/landmarks in content as needed.",
		"Rendered as a link or button, the whole card is one target: its full text is the accessible name, and the focus ring wraps the whole card. Nothing interactive may sit inside it — nested links or buttons inside a link are invalid and unreachable for keyboard users in some browsers.",
		"A Card is a container, not a landmark and not a heading. If its title is the only heading in the region, render it as a real heading element with a title tier — a visually-styled div gives screen-reader heading navigation nothing to find.",
	],
	examples: [
		{
			label: "With parts",
			code: '<Card><CardHeader><CardTitle>Edition</CardTitle><CardDescription>Limited run of 100.</CardDescription></CardHeader><CardContent><p className="text-body-md">Each collector receives a signed print and the on-chain edition.</p></CardContent></Card>',
		},
		{
			label: "With a header action",
			code: '<Card><CardHeader><CardTitle>Edition</CardTitle><CardAction><Button variant="ghost" size="icon-sm" aria-label="More"><Icon name="ellipsis" /></Button></CardAction></CardHeader><CardContent><p className="text-body-md text-muted-foreground">24 of 100 collected.</p></CardContent></Card>',
		},
		{
			label: "Compact section panel",
			code: '<Card variant="flat" density="compact"><CardHeader><CardTitle>Notifications</CardTitle></CardHeader><CardContent><p className="text-body-sm text-muted-foreground">Push and email are enabled.</p></CardContent></Card>',
		},
		{
			label: "Product card with actions",
			code: '<Card><CardHeader><CardTitle>Midnight Archive</CardTitle><CardDescription>Edition #24 of 100</CardDescription><CardAction><Badge tone="edition">Edition</Badge></CardAction></CardHeader><CardContent><p className="text-body-sm text-muted-foreground">A signed print and token-gated download for collectors.</p></CardContent><CardFooter><Button size="sm">Collect</Button><Button size="sm" variant="ghost">Preview</Button></CardFooter></Card>',
		},
		{
			label: "Whole card as a link",
			code: '<Card render={<a href="/components" />}><CardContent className="flex items-center justify-between gap-4"><div className="min-w-0"><CardTitle>Components</CardTitle><CardDescription>Every building block, with live examples.</CardDescription></div><Icon name="chevron-right" className="text-sm text-muted-foreground motion-interactive group-hover/card:translate-x-0.5 group-hover/card:text-foreground" /></CardContent></Card>',
		},
		{
			label: "Metric card",
			code: '<Card density="compact"><CardHeader><CardTitle>Revenue</CardTitle><CardDescription>Last 30 days</CardDescription></CardHeader><CardContent><p className="text-heading-3">128.4 SOL</p><p className="text-body-sm text-success">+12.8% from previous period</p></CardContent></Card>',
		},
		{
			label: "List card",
			code: '<Card><CardHeader><CardTitle>Members</CardTitle><CardDescription>3 people can edit this space.</CardDescription></CardHeader><CardList>{people.map((p) => <Entity key={p.id} interactive onSelect={() => open(p)} leading={<Avatar fallback={p.initials} alt={p.name} />} title={p.name} subtitle={p.role} />)}</CardList></Card>',
		},
	],
}
