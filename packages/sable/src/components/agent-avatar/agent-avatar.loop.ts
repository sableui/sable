/**
 * One animation frame loop and one pointer listener for every AgentAvatar on
 * the page. A transcript can hold many agent avatars; each subscribing to its
 * own requestAnimationFrame and pointermove would multiply both by the number
 * of turns. The loop runs only while something is subscribed, and the pointer
 * listeners exist only while a subscriber wants the pointer.
 */

/** Return false to unsubscribe (the avatar has settled and has nothing to do). */
export type Tick = (t: number, dt: number) => boolean | void

/** Where the pointer is, in viewport pixels, and whether it is on the page at all. */
export const pointer = { x: 0, y: 0, on: false }

const ticks = new Set<Tick>()
const watchers = new Set<Tick>()
let frame = 0
let last = 0
let touchTimer: ReturnType<typeof setTimeout> | undefined

const seconds = () => performance.now() / 1000

function loop() {
	if (document.hidden) {
		frame = 0
		return
	}
	const t = seconds()
	// Clamped: a backgrounded tab resumes with a dt of minutes, and a spring
	// integrated over that would fling the body out of the frame.
	const dt = Math.min(0.05, t - last)
	last = t
	for (const tick of ticks) if (tick(t, dt) === false) unsubscribe(tick)
	frame = ticks.size ? requestAnimationFrame(loop) : 0
}

const onMove = (e: PointerEvent) => {
	pointer.x = e.clientX
	pointer.y = e.clientY
	pointer.on = true
	clearTimeout(touchTimer)
}
// A touch has no hover: once the finger lifts, let the avatar look away again.
const onUp = (e: PointerEvent) => {
	if (e.pointerType !== "mouse") touchTimer = setTimeout(() => (pointer.on = false), 1400)
}
const onOut = (e: MouseEvent) => {
	if (!e.relatedTarget) pointer.on = false
}
const onBlur = () => (pointer.on = false)

function start() {
	if (frame || !ticks.size || document.hidden) return
	last = seconds()
	frame = requestAnimationFrame(loop)
}

function onVisibility() {
	if (document.hidden) {
		onBlur()
		if (frame) cancelAnimationFrame(frame)
		frame = 0
	} else {
		start()
	}
}

function listen(on: boolean) {
	const method = on ? "addEventListener" : "removeEventListener"
	globalThis[method]("pointermove", onMove as EventListener, { passive: true })
	globalThis[method]("pointerdown", onMove as EventListener, { passive: true })
	globalThis[method]("pointerup", onUp as EventListener)
	globalThis[method]("pointercancel", onBlur)
	globalThis[method]("blur", onBlur)
	document[method]("mouseout", onOut as EventListener)
	if (!on) {
		clearTimeout(touchTimer)
		pointer.on = false
	}
}

function unsubscribe(tick: Tick) {
	ticks.delete(tick)
	if (!ticks.size) document.removeEventListener("visibilitychange", onVisibility)
	if (watchers.delete(tick) && watchers.size === 0) listen(false)
	if (!ticks.size && frame) {
		cancelAnimationFrame(frame)
		frame = 0
	}
}

/** Run `tick` every frame until it returns false or the returned cleanup runs. */
export function subscribe(tick: Tick, watchPointer: boolean): () => void {
	if (!ticks.size) document.addEventListener("visibilitychange", onVisibility)
	ticks.add(tick)
	if (watchPointer && !watchers.has(tick)) {
		watchers.add(tick)
		if (watchers.size === 1) listen(true)
	}
	start()
	return () => unsubscribe(tick)
}
