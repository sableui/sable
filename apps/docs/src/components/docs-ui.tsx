import {
	BreadcrumbItem,
	BreadcrumbLink,
	Breadcrumbs,
	BreadcrumbSeparator,
	Button,
	ButtonGroup,
	CodeBlock,
	Collapsible,
	CollapsibleIndicator,
	CollapsiblePanel,
	CollapsibleTrigger,
	Icon,
	Menu,
	MenuContent,
	MenuItem,
	MenuLinkItem,
	MenuSeparator,
	MenuTrigger,
	Note,
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
import { brandIconSet } from "@sableui/react/icons/brands"
import { type ReactNode, useContext, useState } from "react"
import { DESIGN_NOTES } from "../content/design-notes"
import { CATALOG_BY_SLUG } from "../lib/catalog"
import { markdownTwinFor } from "../lib/markdown-twins"
import { PREVIEWS } from "../lib/previews"
import site from "../site-meta.json"
import { CurrentRouteContext, PageTrailContext, hrefFor } from "../lib/router"
import { Playground } from "./Playground"
import { PreviewMotionMenu, PreviewMotionScope, PreviewReplayButton, usePreviewMotion } from "./preview-motion"

export function PageHeader({
	eyebrow,
	title,
	lede,
}: {
	eyebrow?: string
	title: string
	lede?: string
}) {
	const route = useContext(CurrentRouteContext)
	const trail = useContext(PageTrailContext)
	const twin = route ? markdownTwinFor(route) : null
	return (
		<>
			{/* No eyebrow; a breadcrumb instead. The sidebar says where a page
			    lives, but a reader on a direct link (or a narrow screen, where the
			    rail is a drawer) never sees it. The trail names the area and the
			    nav group; the group is text, since groups have no page of their own. */}
			{trail ? (
				<Breadcrumbs className="mb-3">
					<BreadcrumbItem>
						<BreadcrumbLink href={trail.area.href}>{trail.area.label}</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem className="text-muted-foreground">{trail.group}</BreadcrumbItem>
				</Breadcrumbs>
			) : null}
			{/* Sable's own PageHeader (its h1, its wrapping title), dogfooded; the
			    docs only set the measure, the space below, and a page-sized lede.
			    `eyebrow` is accepted for compatibility and ignored. */}
			<SablePageHeader
				title={title}
				description={lede}
				actions={twin ? <PageActions href={twin} /> : undefined}
				// The lede is set on the header's own paragraph, not a span of another
				// size inside it: two sizes in one line box make the line taller than
				// its line height.
				// The header spans the content column so its actions sit on the column's
				// edge; only the lede keeps the reading measure.
				className="mb-12 gap-2 pb-0 text-body-md [&>p]:max-w-(--measure-prose) [&>p]:text-body-md [&>p]:text-pretty"
				data-eyebrow={eyebrow ? "" : undefined}
			/>
		</>
	)
}

/**
 * Open a desktop app's deep link, falling back to its web URL.
 *
 * A page cannot ask which apps are installed, so this infers it: launching an
 * app takes focus from the page, and an unregistered scheme does nothing. No
 * blur within the window means no app, and the web URL opens instead. It is a
 * heuristic, and it errs toward opening the web: Chrome asks "Open Claude?"
 * the first time, and a confirm slower than the window opens both. The new tab
 * opens after the click, inside the browser's activation window (about five
 * seconds); if it is blocked anyway, this tab navigates rather than doing
 * nothing.
 */
function openPreferringDesktop(appUrl: string, webUrl: string, waitMs = 1500) {
	let left = false
	const onLeave = () => {
		left = true
	}
	window.addEventListener("blur", onLeave, { once: true })
	document.addEventListener("visibilitychange", onLeave, { once: true })
	// The probe navigates a hidden frame, never this tab: a browser that
	// answers an unregistered scheme with an error page (Firefox) would
	// otherwise unload the docs, and the web fallback with them.
	const probe = document.createElement("iframe")
	probe.hidden = true
	probe.src = appUrl
	document.body.append(probe)
	window.setTimeout(() => {
		probe.remove()
		window.removeEventListener("blur", onLeave)
		document.removeEventListener("visibilitychange", onLeave)
		if (left) return
		// Not the "noopener" feature: with it, open() returns null even on
		// success, which reads as blocked and navigates this tab as well.
		const tab = window.open(webUrl, "_blank")
		if (tab) tab.opener = null
		else window.location.href = webUrl
	}, waitMs)
}

/** What a new Sable app runs first; the menu hands it over with the page. */
const SETUP_COMMAND = "pnpm add @sableui/react && pnpm exec sable init"

/**
 * The page, handed to an agent: copy it as markdown, open the file, or start a
 * chat that reads it. A split button, so the common action is one click and
 * the rest sit one click behind the chevron.
 *
 * The file is fetched on click, not on every page view; `useCopy` hands the
 * pending text to the clipboard inside the click. A dev server answers a
 * missing file with the app's HTML, so anything that is not markdown fails the
 * copy rather than putting a page of HTML on the clipboard.
 *
 * The chat links name the public URL, never this tab's origin: an assistant
 * cannot read a localhost page, and the published twin is the same file.
 */
function PageActions({ href }: { href: string }) {
	const { copy, copied } = useCopy(() =>
		fetch(href).then((response) =>
			response.ok && !response.headers.get("content-type")?.includes("text/html")
				? response.text()
				: Promise.reject(new Error(`${href}: ${response.status}`)),
		),
	)
	const setup = useCopy(SETUP_COMMAND)
	const ask = encodeURIComponent(`Read ${site.origin.replace(/\/+$/, "")}${href} so I can ask questions about it.`)
	const claudeMark = brandIconSet({ name: "claude", variant: "brands", title: "" })
	return (
		<ButtonGroup aria-label="Page actions">
			<Button variant="outline" size="sm" iconStart={<Icon name={copied ? "check" : "copy"} />} onClick={copy}>
				{copied ? "Copied" : "Copy page"}
			</Button>
			<Menu>
				<MenuTrigger render={<Button variant="outline" size="icon-sm" aria-label="More page actions" />}>
					<Icon name="chevron-down" />
				</MenuTrigger>
				<MenuContent align="end" className="w-80">
					<MenuItem icon={<Icon name="copy" />} description="Copy page as Markdown for LLMs" onClick={copy}>
						Copy page
					</MenuItem>
					<MenuLinkItem icon={<Icon name="file" />} description="View this page as plain text" href={href} target="_blank">
						View as Markdown
					</MenuLinkItem>
					<MenuSeparator />
					<MenuLinkItem
						icon={<Icon name="comment" />}
						description="Ask questions about this page"
						href={`https://chatgpt.com/?hints=search&q=${ask}`}
						target="_blank"
					>
						Open in ChatGPT
					</MenuLinkItem>
					<MenuLinkItem
						icon={claudeMark}
						description="Ask questions about this page"
						href={`https://claude.ai/new?q=${ask}`}
						target="_blank"
						onClick={(event) => {
							// A plain click tries the desktop app first; a modified click
							// (new tab, new window) is the user choosing the web, so it
							// stays an ordinary link.
							if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
							event.preventDefault()
							openPreferringDesktop(`claude://claude.ai/new?q=${ask}`, `https://claude.ai/new?q=${ask}`)
						}}
					>
						Open in Claude
					</MenuLinkItem>
					<MenuSeparator />
					<MenuItem
						icon={<Icon name={setup.copied ? "check" : "download"} />}
						description="Install Sable and connect your agent"
						onClick={setup.copy}
					>
						Copy setup command
					</MenuItem>
				</MenuContent>
			</Menu>
		</ButtonGroup>
	)
}

export function Section({
	id,
	title,
	description,
	children,
}: {
	/** An anchor (`/page#id`): the search palette lands on sections that have one. */
	id?: string
	title: string
	description?: string
	children: ReactNode
}) {
	return (
		<section id={id} className="mt-14 scroll-mt-24 first:mt-0">
			{/* Sable's own SectionHeader, dogfooded; the docs set the measure, the
			    space below, and a reading-size description. */}
			<SectionHeader
				size="sm"
				title={title}
				description={description}
				className="mb-6 max-w-(--measure-prose) [&>p]:text-body-md"
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
 * A frame with code also carries the preview's motion level (see
 * preview-motion), with the copy button, on the Preview tab only. Replay is
 * opt-in (`replayable` or `onReplay`) and sits beside it: only a preview that
 * plays something on its own has anything to replay. A code-less frame puts
 * the same controls in its top-right corner.
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
	replayable = false,
	motionControl,
}: {
	children: ReactNode
	code?: string
	className?: string
	flush?: boolean
	/**
	 * A time-based demo that restarts itself (a stream, a sequence of steps):
	 * Replay calls this instead of remounting the preview. Implies `replayable`.
	 */
	onReplay?: () => void
	/**
	 * Offer Replay, which remounts the preview so its arrival plays again. Only
	 * for a preview that plays something on its own — a chart drawing on, a
	 * reveal. A demo that moves only when the reader acts has nothing to replay.
	 */
	replayable?: boolean
	/**
	 * Offer the per-preview motion level. On by default for a frame with code
	 * or Replay; a code-less frame asks for it with `motionControl`. Off for a
	 * demo that sets its own levels (the Motion page's side-by-side), where a
	 * scope around both halves would only confuse the comparison.
	 */
	motionControl?: boolean
}) {
	const { copy, copied } = useCopy(code ?? "")
	const motion = usePreviewMotion()
	const [tab, setTab] = useState("preview")
	const replay = onReplay ?? (replayable ? motion.replay : undefined)
	const leveled = motionControl ?? Boolean(code || replay)
	// A caller's onReplay re-keys its own demo; only the generic replay re-keys here.
	const preview = leveled ? (
		<PreviewMotionScope level={motion.level} replayKey={onReplay ? 0 : motion.replayKey}>
			{children}
		</PreviewMotionScope>
	) : (
		children
	)
	const menu = leveled ? <PreviewMotionMenu level={motion.level} onLevelChange={motion.setLevel} /> : null
	const replayButton = replay ? <PreviewReplayButton onReplay={replay} /> : null
	// A code-less frame has no header, so its controls sit in the corner.
	const corner = !code && (menu || replayButton)
	const stage = (
		<div
			className={cn(
				"relative",
				flush
					? "bg-background"
					: "flex min-h-40 flex-wrap items-center justify-center gap-4 bg-background p-6 md:p-10",
				// Room for the corner control, so it never sits on the demo.
				corner && !flush && "pt-16 md:pt-16",
				className,
			)}
		>
			{corner ? (
				<div className="absolute end-3 top-3 z-10 flex items-center gap-1">
					{menu}
					{replayButton}
				</div>
			) : null}
			{preview}
		</div>
	)
	if (!code) return <div data-docs-example className="overflow-hidden rounded-xl border border-border">{stage}</div>
	// Preview first, code one click away — browsing stays visual, and the code is
	// still the same copyable CodeBlock (copy lives in the header, both tabs).
	return (
		<Tabs
			data-docs-example
			value={tab}
			onValueChange={(next) => setTab(String(next))}
			className="overflow-hidden rounded-xl border border-border"
		>
			<div className="flex items-center justify-between gap-2 border-b border-border px-2 py-2">
				{/* Pill tabs take the theme's button shape, so they match the
				    buttons in the preview below and follow Customize's Button shape. */}
				<TabsList variant="pill">
					<TabsTrigger value="preview">Preview</TabsTrigger>
					<TabsTrigger value="code">Code</TabsTrigger>
				</TabsList>
				<div className="flex items-center gap-1">
					{/* Preview-only controls leave with the preview: on the Code tab
					    they would act on something the reader cannot see. */}
					{tab === "preview" ? (
						<>
							{menu}
							{replayButton}
						</>
					) : null}
					<Button variant="ghost" size="icon-sm" aria-label="Copy code" onClick={copy} className="text-muted-foreground">
						<Icon name={copied ? "check" : "copy"} />
					</Button>
				</div>
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
				replayable={entry.replayable}
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
			{resolvedMeta.composition ? (
				<Section title="A reference layout">
					<Note tone="info" className="max-w-(--measure-prose)">
						{componentLabel(meta.name)} is a designed arrangement, not a behaviour. Use it when its layout fits your
						product. When it doesn't, compose your own from {resolvedMeta.composition}: that is the intended path, not a
						workaround.
					</Note>
				</Section>
			) : null}

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
