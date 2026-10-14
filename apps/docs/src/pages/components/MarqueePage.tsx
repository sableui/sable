import { Badge, Card, CardContent, Marquee, marqueeMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const TAGS = [
	"Design",
	"Projects",
	"Reports",
	"Billing",
	"Teams",
	"Analytics",
	"Exports",
	"Webhooks",
]

export function MarqueePage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Marquee"
				lede={ledeFor(marqueeMeta)}
			/>

			<Section
				title="Continuous loop"
				description="A seamless loop. Hover to pause."
			>
				<Example className="block">
					<Marquee className="py-2" label="Topics">
						{TAGS.map((t) => (
							<Badge key={t}>{t}</Badge>
						))}
					</Marquee>
				</Example>
			</Section>

			<Section
				title="Reverse and speed"
				description="Runs the other way, a little faster."
			>
				<Example className="block">
					<Marquee direction="right" speed={70} className="py-2">
						{TAGS.map((t) => (
							<Badge key={t} appearance="outline">
								{t}
							</Badge>
						))}
					</Marquee>
				</Example>
			</Section>

			<Section
				title="Vertical"
				description="Scrolls a column up or down within a fixed height."
			>
				<Example className="block">
					<Marquee direction="up" className="h-56 w-64" gap="calc(var(--spacing) * 3)">
						{TAGS.map((t) => (
							<Card key={t} density="compact">
								<CardContent className="text-body-sm">{t}</CardContent>
							</Card>
						))}
					</Marquee>
				</Example>
			</Section>

			<MetaFooter meta={marqueeMeta} />
		</>
	)
}
