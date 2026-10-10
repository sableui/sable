"use client";

import type { ComponentProps, KeyboardEvent, ReactNode } from "react"
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { hitTargetMin } from "../../lib/hit-target"

/* ==========================================================================
   Tree — the object list every tool has: layers, scene graph, file explorer,
   inspector outline.

   This exists because of ONE class of defect. A tree's left edges carry all of
   its meaning — depth, kind, containment — and they are computed in several
   places by several people: the row, the disclosure, the section header, and
   whatever "add" affordance sits at the end of a branch. When each picks its
   own inset, the panel acquires three or four different left edges and stops
   reading as a column at all. The version this was promoted from had exactly
   that: rows at 4px, headers at 8px, an indent step of 14px against a 16px
   disclosure column, and add-affordances hardcoded at 18px.

   The 14-against-16 is the instructive one. When the indent step is SMALLER
   than the column, a child's content lands to the LEFT of where its parent's
   content starts, so nesting reads inverted — the tree looks like it outdents
   as it descends. Hence the invariant, declared in `_contract.ts` and asserted
   in `themes.test.ts`:

       --tree-indent MUST equal --tree-column

   Everything here derives its left edge from `treeIndent()`. Nothing in this
   file, and nothing a consumer writes, should hardcode a tree inset.
   ========================================================================== */

/**
 * The left inset for a row at `depth`, as a CSS expression.
 *
 * Returned as `calc()` rather than a number so the geometry stays in the density
 * ladder: a `data-density` scope retunes the whole tree, and a theme can override
 * it, without any consumer recomputing pixels.
 */
export function treeIndent(depth: number): string {
	return `calc(var(--tree-rail) + var(--tree-indent) * ${Math.max(0, depth)})`
}

function DisclosureMark() {
	return <Icon name="chevron-down" />
}

function AddMark() {
	return <Icon name="plus" />
}

/** Sizes a slot to the structural column and renders its mark at that size 1:1. */
const COLUMN_SLOT = "flex shrink-0 items-center justify-center [font-size:var(--tree-column)]"
const COLUMN_BOX = { width: "var(--tree-column)", height: "var(--tree-column)" } as const

/* --- Tree semantics ---------------------------------------------------------
   Inside a <Tree>, the whole structure is an ARIA tree view:

     Tree         role="tree", owns roving focus and the arrow keys
     TreeSection  role="group", labelled by its heading
     TreeRow      role="treeitem", aria-level, aria-expanded, aria-selected
     TreeAddRow   role="treeitem" (it is reachable by arrows like any row)

   Rows stay FLAT siblings in the DOM — hierarchy is carried by aria-level, not
   by nesting — because the rows' hover and selection fills must span the full
   panel width, and because a consumer-built flat list (`depth` per row) and a
   nested one (`subtree`) must navigate identically. So the keyboard model reads
   the DOM: "parent" is the nearest previous treeitem with a lower aria-level,
   "first child" is the next treeitem if its level is higher.

   Selection mapping, one rule: a row INSIDE a Tree is a treeitem and exposes
   selection as aria-selected. A row rendered OUTSIDE a Tree is a plain div,
   where aria-selected is invalid, so it falls back to aria-current. A
   navigation tree that wants aria-current="page" passes it through props.
   ------------------------------------------------------------------------- */

interface TreeContextValue {
	/** Id of the treeitem currently in the tab order (roving tabindex). */
	focusedId: string | null
	setFocusedId: (id: string) => void
	/** A row unmounted; drop the tab stop if it was there, so Tree re-seeds it. */
	release: (id: string) => void
}

const TreeContext = createContext<TreeContextValue | null>(null)

/** The depth nested rows inherit — set by a row's `subtree`. */
const TreeDepthContext = createContext(0)

const ITEM = '[role="treeitem"]'

/** Roving-tabindex props for an element that is a treeitem inside a Tree. */
function useTreeItem(idProp: string | undefined) {
	const ctx = useContext(TreeContext)
	const generated = useId()
	const id = idProp ?? generated
	const release = ctx?.release
	useEffect(() => () => release?.(id), [release, id])
	return {
		inTree: ctx !== null,
		id,
		tabIndex: ctx ? (ctx.focusedId === id ? 0 : -1) : undefined,
		claimFocus: () => ctx?.setFocusedId(id),
	}
}

const ITEM_FOCUS =
	"focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"

/* --- Tree ---------------------------------------------------------------- */

/**
 * Tree — the container, and an ARIA tree view (`role="tree"`). Give it an
 * `aria-label` naming the hierarchy ("Layers", "Files").
 *
 * Exactly one row is in the tab order (roving tabindex). ArrowUp/Down move
 * between visible rows, ArrowRight expands a collapsed row and then steps to its
 * first child, ArrowLeft collapses an expanded row or steps to its parent,
 * Home/End jump to the ends, and Enter/Space activate the row (its `onClick`).
 *
 * Does not scroll on its own; put it in a scrolling `Panel`, or pass
 * `className="min-h-0 flex-1 overflow-y-auto scrollbar-quiet"` when the tree is
 * the scrolling region itself.
 */
export function Tree({ className, children, onKeyDown, ...props }: ComponentProps<"div">) {
	const [focusedId, setFocusedId] = useState<string | null>(null)
	const rootRef = useRef<HTMLDivElement | null>(null)

	const items = () =>
		Array.from(rootRef.current?.querySelectorAll<HTMLElement>(ITEM) ?? []).filter(
			(el) => el.closest('[role="tree"]') === rootRef.current,
		)

	// Keep exactly one tab stop. When none of the rendered rows holds it — first
	// render, or the row that held it was collapsed away — seed it on the
	// selected row, else the first. Runs every render but only sets state when
	// the stop is actually missing, so it cannot loop.
	useLayoutEffect(() => {
		const all = items()
		if (all.length === 0) return
		if (focusedId && all.some((el) => el.id === focusedId)) return
		const next = all.find((el) => el.getAttribute("aria-selected") === "true") ?? all[0]
		if (next && next.id !== focusedId) setFocusedId(next.id)
	})

	// Stable, so a row's unmount effect never re-fires just because focus moved.
	const release = useCallback(
		(id: string) => setFocusedId((prev) => (prev === id ? null : prev)),
		[],
	)
	const context = useMemo<TreeContextValue>(
		() => ({ focusedId, setFocusedId, release }),
		[focusedId, release],
	)

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		onKeyDown?.(event)
		if (event.defaultPrevented) return
		// Only keys pressed ON a row. A key in a row's action button or an inline
		// rename field belongs to that control, not to tree navigation.
		const current = event.target as HTMLElement
		if (current.getAttribute("role") !== "treeitem") return
		const all = items()
		const index = all.indexOf(current)
		if (index === -1) return

		const level = (el: HTMLElement) => Number(el.getAttribute("aria-level") ?? 1)
		const expanded = current.getAttribute("aria-expanded")
		const toggle = () =>
			current.querySelector<HTMLElement>("[data-tree-toggle]")?.click()
		const move = (el: HTMLElement | undefined) => {
			event.preventDefault()
			el?.focus()
		}

		switch (event.key) {
			case "ArrowDown":
				move(all[index + 1])
				break
			case "ArrowUp":
				move(all[index - 1])
				break
			case "Home":
				move(all[0])
				break
			case "End":
				move(all[all.length - 1])
				break
			case "ArrowRight": {
				if (expanded === "false") {
					event.preventDefault()
					toggle()
				} else if (expanded === "true") {
					const next = all[index + 1]
					move(next && level(next) > level(current) ? next : undefined)
				}
				break
			}
			case "ArrowLeft": {
				if (expanded === "true") {
					event.preventDefault()
					toggle()
				} else {
					const own = level(current)
					move(all.slice(0, index).reverse().find((el) => level(el) < own))
				}
				break
			}
			case "Enter":
			case " ":
				event.preventDefault()
				current.click()
				break
		}
	}

	return (
		<TreeContext.Provider value={context}>
			<div
				ref={rootRef}
				role="tree"
				onKeyDown={handleKeyDown}
				className={cn("flex flex-col py-1", className)}
				{...props}
			>
				{children}
			</div>
		</TreeContext.Provider>
	)
}
Tree.displayName = "Tree"

type SectionProps = Omit<ComponentProps<"section">, "title"> & {
	/** Section name. */
	title: ReactNode
	/** Long-form explanation, surfaced as the header's hover hint. */
	hint?: string
	/** Trailing header content — a count, a collapse-all, an add action. */
	action?: ReactNode
}

/**
 * TreeSection — a titled group of rows.
 *
 * The header sits on the SAME rail as a depth-0 row, and on the same height as
 * one. Sections are separated by space and a hairline, never by a different
 * inset: an indented header is the fastest way to break the column. The first
 * section drops its divider, so a consumer never hand-manages that.
 */
export function TreeSection({ title, hint, action, className, children, ...props }: SectionProps) {
	const inTree = useContext(TreeContext) !== null
	const headingId = useId()
	return (
		<section
			// Inside a tree, a section is a labelled group of treeitems.
			role={inTree ? "group" : undefined}
			aria-labelledby={inTree ? headingId : undefined}
			className={cn(
				"flex flex-col border-t border-hairline pt-1",
				"mt-2 first:mt-0 first:border-t-0 first:pt-0",
				className,
			)}
			{...props}
		>
			<header
				style={{ paddingInlineStart: "var(--tree-rail)" }}
				className="flex h-(--control-xs) shrink-0 items-center justify-between gap-2 pe-2"
			>
				<h3 id={headingId} title={hint} className="min-w-0 truncate text-ui-section text-muted-foreground">
					{title}
				</h3>
				{action}
			</header>
			{children}
		</section>
	)
}
TreeSection.displayName = "TreeSection"

type RowProps = ComponentProps<"div"> & {
	/**
	 * Nesting level. 0 sits on the rail; each level adds one `--tree-indent`.
	 * @default the parent row's depth + 1 inside a `subtree`, else 0
	 */
	depth?: number
	/** Renders the selection fill, and by default a leading accent bar. */
	selected?: boolean
	/**
	 * Draws the leading accent bar on a selected row.
	 *
	 * Turn it off where the fill alone reads as selection — a dense panel of
	 * short rows, say, where the bar is a second mark for one piece of state.
	 * The fill and the ARIA selection state both stay, so the row is still selected to a
	 * screen reader and still distinct to the eye; only the second mark goes.
	 * @default true
	 */
	accent?: boolean
	/** Half-opacity, for a row whose contribution is currently switched off. */
	dimmed?: boolean
	/**
	 * Whether this row has children to disclose.
	 * @default true when `subtree` is passed, else false
	 */
	expandable?: boolean
	/** Controlled open state. Pair with `onExpandedChange`. */
	expanded?: boolean
	/**
	 * Uncontrolled initial open state, used when `expanded` is not passed.
	 * @default true
	 */
	defaultExpanded?: boolean
	/** Called when the row opens or closes — disclosure, arrow keys, or row activation. */
	onExpandedChange?: (expanded: boolean) => void
	/**
	 * The rows nested under this one. Rendered after the row while it is
	 * expanded, and nested `TreeRow`/`TreeAddRow`s inherit `depth + 1` unless
	 * they pass their own. This is what makes `defaultExpanded` useful: an
	 * uncontrolled row hides its own descendants.
	 */
	subtree?: ReactNode
	/**
	 * Name of the thing being disclosed, for the toggle's accessible label
	 * ("Expand Background"). Falls back to a generic label.
	 */
	toggleLabel?: string
	/** Replaces the built-in disclosure mark. */
	disclosureIcon?: ReactNode
	/** The kind marker, rendered in the type column. Size it to `1em`. */
	icon?: ReactNode
	/** Right-rail controls: visibility, solo, a row menu. */
	actions?: ReactNode
	/** The row's name. */
	children?: ReactNode
}

/**
 * TreeRow — one node.
 *
 * Layout is `[rail][disclosure][type][name ……][actions]`. The two leading
 * columns are always occupied, empty or not: that is what keeps a leaf's name on
 * the same edge as a parent's, and it is why a childless row still reserves its
 * disclosure slot.
 *
 * Mutable state goes in `actions`, on the right. Putting a visibility toggle on
 * the LEFT — a common instinct, and what the promoted version did first — makes
 * every row's visual start depend on its depth, so no two rows share an edge.
 *
 *   <TreeRow depth={0} icon={<Icon name="image-stack" />} actions={<VisibilityButton />}
 *            expandable expanded={open} onExpandedChange={setOpen} toggleLabel="Background">
 *     Background
 *   </TreeRow>
 */
export function TreeRow({
	depth: depthProp,
	selected = false,
	accent = true,
	dimmed = false,
	expandable: expandableProp,
	expanded: expandedProp,
	defaultExpanded = true,
	onExpandedChange,
	subtree,
	toggleLabel,
	disclosureIcon,
	icon,
	actions,
	className,
	style,
	id: idProp,
	onClick,
	onFocus,
	children,
	...props
}: RowProps) {
	const inheritedDepth = useContext(TreeDepthContext)
	const depth = depthProp ?? inheritedDepth
	const expandable = expandableProp ?? subtree !== undefined
	const [innerExpanded, setInnerExpanded] = useState(defaultExpanded)
	const controlled = expandedProp !== undefined
	const expanded = controlled ? expandedProp : innerExpanded
	const setExpanded = (next: boolean) => {
		if (!controlled) setInnerExpanded(next)
		onExpandedChange?.(next)
	}

	const item = useTreeItem(idProp)
	const nameId = useId()

	const row = (
		<div
			{...props}
			id={item.inTree ? item.id : idProp}
			data-selected={selected || undefined}
			// One mapping (see "Tree semantics"): a treeitem exposes selection with
			// aria-selected; outside a Tree the row is a plain div, where only
			// aria-current is valid. `data-selected` is the styling hook for both.
			role={item.inTree ? "treeitem" : undefined}
			aria-level={item.inTree ? depth + 1 : undefined}
			aria-expanded={item.inTree && expandable ? expanded : undefined}
			aria-selected={item.inTree ? selected : undefined}
			aria-current={!item.inTree && selected ? true : undefined}
			// Named by its own label only — never the text of its action buttons.
			aria-labelledby={item.inTree ? nameId : undefined}
			tabIndex={item.tabIndex}
			onFocus={(event) => {
				item.claimFocus()
				onFocus?.(event)
			}}
			// A row with no action of its own toggles when activated, the way a
			// folder does in a file explorer. A row WITH onClick selects instead,
			// and opens only from the disclosure or ArrowRight.
			onClick={onClick ?? (expandable ? () => setExpanded(!expanded) : undefined)}
			// Indent with padding rather than a wrapper, so the hover and selection
			// fills still span the panel's full width the way reference tools do.
			style={{ paddingInlineStart: treeIndent(depth), ...style }}
			className={cn(
				"group relative flex h-(--control-xs) items-center gap-1.5 rounded-xs pe-1 motion-interactive",
				selected ? "bg-panel-raised" : "hover:bg-panel-raised/60",
				item.inTree && ITEM_FOCUS,
				dimmed && "opacity-50",
				className,
			)}
		>
			{selected && accent ? (
				<span
					aria-hidden
					className="absolute inset-y-0.5 start-0 w-0.5 rounded-full bg-primary"
				/>
			) : null}

			{expandable ? (
				<button
					type="button"
					data-tree-toggle=""
					aria-expanded={expanded}
					aria-label={
						expanded
							? `Collapse ${toggleLabel ?? "group"}`
							: `Expand ${toggleLabel ?? "group"}`
					}
					// Inside a Tree the treeitem itself carries aria-expanded and the arrow
					// keys, so the button is a pointer target only: out of the tab order,
					// hidden from AT, and it leaves focus where it was when clicked.
					aria-hidden={item.inTree || undefined}
					tabIndex={item.inTree ? -1 : undefined}
					onMouseDown={item.inTree ? (event) => event.preventDefault() : undefined}
					onClick={(event) => {
						// A tree row is usually clickable itself; without this the toggle
						// would also select, which makes collapsing change the selection.
						event.stopPropagation()
						setExpanded(!expanded)
					}}
					style={COLUMN_BOX}
					className={cn(
						COLUMN_SLOT,
						// The drawn box stays on --tree-column because that column is also
						// the indent step; a bigger button moves every name in the tree.
						hitTargetMin,
						"rounded-xs text-muted-foreground motion-interactive hover:text-foreground",
						!expanded && "-rotate-90",
					)}
				>
					{disclosureIcon ?? <DisclosureMark />}
				</button>
			) : (
				<span aria-hidden style={COLUMN_BOX} className="shrink-0" />
			)}

			<span aria-hidden style={COLUMN_BOX} className={cn(COLUMN_SLOT, "text-muted-foreground")}>
				{icon}
			</span>

			<span id={nameId} className="min-w-0 flex-1 truncate text-ui-md text-foreground">
				{children}
			</span>

			{actions ? <span className="flex shrink-0 items-center">{actions}</span> : null}
		</div>
	)

	if (subtree === undefined) return row
	return (
		<>
			{row}
			{expanded ? (
				<TreeDepthContext.Provider value={depth + 1}>{subtree}</TreeDepthContext.Provider>
			) : null}
		</>
	)
}
TreeRow.displayName = "TreeRow"

type EmptyProps = ComponentProps<"div"> & {
	/**
	 * The depth of the branch that is empty — pass the depth its rows would
	 * use, so the line starts on the same edge as those rows' disclosure column.
	 * @default the parent row's depth + 1 inside a `subtree`, else 0 (the rail)
	 */
	depth?: number
	/**
	 * One short line — "No images yet", not a sentence explaining the feature.
	 * A 240px panel wraps anything longer, and a two-line paragraph immediately
	 * outweighs the affordance next to it.
	 */
	message: ReactNode
	/** The single way out of the empty state, normally a `TreeAddRow`. */
	action?: ReactNode
	/**
	 * Render as a drop region — a dashed hairline frame. Sets `data-drop-target`
	 * so a `data-[drop-active]` style can respond; wire the actual drag handlers
	 * yourself via the passthrough props.
	 */
	dropTarget?: boolean
}

/**
 * TreeEmpty — the empty state for a tree section, at panel scale.
 *
 * Do NOT use `EmptyState` here. That is page-register furniture: `px-6 py-12`
 * around a `size-12` icon disc, which inside a 240px panel spends 24px of inset
 * and ~96px of height on nothing — the same mistake as putting a `Card` in a
 * panel, and the strongest tell that a panel was built with page-register
 * instincts.
 *
 * The other half of this is editorial, and the component is shaped to force it:
 * an empty section should offer **one** way forward. A prose sentence *and* an
 * add row is two, and the sentence is the one carrying no affordance — so
 * `message` is a single line and the action is a slot, not a sibling.
 */
export function TreeEmpty({
	depth: depthProp,
	message,
	action,
	dropTarget = false,
	className,
	children,
	...props
}: EmptyProps) {
	const inheritedDepth = useContext(TreeDepthContext)
	const depth = depthProp ?? inheritedDepth
	return (
		<div
			data-drop-target={dropTarget || undefined}
			className={cn(
				"flex flex-col",
				dropTarget &&
					"mx-2 my-1 gap-1 rounded-sm border border-dashed border-hairline-strong p-2",
				className,
			)}
			{...props}
		>
			<p
				style={dropTarget ? undefined : { paddingInlineStart: treeIndent(depth) }}
				className={cn(
					"flex h-(--control-xs) items-center text-ui-body text-muted-foreground",
					dropTarget ? "justify-center" : "pe-2",
				)}
			>
				{message}
			</p>
			{action}
			{children}
		</div>
	)
}
TreeEmpty.displayName = "TreeEmpty"

type AddRowProps = Omit<ComponentProps<"button">, "children"> & {
	/** The depth of the branch this adds to — pass the depth its siblings use. */
	depth?: number
	/** Visible label. Say what gets added: "Add effect", not "Add". */
	label: ReactNode
	/** Replaces the built-in add mark. */
	icon?: ReactNode
}

/**
 * TreeAddRow — the affordance that ends a branch.
 *
 * The mark sits in the TYPE column, level with the kind-markers of the rows it
 * adds to, and the label sits in the name column. Both of the obvious
 * alternatives are wrong in a way that shows: putting the mark in the name
 * column aligns it with the text but leaves the type column empty, so the row
 * reads as outdented from its own siblings; and rendering a bare glyph with no
 * label gives a 16px target that says nothing about what it adds.
 *
 * Pass the SAME depth as the rows it belongs with — one deeper than the parent
 * for a child list, the parent's own depth for a sibling list.
 */
export function TreeAddRow({
	depth: depthProp,
	label,
	icon,
	className,
	style,
	id: idProp,
	onFocus,
	...props
}: AddRowProps) {
	const inheritedDepth = useContext(TreeDepthContext)
	const depth = depthProp ?? inheritedDepth
	const item = useTreeItem(idProp)
	return (
		<button
			type="button"
			{...props}
			id={item.inTree ? item.id : idProp}
			// Inside a Tree it is a treeitem, so the arrow keys reach it like any row
			// and Enter/Space activate it.
			role={item.inTree ? "treeitem" : undefined}
			aria-level={item.inTree ? depth + 1 : undefined}
			tabIndex={item.tabIndex}
			onFocus={(event) => {
				item.claimFocus()
				onFocus?.(event)
			}}
			style={{ paddingInlineStart: treeIndent(depth), ...style }}
			className={cn(
				"group flex h-(--control-xs) w-full items-center gap-1.5 rounded-xs pe-1 motion-interactive",
				"text-ui-md text-muted-foreground hover:bg-panel-raised/60 hover:text-foreground",
				ITEM_FOCUS,
				className,
			)}
		>
			{/* The disclosure column, reserved and empty — an add row discloses nothing. */}
			<span aria-hidden style={COLUMN_BOX} className="shrink-0" />
			<span aria-hidden style={COLUMN_BOX} className={COLUMN_SLOT}>
				{icon ?? <AddMark />}
			</span>
			<span className="min-w-0 truncate">{label}</span>
		</button>
	)
}
TreeAddRow.displayName = "TreeAddRow"
