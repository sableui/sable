import { Button, Grid, Icon, Scroller, useScrollActivity } from "@sableui/react"
import { FOUNDATIONS_BY_SLUG } from "@sableui/react/foundations"
import { type ReactNode, useLayoutEffect, useRef, useState } from "react"
import { PageHeader, Section } from "../components/docs-ui"

/**
 * Foundation pages: title and live demos only. The rules live in the
 * foundation object (src/foundations/<slug>.ts), served to agents as
 * llms/foundations/<slug>.md and `sable docs <slug>`.
 */
function FoundationPage({ slug, lede, children }: { slug: string; lede: string; children?: ReactNode }) {
	const foundation = FOUNDATIONS_BY_SLUG[slug]
	return (
		<>
			<PageHeader eyebrow="Foundations" title={foundation.title} lede={lede} />
			{children}
		</>
	)
}

// Literal class names: Tailwind only emits classes it can read in source.
const RADII = [
	["none", "rounded-none"],
	["xs", "rounded-xs"],
	["sm", "rounded-sm"],
	["md", "rounded-md"],
	["lg", "rounded-lg"],
	["xl", "rounded-xl"],
	["full", "rounded-full"],
] as const

const EDGES = [
	["Hairline", "border border-border"],
	["Strong", "border border-border-strong"],
	["Floating", "border border-border-floating shadow-md"],
	["Focus", "ring-2 ring-ring"],
] as const

export function ShapePage() {
	return (
		<FoundationPage
			slug="shape"
			lede="Corners say what something is: tight on containers, round on actions. Nested corners share a center."
		>
			<Section title="Radius" description="Seven steps. The Customize panel retunes them together.">
				<Grid cols={{ base: 2, sm: 4, lg: 7 }} gap={2}>
					{RADII.map(([r, cls]) => (
						<div key={r} className="grid gap-2">
							<div className={`aspect-square border border-border-strong bg-muted ${cls}`} />
							<code className="text-mono-caption text-muted-foreground">{cls}</code>
						</div>
					))}
				</Grid>
			</Section>
			<Section title="Concentric nesting" description="The inner corner is the outer corner minus the padding, so the curves stay parallel.">
				<ConcentricDemo />
			</Section>
			<Section title="Edges" description="One edge per boundary: a line, a ring or a shadow, never all three.">
				<Grid cols={{ base: 2, lg: 4 }} gap={2}>
					{EDGES.map(([label, cls]) => (
						<div key={label} className="grid gap-2">
							<div className={`h-20 rounded-lg bg-card ${cls}`} />
							<p className="text-label-md">{label}</p>
						</div>
					))}
				</Grid>
			</Section>
		</FoundationPage>
	)
}

/** A container and its rows, nested with rounded-concentric — captioned with the real radii. */
function ConcentricDemo() {
	const outer = useRef<HTMLDivElement>(null)
	const inner = useRef<HTMLDivElement>(null)
	const [caption, setCaption] = useState("")
	useLayoutEffect(() => {
		const read = () => {
			if (!outer.current || !inner.current) return
			const o = Number.parseFloat(getComputedStyle(outer.current).borderTopLeftRadius)
			const i = Number.parseFloat(getComputedStyle(inner.current).borderTopLeftRadius)
			const pad = Number.parseFloat(getComputedStyle(outer.current).paddingTop)
			setCaption(`Outer ${Math.round(o)}px, inset ${Math.round(pad)}px, inner ${Math.round(i)}px`)
		}
		read()
		// The look is a <style> element; re-measure whenever it is rewritten.
		const observer = new MutationObserver(read)
		observer.observe(document.head, { subtree: true, childList: true, characterData: true })
		return () => observer.disconnect()
	}, [])
	return (
		<div className="grid gap-3">
			<div ref={outer} className="grid max-w-sm gap-2 rounded-lg border border-border bg-card p-2">
				{["Inner row", "Inner row", "Inner row"].map((label, i) => (
					<div key={i} ref={i === 0 ? inner : undefined} className="rounded-concentric-lg/2 bg-muted px-3 py-2 text-body-sm">
						{label}
					</div>
				))}
			</div>
			<code className="text-mono-caption text-muted-foreground">{caption}</code>
		</div>
	)
}

function QuietList() {
	const ref = useScrollActivity()
	return (
		<div ref={ref} className="h-64 overflow-y-auto scrollbar-quiet rounded-lg border border-border bg-card">
			{Array.from({ length: 40 }, (_, i) => (
				<div key={i} className="border-b border-border px-4 py-2.5 text-body-sm last:border-0">
					Row {i + 1}
				</div>
			))}
		</div>
	)
}

export function ScrollingPage() {
	return (
		<FoundationPage
			slug="scrolling"
			lede="Scrollbars stay out of the way until you need them. Lists get a quiet bar; strips get a fade at the edge."
		>
			<Section title="Vertical: a quiet bar" description="Hidden at rest. It appears while you scroll or hover.">
				<QuietList />
			</Section>
			<Section title="Horizontal: an edge fade" description="No bar. The fade says there is more, and the mouse wheel moves it sideways.">
				<Scroller orientation="horizontal" label="Example strip">
					<div className="flex gap-3">
						{Array.from({ length: 16 }, (_, i) => (
							<div key={i} className="grid h-24 w-40 shrink-0 place-items-center rounded-lg border border-border bg-card text-label-md">
								Card {i + 1}
							</div>
						))}
					</div>
				</Scroller>
			</Section>
		</FoundationPage>
	)
}

function Floor({ title, caption, children }: { title: string; caption: string; children: ReactNode }) {
	return (
		<div className="grid content-start gap-3">
			<div className="grid h-36 place-items-center rounded-lg border border-border bg-card p-4">{children}</div>
			<div className="grid gap-0.5">
				<p className="text-title-sm">{title}</p>
				<p className="text-body-sm text-muted-foreground">{caption}</p>
			</div>
		</div>
	)
}

export function AccessibilityPage() {
	return (
		<FoundationPage
			slug="accessibility"
			lede="Components handle keyboard and screen readers for you. These are the floors every screen still has to meet."
		>
			<Section title="Floors">
				<Grid cols={{ base: 1, sm: 2 }} gap={3}>
					<Floor title="Contrast" caption="4.5:1 for text, 3:1 for icons, controls and large text.">
						<div className="flex items-baseline gap-6">
							<span className="text-display-lg">Aa</span>
							<span className="text-display-lg text-muted-foreground">Aa</span>
						</div>
					</Floor>
					<Floor title="Visible focus" caption="A full-strength ring on everything you can tab to.">
						{/* design-lint-disable-next-line component-restyle -- a specimen of the focus state: the same ring Button's focus-visible applies, drawn statically */}
						<Button variant="secondary" className="ring-2 ring-ring">
							Focused
						</Button>
					</Floor>
					<Floor title="Touch targets" caption="At least 44 by 44px, even when the control looks smaller.">
						<div className="grid size-11 place-items-center rounded-sm border border-dashed border-border-strong">
							<Icon name="xmark" className="text-base" />
						</div>
					</Floor>
					<Floor title="Not color alone" caption="Pair color with words or an icon.">
						<div className="grid w-full max-w-56 gap-1.5">
							<div className="h-(--control-md) rounded-sm border border-destructive bg-background" />
							<p className="flex items-center gap-1.5 text-body-sm text-destructive">
								<Icon name="warning" />
								Enter a valid email
							</p>
						</div>
					</Floor>
				</Grid>
			</Section>
		</FoundationPage>
	)
}
