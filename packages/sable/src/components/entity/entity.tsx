"use client"

import { useRender } from "@base-ui/react/use-render"
import type { VariantProps } from "class-variance-authority"
import { type ComponentPropsWithRef, isValidElement, type ReactNode } from "react"
import { cn } from "../../lib/cn"
import { entityVariants } from "./entity.variants"

interface EntityBaseProps extends VariantProps<typeof entityVariants> {
	/** Leading visual — typically an Avatar or an Icon. */
	leading?: ReactNode
	/** Primary line (text-title-sm, truncated). */
	title: ReactNode
	/** Secondary line (text-body-sm muted, truncated). */
	subtitle?: ReactNode
	/** Let the subtitle wrap instead of truncating, when it is a description rather than a label. @default false */
	subtitleWrap?: boolean
	/** Trailing slot — typically a ghost icon Button or a StatusDot. */
	action?: ReactNode
}

/**
 * Entity props. The default is a presentational row. Pass `interactive` (with an
 * `onSelect` handler) to make the whole row a native, keyboard-operable button,
 * or `interactive` with `render` (a router link) to make it a link.
 */
export type EntityProps = EntityBaseProps &
	Omit<ComponentPropsWithRef<"div">, "title" | "onSelect"> &
	(
		| { interactive?: false; onSelect?: never; selected?: never; render?: never }
		| {
				interactive: true
				/** Called when the row's target is activated. Optional when `render` makes it a link. */
				onSelect?: () => void
				/**
				 * The current row of a selectable list (the open record in a
				 * list–detail view): the row's target gets `aria-current` (`"page"`
				 * when it is a link, `"true"` when it is a button) and the row takes
				 * the selected fill, which also holds on hover.
				 */
				selected?: boolean
				/**
				 * Render the row's target as another element — a router link, so a
				 * list–detail row navigates: `render={<Link to="/people/42" />}`.
				 * Defaults to a `<button>`. The trailing `action` stays outside it.
				 */
				render?: useRender.RenderProp
		  }
	)

/**
 * Entity — a list-row record: a leading visual, a title/subtitle column, and a
 * trailing action. Presentational by default — no hover treatment, so a static
 * row never advertises clickability. The center column is `min-w-0` so both
 * lines truncate cleanly.
 *
 * Pass `interactive` + `onSelect` to make the entire row a target, and
 * `selected` to mark the current row of a selectable list. The leading
 * visual and the text column become a real `<button>` (native focus, Enter and
 * Space), whose `::after` is stretched over the whole row so a click anywhere
 * selects it. The trailing `action` stays OUTSIDE that button and is lifted above
 * the overlay — the slot often holds its own Button, and nesting real buttons is
 * invalid HTML.
 *
 *   <Entity interactive onSelect={() => select(user)}
 *     leading={<Avatar fallback="AM" />} title="Alex Morgan" subtitle="@alex" />
 */
export function Entity({
	leading,
	title,
	subtitle,
	subtitleWrap = false,
	action,
	density,
	className,
	interactive,
	onSelect,
	selected,
	render,
	...props
}: EntityProps) {
	const body = (
		<>
			{leading != null ? (
				<div className="flex shrink-0 items-center">{leading}</div>
			) : null}
			<div className="flex min-w-0 flex-1 flex-col">
				<span className="truncate text-title-sm text-foreground">{title}</span>
				{/* A space between the lines: an interactive row's name is computed
				    from this text, and two adjacent spans run together ("Refund
				    policyhelp.atlas.example"). A whitespace-only child of a flex
				    column takes no layout, so nothing moves visually. */}
				{subtitle != null ? " " : null}
				{subtitle != null ? (
					<span className={cn("text-body-sm text-muted-foreground", !subtitleWrap && "truncate")}>
						{subtitle}
					</span>
				) : null}
			</div>
		</>
	)

	// A link (an <a>, or a router Link: it takes href or to) marks the current
	// row as the current page; a button marks it as the current item.
	const isLink =
		isValidElement<{ href?: unknown; to?: unknown }>(render) &&
		(render.type === "a" || render.props.href != null || render.props.to != null)
	const target = useRender({
		// design-lint-disable-next-line raw-button -- the whole row is the hit target (stretched ::after); a row has its own anatomy, not a Button's height/padding
		render: render ?? <button type="button" />,
		props: {
			onClick: onSelect,
			"aria-current": selected ? (isLink ? "page" : "true") : undefined,
			className:
				"flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-start outline-none motion-interactive after:absolute after:inset-0 after:rounded-[var(--entity-radius,var(--radius-md))] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring",
			children: body,
		},
		defaultTagName: "button",
		enabled: Boolean(interactive),
	})

	return (
		<div
			className={cn(
				entityVariants({ density }),
				// Hover and selected fills are steps off the surface the row sits on
				// (sable-surface-interactive), so a selected row reads on a card, a
				// well or a popover alike — and stays filled while hovered, which a
				// fixed hover:bg-muted/50 used to override.
				// Half the usual hover step. A row leads with a tile on the muted fill
				// (an Avatar's initials, an IconTile), and the full step IS that
				// fill: hovering the row erased the tile it was pointing at.
				interactive &&
					"sable-surface-interactive relative rounded-[var(--entity-radius,var(--radius-md))] motion-interactive [--sable-surface-hover-bg:color-mix(in_oklab,var(--foreground)_4%,transparent)]",
				className,
			)}
			data-selected={interactive && selected ? "" : undefined}
			{...props}
		>
			{/* The ring is inset: rows run to the edge of a CardList or SheetList,
			    where anything outside the row is clipped away on three sides. */}
			{interactive ? target : body}
			{action != null ? (
				<div
					className={cn(
						// A control a little taller than the row's text (a small Button
						// beside a two-line title) does not set the row's height: it
						// takes up to 4px of the row's padding on each side instead, so
						// a list mixing Switch, Badge and Button rows stays even.
						"-my-1 flex shrink-0 items-center",
						// Above the stretched hit area, so the action keeps its own clicks.
						interactive && "relative z-10",
					)}
				>
					{action}
				</div>
			) : null}
		</div>
	)
}
Entity.displayName = "Entity"
