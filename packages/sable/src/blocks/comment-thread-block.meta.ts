import type { BlockMeta } from "../lib/meta"

export const commentThreadBlockMeta: BlockMeta = {
	name: "CommentThreadBlock",
	family: "Social & messaging",
	kind: "card",
	width: { min: "20rem", max: "28rem" },
	summary: "A comment thread on a document or post: comments with an Avatar, RelativeTime, a LikeButton and Reply, replies one level in, and a Textarea composer that knows what it is replying to.",
	intent:
		"Reach for this under a post, beside a document or on a task: asynchronous discussion that keeps its shape. A real-time conversation between people is ChatThreadBlock; one post with its counts is PostBlock.",
	notes: [
		"Replies sit one level in, on a rule. A reply to a reply joins the same level: past one indent a narrow card runs out of width and the thread stops reading as a conversation.",
		"Reply moves focus to the composer and labels it \"Reply to Ana Chen\"; a cancel button above it drops back to a new comment.",
		"The composer is a Textarea that grows with its text (autoResize). Comment is disabled while it is empty, and Cmd or Ctrl + Enter sends.",
		"`onComment` receives `{ text, replyTo? }`; likes report through `onLikeChange(commentId, liked)`.",
		"Times are RelativeTime, timed from the page load in the sample.",
	],
	a11y: [
		"The thread is an ordered list, replies a nested one, and each comment an article named for its author.",
		"Each Reply button names whom it replies to, and the composer's name changes with it.",
		"Avatars are decorative beside the author's name.",
	],
}
