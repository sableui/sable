import { Card, CardContent, LikeButton, Row, Stack, likeButtonMeta } from "@sableui/react"
import { Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

export function LikeButtonPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Like Button" lede={ledeFor(likeButtonMeta)} />

			<Section
				title="Like"
				description="Press it on: the heart blooms past its size and settles while a ring opens and dots spray out in the theme's palette, and the count rolls up a digit. Press it off and it simply empties."
			>
				<Example
					code={`<LikeButton count={post.likes} defaultPressed={post.liked} onPressedChange={(on) => api.like(post.id, on)} />`}
				>
					<Card className="w-full max-w-sm">
						<CardContent>
							<Stack gap={3}>
								<span className="text-body-md text-foreground">Shipped the new onboarding flow.</span>
								<Row gap={1}>
									<LikeButton count={1300} />
								</Row>
							</Stack>
						</CardContent>
					</Card>
				</Example>
			</Section>

			<Section
				title="Glyph and tone"
				description="Any icon with a solid variant, filled from any palette family. The family follows the theme, so a star is the theme's yellow, not a fixed one."
			>
				<Example
					code={`<LikeButton icon="star" tone="yellow" label="Star" variant="outline" count={12400} format={{ notation: "compact" }} />
<LikeButton icon="thumbs-up" tone="blue" label="Upvote" variant="secondary" count={86} />
<LikeButton label="Save recipe" />`}
				>
					<LikeButton icon="star" tone="yellow" label="Star" variant="outline" count={12400} format={{ notation: "compact" }} />
					<LikeButton icon="thumbs-up" tone="blue" label="Upvote" variant="secondary" count={86} />
					<LikeButton label="Save recipe" />
				</Example>
			</Section>

			<Section
				title="Sizes"
				description="Button's labelled sizes. Without a count it is the matching square icon button."
			>
				<Example code={`<LikeButton size="xs" count={8} />\n<LikeButton size="sm" count={8} />\n<LikeButton size="md" count={8} />`}>
					<LikeButton size="xs" count={8} />
					<LikeButton size="sm" count={8} />
					<LikeButton size="md" count={8} />
				</Example>
			</Section>

			<Section
				title="Subtle motion"
				description={'motion="subtle" keeps the fill and the count changing and drops the bloom and the burst. Under the reader\'s reduce-motion setting that is what everyone gets.'}
			>
				<Example code={`<LikeButton motion="subtle" count={42} />`}>
					<LikeButton motion="subtle" count={42} />
				</Example>
			</Section>

			<MetaFooter meta={likeButtonMeta} />
		</>
	)
}
