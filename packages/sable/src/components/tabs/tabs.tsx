import { Tabs as Base } from "@base-ui/react/tabs"
import { type ComponentProps, createContext, useContext } from "react"
import { cn } from "../../lib/cn"
import { trimLabel } from "../../lib/trim-label"

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
 */
export const Tabs = Base.Root

export type TabsVariant = "underline" | "pill"

const TabsVariantContext = createContext<TabsVariant>("underline")

type ListProps = Omit<ComponentProps<typeof Base.List>, "className"> & {
	className?: string
	/** `underline` (default) or `pill`. Triggers inside inherit it. */
	variant?: TabsVariant
}

/** The tablist — a row of triggers, on a divider rule or as pills. */
export function TabsList({ className, variant = "underline", ...props }: ListProps) {
	return (
		<TabsVariantContext.Provider value={variant}>
			<Base.List
				data-variant={variant}
				className={cn(
					variant === "underline"
						? "inline-flex items-center gap-1 border-b border-border"
						: "inline-flex items-center gap-1",
					className,
				)}
				{...props}
			/>
		</TabsVariantContext.Provider>
	)
}

type TriggerProps = Omit<ComponentProps<typeof Base.Tab>, "className"> & {
	className?: string
}

/**
 * A single tab button (Base UI's Tabs.Tab). Underline: the active tab draws its
 * rule via `data-active`, and `-mb-px` overlaps the list's divider. Pill: the
 * active tab takes a muted fill on the control ladder, and its label is trimmed
 * to the cap height so it centres optically in the short pill.
 */
export function TabsTrigger({ className, children, ...props }: TriggerProps) {
	const variant = useContext(TabsVariantContext)
	return (
		<Base.Tab
			className={cn(
				"cursor-pointer text-label-lg text-muted-foreground motion-interactive hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				variant === "underline"
					? // On the control ladder like the pill variant (it was py-2 plus
					// the label's line, ~36px — no rung).
					"-mb-px inline-flex h-(--control-md) items-center border-b-2 border-transparent px-3 data-[active]:border-foreground"
					: "inline-flex h-(--control-sm) items-center rounded-sm px-3 data-[active]:bg-muted",
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

/** The panel shown when its matching trigger is active. */
export function TabsPanel({ className, ...props }: PanelProps) {
	return (
		<Base.Panel
			className={cn(
				"pt-4 text-foreground focus-visible:outline-none",
				className,
			)}
			{...props}
		/>
	)
}
