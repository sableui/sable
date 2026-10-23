"use client";

import type { VariantProps } from "class-variance-authority"
import { type ComponentPropsWithRef, useEffect, useRef, useState } from "react"
import { cn } from "../../lib/cn"
import { mergeRefs } from "../../lib/refs"
import { type MotionLevel, useMotionLevel } from "../../motion/MotionProvider"
import { avatarVariants } from "../avatar/avatar.variants"
import { pointer, subscribe } from "./agent-avatar.loop"
import {
	type AgentAvatarState,
	BODY,
	blinkAt,
	EAR_INNER_LEFT,
	EAR_INNER_RIGHT,
	EAR_LEFT,
	EAR_RIGHT,
	EYES,
	NOSE,
	type Pose,
	RISE,
	pose,
	restPose,
	riseTarget,
	stepRise,
	twitchAt,
	voiceAt,
} from "./agent-avatar.render"

export type { AgentAvatarState } from "./agent-avatar.render"

type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>

export interface AgentAvatarProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
	/**
	 * What the agent is doing. `thinking` sinks it low in its den, scanning
	 * upward; `speaking` brings it up to talk while the reply streams. Drive it
	 * from the same flag as the turn's own pending state.
	 * @default "idle"
	 */
	state?: AgentAvatarState
	/** The Avatar size ladder: 20 / 24 / 32 / 40 / 48px rows, 96 / 160px portraits. @default "md" */
	size?: AvatarSize
	/**
	 * Whether this avatar animates. Only the newest agent turn should be live:
	 * an earlier turn passes `live={false}` and settles into the resting frame,
	 * so a long transcript does not watch the reader from every row.
	 * @default true
	 */
	live?: boolean
	/** The accessible name. @default "Assistant" */
	label?: string
	/**
	 * Turns this avatar's motion down. `subtle` keeps the states readable (it
	 * still sinks to think and bobs to speak) and drops the flourishes: pointer
	 * tracking, blinks, ear twitches, the idle glances. `off` draws each state
	 * as a still pose. The reader's reduce-motion setting always wins.
	 */
	motion?: MotionLevel
}

const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** How far the avatar notices the pointer: about four of its own widths, never under 160px. */
const reachFor = (size: number) => Math.max(160, size * 4)

/** The simulation each avatar carries between frames. */
interface Sim {
	y: number
	v: number
	gx: number
	gy: number
	near: number
	hover: number
	think: number
	happy: number
	wx: number
	wy: number
	nextWander: number
	blinkAt: number
	doubleAt: number
	nextBlink: number
	twitchLeftAt: number
	twitchRightAt: number
	nextTwitch: number
	seed: number
}

function newSim(state: AgentAvatarState, t: number): Sim {
	return {
		y: RISE[state], v: 0, gx: 0, gy: 0, near: 0, hover: 0,
		think: state === "thinking" ? 1 : 0, happy: 0,
		wx: 0, wy: 0, nextWander: t + 1 + Math.random() * 2,
		blinkAt: -9, doubleAt: -9, nextBlink: t + 1 + Math.random() * 3,
		twitchLeftAt: -9, twitchRightAt: -9, nextTwitch: t + 2 + Math.random() * 3,
		seed: Math.random() * 100,
	}
}

/**
 * AgentAvatar — the default avatar for an AI agent's turns: a sable looking out
 * of its den. The round frame is the den's mouth. At rest it peeks; when the
 * pointer comes near it climbs out to look, ears perked; it sinks low to think
 * and comes up to talk. Its states replace a separate spinner in the message
 * row, because the avatar already says the agent is working.
 *
 * For agents only. A person is an `Avatar` (photo, initials or GradientArt);
 * this is an identity for software, and putting it on a human reads as a joke.
 *
 *   <Message avatar={<AgentAvatar size="sm" state={pending ? "speaking" : "idle"} />}>
 *
 * It is drawn as SVG from semantic tokens (foreground ink on the muted frame),
 * so every theme and dark mode works with no art per theme. All agent avatars
 * on a page share one animation loop and one pointer listener; an avatar that
 * is off screen, settled, or not `live` costs nothing.
 */
export function AgentAvatar({
	state = "idle",
	size = "md",
	live = true,
	label = "Assistant",
	motion,
	className,
	ref,
	...props
}: AgentAvatarProps) {
	const level = useMotionLevel(motion)
	const rootRef = useRef<HTMLSpanElement>(null)
	const bodyRef = useRef<SVGGElement>(null)
	const earLeftRef = useRef<SVGGElement>(null)
	const earRightRef = useRef<SVGGElement>(null)
	const eyesRef = useRef<SVGGElement>(null)
	const eyeRefs = useRef<(SVGRectElement | null)[]>([])
	const happyRefs = useRef<(SVGPathElement | null)[]>([])
	const stateRef = useRef(state)
	stateRef.current = state
	const simRef = useRef<Sim | null>(null)
	// The first paint is the still pose for the state the avatar mounts in, so
	// the server render and a motion-off render are already correct. Frames
	// after that write attributes through refs, never through React state.
	const [initial] = useState(() => restPose(live ? state : "idle"))
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		const root = rootRef.current
		if (!root) return
		if (typeof IntersectionObserver === "undefined") {
			setVisible(true)
			return
		}
		const observer = new IntersectionObserver(([entry]) => {
			setVisible(entry.isIntersecting)
		})
		observer.observe(root)
		return () => observer.disconnect()
	}, [])

	const apply = (p: Pose) => {
		bodyRef.current?.setAttribute("transform", p.body)
		earLeftRef.current?.setAttribute("transform", p.earLeft)
		earRightRef.current?.setAttribute("transform", p.earRight)
		eyesRef.current?.setAttribute("transform", p.eyes)
		for (const eye of eyeRefs.current) {
			if (!eye) continue
			eye.setAttribute("y", String(p.eye.y))
			eye.setAttribute("height", String(p.eye.h))
			eye.setAttribute("rx", String(p.eye.rx))
			eye.setAttribute("opacity", String(p.eye.opacity))
		}
		for (const arc of happyRefs.current) arc?.setAttribute("opacity", String(p.happyOpacity))
	}

	// Motion off: each state is a still pose, redrawn when the state changes.
	useEffect(() => {
		if (level.enabled && live) return
		simRef.current = null
		apply(restPose(live ? state : "idle"))
	}, [level.enabled, state, live])

	useEffect(() => {
		const root = rootRef.current
		if (!level.enabled || !live || !visible || !root) return
		const expressive = level.expressive
		const sim = (simRef.current ??= newSim(live ? stateRef.current : "idle", performance.now() / 1000))

		const tick = (t: number, dt: number) => {
			const s: AgentAvatarState = live ? stateRef.current : "idle"
			const flourish = expressive && live
			let tx = 0
			let ty = 0
			let nearT = 0
			let hovering = false
			if (flourish && pointer.on) {
				const r = root.getBoundingClientRect()
				const dx = pointer.x - (r.left + r.width / 2)
				const dy = pointer.y - (r.top + r.height / 2)
				const d = Math.hypot(dx, dy)
				if (d < reachFor(r.width)) {
					nearT = Math.min(1, (1 - d / reachFor(r.width)) * 1.6)
					const reach = Math.min(1, d / (r.width * 1.2))
					tx = d ? (dx / d) * reach : 0
					ty = d ? (dy / d) * reach : 0
					hovering = d < r.width * 0.55
				}
			}
			// Nobody near: the odd glance around, or eyes on the reader while it talks.
			if (nearT < 0.05 && flourish) {
				if (t > sim.nextWander) {
					const away = Math.random() >= 0.45
					sim.wx = away ? (Math.random() * 2 - 1) * 0.55 : 0
					sim.wy = away ? (Math.random() * 2 - 1) * 0.35 : 0
					sim.nextWander = t + 1.6 + Math.random() * 3.2
				}
				tx = s === "speaking" ? 0 : sim.wx
				ty = s === "speaking" ? 0.1 : sim.wy
			}
			// Thinking scans upward, as if reading. It is the state's activity, so
			// it runs under `subtle` too; a nearby pointer only half pulls it away.
			if (s === "thinking") {
				const w = nearT * 0.5
				tx = lerp(0.55 * Math.sin(t * 2.2), tx, w)
				ty = lerp(-0.5, ty, w)
			}
			sim.gx = damp(sim.gx, tx, 14, dt)
			sim.gy = damp(sim.gy, ty, 14, dt)
			sim.near = damp(sim.near, nearT, 6, dt)
			sim.hover = damp(sim.hover, hovering ? 1 : 0, 10, dt)
			sim.think = damp(sim.think, s === "thinking" ? 1 : 0, 6, dt)
			sim.happy = damp(sim.happy, sim.hover > 0.5 && s !== "thinking" ? 1 : 0, 12, dt)

			if (flourish && t > sim.nextBlink) {
				sim.blinkAt = t
				sim.doubleAt = Math.random() < 0.2 ? t + 0.26 : -9
				sim.nextBlink = t + 2.2 + Math.random() * 4.5
			}
			if (flourish && t > sim.nextTwitch) {
				if (Math.random() < 0.5) sim.twitchLeftAt = t
				else sim.twitchRightAt = t
				sim.nextTwitch = t + (s === "thinking" ? 0.7 : 3) + Math.random() * (s === "thinking" ? 1 : 5)
			}

			const voice = s === "speaking" ? voiceAt(t + sim.seed) : 0
			const target = riseTarget(s, sim.near, sim.hover > 0.5, expressive ? t : 0, voice)
			;[sim.y, sim.v] = stepRise(sim.y, sim.v, target, dt, expressive)

			apply(
				pose({
					rise: sim.y,
					gx: sim.gx,
					gy: sim.gy,
					near: sim.near,
					happy: sim.happy,
					think: sim.think,
					blink: flourish ? Math.max(blinkAt(t - sim.blinkAt), blinkAt(t - sim.doubleAt)) : 0,
					twitchLeft: flourish ? twitchAt(t - sim.twitchLeftAt) : 0,
					twitchRight: flourish ? twitchAt(t - sim.twitchRightAt) : 0,
				}),
			)

			// Subtle idle has no ambient flourishes. Stop once it rests; a state
			// change below subscribes again without resetting the simulation.
			if (!expressive && s === "idle") {
				const settled =
					Math.abs(sim.y - target) < 0.05 && Math.abs(sim.v) < 0.05 &&
					Math.abs(sim.gx) < 0.01 && Math.abs(sim.gy) < 0.01 && sim.near < 0.01 &&
					sim.happy < 0.01 && sim.think < 0.01
				if (settled) {
					apply(restPose("idle"))
					return false
				}
			}
			return true
		}

		const stop = subscribe(tick, expressive && live)
		return () => {
			stop()
		}
	}, [level.enabled, level.expressive, live, visible, state])

	return (
		<span
			ref={mergeRefs(rootRef, ref)}
			role="img"
			aria-label={label}
			data-slot="agent-avatar"
			data-state={live ? state : "idle"}
			data-motion={level.attribute}
			className={cn(avatarVariants({ size, shape: "circle" }), className)}
			{...props}
		>
			<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className="block size-full">
				<g ref={bodyRef} transform={initial.body}>
					<g ref={earLeftRef} transform={initial.earLeft}>
						<path d={EAR_LEFT} className="fill-foreground" />
						<path d={EAR_INNER_LEFT} className="fill-background/60" />
					</g>
					<g ref={earRightRef} transform={initial.earRight}>
						<path d={EAR_RIGHT} className="fill-foreground" />
						<path d={EAR_INNER_RIGHT} className="fill-background/60" />
					</g>
					<path d={BODY} className="fill-foreground" />
					<g ref={eyesRef} transform={initial.eyes}>
						<path d={NOSE} className="fill-background" />
						{EYES.x.map((x, i) => (
							<g key={x}>
								<rect
									ref={(el) => {
										eyeRefs.current[i] = el
									}}
									x={x - EYES.w / 2}
									y={initial.eye.y}
									width={EYES.w}
									height={initial.eye.h}
									rx={initial.eye.rx}
									opacity={initial.eye.opacity}
									className="fill-background"
								/>
								<path
									ref={(el) => {
										happyRefs.current[i] = el
									}}
									d={`M${x - 6} 59 Q${x} 50 ${x + 6} 59`}
									opacity={initial.happyOpacity}
									className="fill-none stroke-background"
									strokeWidth={3.4}
									strokeLinecap="round"
								/>
							</g>
						))}
					</g>
				</g>
			</svg>
		</span>
	)
}
AgentAvatar.displayName = "AgentAvatar"
