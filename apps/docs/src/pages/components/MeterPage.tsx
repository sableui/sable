import {
	Meter,
	MeterLabel,
	meterMeta,
	MeterTrack,
	MeterValue,
	type MeterTone,
} from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/** Thresholds live at the call site — the component never guesses them. */
function toneFor(ratio: number): MeterTone {
	if (ratio >= 1) return "destructive"
	if (ratio >= 0.8) return "warning"
	return "primary"
}

const USAGE = [
	{ label: "Storage", used: 7.2, max: 10, unit: "GB" },
	{ label: "Seats", used: 18, max: 20, unit: "seats" },
	{ label: "API requests", used: 50000, max: 50000, unit: "requests" },
]

export function MeterPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Meter" lede={ledeFor(meterMeta)} />

			<ComponentPlayground meta={meterMeta} />

			<Section
				title="Bare"
				description="How full something is, not how far along a task is."
			>
				<Example code='<Meter value={64} aria-label="Storage used" />'>
					<div className="w-full max-w-sm">
						<Meter value={64} aria-label="Storage used" />
					</div>
				</Example>
			</Section>

			<Section
				title="Usage, with thresholds"
				description="Show the reading in real units. The color shifts near and at the limit."
			>
				<Example>
					<div className="flex w-full max-w-sm flex-col gap-5">
						{USAGE.map(({ label, used, max, unit }) => (
							<Meter
								key={label}
								value={used}
								max={max}
								tone={toneFor(used / max)}
								getAriaValueText={() => `${used.toLocaleString()} of ${max.toLocaleString()} ${unit} used`}
							>
								<div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
									<MeterLabel>{label}</MeterLabel>
									<MeterValue>
										{() => `${used.toLocaleString()} of ${max.toLocaleString()} ${unit}`}
									</MeterValue>
								</div>
								<MeterTrack />
							</Meter>
						))}
					</div>
				</Example>
			</Section>

			<Section title="Tones">
				<Example>
					<div className="flex w-full max-w-sm flex-col gap-3">
						<Meter value={45} aria-label="Primary" />
						<Meter value={30} tone="success" aria-label="Success" />
						<Meter value={82} tone="warning" aria-label="Warning" />
						<Meter value={100} tone="destructive" aria-label="Destructive" />
					</div>
				</Example>
			</Section>

			<Section title="Ring" description="shape=&quot;ring&quot; draws the same measurement as a circular gauge, with the same min, max and tones.">
				<Example
					code={`<Meter shape="ring" value={66} size="sm" showValue aria-label="Profile complete" />
<Meter shape="ring" value={66} showValue aria-label="Profile complete" />
<Meter shape="ring" value={66} size="lg" tone="success" showValue aria-label="Profile complete" />`}
				>
					<Meter shape="ring" value={66} size="sm" showValue aria-label="Profile complete" />
					<Meter shape="ring" value={66} showValue aria-label="Profile complete" />
					<Meter shape="ring" value={66} size="lg" tone="success" showValue aria-label="Profile complete" />
				</Example>
			</Section>

			<MetaFooter meta={meterMeta} />
		</>
	)
}
