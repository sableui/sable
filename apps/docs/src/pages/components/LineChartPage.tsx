import { LineChart, Toggle, ToggleGroup, lineChartMeta } from "@sableui/react"
import { useState } from "react"
import { ComponentPlayground, Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"
import { BROWSERS, DAILY, DEVICES, VISITORS, shortDate, shortMonth } from "../../content/chart-data"

function InteractiveLine() {
	const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
	const series = DEVICES.filter((d) => d.key === device)
	return (
		<div className="flex w-full flex-col gap-4">
			<ToggleGroup value={[device]} onValueChange={(v: unknown[]) => v[0] && setDevice(v[0] as "desktop" | "mobile")} aria-label="Device" className="self-end">
				<Toggle value="desktop">Desktop</Toggle>
				<Toggle value="mobile">Mobile</Toggle>
			</ToggleGroup>
			<LineChart label="Daily visitors" data={DAILY.slice(-45)} index="date" series={series} indexFormatter={shortDate} className="h-72" />
		</div>
	)
}

export function LineChartPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Line Chart" lede={ledeFor(lineChartMeta)} />
			<ComponentPlayground meta={lineChartMeta} />

			<Section title="Default" description="One smooth line. It draws on as the chart scrolls into view.">
				<Example replayable>
					<LineChart label="Desktop visitors" data={VISITORS} index="month" series={[DEVICES[0]]} indexFormatter={shortMonth} />
				</Example>
			</Section>

			<Section title="Curves">
				<Example replayable>
					<div className="grid w-full gap-6 md:grid-cols-2">
						<LineChart label="Desktop visitors, linear" data={VISITORS} index="month" series={[DEVICES[0]]} indexFormatter={shortMonth} curve="linear" />
						<LineChart label="Desktop visitors, step" data={VISITORS} index="month" series={[DEVICES[0]]} indexFormatter={shortMonth} curve="step" />
					</div>
				</Example>
			</Section>

			<Section title="Multiple" description="Lines compare movement without fills piling up.">
				<Example replayable>
					<LineChart label="Visitors by device" data={VISITORS} index="month" series={DEVICES} indexFormatter={shortMonth} />
				</Example>
			</Section>

			<Section title="Dots and labels" description="For a handful of points where the exact values are the story.">
				<Example replayable>
					<LineChart label="Desktop visitors" data={VISITORS} index="month" series={[DEVICES[0]]} indexFormatter={shortMonth} dots labels grid={false} curve="linear" />
				</Example>
			</Section>

			<Section title="Dots by category" description="colorBy=&quot;index&quot; gives each point its own tone.">
				<Example replayable>
					<LineChart label="Visitors by browser" data={BROWSERS} index="browser" series={[{ key: "visitors", label: "Visitors", tone: "neutral" }]} dots colorBy="index" labels />
				</Example>
			</Section>

			<Section title="Interactive" description="Switching the series eases the line to its new shape.">
				<Example replayable>
					<InteractiveLine />
				</Example>
			</Section>

			<MetaFooter meta={lineChartMeta} />
		</>
	)
}
