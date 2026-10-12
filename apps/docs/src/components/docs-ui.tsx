import {
	Button,
	CodeBlock,
	Collapsible,
	CollapsibleIndicator,
	CollapsiblePanel,
	CollapsibleTrigger,
	Icon,
	PageHeader as SablePageHeader,
	SectionHeader,
	Tabs,
	TabsList,
	TabsPanel,
	TabsTrigger,
	useCopy,
	cn,
	componentGuidance,
	componentLabel,
	componentSlug,
} from "@sableui/react"
import type { ComponentMeta } from "@sableui/react"
import type { ReactNode } from "react"
import { DESIGN_NOTES } from "../content/design-notes"
import { CATALOG_BY_SLUG } from "../lib/catalog"
import { PREVIEWS } from "../lib/previews"
import { hrefFor } from "../lib/router"
import { Playground } from "./Playground"

export function PageHeader({
	eyebrow,
	title,
	lede,
}: {
	eyebrow?: string
	title: string
	lede?: string
}) {
	return (
		// No eyebrow: a page starts with its title (the sidebar already says
		// where you are). `eyebrow` is accepted for compatibility and ignored.
		// Sable's own PageHeader (its h1, its wrapping title), dogfooded; the docs
		// only set the measure, the space below, and a page-sized lede.
		<SablePageHeader
			title={title}
			description={lede ? <span className="text-body-md text-pretty">{lede}</span> : undefined}
			className="mb-12 max-w-(--measure-prose) gap-3 pb-0 text-body-md"
			data-eyebrow={eyebrow ? "" : undefined}
		/>
	)
}

export function Section({
	title,
	description,
	children,
}: {
	title: string
	description?: string
	children: ReactNode
}) {
	return (
		<section className="mt-14 first:mt-0">
			{/* Sable's own SectionHeader, dogfooded; the docs set the measure, the
			    space below, and a reading-size description. */}
			<SectionHeader
				size="sm"
				title={title}
				description={description ? <span className="text-body-md">{description}</span> : undefined}
				className="mb-5 max-w-(--measure-prose)"
			/>
			{/* Stacked with one gap, so consecutive examples never touch. Example
			    applies its className to the stage INSIDE its frame, so a margin
			    passed to it spaced the content, not the boxes. */}
			<div className="docs-section-body grid min-w-0 gap-4">{children}</div>
		</section>
	)
}

/**
 * A live demo frame with an optional code caption beneath.
 *
 * The caption is Sable's own `CodeBlock` — which brings the copy affordance
 * with it. The docs shipped a hand-rolled `<pre>` here for a long time while
 * documenting a copy button two routes away, so the one page in the world that
 * exists to demonstrate the component was the one page not using it. Anything
 * the caption needs (a filename bar, a different scroll cap) belongs in
 * `CodeBlock`, where consumers get it too.
 *
 * `rounded-none border-0 border-t` is a seam override, not a restyle: the frame
 * already owns the outer radius and border, so the block joins it flush.
 */
export function Example({
	children,
	code,
	className,
	flush = false,
	onReplay,
}: {
	children: ReactNode
	code?: string
	className?: string
	flush?: boolean
	/**
	 * A time-based demo (an entrance, an exit, a draw-on) plays once on its own;
	 * this puts the one way to see it again in the frame's top-right corner, so
	 * every demo on every page replays from the same place with the same label.
	 */
	onReplay?: () => void
}) {
	const { copy, copied } = useCopy(code ?? "")
	const stage = (
		<div
			className={cn(
				"relative",
				flush
					? "bg-background"
					: "flex min-h-40 flex-wrap items-center justify-center gap-4 bg-background p-6 md:p-10",
				// Room for the corner control, so it never sits on the demo.
				onReplay && !flush && "pt-16 md:pt-16",
				className,
			)}
		>
			{onReplay ? (
				<Button variant="secondary" size="xs" iconStart={<Icon name="refresh" />} onClick={onReplay} className="absolute end-3 top-3">
					Replay
				</Button>
			) : null}
			{children}
		</div>
	)
	if (!code) return <div data-docs-example className="overflow-hidden rounded-xl border border-border">{stage}</div>
	// Preview first, code one click away — browsing stays visual, and the code is
	// still the same copyable CodeBlock (copy lives in the header, both tabs).
	return (
		<Tabs data-docs-example defaultValue="preview" className="overflow-hidden rounded-xl border border-border">
			<div className="flex items-center justify-between gap-2 border-b border-border px-2 py-2">
				{/* Pill tabs take the theme's button shape, so they match the
				    buttons in the preview below and follow Customize's Button shape. */}
				<TabsList variant="pill">
					<TabsTrigger value="preview">Preview</TabsTrigger>
					<TabsTrigger value="code">Code</TabsTrigger>
				</TabsList>
				<Button variant="ghost" size="icon-sm" aria-label="Copy code" onClick={copy} className="text-muted-foreground">
					<Icon name={copied ? "check" : "copy"} />
				</Button>
			</div>
			<TabsPanel value="preview" className="pt-0">
				{stage}
			</TabsPanel>
			<TabsPanel value="code" className="pt-0">
				<CodeBlock code={code} showCopy={false} className="max-h-[28rem] rounded-none border-0" />
			</TabsPanel>
		</Tabs>
	)
}

/**
 * The playground for a component, if one is registered — otherwise nothing.
 *
 * Rendering nothing rather than a "playground coming soon" panel is the same
 * rule the Playground page follows: the docs never advertise a surface that
 * does not work. Registering a preview in `lib/previews.tsx` lights this up on
 * the component's page and in the gallery at the same time.
 */
export function ComponentPlayground({ meta }: { meta: ComponentMeta }) {
	const entry = PREVIEWS[componentSlug(meta.name)]
	if (!entry) return null
	return (
		<Section
			title="Playground"
			description="Try the options live."
		>
			<Playground
				meta={entry.meta}
				render={entry.render}
				only={entry.only}
				initial={entry.initial}
				controls={entry.controls}
				text={entry.text}
				stageClassName={entry.stageClassName}
				fixed={entry.fixed}
				slots={entry.slots}
				snippet={entry.snippet}
			/>
		</Section>
	)
}

export function InlineCode({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<code className={cn("text-mono-sm rounded bg-muted px-1.5 py-0.5", className)}>
			{children}
		</code>
	)
}

function MetaCode({ children }: { children: ReactNode }) {
	return <code className="text-mono-sm text-muted-foreground">{children}</code>
}

/** Shared scaffold for the props / subcomponents tables — one styling source. */
function MetaTable({
	head,
	rows,
}: {
	head: string[]
	rows: { key: string; cells: ReactNode[] }[]
}) {
	return (
		<div className="overflow-x-auto scrollbar-quiet rounded-lg border border-border">
			<table className="w-full text-left">
				<thead>
					<tr className="border-b border-border bg-muted/40">
						{head.map((h) => (
							<th key={h} className="text-label-md text-muted-foreground p-3">
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((r) => (
						<tr
							key={r.key}
							className="border-b border-border align-top last:border-0"
						>
							<td className="text-title-sm whitespace-nowrap p-3">
								{r.cells[0]}
							</td>
							{r.cells.slice(1, -1).map((c, i) => (
								<td key={head[i + 1]} className="p-3">
									{c}
								</td>
							))}
							<td className="text-body-sm text-muted-foreground p-3">
								{r.cells[r.cells.length - 1]}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export function PropsTable({ meta }: { meta: ComponentMeta }) {
	return (
		<div className="grid gap-6">
			<MetaTable
				head={["Prop", "Type", "Default", "Description"]}
				rows={meta.props.map((p) => ({
					key: p.name,
					cells: [
						p.name,
						<MetaCode key="type">{p.type}</MetaCode>,
						<MetaCode key="default">{p.default ?? "—"}</MetaCode>,
						p.description,
					],
				}))}
			/>
			{meta.subcomponents?.length ? (
				<div>
					<p className="text-label-md text-muted-foreground mb-2">
						Subcomponents — composed as JSX children, not props
					</p>
					<MetaTable
						head={["Component", "Props", "Description"]}
						rows={meta.subcomponents.map((s) => ({
							key: s.name,
							cells: [
								s.name,
								<MetaCode key="type">{s.type}</MetaCode>,
								s.description,
							],
						}))}
					/>
				</div>
			) : null}
		</div>
	)
}

function MetaPanel({
	title,
	children,
	className,
}: {
	title: string
	children: ReactNode
	className?: string
}) {
	return (
		<div
			className={cn(
				"rounded-lg border border-border bg-background p-4 md:p-5",
				className,
			)}
		>
			<h3 className="text-title-sm mb-3">{title}</h3>
			{children}
		</div>
	)
}

function PracticeList({
	title,
	tone,
	items,
}: {
	title: string
	tone: "success" | "destructive"
	items: string[]
}) {
	if (!items.length) return null

	return (
		<div className="p-4 md:p-5">
			<h3
				className={cn(
					"text-title-sm mb-3",
					tone === "success" ? "text-success" : "text-destructive",
				)}
			>
				{title}
			</h3>
			<ul className="text-body-sm text-muted-foreground grid max-w-(--measure-prose) gap-2.5">
				{items.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</div>
	)
}

function MetaPills({ items }: { items: string[] }) {
	if (!items.length) {
		return (
			<p className="text-body-sm text-muted-foreground">
				No semantic tokens read directly.
			</p>
		)
	}

	return (
		<div className="flex flex-wrap gap-1.5">
			{items.map((item) => (
				<code
					key={item}
					className="text-mono-sm rounded bg-muted px-1.5 py-0.5 text-muted-foreground"
				>
					{item}
				</code>
			))}
		</div>
	)
}

function resolveMeta(meta: ComponentMeta): ComponentMeta {
	const guidance = componentGuidance[meta.name]
	return {
		...meta,
		keywords: meta.keywords ?? guidance?.keywords,
		usage: meta.usage ?? guidance?.usage,
		related: meta.related ?? guidance?.related,
	}
}

/**
 * The lede for a component page: when to reach for it, in plain words.
 *
 * The meta's `summary` and `usage` are written for the agent. The site reads
 * its own designer notes first and falls back to the meta only for a
 * component that has none yet.
 */
export function ledeFor(meta: ComponentMeta): string {
	return (
		DESIGN_NOTES[componentSlug(meta.name)]?.intro ??
		resolveMeta(meta).usage?.description ??
		meta.summary
	)
}

/**
 * Everything below the examples: do / don't, related components, and the
 * technical reference folded into one closed disclosure.
 *
 * The props, anatomy, tokens and accessibility notes are the same contract the
 * agent reads from the registry. A designer browsing the catalog does not need
 * them open, so they stay one click away instead of filling the page.
 */
export function MetaFooter({ meta }: { meta: ComponentMeta }) {
	const resolvedMeta = resolveMeta(meta)
	const notes = DESIGN_NOTES[componentSlug(meta.name)]
	const bestPractices = resolvedMeta.usage?.bestPractices ?? []
	const dos =
		notes?.do ??
		bestPractices.filter((p) => p.guidance === "do").map((p) => p.description)
	const donts =
		notes?.dont ??
		bestPractices.filter((p) => p.guidance === "dont").map((p) => p.description)
	// Only names with a page: related lists can mention families (Field) that
	// are not their own catalog entry, and a link to nowhere is worse than none.
	const related = (resolvedMeta.related?.components ?? []).filter(
		(name) => CATALOG_BY_SLUG[componentSlug(name)],
	)

	return (
		<>
			{dos.length || donts.length ? (
				<Section title="Do's and don'ts">
					<div className="overflow-hidden rounded-xl border border-border bg-background">
						<div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
							<PracticeList title="Do" tone="success" items={dos} />
							<PracticeList title="Don't" tone="destructive" items={donts} />
						</div>
					</div>
				</Section>
			) : null}

			{related.length ? (
				<Section title="Related">
					<div className="flex flex-wrap gap-2">
						{related.map((name) => (
							<Button
								key={name}
								variant="outline"
								size="sm"
								render={<a href={hrefFor(componentSlug(name))} />}
							>
								{componentLabel(name)}
							</Button>
						))}
					</div>
				</Section>
			) : null}

			<DeveloperDetails meta={resolvedMeta} />
		</>
	)
}

function DeveloperDetails({ meta }: { meta: ComponentMeta }) {
	return (
		<Collapsible className="mt-14 rounded-xl border border-border">
			<CollapsibleTrigger className="group/collapsible flex w-full items-center justify-between gap-4 rounded-xl px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
				<span>
					<span className="text-title-lg block">Developer details</span>
					<span className="text-body-sm text-muted-foreground block">
						Props, parts, tokens and accessibility
					</span>
				</span>
				<CollapsibleIndicator className="text-sm" />
			</CollapsibleTrigger>
			<CollapsiblePanel>
				<div className="grid gap-8 border-t border-border p-5">
					<DetailBlock title="Props">
						<PropsTable meta={meta} />
					</DetailBlock>
					{meta.usage?.anatomy?.length ? (
						<DetailBlock title="Parts">
							<MetaTable
								head={["Part", "Required", "Description"]}
								rows={meta.usage.anatomy.map((part) => ({
									key: part.name,
									cells: [
										part.name,
										<MetaCode key="required">
											{part.required ? "yes" : "optional"}
										</MetaCode>,
										part.description,
									],
								}))}
							/>
						</DetailBlock>
					) : null}
					<div className="grid gap-4 md:grid-cols-2">
						<MetaPanel title="Tokens used">
							<MetaPills items={meta.tokensUsed} />
						</MetaPanel>
						{meta.a11y?.length ? (
							<MetaPanel title="Accessibility">
								<ul className="text-body-sm text-muted-foreground max-w-(--measure-prose) space-y-1.5">
									{meta.a11y.map((a) => (
										<li key={a}>{a}</li>
									))}
								</ul>
							</MetaPanel>
						) : null}
					</div>
				</div>
			</CollapsiblePanel>
		</Collapsible>
	)
}

function DetailBlock({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div>
			<h3 className="text-title-sm mb-3">{title}</h3>
			{children}
		</div>
	)
}
