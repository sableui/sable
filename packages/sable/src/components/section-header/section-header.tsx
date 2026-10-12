import type { ComponentPropsWithRef, ReactNode } from "react"
import { useId } from "react"
import { cn } from "../../lib/cn"
import { HeadingRow } from "../../lib/heading-row"

export interface SectionHeaderProps
	extends Omit<ComponentPropsWithRef<"div">, "title"> {
	/** The section's title. */
	title?: ReactNode
	/** One line of supporting copy beneath the title. */
	description?: ReactNode
	/**
	 * Trailing actions on the title row — a "View all" link, or a couple of
	 * buttons. Use `size="sm"` buttons: the title is centred on that height.
	 */
	actions?: ReactNode
	/**
	 * The title's heading element, chosen by the document outline: `h2` for a
	 * section under the page's h1, `h3` for a subsection inside one. @default "h2"
	 */
	titleAs?: "h2" | "h3" | "h4"
	/**
	 * The title's `id`, so the section it heads can name itself with it:
	 * `<section aria-labelledby={id}>`. Generated when omitted.
	 */
	titleId?: string
	/**
	 * Visual weight, independent of the heading level. `md` (text-heading-3) for
	 * a page's sections and shelves; `sm` (text-heading-4) for a denser set —
	 * settings groups, subsections, a sidebar's sections. @default "md"
	 */
	size?: "md" | "sm"
}

const TITLE_TIER = {
	md: "text-heading-3",
	sm: "text-heading-4",
} as const

/**
 * SectionHeader — the heading block for one section of a page: a title, an
 * optional line of description, and actions on the title row. The page's own
 * title is PageHeader (the route's one h1); every section below it is this.
 *
 *   <section aria-labelledby="new-releases" className="flex flex-col gap-4">
 *     <SectionHeader
 *       titleId="new-releases"
 *       title="New releases"
 *       actions={<Button variant="ghost" size="sm" render={<a href="/new" />}>View all</Button>}
 *     />
 *     <Grid minItemWidth="10rem">…</Grid>
 *   </section>
 *
 * It shares PageHeader's title row: the title wraps rather than truncating,
 * the actions keep to the title's row and drop beneath it only when the row
 * runs out of room. It carries no outer spacing — the Stack or Page it sits in
 * owns the rhythm between the header and what it introduces.
 */
export function SectionHeader({
	title,
	description,
	actions,
	titleAs = "h2",
	titleId,
	size = "md",
	className,
	...props
}: SectionHeaderProps) {
	const generatedId = useId()
	return (
		<div data-slot="section-header" className={cn("flex flex-col gap-1", className)} {...props}>
			<HeadingRow
				as={titleAs}
				title={title}
				titleId={titleId ?? generatedId}
				titleClassName={TITLE_TIER[size]}
				band="flex min-h-(--control-sm) items-center"
				actions={actions}
			/>
			{description ? (
				<p className="max-w-(--measure-prose) text-body-sm text-pretty text-muted-foreground">
					{description}
				</p>
			) : null}
		</div>
	)
}
SectionHeader.displayName = "SectionHeader"
