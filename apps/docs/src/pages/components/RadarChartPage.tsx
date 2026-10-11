import { RadarChart, radarChartMeta } from "@sableui/react"
import { ComponentPlayground, Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"
import { SCORES } from "../../content/chart-data"

const ATLAS = [{ key: "atlas", label: "Atlas" }]
const BOTH = [
	{ key: "atlas", label: "Atlas" },
	{ key: "beacon", label: "Beacon" },
]

export function RadarChartPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Radar Chart" lede={ledeFor(radarChartMeta)} />
			<ComponentPlayground meta={radarChartMeta} />

			<Section title="Default" description="The polygon grows from the centre as the chart scrolls into view.">
				<Example>
					<RadarChart label="Atlas scores" data={SCORES} index="skill" series={ATLAS} />
				</Example>
			</Section>

			<Section title="Dots">
				<Example>
					<RadarChart label="Atlas scores" data={SCORES} index="skill" series={ATLAS} dots />
				</Example>
			</Section>

			<Section title="Multiple" description="Two profiles compared, with a legend.">
				<Example>
					<RadarChart label="Product scores compared" data={SCORES} index="skill" series={BOTH} />
				</Example>
			</Section>

			<Section title="Lines only" description="Outlines keep both shapes readable where they overlap.">
				<Example>
					<RadarChart label="Product scores compared" data={SCORES} index="skill" series={BOTH} filled={false} dots />
				</Example>
			</Section>

			<Section title="Grid" description="Circular, filled, or none — and a radius scale.">
				<Example>
					<div className="grid w-full gap-6 md:grid-cols-2">
						<RadarChart label="Atlas scores, circular grid" data={SCORES} index="skill" series={ATLAS} grid="circle" />
						<RadarChart label="Atlas scores, filled grid" data={SCORES} index="skill" series={ATLAS} gridFill filled={false} dots />
						<RadarChart label="Atlas scores, no grid" data={SCORES} index="skill" series={ATLAS} grid="none" dots />
						<RadarChart label="Atlas scores with a radius scale" data={SCORES} index="skill" series={ATLAS} radiusAxis />
					</div>
				</Example>
			</Section>

			<MetaFooter meta={radarChartMeta} />
		</>
	)
}
