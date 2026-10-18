import {
	Button,
	Meter,
	MeterLabel,
	meterMeta,
	MeterTrack,
	MeterValue,
	type MeterTone,
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

const EUR = new Intl.NumberFormat("en", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })

const SPEND = [
	{ label: "Monthly spend limit", used: 1240, max: 2000 },
	{ label: "Staging key", used: 2, max: 2000 },
	{ label: "Production key", used: 1720, max: 2000 },
]

const LEADS = [
	{ name: "Northwind", score: 8 },
	{ name: "Acme Corp", score: 5 },
	{ name: "Globex", score: 2 },
]

/** Credits that can be spent and topped up — shows the tick sweep in both directions. */
function LiveCredits() {
	const [credits, setCredits] = useState(640)
	const max = 1000
	return (
		<div className="flex w-full max-w-sm flex-col gap-4">
			<Meter value={credits} max={max} segments={40} tone={toneFor(1 - credits / max)} getAriaValueText={() => `${credits} of ${max} credits left`}>
				<div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
					<MeterLabel>Credits remaining</MeterLabel>
					<MeterValue>{() => `${credits.toLocaleString("en")} / ${max.toLocaleString("en")}`}</MeterValue>
				</div>
				<MeterTrack />
			</Meter>
			<div className="flex gap-2">
				<Button size="sm" variant="secondary" onClick={() => setCredits((c) => Math.max(0, c - 250))}>
					Spend 250
				</Button>
				<Button size="sm" variant="secondary" onClick={() => setCredits((c) => Math.min(max, c + 400))}>
					Top up 400
				</Button>
			</div>
		</div>
	)
}

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

			<Section
				title="Segmented"
				description="segments draws the bar as a row of ticks — a spend limit, credits left or a score, read at a glance. Any reading above min fills at least one tick."
			>
				<Example
					code={`<Meter value={1240} max={2000} segments={40} getAriaValueText={() => "€1,240 of €2,000 spent this month"}>
	<div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
		<MeterLabel>Monthly spend limit</MeterLabel>
		<MeterValue>{() => "€1,240 / €2,000"}</MeterValue>
	</div>
	<MeterTrack />
</Meter>`}
				>
					<div className="flex w-full max-w-sm flex-col gap-5">
						{SPEND.map(({ label, used, max }) => (
							<Meter
								key={label}
								value={used}
								max={max}
								segments={40}
								tone={toneFor(used / max)}
								getAriaValueText={() => `${EUR.format(used)} of ${EUR.format(max)} spent this month`}
							>
								<div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
									<MeterLabel>{label}</MeterLabel>
									<MeterValue>{() => `${EUR.format(used)} / ${EUR.format(max)}`}</MeterValue>
								</div>
								<MeterTrack />
							</Meter>
						))}
					</div>
				</Example>
			</Section>

			<Section
				title="Segmented, live"
				description="When the reading changes, the fill runs through the ticks from the edge it is leaving rather than every tick switching at once."
			>
				<Example>
					<LiveCredits />
				</Example>
			</Section>

			<Section
				title="Score cells"
				description="A short tick bar with the number beside it — one per row, the count matched to the scale (10 for a score out of 10, 12 for months)."
			>
				<Example
					code={`<div className="flex items-center gap-3">
	<Meter value={8} max={10} segments={10} size="sm" tone="success" className="w-24" aria-label="ICP score" getAriaValueText={(_, v) => \`\${v} out of 10\`} />
	<span className="text-mono-sm text-foreground">8/10</span>
</div>`}
				>
					<div className="flex w-full max-w-sm flex-col gap-3">
						{LEADS.map(({ name, score }) => (
							<div key={name} className="flex items-center justify-between gap-4">
								<span className="text-body-sm text-foreground">{name}</span>
								<div className="flex items-center gap-3">
									<Meter
										value={score}
										max={10}
										segments={10}
										size="sm"
										tone={score >= 7 ? "success" : score >= 4 ? "warning" : "destructive"}
										className="w-24"
										aria-label={`${name} ICP score`}
										getAriaValueText={(_, v) => `${v} out of 10`}
									/>
									<span className="text-mono-sm w-10 text-end text-foreground">{score}/10</span>
								</div>
							</div>
						))}
						<div className="flex items-center justify-between gap-4">
							<span className="text-body-sm text-foreground">Data coverage</span>
							<div className="flex items-center gap-3">
								<Meter value={9} max={12} segments={12} size="sm" tone="3" className="w-24" aria-label="Months of data" getAriaValueText={(_, v) => `${v} of 12 months`} />
								<span className="text-mono-sm w-10 text-end text-foreground">9 mo</span>
							</div>
						</div>
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
