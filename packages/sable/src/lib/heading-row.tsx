import type { ElementType, ReactNode } from "react"
import { BLEED_FIRST_START, BLEED_LAST_END } from "./bleed"
import { cn } from "./cn"

/**
 * The title row PageHeader and SectionHeader share (internal — not exported
 * from the barrel): an optional leading control, a title that wraps rather
 * than truncating, and actions at the row's end that drop beneath the title
 * when the row runs out of room.
 *
 * The title claims at least `basis-48` (12rem) before the actions are allowed
 * on its row, so on a phone a short action ("View all") stays beside the title
 * and a long one wraps under it instead of squeezing the title into a column.
 *
 * Beside controls the title sits in a `band` one control tall, so a one-line
 * title centres on the buttons and a wrapped one starts level with them. The
 * band is a class (`flex min-h-(--control-md) items-center`) rather than a
 * value so each caller's ladder rung stays a literal Tailwind can see.
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
}) {
	const hasControls = Boolean(leading || actions)
	return (
		<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
			<div className="flex min-w-0 flex-1 basis-48 items-start gap-2">
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
