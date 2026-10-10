import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import {
	messageAvatarVariants,
	messageBodyVariants,
	messageVariants,
} from "./message.variants"

/**
 * Gutter widths, matching `<Avatar>`'s own `size` scale 1:1 (sm 32, md 40,
 * lg 48). The gutter is declared rather than measured because it has to hold
 * its width when the avatar is NOT rendered — a grouped message reserves the
 * column so the run stays aligned, and there is nothing in the box to measure.
 */
const AVATAR_WIDTHS = {
	sm: "w-8",
	md: "w-10",
	lg: "w-12",
} as const

/**
 * The header row is at least as tall as the avatar beside it, with its line
 * centred in that height — so the name reads level with the middle of the
 * avatar rather than pinned to its top edge, and the content starts below the
 * avatar. Only when an avatar is drawn: a grouped row has none to line up with.
 */
const AVATAR_ROW_HEIGHTS = {
	sm: "min-h-8",
	md: "min-h-10",
	lg: "min-h-12",
} as const

export interface MessageProps
	extends Omit<ComponentPropsWithRef<"div">, "id"> {
	/**
	 * Stable id for this message. Published as `data-message-id`, which is what
	 * `<MessageScroller>` reads for `scrollToMessage` and visibility tracking —
	 * a message without one is invisible to both.
	 */
	messageId?: string
	/**
	 * Which side of the conversation this message is on. `"start"` is the other
	 * party (or the assistant); `"end"` is the person reading.
	 * @default "start"
	 */
	align?: "start" | "end"
	/** Avatar node for the gutter. Omit for a message with no author identity. */
	avatar?: ReactNode
	/** Gutter width. Match it to the `size` of the `<Avatar>` you pass. @default "sm" */
	avatarSize?: keyof typeof AVATAR_WIDTHS
	/** Author name, timestamp — anything above the content. */
	header?: ReactNode
	/** Reactions, receipts, retry actions — anything below the content. */
	footer?: ReactNode
	/**
	 * This message continues a run from the same author. Tightens the spacing
	 * and drops the avatar while keeping its column reserved, so the run reads
	 * as one block and stays aligned.
	 * @default false
	 */
	grouped?: boolean
}

/**
 * Message — one row in a conversation.
 *
 * It is layout and nothing else: a gutter for the avatar, a column for header /
 * content / footer, and a side. The message *surface* is `<Bubble>`, passed as
 * children — which is what lets a plain-text assistant reply, a bubble, an
 * attachment, and a tool card all be "a message" without Message knowing about
 * any of them.
 *
 *   <Message
 *     messageId={m.id}
 *     align={m.mine ? "end" : "start"}
 *     avatar={<Avatar size="sm" src={m.author.avatar} fallback={m.author.initials} />}
 *     header={<><strong className="text-foreground">{m.author.name}</strong><RelativeTime date={m.sentAt} /></>}
 *   >
 *     <Bubble align={m.mine ? "end" : "start"}>{m.body}</Bubble>
 *   </Message>
 *
 * The three things worth knowing:
 *
 * - **`align="end"` mirrors the whole row**, gutter included. Do not also
 *   justify the content — the row is already reversed.
 * - **`grouped` reserves the gutter it hides.** Consecutive messages from one
 *   author line up under the first one's bubble instead of stepping left.
 * - **`messageId` is the handle** for `scrollToMessage`, `initialScroll`, and
 *   `onVisibleMessagesChange`. Set it for anything a consumer might jump to or
 *   mark as read.
 */
export function Message({
	messageId,
	align = "start",
	avatar,
	avatarSize = "sm",
	header,
	footer,
	grouped = false,
	className,
	children,
	...props
}: MessageProps) {
	const tier = useTypeTier()
	return (
		<div
			data-message-id={messageId}
			data-align={align}
			data-grouped={grouped ? "" : undefined}
			className={cn(messageVariants({ align, grouped }), className)}
			{...props}
		>
			{avatar || grouped ? (
				<div
					className={cn(
						messageAvatarVariants({ align }),
						AVATAR_WIDTHS[avatarSize],
					)}
				>
					{grouped ? null : avatar}
				</div>
			) : null}
			<div className={cn(messageBodyVariants({ align }))}>
				{header ? (
					<div
						className={cn(
							"flex items-center text-muted-foreground",
							avatar && !grouped && AVATAR_ROW_HEIGHTS[avatarSize],
							tier.secondary,
						)}
					>
						{/* Baseline inside, so a name and a timestamp of different
						    weights sit on one line; centred as a line outside. */}
						<div className="flex items-baseline gap-2">{header}</div>
					</div>
				) : null}
				{children}
				{footer ? (
					<div
						className={cn(
							"flex items-center gap-2 text-muted-foreground",
							tier.secondary,
						)}
					>
						{footer}
					</div>
				) : null}
			</div>
		</div>
	)
}
Message.displayName = "Message"
