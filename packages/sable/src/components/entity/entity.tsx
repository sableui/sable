import type { VariantProps } from "class-variance-authority"
import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { entityVariants } from "./entity.variants"

interface EntityBaseProps extends VariantProps<typeof entityVariants> {
	/** Leading visual — typically an Avatar or an Icon. */
	leading?: ReactNode
	/** Primary line (text-title-sm, truncated). */
	title: ReactNode
	/** Secondary line (text-body-sm muted, truncated). */
	subtitle?: ReactNode
	/** Trailing slot — typically a ghost icon Button or a StatusDot. */
	action?: ReactNode
}

/**
 * Entity props. The default is a presentational row. Pass `interactive` (with an
 * `onSelect` handler) to make the whole row a native, keyboard-operable button.
 */
export type EntityProps = EntityBaseProps &
	Omit<ComponentPropsWithRef<"div">, "title" | "onSelect"> &
	(
		| { interactive?: false; onSelect?: never }
		| { interactive: true; onSelect: () => void }
	)

/**
 * Entity — a list-row record: a leading visual, a title/subtitle column, and a
 * trailing action. Presentational by default — no hover treatment, so a static
 * row never advertises clickability. The center column is `min-w-0` so both
 * lines truncate cleanly.
 *
 * Pass `interactive` + `onSelect` to make the entire row a target. The leading
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
	action,
	density,
	className,
	interactive,
	onSelect,
	...props
}: EntityProps) {
	const body = (
		<>
			{leading != null ? (
				<div className="flex shrink-0 items-center">{leading}</div>
			) : null}
			<div className="flex min-w-0 flex-1 flex-col">
				<span className="truncate text-title-sm text-foreground">{title}</span>
				{subtitle != null ? (
					<span className="truncate text-body-sm text-muted-foreground">
						{subtitle}
					</span>
				) : null}
			</div>
		</>
	)

	return (
		<div
			className={cn(
				entityVariants({ density }),
				interactive &&
					"relative rounded-[var(--entity-radius,var(--radius-md))] motion-interactive hover:bg-muted/50",
				className,
			)}
			{...props}
		>
			{interactive ? (
				// design-lint-disable-next-line raw-button -- the whole row is the hit target (stretched ::after); a row has its own anatomy, not a Button's height/padding
				<button
					type="button"
					onClick={onSelect}
					className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-start outline-none motion-interactive after:absolute after:inset-0 after:rounded-[var(--entity-radius,var(--radius-md))] focus-visible:after:ring-2 focus-visible:after:ring-ring"
				>
					{body}
				</button>
			) : (
				body
			)}
			{action != null ? (
				<div
					className={cn(
						"flex shrink-0 items-center",
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
