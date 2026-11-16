import type { BlockMeta } from "../lib/meta"

export const postBlockMeta: BlockMeta = {
	name: "PostBlock",
	family: "Social & messaging",
	kind: "card",
	width: { min: "18rem", max: "24rem" },
	summary: "A feed post on a card: the author as an Entity with a RelativeTime, the text behind a ShowMore, a photo, and a LikeButton with its count beside comments and save.",
	intent:
		"Reach for this as the item of a social feed, a community update or an activity stream. A message between two people is ChatThreadBlock; a post with no author and a price is ProductCardBlock.",
	notes: [
		"The text collapses to three of its own lines (`collapsedLines`), so the preview stays three lines when the type scale or density changes. A short post shows in full with no control.",
		"The time is a RelativeTime: \"2 hours ago\" to read, the exact date on hover and to a screen reader.",
		"Without a photo URL the image is GradientArt seeded by the post id, so every post keeps its own stable art.",
		"Like owns its count and rolls it on press. Save is the same control with a star and no count — one pressed-state behaviour for both.",
		"The author row's menu (copy link, mute, report) is a real Menu reported through `onPostAction`, never an ellipsis that does nothing.",
		"The actions sit in the content's own spacing, and the ghost buttons at each end bleed by their padding, so the heart and the star line up with the text edges above them.",
	],
	a11y: [
		"The avatar's alt names the author; the photo is decorative beside the text, so give `alt` on MediaImage when it carries meaning of its own.",
		"The like button is a toggle (aria-pressed) whose name reads \"Like\" then the count. The comment button is named as one string, \"24 comments\", so the count and the word cannot run together.",
		"The menu button is named for the post it acts on (\"More options for Mara Okafor's post\"), not a bare \"More\".",
	],
}
