import type { VariantProps } from "class-variance-authority"
import type { ComponentPropsWithRef, ReactNode } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import {
	type InlineTone,
	inlineStatusVariants,
	inlineToneIcon,
} from "./inline-status.variants"

export interface InlineStatusProps
	extends ComponentPropsWithRef<"div">,
		VariantProps<typeof inlineStatusVariants> {
	/** Semantic tone — drives the leading icon and the text color. @default "neutral" */
	tone?: InlineTone
	/** Override the leading glyph (e.g. a `<Spinner />`); otherwise the tone picks it. */
	icon?: ReactNode
}

/**
 * InlineStatus — a borderless, single-line status message: a leading semantic
 * icon and one line of text, colored by `tone`. The non-boxed sibling of `Note`
 * for inline affirmations, errors, and progress lines (e.g. under a form field
 * or beside an action). Pass a custom `icon` (like a Spinner) for a pending row.
 *
 *   <InlineStatus tone="success">Top-up confirmed.</InlineStatus>
 *   <InlineStatus tone="destructive">{actionError}</InlineStatus>
 *   <InlineStatus tone="neutral" icon={<Spinner size="sm" />}>Preparing transaction…</InlineStatus>
 */
export function InlineStatus({
	tone = "neutral",
	size,
	icon,
	className,
	children,
	...props
}: InlineStatusProps) {
	const { name, className: iconClassName } = inlineToneIcon[tone]
	return (
		<div
			className={cn(inlineStatusVariants({ size }), iconClassName, className)}
			{...props}
		>
			{/* A box one line tall, so the glyph (or a custom Spinner) centres on
			    the first line at either size and stays there when the text wraps.
			    The tone glyph is sized in em, so it follows the size step. */}
			<span className="flex h-[1lh] shrink-0 items-center">
				{icon ?? <Icon name={name} className="text-[1.15em]" />}
			</span>
			<span className="min-w-0">{children}</span>
		</div>
	)
}
InlineStatus.displayName = "InlineStatus"
