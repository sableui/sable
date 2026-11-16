# CommentThreadBlock

A comment thread on a document or post: comments with an Avatar, RelativeTime, a LikeButton and Reply, replies one level in, and a Textarea composer that knows what it is replying to.

**Intent:** Reach for this under a post, beside a document or on a task: asynchronous discussion that keeps its shape. A real-time conversation between people is ChatThreadBlock; one post with its counts is PostBlock.

**Block:** Social & messaging · card · designed for 20rem–28rem wide (fills its container up to the max)

## Notes

- Replies sit one level in, on a rule. A reply to a reply joins the same level: past one indent a narrow card runs out of width and the thread stops reading as a conversation.
- Reply moves focus to the composer and labels it "Reply to Ana Chen"; a cancel button above it drops back to a new comment.
- The composer is a Textarea that grows with its text (autoResize). Comment is disabled while it is empty, and Cmd or Ctrl + Enter sends.
- `onComment` receives `{ text, replyTo? }`; likes report through `onLikeChange(commentId, liked)`.
- Times are RelativeTime, timed from the page load in the sample.

## Accessibility

- The thread is an ordered list, replies a nested one, and each comment an article named for its author.
- Each Reply button names whom it replies to, and the composer's name changes with it.
- Avatars are decorative beside the author's name.

## Source

```tsx
"use client"

import { useState, useRef } from "react"
import { Avatar, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, Icon, LikeButton, RelativeTime, Textarea } from "@sableui/react"

// Times are relative to the page load — replace with each comment's own timestamp.
const MINUTE = 60_000
const thread = [
	{
		id: "c1",
		author: { name: "Ana Chen", initials: "AC" },
		postedAt: Date.now() - 95 * MINUTE,
		text: "The new onboarding flow cut our setup time in half. Can we ship the checklist to everyone next week?",
		likes: 6,
		replies: [
			{
				id: "c2",
				author: { name: "Kofi Mensah", initials: "KM" },
				postedAt: Date.now() - 70 * MINUTE,
				text: "Yes, once the empty states are in. I'll have them ready by Thursday.",
				likes: 2,
			},
		],
	},
	{
		id: "c3",
		author: { name: "Amira Haddad", initials: "AH" },
		postedAt: Date.now() - 20 * MINUTE,
		text: "Research has three sessions booked on the checklist. Notes go in the shared folder as they land.",
		likes: 3,
		replies: [],
	},
]
const me = { name: "You", initials: "YO" }

type Reply = (typeof thread)[number]["replies"][number]
type Comment = Reply & { replies: Reply[] }

export interface CommentThreadBlockProps {
	className?: string
	/** false drops the card's surface and border — for a document side panel that already frames it. */
	framed?: boolean
	/** Called with the comment, and the id of the comment it replies to if it is a reply. */
	onComment?: (comment: { text: string; replyTo?: string }) => void
	/** Called with the comment's id and the new state when the reader likes or unlikes it. */
	onLikeChange?: (commentId: string, liked: boolean) => void
}

export function CommentThreadBlock({ className, framed = true, onComment, onLikeChange }: CommentThreadBlockProps) {
	const [comments, setComments] = useState<Comment[]>(thread)
	const [draft, setDraft] = useState("")
	// The comment being replied to, if any, and the top-level comment its reply joins.
	const [replyTo, setReplyTo] = useState<{ id: string; name: string; threadId: string } | null>(null)
	const field = useRef<HTMLTextAreaElement>(null)

	const send = () => {
		const text = draft.trim()
		if (!text) return
		const added: Reply = { id: `c${Date.now()}`, author: me, postedAt: Date.now(), text, likes: 0 }
		setComments((current) =>
			replyTo
				? current.map((comment) => (comment.id === replyTo.threadId ? { ...comment, replies: [...comment.replies, added] } : comment))
				: [...current, { ...added, replies: [] }],
		)
		onComment?.(replyTo ? { text, replyTo: replyTo.id } : { text })
		setDraft("")
		setReplyTo(null)
	}

	const count = comments.reduce((sum, comment) => sum + 1 + comment.replies.length, 0)

	// One comment: who, when, what, and its two actions. A reply is the same, one level in.
	const renderComment = (comment: Reply, parent: Comment) => (
		<article className="flex gap-3" aria-label={`${comment.author.name}'s comment`}>
			<Avatar variant="art" size="sm" fallback={comment.author.initials} alt="" />
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex flex-wrap items-baseline gap-x-2">
					<span className="text-label-md">{comment.author.name}</span>
					<span className="text-caption text-muted-foreground">
						<RelativeTime date={comment.postedAt} />
					</span>
				</div>
				<p className="text-body-sm">{comment.text}</p>
				<div className="flex items-center gap-1">
					<LikeButton bleed="start" size="sm" count={comment.likes} onPressedChange={(liked) => onLikeChange?.(comment.id, liked)} />
					<Button
						variant="ghost"
						size="sm"
						aria-label={`Reply to ${comment.author.name}`}
						onClick={() => {
							setReplyTo({ id: comment.id, name: comment.author.name, threadId: parent.id })
							field.current?.focus()
						}}
					>
						Reply
					</Button>
				</div>
			</div>
		</article>
	)

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-md", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>Comments</CardTitle>
				<CardDescription>{count === 1 ? "1 comment" : `${count} comments`}</CardDescription>
			</CardHeader>
			<CardContent>
				<ol className="flex flex-col gap-5">
					{comments.map((comment) => (
						<li key={comment.id} className="flex flex-col gap-4">
							{renderComment(comment, comment)}
							{/* Replies sit one level in, on a rule that ties them to the comment. */}
							{comment.replies.length ? (
								<ol className="ms-4 flex flex-col gap-4 border-s border-border ps-4">
									{comment.replies.map((reply) => (
										<li key={reply.id}>{renderComment(reply, comment)}</li>
									))}
								</ol>
							) : null}
						</li>
					))}
				</ol>
			</CardContent>
			<CardFooter className="flex-col items-stretch gap-2">
				{replyTo ? (
					<div className="flex items-center justify-between gap-2 text-body-sm text-muted-foreground">
						<span>Replying to {replyTo.name}</span>
						<Button variant="ghost" size="icon-sm" bleed="end" aria-label="Cancel reply" onClick={() => setReplyTo(null)}>
							<Icon name="xmark" />
						</Button>
					</div>
				) : null}
				<Textarea
					ref={field}
					autoResize
					rows={2}
					value={draft}
					onChange={(event) => setDraft(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) send()
					}}
					placeholder={replyTo ? `Reply to ${replyTo.name}…` : "Add a comment…"}
					aria-label={replyTo ? `Reply to ${replyTo.name}` : "Add a comment"}
				/>
				<Button className="self-end" disabled={!draft.trim()} onClick={send}>
					{replyTo ? "Reply" : "Comment"}
				</Button>
			</CardFooter>
		</Card>
	)
}
```
