import {
	Avatar,
	BarChart,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	ChatComposer,
	Checkbox,
	CodeBlock,
	ConfirmButton,
	Field,
	Icon,
	LikeButton,
	NotificationBadge,
	NumberTicker,
	OtpField,
	SearchInput,
	Skeleton,
	SimpleTooltip,
	Tabs,
	TabsList,
	TabsPanel,
	TabsTrigger,
	Toggle,
	ToggleGroup,
	Toolbar,
	ToolbarButton,
	TooltipGroup,
} from "@sableui/react"
import { useMemo, useState } from "react"
import { Example, InlineCode, PageHeader, Section } from "../components/docs-ui"
import { DAILY, DEVICES, shortDate } from "../content/chart-data"

/*
 * Interactions — the catalog by TASK rather than by component.
 *
 * The component pages answer "what does Tabs take". This page answers "what
 * should it feel like when someone inspects a chart, confirms something, gets a
 * code wrong, waits for content". Each scene is composed only from shipped
 * components, so what is shown here is exactly what an app gets on install,
 * and every frame carries the per-preview motion level and Replay, so the
 * subtle and off versions are one click away.
 */

/* ── Inspect: a traffic card ─────────────────────────────────────────────── */

type Range = "day" | "week"

/** Monday-start ISO week key for a yyyy-mm-dd date. */
function weekOf(date: string): string {
	// In UTC throughout, so the week a date falls in does not depend on the
	// reader's time zone.
	const d = new Date(`${date}T00:00:00Z`)
	const day = (d.getUTCDay() + 6) % 7
	d.setUTCDate(d.getUTCDate() - day)
	return d.toISOString().slice(0, 10)
}

/**
 * Weeks are AGGREGATED from the same days, not a second dataset, and only
 * complete weeks count — so a week's bar is exactly the sum of the seven day
 * bars it covers, and the last week is never a stub. The two ranges span
 * different lengths (two weeks of days, eight weeks), which is why the total
 * changes and rolls.
 */
function useTraffic(range: Range) {
	return useMemo(() => {
		const weeks = new Map<string, { date: string; desktop: number; mobile: number; days: number }>()
		for (const d of DAILY) {
			const key = weekOf(d.date)
			const w = weeks.get(key) ?? { date: key, desktop: 0, mobile: 0, days: 0 }
			w.desktop += d.desktop
			w.mobile += d.mobile
			w.days += 1
			weeks.set(key, w)
		}
		const complete = [...weeks.values()].filter((w) => w.days === 7)
		if (range === "week") return complete.slice(-8)
		// The days of the last two complete weeks, so Day ends where Week does.
		const last = complete[complete.length - 1]
		const end = DAILY.findIndex((d) => weekOf(d.date) === last.date) + 7
		return DAILY.slice(end - 14, end)
	}, [range])
}

function TrafficCard() {
	const [range, setRange] = useState<Range>("day")
	const data = useTraffic(range)
	const total = data.reduce((sum, d) => sum + d.desktop + d.mobile, 0)
	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Traffic</CardTitle>
				<CardDescription>{range === "day" ? "Last 14 days" : "Last 8 weeks"}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="flex items-end justify-between gap-4">
					<p className="text-heading-2 text-foreground">
						<NumberTicker value={total} />
						<span className="ms-1.5 text-body-sm text-muted-foreground">visits</span>
					</p>
					<ToggleGroup
						appearance="segmented"
						value={[range]}
						onValueChange={(next: unknown[]) => next[0] && setRange(next[0] as Range)}
						aria-label="Range"
					>
						<Toggle value="day" className="px-2.5">Day</Toggle>
						<Toggle value="week" className="px-2.5">Week</Toggle>
					</ToggleGroup>
				</div>
				<BarChart
					label="Visits by device"
					data={data}
					index="date"
					series={DEVICES}
					stacked
					indexFormatter={shortDate}
					tooltip={{ showTotal: true, labelFormatter: (date) => (range === "day" ? shortDate(date) : `Week of ${shortDate(date)}`) }}
					yAxis={false}
					className="h-48"
				/>
			</CardContent>
		</Card>
	)
}

/* ── Select ──────────────────────────────────────────────────────────────── */

function SelectScene() {
	return (
		<div className="flex w-full max-w-md flex-col gap-6">
			<Tabs defaultValue="overview">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="activity">Activity</TabsTrigger>
					<TabsTrigger value="settings">Settings</TabsTrigger>
				</TabsList>
				<TabsPanel value="overview" className="pt-4 text-body-sm text-muted-foreground">Three projects shipped this week.</TabsPanel>
				<TabsPanel value="activity" className="pt-4 text-body-sm text-muted-foreground">Kai reviewed the onboarding flow.</TabsPanel>
				<TabsPanel value="settings" className="pt-4 text-body-sm text-muted-foreground">Notifications are on for mentions.</TabsPanel>
			</Tabs>
			<ToggleGroup appearance="segmented" defaultValue={["month"]} aria-label="Period" className="self-start">
				<Toggle value="day" className="px-2.5">Day</Toggle>
				<Toggle value="week" className="px-2.5">Week</Toggle>
				<Toggle value="month" className="px-2.5">Month</Toggle>
				<Toggle value="quarter" className="px-2.5">Quarter</Toggle>
			</ToggleGroup>
			<div className="flex flex-col gap-3">
				{["Book the studio", "Send the estimate", "Pick a typeface"].map((task, i) => (
					<Field key={task} label={task} orientation="horizontal">
						<Checkbox defaultChecked={i === 0} />
					</Field>
				))}
			</div>
		</div>
	)
}

/* ── Recover: a refused code ─────────────────────────────────────────────── */

function RecoverScene() {
	const [code, setCode] = useState("")
	const [result, setResult] = useState<"idle" | "ok" | "wrong">("idle")
	return (
		<div className="flex w-full max-w-sm flex-col gap-3">
			<Field
				label="Verification code"
				description="Try any code — then 123456."
				error={result === "wrong" ? "That code doesn't match. Check the message and try again." : undefined}
			>
				<OtpField
					length={6}
					groupSize={3}
					value={code}
					onValueChange={(next) => {
						setCode(next)
						setResult("idle")
					}}
					onValueComplete={(value) => setResult(value === "123456" ? "ok" : "wrong")}
				/>
			</Field>
			<p role="status" className="text-body-sm text-muted-foreground">
				{result === "ok" ? "Code verified." : ""}
			</p>
		</div>
	)
}

/* ── Finish loading ──────────────────────────────────────────────────────── */

function LoadingScene() {
	const [loaded, setLoaded] = useState(false)
	return (
		<div className="flex w-full max-w-sm flex-col items-start gap-4">
			<Card className="w-full">
				<CardContent className="grid">
					{/* Both states share one grid cell, so the card holds its size and
					    the content cross-fades over the placeholder that predicted it. */}
					<div
						aria-hidden={loaded}
						className="col-start-1 row-start-1 flex items-center gap-3 motion-interactive aria-hidden:opacity-0"
					>
						<Skeleton className="size-10 rounded-full" />
						<div className="flex flex-1 flex-col gap-2">
							<Skeleton className="h-3.5 w-32" />
							<Skeleton className="h-3 w-48" />
						</div>
					</div>
					<div
						aria-hidden={!loaded}
						className="col-start-1 row-start-1 flex items-center gap-3 motion-interactive aria-hidden:opacity-0"
					>
						<Avatar fallback="MO" alt="Mara Olsen" />
						<div className="flex flex-col">
							<span className="text-label-lg text-foreground">Mara Olsen</span>
							<span className="text-body-sm text-muted-foreground">Designer working on calm tools.</span>
						</div>
					</div>
				</CardContent>
			</Card>
			<Button variant="secondary" size="sm" onClick={() => setLoaded((l) => !l)}>
				{loaded ? "Show loading" : "Finish loading"}
			</Button>
		</div>
	)
}

/* ── Type ────────────────────────────────────────────────────────────────── */

function TypeScene() {
	const [query, setQuery] = useState("")
	return (
		<div className="flex w-full max-w-md flex-col gap-6">
			<SearchInput value={query} onValueChange={setQuery} placeholder="Search projects" aria-label="Search projects" />
			<ChatComposer placeholder="Ask anything… (Shift+Enter for a new line)" onSend={() => undefined} />
		</div>
	)
}

/* ── Notify ──────────────────────────────────────────────────────────────── */

function NotifyScene() {
	const [count, setCount] = useState(3)
	return (
		<div className="flex flex-wrap items-center gap-6">
			<div className="relative">
				<Button variant="secondary" size="icon" aria-label={`Inbox, ${count} unread`}>
					<Icon name="bell" />
				</Button>
				<NotificationBadge count={count} className="absolute -end-1 -top-1" />
			</div>
			<div className="flex gap-2">
				<Button size="sm" variant="secondary" onClick={() => setCount((c) => c + 1)}>
					New message
				</Button>
				<Button size="sm" variant="ghost" onClick={() => setCount(0)}>
					Mark all read
				</Button>
			</div>
		</div>
	)
}

/* ── Point: one tooltip that travels ─────────────────────────────────────── */

const TOOLS = [
	{ icon: "bold", label: "Bold" },
	{ icon: "italic", label: "Italic" },
	{ icon: "link", label: "Insert link" },
	{ icon: "list", label: "Bulleted list" },
	{ icon: "comment", label: "Comment" },
] as const

function PointScene() {
	return (
		<TooltipGroup>
			<Toolbar aria-label="Formatting">
				{TOOLS.map((tool) => (
					<SimpleTooltip key={tool.icon} content={tool.label}>
						<ToolbarButton size="icon-sm" aria-label={tool.label}>
							<Icon name={tool.icon} />
						</ToolbarButton>
					</SimpleTooltip>
				))}
			</Toolbar>
		</TooltipGroup>
	)
}

export function InteractionsPage() {
	return (
		<>
			<PageHeader
				title="Interactions"
				lede="The catalog by task. Each scene is composed only from shipped components, so this is the motion an app gets on install. Every frame has its own motion level — try Subtle and Off."
			/>

			<Section
				title="Inspect"
				description="Run the pointer along the bars: one band travels with the pointer and the other bars step back, by mixing toward the card rather than fading. Switch Day and Week: the thumb glides, the bars morph to the regrouped data, and only the digits that changed roll. Arrow keys step through the bars too."
			>
				<Example replayable>
					<TrafficCard />
				</Example>
			</Section>

			<Section
				title="Select"
				description="One element travels to the selection instead of one fill switching off and another on: the tab indicator, the segmented thumb. A check draws itself in. Under Subtle each lands in place, still with its colour change."
			>
				<Example motionControl>
					<SelectScene />
				</Example>
			</Section>

			<Section
				title="Confirm"
				description="An inline two-step for low-stakes destructive actions. The first press arms it: the label changes and the button eases to the new width, a thin line drains while it waits, and it says what a second press will do. Escape, a click elsewhere or the timeout disarms it."
			>
				<Example
					code={`<ConfirmButton icon={<Icon name="trash" />} confirmLabel="Clear history?" onConfirm={clearHistory}>\n\tClear history\n</ConfirmButton>`}
				>
					<ConfirmButton icon={<Icon name="trash" />} confirmLabel="Clear history?" onConfirm={() => undefined}>
						Clear history
					</ConfirmButton>
				</Example>
			</Section>

			<Section
				title="React"
				description="The one place Sable celebrates, because the person chose it and it costs nothing to undo. The glyph blooms past its size and settles while a ring opens and dots spray out in the theme's palette, and the count rolls. Taking it back is quiet. Under Subtle the glyph just fills."
			>
				<Example
					code={`<LikeButton count={post.likes} defaultPressed={post.liked} onPressedChange={(on) => api.like(post.id, on)} />
<LikeButton icon="star" tone="yellow" label="Star" variant="outline" count={repo.stars} format={{ notation: "compact" }} />`}
				>
					<LikeButton count={1300} />
					<LikeButton icon="star" tone="yellow" label="Star" variant="outline" count={12400} format={{ notation: "compact" }} />
				</Example>
			</Section>

			<Section
				title="Recover"
				description="A refused answer finishes its story: the field shakes once, the digits turn destructive and the message says why. Typing again clears the error, so the next wrong code shakes again. The shake is never the only signal."
			>
				<Example motionControl>
					<RecoverScene />
				</Example>
			</Section>

			<Section
				title="Succeed"
				description="Success confirms where it happened. Copy turns into a check in place — the two glyphs trade through one cell — and assistive tech hears “Copied”."
			>
				<Example motionControl>
					<CodeBlock code={`pnpm add @sableui/react\npnpm exec sable init`} className="w-full max-w-md" />
				</Example>
			</Section>

			<Section
				title="Finish loading"
				description="The placeholder predicts the content's shape, and the content cross-fades over it in the same cell, so nothing below moves when it arrives."
			>
				<Example motionControl>
					<LoadingScene />
				</Example>
			</Section>

			<Section
				title="Type"
				description="The clear button appears with the first character instead of popping in. The composer grows with its text, and the send arrow resolves in as soon as there is something to send."
			>
				<Example motionControl>
					<TypeScene />
				</Example>
			</Section>

			<Section
				title="Point"
				description="A toolbar's tooltips share one tooltip. Move along the row: it glides to the next button and its label slides across, instead of closing and opening again."
			>
				<Example motionControl>
					<PointScene />
				</Example>
			</Section>

			<Section
				title="Notify"
				description="A count rolls to its new value; a badge that was empty arrives instead of appearing. Past the cap it shows 99+ and stops rolling."
			>
				<Example motionControl>
					<NotifyScene />
				</Example>
			</Section>

			<Section
				title="Levels"
				description="Everything above is the default, full motion. Apps choose less in three places, and each can only turn motion down."
			>
				<CodeBlock
					filename="motion.tsx"
					code={`// The app: feedback without flourishes, everywhere.
<MotionProvider defaultPolicy="subtle">…</MotionProvider>

// A region: a dense data view stays calm.
<MotionScope level="subtle">…</MotionScope>

// One component.
<Tabs motion="subtle">…</Tabs>`}
				/>
				<p className="text-body-md text-muted-foreground">
					See <InlineCode>sable docs motion</InlineCode> for which motion is essential and which is expressive.
				</p>
			</Section>
		</>
	)
}
