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
import { useMeasured } from "../customizer/Readouts"

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

const RHYTHM_ROWS = [
	{ label: "Baseline", short: "Line", token: "--baseline" },
	{ label: "Baseline step", short: "Step", token: "--baseline-step" },
]

/** The line and its steps, measured live, so a Character drag shows them move. */
function RhythmSteps() {
	const [line, step] = useMeasured(RHYTHM_ROWS)
	return (
		<Stack gap={2}>
			<p className="text-body-sm text-muted-foreground">
				Line <span className="text-mono-sm text-foreground">{line ?? "—"}px</span> · step{" "}
				<span className="text-mono-sm text-foreground">{step ?? "—"}px</span>
			</p>
			<Stack gap={1}>
				{[1, 2, 3, 6].map((n) => (
					<div key={n} className="flex items-center gap-3">
						<div className="rounded-sm bg-foreground/80" style={{ height: "var(--baseline-step)", width: `calc(var(--baseline-step) * ${n * 4})` }} />
						<span className="text-mono-sm text-muted-foreground">
							{n} {n === 1 ? "step" : "steps"}
						</span>
					</div>
				))}
			</Stack>
		</Stack>
	)
}

export function GridLayoutPage() {
	return (
		<>
			<PageHeader
				eyebrow="Foundations"
				title="Grid & layout"
				lede="Pages run edge to edge with a margin that grows with the window. Multi-column content lines up to a 12-column grid, and vertical space is measured in lines of body text."
			/>

			<Section
				title="The column grid"
				description="Twelve columns, used inside a region for content that has to line up across rows. They fold where you say: pass a breakpoint map, like cols={{ base: 1, md: 6, lg: 12 }}."
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

			<Section
				title="Vertical rhythm"
				description="Spacing is measured from the type. One line of body text is the baseline, split into three steps; line heights round to a step and the spacing scale is half of one, so gaps and text grow together. Compact ↔ Airy in Customize changes the leading, and everything follows."
			>
				<RhythmSteps />
			</Section>
		</>
	)
}
