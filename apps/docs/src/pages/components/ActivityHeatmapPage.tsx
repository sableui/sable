import {
	ActivityHeatmap,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Icon,
	activityHeatmapMeta,
	mergeActivity,
	type ActivityDay,
} from "@sableui/react"
import { useState } from "react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/** Sample data: a steady, seeded rhythm (quiet weekends, busier weekdays), the same on every render. */
function sampleDays(from: string, count: number, seed: number, density = 0.75): ActivityDay[] {
	const start = Date.parse(`${from}T00:00:00Z`)
	let s = seed
	const next = () => {
		s = (s * 9301 + 49297) % 233280
		return s / 233280
	}
	return Array.from({ length: count }, (_, i) => {
		const date = new Date(start + i * 86_400_000).toISOString().slice(0, 10)
		const weekend = [0, 6].includes(new Date(start + i * 86_400_000).getUTCDay())
		const busy = next() < (weekend ? density / 3 : density)
		return { date, value: busy ? Math.round(1 + next() ** 2 * 24) : 0 }
	})
}

const CONTRIBUTIONS = sampleDays("2025-10-20", 365, 7)
const GITHUB = sampleDays("2026-01-01", 292, 3, 0.5)
const CODEX = sampleDays("2026-03-01", 233, 11, 0.85)
const HABIT = sampleDays("2026-07-01", 110, 5, 0.6).map((d) => ({ ...d, value: d.value > 0 ? 1 : 0 }))

export function ActivityHeatmapPage() {
	const [day, setDay] = useState<string | null>(null)
	return (
		<>
			<PageHeader eyebrow="Components" title="Activity Heatmap" lede={ledeFor(activityHeatmapMeta)} />

			<ComponentPlayground meta={activityHeatmapMeta} />

			<Section title="Contributions" description="The one-line case: days in, levels by quartile, a rolling year ending today. The success tone gives the GitHub look.">
				<Example>
					<ActivityHeatmap
						label="Contributions in the last year"
						data={CONTRIBUTIONS}
						end="2026-10-19"
						tone="success"
						unit={{ one: "contribution", other: "contributions" }}
					/>
				</Example>
			</Section>

			<Section title="Two sources, in a card" description="mergeActivity tags each day with its source, or both. Two levels give flat category colours; the stat row beside it is yours to compose.">
				<Example>
					<Card className="w-full">
						<CardHeader>
							<CardTitle>Building, day by day</CardTitle>
						</CardHeader>
						<CardContent>
							<ActivityHeatmap
								label="GitHub and Codex activity in 2026"
								year={2026}
								levels={2}
								data={mergeActivity({ github: GITHUB, codex: CODEX })}
								categories={{
									github: { label: "GitHub", tone: "success" },
									codex: { label: "Codex", tone: "info" },
									both: { label: "Both", tone: "2" },
								}}
							/>
						</CardContent>
					</Card>
				</Example>
			</Section>

			<Section
				title="On a narrow screen"
				description="Below the smallest cell size the weeks scroll sideways, opening on the latest. The weekday labels sit outside the scroller: pinned inside it, over the cells, the weeks slid under them on a phone — the bug that brought this component into the library."
			>
				<Example>
					<div className="w-full max-w-xs">
						<ActivityHeatmap label="Contributions in the last year" data={CONTRIBUTIONS} end="2026-10-19" tone="success" unit="contributions" />
					</div>
				</Example>
			</Section>

			<Section title="A habit, with a marked day" description="renderCell draws over a cell's fill — here a mark on the start of each month. Two levels: done or not.">
				<Example>
					<div className="w-full max-w-md">
						<ActivityHeatmap
							label="Morning run, since July"
							start="2026-07-01"
							end="2026-10-18"
							levels={2}
							size="lg"
							legend={false}
							data={HABIT}
							unit={{ one: "run", other: "runs" }}
							renderCell={(d) => (d.date.endsWith("-01") ? <Icon name="sparkles" className="text-xs text-foreground" /> : null)}
						/>
					</div>
				</Example>
			</Section>

			<Section title="Selecting a day" description="With onSelectDate, a click or Enter picks a day — to filter a feed below, as GitHub does.">
				<Example>
					<div className="flex w-full flex-col gap-3">
						<ActivityHeatmap
							label="Orders per day"
							data={CONTRIBUTIONS}
							end="2026-10-19"
							unit="orders"
							selectedDate={day}
							onSelectDate={setDay}
						/>
						<p className="text-body-sm text-muted-foreground">{day ? `Showing orders for ${day}` : "Pick a day to see its orders."}</p>
					</div>
				</Example>
			</Section>

			<Section title="Loading" description="The empty grid shimmers until days arrive.">
				<Example>
					<ActivityHeatmap label="Contributions in the last year" data={[]} end="2026-10-19" loading />
				</Example>
			</Section>

			<MetaFooter meta={activityHeatmapMeta} />
		</>
	)
}
