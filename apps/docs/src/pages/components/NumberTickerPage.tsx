import { Button, Icon, Meter, NotificationBadge, NumberTicker, numberTickerMeta, Toggle, ToggleGroup } from "@sableui/react"
import { useState } from "react"
import { Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

/** A believable next reading: a step up or down, never the same number twice. */
function nudge(value: number, spread: number): number {
	const step = Math.max(1, Math.round(Math.random() * spread))
	return Math.max(0, value + (Math.random() < 0.65 ? step : -step))
}

function CountDemo() {
	const [value, setValue] = useState(1284)
	return (
		<div className="flex flex-col items-center gap-5">
			<NumberTicker value={value} className="text-display-lg text-foreground" />
			<div className="flex flex-wrap justify-center gap-2">
				<Button variant="secondary" onClick={() => setValue((v) => v + 1)}>
					Add one
				</Button>
				<Button variant="secondary" onClick={() => setValue((v) => nudge(v, 180))}>
					New reading
				</Button>
				<Button variant="secondary" onClick={() => setValue((v) => (v < 10_000 ? v * 10 : Math.round(v / 100)))}>
					Change magnitude
				</Button>
			</div>
		</div>
	)
}

const PLANS = [
	{ seats: 5, price: 12 },
	{ seats: 12, price: 11 },
	{ seats: 40, price: 9.5 },
]

function CurrencyDemo() {
	const [plan, setPlan] = useState(0)
	const { seats, price } = PLANS[plan]
	return (
		<div className="flex flex-col items-center gap-4">
			<div className="flex items-baseline gap-2">
				<NumberTicker value={seats * price} format={{ style: "currency", currency: "USD" }} locales="en-US" className="text-heading-1 text-foreground" />
				<span className="text-body-md text-muted-foreground">/ month</span>
			</div>
			<ToggleGroup value={[String(plan)]} onValueChange={(v: unknown[]) => v[0] != null && setPlan(Number(v[0]))} aria-label="Seats">
				{PLANS.map((p, i) => (
					<Toggle key={p.seats} value={String(i)}>
						{p.seats} seats
					</Toggle>
				))}
			</ToggleGroup>
		</div>
	)
}

function PercentDemo() {
	const [share, setShare] = useState(0.428)
	return (
		<div className="flex w-full max-w-sm flex-col gap-4">
			<div className="flex items-baseline justify-between">
				<span className="text-label-md text-muted-foreground">Conversion</span>
				<NumberTicker value={share} format={{ style: "percent", maximumFractionDigits: 1 }} className="text-heading-3 text-foreground" />
			</div>
			<Meter value={share * 100} aria-label="Conversion" />
			<Button variant="secondary" className="self-start" onClick={() => setShare(Math.round(Math.random() * 1000) / 1000)}>
				New week
			</Button>
		</div>
	)
}

function SubtleDemo() {
	const [score, setScore] = useState(92)
	return (
		<div className="flex flex-col items-center gap-4">
			<NumberTicker value={score} suffix=" pts" motion="subtle" className="text-heading-2 text-foreground" />
			<Button variant="secondary" onClick={() => setScore((s) => nudge(s, 12))}>
				Update
			</Button>
		</div>
	)
}

function BadgeDemo() {
	const [count, setCount] = useState(3)
	return (
		<div className="flex items-center gap-4">
			<Button variant="secondary" size="icon" aria-label={`Notifications, ${count} unread`} className="relative">
				<Icon name="bell" />
				<NotificationBadge count={count} overlay />
			</Button>
			<Button variant="secondary" onClick={() => setCount((c) => c + 1)}>
				New message
			</Button>
			<Button variant="secondary" onClick={() => setCount(0)}>
				Mark all read
			</Button>
		</div>
	)
}

export function NumberTickerPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Number Ticker" lede={ledeFor(numberTickerMeta)} />

			<Section title="Basic" description="Each digit turns to its new place. 999 → 1,000 keeps the three columns it had and grows a fourth; nothing beside it jumps.">
				<Example code='<NumberTicker value={value} className="text-display-lg" />'>
					<CountDemo />
				</Example>
			</Section>

			<Section title="Currency" description="Formatted through Intl.NumberFormat, so the currency sign and separators hold still while the amount rolls.">
				<Example code='<NumberTicker value={seats * price} format={{ style: "currency", currency: "USD" }} />'>
					<CurrencyDemo />
				</Example>
			</Section>

			<Section title="Percent" description="Digits roll up as the value grows and down as it shrinks, like an odometer.">
				<Example code='<NumberTicker value={share} format={{ style: "percent", maximumFractionDigits: 1 }} />'>
					<PercentDemo />
				</Example>
			</Section>

			<Section title="Subtle" description='motion="subtle" keeps the number and drops the roll: the value updates in place. Reduced motion does the same everywhere.'>
				<Example code='<NumberTicker value={score} suffix=" pts" motion="subtle" />'>
					<SubtleDemo />
				</Example>
			</Section>

			<Section title="In a notification badge" description="NotificationBadge counts through the ticker. Past the cap the + holds still, and a badge that comes back after being cleared pops in.">
				<Example code='<NotificationBadge count={count} overlay />'>
					<BadgeDemo />
				</Example>
			</Section>

			<MetaFooter meta={numberTickerMeta} />
		</>
	)
}
