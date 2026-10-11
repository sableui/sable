import { Card, CardList, DateTile, Entity, dateTileMeta } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const UPCOMING = [
	{ date: new Date(2026, 9, 14), title: "Design review", detail: "Tuesday, 2:00 – 2:45 PM" },
	{ date: new Date(2026, 9, 21), title: "Launch", detail: "Tuesday, all day" },
	{ date: new Date(2026, 10, 2), title: "Retro", detail: "Monday, 4:00 PM" },
]

export function DateTilePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Date Tile" lede={ledeFor(dateTileMeta)} />

			<ComponentPlayground meta={dateTileMeta} />

			<Section title="Beside a title" description="The tile names the day. The weekday and time go in the text beside it.">
				<Example>
					<div className="flex gap-4">
						<DateTile date={new Date(2026, 9, 14)} />
						<div className="flex flex-col gap-1">
							<span className="text-title-lg">Design review</span>
							<span className="text-body-sm text-muted-foreground">Tuesday, 2:00 – 2:45 PM</span>
						</div>
					</div>
				</Example>
			</Section>

			<Section title="In a list" description="As an Entity's leading visual, the dates line up into one column.">
				<Example>
					<Card className="w-full max-w-sm">
						<CardList>
							{UPCOMING.map((e) => (
								<Entity key={e.title} leading={<DateTile date={e.date} />} title={e.title} subtitle={e.detail} />
							))}
						</CardList>
					</Card>
				</Example>
			</Section>

			<MetaFooter meta={dateTileMeta} />
		</>
	)
}
