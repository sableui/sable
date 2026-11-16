import { Button, cn, EmptyState, Grid, Icon } from "@sableui/react"
import { InlineCode, PageHeader, Section } from "../components/docs-ui"

const SURFACES: [string, string, string][] = [
	["Background", "bg-background", "The page canvas, the bottom of the stack."],
	["Card", "bg-card", "One step up: cards, dialogs, sheets, panels on the page."],
	["Popover", "bg-popover", "The top step: menus, selects, popovers, tooltips. Lifted above card in dark mode, so a menu opened in a dialog never melts into it."],
	["Muted", "bg-muted", "A quiet fill inside a surface: wells, chips, secondary areas."],
]

const LEVELS: [string, string, string][] = [
	["Resting", "", "Page content and flat cards."],
	["Raised", "shadow-sm", "A sticky header over scrolled content."],
	["Floating", "shadow-md", "Menus, popovers, selects."],
	["Modal", "shadow-lg", "Dialogs and sheets, over a scrim."],
	["Top", "shadow-xl", "The rare top-most layer: toasts."],
]

const LAYERS: [string, string, string][] = [
	["Skip link", "--z-skip-link", "Above everything"],
	["Toasts", "--z-toast", "Above modals, so a confirmation is never hidden"],
	["Overlays", "--z-overlay", "Dialogs, sheets, popovers, menus, tooltips"],
	["App chrome", "--z-nav", "Header, sidebar, bottom nav"],
	["Sticky", "--z-sticky", "Table headers, sticky banners"],
	["Content", "", "The page itself"],
]

/** Rows for the relative-surface demo. */
const ROWS = ["Inbox", "Drafts", "Archive"]

export function ElevationPage() {
	return (
		<>
			<PageHeader
				eyebrow="Foundations"
				title="Surfaces"
				lede="Sable is flat by default. Depth comes from a lighter surface and a hairline edge; shadows are kept for things that float."
			/>

			<Section title="Surfaces" description="A raised surface is one step lighter.">
				<Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={2}>
					{SURFACES.map(([name, surface, note]) => (
						<div
							key={name}
							className={cn("rounded-lg border border-border p-5", surface)}
						>
							<p className="text-title-sm">{name}</p>
							<p className="text-body-sm text-muted-foreground mt-1">{note}</p>
						</div>
					))}
				</Grid>
			</Section>

			<Section
				title="States follow the surface"
				description="Hover, selected and edge colors are worked out from the surface underneath, so they always belong to it."
			>
				<div className="grid gap-4 md:grid-cols-3">
					<div className="sable-frame sable-surface sable-frame-r-lg sable-frame-p-4 shadow-sm">
						<p className="text-title-sm">Card surface</p>
						<p className="mt-1 text-body-sm text-muted-foreground">
							Hover a row: its fill comes from the card.
						</p>
						<div className="mt-3 grid gap-0.5">
							{ROWS.map((row) => (
								<button
									key={row}
									type="button"
									className="sable-surface-interactive sable-frame-inner w-full px-3 py-2 text-left text-body-sm motion-interactive"
								>
									{row}
								</button>
							))}
						</div>
					</div>
					<div className="sable-frame sable-surface sable-surface-muted sable-frame-r-lg sable-frame-p-4">
						<p className="text-title-sm">Muted surface</p>
						<p className="mt-1 text-body-sm text-muted-foreground">
							A quieter tone; the selected row follows it.
						</p>
						<div className="mt-3 grid gap-0.5">
							{ROWS.map((row, i) => (
								<button
									key={row}
									type="button"
									data-selected={i === 1 ? "" : undefined}
									className="sable-surface-interactive sable-frame-inner w-full px-3 py-2 text-left text-body-sm motion-interactive"
								>
									{row}
								</button>
							))}
						</div>
					</div>
					<div className="sable-frame sable-surface sable-surface-popover sable-frame-popover self-start">
						<div className="sable-frame-inner sable-surface-interactive px-3 py-2 text-body-sm">
							Popover item
						</div>
						<div
							data-highlighted
							className="sable-frame-inner sable-surface-interactive px-3 py-2 text-body-sm"
						>
							Highlighted item
						</div>
					</div>
				</div>
			</Section>

			<Section
				title="Shadows"
				description="The more something floats over the page, the higher it sits. Shadows read strongest in light mode."
			>
				<Grid cols={{ base: 1, sm: 2, lg: 3 }} gap={3}>
					{LEVELS.map(([name, shadow, note]) => (
						<div key={name} className="rounded-xl bg-background p-2">
							<div
								className={cn(
									"flex h-24 items-center justify-center rounded-lg border border-border bg-card",
									shadow,
								)}
							>
								<code className="text-mono-sm text-muted-foreground">
									{shadow || "none"}
								</code>
							</div>
							<p className="text-title-sm mt-3">{name}</p>
							<p className="text-body-sm text-muted-foreground mt-1">{note}</p>
						</div>
					))}
				</Grid>
			</Section>

			<Section
				title="Texture"
				description="texture-dither lays a faint field of tiny squares that dissolves, painted in the border-strong ink so it follows every theme. It is decoration: its own aria-hidden layer behind the content. The --dither-fade hook turns it."
			>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="relative isolate overflow-hidden rounded-lg border border-border bg-card">
						<div aria-hidden className="texture-dither absolute inset-x-0 top-0 -z-10 h-40" />
						<EmptyState
							icon={<Icon name="inbox" />}
							title="No messages yet"
							description="When someone writes to you, it lands here."
							action={<Button variant="secondary">Invite your team</Button>}
						/>
					</div>
					<div className="relative isolate grid content-end gap-1 overflow-hidden rounded-lg border border-border bg-card p-5 min-h-56">
						<div aria-hidden className="texture-dither absolute inset-x-0 bottom-0 -z-10 h-32 [--dither-fade:to_top]" />
						<p className="text-title-sm">Faded from the bottom</p>
						<code className="text-mono-caption text-muted-foreground">[--dither-fade:to_top]</code>
					</div>
				</div>
			</Section>

			<Section
				title="Layers"
				description="What sits on top of what, from top to bottom. One ordered scale, declared in styles.css so every theme inherits it; name the layer, never a raw number."
			>
				<div className="grid gap-1.5">
					{LAYERS.map(([name, token, note], i) => (
						<div
							key={name}
							className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-lg border border-border bg-card px-4 py-3"
							style={{ marginInlineStart: `calc(var(--spacing) * ${(LAYERS.length - 1 - i) * 2})` }}
						>
							<p className="text-title-sm w-28 shrink-0">{name}</p>
							{token ? <InlineCode>{`z-(${token})`}</InlineCode> : null}
							<p className="text-body-sm text-muted-foreground">{note}</p>
						</div>
					))}
				</div>
			</Section>
		</>
	)
}
