import {
	Bleed,
	Col,
	Columns,
	Grid,
	GridOverlay,
	Icon,
	Page,
	Sidebar,
	SidebarItem,
	SidebarNav,
	SplitPane,
	Stack,
} from "@sableui/react"
import type { ReactNode } from "react"
import { InlineCode, PageHeader, Section } from "../components/docs-ui"

function Box({ children }: { children: ReactNode }) {
	return (
		<div className="text-label-md rounded-md bg-secondary py-3 text-center text-secondary-foreground">
			{children}
		</div>
	)
}

// Default-theme caps (DESIGN.md → content-width scale), drawn to scale.
const widths = [
	{ name: "form", px: 480, token: "--region-form" },
	{ name: "feed", px: 640, token: "--region-feed" },
	{ name: "content", px: 896, token: "--region-content" },
	{ name: "wide", px: 1280, token: "--region-wide" },
	{ name: "full", px: 1536, token: "--region-full" },
]

export function GridLayoutPage() {
	return (
		<>
			<PageHeader
				eyebrow="Foundations"
				title="Grid & layout"
				lede="Pages run edge to edge with a margin that grows with the window. Everything inside lines up to a 12-column grid and an 8px rhythm."
			/>

			<Section
				title="The column grid"
				description="Twelve columns that fold to 6, 4, 2 and 1 as the screen narrows."
			>
				<div className="relative min-h-[160px] overflow-hidden rounded-lg border border-border bg-card">
					<GridOverlay inset={false} />
				</div>
			</Section>

			<Section title="Columns and spans">
				<Stack gap={1.5}>
					<Columns>
						<Col span={6}>
							<Box>6</Box>
						</Col>
						<Col span={6}>
							<Box>6</Box>
						</Col>
					</Columns>
					<Columns>
						<Col span={4}>
							<Box>4</Box>
						</Col>
						<Col span={4}>
							<Box>4</Box>
						</Col>
						<Col span={4}>
							<Box>4</Box>
						</Col>
					</Columns>
					<Columns>
						<Col span={8}>
							<Box>8</Box>
						</Col>
						<Col span={4}>
							<Box>4</Box>
						</Col>
					</Columns>
				</Stack>
			</Section>

			<Section
				title="Responsive spans"
				description="Resize the window. Stacked on mobile, 8 and 4 on tablet, 7 and 5 on desktop."
			>
				<Columns>
					<Col span={{ base: 12, md: 8, lg: 7 }}>
						<Box>Main</Box>
					</Col>
					<Col span={{ base: 12, md: 4, lg: 5 }}>
						<Box>Side</Box>
					</Col>
				</Columns>
			</Section>

			<Section
				title="A grid that breathes"
				description="Cells wrap to fit the space, with no breakpoints."
			>
				<Grid minItemWidth="11rem">
					{Array.from({ length: 6 }, (_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static demo cells
						<Box key={i}>Cell</Box>
					))}
				</Grid>
			</Section>

			<Section
				title="Sparse results keep their size"
				description="With fewer items than fit a row, the grid keeps its empty columns (track=&quot;fill&quot;, the default), so one search result is one cell wide. track=&quot;fit&quot; collapses them and stretches the items across the row: right for a fixed set built to span it, wrong for anything whose count is data."
			>
				<Stack gap={2}>
					<span className="text-label-md text-muted-foreground">track="fill" (default)</span>
					<Grid minItemWidth="11rem">
						<Box>Result</Box>
						<Box>Result</Box>
					</Grid>
					<span className="mt-2 text-label-md text-muted-foreground">track="fit"</span>
					<Grid minItemWidth="11rem" track="fit">
						<Box>Stretched</Box>
						<Box>Stretched</Box>
					</Grid>
				</Stack>
			</Section>

			<Section
				title="Responsive column count"
				description="Two up on mobile, three on small screens, six on desktop."
			>
				<Grid cols={{ base: 2, sm: 3, lg: 6 }} gap={1.5}>
					{Array.from({ length: 6 }, (_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static demo cells
						<Box key={i}>Cell</Box>
					))}
				</Grid>
			</Section>

			<Section
				title="Split pane"
				description="Side by side when there is room, stacked when there is not."
			>
				<SplitPane
					collapseBelow="lg"
					ratio="3/2"
					primary={<Box>Primary</Box>}
					secondary={<Box>Secondary</Box>}
				/>
			</Section>

			<Section
				title="Content widths"
				description="A page picks a width for its job, not a fixed column for everything."
			>
				<div className="grid gap-2 rounded-lg border border-border bg-card p-4">
					{widths.map((w) => (
						<div key={w.name} className="grid gap-1">
							<div
								className="h-6 rounded-sm bg-highlight/20"
								style={{ width: `${(w.px / 1536) * 100}%` }}
							/>
							<div className="flex items-center gap-2">
								<span className="text-label-md">{w.name}</span>
								<span className="text-mono-sm text-muted-foreground">{w.px}px</span>
							</div>
						</div>
					))}
				</div>
			</Section>

			<Section
				title="Bleed"
				description="Breaks out of the margin to run edge to edge, like a cover or a hero band."
			>
				<div
					className="relative overflow-hidden rounded-lg border border-border bg-card p-6"
					style={{ containerType: "inline-size" }}
				>
					<p className="text-body-sm text-muted-foreground">Inset content.</p>
					<Bleed className="my-3">
						<div className="text-body-sm bg-highlight/15 py-4 text-center text-foreground">
							Full-bleed band
						</div>
					</Bleed>
					<p className="text-body-sm text-muted-foreground">Inset content.</p>
				</div>
			</Section>

			<Section
				title="Page shell"
				description="A centered column with even spacing between sections."
			>
				<div className="rounded-lg border border-border bg-card py-4">
					<Page max="prose" gap={3}>
						<Box>Section</Box>
						<Box>Section</Box>
						<Box>Section</Box>
					</Page>
				</div>
			</Section>

			<Section
				title="Sidebar and content"
				description="The sidebar sits outside the grid. A bleed in the content stops at the rail."
			>
				<div className="overflow-hidden rounded-lg border border-border">
					<div className="flex h-72">
						<Sidebar className="!static !flex !h-full">
							<SidebarNav>
								<SidebarItem icon={<Icon name="user" />} label="Profile" active />
								<SidebarItem icon={<Icon name="gear" />} label="Settings" />
							</SidebarNav>
						</Sidebar>
						<div
							className="min-w-0 flex-1 p-4"
							style={{ containerType: "inline-size" }}
						>
							<p className="text-body-sm text-muted-foreground">Content area.</p>
							<Bleed className="my-3">
								<div className="text-body-sm bg-highlight/15 py-3 text-center text-foreground">
									Bleed, beside the rail
								</div>
							</Bleed>
							<p className="text-body-sm text-muted-foreground">More content.</p>
						</div>
					</div>
				</div>
			</Section>

			<Section
				title="Page margin"
				description="The margin grows with the window instead of centering a fixed column."
			>
				<div
					className="rounded-lg border border-border bg-card"
					style={{ paddingInline: "var(--page-inset)" }}
				>
					<div className="text-body-sm rounded-md bg-highlight/15 py-4 text-center text-foreground">
						<InlineCode>--page-inset</InlineCode>
					</div>
				</div>
			</Section>

			<Section title="Vertical rhythm" description="Vertical spacing steps in 8px.">
				<Stack gap={1}>
					{[6, 5, 4, 3].map((w) => (
						<div
							key={w}
							className="h-2 rounded-sm bg-foreground/80"
							style={{ width: `${w * 10}%` }}
						/>
					))}
				</Stack>
			</Section>
		</>
	)
}
