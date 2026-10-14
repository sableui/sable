import type { ComponentMeta } from "../lib/meta"

/**
 * Machine-readable contracts for the layout primitives — the page-building
 * vocabulary. These aggregate into `registry.json → layoutPrimitives` exactly
 * like component metas aggregate into `components[]`; keep them in sync with
 * the sources in this directory.
 *
 * The doctrine (also in DESIGN.md → Grid & layout):
 * a page's width is a purpose-named `Region` cap; the 12-column grid is used
 * WITHIN a region; app chrome (Sidebar) is not on the grid; text measure caps
 * independently of layout width.
 */

export const layoutPrimitiveMetas: ComponentMeta[] = [
	{
		name: "Region",
		summary:
			"The page region: fluid, edge-to-edge with the fluid page inset (--page-inset). Opt-in centered max cap picked by ROLE (prose/form/feed/content/wide/full), never a global page max-width. The root of nearly every route.",
		status: "stable",
		props: [
			{
				name: "as",
				type: "ElementType",
				default: '"div"',
				description: 'Semantic element to render (e.g. "main", "section", "nav").',
			},
			{
				name: "inset",
				type: "boolean",
				default: "true",
				description: "Apply the fluid horizontal page inset (--page-inset).",
			},
			{
				name: "max",
				type: '"prose" | "form" | "feed" | "content" | "wide" | "full" | CSS length',
				description:
					"Opt-in centered max-width cap, purpose-named: prose 65ch (long-form reading) · form 480px (auth, narrow single-column forms) · feed 640px (single-column timeline) · content 896px (settings/admin panes) · wide 1280px (dashboards, tables, card grids) · full 1536px (the largest cap; keeps the inset, so not edge to edge — that is bleed). Omit for fluid: work views whose panes, board or canvas use the extra width. A cap is a ceiling: it applies only once the viewport minus app chrome exceeds it, so judge it at 1920px and up.",
			},
			{
				name: "bleed",
				type: "boolean",
				default: "false",
				description: "Full-bleed: edge to edge with no inset. Overrides inset.",
			},
			{
				name: "safeArea",
				type: 'boolean | ("top"|"bottom"|"left"|"right")[]',
				default: "false",
				description:
					"env(safe-area-inset-*) padding for fixed or native-shell surfaces. true pads top+bottom; pass an edge array to target edges.",
			},
		],
		tokensUsed: [],
		examples: [
			{
				label: "Settings pane",
				code: '<Region as="main" max="content"><PageHeader title="Settings" /></Region>',
			},
			{
				label: "Dashboard region (capped at wide)",
				code: '<Region max="wide"><Grid minItemWidth="16rem"><Card><CardHeader><CardTitle>Revenue</CardTitle></CardHeader></Card><Card><CardHeader><CardTitle>Orders</CardTitle></CardHeader></Card></Grid></Region>',
			},
			{
				label: "Fluid workspace: the queue's table takes the extra width",
				code: '<Region as="main"><Columns count={{ base: 1, lg: 12 }}><Col span={{ base: 1, lg: 3 }}><SideNav aria-label="Views"><SideNavItem label="Open" active /><SideNavItem label="Pending" /></SideNav></Col><Col span={{ base: 1, lg: 9 }}><Card><CardContent flush><DataTable columns={columns} data={tickets} /></CardContent></Card></Col></Columns></Region>',
			},
		],
	},
	{
		name: "Page",
		summary:
			"A route shell: Region (inset + opt-in max cap) whose children flow as a vertically-rhythmic Stack. Use as the top-level wrapper of a route's content — distinct from AppShell (the frame around routes) and PageHeader (the heading block inside).",
		status: "stable",
		props: [
			{
				name: "gap",
				type: "number | string",
				default: "4",
				description:
					"Vertical gap between stacked page sections. Number = rhythm units (×8px, so 4 = 32px); string = raw CSS.",
			},
			{
				name: "align",
				type: '"start" | "center" | "end" | "stretch"',
				default: '"stretch"',
				description: "Cross-axis alignment of the stacked sections.",
			},
			{
				name: "…RegionProps",
				type: "as, inset, max, bleed, safeArea",
				description: "All Region props pass through (Page IS a Region).",
			},
		],
		tokensUsed: [],
		examples: [
			{
				label: "Feed route",
				code: '<Page as="main" max="feed"><PageHeader title="Home" description="Latest posts from people you follow." /><Card><CardContent><p className="text-body-md">First post.</p></CardContent></Card></Page>',
			},
		],
	},
	{
		name: "Grid",
		summary:
			"CSS Grid within a region. Two modes: fixed/responsive cols count, or minItemWidth so cells breathe with NO breakpoints (the default choice for card grids). A minItemWidth grid keeps its empty columns (track=\"fill\"), so one result stays one cell wide; track=\"fit\" stretches a fixed set across the row.",
		status: "stable",
		props: [
			{
				name: "cols",
				type: "number | { base?, sm?, md?, lg?, xl?, \"2xl\"? }",
				default: "12",
				description:
					"Fixed column count or a mobile-first breakpoint map ({ base: 2, md: 4 }). Ignored when minItemWidth is set.",
			},
			{
				name: "minItemWidth",
				type: "string",
				description:
					'Breathing mode: repeat(auto-fill, minmax(minItemWidth, 1fr)) — as many columns of at least minItemWidth as fit, wrapping without breakpoints. e.g. "16rem".',
			},
			{
				name: "track",
				type: '"fill" | "fit"',
				default: '"fill"',
				description:
					'What a minItemWidth grid does with columns it has no items for (only visible when fewer items than fit one row). "fill" (auto-fill) keeps them, so items keep their size whatever their count — one search result is one cover wide, not a banner. Use it for collections whose count is data: results, shelves, galleries. "fit" (auto-fit) collapses them and stretches the items to share the row — only for a fixed set designed to span it (three KPI cards, plan tiers).',
			},
			{
				name: "gap",
				type: "number | [row, column] | string",
				default: "var(--grid-gutter)",
				description: "Gap between cells. Number = rhythm units (×8px); [row, column] = two rhythm counts, for a gallery whose rows want more air than its columns; string = raw CSS.",
			},
		],
		tokensUsed: [],
		examples: [
			{
				label: "Card grid that breathes (no breakpoints)",
				code: '<Grid minItemWidth="16rem" gap={3}><Card><CardHeader><CardTitle>Alpha</CardTitle></CardHeader></Card><Card><CardHeader><CardTitle>Beta</CardTitle></CardHeader></Card><Card><CardHeader><CardTitle>Gamma</CardTitle></CardHeader></Card></Grid>',
			},
			{
				label: "Sparse results keep their size",
				code: '// One match still renders one cover wide: the empty columns are kept (track="fill", the default).\n<Grid minItemWidth="10rem" gap={2}><Card><CardHeader><CardTitle>Night Swim</CardTitle><CardDescription>Album · Undertow</CardDescription></CardHeader></Card></Grid>',
			},
			{
				label: "A fixed set that spans the row",
				code: '<Grid minItemWidth="12rem" track="fit" gap={2}><Card><CardHeader><CardDescription>Listeners</CardDescription><span className="text-mono-xl">48.2k</span></CardHeader></Card><Card><CardHeader><CardDescription>Streams</CardDescription><span className="text-mono-xl">1.3M</span></CardHeader></Card><Card><CardHeader><CardDescription>Saves</CardDescription><span className="text-mono-xl">9,410</span></CardHeader></Card></Grid>',
			},
			{
				label: "Responsive fixed columns",
				code: '<Grid cols={{ base: 1, md: 2, lg: 4 }}><Badge appearance="plain" tone="3" dot /><Badge appearance="plain" tone="warning" dot /><Badge appearance="plain" tone="neutral" dot /><Badge appearance="plain" tone="destructive" dot /></Grid>',
			},
		],
	},
	{
		name: "Columns",
		summary:
			"An explicit N-column track (default 12) for proportioned layouts — pair with Col spans (list-detail, asymmetric editorial layouts). For uniform card grids prefer Grid minItemWidth.",
		status: "stable",
		props: [
			{
				name: "count",
				type: "number | breakpoint map",
				default: "12",
				description:
					"Columns in the track; a breakpoint map ({ base: 2, md: 6, lg: 12 }) thins the track on small screens.",
			},
			{
				name: "gap",
				type: "number | string",
				default: "var(--grid-gutter)",
				description:
						"Gap between columns and rows. Number = rhythm units (×8px); string = raw CSS. The column gap is capped so all gaps together never take more than 75% of the track's width — a large gap can't push a narrow screen into horizontal scroll, and at normal desktop widths it renders exactly as given. The row gap is never capped.",
			},
		],
		subcomponents: [
			{
				name: "Col",
				type: "span?: number | breakpoint map · start?: number | breakpoint map",
				description:
					"A cell in the track: columns to span (default 1) and optional 1-based start column. Both accept breakpoint maps ({ base: 12, lg: 8 }).",
			},
		],
		tokensUsed: [],
		examples: [
			{
				label: "List-detail (8/4)",
				code: '<Columns count={12}><Col span={{ base: 12, lg: 8 }}><Card><CardHeader><CardTitle>Posts</CardTitle></CardHeader></Card></Col><Col span={{ base: 12, lg: 4 }}><Card variant="flat"><CardHeader><CardTitle>Filters</CardTitle></CardHeader></Card></Col></Columns>',
			},
		],
	},
	{
		name: "Stack",
		summary:
			"Vertical flow on the 8px rhythm — the default container for stacked content. Gap by role: tight within a group (1.5–2), looser between groups (3–4), generous between sections (6+).",
		status: "stable",
		props: [
			{
				name: "gap",
				type: "number | string",
				default: "2",
				description:
					"Vertical gap. Number = rhythm units (×8px, fractions ok — 2 = 16px); string = raw CSS.",
			},
			{
				name: "align",
				type: '"start" | "center" | "end" | "stretch"',
				default: '"stretch"',
				description: "Cross-axis alignment.",
			},
			{
				name: "justify",
				type: '"start" | "center" | "end" | "between"',
				default: '"start"',
				description: "Main-axis distribution.",
			},
		],
		tokensUsed: [],
		examples: [
			{
				label: "Form field group",
				code: '<Stack gap={2}><Field label="Display name"><Input name="name" /></Field><Field label="Bio"><Textarea name="bio" /></Field></Stack>',
			},
		],
	},
	{
		name: "Row",
		summary:
			"Horizontal flex flow — inline rows of controls, toolbars, action clusters. Defaults to center-aligned, no wrap.",
		status: "stable",
		props: [
			{
				name: "gap",
				type: "number | string",
				default: "2",
				description: "Horizontal gap. Number = rhythm units (×8px); string = raw CSS.",
			},
			{
				name: "align",
				type: '"start" | "center" | "end" | "stretch"',
				default: '"center"',
				description: "Cross-axis alignment.",
			},
			{
				name: "justify",
				type: '"start" | "center" | "end" | "between"',
				default: '"start"',
				description: "Main-axis distribution.",
			},
			{
				name: "wrap",
				type: "boolean",
				default: "false",
				description: "Allow items to wrap.",
			},
		],
		tokensUsed: [],
		examples: [
			{
				label: "Action cluster",
				code: '<Row gap={2} justify="end"><Button variant="ghost">Cancel</Button><Button>Save changes</Button></Row>',
			},
		],
	},
	{
		name: "Spacer",
		summary:
			"Explicit space on the rhythm, or a flexible grow pusher between siblings (e.g. pushing a footer item to the end of a Row).",
		status: "stable",
		props: [
			{
				name: "size",
				type: "number",
				default: "1",
				description: "Fixed size in rhythm units (×8px; fractions ok). Ignored when grow.",
			},
			{
				name: "axis",
				type: '"vertical" | "horizontal"',
				default: '"vertical"',
				description: "Axis the fixed size applies to.",
			},
			{
				name: "grow",
				type: "boolean",
				description: "Flex-grow to push siblings apart (fills available space).",
			},
		],
		tokensUsed: [],
		examples: [
			{
				label: "Push actions to the end",
				code: '<Row><span className="text-title-sm">Members</span><Spacer grow /><Button size="sm">Invite</Button></Row>',
			},
		],
	},
	{
		name: "Center",
		summary:
			"Horizontally center a block, optionally capping its width (commonly \"prose\" for a reading column inside a wider layout).",
		status: "stable",
		props: [
			{
				name: "max",
				type: '"prose" | "form" | "feed" | "content" | "wide" | CSS length',
				description: "Cap width: a named region token or any raw CSS length.",
			},
		],
		tokensUsed: [],
		examples: [
			{
				label: "Reading column in a wide page",
				code: '<Center max="prose"><p className="text-body-lg">Long-form description text that should hold a comfortable reading measure even inside a wide dashboard region.</p></Center>',
			},
		],
	},
	{
		name: "AspectBox",
		summary:
			"Reserves space via aspect-ratio so async media loads with zero layout shift. Wrap images, video, embeds.",
		status: "stable",
		props: [
			{
				name: "ratio",
				type: "number",
				default: "16/9",
				description: "Width / height ratio (e.g. 1 for square, 4/5 for portrait).",
			},
		],
		tokensUsed: [],
		examples: [
			{
				label: "Cover image slot",
				code: '<AspectBox ratio={16 / 9}><img src={post.coverUrl} alt={post.title} className="size-full object-cover" /></AspectBox>',
			},
		],
	},
	{
		name: "Bleed",
		summary:
			"Escape a width-capped or inset ancestor to span the full CONTENT area (container-query units, so it stops at a fixed Sidebar instead of bleeding under it). Hero bands, profile covers, full-bleed media inside a capped Page.",
		status: "stable",
		props: [],
		tokensUsed: [],
		examples: [
			{
				label: "Full-bleed hero inside a capped page",
				code: '<Page max="feed"><Bleed><AspectBox ratio={3}><img src="/cover.jpg" alt="" className="size-full object-cover" /></AspectBox></Bleed><PageHeader title="Profile" /></Page>',
			},
		],
	},
	{
		name: "SplitPane",
		summary:
			"Responsive two-pane layout: side-by-side at/above a breakpoint, stacked (primary first) below. List-detail, media + metadata.",
		status: "stable",
		props: [
			{
				name: "primary",
				type: "ReactNode",
				description: "The leading / larger pane (e.g. the media column).",
			},
			{
				name: "secondary",
				type: "ReactNode",
				description: "The trailing / supporting pane (e.g. the detail column).",
			},
			{
				name: "collapseBelow",
				type: '"sm" | "md" | "lg" | "xl"',
				default: '"lg"',
				description: "Breakpoint at/above which panes sit side by side.",
			},
			{
				name: "ratio",
				type: "string",
				default: '"1/1"',
				description: 'Primary:secondary width ratio as "a/b" fr units (e.g. "2/1").',
			},
			{
				name: "gap",
				type: "number | string",
				default: "var(--grid-gutter)",
				description: "Gap between panes.",
			},
		],
		tokensUsed: [],
		examples: [
			{
				label: "Media + detail",
				code: '<SplitPane ratio="2/1" primary={<AspectBox ratio={1}><img src={post.imageUrl} alt={post.title} className="size-full object-cover" /></AspectBox>} secondary={<Stack gap={2}><h1 className="text-heading-1">{post.title}</h1><p className="text-body-md text-muted-foreground">{post.description}</p><Button>Add to cart</Button></Stack>} />',
			},
		],
	},
	{
		name: "SafeArea",
		summary:
			"Pads for device safe-areas (notch, home indicator) on fixed or native-shell surfaces. Wrap fixed bars; content in normal flow rarely needs it.",
		status: "stable",
		props: [
			{
				name: "edges",
				type: '("top" | "bottom" | "left" | "right")[]',
				default: "all four",
				description: "Which edges get env(safe-area-inset-*) padding.",
			},
		],
		tokensUsed: [],
		examples: [
			{
				label: "Fixed bottom bar",
				code: '<SafeArea edges={["bottom"]} className="fixed inset-x-0 bottom-0 bg-card border-t border-border"><Row gap={2} justify="between" className="p-3"><span className="text-label-md">1 item selected</span><Button size="sm">Continue</Button></Row></SafeArea>',
			},
		],
	},
	{
		name: "GridOverlay",
		summary:
			"Dev/docs structure visualizer — overlays the column grid so the layout skeleton is legible. Place inside a position:relative container; never ships in product UI.",
		status: "stable",
		props: [
			{
				name: "columns",
				type: "number",
				default: "12",
				description: "Number of column bands.",
			},
			{
				name: "gap",
				type: "string",
				default: "var(--grid-gutter)",
				description: "Gap between bands.",
			},
			{
				name: "inset",
				type: "boolean",
				default: "true",
				description: "Align bands to the fluid page inset.",
			},
			{
				name: "show",
				type: "boolean",
				default: "true",
				description: "Toggle visibility.",
			},
		],
		tokensUsed: [],
		examples: [
			{
				label: "Debugging a layout",
				code: '<div className="relative"><GridOverlay show={debug} /><Columns count={12}><Col span={8}><Card><CardContent><p className="text-body-md">Main</p></CardContent></Card></Col><Col span={4}><Card><CardContent><p className="text-body-md">Rail</p></CardContent></Card></Col></Columns></div>',
			},
		],
	},
]
