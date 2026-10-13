import { PieChart, pieChartMeta } from "@sableui/react"
import { useState } from "react"
import { ComponentPlayground, Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"
import { BROWSERS, VISITORS } from "../../content/chart-data"

const TOTAL = BROWSERS.reduce((sum, b) => sum + b.visitors, 0)
const RINGS = VISITORS.slice(0, 4).map((v) => ({ ...v, month: v.month.slice(0, 3) }))

function InteractivePie() {
	const [active, setActive] = useState<number | null>(0)
	const shown = active ?? 0
	return (
		<PieChart
			label="Visitors by browser"
			data={BROWSERS}
			index="browser"
			valueKey="visitors"
			donut
			activeIndex={active}
			onActiveIndexChange={(i) => i != null && setActive(i)}
			centerLabel={{ value: BROWSERS[shown].visitors, label: BROWSERS[shown].browser }}
		/>
	)
}

export function PieChartPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Pie Chart" lede={ledeFor(pieChartMeta)} />
			<ComponentPlayground meta={pieChartMeta} />

			<Section title="Default" description="Slices sweep in clockwise from 12 o'clock as the chart scrolls into view.">
				<Example>
					<PieChart label="Visitors by browser" data={BROWSERS} index="browser" valueKey="visitors" />
				</Example>
			</Section>

			<Section title="Without separators">
				<Example>
					<PieChart label="Visitors by browser" data={BROWSERS} index="browser" valueKey="visitors" separator={false} />
				</Example>
			</Section>

			<Section title="Labels" description="Outside with the share, or inside with the value.">
				<Example>
					<div className="grid w-full gap-6 md:grid-cols-2">
						<PieChart label="Share of visitors by browser" data={BROWSERS} index="browser" valueKey="visitors" labels="outside" labelContent="percent" />
						<PieChart label="Visitors by browser" data={BROWSERS} index="browser" valueKey="visitors" labels="inside" legend />
					</div>
				</Example>
			</Section>

			<Section title="Donut" description="With the total in the middle.">
				<Example>
					<PieChart label="Visitors by browser" data={BROWSERS} index="browser" valueKey="visitors" donut centerLabel={{ value: TOTAL, label: "Visitors" }} />
				</Example>
			</Section>

			<Section title="Active slice" description="The active slice pulls outward; hover another and the centre follows.">
				<Example>
					<InteractivePie />
				</Example>
			</Section>

			<Section title="Stacked rings" description="Several measures as concentric rings, outer first.">
				<Example>
					<PieChart label="Visitors by month, desktop and mobile" data={RINGS} index="month" valueKey={["desktop", "mobile"]} donut={0.35} />
				</Example>
			</Section>

			<Section title="Icons and tones" description="categories sets each slice's name, tone and icon.">
				<Example>
					<PieChart
						label="Visitors by browser"
						data={BROWSERS}
						index="browser"
						valueKey="visitors"
						donut
						categories={{ Chrome: { tone: "primary" }, Safari: { tone: "info" }, Other: { tone: "neutral", label: "Everything else" } }}
					/>
				</Example>
			</Section>

			<MetaFooter meta={pieChartMeta} />
		</>
	)
}
