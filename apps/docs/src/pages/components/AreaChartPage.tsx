import { AreaChart, Toggle, ToggleGroup, areaChartMeta } from "@sableui/react"
import { useState } from "react"
import { ComponentPlayground, Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"
import { DAILY, DEVICES, DEVICES_WITH_ICONS, VISITORS, shortDate, shortMonth } from "../../content/chart-data"

const RANGES = { "90d": 90, "30d": 30, "7d": 7 } as const

function InteractiveArea() {
	const [range, setRange] = useState<keyof typeof RANGES>("90d")
	return (
		<div className="flex w-full flex-col gap-4">
			<ToggleGroup value={[range]} onValueChange={(v: unknown[]) => v[0] && setRange(v[0] as keyof typeof RANGES)} aria-label="Time range" className="self-end">
				<Toggle value="90d">3 months</Toggle>
				<Toggle value="30d">30 days</Toggle>
				<Toggle value="7d">7 days</Toggle>
			</ToggleGroup>
			<AreaChart
				label="Daily visitors"
				data={DAILY.slice(-RANGES[range])}
				index="date"
				series={DEVICES}
				indexFormatter={shortDate}
				stacked
				gradient
				className="h-72"
			/>
		</div>
	)
}

export function AreaChartPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Area Chart" lede={ledeFor(areaChartMeta)} />
			<ComponentPlayground meta={areaChartMeta} />

			<Section title="Default" description="One series, smooth. The line draws on and the fill rises as the chart scrolls into view.">
				<Example replayable>
					<AreaChart label="Desktop visitors" data={VISITORS} index="month" series={[DEVICES[0]]} indexFormatter={shortMonth} />
				</Example>
			</Section>

			<Section title="Curves" description="Linear joins points with straight lines; step holds each value until the next.">
				<Example replayable>
					<div className="grid w-full gap-6 md:grid-cols-2">
						<AreaChart label="Desktop visitors, linear" data={VISITORS} index="month" series={[DEVICES[0]]} indexFormatter={shortMonth} curve="linear" />
						<AreaChart label="Desktop visitors, step" data={VISITORS} index="month" series={[DEVICES[0]]} indexFormatter={shortMonth} curve="step" />
					</div>
				</Example>
			</Section>

			<Section title="Stacked" description="A total and its parts. Two or more series get a legend.">
				<Example replayable>
					<AreaChart label="Visitors by device" data={VISITORS} index="month" series={DEVICES} indexFormatter={shortMonth} stacked tooltip={{ indicator: "dot", showTotal: true }} />
				</Example>
			</Section>

			<Section title="Stacked to 100%" description="Each month as a whole, to compare shares rather than totals.">
				<Example replayable>
					<AreaChart label="Share of visitors by device" data={VISITORS} index="month" series={DEVICES} indexFormatter={shortMonth} stacked="expand" yAxis tooltip={{ indicator: "line" }} />
				</Example>
			</Section>

			<Section title="Gradient" description="A fade from the series colour, for a lighter fill on landing pages and decks.">
				<Example replayable>
					<AreaChart label="Visitors by device" data={VISITORS} index="month" series={DEVICES} indexFormatter={shortMonth} gradient />
				</Example>
			</Section>

			<Section title="Axes and icons" description="A value axis for reading numbers off, and icons in the legend and tooltip.">
				<Example replayable>
					<AreaChart label="Visitors by device" data={VISITORS} index="month" series={DEVICES_WITH_ICONS} indexFormatter={shortMonth} yAxis stacked />
				</Example>
			</Section>

			<Section title="Interactive" description="Changing the data eases the shape from old to new.">
				<Example replayable>
					<InteractiveArea />
				</Example>
			</Section>

			<MetaFooter meta={areaChartMeta} />
		</>
	)
}
