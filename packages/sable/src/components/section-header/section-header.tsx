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
	 * Visual weight, independent of the heading level. `lg` (text-heading-2 over
	 * a text-body-md description) for an editorial page's sections, under a
	 * `PageHeader size="lg"`; `md` (text-heading-3) for a page's sections and
	 * shelves; `sm` (text-heading-4) for a denser set — settings groups,
	 * subsections, a sidebar's sections. @default "md"
	 */
	size?: "lg" | "md" | "sm"
}

// Paired tiers, never decomposed. lg is heading-2, the tier for a major section
// of a page, not heading-1: that is the page title's, one per route.
const SIZE = {
	lg: { root: "gap-3", title: "text-heading-2", description: "text-body-md" },
	md: { root: "gap-2", title: "text-heading-3", description: "text-body-sm" },
	sm: { root: "gap-2", title: "text-heading-4", description: "text-body-sm" },
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
 * runs out of room. A title whose line is taller than the controls (`lg`, or
 * a denser register's shorter ladder) is lifted by half the difference, so its
 * first line stays centred on them. It carries no outer spacing — the Stack or Page it sits in
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
		<div
			data-slot="section-header"
			data-size={size}
			className={cn("flex flex-col", SIZE[size].root, className)}
			{...props}
		>
			<HeadingRow
				as={titleAs}
				title={title}
				titleId={titleId ?? generatedId}
				titleClassName={SIZE[size].title}
				band="flex min-h-(--control-sm) items-center mt-[min(0px,calc((var(--control-sm)_-_1lh)/2))]"
				actions={actions}
			/>
			{description ? (
				<p className={cn("max-w-(--measure-prose) text-pretty text-muted-foreground", SIZE[size].description)}>
					{description}
				</p>
			) : null}
		</div>
	)
}
SectionHeader.displayName = "SectionHeader"
