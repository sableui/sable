"use client";

import { type ComponentProps, type ReactNode, useState } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { beginScrub } from "../../lib/scrub-gesture"
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "../collapsible/collapsible"

type SectionProps = Omit<ComponentProps<"section">, "title"> & {
	/** Section name, rendered as the header. */
	title: ReactNode
	/** Optional trailing control in the header (a visibility toggle, an add action). */
	action?: ReactNode
}

/**
 * PanelSection — a flush group of property rows inside a docked panel: an eyebrow
 * header, a hairline above it, rows beneath. Deliberately NOT a Card.
 *
 * Cards are page-register furniture. Inside a 240px panel a card spends its
 * border and its inset on nothing and pushes every row inward, which is the
 * single strongest tell that a panel was built with page-register instincts.
 * Reference tools separate panel sections with hairlines and nothing else.
 *
 *   <PanelSection title="Blending">
 *     <PropertyRow label="Opacity">…</PropertyRow>
 *   </PanelSection>
 */
export function PanelSection({
	title,
	action,
	className,
	children,
	...props
}: SectionProps) {
	return (
		// Side padding and the first/last section's top/bottom come from a framing
		// sable-frame-tool, so rows stay concentric with a rounded frame's corners;
		// in a square Workspace column they fall back to the 8px tool inset.
		<section
			className={cn(
				"flex flex-col border-t border-hairline first:pt-[var(--panel-edge,0px)] last:pb-[var(--panel-edge,0px)]",
				className,
			)}
			{...props}
		>
			<header className="flex h-7 items-center justify-between gap-2 px-[var(--panel-inset,--spacing(2))]">
				<h3 className="text-ui-section text-foreground">{title}</h3>
				{action}
			</header>
			{/* 6px between rows, against the 4px a stacked row puts between its own
			    label and its control. Rows carry `py-0.5` as well, so what a reader
			    sees is 10px against 4px — separate properties read as separate, and
			    a label reads as belonging to the control beneath it.

			    It was `gap-0.5` (2px), which made those two distances 6px and 4px.
			    A column of stacked slider rows then had no grouping at all: every
			    label sat equidistant between the slider above it and its own, and
			    the section read as one undifferentiated stack. */}
			<div className="flex flex-col gap-1.5 px-[var(--panel-inset,--spacing(2))] pb-2">{children}</div>
		</section>
	)
}
PanelSection.displayName = "PanelSection"

type RowProps = Omit<ComponentProps<"div">, "children"> & {
	/** The property name. */
	label: ReactNode
	/** Associates the label with a control by id. */
	htmlFor?: string
	/** Long-form explanation, surfaced as the label's hover hint. */
	hint?: string
	/**
	 * Put the control on its own line beneath the label, for controls that need
	 * the panel's full width (a slider paired with its field).
	 */
	stacked?: boolean
	/**
	 * Make the property NAME a drag handle for its numeric value — the convention
	 * Figma, Framer and Paper all share, so users arrive already knowing it.
	 *
	 * This exists because `ScrubField` can only scrub what it can draw a handle
	 * on: its gesture is gated on `icon || prefix`, and a schema-generated
	 * parameter (`levels`, `count`, `seed`) has no glyph that is honest — a `#`
	 * in front of `levels` is noise pretending to be meaning. So the rows with no
	 * slider beside them were also the rows with no drag, which is backwards.
	 * Owning it here fixes every handle-less numeric row in every consumer at
	 * once, which is the property that makes it worth doing upstream at all.
	 *
	 * Opt-in and additive: a row that does not pass it is byte-identical to
	 * before, and adoption is per-row.
	 *
	 * The label stays a real `<label htmlFor>` — clicking it still focuses the
	 * field. A 2px jitter threshold separates the two: below it the click goes
	 * through untouched, above it the drag arms and the synthesised click is
	 * swallowed so releasing a scrub does not also select the input's text.
	 */
	scrub?: {
		value: number
		/** Units per pixel of travel. @default 1 */
		step?: number
		onValueChange: (next: number) => void
		/** Bracket the drag for undo — fired once when it arms, once on release. */
		onGestureStart?: () => void
		onGestureEnd?: () => void
		min?: number
		max?: number
		disabled?: boolean
	}
	children: ReactNode
}

/**
 * PropertyRow — label on the left, control on the right.
 *
 * The most repeated shape in tool UI: a property grid is made of these. Keeping
 * it as one component is what stops fifteen different property types each
 * inventing their own arrangement.
 */
export function PropertyRow({
	label,
	htmlFor,
	hint,
	stacked = false,
	scrub,
	className,
	children,
	...props
}: RowProps) {
	// `preventDefaultOnDown: false` is the whole reason this shares a function
	// with ScrubField rather than copying it — the default action on a
	// <label htmlFor> is "focus the field", and that must survive.
	const scrubProps = scrub
		? {
				onPointerDown: (e: React.PointerEvent<HTMLLabelElement>) =>
					beginScrub(e, {
						value: scrub.value,
						step: scrub.step ?? 1,
						clamp: (n: number) =>
							Math.min(scrub.max ?? Number.POSITIVE_INFINITY, Math.max(scrub.min ?? Number.NEGATIVE_INFINITY, n)),
						onValueChange: scrub.onValueChange,
						onGestureStart: scrub.onGestureStart,
						onGestureEnd: scrub.onGestureEnd,
						disabled: scrub.disabled,
						preventDefaultOnDown: false,
					}),
				// The affordance has to be visible before the drag, or nobody finds
				// it; `select-none` so a slow drag does not highlight the word.
				className: scrub.disabled ? undefined : "cursor-ew-resize select-none",
				title: hint ?? (scrub.disabled ? undefined : "Drag to change"),
			}
		: null

	if (stacked) {
		return (
			<div className={cn("flex flex-col gap-1 py-0.5", className)} {...props}>
				<label
					htmlFor={htmlFor}
					title={hint}
					{...scrubProps}
					className={cn("text-ui-md text-muted-foreground", scrubProps?.className)}
				>
					{label}
				</label>
				{children}
			</div>
		)
	}

	return (
		<div className={cn("flex min-h-6 items-center gap-2 py-0.5", className)} {...props}>
			<label
				htmlFor={htmlFor}
				title={hint}
				{...scrubProps}
				className={cn(
					"min-w-0 flex-1 truncate text-ui-md text-muted-foreground",
					scrubProps?.className,
				)}
			>
				{label}
			</label>
			<div className="flex shrink-0 items-center gap-1">{children}</div>
		</div>
	)
}
PropertyRow.displayName = "PropertyRow"

type PairProps = ComponentProps<"div"> & {
	/** Optional small captions above each control. */
	labels?: [ReactNode, ReactNode]
}

/**
 * PropertyPair — two controls side by side, optionally captioned.
 *
 * Reference tools pair properties 2-up rather than giving each a full-width row
 * (Figma: *Opacity | Corner radius*; Paper: *opacity | blend mode*). In a 240px
 * panel that halves the vertical cost of every property and puts related values
 * on one scan line.
 */
export function PropertyPair({ labels, className, children, ...props }: PairProps) {
	return (
		<div className={cn("flex flex-col gap-1 py-0.5", className)} {...props}>
			{labels ? (
				<div className="grid grid-cols-2 gap-2">
					{labels.map((text, i) => (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: a fixed-length pair
							key={i}
							className="truncate text-ui-md text-muted-foreground"
						>
							{text}
						</span>
					))}
				</div>
			) : null}
			<div className="grid grid-cols-2 gap-2">{children}</div>
		</div>
	)
}
PropertyPair.displayName = "PropertyPair"

type GroupProps = Omit<ComponentProps<typeof Collapsible>, "children" | "className"> & {
	/** The group's name. */
	label: ReactNode
	/**
	 * What the group is set to, readable while it is closed: a value ("Cool",
	 * "200% pull"), a few swatches, or both. Sits before the indicator.
	 */
	summary?: ReactNode
	className?: string
	children: ReactNode
}

/**
 * PropertyGroup — a set of properties that folds behind one row, inside a
 * PanelSection: the row names the group and summarises its value, and opens to
 * the controls beneath it. The +/− tools use for "more here" (Figma's
 * collapsible layer properties), at the panel's own scale — an Accordion is
 * page furniture, its title-sized trigger twice the height of a property row.
 *
 * Each group opens on its own, so two can be compared side by side. Groups
 * stack with a hairline between them; the summary is what keeps a closed
 * group honest, so give it the value, not a restatement of the label.
 *
 *   <PropertyGroup label="Neutrals" summary="Cool">
 *     <PropertyRow label="Tint">…</PropertyRow>
 *   </PropertyGroup>
 */
export function PropertyGroup({
	label,
	summary,
	className,
	children,
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	...props
}: GroupProps) {
	// The open state is mirrored here because the +/− swap (motion-icon-swap)
	// needs each glyph to carry its own active flag, and Base UI only marks the
	// trigger. A controlled `open` still wins.
	const [openState, setOpenState] = useState(defaultOpen)
	const open = openProp ?? openState
	return (
		<Collapsible
			className={cn("border-t border-hairline", className)}
			open={openProp}
			defaultOpen={defaultOpen}
			onOpenChange={(next, details) => {
				setOpenState(next)
				onOpenChange?.(next, details)
			}}
			{...props}
		>
			<CollapsibleTrigger className="flex h-(--control-sm) w-full items-center gap-2 rounded-xs text-start motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
				<span className="min-w-0 flex-1 truncate text-ui-md text-foreground">{label}</span>
				{summary != null ? <span className="flex min-w-0 shrink items-center gap-2 truncate text-ui-md text-muted-foreground">{summary}</span> : null}
				{/* Both glyphs stay mounted and swap as one mark, so + turning into −
				    reads as this row's state changing, not a second icon landing. */}
				<span aria-hidden="true" className="motion-icon-swap shrink-0 text-xs text-muted-foreground">
					<span data-active={!open} className="inline-flex">
						<Icon name="plus" />
					</span>
					<span data-active={open} className="inline-flex">
						<Icon name="minus" />
					</span>
				</span>
			</CollapsibleTrigger>
			<CollapsiblePanel>
				{/* The same rhythm as a PanelSection's rows, so a group opens into rows that read as the section's own. */}
				<div className="flex flex-col gap-1.5 pt-0.5 pb-2">{children}</div>
			</CollapsiblePanel>
		</Collapsible>
	)
}
PropertyGroup.displayName = "PropertyGroup"
