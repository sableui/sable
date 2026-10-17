import { Toggle as BaseToggle } from "@base-ui/react/toggle"
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group"
import { type ComponentProps, createContext, useContext } from "react"
import { cn } from "../../lib/cn"
import { HighlightGlide } from "../../lib/highlight-glide"
import { SEGMENTED_INNER_RADIUS, SEGMENTED_ITEM, SEGMENTED_TRACK } from "../../lib/segmented"
import { type MotionLevel, motionAttribute } from "../../motion/MotionProvider"

/** How a ToggleGroup draws its toggles. */
export type ToggleGroupAppearance = "default" | "segmented"

const ToggleAppearanceContext = createContext<ToggleGroupAppearance>("default")

/**
 * Toggle — themed wrapper over Base UI's Toggle (a two-state, pressed-or-not
 * button). The ARIA `aria-pressed` wiring, keyboard handling, and optional
 * group membership all come from Base UI. Pressed state is read from the
 * `data-[pressed]` attribute. Compose standalone:
 *
 *   <Toggle aria-label="Bold"><Icon name="bold" /></Toggle>
 *   <Toggle pressed={on} onPressedChange={setOn}>Mute</Toggle>
 *
 * Or inside a ToggleGroup, where each Toggle carries a `value`:
 *
 *   <ToggleGroup defaultValue={["list"]}>
 *     <Toggle value="list" aria-label="List view"><Icon name="list" /></Toggle>
 *     <Toggle value="grid" aria-label="Grid view"><Icon name="grid" /></Toggle>
 *   </ToggleGroup>
 */
type ToggleProps = Omit<ComponentProps<typeof BaseToggle>, "className"> & {
	className?: string
}

export function Toggle({ className, ...props }: ToggleProps) {
	const appearance = useContext(ToggleAppearanceContext)
	return (
		<BaseToggle
			className={cn(
				appearance === "segmented"
					? cn(SEGMENTED_ITEM, "cursor-pointer px-2 text-label-md data-[pressed]:hover:text-accent-foreground")
					: cn(
							"inline-flex h-(--control-sm) min-w-(--control-sm) cursor-pointer items-center justify-center rounded-sm px-2.5 text-label-md text-muted-foreground motion-interactive motion-press",
							// Hover is the surface's quiet step, NOT the pressed fill: with
							// both on bg-accent an unpressed toggle looked pressed under the
							// pointer, which is the one state a toggle must never fake.
							"sable-surface-interactive",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
						),
				"data-[pressed]:bg-accent data-[pressed]:text-accent-foreground",
				"disabled:pointer-events-none disabled:opacity-50",
				// An icon beside a label is spaced like Button's; without it they touched.
				"gap-(--control-gap) [&_svg]:shrink-0",
				className,
			)}
			{...props}
		/>
	)
}
Toggle.displayName = "Toggle"

/**
 * ToggleGroup — themed wrapper over Base UI's ToggleGroup. Shares pressed state
 * across a row of child Toggles. Single-select by default (`multiple={false}`);
 * pass `multiple` to allow several pressed at once. Arrow-key roving focus and
 * the `value`/`defaultValue`/`onValueChange` contract come from Base UI.
 */
type ToggleGroupProps = Omit<
	ComponentProps<typeof BaseToggleGroup>,
	"className"
> & {
	className?: string
	/**
	 * `default` — a loose row of toggles. `segmented` — the capsule segmented
	 * control (lib/segmented, the same look as ThemeSwitcher): one track, the
	 * pressed option filled. Use segmented for a single-select view switch.
	 * @default "default"
	 */
	appearance?: ToggleGroupAppearance
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
 * A single-select segmented group draws its pressed fill ONCE, as a glider that
 * travels to the chosen option (lib/highlight-glide, `follow="data-pressed"`),
 * instead of every option toggling its own `bg-accent`. One fill that moves is
 * what makes a view switch read as "the same control, now pointing here"; two
 * fills swapping read as two controls.
 *
 * The options keep `data-[pressed]:bg-accent` as the fallback for the frame
 * before the glider mounts (server render, no JS). Once it does, it marks the
 * track `data-glide` and this selector clears the options' own fill — the same
 * hand-off the menus use (styles.css → "Highlight glide"). The ink stays on the
 * option: the glider is decoration, `aria-pressed` is the state.
 *
 * Multi-select has no single place for a fill to travel to, so it keeps one
 * fill per pressed option.
 */
const SEGMENTED_GLIDE_HANDOFF = "[&[data-glide]>[data-pressed]]:bg-transparent"

export function ToggleGroup({
	className,
	appearance = "default",
	motion,
	children,
	...props
}: ToggleGroupProps) {
	const glide = appearance === "segmented" && !props.multiple
	return (
		<ToggleAppearanceContext.Provider value={appearance}>
			<BaseToggleGroup
				data-appearance={appearance}
				data-motion={motionAttribute(motion)}
				className={cn(
					appearance === "segmented" ? SEGMENTED_TRACK : "inline-flex items-center gap-1",
					glide && SEGMENTED_GLIDE_HANDOFF,
					className,
				)}
				{...props}
				// Base UI's composite emits orientation, but role=group does not
				// support that ARIA attribute. Keep the keyboard orientation prop.
				aria-orientation={props.role === "toolbar" ? props.orientation ?? "horizontal" : undefined}
			>
				{/* Options can differ in width (labels), so the glider is measured
				    rather than stepped by SEGMENTED_STEP as ThemeSwitcher's fixed
				    icon segments are. `selection` timing: it lands on the first
				    choice with no transition and glides (motion-glide) after. */}
				{glide && (
					<HighlightGlide
						follow="data-pressed"
						timing="selection"
						className={cn(SEGMENTED_INNER_RADIUS, "bg-accent motion-glide")}
					/>
				)}
				{children}
			</BaseToggleGroup>
		</ToggleAppearanceContext.Provider>
	)
}
ToggleGroup.displayName = "ToggleGroup"
