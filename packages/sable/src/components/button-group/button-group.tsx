import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"

export type ButtonGroupProps = ComponentPropsWithRef<"div">

/**
 * Buttons joined into one control — a split button ("Copy page" beside the
 * chevron that opens its menu), or a short run of related actions.
 *
 *   <ButtonGroup aria-label="Page actions">
 *     <Button variant="outline" size="sm">Copy page</Button>
 *     <Menu>
 *       <MenuTrigger render={<Button variant="outline" size="icon-sm" aria-label="More actions" />}>
 *         <Icon name="chevron-down" />
 *       </MenuTrigger>
 *       …
 *     </Menu>
 *   </ButtonGroup>
 *
 * The children stay ordinary Buttons, each with its own variant and size; the
 * group only joins them. It squares the inner corners through the per-side
 * radius vars Button reads (`--button-radius-s` / `-e`), so the outer corners
 * keep the theme's button shape. Bordered buttons overlap by their hairline so
 * the seam is one line, not two; filled and ghost buttons get a hairline seam
 * in their own ink, which reads on any fill. A focused child is raised so its
 * ring is not clipped by its neighbour.
 *
 * Give every child the same height (`sm` with `icon-sm`, `md` with `icon`):
 * the group aligns them but cannot reconcile two heights into one edge.
 */
export function ButtonGroup({ className, role = "group", ...props }: ButtonGroupProps) {
	return (
		<div
			role={role}
			data-slot="button-group"
			// The joins live in styles.css (`button-group-join`): they are sibling
			// selectors, which read plainly there and not as arbitrary variants.
			className={cn("inline-flex items-stretch button-group-join", className)}
			{...props}
		/>
	)
}
