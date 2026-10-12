import { cn, Grid } from "@sableui/react"
import { PageHeader, Section } from "../components/docs-ui"

const SURFACES: [string, string, string][] = [
	["Background", "bg-background", "The page canvas."],
	["Card", "bg-card", "One step up: cards, panels, menus."],
	["Muted", "bg-muted", "A quiet fill for secondary areas."],
]

const LEVELS: [string, string, string][] = [
	["Resting", "", "Page content and flat cards."],
	["Raised", "shadow-sm", "A sticky header over scrolled content."],
	["Floating", "shadow-md", "Menus, popovers, selects."],
	["Modal", "shadow-lg", "Dialogs and sheets, over a scrim."],
	["Top", "shadow-xl", "The rare top-most layer: toasts."],
]

const LAYERS: [string, string][] = [
	["Skip link", "Above everything"],
	["Toasts", "Above modals, so a confirmation is never hidden"],
	["Overlays", "Dialogs, sheets, popovers, menus, tooltips"],
	["App chrome", "Header, sidebar, bottom nav"],
	["Sticky", "Table headers, sticky banners"],
	["Content", "The page itself"],
]

/** Rows for the relative-surface demo. */
const ROWS = ["Inbox", "Drafts", "Archive"]

export function ElevationPage() {
	return (
		<>
			<PageHeader
				eyebrow="Foundations"
				title="Elevation"
				lede="Sable is flat by default. Depth comes from a lighter surface and a hairline edge; shadows are kept for things that float."
			/>

			<Section title="Surfaces" description="A raised surface is one step lighter.">
				<Grid cols={{ base: 1, sm: 3 }} gap={2}>
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

			<Section title="Layers" description="What sits on top of what, from top to bottom.">
				<div className="grid gap-1.5">
					{LAYERS.map(([name, note], i) => (
						<div
							key={name}
							className="flex items-baseline gap-4 rounded-lg border border-border bg-card px-4 py-3"
							style={{ marginInlineStart: `${(LAYERS.length - 1 - i) * 0.5}rem` }}
						>
							<p className="text-title-sm w-28 shrink-0">{name}</p>
							<p className="text-body-sm text-muted-foreground">{note}</p>
						</div>
					))}
				</div>
			</Section>
		</>
	)
}
