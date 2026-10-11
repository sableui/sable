import {
	Avatar,
	ContextCard,
	ContextCardArrow,
	ContextCardContent,
	contextCardMeta,
	ContextCardTrigger,
	Entity,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function ContextCardPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Context Card"
				lede={ledeFor(contextCardMeta)}
			/>

			<Section
				title="Profile preview"
				description="Hover or focus the link to show the card."
			>
				<Example>
					<p className="text-body-md text-muted-foreground">
						Curated by{" "}
						<ContextCard>
							<ContextCardTrigger
								render={
									<a
										href="/u/ada"
										className="text-title-sm text-foreground underline-offset-2 motion-interactive hover:underline"
									>
										@ada
									</a>
								}
							/>
							<ContextCardContent>
								<Entity
									className="[--entity-px:0] [--entity-py:0]"
									leading={<Avatar fallback="AL" size="lg" />}
									title="Ada Lovelace"
									subtitle="@ada"
								/>
								<p className="mt-3 text-body-sm text-muted-foreground">
									Minting generative editions on Solana. Stored permanently on
									Arweave.
								</p>
							</ContextCardContent>
						</ContextCard>{" "}
						this week.
					</p>
				</Example>
			</Section>

			<Section
				title="With a stat row"
				description="A name, a short bio and a few stats."
			>
				<Example>
					<p className="text-body-md text-muted-foreground">
						Reply from{" "}
						<ContextCard>
							<ContextCardTrigger
								render={
									<a
										href="/u/nyx"
										className="text-title-sm text-foreground underline-offset-2 motion-interactive hover:underline"
									>
										@nyx
									</a>
								}
							/>
							<ContextCardContent>
								<Entity
									className="[--entity-px:0] [--entity-py:0]"
									leading={<Avatar fallback="NY" size="lg" />}
									title="Nyx"
									subtitle="@nyx"
								/>
								<p className="mt-3 text-body-sm text-muted-foreground">
									Sound artist. Edition drops every full moon.
								</p>
								<div className="@container mt-4 border-t border-border pt-3">
									<dl className="sable-list-dl sable-list-dl-2">
										<dt>Posts</dt>
										<dd>128</dd>
										<dt>Followers</dt>
										<dd>4.2k</dd>
									</dl>
								</div>
							</ContextCardContent>
						</ContextCard>
						.
					</p>
				</Example>
			</Section>

			<Section
				title="Sided with an arrow"
				description="The card can open on any side, with an arrow pointing back at the link."
			>
				<Example>
					<p className="text-body-md text-muted-foreground">
						See{" "}
						<ContextCard>
							<ContextCardTrigger
								render={
									<a
										href="/u/orb"
										className="text-title-sm text-foreground underline-offset-2 motion-interactive hover:underline"
									>
										@orb
									</a>
								}
							/>
							<ContextCardContent side="top">
								<ContextCardArrow />
								<Entity
									className="[--entity-px:0] [--entity-py:0]"
									leading={<Avatar fallback="OR" size="lg" />}
									title="Orb"
									subtitle="@orb"
								/>
								<p className="mt-3 text-body-sm text-muted-foreground">
									Worldbuilding one collectible at a time.
								</p>
							</ContextCardContent>
						</ContextCard>{" "}
						for the latest.
					</p>
				</Example>
			</Section>

			<MetaFooter meta={contextCardMeta} />
		</>
	)
}
