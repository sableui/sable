import { SegmentedBar, StatusDot, segmentedBarMeta } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const SALES = [
	{ label: "Direct", value: 42, tone: "1" },
	{ label: "Partners", value: 27, tone: "2" },
	{ label: "Referrals", value: 19, tone: "3" },
	{ label: "Resellers", value: 12, tone: "info" },
] as const

export function SegmentedBarPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Segmented Bar" lede={ledeFor(segmentedBarMeta)} />

			<ComponentPlayground meta={segmentedBarMeta} />

			<Section title="With a legend" description="Colour picks out a segment; the legend's label and share are what a reader compares.">
				<Example>
					<div className="flex w-full max-w-xs flex-col gap-3">
						<SegmentedBar label="Revenue by channel" segments={[...SALES]} size="lg" />
						{/* aria-hidden: the bar already reads every share aloud. */}
						<ul aria-hidden className="flex flex-col gap-1.5">
							{SALES.map((s) => (
								<li key={s.label} className="flex items-center gap-2 text-body-sm">
									<StatusDot tone={s.tone} />
									<span className="flex-1 text-muted-foreground">{s.label}</span>
									<span className="text-mono-caption">{s.value}%</span>
								</li>
							))}
						</ul>
					</div>
				</Example>
			</Section>

			<Section title="Sizes" description="The same three rails as Meter and Progress.">
				<Example>
					<div className="flex w-full max-w-xs flex-col gap-4">
						<SegmentedBar label="Storage" size="sm" segments={[{ label: "Photos", value: 6 }, { label: "Video", value: 3 }, { label: "Docs", value: 1 }]} />
						<SegmentedBar label="Storage" size="md" segments={[{ label: "Photos", value: 6 }, { label: "Video", value: 3 }, { label: "Docs", value: 1 }]} />
						<SegmentedBar label="Storage" size="lg" segments={[{ label: "Photos", value: 6 }, { label: "Video", value: 3 }, { label: "Docs", value: 1 }]} />
					</div>
				</Example>
			</Section>

			<Section title="Status tones" description="When the split is a judgement, name the tones.">
				<Example>
					<div className="w-full max-w-xs">
						<SegmentedBar
							label="Test results"
							segments={[
								{ label: "Passed", value: 412, tone: "success" },
								{ label: "Flaky", value: 9, tone: "warning" },
								{ label: "Failed", value: 3, tone: "destructive" },
							]}
						/>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={segmentedBarMeta} />
		</>
	)
}
