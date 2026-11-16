"use client"

import { Tabs as Base } from "@base-ui/react/tabs"
import { type ComponentProps, createContext, useContext, useEffect, useMemo, useRef } from "react"
import { cn } from "../../lib/cn"
import { mergeRefs } from "../../lib/refs"
import { trimLabel } from "../../lib/trim-label"
import { useEdgeFade } from "../../lib/use-edge-fade"
import { type MotionLevel, motionAttribute, useMotion } from "../../motion/MotionProvider"

/**
 * Tabs — themed wrapper over Base UI's Tabs (roving focus, arrow-key nav, ARIA
 * tablist/tab/tabpanel wiring all come from Base UI). Compose:
 *
 *   <Tabs defaultValue="overview">
 *     <TabsList>
 *       <TabsTrigger value="overview">Overview</TabsTrigger>
 *       <TabsTrigger value="activity">Activity</TabsTrigger>
 *     </TabsList>
 *     <TabsPanel value="overview">…</TabsPanel>
 *     <TabsPanel value="activity">…</TabsPanel>
 *   </Tabs>
 *
 * Two styles, set on the list. `underline` (default) sits on a divider rule —
 * the page-section idiom. `pill` fills the active tab with a quiet surface and
 * no rule — the switcher idiom (Preview / Code, view modes inside a card),
 * where a rule under a short row of two or three options reads as structure
 * that is not there. The active tab reads from Base UI's `data-active`.
 *
 * In both styles the active mark is ONE element that travels: TabsList renders
 * Base UI's Tabs.Indicator for you, and it glides (`motion-glide`) to the new
 * tab and stretches to its width. See TabsList for the hand-off that keeps the
 * first paint right before it mounts.
 */
type RootProps = ComponentProps<typeof Base.Root> & {
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the glide, `off` stills it. It
	 * can only turn motion down — it never overrides a reader's reduce-motion
	 * setting.
	 * @default "full"
	 */
	motion?: MotionLevel
}

/**
 * `orientation="vertical"` sets the list beside its panels: Base UI writes
 * `data-orientation` on the root, list, tabs, indicator and panels, and each
 * part reads it — a column list ruled on its end edge, a mark that travels on y.
 */
const ROOT_VERTICAL = "data-[orientation=vertical]:flex data-[orientation=vertical]:items-start data-[orientation=vertical]:gap-6"

export function Tabs({ motion, className, ...props }: RootProps) {
	return (
		<Base.Root
			data-motion={motionAttribute(motion)}
			className={
				typeof className === "function"
					? (state) => cn(ROOT_VERTICAL, className(state))
					: cn(ROOT_VERTICAL, className)
			}
			{...props}
		/>
	)
}
Tabs.displayName = "Tabs"

export type TabsVariant = "underline" | "pill"

const TabsVariantContext = createContext<TabsVariant>("underline")

type ListProps = Omit<ComponentProps<typeof Base.List>, "className"> & {
	className?: string
	/** `underline` (default) or `pill`. Triggers inside inherit it. */
	variant?: TabsVariant
}

/**
 * The indicator's hand-off. Base UI keeps Tabs.Indicator `hidden` until it has
 * measured the active tab, which is after hydration — so the server render, a
 * no-JS page and the first client frame have no indicator at all. Each tab
 * therefore keeps its own active mark (the underline's border, the pill's
 * fill) as the fallback, and these selectors clear it only while the indicator
 * is actually shown. The two draw the same mark in the same place, so the
 * moment one takes over from the other is invisible.
 *
 * Not `renderBeforeHydration`: that inlines a script inside the tablist on
 * every server render to measure early, and the fallback already paints the
 * same thing without one.
 */
// Literal strings, not built from a shared prefix: Tailwind's source scan only
// generates a class it can read whole.
const UNDERLINE_HANDOFF = "[&:has(>[data-tabs-indicator]:not([hidden]))>[role=tab]]:border-transparent"
const PILL_HANDOFF = "[&:has(>[data-tabs-indicator]:not([hidden]))>[role=tab]]:bg-transparent"

/**
 * The travelling mark. Base UI writes the active tab's box onto it as
 * `--active-tab-left/-top/-width/-height`, measured from the list's padding
 * box with getBoundingClientRect — physical pixels, so it is positioned from
 * the physical `left` in RTL too (a logical `start` would mirror an offset that
 * is already mirrored). The offset rides `translate`, which `motion-glide`
 * eases with the width; nothing else lays out around an absolute element.
 *
 * Underline: a 2px bar on the list's bottom edge, covering the rule exactly as
 * the tab's own `border-b-2` does. Pill: the muted fill behind the label, on
 * the tab's own height and the theme's button shape. The indicator is the
 * list's FIRST child and the tabs are `relative`, so the tabs paint over it in
 * DOM order — no z-index needed. Vertical underline: the bar stands on the
 * list's end edge and travels on y.
 */
const INDICATOR =
	"pointer-events-none absolute left-0 w-(--active-tab-width) translate-x-(--active-tab-left) motion-glide"
const INDICATOR_UNDERLINE =
	"bottom-0 h-0.5 bg-foreground [[data-workspace-bar]_&]:-bottom-px data-[orientation=vertical]:top-0 data-[orientation=vertical]:bottom-auto data-[orientation=vertical]:left-auto data-[orientation=vertical]:-end-px data-[orientation=vertical]:h-(--active-tab-height) data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:translate-x-0 data-[orientation=vertical]:translate-y-(--active-tab-top)"
const INDICATOR_PILL =
	"top-0 h-(--active-tab-height) translate-y-(--active-tab-top) rounded-[var(--button-radius,9999px)] bg-muted"

/**
 * A horizontal list scrolls rather than running off a phone: six tabs at 375px
 * do not fit, and wrapping them would break the single rule they sit on. No bar
 * (rule 5: horizontal takes none) — the edge fade from `useEdgeFade`, the same
 * one Scroller uses, says there is more. Because the list is now a scroll
 * container it clips at its padding box, so the divider is an inset shadow
 * inside that box rather than a border outside it, the triggers no longer
 * overlap it with `-mb-px`, and their focus ring is inset. A vertical list and a
 * list in a WorkspaceBar (which fills the bar and lands its mark on the bar's
 * hairline) do not scroll.
 */
const LIST_SCROLL = "max-w-full overflow-x-auto scrollbar-hidden data-[orientation=vertical]:overflow-visible"
const LIST_VERTICAL = "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch"

/**
 * The tablist — a row of triggers, on a divider rule or as pills. It renders
 * the gliding indicator itself, so composing TabsList + TabsTrigger is all a
 * consumer writes. When the active tab changes it scrolls the list (never the
 * page) just far enough to show it.
 */
export function TabsList({ className, variant = "underline", children, ref, style, onScroll, ...props }: ListProps) {
	const listRef = useRef<HTMLDivElement | null>(null)
	const { sync, style: fadeStyle } = useEdgeFade(listRef, "horizontal")
	const { enabled: motionEnabled } = useMotion()
	const smooth = useRef(motionEnabled)
	smooth.current = motionEnabled

	useEffect(() => {
		const list = listRef.current
		if (!list) return
		let shown: Element | null = null
		const reveal = (first: boolean) => {
			const tab = list.querySelector<HTMLElement>(":scope > [role=tab][data-active]")
			if (!tab || tab === shown) return
			shown = tab
			if (list.getAttribute("data-orientation") === "vertical" || list.scrollWidth <= list.clientWidth) return
			const start = tab.offsetLeft
			const end = start + tab.offsetWidth
			let left = list.scrollLeft
			if (start < left) left = start
			else if (end > left + list.clientWidth) left = end - list.clientWidth
			if (left === list.scrollLeft) return
			list.scrollTo({ left, behavior: !first && smooth.current ? "smooth" : "auto" })
		}
		reveal(true)
		const observer = new MutationObserver(() => reveal(false))
		observer.observe(list, { subtree: true, attributes: true, attributeFilter: ["data-active"] })
		return () => observer.disconnect()
	}, [])

	// Stable, so React does not detach and reattach the list on every render.
	const listRefs = useMemo(() => mergeRefs(listRef, ref), [ref])

	return (
		<TabsVariantContext.Provider value={variant}>
			<Base.List
				ref={listRefs}
				data-variant={variant}
				style={fadeStyle && typeof style !== "function" ? { ...fadeStyle, ...style } : style}
				onScroll={(event) => {
					sync()
					onScroll?.(event)
				}}
				className={cn(
					variant === "underline"
						? cn(
								"relative inline-flex items-center gap-1 shadow-[inset_0_-1px_0_var(--border)]",
								LIST_SCROLL,
								LIST_VERTICAL,
								// Vertical: the rule moves to the end edge. No scrolling there,
								// so it is a plain border the tabs overlap with -me-px.
								"data-[orientation=vertical]:border-e data-[orientation=vertical]:border-border data-[orientation=vertical]:shadow-none",
								// In a WorkspaceBar the bar's hairline IS the divider: the list
								// fills the bar's height, drops its own rule (which stopped
								// after the last tab, a second line above the bar's), and the
								// mark lands on the bar's edge.
								"[[data-workspace-bar]_&]:self-stretch [[data-workspace-bar]_&]:overflow-visible [[data-workspace-bar]_&]:shadow-none",
								UNDERLINE_HANDOFF,
							)
						: cn("relative inline-flex items-center gap-1", LIST_SCROLL, LIST_VERTICAL, PILL_HANDOFF),
					className,
				)}
				{...props}
			>
				<Base.Indicator
					data-tabs-indicator=""
					className={cn(INDICATOR, variant === "underline" ? INDICATOR_UNDERLINE : INDICATOR_PILL)}
				/>
				{children}
			</Base.List>
		</TabsVariantContext.Provider>
	)
}
TabsList.displayName = "TabsList"

type TriggerProps = Omit<ComponentProps<typeof Base.Tab>, "className"> & {
	className?: string
}

/**
 * A single tab button (Base UI's Tabs.Tab). Underline: the active tab draws its
 * rule via `data-active`, and `-mb-px` overlaps the list's divider. Pill: the
 * active tab takes a muted fill on the control ladder. In both, that per-tab
 * mark is only the fallback until TabsList's gliding indicator is shown; the
 * tab is `relative` so it paints over the indicator. The pill label is trimmed
 * to the cap height so it centres optically in the short pill. A pill tab is a
 * button-shaped control, so it takes the theme's button shape (`--button-radius`,
 * as Button does): a pill in Sable, rounded in Poppy, square in Meridian.
 * A badge or icon beside the label is spaced like Button's (`--control-gap`):
 * the label is its own trimmed span, so a typed space after it collapses.
 */
export function TabsTrigger({ className, children, ...props }: TriggerProps) {
	const variant = useContext(TabsVariantContext)
	return (
		<Base.Tab
			className={cn(
				// shrink-0 + nowrap: in a list that scrolls, a tab keeps its label on
				// one line instead of squeezing it onto two. The ring is inset because
				// the scrolling list clips at its padding box (see LIST_SCROLL).
				"relative shrink-0 cursor-pointer whitespace-nowrap text-label-lg text-muted-foreground motion-interactive hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring data-[active]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[orientation=vertical]:justify-start",
				variant === "underline"
					? // On the control ladder like the pill variant (it was py-2 plus
					// the label's line, ~36px — no rung).
					"inline-flex h-(--control-md) items-center gap-(--control-gap) border-b-2 border-transparent px-3 data-[active]:border-foreground [[data-workspace-bar]_&]:-mb-px [[data-workspace-bar]_&]:h-full data-[orientation=vertical]:-me-px data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-e-2"
					: "inline-flex h-(--control-sm) items-center gap-(--control-gap) rounded-[var(--button-radius,9999px)] px-3 data-[active]:bg-muted",
				className,
			)}
			{...props}
		>
			{variant === "pill" && typeof children !== "function" ? trimLabel(children) : children}
		</Base.Tab>
	)
}
TabsTrigger.displayName = "TabsTrigger"

type PanelProps = Omit<ComponentProps<typeof Base.Panel>, "className"> & {
	className?: string
}

/**
 * The panel shown when its matching trigger is active.
 *
 * A changed panel fades in (`animate-fade-in`, essential: it confirms the
 * click landed even when two panels look alike). Opacity only — a slide would
 * move the content the reader is about to read. Two guards keep it from
 * costing layout:
 *
 * - Not on first render. Base UI reports `data-activation-direction="none"`
 *   until the selection has changed, so a page full of tabs does not fade in
 *   on load.
 * - The outgoing panel leaves at once. Base UI keeps it mounted until its
 *   animations finish (`data-ending-style`); left displayed, a switch made
 *   mid-fade stacked both panels for a moment and the page jumped by a panel's
 *   height. `hidden` while ending takes it out of layout immediately.
 *
 * The panel is a tab stop after the tablist (Base UI gives it tabIndex 0), so
 * it shows the same ring as every other focusable surface — an invisible stop
 * is one a keyboard user cannot tell they landed on.
 */
export function TabsPanel({ className, ...props }: PanelProps) {
	return (
		<Base.Panel
			className={cn(
				"rounded-sm pt-4 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background not-data-[activation-direction=none]:animate-fade-in data-[ending-style]:hidden data-[orientation=vertical]:min-w-0 data-[orientation=vertical]:flex-1 data-[orientation=vertical]:pt-0",
				className,
			)}
			{...props}
		/>
	)
}
TabsPanel.displayName = "TabsPanel"
