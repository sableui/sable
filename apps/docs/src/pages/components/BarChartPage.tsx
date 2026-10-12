import { BarChart, barChartMeta, Grid, Toggle, ToggleGroup } from "@sableui/react"
import { useState } from "react"
import { ComponentPlayground, Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"
import { BROWSERS, DAILY, DEVICES, NET, VISITORS, shortDate, shortMonth } from "../../content/chart-data"

function InteractiveBar() {
	const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
	return (
		<div className="flex w-full flex-col gap-4">
			<ToggleGroup value={[device]} onValueChange={(v: unknown[]) => v[0] && setDevice(v[0] as "desktop" | "mobile")} aria-label="Device" className="self-end">
				<Toggle value="desktop">Desktop</Toggle>
				<Toggle value="mobile">Mobile</Toggle>
			</ToggleGroup>
			<BarChart label="Daily visitors" data={DAILY.slice(-30)} index="date" series={DEVICES.filter((d) => d.key === device)} indexFormatter={shortDate} radius={3} className="h-72" />
		</div>
	)
}

export function BarChartPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Bar Chart" lede={ledeFor(barChartMeta)} />
			<ComponentPlayground meta={barChartMeta} />

			<Section title="Default" description="Bars rise from the baseline in sequence as the chart scrolls into view.">
				<Example>
					<BarChart label="Desktop visitors" data={VISITORS} index="month" series={[DEVICES[0]]} indexFormatter={shortMonth} />
				</Example>
			</Section>

			<Section title="Multiple" description="Series side by side, to compare them category by category.">
				<Example>
					<BarChart label="Visitors by device" data={VISITORS} index="month" series={DEVICES} indexFormatter={shortMonth} />
				</Example>
			</Section>

			<Section title="Stacked" description="A total and its parts; only the outer segment rounds.">
				<Example>
					<div className="grid w-full gap-6 md:grid-cols-2">
						<BarChart label="Visitors by device" data={VISITORS} index="month" series={DEVICES} indexFormatter={shortMonth} stacked tooltip={{ showTotal: true }} />
						<BarChart label="Share of visitors by device" data={VISITORS} index="month" series={DEVICES} indexFormatter={shortMonth} stacked="expand" />
					</div>
				</Example>
			</Section>

			<Section title="Horizontal" description="For long category names; labels can sit inside the bars.">
				<Example>
					<div className="grid w-full gap-6 md:grid-cols-2">
						<BarChart label="Visitors by browser" data={BROWSERS} index="browser" series={[{ key: "visitors", label: "Visitors" }]} orientation="horizontal" labels />
						<BarChart label="Visitors by browser" data={BROWSERS} index="browser" series={[{ key: "visitors", label: "Visitors" }]} orientation="horizontal" labels="inside" yAxis={false} grid={false} />
					</div>
				</Example>
			</Section>

			<Section title="Labels" description="Values at the end of each bar.">
				<Example>
					<BarChart label="Desktop visitors" data={VISITORS} index="month" series={[DEVICES[0]]} indexFormatter={shortMonth} labels grid={false} />
				</Example>
			</Section>

			<Section title="Colour by category" description="One series, each bar its own tone.">
				<Example>
					<BarChart label="Visitors by browser" data={BROWSERS} index="browser" series={[{ key: "visitors", label: "Visitors" }]} colorBy="index" />
				</Example>
			</Section>

			<Section title="Active" description="A row can start highlighted — the tooltip is open before anyone hovers.">
				<Example>
					<BarChart label="Visitors by browser" data={BROWSERS} index="browser" series={[{ key: "visitors", label: "Visitors" }]} defaultActiveIndex={1} />
				</Example>
			</Section>

			<Section title="Negative" description="Diverging around zero, with losses in their own tone.">
				<Example>
					<BarChart label="Net revenue by month" data={NET} index="month" series={[{ key: "net", label: "Net", tone: "success" }]} negativeTone="destructive" indexFormatter={shortMonth} labels />
				</Example>
			</Section>

			<Section title="Tooltip" description="Row markers (dot, line, dashed, none), no heading, a formatted heading, values in units, and a total.">
				<Example>
					<Grid cols={{ base: 1, md: 2 }} gap={3} className="w-full">
						<BarChart label="Visitors by device, line indicator" data={VISITORS} index="month" series={DEVICES} indexFormatter={shortMonth} stacked tooltip={{ indicator: "line" }} defaultActiveIndex={2} legend={false} />
						<BarChart label="Visitors by device, dashed indicator" data={VISITORS} index="month" series={DEVICES} indexFormatter={shortMonth} stacked tooltip={{ indicator: "dashed", labelFormatter: (m) => `${m} 2026` }} defaultActiveIndex={2} legend={false} />
						<BarChart label="Visitors by device, no indicator" data={VISITORS} index="month" series={DEVICES} indexFormatter={shortMonth} stacked tooltip={{ indicator: "none", hideLabel: true }} defaultActiveIndex={2} legend={false} />
						<BarChart label="Revenue by device" data={VISITORS} index="month" series={DEVICES} indexFormatter={shortMonth} stacked valueFormatter={(v) => `$${v.toLocaleString("en-US")}`} tooltip={{ showTotal: true }} defaultActiveIndex={2} legend={false} />
					</Grid>
				</Example>
			</Section>

			<Section title="Interactive" description="Switching the series eases every bar to its new length.">
				<Example>
					<InteractiveBar />
				</Example>
			</Section>

			<MetaFooter meta={barChartMeta} />
		</>
	)
}
