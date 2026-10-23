/**
 * AgentAvatar's drawing and its motion maths, kept free of React and the DOM so
 * the poses can be tested directly.
 *
 * The character is a sable looking out of its den: the avatar's round frame is
 * the den's mouth, and the body rises and sinks inside it. Everything is drawn
 * in a 100×100 box; `rise` translates the body down from its fully-out pose.
 */

export type AgentAvatarState = "idle" | "thinking" | "speaking"

/**
 * The ears. Each pivots on the point where its outer edge meets the head
 * outline (EAR_PIVOT), so that join never moves as the ear perks or twitches,
 * and its root runs deep into the head on the inner side. Pivoting anywhere
 * else lifts the outer corner off the curved skull and opens a sliver of gap.
 */
export const EAR_LEFT = "M16.5 48 C10 44 9 35 12 28 C15 21 22 19 28 22 C35 25 39 34 39 44 L30 54 Z"
export const EAR_RIGHT = "M83.5 48 C90 44 91 35 88 28 C85 21 78 19 72 22 C65 25 61 34 61 44 L70 54 Z"
export const EAR_INNER_LEFT = "M17 39 C14 36 14 30 17 27 C20 24 24 25 27 28 C30 31 31 36 30 40 C25 37 21 37 17 39 Z"
export const EAR_INNER_RIGHT = "M83 39 C86 36 86 30 83 27 C80 24 76 25 73 28 C70 31 69 36 70 40 C75 37 79 37 83 39 Z"
export const EAR_PIVOT = { left: [16.5, 48], right: [83.5, 48] } as const
/** Head and a body that runs on below the frame, so the sable never floats. */
export const BODY = "M13 62 C13 40 29 28 50 28 C71 28 87 40 87 62 L87 170 L13 170 Z"
/** Eye centres and size, in the body's own coordinates. */
export const EYES = { x: [38, 62], y: 56, w: 10, h: 17 } as const
/** A small tapered nose gives the face a muzzle without crowding a 20px row. */
export const NOSE = "M46 69 Q50 67 54 69 Q54 72 50 73 Q46 72 46 69 Z"

/**
 * How far the body sits down in the den per state. 0 is all the way out; at 20
 * the eyes sit low in the frame, peeking. Thinking sinks lower and scans
 * upward; speaking comes up to talk.
 */
export const RISE = { idle: 20, near: 6, hover: 2, thinking: 30, speaking: 6 } as const

/** The pose's inputs. Gaze runs -1..1 on each axis; the rest are 0..1. */
export interface PoseInput {
	rise: number
	gx: number
	gy: number
	/** How close the pointer is: perks the ears. */
	near: number
	/** The pointer is over the avatar: the eyes turn happy. */
	happy: number
	/** Thinking's weight: narrows the eyes. */
	think: number
	blink: number
	/** Extra ear rotation from a twitch, in degrees, outward-positive. */
	twitchLeft: number
	twitchRight: number
}

export interface Pose {
	body: string
	earLeft: string
	earRight: string
	eyes: string
	eye: { y: number; h: number; rx: number; opacity: number }
	happyOpacity: number
}

const f = (n: number) => Math.round(n * 100) / 100

/** Turn the inputs into SVG transforms and eye geometry. */
export function pose(p: PoseInput): Pose {
	const perk = 5 * p.near + 3 * p.happy
	// A slight shared tilt follows the gaze; thinking holds one ear more
	// upright than the other. The independent flicks stay smaller than a perk.
	const tilt = 2 * p.gx - 3 * p.think
	const h = Math.max(2.2, EYES.h * (1 - 0.88 * p.blink) * (1 - 0.3 * p.think))
	return {
		body: `translate(${f(p.gx * 3)} ${f(p.rise)})`,
		earLeft: `rotate(${f(-perk + tilt - p.twitchLeft)} ${EAR_PIVOT.left[0]} ${EAR_PIVOT.left[1]})`,
		earRight: `rotate(${f(perk + tilt + p.twitchRight)} ${EAR_PIVOT.right[0]} ${EAR_PIVOT.right[1]})`,
		eyes: `translate(${f(p.gx * 8)} ${f(p.gy * 6)})`,
		eye: { y: f(EYES.y - h / 2), h: f(h), rx: f(Math.min(EYES.w, h) / 2), opacity: f(1 - p.happy) },
		happyOpacity: f(p.happy),
	}
}

/** The still pose for a state: the first paint, and everything under motion off. */
export function restPose(state: AgentAvatarState): Pose {
	return pose({
		rise: RISE[state],
		gx: state === "thinking" ? 0.4 : 0,
		gy: state === "thinking" ? -0.5 : 0,
		near: 0,
		happy: 0,
		think: state === "thinking" ? 1 : 0,
		blink: 0,
		twitchLeft: 0,
		twitchRight: 0,
	})
}

/** Where the body is heading this frame. */
export function riseTarget(state: AgentAvatarState, near: number, hover: boolean, t: number, voice: number): number {
	if (state === "thinking") return RISE.thinking
	if (state === "speaking") return RISE.speaking - 3 * voice
	if (hover) return RISE.hover
	return RISE.idle + (RISE.near - RISE.idle) * near + 1.2 * Math.sin(t * 1.1)
}

/**
 * One step of the rise spring. Stiff enough to answer the pointer, under-damped
 * enough that it lands with a small settle — the overshoot is expressive motion,
 * so `springy: false` swaps in a plain ease with none.
 */
export function stepRise(y: number, v: number, target: number, dt: number, springy: boolean): [number, number] {
	if (!springy) return [y + (target - y) * (1 - Math.exp(-10 * dt)), 0]
	const step = Math.min(dt, 1 / 30)
	const nv = v + ((target - y) * 170 - v * 15) * step
	return [y + nv * step, nv]
}

/** A blink's closure over its 180ms: 0 open, 1 shut. */
export const blinkAt = (d: number) => (d < 0 || d > 0.18 ? 0 : Math.sin((d / 0.18) * Math.PI))
/** A small independent flick, then a softer return, settling within 360ms. */
export const twitchAt = (d: number) =>
	d < 0 || d >= 0.36 ? 0 : 12 * Math.sin((d / 0.36) * Math.PI * 2) * Math.exp(-6 * d)
/** A speaking envelope: syllable-ish, never quite still. */
export const voiceAt = (t: number) =>
	Math.max(0, Math.min(1, 0.45 + 0.5 * Math.sin(t * 13) * Math.sin(t * 4.1 + 1.3) + 0.2 * Math.sin(t * 23.7)))
