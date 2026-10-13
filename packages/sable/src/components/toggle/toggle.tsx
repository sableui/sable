import { Toggle as BaseToggle } from "@base-ui/react/toggle"
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group"
import { type ComponentProps, createContext, useContext } from "react"
import { cn } from "../../lib/cn"
import { SEGMENTED_ITEM, SEGMENTED_TRACK } from "../../lib/segmented"

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
}

export function ToggleGroup({ className, appearance = "default", ...props }: ToggleGroupProps) {
	return (
		<ToggleAppearanceContext.Provider value={appearance}>
			<BaseToggleGroup
				data-appearance={appearance}
				className={cn(
					appearance === "segmented" ? SEGMENTED_TRACK : "inline-flex items-center gap-1",
					className,
				)}
				{...props}
				// Base UI's composite emits orientation, but role=group does not
				// support that ARIA attribute. Keep the keyboard orientation prop.
				aria-orientation={props.role === "toolbar" ? props.orientation ?? "horizontal" : undefined}
			/>
		</ToggleAppearanceContext.Provider>
	)
}
ToggleGroup.displayName = "ToggleGroup"
