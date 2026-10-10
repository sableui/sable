import { RelativeTime, relativeTimeMeta, TooltipProvider } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

// Offsets from page load. RelativeTime measures against the real clock, so a
// fixed base date drifted every example to "over 1 year ago".
const BASE = Date.now()
const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const minutesAgo = new Date(BASE - 3 * MINUTE)
const hoursAgo = new Date(BASE - 5 * HOUR)
const daysAgo = new Date(BASE - 6 * DAY)

export function RelativeTimePage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Relative Time"
				lede={ledeFor(relativeTimeMeta)}
			/>

			<Section
				title="Basic"
				description="Hover or focus to see the exact date and time."
			>
				<Example code="<TooltipProvider><RelativeTime date={minutesAgo} /></TooltipProvider>">
					<TooltipProvider>
						<RelativeTime date={minutesAgo} />
					</TooltipProvider>
				</Example>
			</Section>

			<Section
				title="A range of distances"
				description="Minutes, hours and days ago."
			>
				<Example>
					<TooltipProvider>
						<div className="flex flex-col gap-3">
							<RelativeTime date={minutesAgo} />
							<RelativeTime date={hoursAgo} />
							<RelativeTime date={daysAgo} />
						</div>
					</TooltipProvider>
				</Example>
			</Section>

			<MetaFooter meta={relativeTimeMeta} />
		</>
	)
}
