import {
	Combobox as Base,
	type ComboboxRootProps,
} from "@base-ui/react/combobox"
import type { ComponentProps, ReactNode } from "react"
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import { Icon } from "../../icon"
import { anchoredListScroll } from "../../lib/anchored-scroll"
import { cn } from "../../lib/cn"
import { FIELD_SHELL_XS, MOBILE_FIELD_TIER } from "../../lib/field-shell"
import { withPortalThemeScope } from "../../lib/portal-theme-scope"
import { useAnchoredDensity, useDensity, useTypeTier } from "../../lib/density"
import { useResizeObserver } from "../../lib/use-resize-observer"
import { HighlightGlide } from "../../lib/highlight-glide"
import { Badge } from "../badge"
import { Button } from "../button"

/**
 * Combobox — themed autocomplete over Base UI's Combobox (type-to-filter,
 * roving focus, ARIA combobox/listbox wiring, collision-aware positioning,
 * Esc/outside dismissal all come from Base UI). Compose:
 *
 *   <Combobox items={fruits}>
 *     <ComboboxInput placeholder="Search fruit…" />
 *     <ComboboxContent>
 *       <ComboboxEmpty>No matches.</ComboboxEmpty>
 *       <ComboboxList>
 *         {(item: string) => (
 *           <ComboboxItem key={item} value={item}>
 *             {item}
 *           </ComboboxItem>
 *         )}
 *       </ComboboxList>
 *     </ComboboxContent>
 *   </Combobox>
 *
 * State surfaces via Base UI data-attributes: data-[highlighted] (active item),
 * data-[selected], data-[disabled], data-[panel-open] (input while open), and
 * data-[starting-style]/data-[ending-style] (popup open/close).
 *
 * For several values, set `multiple` on the root and use `ComboboxChips` in
 * place of `ComboboxInput`; the value becomes an array and every other part is
 * unchanged.
 *
 * A list long enough to be slow to render (roughly a thousand rows and up) can be
 * windowed with `ComboboxVirtualList`, which keeps filtering where it is.
 */

/**
 * The list Base UI is actually walking, after its own filtering.
 *
 * Re-exported because it is the seam that makes external virtualization
 * tractable, and it is unreachable otherwise: `@base-ui/react` is *our*
 * dependency, so a consumer who installs a second copy to reach the hook puts it
 * in a different React context from the components and it returns nothing.
 *
 * Reach for this only when `ComboboxVirtualList` cannot express the geometry you
 * need (measured rows, a grid, sticky group headers). Everything else about
 * filtering — including Base UI's rule that an untouched field still holding the
 * selected item's label shows the *whole* list rather than a list of one — stays
 * where it belongs, which is inside Base UI. Take filtering over yourself with
 * `filteredItems` and you own that rule too, by hand, until the next upgrade
 * moves it.
 *
 * Returns the flat item array, or the group array when `items` was grouped.
 */
export const useComboboxFilteredItems = Base.useFilteredItems

/**
 * A group of items, as the `items` / `filteredItems` props accept them. Ours, not
 * a re-exported Base UI type — the shape is `{ value, items }` and `value` is
 * what ComboboxGroupLabel shows.
 */
export interface ComboboxItemGroup<Item = unknown> {
	/** The group's heading. */
	value: ReactNode
	/** The rows under it. */
	items: readonly Item[]
}

/**
 * What a `ComboboxVirtualList` needs from the root: somewhere to publish its
 * reveal function (so a highlight that lands on an unrendered row can scroll to
 * it) and the current selection (so opening the popup lands on it rather than on
 * row zero).
 */
interface ComboboxVirtualBridge {
	register: (reveal: ((index: number) => void) | null) => void
	value: unknown
	isItemEqualToValue?: (item: never, value: never) => boolean
}

const ComboboxVirtualContext = createContext<ComboboxVirtualBridge | null>(null)

export type ComboboxProps<
	Value,
	Multiple extends boolean | undefined = false,
> = ComboboxRootProps<Value, Multiple>

/**
 * Root of the combobox. Owns selection, input value, filtering and open state —
 * all of it Base UI's, passed straight through.
 *
 * The one thing this wrapper adds is the bridge a `ComboboxVirtualList` needs.
 * Base UI scrolls a highlighted row into view itself, which works right up until
 * the row is not rendered — the case a windowed list creates on purpose. So the
 * highlight is forwarded to the virtual list, which knows every row's offset
 * whether or not it exists. Your own `onItemHighlighted` still fires, first.
 */
export function Combobox<Value, Multiple extends boolean | undefined = false>({
	onItemHighlighted,
	...props
}: ComboboxProps<Value, Multiple>) {
	const revealRef = useRef<((index: number) => void) | null>(null)
	// Read through a ref so the bridge stays referentially stable: the consumer's
	// handler is usually an inline arrow, and re-creating the context value on
	// every render would re-render the windowed list on every keystroke.
	const highlightRef = useRef(onItemHighlighted)
	highlightRef.current = onItemHighlighted

	const handleHighlight = useCallback(
		(value: Value | undefined, details: { index: number }) => {
			highlightRef.current?.(
				value as never,
				details as unknown as Parameters<
					NonNullable<ComboboxProps<Value, Multiple>["onItemHighlighted"]>
				>[1],
			)
			const reveal = revealRef.current
			// After Base UI's own scrollIntoView, not instead of it: for a row that is
			// rendered the two agree, and for one that is not, only this one can act.
			if (reveal && details.index >= 0) {
				queueMicrotask(() => reveal(details.index))
			}
		},
		[],
	)

	const bridge = useMemo<ComboboxVirtualBridge>(
		() => ({
			register(reveal) {
				revealRef.current = reveal
			},
			value: props.value,
			isItemEqualToValue: props.isItemEqualToValue as never,
		}),
		[props.value, props.isItemEqualToValue],
	)

	return (
		<ComboboxVirtualContext.Provider value={bridge}>
			<Base.Root<Value, Multiple>
				{...(props as ComboboxProps<Value, Multiple>)}
				onItemHighlighted={
					handleHighlight as ComboboxProps<
						Value,
						Multiple
					>["onItemHighlighted"]
				}
			/>
		</ComboboxVirtualContext.Provider>
	)
}

export const ComboboxValue = Base.Value
export const ComboboxClear = Base.Clear
export const ComboboxPortal = withPortalThemeScope(Base.Portal)
export const ComboboxList = Base.List
export const ComboboxItemIndicator = Base.ItemIndicator
export const ComboboxGroup = Base.Group

// `size` is omitted, not merely shadowed: a bare <input> already has a numeric
// `size` attribute, so intersecting a string union onto it resolves to `never`
// and every call site fails to typecheck. The HTML attribute is meaningless
// here — the field's width comes from its container.
type InputProps = Omit<ComponentProps<typeof Base.Input>, "className" | "size"> & {
	className?: string
	/**
	 * Which rung of the control ladder the field sits on. `xs` is the
	 * property-grid rung, and it mirrors `SelectTrigger`'s `size` exactly — same
	 * height, radius and inset surface — so a combobox and a select in the same
	 * panel are the same shape holding different content. A font-family picker
	 * sitting directly above a font-weight select is the case that forced it:
	 * one raised card, one inset field, stacked.
	 *
	 * @default "md"
	 */
	size?: "md" | "xs"
}

/**
 * The field shell both ComboboxInput and ComboboxChips draw, per rung. One copy,
 * so the single and multiple fields cannot drift apart. The trailing padding
 * leaves room for the chevron toggle.
 */
const FIELD_SHELL = {
	xs: cn(FIELD_SHELL_XS, "pe-7 text-ui-md"),
	md: "rounded-sm border border-input bg-card pe-9",
}

/**
 * The md field's type: the density tier like Input, plus the 16px iOS floor
 * (lib/field-shell → MOBILE_FIELD_TIER) — this is a real <input>, so Safari
 * zooms on it below 16px. The xs rung carries its own `text-ui-md`.
 */
function useFieldType(xs: boolean) {
	const tier = useTypeTier()
	const density = useDensity()
	if (xs) return undefined
	return cn(tier.body, density === "comfortable" && MOBILE_FIELD_TIER)
}

/** The chevron that opens the popup, at the field's trailing edge. */
function FieldToggle({ xs }: { xs: boolean }) {
	return (
		<Base.Trigger
			className={cn(
				"group absolute inline-flex items-center justify-center text-muted-foreground outline-none motion-interactive hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
				// Inset by the same step on every side and rounded by the field's
				// radius less that step, so the toggle's corners run parallel to the
				// field's at every rung, density and corner setting.
				xs
					? "end-0.5 size-[calc(var(--control-xs)-var(--spacing))] rounded-concentric-xs/0.5"
					: "end-1.5 size-[calc(var(--control-md)-var(--spacing)*3)] rounded-concentric-sm/1.5",
			)}
			aria-label="Toggle suggestions"
		>
			<Base.Icon className="flex items-center justify-center motion-interactive group-data-[popup-open]:rotate-180">
				<Icon name="chevron-down" className="text-sm" />
			</Base.Icon>
		</Base.Trigger>
	)
}

/**
 * The search field. Styled like our Input (soft-square, card surface, focus
 * ring) with a trailing chevron Trigger that opens the popup. Wrapped in
 * ComboboxInputGroup so the input and chevron share one bordered shell.
 */
export function ComboboxInput({ className, size = "md", ...props }: InputProps) {
	const xs = size === "xs"
	const type = useFieldType(xs)
	return (
		<Base.InputGroup className="relative inline-flex w-full items-center">
			<Base.Input
				className={cn(
					"flex w-full text-foreground motion-interactive",
					xs
						? cn("h-(--control-xs) ps-1.5", FIELD_SHELL.xs)
						: cn("h-(--control-md) ps-3", FIELD_SHELL.md),
					type,
					"placeholder:text-muted-foreground",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30",
					className,
				)}
				{...props}
			/>
			<FieldToggle xs={xs} />
		</Base.InputGroup>
	)
}

type ChipsProps<Item> = InputProps & {
	/**
	 * The text a selected item shows on its chip and in its remove button's
	 * label ("Remove …"). Defaults to the item itself for strings and numbers,
	 * and to its `label` field for objects — the same shape Base UI reads.
	 */
	chipLabel?: (item: Item) => string
}

function defaultChipLabel(item: unknown): string {
	if (typeof item === "object" && item !== null) {
		const label = (item as { label?: unknown }).label
		if (typeof label === "string") return label
	}
	return String(item)
}

/**
 * The search field for a `multiple` Combobox: every selected item is a
 * removable chip in the same bordered shell as the text input, and the shell
 * grows as the chips wrap. Use it in place of ComboboxInput when the root has
 * `multiple`; everything below the field (Content, List, Item, Empty, Group)
 * is the same part either way.
 *
 * A separate part rather than a mode of ComboboxInput, because the two are
 * different geometry — a fixed-height field versus a wrapping row of chips —
 * and because which one you want is known where you write it. ComboboxInput
 * stays exactly the single-line field it has always been.
 *
 * Built from Sable parts, not lookalikes: each chip is a soft `sm` Badge and
 * its remove control a ghost `icon-xs` Button, rendered through Base UI's Chip
 * and ChipRemove so the keyboard model is Base UI's — Backspace in an empty
 * field removes the last chip, ←/→ walk the chips, Backspace/Delete on a
 * highlighted chip removes it.
 */
export function ComboboxChips<Item = unknown>({
	className,
	size = "md",
	chipLabel = defaultChipLabel as (item: Item) => string,
	...props
}: ChipsProps<Item>) {
	const xs = size === "xs"
	const type = useFieldType(xs)
	return (
		<Base.InputGroup
			className={cn(
				"relative flex w-full flex-wrap items-center text-foreground motion-interactive",
				xs
					? cn("min-h-(--control-xs) gap-0.5 py-0.5 ps-0.5", FIELD_SHELL.xs)
					: cn("min-h-(--control-md) gap-1 py-1 ps-1.5", FIELD_SHELL.md),
				type,
				"has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring",
				"has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-destructive/30",
				"has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50",
				className,
			)}
		>
			<Base.Chips className="contents">
				<Base.Value>
					{(selected: unknown) =>
						(Array.isArray(selected) ? (selected as Item[]) : []).map(
							(item, index) => {
								const label = chipLabel(item)
								return (
									<Base.Chip
										key={`${label}-${index}`}
										render={<Badge appearance="soft" size="sm" />}
										className="pe-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
									>
										{label}
										<Base.ChipRemove
											render={
												<Button
													variant="ghost"
													size="icon-xs"
													className="-my-1"
												/>
											}
											aria-label={`Remove ${label}`}
										>
											<Icon name="xmark" />
										</Base.ChipRemove>
									</Base.Chip>
								)
							},
						)
					}
				</Base.Value>
				<Base.Input
					className={cn(
						"min-w-24 flex-1 bg-transparent text-foreground outline-none",
						xs ? "h-5 px-1 text-ui-md" : "h-7 px-1.5 text-body-md",
						"placeholder:text-muted-foreground",
						"disabled:cursor-not-allowed",
					)}
					{...props}
				/>
			</Base.Chips>
			<FieldToggle xs={xs} />
		</Base.InputGroup>
	)
}

type PositionerProps = ComponentProps<typeof Base.Positioner>
type ContentProps = Omit<ComponentProps<typeof Base.Popup>, "className"> & {
	className?: string
	/** Which side of the input to render against. @default "bottom" */
	side?: PositionerProps["side"]
	/** Alignment along the chosen side. @default "start" */
	align?: PositionerProps["align"]
	/** Gap between input and popup, in px. @default 6 */
	sideOffset?: PositionerProps["sideOffset"]
	/**
	 * Whether the popup owns the scrolling. Set `false` when something inside it
	 * scrolls instead — a `ComboboxVirtualList`, which has to own the offset it
	 * windows by. Two nested scrollers give one wheel gesture two places to go.
	 * @default true
	 */
	scroll?: boolean
}

/**
 * The suggestions surface. Composes Portal + Positioner + Popup + List so
 * callers pass items/children directly. Defaults to the `bottom` side, `start`
 * aligned, 6px offset; matches the input width via `--anchor-width`.
 */
export function ComboboxContent({
	className,
	children,
	side = "bottom",
	align = "start",
	sideOffset = 6,
	scroll = true,
	...props
}: ContentProps) {
	// Reconnects the portaled list to the register its input lives in. The input
	// itself is in flow and inherits the CSS ladder; this popup is not, so
	// without it a Combobox in a compact Workspace renders page-sized rows over a
	// 32px trigger. See lib/density.
	const anchoredDensity = useAnchoredDensity()
	return (
		<ComboboxPortal>
			<Base.Positioner side={side} align={align} sideOffset={sideOffset} className="z-(--z-overlay)">
				<Base.Popup
					{...anchoredDensity}
					className={cn(
						"w-[var(--anchor-width)] origin-(--transform-origin) rounded-md border border-border-floating bg-popover text-popover-foreground shadow-md outline-none",
						// 18rem at rest, but never taller than the room the positioner
						// measured. See lib/anchored-scroll. When the popup gives up its
						// scrolling it gives up its padding with it — the child that
						// scrolls has to be the one that owns the inset, or the padding
						// sits outside the scroll box and the last row is cut off by it.
						scroll ? cn("popup-inset", anchoredListScroll) : "overflow-hidden",
						"motion-pop",
						className,
					)}
					{...props}
				>
					<HighlightGlide />
					{children}
				</Base.Popup>
			</Base.Positioner>
		</ComboboxPortal>
	)
}

type ItemProps = Omit<ComponentProps<typeof Base.Item>, "className"> & {
	className?: string
}

/**
 * A single suggestion row. Highlights via data-[highlighted]; a trailing check
 * (ItemIndicator) appears when the row is the selected value.
 */
export function ComboboxItem({ className, children, ...props }: ItemProps) {
	const tier = useTypeTier()
	return (
		<Base.Item
			className={cn(
				`flex cursor-default select-none items-center justify-between gap-(--item-gap) rounded-popup-item px-(--item-px) py-1.5 ${tier.body} outline-none motion-interactive data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:shrink-0`,
				className,
			)}
			{...props}
		>
			<span className="truncate">{children}</span>
			<Base.ItemIndicator className="flex items-center text-(--primary)">
				<Icon name="check" className="text-sm" />
			</Base.ItemIndicator>
		</Base.Item>
	)
}

type EmptyProps = Omit<ComponentProps<typeof Base.Empty>, "className"> & {
	className?: string
}

/** Shown when the filtered list is empty. Requires the `items` prop on Combobox. */
export function ComboboxEmpty({ className, ...props }: EmptyProps) {
	return (
		<Base.Empty
			className={cn(
				"px-2 py-6 text-center text-body-sm text-muted-foreground empty:m-0 empty:p-0",
				className,
			)}
			{...props}
		/>
	)
}

type GroupLabelProps = Omit<
	ComponentProps<typeof Base.GroupLabel>,
	"className"
> & { className?: string }

/** The label for a ComboboxGroup. Auto-associated with the group it sits in. */
export function ComboboxGroupLabel({ className, ...props }: GroupLabelProps) {
	const tier = useTypeTier()
	return (
		<Base.GroupLabel
			className={cn(
				`select-none px-(--item-px) py-1.5 ${tier.label} text-muted-foreground`,
				className,
			)}
			{...props}
		/>
	)
}

/** Rows rendered past each end of the viewport, so an arrow key never lands on nothing. */
const DEFAULT_OVERSCAN = 6
/**
 * The viewport height assumed until the scroll box has been measured — 18rem, the
 * same resting cap every anchored list surface uses. Only ever wrong for one
 * frame in a browser; in jsdom, where nothing has a layout, it is what makes the
 * window deterministic instead of empty.
 */
const ASSUMED_VIEWPORT = 288

type PlannedRow =
	| { kind: "label"; group: number; top: number }
	| { kind: "item"; group: number; top: number; item: unknown; index: number }

interface Plan {
	rows: PlannedRow[]
	/** Each group's slab: its label plus its items, whether or not they are on screen. */
	spans: { group: ComboboxItemGroup; top: number; height: number }[]
	/** Every item's offset, by flat index — what turns a highlight into a scroll. */
	itemTops: number[]
	height: number
	count: number
	grouped: boolean
}

function isGroup(item: unknown): item is ComboboxItemGroup {
	return (
		typeof item === "object" &&
		item !== null &&
		Array.isArray((item as { items?: unknown }).items)
	)
}

/**
 * Lays every row out at a fixed offset, before anything is rendered.
 *
 * Fixed heights rather than measured ones, deliberately: a row reserves its space
 * before its content has arrived, so something landing late (an image, a webfont)
 * changes how a row looks and never where the rows are. A measuring virtualizer
 * reflows the whole list every time that happens, on a list the user is dragging.
 */
function planRows(
	items: readonly unknown[],
	itemHeight: number,
	labelHeight: number,
): Plan {
	const rows: PlannedRow[] = []
	const spans: Plan["spans"] = []
	const itemTops: number[] = []
	const grouped = items.length > 0 && isGroup(items[0])
	const groups: ComboboxItemGroup[] = grouped
		? (items as ComboboxItemGroup[])
		: [{ value: null, items }]

	let y = 0
	let index = 0
	groups.forEach((group, g) => {
		const top = y
		if (grouped) {
			rows.push({ kind: "label", group: g, top: y })
			y += labelHeight
		}
		for (const item of group.items) {
			rows.push({ kind: "item", group: g, top: y, item, index })
			itemTops.push(y)
			index += 1
			y += itemHeight
		}
		spans.push({ group, top, height: y - top })
	})

	return { rows, spans, itemTops, height: y, count: index, grouped }
}

/** The first row at or past an offset. Rows are sorted by `top` by construction. */
function rowAt(rows: PlannedRow[], offset: number): number {
	let lo = 0
	let hi = rows.length - 1
	let found = rows.length
	while (lo <= hi) {
		const mid = (lo + hi) >> 1
		if (rows[mid].top >= offset) {
			found = mid
			hi = mid - 1
		} else {
			lo = mid + 1
		}
	}
	return found
}

export interface ComboboxVirtualListProps<Item = unknown> {
	/** Row height in px. Fixed, not measured — see `planRows`. */
	itemHeight: number
	/**
	 * Group heading height in px. Only read when `items` are grouped.
	 * @default 26
	 */
	groupLabelHeight?: number
	/** Rows kept rendered past each end of the viewport. @default 6 */
	overscan?: number
	/** A row's content. The ComboboxItem wrapper, its index and its position are ours. */
	children: (item: Item, state: { index: number }) => ReactNode
	/** A group heading's content. @default the group's `value` */
	renderGroupLabel?: (group: ComboboxItemGroup<Item>) => ReactNode
	/** Classes for the scroll box. Override the 18rem cap here. */
	className?: string
	/** Classes for each row. */
	itemClassName?: string
}

/**
 * A windowed ComboboxList: only the rows on screen exist.
 *
 * The point of it is what it does *not* ask you to take over. Base UI keeps its
 * filtering, and this reads the result through `useFilteredItems()` — so the list
 * being sized and windowed is, by construction, the same list Base UI is walking
 * with the arrow keys. The alternative (own `filteredItems`, own the geometry) is
 * a standing correctness bug: Base UI ignores `filteredItems` when the field
 * still holds the selected item's label and the user has not typed, and a
 * consumer who has not hand-copied that rule renders one set of rows while Base
 * UI indexes another. The symptom is clicking one row and getting a different
 * one, and it appears at exactly one moment — the first click after opening.
 *
 * Requires `virtualized` on the root (it tells Base UI the DOM holds only part of
 * the list) and `scroll={false}` on ComboboxContent (this box owns the offset):
 *
 *   <Combobox virtualized items={groups} value={value} onValueChange={setValue}>
 *     <ComboboxInput />
 *     <ComboboxContent scroll={false}>
 *       <ComboboxEmpty>No matches.</ComboboxEmpty>
 *       <ComboboxVirtualList itemHeight={30}>
 *         {(font: Font) => font.name}
 *       </ComboboxVirtualList>
 *     </ComboboxContent>
 *   </Combobox>
 *
 * Groups keep their `role="group"` wrapper and their label association: a group's
 * slab spans its whole range whether or not its rows are rendered, so the heading
 * scrolls with the category it names rather than with the window.
 */
export function ComboboxVirtualList<Item = unknown>({
	itemHeight,
	groupLabelHeight = 26,
	overscan = DEFAULT_OVERSCAN,
	children,
	renderGroupLabel,
	className,
	itemClassName,
}: ComboboxVirtualListProps<Item>) {
	const filtered = Base.useFilteredItems<unknown>()
	const bridge = useContext(ComboboxVirtualContext)

	const plan = useMemo(
		() => planRows(filtered, itemHeight, groupLabelHeight),
		[filtered, itemHeight, groupLabelHeight],
	)

	const boxRef = useRef<HTMLDivElement | null>(null)
	const planRef = useRef(plan)
	const [scrollTop, setScrollTop] = useState(0)
	const [viewHeight, setViewHeight] = useState(ASSUMED_VIEWPORT)
	const frame = useRef(0)

	// Read by the ref callback below, which runs on the commit that opens the
	// popup — after the previous commit's effects but before this one's.
	useEffect(() => {
		planRef.current = plan
	})

	const onScroll = useCallback(() => {
		if (frame.current) return
		frame.current = requestAnimationFrame(() => {
			frame.current = 0
			const box = boxRef.current
			if (!box) return
			setScrollTop(box.scrollTop)
			if (box.clientHeight > 0) setViewHeight(box.clientHeight)
		})
	}, [])

	useEffect(() => () => cancelAnimationFrame(frame.current), [])

	/** Puts a flat item index inside the box, moving as little as possible. */
	const reveal = useCallback(
		(index: number) => {
			const box = boxRef.current
			const top = planRef.current.itemTops[index]
			if (!box || top === undefined) return
			const bottom = top + itemHeight
			if (top < box.scrollTop) box.scrollTop = top
			else if (bottom > box.scrollTop + box.clientHeight) {
				box.scrollTop = bottom - box.clientHeight
			}
			setScrollTop(box.scrollTop)
		},
		[itemHeight],
	)

	// Publish the reveal to the root, which is where the highlight arrives.
	useEffect(() => {
		bridge?.register(reveal)
		return () => bridge?.register(null)
	}, [bridge, reveal])

	/**
	 * The row to land on once the box has a real height, or null once it has.
	 *
	 * Both of the things this component has to do on open — size its window, and
	 * scroll to the selection — need a measured viewport, and at the moment the
	 * box mounts it does not have one. The popup is positioned by Base UI a beat
	 * later, and until it is, `--available-height` is unset; a `max-height` of
	 * `min(18rem, var(--available-height))` with that variable missing is not a
	 * shorter cap, it is an *invalid declaration*, so the box measures its full
	 * content height. Measuring then and never again is how a virtual list quietly
	 * renders all two thousand rows: the window is real, it is just the size of
	 * the list. So the measurement is an observer, not a moment.
	 */
	const pendingReveal = useRef<number | null>(null)

	const measure = useCallback(() => {
		const box = boxRef.current
		if (!box) return
		const height = box.clientHeight
		if (height > 0) setViewHeight((current) => (current === height ? current : height))
		const pending = pendingReveal.current
		if (pending !== null && height > 0) {
			pendingReveal.current = null
			reveal(pending)
		}
	}, [reveal])

	useResizeObserver(measure, [boxRef])

	// Mounting the box IS the popup opening, which is the moment the list has to
	// be showing the current selection rather than the top of the alphabet.
	const attach = useCallback(
		(box: HTMLDivElement | null) => {
			boxRef.current = box
			if (!box) return
			const value = bridge?.value
			if (value == null) return
			const equal = bridge?.isItemEqualToValue as
				| ((item: unknown, value: unknown) => boolean)
				| undefined
			const selected = planRef.current.rows.find(
				(row) =>
					row.kind === "item" &&
					(equal ? equal(row.item, value) : Object.is(row.item, value)),
			)
			if (selected?.kind === "item") pendingReveal.current = selected.index
		},
		[bridge],
	)

	// A new query rewinds the box; otherwise it keeps an offset belonging to a
	// list that no longer exists. Skipped on the first plan, which is the open —
	// that one has already been scrolled to the selection.
	const previousPlan = useRef(plan)
	useEffect(() => {
		if (previousPlan.current === plan) return
		previousPlan.current = plan
		const box = boxRef.current
		if (box) {
			box.scrollTop = 0
			setScrollTop(0)
		}
	}, [plan])

	// Clamped, because a filter can shorten the list before the box has reported
	// scrolling: an unclamped offset windows past the end and blanks the list.
	const offset = Math.min(scrollTop, Math.max(0, plan.height - viewHeight))
	const first = Math.max(0, rowAt(plan.rows, offset) - overscan)
	const last = Math.min(
		plan.rows.length,
		rowAt(plan.rows, offset + viewHeight) + overscan,
	)
	const visible = plan.rows.slice(first, last)

	const row = (planned: Extract<PlannedRow, { kind: "item" }>, top: number) => (
		<ComboboxItem
			key={planned.index}
			value={planned.item}
			index={planned.index}
			aria-setsize={plan.count}
			aria-posinset={planned.index + 1}
			className={cn("absolute inset-x-0", itemClassName)}
			style={{ top, height: itemHeight }}
		>
			{children(planned.item as Item, { index: planned.index })}
		</ComboboxItem>
	)

	return (
		<Base.List
			ref={attach}
			onScroll={onScroll}
			className={cn(
				"max-h-[min(18rem,var(--available-height))] overflow-y-auto overscroll-contain popup-inset scrollbar-quiet",
				className,
			)}
			// The rows plus the popup inset above and below (see `popup-inset`).
			style={{ height: plan.height ? `calc(${plan.height}px + 2 * max(var(--spacing), var(--radius-md) / 3))` : 0 }}
		>
			<div className="relative w-full" style={{ height: plan.height }}>
				{plan.grouped
					? plan.spans.map((span, g) => {
							const rows = visible.filter(
								(planned) =>
									planned.kind === "item" && planned.group === g,
							) as Extract<PlannedRow, { kind: "item" }>[]
							if (rows.length === 0) return null
							return (
								<ComboboxGroup
									key={`${g}`}
									items={span.group.items}
									className="absolute inset-x-0"
									style={{ top: span.top, height: span.height }}
								>
									<ComboboxGroupLabel
										className="flex items-center px-(--item-px) py-0"
										style={{ height: groupLabelHeight }}
									>
										{renderGroupLabel
											? renderGroupLabel(
													span.group as ComboboxItemGroup<Item>,
												)
											: span.group.value}
									</ComboboxGroupLabel>
									{rows.map((planned) => row(planned, planned.top - span.top))}
								</ComboboxGroup>
							)
						})
					: visible.map((planned) =>
							planned.kind === "item" ? row(planned, planned.top) : null,
						)}
			</div>
		</Base.List>
	)
}
