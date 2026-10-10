"use client";

import type { ComponentPropsWithRef, Ref } from "react"
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useDensity } from "../../lib/density"
import { useIsomorphicLayoutEffect } from "../../lib/use-isomorphic-layout-effect"
import { useScrollActivity } from "../../lib/use-scroll-activity"
import { useMotion } from "../../motion/MotionProvider"
import { Button } from "../button"
import { SimpleTooltip } from "../tooltip"

/** How far from the bottom (px) still counts as "pinned to the latest message". */
const DEFAULT_FOLLOW_THRESHOLD = 64

/**
 * Conversation rhythm. The class also publishes the gap as `--message-gap` so
 * `<Message grouped>` can close it without knowing which step is in play. The
 * published value is the SAME spacing-scale step as the gap, so the two move
 * together under density instead of a fixed rem drifting from a scaled gap.
 *
 * Two ladders, because spacing is a register concern like every other measure
 * here: 1rem between turns is right on a page and loose in a 320px tool panel
 * whose type has already dropped to 12px. The compact steps are one notch down
 * across the board.
 */
const GAP_CLASSES = {
	comfortable: {
		sm: "gap-2 [--message-gap:calc(var(--spacing)*2)]",
		md: "gap-4 [--message-gap:calc(var(--spacing)*4)]",
		lg: "gap-6 [--message-gap:calc(var(--spacing)*6)]",
	},
	compact: {
		sm: "gap-1.5 [--message-gap:calc(var(--spacing)*1.5)]",
		md: "gap-3 [--message-gap:calc(var(--spacing)*3)]",
		lg: "gap-4 [--message-gap:calc(var(--spacing)*4)]",
	},
} as const

export interface ScrollCommandOptions {
	/**
	 * Animate the scroll. Ignored when motion is off — a smooth scroll is motion
	 * like any other, and the policy has to be able to freeze it.
	 * @default true
	 */
	animate?: boolean
}

export interface MessageScrollerHandle {
	/** The element that scrolls. */
	element: HTMLDivElement | null
	/** Scroll to the newest message and resume following. */
	scrollToBottom: (options?: ScrollCommandOptions) => void
	/** Scroll to the oldest rendered message. */
	scrollToTop: (options?: ScrollCommandOptions) => void
	/**
	 * Bring one message into view by its `messageId`. Returns `false` when no
	 * message with that id is rendered — the caller usually reacts by loading
	 * more history and trying again.
	 */
	scrollToMessage: (
		id: string,
		options?: ScrollCommandOptions & { block?: ScrollLogicalPosition },
	) => boolean
	/** Whether the viewport is currently pinned to the newest message. */
	isFollowing: () => boolean
}

export interface MessageScrollerProps
	extends Omit<ComponentPropsWithRef<"div">, "ref"> {
	/**
	 * Imperative commands — NOT the DOM node. `ref.current.element` is the
	 * scrolling element when you need it. A conversation's whole reason for a ref
	 * is "scroll to that message", so the handle is what the ref hands you.
	 */
	ref?: Ref<MessageScrollerHandle>
	/**
	 * Keep the newest message in view as content arrives, until the reader
	 * scrolls away from the bottom. Set `false` for a transcript that should
	 * never move under the reader.
	 * @default true
	 */
	autoFollow?: boolean
	/** Distance from the bottom, in px, that still counts as following. @default 64 */
	followThreshold?: number
	/** Notified when the viewport pins to, or releases from, the newest message. */
	onFollowChange?: (following: boolean) => void
	/**
	 * Where a freshly mounted thread lands. `"bottom"` is the newest message
	 * (the default for a live conversation); a `{ messageId }` restores a saved
	 * read position.
	 * @default "bottom"
	 */
	initialScroll?: "bottom" | "top" | { messageId: string }
	/** Show the jump-to-latest control while the reader is scrolled away. @default true */
	jumpToLatest?: boolean
	/** Accessible label + tooltip for that control. @default "Jump to latest" */
	jumpToLatestLabel?: string
	/** Vertical rhythm between messages. @default "md" */
	gap?: keyof (typeof GAP_CLASSES)["comfortable"]
	/**
	 * Ids of the messages currently intersecting the viewport, in DOM order.
	 * Fires on scroll and as messages mount/unmount — the hook for read
	 * receipts, "mark as seen", and unread counters.
	 */
	onVisibleMessagesChange?: (ids: string[]) => void
}

/**
 * MessageScroller — the scroll container for a conversation.
 *
 * It owns the scrolling and nothing else: not your messages, not your AI state,
 * not your transport or persistence. You bring the content. What it handles is
 * the set of behaviors that are individually small and collectively the reason
 * hand-rolled chat scrollers feel wrong:
 *
 * - **Auto-follow.** New content pins the view to the newest message — until the
 *   reader scrolls up, at which point it stops fighting them. Scrolling back to
 *   the bottom resumes it. The threshold is a band, not a pixel, because a
 *   streamed token arriving mid-frame otherwise flickers the state.
 * - **Prepend preservation.** Loading older history above the reader must not
 *   move what they are reading. Handled by anchoring on the first rendered
 *   message and re-adding whatever height appeared above it — see `onContentChange`.
 * - **Scroll commands.** `scrollToMessage` for jump-to-reply and search results,
 *   `scrollToBottom` for "send" and for restoring after an off-screen reply.
 * - **Thread restore.** `initialScroll={{ messageId }}` lands a reopened thread
 *   on the last-read message instead of at the bottom.
 * - **Visibility.** `onVisibleMessagesChange` reports what is actually on screen,
 *   which is the only honest basis for a read receipt.
 *
 * **`className` lands on the element that scrolls** — the same contract as
 * `<Scroller>`, so `max-h-96`, `h-full`, and `flex-1 min-h-0` all bound the
 * scroll region itself, and padding on it is the conversation's padding. The
 * messages are laid out in a flex column *inside* that region; set its rhythm
 * with `gap`, not with a flex class on `className`.
 *
 *   <MessageScroller ref={thread} className="flex-1 min-h-0 px-4 py-6">
 *     {messages.map((m) => <Message key={m.id} messageId={m.id}>…</Message>)}
 *   </MessageScroller>
 */
export function MessageScroller({
	ref,
	autoFollow = true,
	followThreshold = DEFAULT_FOLLOW_THRESHOLD,
	onFollowChange,
	initialScroll = "bottom",
	jumpToLatest = true,
	jumpToLatestLabel = "Jump to latest",
	gap = "md",
	onVisibleMessagesChange,
	className,
	children,
	onScroll,
	...props
}: MessageScrollerProps) {
	const viewportRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const { enabled: motionEnabled } = useMotion()
	const density = useDensity()

	// The bar has to appear when the transcript moves under a streamed reply or a
	// scrollToMessage, and neither of those hovers anything — see useScrollActivity.
	const trackActivity = useScrollActivity()
	const setViewport = useCallback(
		(node: HTMLDivElement | null) => {
			trackActivity(node)
			viewportRef.current = node
		},
		[trackActivity],
	)

	const [atBottom, setAtBottom] = useState(true)

	// Observers and imperative commands run outside React's render cycle, so the
	// values they read live in refs. `following` is the one that matters: an
	// observer firing mid-stream must see the CURRENT answer, not the one closed
	// over when the effect was set up.
	const followingRef = useRef(autoFollow)
	followingRef.current = autoFollow && atBottom
	const thresholdRef = useRef(followThreshold)
	thresholdRef.current = followThreshold

	const scrollBehavior = useCallback(
		(animate: boolean | undefined): ScrollBehavior =>
			animate !== false && motionEnabled ? "smooth" : "auto",
		[motionEnabled],
	)

	/* ── Prepend preservation ────────────────────────────────────────────────
	   The anchor is the OLDEST RENDERED MESSAGE and the offset we last saw it
	   at. Prepending history inserts above it, so its `offsetTop` moves down by
	   exactly the height that appeared over the reader; adding that delta back
	   to `scrollTop` leaves the visible content where it was. Appending does not
	   move it, and neither does a streamed edit to the last message, so in both
	   of those the delta is 0 and nothing happens. The viewport is `relative`,
	   which makes it the anchor's `offsetParent` and the two measurements
	   comparable.

	   It anchors on the first `[data-message-id]` rather than on the content's
	   first child, and that distinction is the whole feature: a thread that can
	   load history almost always renders a sentinel above the messages — a "load
	   earlier" button, a spinner, a beginning-of-conversation marker. That
	   sentinel is the first child, it never moves when history lands beneath it,
	   and anchoring on it silently makes the delta 0 in exactly the case
	   preservation exists for. Messages are what the reader is reading; the
	   sentinel is furniture. */
	const anchor = useRef<{ node: HTMLElement | null; top: number }>({
		node: null,
		top: 0,
	})

	const captureAnchor = useCallback(() => {
		const content = contentRef.current
		if (!content) return
		const node =
			content.querySelector<HTMLElement>("[data-message-id]") ??
			(content.firstElementChild as HTMLElement | null)
		anchor.current = { node, top: node ? node.offsetTop : 0 }
	}, [])

	const scrollToBottomNow = useCallback((behavior: ScrollBehavior) => {
		const viewport = viewportRef.current
		if (!viewport) return
		viewport.scrollTo({ top: viewport.scrollHeight, behavior })
	}, [])

	/* ── Visibility tracking ─────────────────────────────────────────────────
	   Targets are observed and unobserved individually rather than by
	   disconnecting on every mutation: a disconnect drops the whole visible set
	   and re-reports it asynchronously, which would make a read receipt blink
	   off and on every time a message arrived. */
	const observer = useRef<IntersectionObserver | null>(null)
	const observed = useRef(new Map<HTMLElement, string>())
	const visible = useRef(new Set<string>())
	const reported = useRef("")
	const onVisibleRef = useRef(onVisibleMessagesChange)
	onVisibleRef.current = onVisibleMessagesChange

	const reportVisible = useCallback(() => {
		const content = contentRef.current
		const notify = onVisibleRef.current
		if (!content || !notify) return
		// DOM order, not intersection order — a caller computing "the oldest
		// unread still on screen" needs the conversation's own sequence.
		const ids: string[] = []
		for (const node of content.querySelectorAll<HTMLElement>("[data-message-id]")) {
			const id = node.dataset.messageId
			if (id && visible.current.has(id)) ids.push(id)
		}
		const key = ids.join(" ")
		if (key === reported.current) return
		reported.current = key
		notify(ids)
	}, [])

	const syncObservedMessages = useCallback(() => {
		const io = observer.current
		const content = contentRef.current
		if (!io || !content) return
		const nodes = new Set(
			content.querySelectorAll<HTMLElement>("[data-message-id]"),
		)
		for (const [node, id] of observed.current) {
			if (nodes.has(node)) continue
			io.unobserve(node)
			observed.current.delete(node)
			visible.current.delete(id)
		}
		for (const node of nodes) {
			if (observed.current.has(node)) continue
			const id = node.dataset.messageId
			if (!id) continue
			observed.current.set(node, id)
			io.observe(node)
		}
		reportVisible()
	}, [reportVisible])

	/* ── Content changes ─────────────────────────────────────────────────────
	   One handler for both "a message arrived" (MutationObserver) and "a message
	   grew" (ResizeObserver — streamed tokens, an image finishing load, a
	   collapsible opening). Following wins; otherwise hold the anchor still. */
	const onContentChange = useCallback(() => {
		const viewport = viewportRef.current
		const content = contentRef.current
		if (!viewport || !content) return

		if (followingRef.current) {
			// Instant, never smooth: a smooth scroll takes longer than the gap
			// between streamed tokens, so each one restarts an animation that
			// never arrives and the view falls progressively behind the text.
			scrollToBottomNow("auto")
		} else {
			const { node, top } = anchor.current
			if (node?.isConnected && node.parentElement === content) {
				const shift = node.offsetTop - top
				if (shift !== 0) viewport.scrollTop += shift
			}
		}
		captureAnchor()
		syncObservedMessages()
	}, [captureAnchor, scrollToBottomNow, syncObservedMessages])

	useEffect(() => {
		const viewport = viewportRef.current
		const content = contentRef.current
		if (!viewport || !content) return

		const mutations = new MutationObserver(onContentChange)
		mutations.observe(content, {
			childList: true,
			subtree: true,
			characterData: true,
		})
		const resizes = new ResizeObserver(onContentChange)
		resizes.observe(content)

		return () => {
			mutations.disconnect()
			resizes.disconnect()
		}
	}, [onContentChange])

	useEffect(() => {
		if (!onVisibleMessagesChange) return
		const viewport = viewportRef.current
		if (!viewport) return

		observer.current = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const id = (entry.target as HTMLElement).dataset.messageId
					if (!id) continue
					if (entry.isIntersecting) visible.current.add(id)
					else visible.current.delete(id)
				}
				reportVisible()
			},
			{ root: viewport },
		)
		syncObservedMessages()

		return () => {
			observer.current?.disconnect()
			observer.current = null
			observed.current.clear()
			visible.current.clear()
			reported.current = ""
		}
	}, [onVisibleMessagesChange, reportVisible, syncObservedMessages])

	/* ── Mount ───────────────────────────────────────────────────────────────
	   Always instant. An animated scroll on mount would show the reader the top
	   of a thread they did not ask to see and then travel away from it. */
	useIsomorphicLayoutEffect(() => {
		const viewport = viewportRef.current
		if (!viewport) return
		if (typeof initialScroll === "object") {
			const target = viewport.querySelector<HTMLElement>(
				`[data-message-id="${CSS.escape(initialScroll.messageId)}"]`,
			)
			if (target) {
				target.scrollIntoView({ block: "center", behavior: "auto" })
			} else {
				viewport.scrollTop = viewport.scrollHeight
			}
		} else if (initialScroll === "top") {
			viewport.scrollTop = 0
		} else {
			viewport.scrollTop = viewport.scrollHeight
		}
		const distance =
			viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
		setAtBottom(distance <= thresholdRef.current)
		captureAnchor()
		// Mount-only: `initialScroll` describes where the thread OPENS, and
		// re-running it on a prop change would yank a reader mid-conversation.
	}, [])

	const setFollowing = useCallback(
		(next: boolean) => {
			setAtBottom((prev) => {
				if (prev === next) return prev
				onFollowChange?.(next && autoFollow)
				return next
			})
		},
		[autoFollow, onFollowChange],
	)

	const handleScroll = useCallback(
		(event: React.UIEvent<HTMLDivElement>) => {
			const el = event.currentTarget
			const distance = el.scrollHeight - el.scrollTop - el.clientHeight
			setFollowing(distance <= thresholdRef.current)
			captureAnchor()
			onScroll?.(event)
		},
		[captureAnchor, onScroll, setFollowing],
	)

	useImperativeHandle(
		ref,
		(): MessageScrollerHandle => ({
			get element() {
				return viewportRef.current
			},
			scrollToBottom: (options) => {
				scrollToBottomNow(scrollBehavior(options?.animate))
			},
			scrollToTop: (options) => {
				viewportRef.current?.scrollTo({
					top: 0,
					behavior: scrollBehavior(options?.animate),
				})
			},
			scrollToMessage: (id, options) => {
				const viewport = viewportRef.current
				if (!viewport) return false
				const target = viewport.querySelector<HTMLElement>(
					`[data-message-id="${CSS.escape(id)}"]`,
				)
				if (!target) return false
				target.scrollIntoView({
					block: options?.block ?? "center",
					behavior: scrollBehavior(options?.animate),
				})
				return true
			},
			isFollowing: () => followingRef.current,
		}),
		[scrollBehavior, scrollToBottomNow],
	)

	const showJump = jumpToLatest && !atBottom

	return (
		<div
			ref={setViewport}
			onScroll={handleScroll}
			className={cn(
				// `relative` is load-bearing twice over: it makes the viewport the
				// offsetParent the prepend anchor is measured against, and it is the
				// containing block the jump control sticks inside.
				"relative scrollbar-quiet overflow-y-auto overscroll-contain",
				className,
			)}
			{...props}
		>
			<div
				ref={contentRef}
				className={cn("flex flex-col", GAP_CLASSES[density][gap])}
			>
				{children}
			</div>
			{showJump ? (
				/* Sticky rather than absolutely positioned over a wrapper — that is
				   what lets `className` stay on the scrolling element instead of
				   moving to a wrapper the consumer then has to reach past. A
				   zero-height last child pins to the bottom edge while the reader is
				   scrolled up and costs no scroll height. */
				<div className="pointer-events-none sticky bottom-4 flex h-0 items-end justify-center">
					<SimpleTooltip content={jumpToLatestLabel}>
						<Button
							type="button"
							variant="floating"
							size="icon-sm"
							aria-label={jumpToLatestLabel}
							onClick={() => scrollToBottomNow(scrollBehavior(true))}
							className="pointer-events-auto animate-fade-up"
						>
							<Icon name="chevron-down" className="text-base" />
						</Button>
					</SimpleTooltip>
				</div>
			) : null}
		</div>
	)
}
MessageScroller.displayName = "MessageScroller"
