import { Avatar, Card, CardContent, Entity, IconTile, iconTileMeta, PALETTE_COLORS } from "@sableui/react"
import { Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

export function IconTilePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Icon Tile" lede={ledeFor(iconTileMeta)} />

			<Section title="Sizes" description="The Avatar ladder and its square corner: 32, 40 and 48px. The icon scales with the tile.">
				<Example code={`<IconTile icon="layout" size="sm" />\n<IconTile icon="layout" />\n<IconTile icon="layout" size="lg" />`}>
					<div className="flex items-center gap-4">
						<IconTile icon="layout" size="sm" />
						<IconTile icon="layout" />
						<IconTile icon="layout" size="lg" />
					</div>
				</Example>
			</Section>

			<Section
				title="On a card"
				description="The default fill is the well of the surface it sits on, so the same tile reads on a card, a muted section or a popover."
			>
				<Example
					code={`<Card>\n  <CardContent className="flex flex-col gap-3">\n    <IconTile icon="component" />\n    <h3 className="pt-2 text-title-lg">Behavior built in</h3>\n    <p className="text-body-sm text-muted-foreground">Focus, keyboard and ARIA from Base UI.</p>\n  </CardContent>\n</Card>`}
				>
					<Card className="w-full max-w-xs">
						<CardContent className="flex flex-col gap-3">
							<IconTile icon="component" />
							<h3 className="pt-2 text-title-lg">Behavior built in</h3>
							<p className="text-body-sm text-muted-foreground">Focus, keyboard and ARIA from Base UI.</p>
						</CardContent>
					</Card>
				</Example>
			</Section>

			<Section
				title="In a row"
				description="A thing, not a person, in an Entity's leading slot: the muted appearance at the size of the Avatar beside it."
			>
				<Example
					code={`<Entity leading={<IconTile icon="file" size="sm" appearance="muted" />} title="Q4 roadmap" subtitle="Edited 2 hours ago" />\n<Entity leading={<Avatar size="sm" fallback="AC" alt="" />} title="Ana Chen" subtitle="Design lead" />`}
				>
					<div className="flex w-full max-w-xs flex-col">
						<Entity leading={<IconTile icon="file" size="sm" appearance="muted" />} title="Q4 roadmap" subtitle="Edited 2 hours ago" />
						<Entity leading={<Avatar size="sm" fallback="AC" alt="" />} title="Ana Chen" subtitle="Design lead" />
					</div>
				</Example>
			</Section>

			<Section title="Palette tones" description="A category colour: a family's wash and deep ink, the pair a soft Badge uses. Never a status.">
				<Example code={`<IconTile icon="tag" tone="teal" />`}>
					<div className="flex flex-wrap items-center gap-3">
						{PALETTE_COLORS.map((color) => (
							<IconTile key={color} icon="tag" tone={color} />
						))}
					</div>
				</Example>
			</Section>

			<MetaFooter meta={iconTileMeta} />
		</>
	)
}
