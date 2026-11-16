"use client"

import { Avatar } from "../components/avatar"
import { Button } from "../components/button"
import { Card, CardContent } from "../components/card"
import { Entity } from "../components/entity"
import { LikeButton } from "../components/like-button"
import { MediaImage } from "../components/media-image"
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "../components/menu"
import { RelativeTime } from "../components/relative-time"
import { ShowMore } from "../components/show-more"
import { Icon } from "../icon"
import { AspectBox } from "../layout/AspectBox"
import { cn } from "../lib/cn"

// ---block-code---
// `image` is the photo URL; left empty, it paints art seeded by the post id.
const post = {
	id: "post-218",
	author: { name: "Mara Okafor", handle: "@mara", initials: "MO" },
	// Two hours before the page loaded — replace with the post's own timestamp.
	postedAt: Date.now() - 2 * 60 * 60 * 1000,
	text: "First light over the ridge this morning. We left camp at four, climbed in the dark, and reached the saddle just as the valley filled with colour. Cold hands, hot coffee, and nobody said a word for ten minutes.",
	image: "",
	likes: 128,
	comments: 24,
}

export interface PostBlockProps {
	className?: string
	/** false drops the card's surface and border — for a feed column that already frames it. */
	framed?: boolean
	/** Called with the new state when the reader likes or unlikes the post. */
	onLikeChange?: (liked: boolean) => void
	/** Called when the reader opens the comments. */
	onComment?: () => void
	/** Called with the new state when the reader saves or unsaves the post. */
	onSaveChange?: (saved: boolean) => void
	/** Called with the row chosen in the post's menu. */
	onPostAction?: (action: "copy-link" | "mute" | "report") => void
}

export function PostBlock({ className, framed = true, onLikeChange, onComment, onSaveChange, onPostAction }: PostBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-sm", className)}>
			<CardContent className="flex flex-col gap-3">
				<Entity
					className="p-0"
					leading={<Avatar variant="art" fallback={post.author.initials} alt={post.author.name} />}
					title={post.author.name}
					subtitle={
						<>
							{post.author.handle} · <RelativeTime date={post.postedAt} />
						</>
					}
					action={
						<Menu>
							<MenuTrigger
								render={
									<Button variant="ghost" size="icon-sm" bleed="end" aria-label={`More options for ${post.author.name}'s post`}>
										<Icon name="ellipsis" variant="solid" />
									</Button>
								}
							/>
							<MenuContent align="end">
								<MenuItem icon={<Icon name="link" />} onClick={() => onPostAction?.("copy-link")}>
									Copy link
								</MenuItem>
								<MenuItem icon={<Icon name="eye-off" />} onClick={() => onPostAction?.("mute")}>
									Mute {post.author.handle}
								</MenuItem>
								<MenuSeparator />
								<MenuItem icon={<Icon name="flag" />} onClick={() => onPostAction?.("report")}>
									Report post
								</MenuItem>
							</MenuContent>
						</Menu>
					}
				/>
				{/* Three lines of the post, whatever the type scale; the rest on request. */}
				<ShowMore collapsedLines={3}>
					<p className="text-body-md">{post.text}</p>
				</ShowMore>
				<AspectBox ratio={4 / 3} className="rounded-md">
					<MediaImage src={post.image} seed={post.id} />
				</AspectBox>
				{/* In the content's own rhythm, not a footer: a footer's padding on top of
				    the buttons' own left the actions adrift under the photo. */}
				<div className="flex items-center gap-1">
					<LikeButton bleed="start" count={post.likes} onPressedChange={(liked) => onLikeChange?.(liked)} />
					{/* The name is one string, "24 comments": a count and a hidden word
					    in separate nodes ran together as "24comments". */}
					<Button variant="ghost" size="sm" aria-label={`${post.comments} comments`} onClick={onComment}>
						<Icon name="comment" />
						{post.comments}
					</Button>
					<LikeButton
							className="ms-auto"
							bleed="end"
							icon="star"
							tone="yellow"
							label="Save"
							onPressedChange={(saved) => onSaveChange?.(saved)}
						/>
				</div>
			</CardContent>
		</Card>
	)
}
