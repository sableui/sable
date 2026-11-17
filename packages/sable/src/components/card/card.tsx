"use client"

import type { ComponentPropsWithRef, CSSProperties } from "react"
import { useContext } from "react"
import { useRender } from "@base-ui/react/use-render"
import { BLEED_LAST_END } from "../../lib/bleed"
import { cn } from "../../lib/cn"
import { CardDepthContext, StackedActionsContext, usePresentation } from "../../lib/presentation"

export interface CardProps extends ComponentPropsWithRef<"div"> {
	/**
	 * "default" = raised surface (bg-card + edge + soft shadow). "flat" = transparent.
	 * "featured" = the raised surface with a primary edge, for the one option a
	 * set recommends (the featured plan in a row of tiers). One per set; the
	 * edge says "this one", so pair it with a label that says why ("Most popular").
	 */
	variant?: "default" | "flat" | "featured"
	/**
	 * Padding scale for the Header/Content/Footer parts. "comfortable" = p-6 (the
	 * default); "compact" = p-4 — a denser section panel for settings/form blocks.
	 * Threaded to the parts via the inherited `--card-p` custom property, so set it
	 * once on the Card root.
	 */
	density?: "comfortable" | "compact"
	/**
	 * Replace the rendered element through Base UI's render prop — most often to
	 * make the whole card one link: `render={<a href="/x" />}` (or a router
	 * `<Link />` that renders an `<a>`). When the rendered element is a link
	 * (`a[href]`) or a `<button>`, the card picks up a hover state, a full-card
	 * focus-visible ring and `motion-interactive` easing; any other element
	 * (`<article>`, `<section>`, `<li>`) stays a static surface. A card that holds
	 * its own controls must not be a link — nested interactive content.
	 */
	render?: useRender.RenderProp
}

const DENSITY_PAD: Record<NonNullable<CardProps["density"]>, string> = {
	comfortable: "calc(var(--spacing) * 6)", // p-6
	compact: "calc(var(--spacing) * 4)", // p-4
}

/**
 * A raised surface container. Soft-square (rounded-lg). Never nest cards.
 *
 * Padding/density note: `--card-p` is set via this component's own inline
 * `style`, which always wins over a plain (non-`!important`) stylesheet rule
 * targeting the same custom property on the same element — regardless of
 * selector specificity. A `className` override like
 * `.my-card { --card-p: 2rem; }` will silently be ignored unless it uses
 * `!important`. Prefer the `density` prop for padding changes; if an
 * external override is unavoidable, it needs `!important` to win.
 */
/*
 * Interactive treatment keys off the RENDERED element, not a prop: a link or a
 * button is the only thing a pointer can act on, so only those get a hover and
 * a ring. A router `<Link />` renders an `<a>` and matches without Card knowing
 * the router; an `<article>` or `<li>` render stays static. There is no
 * `interactive` flag to forget, or to set on a card nothing can click.
 *
 * No `motion-press`: a 0.97 settle on a surface this size reads as the layout
 * lurching, not as a press. The hover and ring carry the response.
 *
 * A `<button>` centres its content vertically, so one stretched by a grid row
 * sat lower than the cards beside it. As a top-aligned flex column it lays out
 * like the `<div>` every other card is.
 */
const INTERACTIVE_BASE =
	"[&:is(a[href],button)]:motion-interactive [&:is(a[href],button)]:cursor-pointer [&:is(button)]:flex [&:is(button)]:w-full [&:is(button)]:flex-col [&:is(button)]:justify-start [&:is(button)]:text-start focus-visible:ring-2 focus-visible:ring-ring"
const INTERACTIVE_HOVER: Record<NonNullable<CardProps["variant"]>, string> = {
	default: "[&:is(a[href],button)]:hover:outline-border-strong [&:is(a[href],button)]:hover:shadow-md",
	flat: "[&:is(a[href],button)]:hover:bg-muted",
	// The primary edge IS the state, so hover lifts it without dimming the edge.
	featured: "[&:is(a[href],button)]:hover:shadow-md",
}

export function Card({
	variant = "default",
	density = "comfortable",
	className,
	style,
	render,
	ref,
	...props
}: CardProps) {
	// In a sheet a flat card is not a surface, and its padding is not an inset:
	// the sheet already pads its content. Bleeding out by exactly --card-p lines
	// the card's content up with the sheet's (the close button, the title) and
	// keeps the rhythm between the parts, which the same padding also spaces.
	// Inline, so it beats the w-full / max-w-* every block puts on its root.
	// Only the outermost card: a flat card nested in it is part of its content.
	const depth = useContext(CardDepthContext)
	const bleed = usePresentation() === "sheet" && variant === "flat" && depth === 0
	const element = useRender({
		render: render ?? <div />,
		ref,
		props: {
			"data-slot": "card",
			...props,
			className: cn(
				// group/card: parts can answer the card's hover, e.g. a trailing
				// chevron with `group-hover/card:translate-x-0.5`.
				"group/card block rounded-lg text-card-foreground",
				// The corner a box inset by the card padding should wear: concentric
				// (card radius less padding and border), floored at radius-sm like
				// sable-frame — at Sable's paddings the subtraction runs to ~0, and a
				// near-square box inside a rounded card reads as another system.
				// A field or panel inside reads it (ChatComposer does).
				"[--card-inner-radius:max(var(--radius-sm),calc(var(--radius-lg)-var(--card-p)))]",
				// Declares its surface so sable-well / sable-surface-interactive inside derive from the card.
				// The edge is an outline drawn 1px INSIDE the box, not a border: it
				// takes no space, so the card's padding is whole baseline steps and
				// its content starts on the rhythm instead of a pixel below it. It
				// paints above the card's in-flow content (a flush table's row fill);
				// a positioned child with a fill of its own would cover it, which no
				// card part has. DESIGN.md → Vertical rhythm.
				variant === "default" && "outline-1 -outline-offset-1 outline-border bg-card shadow-sm [--sable-surface-bg:var(--card)]",
				// Featured: the same surface, its edge drawn in primary and doubled
				// outward by a ring (2px in all), so it reads at a glance in a row of
				// default cards without a heavier shadow.
				variant === "featured" && "outline-1 -outline-offset-1 outline-primary ring-1 ring-primary bg-card shadow-sm [--sable-surface-bg:var(--card)]",
				// A CardList or a flush CardContent (an edge-to-edge Table) runs its
				// rows to the card's edges, and a row's hover fill or a TableFooter's
				// tint would otherwise poke square corners out past the card's
				// rounded ones — clip to the card's own curve instead. Nothing
				// overflows on purpose here: the table insets its edge cells by
				// --table-edge-px, so focus rings stay inside, and menus portal out.
				"has-data-[slot=card-list]:overflow-clip has-[[data-slot=card-content][data-flush]]:overflow-clip",
				INTERACTIVE_BASE,
				INTERACTIVE_HOVER[variant],
				className,
			),
			style: {
				"--card-p": DENSITY_PAD[density],
				...(bleed ? { margin: "calc(var(--card-p) * -1)", width: "calc(100% + var(--card-p) * 2)", maxWidth: "none" } : null),
				...style,
			} as CSSProperties,
		},
		defaultTagName: "div",
	})
	return <CardDepthContext.Provider value={depth + 1}>{element}</CardDepthContext.Provider>
}
Card.displayName = "Card"

export interface CardHeaderProps extends ComponentPropsWithRef<"div"> {
	/**
	 * Close the header with a hairline across the card, padded below like
	 * above — for a header that stays put over a part that scrolls or runs to
	 * the edges (a chat transcript, a panel body). The hairline is an inset
	 * shadow, like CardList's rows, so it takes no space off the rhythm.
	 */
	divided?: boolean
}

export function CardHeader({
	className,
	divided = false,
	...props
}: CardHeaderProps) {
	return (
		<div
			data-slot="card-header"
			data-divided={divided ? "" : undefined}
			className={cn(
				// Grid so an optional CardAction can pin to the top-right. Without
				// one it collapses to a single stacked column (same as before).
				// Zeroes its own bottom padding so it owns the CardHeader/CardContent
				// seam — CardContent always has full padding on its own (see below),
				// so a standalone CardContent never loses its top padding. As the
				// card's last child (a stat card: label, number, sparkline) nothing
				// follows to pad the bottom, so it keeps its own; zeroed, the number
				// sat on the card's bottom edge.
				// No row gap: the title and the description are spaced by their own
				// leading, as a row's two lines are; a gap on top set them further
				// apart than any other name-and-detail pair on the page.
				"grid auto-rows-min grid-cols-1 items-start gap-x-1.5 gap-y-0 p-[var(--card-p,--spacing(6))] pb-0 last:pb-[var(--card-p,--spacing(6))] has-data-[slot=card-action]:grid-cols-[1fr_auto]",
				divided && "pb-[var(--card-p,--spacing(6))] shadow-[inset_0_-1px_0_var(--border)]",
				className,
			)}
			{...props}
		/>
	)
}
CardHeader.displayName = "CardHeader"

/**
 * Header-aligned action slot — pins to the top-right of CardHeader (e.g. an
 * overflow menu, close button, or switch). Place as a child of CardHeader.
 *
 * A ghost or link Button that ends the slot bleeds by its padding at the end
 * (lib/bleed.ts), so a "View all" label or a "⋯" glyph lines up with the card's
 * content edge instead of sitting one padding inside it. Filled buttons keep
 * their edge on the line.
 */
export function CardAction({
	className,
	...props
}: ComponentPropsWithRef<"div">) {
	return (
		<div
			data-slot="card-action"
			className={cn(
				"col-start-2 row-span-2 row-start-1 self-start justify-self-end",
				BLEED_LAST_END,
				className,
			)}
			{...props}
		/>
	)
}
CardAction.displayName = "CardAction"

/** Title tier — a UI primitive title, not a document heading. */
export interface CardTitleProps extends ComponentPropsWithRef<"div"> {
	/**
	 * Render the title as another element — most often a heading, so a card's
	 * name joins the page outline: `render={<h2 />}`. The type tier stays.
	 */
	render?: useRender.RenderProp
}

/**
 * The card's name. A `<div>` by default, because a card's heading level depends
 * on where the card sits; pass `render={<h2 />}` (or h3…) to make it a heading.
 */
export function CardTitle({ className, render, ref, ...props }: CardTitleProps) {
	return useRender({
		render: render ?? <div />,
		ref,
		props: { ...props, className: cn("text-title-lg", className) },
		defaultTagName: "div",
	})
}
CardTitle.displayName = "CardTitle"

export function CardDescription({
	className,
	...props
}: ComponentPropsWithRef<"p">) {
	return (
		<p
			className={cn("text-body-sm text-muted-foreground", className)}
			{...props}
		/>
	)
}
CardDescription.displayName = "CardDescription"

/**
 * The body region. Full padding on all sides — CardContent does NOT assume a
 * preceding CardHeader. When used directly after a CardHeader, the seam
 * between them stays tight because CardHeader zeroes its own bottom padding
 * (`pb-0`), not because CardContent zeroes its top padding. This means
 * CardContent used standalone (no CardHeader above it, e.g. a grid of cards
 * with just an index + title + description in one CardContent) still gets
 * normal top padding instead of sitting flush against the card's top edge.
 */
export interface CardContentProps extends ComponentPropsWithRef<"div"> {
	/**
	 * Run the content edge to edge (no padding) — for a table that should span
	 * the card. Children that own their edges still line up with the card's
	 * padding: a Table insets its first and last columns by exactly `--card-p`
	 * (via `--table-edge-px`), so a flush table aligns with the CardHeader at
	 * any density, with no hand-set pl-6 / pr-6 on its columns.
	 */
	flush?: boolean
}

export function CardContent({
	className,
	flush = false,
	...props
}: CardContentProps) {
	return (
		<div
			data-slot="card-content"
			data-flush={flush ? "" : undefined}
			className={cn(
				flush
					? // Under a CardHeader a flush part has no padding of its own to set
					  // it off, so a table's column labels sat right under the
					  // description. Half the card padding, plus the head row's own
					  // inset, puts the labels a card padding below the header. A
					  // divided header has already closed itself.
					  "p-0 [--table-edge-px:var(--card-p,--spacing(6))] [[data-slot=card-header]:not([data-divided])+&]:mt-[calc(var(--card-p,--spacing(6))/2)]"
					: "p-[var(--card-p,--spacing(6))]",
				className,
			)}
			{...props}
		/>
	)
}
CardContent.displayName = "CardContent"

/**
 * Rows that run edge to edge in the card — Entity rows, most often —
 * separated by hairlines. Each row's inset is set from the card's own padding
 * (`--entity-px` from `--card-p`), so a list card's content lines up with
 * every other card's at any density, instead of each caller tuning row padding
 * by hand. Rows sit closer vertically (half the card padding) because a row's
 * neighbour is the next row, and every row takes the same padding, so a list
 * reads as even rows with the first and last no taller than the rest. Under a
 * CardHeader it opens with a hairline, set off from the title by the card
 * padding, the same space above the title; as the card's only child it fills
 * it. Rows are full-bleed, so an interactive row's hover and focus shape is
 * square (`--entity-radius: 0`) and the Card clips it to its own rounded corners.
 *
 *   <Card>
 *     <CardHeader><CardTitle>Members</CardTitle></CardHeader>
 *     <CardList>{people.map((p) => <Entity key={p.id} title={p.name} … />)}</CardList>
 *   </Card>
 */
export interface CardListProps extends ComponentPropsWithRef<"div"> {
	/**
	 * Draw a hairline between rows. Turn it off for a quiet list, where rows are
	 * set apart by their own spacing and the only rules are the ones between
	 * groups, which is space too (a CardListLabel after the first opens its
	 * group with it), and the footer below draws no rule either. A list
	 * of a few short rows under a title reads cleaner that way; keep the
	 * hairlines for long or dense lists, where the eye needs the tracks.
	 * @default true
	 */
	divided?: boolean
}

export function CardList({
	className,
	divided = true,
	...props
}: CardListProps) {
	return (
		<div
			data-slot="card-list"
			data-divided={divided ? "" : undefined}
			className={cn(
				"flex flex-col [--entity-radius:0px] [--entity-px:var(--card-p,--spacing(6))] [--entity-py:calc(var(--card-p,--spacing(6))/2)]",
				divided
					? // Hairlines between rows are inset shadows, not borders: a 1px border
					  // per row pushed every row below it a pixel further off the rhythm.
					  "[&>*+*]:shadow-[inset_0_1px_0_var(--border)] [[data-slot=card-header]+&]:mt-[var(--card-p,--spacing(6))] [[data-slot=card-header]+&>*:first-child]:shadow-[inset_0_1px_0_var(--border)]"
					: // No rules, so the list's own padding does the spacing: half the
					  // card padding above and below, which with a row's own half makes
					  // one card padding from the header to the first row's text and
					  // from the last row's text to the card's edge or the footer.
					  // A label after the first row opens a new group with space
					  // alone: a rule there would be the one line left in a list
					  // that has dropped its lines.
					  "pb-[calc(var(--card-p,--spacing(6))/2)] [[data-slot=card-header]+&]:mt-[calc(var(--card-p,--spacing(6))/2)] [&>[data-slot=card-list-label]:not(:first-child)]:mt-[calc(var(--card-p,--spacing(6))/2)]",
				className,
			)}
			{...props}
		/>
	)
}
CardList.displayName = "CardList"

export interface CardListLabelProps extends ComponentPropsWithRef<"div"> {
	/** Render the label as another element, most often a heading: `render={<h3 />}`. */
	render?: useRender.RenderProp
}

/**
 * The name of a group of rows in a CardList ("Signed-in devices", "Sources",
 * "Recent"). It sits on the rows' text edge, close above the rows it names. In
 * a list without hairlines, a label after the first row sets its group off
 * from the rows above with space.
 *
 *   <CardList divided={false}>
 *     <Entity title="Passkeys" … />
 *     <CardListLabel render={<h3 />}>Signed-in devices</CardListLabel>
 *     <Entity title="MacBook Pro" … />
 *   </CardList>
 */
export function CardListLabel({ className, render, ref, ...props }: CardListLabelProps) {
	return useRender({
		render: render ?? <div />,
		ref,
		props: {
			"data-slot": "card-list-label",
			...props,
			className: cn(
				"flex items-center gap-2 px-[var(--card-p,--spacing(6))] pt-[calc(var(--card-p,--spacing(6))/2)] pb-1 text-label-md text-muted-foreground",
				className,
			),
		},
		defaultTagName: "div",
	})
}
CardListLabel.displayName = "CardListLabel"

export interface CardFooterProps extends ComponentPropsWithRef<"div"> {
	/**
	 * The footer is the card's action row — its buttons and nothing else. On a
	 * page that changes nothing. In a sheet (`IosSheet`, a bottom `SheetContent`)
	 * the sheet owns the actions: the row becomes a full-width stack pinned to
	 * the bottom, the primary on top, every button at the cta height. Leave it
	 * off a footer that holds a caption, a price or a lone list affordance.
	 */
	actions?: boolean
}

/**
 * The card's closing band. Its top padding is zero because the part above
 * normally owns the seam (CardContent's own bottom padding) — so the two cases
 * where nothing above does are handled here:
 *
 * - straight after a CardHeader (no content between), it takes the card
 *   padding, or the actions sat right on the title;
 * - after an edge-to-edge part (a flush CardContent, a divided CardList; a
 *   list that has dropped its hairlines gets no rule here either), whose last
 *   row runs to the card's edges, it takes the padding AND a hairline — the
 *   mirror of the hairline CardList draws under a CardHeader. Without it the
 *   footer read as one more row of the table or list above it. A visually
 *   hidden node between the two (an `sr-only` live region announcing what a
 *   row's removal did) takes no space, so the seam looks through it: without
 *   that the footer's first line sat on the last row.
 */
export function CardFooter({
	actions = false,
	className,
	children,
	...props
}: CardFooterProps) {
	// Stacked: the DOM keeps the page order (secondary, then the trailing
	// primary), and column-reverse lifts the primary to the top of the bar.
	// The sheet owns the outermost card's actions (or a footer used on its own),
	// never those of a card nested inside it.
	const depth = useContext(CardDepthContext)
	const stacked = usePresentation() === "sheet" && actions && depth <= 1
	return (
		<div
			data-slot="card-footer"
			data-actions={actions ? (stacked ? "stack" : "row") : undefined}
			className={cn(
				"flex items-center gap-2 p-[var(--card-p,--spacing(6))] pt-0",
				"[[data-slot=card-header]+&]:pt-[var(--card-p,--spacing(6))]",
				"[:is([data-slot=card-list][data-divided],[data-slot=card-content][data-flush])+&]:shadow-[inset_0_1px_0_var(--border)] [:is([data-slot=card-list][data-divided],[data-slot=card-content][data-flush])+&]:pt-[var(--card-p,--spacing(6))]",
				"[:is([data-slot=card-list][data-divided],[data-slot=card-content][data-flush])+.sr-only+&]:shadow-[inset_0_1px_0_var(--border)] [:is([data-slot=card-list][data-divided],[data-slot=card-content][data-flush])+.sr-only+&]:pt-[var(--card-p,--spacing(6))]",
				className,
				stacked && "mt-auto flex-col-reverse items-stretch justify-start",
			)}
			{...props}
		>
			{stacked ? <StackedActionsContext.Provider value={true}>{children}</StackedActionsContext.Provider> : children}
		</div>
	)
}
CardFooter.displayName = "CardFooter"
