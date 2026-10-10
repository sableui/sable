import { useState } from "react"
import { GlidingHighlight, glidingHighlightMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const SOURCES = [
	{ id: "scoop", label: "Scoop Data", detail: "Sales & churn metrics" },
	{ id: "flavors", label: "Flavour records", detail: "26 makers, tags, links" },
	{ id: "web", label: "Web search", detail: "Real-time news and info" },
	{
		id: "notes",
		label: "Tasting notes",
		detail: "Two seasons of panel scores, one row per batch",
	},
]

const TABS = ["Overview", "Batches", "Suppliers"]

export function GlidingHighlightPage() {
	const [hovered, setHovered] = useState<number | null>(null)
	const [selected, setSelected] = useState(0)
	const [cursor, setCursor] = useState(0)
	const [tab, setTab] = useState(0)

	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Gliding Highlight"
				lede={ledeFor(glidingHighlightMeta)}
			/>

			<Section
				title="Basic"
				description="Hover the rows, then leave: the highlight returns to the current choice."
			>
				<Example>
					<GlidingHighlight
						active={hovered ?? selected}
						className="sable-frame sable-surface sable-surface-popover sable-frame-popover w-72"
						onPointerLeave={() => setHovered(null)}
					>
						{SOURCES.map((s, i) => (
							<button
								key={s.id}
								type="button"
								aria-current={selected === i || undefined}
								onPointerEnter={() => setHovered(i)}
								onFocus={() => setHovered(i)}
								onBlur={() => setHovered(null)}
								onClick={() => setSelected(i)}
								className="sable-frame-inner relative z-10 flex w-full flex-col items-start gap-0.5 px-2 py-1.5 text-start motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<span className="text-ui-md text-foreground">{s.label}</span>
								<span className="text-body-xs text-muted-foreground">
									{s.detail}
								</span>
							</button>
						))}
					</GlidingHighlight>
				</Example>
			</Section>

			<Section
				title="Keyboard"
				description="Focus the list and use the arrow keys; the eye can follow the moving highlight."
			>
				<Example>
					{/* design-lint-disable-next-line hand-rolled-control -- the demo IS a custom keyboard list, the case GlidingHighlight exists for */}
					<div
						role="listbox"
						aria-label="Sources"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === "ArrowDown") {
								e.preventDefault()
								setCursor((c) => (c + 1) % SOURCES.length)
							}
							if (e.key === "ArrowUp") {
								e.preventDefault()
								setCursor((c) => (c - 1 + SOURCES.length) % SOURCES.length)
							}
						}}
						className="rounded-md motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<GlidingHighlight
							active={cursor}
							className="sable-frame sable-surface sable-surface-popover sable-frame-popover w-72"
						>
							{SOURCES.map((s, i) => (
								// design-lint-disable-next-line hand-rolled-control -- options of the custom list above
								<div
									key={s.id}
									role="option"
									aria-selected={cursor === i}
									className="sable-frame-inner relative z-10 px-2 py-1.5 text-ui-md text-foreground"
								>
									{s.label}
								</div>
							))}
						</GlidingHighlight>
					</div>
				</Example>
			</Section>

			<Section
				title="Horizontal"
				description="The same glide across a row, as in a segmented control."
			>
				<Example>
					<GlidingHighlight
						active={tab}
						className="sable-well flex gap-1 rounded-md p-1"
						highlightClassName="rounded-concentric-md/1"
					>
						{TABS.map((t, i) => (
							<button
								key={t}
								type="button"
								onClick={() => setTab(i)}
								className="relative z-10 rounded-concentric-md/1 px-3 py-1 text-ui-md text-foreground motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								{t}
							</button>
						))}
					</GlidingHighlight>
				</Example>
			</Section>

			<Section
				title="Nothing active"
				description="No highlight shows until something is active, so nothing looks pre-selected."
			>
				<Example>
					<GlidingHighlight
						active={null}
						className="sable-frame sable-surface sable-surface-popover sable-frame-popover w-72"
					>
						{SOURCES.slice(0, 3).map((s) => (
							<div
								key={s.id}
								className="sable-frame-inner relative z-10 px-2 py-1.5 text-ui-md text-foreground"
							>
								{s.label}
							</div>
						))}
					</GlidingHighlight>
				</Example>
			</Section>

			<MetaFooter meta={glidingHighlightMeta} />
		</>
	)
}
