import type { VariantProps } from "class-variance-authority"
import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"
import { segmentedBarSegmentVariants, segmentedBarVariants } from "./segmented-bar.variants"

export type SegmentedBarTone = NonNullable<VariantProps<typeof segmentedBarSegmentVariants>["tone"]>

export interface SegmentedBarSegment {
	/** The category's name — read out in the bar's accessible summary. */
	label: string
	/** Its amount, in any unit; segments are sized by their share of the total. */
	value: number
	/** Fill colour. Omitted, segments take the decorative tones in order. */
	tone?: SegmentedBarTone
}

export interface SegmentedBarProps
	extends Omit<ComponentPropsWithRef<"div">, "children" | "aria-label">,
		VariantProps<typeof segmentedBarVariants> {
	/** The categories, in the order they should read left to right. */
	segments: SegmentedBarSegment[]
	/** What the bar breaks down ("Revenue by type"). Prefixes the spoken summary. */
	label: string
	/** BCP 47 locale for the spoken percentages. Defaults to the runtime's. */
	locale?: string
}

/** The order segments take when they name no tone: the palette's decorative set first. */
export const SEGMENTED_BAR_TONES: readonly SegmentedBarTone[] = ["edition", "collectible", "standard", "info", "primary", "neutral"]

/**
 * One bar split into the parts of a whole — revenue by type, storage by kind,
 * test results by outcome. `Meter` shows one reading against a range; this
 * shows how a total divides. The legend is yours to compose (a StatusDot, the
 * label and the share per row), because where it sits — under the bar, beside
 * it, in a table — depends on the card.
 *
 * The bar is one image to assistive tech, named by `label` and every
 * segment's share ("Revenue by type: Editions 42%, Collectibles 27%, …"), so a
 * legend that repeats it visually can stay out of the accessible reading.
 */
export function SegmentedBar({ segments, label, locale, size, className, ...props }: SegmentedBarProps) {
	const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0)
	const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 })
	const summary = segments.map((s) => `${s.label} ${percent.format(total ? Math.max(0, s.value) / total : 0)}`).join(", ")
	return (
		<div role="img" aria-label={`${label}: ${summary}`} className={cn(segmentedBarVariants({ size }), className)} {...props}>
			{segments.map((s, i) =>
				s.value > 0 ? (
					<span
						key={s.label}
						data-slot="segmented-bar-segment"
						className={segmentedBarSegmentVariants({ tone: s.tone ?? SEGMENTED_BAR_TONES[i % SEGMENTED_BAR_TONES.length] })}
						// Grow by value from a zero basis: each segment takes its share of
						// the width after the gaps, whatever the values sum to.
						style={{ flexGrow: s.value }}
					/>
				) : null,
			)}
		</div>
	)
}
SegmentedBar.displayName = "SegmentedBar"
