import { Card, CardAction, CardDescription, CardHeader, CardTitle, Sparkline, sparklineMeta } from "@sableui/react"
import { ComponentPlayground, Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

const REVENUE = [12, 14, 13, 17, 16, 19, 18, 21, 20, 24, 23, 26]
const SIGNUPS = [4, 6, 3, 8, 7, 9, 5, 6, 10, 8, 7, 11, 9, 12]
const CHURN = [9, 8, 9, 7, 8, 6, 7, 5, 6, 4, 5, 4]

export function SparklinePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Sparkline" lede={ledeFor(sparklineMeta)} />
			<ComponentPlayground meta={sparklineMeta} />

			<Section title="Variants" description="A line, a line over a soft fill, or columns.">
				<Example replayable>
					<div className="flex flex-wrap items-center gap-8">
						<Sparkline label="Revenue, last 12 weeks" data={REVENUE} />
						<Sparkline label="Revenue, last 12 weeks" data={REVENUE} variant="area" tone="success" />
						<Sparkline label="Daily signups, last 14 days" data={SIGNUPS} variant="bar" tone="info" />
					</div>
				</Example>
			</Section>

			<Section title="In a stat card" description="Beside the number it explains — the sparkline shows only the shape.">
				<Example replayable>
					<div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
						<Card>
							<CardHeader>
								<CardDescription>Revenue</CardDescription>
								<CardTitle className="text-mono-xl">$18,240</CardTitle>
								<CardAction>
									<Sparkline label="Revenue, last 12 weeks" data={REVENUE} variant="area" tone="success" />
								</CardAction>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader>
								<CardDescription>Churn</CardDescription>
								<CardTitle className="text-mono-xl">4.1%</CardTitle>
								<CardAction>
									<Sparkline label="Churn, last 12 weeks" data={CHURN} tone="warning" />
								</CardAction>
							</CardHeader>
						</Card>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={sparklineMeta} />
		</>
	)
}
