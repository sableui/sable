import { RadialChart, radialChartMeta } from "@sableui/react"
import { ComponentPlayground, Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"
import { BROWSERS, GOALS } from "../../content/chart-data"

const SPLIT = [
	{ device: "Desktop", visitors: 1260 },
	{ device: "Mobile", visitors: 570 },
]

export function RadialChartPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Radial Chart" lede={ledeFor(radialChartMeta)} />
			<ComponentPlayground meta={radialChartMeta} />

			<Section title="Default" description="A ring per row against its track. Rings draw round as the chart scrolls into view.">
				<Example replayable>
					<RadialChart label="Weekly goals" data={GOALS} index="goal" valueKey="progress" max={100} />
				</Example>
			</Section>

			<Section title="Labels" description="Ring names at their start, instead of a legend.">
				<Example replayable>
					<RadialChart label="Visitors by browser" data={BROWSERS.slice(0, 4)} index="browser" valueKey="visitors" labels />
				</Example>
			</Section>

			<Section title="Without a track">
				<Example replayable>
					<RadialChart label="Weekly goals" data={GOALS} index="goal" valueKey="progress" max={100} track={false} />
				</Example>
			</Section>

			<Section title="Text" description="A single ring with its value in the middle.">
				<Example replayable>
					<RadialChart label="Profile completeness" data={[{ step: "Complete", percent: 72 }]} index="step" valueKey="percent" max={100} centerLabel={{ value: "72%", label: "Complete" }} legend={false} />
				</Example>
			</Section>

			<Section title="Gauge" description="sweep={180} turns a ring into a gauge.">
				<Example replayable>
					<RadialChart label="Plan usage" data={[{ plan: "Used", gb: 7.2 }]} index="plan" valueKey="gb" max={10} sweep={180} centerLabel={{ value: "7.2 GB", label: "of 10 GB" }} legend={false} className="h-48" />
				</Example>
			</Section>

			<Section title="Stacked" description="One gauge split between rows.">
				<Example replayable>
					<RadialChart label="Visitors by device" data={SPLIT} index="device" valueKey="visitors" stacked sweep={180} centerLabel={{ value: "1,830", label: "Visitors" }} className="h-56" />
				</Example>
			</Section>

			<MetaFooter meta={radialChartMeta} />
		</>
	)
}
