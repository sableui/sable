import type { ComponentPropsWithRef, ReactNode } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { Card } from "../card"

export interface EmptyStateProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
	/** A glyph in a tinted disc. A destructive state shows a warning by default. */
	icon?: ReactNode
	title: ReactNode
	description?: ReactNode
	action?: ReactNode
	/** A large figure above the title — an error code like 404. */
	code?: ReactNode
	/**
	 * `destructive` is an error state: a destructive disc, and `role="alert"` so
	 * it is announced. @default "neutral"
	 */
	tone?: "neutral" | "destructive"
	/**
	 * `lg` is page-level (the title is a real heading, more room); `md` sits in
	 * a panel or list. @default "md"
	 */
	size?: "md" | "lg"
	/** `card` draws it as a Card, for a block within a page. @default "none" */
	surface?: "none" | "card"
}

/**
 * EmptyState — the centred "nothing here / something went wrong" block: an
 * optional disc or code, a title, a description and an action. One component
 * for empty lists, page-level errors (`tone="destructive"`, `code`, `size="lg"`)
 * and error cards (`surface="card"`); it used to be three — EmptyState,
 * ErrorState and ErrorCard — whose titles, widths and spacing had drifted.
 */
export function EmptyState({
	icon,
	title,
	description,
	action,
	code,
	tone = "neutral",
	size = "md",
	surface = "none",
	className,
	...props
}: EmptyStateProps) {
	const destructive = tone === "destructive"
	const glyph = icon ?? (destructive && code == null ? <Icon name="warning" /> : null)
	const Title = size === "lg" ? "h2" : "p"
	const body = (
		<>
			{code != null ? <p className="text-display-lg text-muted-foreground">{code}</p> : null}
			{glyph != null ? (
				<div
					className={cn(
						"flex size-12 items-center justify-center rounded-full text-2xl",
						destructive ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground",
					)}
				>
					{glyph}
				</div>
			) : null}
			<Title className={size === "lg" ? "text-heading-2" : "text-title-lg"}>{title}</Title>
			{description != null ? <p className="max-w-md text-body-md text-muted-foreground">{description}</p> : null}
			{action != null ? <div className="mt-2">{action}</div> : null}
		</>
	)
	const layout = cn(
		"flex flex-col items-center justify-center gap-3 text-center",
		size === "lg" ? "px-6 py-20" : "px-6 py-12",
	)
	const a11y = destructive ? { role: "alert" as const } : {}
	if (surface === "card") {
		return (
			<Card className={cn(layout, "p-[var(--card-p)]", className)} {...a11y} {...props}>
				{body}
			</Card>
		)
	}
	return (
		<div className={cn(layout, className)} {...a11y} {...props}>
			{body}
		</div>
	)
}
EmptyState.displayName = "EmptyState"
