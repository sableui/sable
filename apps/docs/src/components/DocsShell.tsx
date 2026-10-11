import {
	AppHeader,
	AppShell,
	Button,
	type CommandItem,
	CommandMenu,
	CommandMenuTrigger,
	cn,
	Icon,
	Pill,
	Region,
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
	Sidebar,
	SidebarNav,
	SideNav,
	type SideNavActiveVariant,
	SideNavGroup,
	SideNavItem,
} from "@sableui/react"
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { CATALOG_BY_SLUG, SEARCH_DOCS } from "../lib/catalog"
import { SableLogo } from "./SableLogo"
import { GitHubLink } from "./GitHubLink"
import { hrefFor, navigate } from "../lib/router"
import { makeDocsFilter } from "../lib/search"
import { Inspector } from "../customizer/Inspector"
import { useCustomizer } from "../customizer/CustomizerProvider"
import { WIDE, useMediaQuery } from "../lib/use-media-query"


export interface NavItem {
	slug: string
	label: string
	/**
	 * Extra search terms for pages the registry knows nothing about. Component
	 * rows get theirs from `SEARCH_DOCS`; a Foundations page has no meta, so
	 * "spacing" would never find Dimensions without this.
	 */
	keywords?: string[]
}
export interface NavSection {
	title: string
	items: NavItem[]
}

/**
 * A top-level area of the docs.
 *
 * The rail used to carry every section at once: ten Foundations pages, one
 * Patterns page, one References page, and 110 components in a single scroll.
 * The catalog is 90% of that list and 10% of what a first-time reader needs, so
 * everything else was effectively hidden behind it. Areas cut the rail down to
 * the one thing you are currently doing; the ⌘K palette still searches all of
 * them, so nothing became harder to reach.
 */
export interface NavArea {
	id: string
	label: string
	/** Where the top-bar link goes. */
	home: string
	sections: NavSection[]
}

/**
 * The Sable logo — goes home. Reused in the top bar + the mobile header.
 * SableLogo is the home link: the S, which turns into the sable character on
 * hover or keyboard focus (see components/SableLogo.tsx).
 */
function Brand() {
	return <SableLogo />
}

/**
 * The desktop top bar — brand, area nav, theme controls.
 *
 * Sable ships no desktop header: `AppHeader` is explicitly the mobile bar
 * (`lg:hidden`) and `Sidebar` is the whole of the desktop chrome. That is the
 * right default for an app with one navigational axis, and the wrong one for a
 * documentation site with four. It lives here rather than in the library until
 * a second consumer wants it — at which point the rail's `lg:top` offset below
 * is the part worth generalising, since a top bar that a sticky full-height
 * sidebar slides under is the failure mode any consumer would hit first.
 */
function TopBar({
	areas,
	activeArea,
	search,
	actions,
}: {
	areas: NavArea[]
	activeArea: string
	/** Centred between the sections and the actions. */
	search: ReactNode
	actions: ReactNode
}) {
	return (
		// No border: the header is separated by a translucent, blurred surface
		// rather than a rule, so content scrolling under it stays legible and the
		// page reads as one plane instead of three boxed regions.
		<header className="sticky top-0 z-(--z-nav) hidden h-[var(--nav-height,56px)] w-full shrink-0 bg-background/80 backdrop-blur-md lg:flex lg:items-center">
			{/* Three columns with equal outer tracks, so search sits on the page's
			    true centre however wide the sections or actions grow. */}
			<div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-6 px-5">
				<div className="flex items-center gap-6">
					<Brand />
					<nav aria-label="Sections" className="flex items-center gap-0.5">
						{areas.map((area) => {
							const active = area.id === activeArea
							return (
								<a
									key={area.id}
									href={hrefFor(area.home)}
									onClick={(event) => {
										if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
										event.preventDefault()
										navigate(area.home)
									}}
									aria-current={active ? "page" : undefined}
									className={cn(
										"flex h-8 items-center rounded-sm px-3 text-body-sm motion-interactive",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
										active
											? "bg-muted text-foreground"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									<span className="sable-label-trim">{area.label}</span>
								</a>
							)
						})}
					</nav>
				</div>
				{search}
				<div className="flex items-center justify-end gap-1">{actions}</div>
			</div>
		</header>
	)
}

/** The area nav for the mobile drawer, where the top bar is not rendered. */
function AreaSwitcher({
	areas,
	activeArea,
	onSelect,
}: {
	areas: NavArea[]
	activeArea: string
	onSelect: (home: string) => void
}) {
	return (
		<nav aria-label="Sections" className="mb-4 flex flex-wrap gap-1.5">
			{areas.map((area) => (
				<Pill
					key={area.id}
					selected={area.id === activeArea}
					onClick={() => onSelect(area.home)}
				>
					{area.label}
				</Pill>
			))}
		</nav>
	)
}

/** Opens the Customize panel. */
function CustomizeToggle({ compact = false }: { compact?: boolean }) {
	const { open, setOpen } = useCustomizer()
	return (
		<Button
			variant={open ? "secondary" : "ghost"}
			size={compact ? "icon" : "sm"}
			aria-pressed={open}
			aria-label={compact ? "Customize" : undefined}
			onClick={() => setOpen(!open)}
		>
			{/* Text on desktop; the compact (mobile) button needs a glyph to exist. */}
			{compact ? <Icon name="gear" /> : "Customize"}
		</Button>
	)
}

/**
 * The browse nav: a search trigger + the grouped catalog, built with Sable's own
 * `SideNav` / `SideNavGroup` / `SideNavItem` (the grouped sub-nav primitive). Used
 * inside the desktop `Sidebar` rail and the mobile drawer alike.
 */
function DocsNav({
	sections,
	current,
	onSelect,
	onOpenSearch,
	activeVariant = "content",
	showSearch = true,
}: {
	sections: NavSection[]
	current: string
	onSelect: (slug: string) => void
	onOpenSearch: () => void
	activeVariant?: SideNavActiveVariant
	/** The desktop header carries search; the mobile drawer keeps its own. */
	showSearch?: boolean
}) {
	return (
		<div className="flex flex-col gap-4">
			{showSearch ? (
				// The drawer's own trigger. Its ⌘K listener and the top bar's are both
				// mounted while the drawer is open; the first claims the keystroke, so
				// it fires once.
				<CommandMenuTrigger size="sm" onOpen={onOpenSearch} />
			) : null}
			{/* gap-6 separates the groups; each SideNavGroup keeps its items tight. */}
			<SideNav className="gap-6" activeVariant={activeVariant}>
				{sections.map((section) => (
					<SideNavGroup key={section.title} label={section.title}>
						{section.items.map((item) => (
							<SideNavItem
								key={item.slug}
								label={item.label}
								active={current === item.slug}
								// A real link: crawlable, middle-clickable, copyable. The click
								// is still routed in-app (onSelect also closes the drawer).
								render={<a href={hrefFor(item.slug)} />}
								onClick={(event) => {
									if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
									event.preventDefault()
									onSelect(item.slug)
								}}
							/>
						))}
					</SideNavGroup>
				))}
			</SideNav>
		</div>
	)
}

export function DocsShell({
	areas,
	current,
	max = "content",
	bare = false,
	title,
	children,
}: {
	areas: NavArea[]
	current: string
	/**
	 * The homepage: the same header (so nothing jumps between home and docs),
	 * with no rail, no area marked current, and the page owning its full width
	 * and entrance.
	 */
	bare?: boolean
	/** Document title; defaults to the route's h1 followed by "— Sable". */
	title?: string
	/**
	 * Reading width for this route, named by ROLE.
	 *
	 * It used to be `max="64rem"` — a raw value, applied to every route at once.
	 * That is the exact thing `building-a-page.md` tells readers not to do
	 * ("width capped BY ROLE, never globally"), and the docs published that
	 * sentence while doing the opposite one component away. A raw value also
	 * opts the whole site out of theming: `--region-content` is 56rem in
	 * Sable and 960px in Ember, and a hardcoded 64rem ignores both.
	 *
	 * Prose routes take `content`; the catalog and playground take `wide`
	 * because a three-column grid of tiles is a different kind of surface.
	 */
	max?: "prose" | "form" | "feed" | "content" | "wide" | "full" | (string & {})
	children: ReactNode
}) {
	const [mobileOpen, setMobileOpen] = useState(false)
	const customizer = useCustomizer()
	const wide = useMediaQuery(WIDE)
	const [searchOpen, setSearchOpen] = useState(false)
	const routeContent = useRef<HTMLDivElement>(null)
	const previousRoute = useRef(current)
	useEffect(() => {
		const changed = previousRoute.current !== current
		previousRoute.current = current
		const content = routeContent.current
		if (!content) return
		const announce = () => {
			const heading = content.querySelector("h1")
			if (!heading) return false
			document.title = title ?? `${heading.textContent?.trim()} — Sable`
			if (changed) {
				heading.tabIndex = -1
				heading.focus({ preventScroll: true })
			}
			return true
		}
		if (announce()) return
		// A code-split route may still show its loading state when the effect runs.
		const observer = new MutationObserver(() => { if (announce()) observer.disconnect() })
		observer.observe(content, { childList: true, subtree: true })
		return () => observer.disconnect()
	}, [current, title])

	// Which area owns the current route. Falling back to the first area (rather
	// than to an empty rail) keeps an unknown slug — which App resolves to the
	// introduction — looking like the page it actually rendered.
	const activeArea = useMemo(() => {
		const owner = areas.find((area) =>
			area.sections.some((section) =>
				section.items.some((item) => item.slug === current),
			),
		)
		return owner ?? areas[0]
	}, [areas, current])

	const sections = activeArea.sections
	// An area that is a single page (Canvas) has nothing to browse: no rail.
	const rail = !bare && sections.flatMap((section) => section.items).length > 1
	const allSections = useMemo(
		() => areas.flatMap((area) => area.sections),
		[areas],
	)

	// Every nav entry becomes a command. Selecting one navigates and closes the
	// mobile drawer (the palette closes itself). Component rows carry their
	// summary as `detail`, which is what makes a widened search legible: a query
	// that matched on a keyword otherwise returns rows with no visible reason.
	// The palette searches EVERY area, not the visible rail — narrowing the rail
	// was the point, and a palette that narrowed with it would just move the
	// burial rather than fix it.
	const commandItems = useMemo<CommandItem[]>(
		() =>
			allSections.flatMap((section) =>
				section.items.map((item) => ({
					id: item.slug,
					group: section.title,
					label: item.label,
					detail: CATALOG_BY_SLUG[item.slug]?.summary,
					onSelect: () => {
						navigate(item.slug)
						setMobileOpen(false)
					},
				})),
			),
		[allSections],
	)

	// Searchable text per row: the registry's for components, the nav's own
	// keywords for the hand-listed pages.
	const haystacks = useMemo(() => {
		const map: Record<string, string> = { ...SEARCH_DOCS }
		for (const section of allSections) {
			for (const item of section.items) {
				if (map[item.slug]) continue
				map[item.slug] = [item.label, section.title, ...(item.keywords ?? [])]
					.join(" ")
					.toLowerCase()
			}
		}
		return map
	}, [allSections])

	const filter = useMemo(() => makeDocsFilter(haystacks), [haystacks])

	const openSearch = () => setSearchOpen(true)

	return (
		<AppShell
			header={
				<>
					<TopBar
						areas={areas}
						activeArea={bare ? "" : activeArea.id}
						search={
							// Also owns ⌘K / Ctrl+K for the whole site: the top bar is
							// mounted at every width (only hidden below lg), so the
							// shortcut works on mobile too.
							<CommandMenuTrigger size="sm" onOpen={openSearch} className="w-72" />
						}
						actions={
							<>
								<GitHubLink />
								<CustomizeToggle />
							</>
						}
					/>
					<AppHeader
						leading={
							// Mobile: a drawer holds the full nav + search trigger.
							<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
								<SheetTrigger
									render={
										<Button
											variant="ghost"
											size="icon"
											aria-label="Open navigation"
										>
											<Icon name="bars" className="text-lg" />
										</Button>
									}
								/>
								<SheetContent
									side="left"
									className="w-[320px] overflow-y-auto p-4 scrollbar-quiet"
								>
									<AreaSwitcher
										areas={areas}
										activeArea={bare ? "" : activeArea.id}
										onSelect={(home) => {
											navigate(home)
											setMobileOpen(false)
										}}
									/>
									<DocsNav
										sections={sections}
										current={current}
										onSelect={(slug) => {
											navigate(slug)
											setMobileOpen(false)
										}}
										onOpenSearch={() => {
											setMobileOpen(false)
											openSearch()
										}}
									/>
								</SheetContent>
							</Sheet>
						}
						title={<Brand />}
						actions={<><GitHubLink compact /><CustomizeToggle compact /></>}
						className="border-b-0 bg-background/80 backdrop-blur-md"
					/>
				</>
			}
			sidebar={!rail ? undefined : (
				/*
				 * The rail is `sticky top-0 h-screen` by default, which would slide it
				 * under the top bar. Offsetting both the stick point and the height by
				 * the nav height is the whole coupling between the two.
				 */
				// Borderless and on the page's own surface: the rail is separated by
				// space and its content, not by a rule and a tonal step.
				// Because the rail sits on the PAGE surface, its items use the content
				// tokens. Sidebar tokens assume the sidebar's own surface — on a
				// preset with a dark sidebar (Meridian) they rendered near-white ink
				// on the light page.
				<Sidebar className="border-r-0 bg-background text-foreground lg:top-[var(--nav-height,56px)] lg:h-[calc(100vh-var(--nav-height,56px))]">
					<SidebarNav>
						<DocsNav
							sections={sections}
							current={current}
							onSelect={navigate}
							onOpenSearch={openSearch}
							showSearch={false}
							activeVariant="content"
						/>
					</SidebarNav>
				</Sidebar>
			)}
			overlays={
				// The one command palette, opened by ⌘K or either search trigger.
				<CommandMenu
					open={searchOpen}
					onOpenChange={setSearchOpen}
					items={commandItems}
					filter={filter}
					placeholder="Search components, foundations, templates…"
					emptyMessage="Nothing matches that."
				/>
			}
		>
			{/* While the inspector is open on desktop, its column is reserved so the
			    page reflows beside it rather than sliding under it — the same
			    arrangement on every page, the canvas included.Padding (not a narrower
			    Region) keeps the reading width rule intact: the Region still caps
			    by role, it just centres in the space that is left. */}
			<div
				className={cn(
					"motion-interactive",
					customizer.open ? "lg:pe-[356px]" : "",
				)}
				style={{ transitionProperty: "padding" }}
			>
				{bare ? (
					<div key={current} ref={routeContent}>{children}</div>
				) : (
					<Region max={max} className="box-border py-10 lg:py-14">
						{/* Re-keyed per route so each navigation plays a soft entrance. */}
						<div key={current} ref={routeContent} className="animate-fade-up">
							{children}
						</div>
					</Region>
				)}
			</div>
			{/* Floating, not docked: the inspector hovers over the page like a
			    design tool's panel. On desktop the page makes room for it (above);
			    on small screens there is no room beside the page, so it is a whole
			    settings view instead: tune, close, see the result. */}
			{wide ? (
				customizer.open ? (
					<Inspector
						onClose={() => customizer.setOpen(false)}
						className="motion-pop fixed top-[calc(var(--nav-height,56px)+12px)] right-4 bottom-4 z-(--z-overlay) w-[340px]"
					/>
				) : null
			) : (
				<Sheet open={customizer.open} onOpenChange={customizer.setOpen}>
					<SheetContent side="bottom" className="h-dvh max-h-none gap-0 p-0">
						<SheetTitle className="sr-only">Customize</SheetTitle>
						<Inspector
							floating={false}
							onClose={() => customizer.setOpen(false)}
							className="min-h-0 flex-1 ring-0"
						/>
					</SheetContent>
				</Sheet>
			)}
		</AppShell>
	)
}
