import type { VariantProps } from "class-variance-authority"
import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { descriptionVariants, detailToneVariants } from "./description.variants"

/** Detail value tone — see `detailToneVariants`. */
export type DescriptionTone = NonNullable<
	VariantProps<typeof detailToneVariants>["tone"]
>

export interface DescriptionProps
	extends ComponentPropsWithRef<"dl">,
		VariantProps<typeof descriptionVariants> {}

/**
 * A labeled key/value list (definition list). Compose with `DescriptionTerm` +
 * `DescriptionDetail`, or use the ergonomic `DescriptionItem` shorthand. The
 * grid aligns terms and details into columns; `cols="2"` packs pairs two-wide once the list's container is wide enough.
 */
export function Description({ cols, className, ...props }: DescriptionProps) {
	const list = (
		<dl className={cn(descriptionVariants({ cols }), className)} {...props} />
	)
	// `cols="2"` decides its column count from the room the list actually has,
	// so it needs a container to measure: a grid cannot query itself.
	return cols === "2" ? <div className="@container">{list}</div> : list
}
Description.displayName = "Description"

/** The key. Muted label tier; sits in the first grid column. */
export function DescriptionTerm({
	className,
	...props
}: ComponentPropsWithRef<"dt">) {
	return (
		<dt
			className={cn("text-label-md text-muted-foreground", className)}
			{...props}
		/>
	)
}
DescriptionTerm.displayName = "DescriptionTerm"

export interface DescriptionDetailProps
	extends ComponentPropsWithRef<"dd">,
		VariantProps<typeof detailToneVariants> {}

/**
 * The value. Body tier on the foreground; sits in the second grid column. Pass a
 * `tone` to color a status value (success/warning/destructive/muted).
 */
export function DescriptionDetail({
	tone,
	className,
	...props
}: DescriptionDetailProps) {
	return (
		<dd className={cn(detailToneVariants({ tone }), className)} {...props} />
	)
}
DescriptionDetail.displayName = "DescriptionDetail"

export interface DescriptionItemProps {
	/** The key shown in the term column. */
	term: ReactNode
	/** The value shown in the detail column. Falls back to `children`. */
	detail?: ReactNode
	/** Color the detail value to encode a status (success/warning/destructive/muted). */
	tone?: DescriptionTone
	children?: ReactNode
}

/**
 * Ergonomic shorthand for one term/detail pair — renders a `DescriptionTerm`
 * followed by a `DescriptionDetail`. Pass the value via `detail` or `children`.
 */
export function DescriptionItem({
	term,
	detail,
	tone,
	children,
}: DescriptionItemProps) {
	return (
		<>
			<DescriptionTerm>{term}</DescriptionTerm>
			<DescriptionDetail tone={tone}>{detail ?? children}</DescriptionDetail>
		</>
	)
}
DescriptionItem.displayName = "DescriptionItem"
