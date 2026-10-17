"use client";

import { Radio as RadioBase } from "@base-ui/react/radio"
import type { ComponentPropsWithRef, CSSProperties } from "react"
import { Icon } from "../../icon"
import { type MotionLevel, motionAttribute } from "../../motion/MotionProvider"
import { cn } from "../../lib/cn"
import {
	SEGMENTED_INNER_RADIUS,
	SEGMENTED_ITEM,
	SEGMENTED_STEP,
	SEGMENTED_TRACK,
} from "../../lib/segmented"
import { RadioGroup } from "../radio/radio"

/** The three color preferences a ThemeSwitcher cycles between. */
export type ThemeMode = "light" | "dark" | "system"

interface ThemeOption {
	value: ThemeMode
	icon: string
	label: string
}

const OPTIONS: ThemeOption[] = [
	{ value: "light", icon: "sun", label: "Light" },
	{ value: "dark", icon: "moon", label: "Dark" },
	{ value: "system", icon: "desktop", label: "System" },
]

export interface ThemeSwitcherProps
	extends Omit<ComponentPropsWithRef<"div">, "onChange"> {
	/** The currently selected color preference. */
	value: ThemeMode
	/** Called with the next color preference when an option is chosen. */
	onValueChange: (value: ThemeMode) => void
	/** Accessible label for the group. @default "Theme" */
	label?: string
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the glide, `off` stills it. It
	 * can only turn motion down — it never overrides a reader's reduce-motion
	 * setting.
	 * @default "full"
	 */
	motion?: MotionLevel
}

/**
 * ThemeSwitcher — a segmented light / dark / system switch. Presentational:
 * it renders the selected state and reports changes via `onValueChange`; the
 * caller wires the actual theme (e.g. toggling the `.dark` class). Built on
 * Sable's RadioGroup over Base UI's Radio, so the roles, `aria-checked`, the
 * single tab stop and arrow-key selection all come from Base UI — the
 * hand-rolled `role="radio"` buttons this replaced had no arrow keys at all.
 * Sable's own `<Radio>` is the dot-in-a-ring control; these options are icon
 * segments, so they render Base UI's Radio.Root directly with their own skin.
 *
 *   const [theme, setTheme] = useState<ThemeMode>("system")
 *   <ThemeSwitcher value={theme} onValueChange={setTheme} />
 *
 * Requires a `desktop` icon in the active IconSet (alongside `sun` + `moon`).
 */
export function ThemeSwitcher({
	value,
	onValueChange,
	label = "Theme",
	motion,
	className,
	ref,
	...props
}: ThemeSwitcherProps) {
	const activeIndex = OPTIONS.findIndex((o) => o.value === value)

	return (
		<RadioGroup
			ref={ref}
			aria-label={label}
			data-motion={motionAttribute(motion)}
			value={value}
			onValueChange={(next) => onValueChange(next as ThemeMode)}
			className={cn(
				// `w-fit` as well as `inline-flex`, and it is load-bearing: `display`
				// does not protect a flex ITEM. In any `flex flex-col` parent — the most
				// ordinary way to stack a label above a control — `align-items: stretch`
				// overrides the intrinsic width, and because the three buttons stay a
				// fixed size-7 you get a full-width capsule with the icons stranded at
				// the left. A segmented control of fixed-size options must never stretch.
				// Pass `className="w-full"` if you genuinely want it to.
				// `flex-row` overrides RadioGroup's stacked default.
				// The shared segmented track (lib/segmented), also ToggleGroup's
				// appearance="segmented".
				SEGMENTED_TRACK,
				className,
			)}
			{...props}
		>
			{/* The active pill slides between options. Each step is one option plus
			    the gap (SEGMENTED_STEP), on the spacing scale — a fixed rem here
			    drifted off the selected icon as soon as density moved --spacing.
			    The step is negated in RTL, where the options run from the right.
			    `motion-glide` carries the timing: the travel is expressive, so
			    `motion="subtle"` (or a MotionScope) lands it without the slide. */}
			<span
				aria-hidden
				className={cn(
					"pointer-events-none absolute start-0.5 top-0.5 size-7 bg-accent motion-glide",
					SEGMENTED_INNER_RADIUS,
					"[translate:calc(var(--segment-index)*var(--segment-step))_0] rtl:[translate:calc(var(--segment-index)*var(--segment-step)*-1)_0]",
					activeIndex < 0 && "opacity-0",
				)}
				style={
					{
						"--segment-index": Math.max(activeIndex, 0),
						"--segment-step": SEGMENTED_STEP,
					} as CSSProperties
				}
			/>
			{OPTIONS.map((option) => {
				const checked = option.value === value
				return (
					<RadioBase.Root
						key={option.value}
						value={option.value}
						// Native activation, as in Sable's Radio: the composite's
						// non-native Space handler otherwise passes a prevented key event
						// into Radio's click handler.
						render={<button type="button" />}
						nativeButton
						aria-label={option.label}
						title={option.label}
						className={cn(
							SEGMENTED_ITEM,
							// The checked icon sits on the bg-accent pill, so its ink must be
							// accent-foreground — legible on a saturated accent (a saturated theme accent)
							// and identical to foreground for neutral accents.
							"aria-checked:text-accent-foreground aria-checked:hover:text-accent-foreground",
						)}
					>
						<Icon
							name={option.icon}
							className={cn(
								"text-sm transition-transform duration-(--motion-duration-base) ease-spring",
								checked && "scale-110",
							)}
						/>
					</RadioBase.Root>
				)
			})}
		</RadioGroup>
	)
}
ThemeSwitcher.displayName = "ThemeSwitcher"
