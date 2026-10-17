"use client";

import {
	type FocusEvent,
	type KeyboardEvent,
	type MouseEvent,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react"
import { cn } from "../../lib/cn"
import { isPromise } from "../../lib/is-promise"
import { StackedActionsContext } from "../../lib/presentation"
import { type MotionLevel, motionAttribute } from "../../motion/MotionProvider"
import { useAutoSize } from "../../motion/useAutoSize"
import { Button, type ButtonProps } from "../button/button"

type IconSize = "icon" | "icon-sm" | "icon-xs"

export interface ConfirmButtonProps
	extends Omit<
		ButtonProps,
		"children" | "onClick" | "variant" | "size" | "loading" | "loadingLabel" | "iconStart" | "render" | "type"
	> {
	/** The idle label — the action, e.g. "Delete". */
	children: ReactNode
	/**
	 * The label while armed, waiting for the second press. Defaults to
	 * "Confirm <label>?" for a text label ("Delete" → "Confirm delete?") and
	 * "Confirm?" otherwise. Pass it to localise.
	 */
	confirmLabel?: ReactNode
	/**
	 * Called on the second press, while armed. May return a promise: the button
	 * then stays armed and shows its spinner until it settles.
	 */
	onConfirm: () => unknown
	/** How long it stays armed without a second press, in ms. @default 3000 */
	timeout?: number
	/** The idle look. @default "secondary" */
	variant?: ButtonProps["variant"]
	/** The armed look. @default "destructive" */
	confirmVariant?: ButtonProps["variant"]
	/** A labelled size — the label is the whole interaction, so no icon-only sizes. @default "md" */
	size?: Exclude<NonNullable<ButtonProps["size"]>, IconSize>
	/** A leading icon, kept through both states (e.g. `<Icon name="trash" />`). */
	icon?: ReactNode
	/**
	 * What assistive tech hears when it arms, after the armed label.
	 * @default "Press again to confirm."
	 */
	confirmHint?: string
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the flourish, `off` stills it.
	 * It can only turn motion down — it never overrides a reader's reduce-motion
	 * setting. The width easing and the draining countdown are the flourish; the
	 * label cross-fade and colour change stay under `subtle`.
	 * @default "full"
	 */
	motion?: MotionLevel
}

/*
 * Button's optical start padding (button.tsx): one 2px step off the icon side,
 * because an icon's ink does not fill its box the way a label's does.
 */
const OPTICAL_START = "[--button-ps:calc(var(--button-px)-(--spacing(0.5)))] ps-(--button-ps)"

/*
 * A second press this soon after arming is a double-click, not a decision.
 * Without the guard a habitual double-click armed and confirmed in one gesture,
 * which is the exact accident the two steps exist to prevent. Short enough that
 * a deliberate second press never meets it.
 */
const DOUBLE_PRESS_GUARD_MS = 300

type Phase = "idle" | "armed" | "confirming"

function defaultConfirmLabel(label: ReactNode): ReactNode {
	if (typeof label !== "string" || label.trim() === "") return "Confirm?"
	// Lower only the first letter, so "Delete API key" reads "Confirm delete API key?".
	return `Confirm ${label.charAt(0).toLowerCase()}${label.slice(1)}?`
}

/**
 * ConfirmButton — an inline two-step confirm for a low-stakes destructive or
 * irreversible action, where a modal would be heavier than the decision.
 *
 *   <ConfirmButton icon={<Icon name="trash" />} onConfirm={removeRow}>Delete</ConfirmButton>
 *
 * The first press ARMS it: the label becomes the question ("Confirm delete?"),
 * the button turns destructive, and a thin line drains along its foot for the
 * time it will wait. A second press inside that time runs `onConfirm`. Leaving
 * it — the timeout, Escape, focus moving away, a press elsewhere — disarms it
 * and the original label returns. Enter and Space work twice, like a click.
 *
 * Both labels stay mounted in one grid cell and cross-fade. The button's width
 * eases to the new label (useAutoSize + motion-size), so it grows into the
 * question instead of jumping, and the neighbours it pushes travel rather than
 * teleport. CSS alone cannot do it: a content-sized button computes
 * `width: auto` before and after the swap, so nothing changes to transition.
 *
 * Built on Button: variants are swapped, never restyled, so every theme's
 * destructive tier is the armed look.
 */
export function ConfirmButton({
	children,
	confirmLabel,
	onConfirm,
	timeout = 3000,
	variant = "secondary",
	confirmVariant = "destructive",
	size,
	icon,
	confirmHint = "Press again to confirm.",
	motion,
	disabled,
	className,
	onBlur,
	onKeyDown,
	ref,
	...props
}: ConfirmButtonProps) {
	// The button gets an explicit px width measured from the content span, which
	// motion-size eases between. Without it there is no value to transition.
	// Unless something else owns the width: a stacked action bar stretches every
	// Button full-width, and a caller's `w-*` / `flex-1` says the same. An inline
	// pixel width would beat both, so the measuring stands down there and the
	// label simply changes in a box that is already the right size.
	const stacked = useContext(StackedActionsContext) as boolean
	const callerSized = /(^|\s)([\w-]+:)*(w-|flex-1|grow(\s|$)|basis-)/.test(className ?? "")
	const autoSize = useAutoSize<HTMLButtonElement, HTMLSpanElement>({ enabled: !stacked && !callerSized })
	const [phase, setPhase] = useState<Phase>("idle")
	const armedAt = useRef(0)
	const rootRef = useRef<HTMLButtonElement | null>(null)
	const armed = phase !== "idle"
	const prompt = confirmLabel ?? defaultConfirmLabel(children)

	const disarm = useCallback(() => setPhase((p) => (p === "armed" ? "idle" : p)), [])

	// The timeout runs while armed and waiting; a confirmation in flight is not
	// waiting, so it is never cut short.
	useEffect(() => {
		if (phase !== "armed") return
		const timer = setTimeout(disarm, timeout)
		return () => clearTimeout(timer)
	}, [phase, timeout, disarm])

	// A press anywhere else disarms. Blur alone misses the case where the first
	// press never focused the button (Safari does not focus buttons on click).
	useEffect(() => {
		if (phase !== "armed") return
		const onPointerDown = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) disarm()
		}
		document.addEventListener("pointerdown", onPointerDown, true)
		return () => document.removeEventListener("pointerdown", onPointerDown, true)
	}, [phase, disarm])

	// Disabled while armed: the question no longer applies.
	useEffect(() => {
		if (disabled) setPhase((p) => (p === "armed" ? "idle" : p))
	}, [disabled])

	const handleClick = (_event: MouseEvent<HTMLButtonElement>) => {
		if (phase === "idle") {
			armedAt.current = Date.now()
			setPhase("armed")
			return
		}
		if (phase !== "armed" || Date.now() - armedAt.current < DOUBLE_PRESS_GUARD_MS) return
		const result = onConfirm()
		if (isPromise(result)) {
			setPhase("confirming")
			// then(fn, fn), not finally: finally's derived promise re-rejects, and
			// nothing handles it, so a refused confirm became an unhandled rejection.
			const idle = () => setPhase("idle")
			result.then(idle, idle)
			// Returned so Button holds its own busy state (spinner, refused presses).
			return result
		}
		setPhase("idle")
		return result
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (event.key === "Escape" && phase === "armed") {
			// The Escape is spent on backing out of the question; it must not also
			// close the dialog or popover the button sits in.
			event.preventDefault()
			event.stopPropagation()
			disarm()
		}
		onKeyDown?.(event)
	}

	const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
		disarm()
		onBlur?.(event)
	}

	const setRefs = (node: HTMLButtonElement | null) => {
		rootRef.current = node
		autoSize.outerRef.current = node
		if (typeof ref === "function") ref(node)
		else if (ref) ref.current = node
	}

	return (
		<>
			<Button
				{...props}
				ref={setRefs}
				size={size}
				variant={armed ? confirmVariant : variant}
				disabled={disabled}
				data-state={armed ? "armed" : "idle"}
				data-motion={motionAttribute(motion)}
				className={cn(
					// overflow-clip: while the width eases, the content is already at
					// its new size, so it is clipped to the button rather than painting
					// past its fill. A ring is a box-shadow and is not clipped.
					"relative overflow-clip motion-size",
					// The icon lives inside the measured span (below), not in Button's
					// iconStart slot, so Button's optical start padding is restated.
					icon != null && OPTICAL_START,
					className,
				)}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
			>
				{/* The measured content: icon + label cell, sized to the CURRENT label
				    only. The cell stacks both labels; the inactive one takes no width
				    (w-0) and fades out, centred, so it spills evenly to both sides and
				    is clipped sideways (never vertically, so descenders survive). The
				    content's own opacity fade is for an async confirm, when Button lays
				    its spinner over it. */}
				<span
					ref={autoSize.innerRef}
					className="inline-flex w-max items-center gap-(--control-gap) transition-opacity duration-(--motion-duration-fast) ease-standard"
				>
					{icon}
					<span className="inline-grid overflow-x-clip">
						<ConfirmLabel active={!armed}>{children}</ConfirmLabel>
						<ConfirmLabel active={armed}>{prompt}</ConfirmLabel>
					</span>
				</span>
				{/* The countdown: drains from full to nothing over `timeout`, starting
				    from its @starting-style the moment it mounts. Expressive and on
				    the motion scale — under `subtle` or reduced motion it resolves at
				    once, so it is simply absent rather than frozen full, which would
				    read as "waiting forever". */}
				{phase === "armed" ? (
					<span
						aria-hidden="true"
						data-slot="confirm-countdown"
						className="pointer-events-none absolute inset-x-(--button-px) bottom-1 h-0.5 origin-left rounded-full bg-current opacity-40 transition-[scale] ease-linear scale-x-0 starting:scale-x-100 rtl:origin-right"
						style={{
							transitionDuration: `calc(${timeout}ms * var(--motion-scale, 1) * var(--motion-expressive, 1))`,
						}}
					/>
				) : null}
			</Button>
			{/* Polite, and outside the button so it is not folded into its name. A
			    focused button's name change is read by some screen readers and not
			    others, so the question is said here as well. Always mounted: a live
			    region only announces into a region that already exists. */}
			<span role="status" className="sr-only">
				{phase === "armed" ? (
					<>
						{prompt} {confirmHint}
					</>
				) : null}
			</span>
		</>
	)
}
ConfirmButton.displayName = "ConfirmButton"

function ConfirmLabel({ active, children }: { active: boolean; children: ReactNode }) {
	return (
		<span
			aria-hidden={active ? undefined : "true"}
			data-active={active}
			className={cn(
				"col-start-1 row-start-1 flex justify-center transition-opacity duration-(--motion-duration-fast) ease-standard",
				active ? "w-max" : "w-0 opacity-0",
			)}
		>
			<span className="sable-label-trim">{children}</span>
		</span>
	)
}
