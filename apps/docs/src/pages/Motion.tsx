import {
	Button,
	Card,
	cn,
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
	type MotionPolicy,
	PageLoader,
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
	Presence,
	Progress,
	Reveal,
	Skeleton,
	Spinner,
	StatusDot,
	TextReveal,
	Toggle,
	ToggleGroup,
	useInView,
	useMotion,
} from "@sableui/react"
import { type CSSProperties, useEffect, useState } from "react"
import { Example, PageHeader, Section } from "../components/docs-ui"
import { useCustomizer } from "../customizer/CustomizerProvider"
import type { Motion } from "../customizer/look"

const DURATIONS = [
	["instant", "75ms", "Checkbox tick, tab swap"],
	["fast", "150ms", "Hover, press, every exit"],
	["base", "200ms", "Menus and popovers, the default"],
	["slow", "300ms", "Dialogs, sheets, larger surfaces"],
	["slower", "500ms", "Progress, value changes"],
] as const

const EASINGS = [
	["ease-standard", "The default"],
	["ease-decelerate", "Entrances: fast in, soft settle"],
	["ease-emphasized", "Large surfaces"],
	["ease-spring", "A gentle pop"],
	["ease-bounce", "A playful pop, used sparingly"],
] as const

const POLICIES: { value: MotionPolicy; label: string }[] = [
	{ value: "system", label: "Follow system" },
	{ value: "full", label: "On" },
	{ value: "off", label: "Off" },
]

/** The Customize panel's speed, minus "Still" (that is the policy's Off). */
const SPEEDS: { value: Motion; label: string }[] = [
	{ value: "snappy", label: "Snappy" },
	{ value: "default", label: "Preset" },
	{ value: "relaxed", label: "Relaxed" },
]

/**
 * A demo's run counter. It ticks once when the demo first scrolls into view,
 * so every time-based example plays by itself, then again on each Replay.
 * Components re-key on it to start over from their first frame.
 */
function useDemoRun() {
	const { ref, inView } = useInView({ amount: 0.4 })
	const [run, setRun] = useState(0)
	useEffect(() => {
		if (inView) setRun((current) => (current === 0 ? 1 : current))
	}, [inView])
	return { ref, run, replay: () => setRun((current) => current + 1) }
}

/** A dot that travels across a track with a chosen easing and duration. */
function TrackRow({
	name,
	note,
	run,
	easing = "ease-standard",
	duration = "slower",
}: {
	name: string
	note: string
	/** 0 = not played yet. Re-keyed by the caller, so each run starts at rest. */
	run: number
	easing?: string
	duration?: string
}) {
	const [play, setPlay] = useState(false)
	useEffect(() => {
		if (!run) return
		// One frame at rest first, so the transition has a start to travel from.
		const frame = requestAnimationFrame(() => setPlay(true))
		return () => cancelAnimationFrame(frame)
	}, [run])
	return (
		// One unit, label over its own track, so the note reads against the curve
		// it describes rather than from the far side of the page.
		<div className="flex w-full max-w-xl flex-col gap-1.5">
			<div className="flex items-baseline justify-between gap-4">
				<code className="text-mono-sm text-foreground">{name}</code>
				<span className="text-body-sm text-muted-foreground">{note}</span>
			</div>
			<div className="relative h-7 w-full rounded-full bg-muted">
				{/* The lane is the track minus one dot, so translating the full lane
				    width lands the dot exactly at the end, whatever the track width. */}
				<div className="absolute inset-y-1 start-1 end-6">
					<div
						className={cn("size-full transition-[translate]", easing)}
						style={{
							translate: play ? "100% 0" : "0 0",
							transitionDuration: `var(--motion-duration-${duration})`,
						}}
					>
						<div className="size-5 rounded-full bg-primary" />
					</div>
				</div>
			</div>
		</div>
	)
}

/**
 * One boot of an app behind its splash. The splash is there from the first
 * frame (Presence leaves initially-shown content at rest), a pretend load runs,
 * then the splash dissolves on a DECELERATING curve while the app rises in
 * beneath it. Re-keyed per run, so a replay is a fresh boot, not a splash
 * fading in over an app that is already showing.
 */
function SplashBoot({ active }: { active: boolean }) {
	const [loading, setLoading] = useState(true)
	useEffect(() => {
		if (!active) return
		const timer = window.setTimeout(() => setLoading(false), 1400)
		return () => window.clearTimeout(timer)
	}, [active])
	return (
		<>
			<Reveal when={!loading} delay={120} className="flex h-full flex-col items-center justify-center gap-2">
				<p className="text-heading-3">Welcome to Studio</p>
				<p className="text-body-sm text-muted-foreground">The feed is ready.</p>
			</Reveal>
			<Presence show={loading} duration={{ exit: 600 }} easing={{ exit: "cubic-bezier(0, 0, 0.2, 1)" }} offset={0}>
				<PageLoader fullscreen={false} label="Loading Studio" hideBar />
			</Presence>
		</>
	)
}

export function MotionPage() {
	const { policy, setPolicy, enabled, prefersReducedMotion } = useMotion()
	const { look, setLook } = useCustomizer()
	const [progress, setProgress] = useState(40)
	const durations = useDemoRun()
	const easings = useDemoRun()
	// Re-keying a Reveal remounts it hidden, so it plays again even in view.
	const [drawRun, setDrawRun] = useState(0)
	const [revealRun, setRevealRun] = useState(0)

	// Presence: each run plays the exit, then the entrance.
	const presence = useDemoRun()
	const [showPresence, setShowPresence] = useState(true)
	useEffect(() => {
		if (!presence.run) return
		setShowPresence(false)
		const timer = window.setTimeout(() => setShowPresence(true), 900)
		return () => window.clearTimeout(timer)
	}, [presence.run])

	const splash = useDemoRun()

	return (
		<>
			<PageHeader
				eyebrow="Foundations"
				title="Motion"
				lede="Motion shows where something came from, what responded, and that work is happening. It stays subtle, and one switch turns it all off."
			/>

			<Section
				title="Control"
				description="One switch turns every animation off. Speed rescales every duration at once, the same setting as Customize → Motion."
			>
				<Example className="flex-col items-start gap-5">
					<div className="grid gap-2">
						<span id="motion-policy-label" className="text-label-md text-muted-foreground">Motion</span>
						<ToggleGroup aria-labelledby="motion-policy-label" value={[policy]} onValueChange={(values) => { if (values[0]) setPolicy(values[0] as MotionPolicy) }}>
							{POLICIES.map((p) => <Toggle key={p.value} value={p.value}>{p.label}</Toggle>)}
						</ToggleGroup>
					</div>
					<div className="grid gap-2">
						<span id="motion-speed-label" className="text-label-md text-muted-foreground">Speed</span>
						<ToggleGroup aria-labelledby="motion-speed-label" value={[look.motion]} onValueChange={(values) => { if (values[0]) setLook({ motion: values[0] as Motion, motionBase: null }) }}>
							{SPEEDS.map((speed) => <Toggle key={speed.value} value={speed.value} disabled={!enabled}>{speed.label}</Toggle>)}
						</ToggleGroup>
					</div>
					<p role="status" className="text-body-sm text-muted-foreground">
						Motion is <strong className="text-foreground">{enabled ? "on" : "off"}</strong>
						{policy === "system" ? <> — your system {prefersReducedMotion ? "asks for reduced motion" : "allows motion"}.</> : "."}
					</p>
				</Example>
			</Section>

			<Section title="Durations" description="Small things move fast; big things take a little longer.">
				<Example className="flex-col items-center gap-5" onReplay={durations.replay}>
					<div ref={durations.ref} className="grid w-full max-w-xl gap-5">
						{DURATIONS.map(([name, value, note]) => (
							<TrackRow
								key={`${name}-${durations.run}`}
								name={`${name} · ${value}`}
								note={note}
								run={durations.run}
								duration={name}
							/>
						))}
					</div>
				</Example>
			</Section>

			<Section title="Easings" description="The same distance and duration, five curves.">
				<Example className="flex-col items-center gap-5" onReplay={easings.replay}>
					<div ref={easings.ref} className="grid w-full max-w-xl gap-5">
						{EASINGS.map(([name, note]) => (
							<TrackRow key={`${name}-${easings.run}`} name={name} note={note} run={easings.run} easing={name} />
						))}
					</div>
				</Example>
			</Section>

			<Section
				title="Recipes"
				description="A handful of named behaviors, shared by every component."
			>
				{/* Disclosure on its own row: opening it only grows the frame downward.
				    Beside the other buttons in a centred row, the row re-centred as the
				    panel opened and the trigger jumped up. */}
				<Example className="flex-col gap-6">
					<div className="flex flex-wrap items-center justify-center gap-4">
						<Button>Press me</Button>
						<Popover>
							<PopoverTrigger render={<Button variant="secondary">Pop open</Button>} />
							<PopoverContent>
								<PopoverTitle>Gentle spring on open</PopoverTitle>
								<PopoverDescription>
									Scales in from where it was opened, and closes cleanly.
								</PopoverDescription>
							</PopoverContent>
						</Popover>
					</div>
					<Collapsible className="grid justify-items-center">
						<CollapsibleTrigger
							render={<Button variant="outline">Disclosure</Button>}
						/>
						<CollapsiblePanel>
							<p className="text-body-sm text-muted-foreground pt-3">
								The height eases open.
							</p>
						</CollapsiblePanel>
					</Collapsible>
				</Example>
				<Example onReplay={() => setDrawRun((run) => run + 1)}>
					<Reveal key={drawRun} className="flex flex-wrap items-center justify-center gap-10">
						<svg
							viewBox="0 0 96 96"
							className="size-24 text-foreground"
							fill="none"
							stroke="currentColor"
							strokeWidth="1"
							aria-hidden="true"
						>
							<circle cx="48" cy="48" r="40" className="text-border" />
							<circle cx="48" cy="48" r="40" pathLength={1} className="motion-draw" />
							<circle
								cx="44"
								cy="58"
								r="22"
								pathLength={1}
								className="motion-draw"
								style={{ "--motion-draw-delay": "120ms" } as CSSProperties}
							/>
							<circle
								cx="52"
								cy="40"
								r="10"
								pathLength={1}
								className="motion-draw"
								style={{ "--motion-draw-delay": "240ms" } as CSSProperties}
							/>
						</svg>
						<svg
							viewBox="0 0 128 96"
							className="h-24 w-32 text-foreground"
							fill="none"
							stroke="currentColor"
							strokeWidth="1"
							aria-hidden="true"
						>
							<path
								d="M16 80 v-40 a12 12 0 0 1 24 0 v32 a12 12 0 0 0 24 0 v-32 a12 12 0 0 1 24 0 v32 a12 12 0 0 0 24 0 V40 l-8 10 m8 -10 l8 10"
								className="text-border"
							/>
							<path
								d="M16 80 v-40 a12 12 0 0 1 24 0 v32 a12 12 0 0 0 24 0 v-32 a12 12 0 0 1 24 0 v32 a12 12 0 0 0 24 0 V40 l-8 10 m8 -10 l8 10"
								pathLength={1}
								className="motion-draw"
								style={{ "--motion-draw-delay": "160ms" } as CSSProperties}
							/>
						</svg>
						<p className="text-body-sm text-muted-foreground max-w-56">
							Line art draws itself on as it scrolls into view.
						</p>
					</Reveal>
				</Example>
			</Section>

			<Section
				title="Loaders"
				description="Show that work is happening. They hold still when motion is off."
			>
				<Example className="gap-8">
					<div className="flex flex-col items-center gap-2">
						<Spinner className="size-6 text-foreground" />
						<span className="text-label-md text-muted-foreground">Spinner</span>
					</div>
					<div className="flex flex-col items-center gap-2">
						<Spinner appearance="dots" className="text-foreground" />
						<span className="text-label-md text-muted-foreground">Dots</span>
					</div>
					<div className="flex w-40 flex-col items-center gap-2">
						<Skeleton className="h-5 w-full" />
						<span className="text-label-md text-muted-foreground">Shimmer</span>
					</div>
					<div className="flex flex-col items-center gap-2">
						<StatusDot tone="3" pulse />
						<span className="text-label-md text-muted-foreground">Ping</span>
					</div>
				</Example>
				<Example className="flex-col items-stretch gap-3">
					<Progress value={progress} />
					<div className="flex gap-2">
						<Button
							size="sm"
							variant="secondary"
							onClick={() => setProgress((v) => Math.max(0, v - 20))}
						>
							−20
						</Button>
						<Button
							size="sm"
							variant="secondary"
							onClick={() => setProgress((v) => Math.min(100, v + 20))}
						>
							+20
						</Button>
					</div>
				</Example>
			</Section>

			<Section
				title="Scroll reveal"
				description="Content fades up the first time it scrolls into view."
			>
				<Example className="items-stretch" onReplay={() => setRevealRun((run) => run + 1)}>
					<Reveal key={revealRun} className="w-full">
						<Card className="p-6">
							<TextReveal
								as="p"
								className="text-heading-3"
								text="Permanent by design."
							/>
							<p className="text-body-md text-muted-foreground mt-2">
								This block fades up on scroll-in; the heading staggers word by word.
							</p>
						</Card>
					</Reveal>
				</Example>
			</Section>

			<Section
				title="Presence"
				description="Content animates out fully before it is removed. Removal still changes layout, so reserve the space it leaves (as here) or collapse it with Collapsible."
			>
				<Example onReplay={presence.replay}>
					{/* The reserved slot: a fixed height the card fits inside, so the
					    frame does not snap shut when the card unmounts after its exit. */}
					<div ref={presence.ref} className="grid h-28 w-full max-w-sm place-items-center">
						<Presence show={showPresence}>
							<Card className="w-full p-5">
								<p className="text-title-sm">I animate in and out.</p>
								<p className="text-body-sm text-muted-foreground mt-1">
									The exit plays all the way through.
								</p>
							</Card>
						</Presence>
					</div>
				</Example>
			</Section>

			<Section
				title="Page loader"
				description="A branded splash: the mark breathes and a thin bar shimmers."
			>
				<div className="relative h-72 overflow-hidden rounded-xl border border-border">
					<PageLoader fullscreen={false} label="Loading Studio" />
				</div>
			</Section>

			<Section
				title="Splash transition"
				description="The splash holds while the app loads, then fades away to reveal it."
			>
				<Example flush onReplay={splash.replay}>
					<div ref={splash.ref} className="dark relative h-80 overflow-hidden bg-background text-foreground">
						<SplashBoot key={splash.run} active={splash.run > 0} />
					</div>
				</Example>
			</Section>

		</>
	)
}
