import { Tabs as Base } from "@base-ui/react/tabs"
import { type ComponentProps, createContext, useContext } from "react"
import { cn } from "../../lib/cn"
import { trimLabel } from "../../lib/trim-label"
import { type MotionLevel, motionAttribute } from "../../motion/MotionProvider"

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

export function Tabs({ motion, ...props }: RootProps) {
	return <Base.Root data-motion={motionAttribute(motion)} {...props} />
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
 * Underline: a 2px bar on the list's divider, `-bottom-px` so it overlaps the
 * rule exactly as the tab's own `border-b-2 -mb-px` did. Pill: the muted fill
 * behind the label, on the tab's own height and the theme's button shape. The
 * indicator is the list's FIRST child and the tabs are `relative`, so the tabs
 * paint over it in DOM order — no z-index needed.
 */
const INDICATOR =
	"pointer-events-none absolute left-0 w-(--active-tab-width) translate-x-(--active-tab-left) motion-glide"
const INDICATOR_UNDERLINE = "-bottom-px h-0.5 bg-foreground"
const INDICATOR_PILL =
	"top-0 h-(--active-tab-height) translate-y-(--active-tab-top) rounded-[var(--button-radius,9999px)] bg-muted"

/**
 * The tablist — a row of triggers, on a divider rule or as pills. It renders
 * the gliding indicator itself, so composing TabsList + TabsTrigger is all a
 * consumer writes.
 */
export function TabsList({ className, variant = "underline", children, ...props }: ListProps) {
	return (
		<TabsVariantContext.Provider value={variant}>
			<Base.List
				data-variant={variant}
				className={cn(
					variant === "underline"
						? cn(
								"relative inline-flex items-center gap-1 border-b border-border",
								// In a WorkspaceBar the bar's hairline IS the divider: the list
								// fills the bar's height, drops its own rule (which stopped
								// after the last tab, a second line above the bar's), and the
								// mark lands on the bar's edge.
								"[[data-workspace-bar]_&]:self-stretch [[data-workspace-bar]_&]:border-b-0",
								UNDERLINE_HANDOFF,
							)
						: cn("relative inline-flex items-center gap-1", PILL_HANDOFF),
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
				"relative cursor-pointer text-label-lg text-muted-foreground motion-interactive hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				variant === "underline"
					? // On the control ladder like the pill variant (it was py-2 plus
					// the label's line, ~36px — no rung).
					"-mb-px inline-flex h-(--control-md) items-center gap-(--control-gap) border-b-2 border-transparent px-3 data-[active]:border-foreground [[data-workspace-bar]_&]:h-full"
					: "inline-flex h-(--control-sm) items-center gap-(--control-gap) rounded-[var(--button-radius,9999px)] px-3 data-[active]:bg-muted",
				className,
			)}
			{...props}
		>
			{variant === "pill" && typeof children !== "function" ? trimLabel(children) : children}
		</Base.Tab>
	)
}

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
 */
export function TabsPanel({ className, ...props }: PanelProps) {
	return (
		<Base.Panel
			className={cn(
				"pt-4 text-foreground focus-visible:outline-none not-data-[activation-direction=none]:animate-fade-in data-[ending-style]:hidden",
				className,
			)}
			{...props}
		/>
	)
}
