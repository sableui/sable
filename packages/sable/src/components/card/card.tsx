import type { ComponentPropsWithRef, CSSProperties } from "react"
import { useContext } from "react"
import { useRender } from "@base-ui/react/use-render"
import { BLEED_LAST_END } from "../../lib/bleed"
import { cn } from "../../lib/cn"
import { CardDepthContext, StackedActionsContext, usePresentation } from "../../lib/presentation"

export interface CardProps extends ComponentPropsWithRef<"div"> {
	/** "default" = raised surface (bg-card + border + soft shadow). "flat" = transparent. */
	variant?: "default" | "flat"
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
 */
const INTERACTIVE_BASE =
	"[&:is(a[href],button)]:motion-interactive [&:is(a[href],button)]:cursor-pointer [&:is(button)]:w-full [&:is(button)]:text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
const INTERACTIVE_HOVER: Record<NonNullable<CardProps["variant"]>, string> = {
	default: "[&:is(a[href],button)]:hover:border-border-strong [&:is(a[href],button)]:hover:shadow-md",
	flat: "[&:is(a[href],button)]:hover:bg-muted",
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
				"[--card-inner-radius:max(var(--radius-sm),calc(var(--radius-lg)-var(--card-p)-1px))]",
				// Declares its surface so sable-well / sable-surface-interactive inside derive from the card.
				variant === "default" && "border border-border bg-card shadow-sm [--sable-surface-bg:var(--card)]",
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

export function CardHeader({
	className,
	...props
}: ComponentPropsWithRef<"div">) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				// Grid so an optional CardAction can pin to the top-right. Without
				// one it collapses to a single stacked column (same as before).
				// Zeroes its own bottom padding so it owns the CardHeader/CardContent
				// seam — CardContent always has full padding on its own (see below),
				// so a standalone CardContent never loses its top padding. As the
				// card's last child (a stat card: label, number, sparkline) nothing
				// follows to pad the bottom, so it keeps its own; zeroed, the number
				// sat on the card's bottom edge.
				"grid auto-rows-min grid-cols-1 items-start gap-1.5 p-[var(--card-p,--spacing(6))] pb-0 last:pb-[var(--card-p,--spacing(6))] has-data-[slot=card-action]:grid-cols-[1fr_auto]",
				className,
			)}
			{...props}
		/>
	)
}

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
					? "p-0 [--table-edge-px:var(--card-p,--spacing(6))]"
					: "p-[var(--card-p,--spacing(6))]",
				className,
			)}
			{...props}
		/>
	)
}

/**
 * Rows that run edge to edge in the card — Entity rows, most often —
 * separated by hairlines. Each row's inset is set from the card's own padding
 * (`--entity-px` from `--card-p`), so a list card's content lines up with
 * every other card's at any density, instead of each caller tuning row padding
 * by hand. Rows sit closer vertically (half the card padding) because a row's
 * neighbour is the next row; the first and last rows take the full card
 * padding against the card's edge. Under a CardHeader it opens with a hairline
 * and a gap; as the card's only child it fills it. Rows are full-bleed, so an
 * interactive row's hover and focus shape is square (`--entity-radius: 0`) and
 * the Card clips it to its own rounded corners.
 *
 *   <Card>
 *     <CardHeader><CardTitle>Members</CardTitle></CardHeader>
 *     <CardList>{people.map((p) => <Entity key={p.id} title={p.name} … />)}</CardList>
 *   </Card>
 */
export function CardList({
	className,
	...props
}: ComponentPropsWithRef<"div">) {
	return (
		<div
			data-slot="card-list"
			className={cn(
				"flex flex-col divide-y divide-border [--entity-radius:0px] [--entity-px:var(--card-p,--spacing(6))] [--entity-py:calc(var(--card-p,--spacing(6))/2)]",
				// Between rows the half padding is enough (each side of a hairline
				// gets it); against the card's own edge the first and last rows take
				// the full card padding, so the list is inset like every other card.
				"*:first:pt-[var(--card-p,--spacing(6))] *:last:pb-[var(--card-p,--spacing(6))]",
				"[[data-slot=card-header]+&]:mt-[calc(var(--card-p,--spacing(6))/2)] [[data-slot=card-header]+&]:border-t [[data-slot=card-header]+&]:border-border",
				className,
			)}
			{...props}
		/>
	)
}

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
 * - after an edge-to-edge part (a flush CardContent, a CardList), whose last
 *   row runs to the card's edges, it takes the padding AND a hairline — the
 *   mirror of the hairline CardList draws under a CardHeader. Without it the
 *   footer read as one more row of the table or list above it.
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
				"[:is([data-slot=card-list],[data-slot=card-content][data-flush])+&]:border-t [:is([data-slot=card-list],[data-slot=card-content][data-flush])+&]:border-border [:is([data-slot=card-list],[data-slot=card-content][data-flush])+&]:pt-[var(--card-p,--spacing(6))]",
				className,
				stacked && "mt-auto flex-col-reverse items-stretch justify-start",
			)}
			{...props}
		>
			{stacked ? <StackedActionsContext.Provider value={true}>{children}</StackedActionsContext.Provider> : children}
		</div>
	)
}
