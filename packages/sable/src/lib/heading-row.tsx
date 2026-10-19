import type { ElementType, ReactNode } from "react"
import { BLEED_FIRST_START, BLEED_LAST_END } from "./bleed"
import { cn } from "./cn"

/**
 * The title row PageHeader and SectionHeader share (internal — not exported
 * from the barrel): an optional leading control, a title that wraps rather
 * than truncating, and actions at the row's end that drop beneath the title
 * when the row runs out of room.
 *
 * The title claims a minimum width (`titleBasis`) before the actions are allowed
 * on its row; below it they wrap under the title instead of squeezing it into a
 * column. SectionHeader keeps 12rem, so on a phone a short "View all" stays
 * beside its title. PageHeader claims 20rem: its heading-2 title beside two
 * actions on a 390px phone got 12rem and broke one word per line.
 *
 * Beside controls the title sits in a `band` one control tall, so a one-line
 * title centres on the buttons and a wrapped one starts level with them. The
 * band is a class (`flex min-h-(--control-md) items-center`) rather than a
 * value so each caller's ladder rung stays a literal Tailwind can see.
 *
 * A title line TALLER than the controls (a display or heading-2 tier) would
 * overflow that band, and the actions, pinned to the row's top, would sit high
 * on it. So the band also carries
 * `mt-[min(0px,calc((var(--control-md)_-_1lh)/2))]`: `1lh` is the title's own
 * line, and when it exceeds the control the title lifts by half the
 * difference, putting its first line's centre on the controls' centre. A line
 * shorter than the control computes to 0, so the smaller tiers are untouched.
 *
 * Borderless controls at the row's edges align optically (lib/bleed.ts): a
 * ghost or link action that ends the row bleeds by its padding at the end, so
 * its label sits on the content edge below; a ghost back control bleeds at the
 * start, so its glyph does. The FIRST action also bleeds at the start. On the
 * title's row that only lets its hover fill reach into the gap beside the
 * title; once the row wraps and the actions drop beneath the title, it is what
 * keeps the first label on the start edge — CSS cannot tell the two apart, so
 * both edges of the group are aligned and each takes effect where it is an edge.
 */
export function HeadingRow({
	as: Title,
	title,
	titleId,
	titleClassName,
	band,
	leading,
	actions,
	titleBasis = "basis-48",
}: {
	as: ElementType
	title?: ReactNode
	titleId?: string
	/** The paired type tier, plus anything the caller adds. */
	titleClassName: string
	/** Classes that centre the title on the controls' height. */
	band: string
	leading?: ReactNode
	actions?: ReactNode
	/** The title's minimum width before the actions wrap under it, as a basis class. */
	titleBasis?: string
}) {
	const hasControls = Boolean(leading || actions)
	return (
		<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
			<div className={cn("flex min-w-0 flex-1 items-start gap-2", titleBasis)}>
				{leading ? <div className={cn("shrink-0", BLEED_FIRST_START)}>{leading}</div> : null}
				{title ? (
					<Title
						id={titleId}
						className={cn(
							"min-w-0 text-balance break-words",
							titleClassName,
							hasControls && band,
						)}
					>
						{title}
					</Title>
				) : null}
			</div>
			{actions ? (
				<div className={cn("flex shrink-0 flex-wrap items-center gap-2", BLEED_FIRST_START, BLEED_LAST_END)}>
					{actions}
				</div>
			) : null}
		</div>
	)
}
