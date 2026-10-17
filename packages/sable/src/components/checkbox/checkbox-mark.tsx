import { Checkbox as Base } from "@base-ui/react/checkbox"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { CHECK_MARK_SIZE } from "../../lib/selection-card"

/**
 * The mark inside a checkbox box — a check, or a dash when indeterminate. The
 * one indicator both Checkbox and CheckboxCard render, so the two states carry
 * the same glyph set, size and stroke weight everywhere.
 *
 * Both states draw from the SAME icon set at the SAME size. The dash used to be
 * a hand-rolled 2px CSS bar: about three times heavier than the 0.69px-optical
 * tick beside it, and it scaled with nothing, so a consumer injecting a heavier
 * icon set inverted the mismatch. An icon tracks whatever set is injected.
 *
 * The glyph reads `indeterminate` from Base UI's state, not from props: a
 * `parent` ("select all") checkbox inside a CheckboxGroup never receives the
 * prop — the group computes its mixed state.
 *
 * Unchecking only fades (motion-tick's exit), so clearing a long list of boxes
 * is not a performance; under `data-motion="subtle"` checking fades too.
 *
 * Must render inside a Base UI Checkbox.Root (Checkbox, or CheckboxCard's root).
 */
export function CheckboxMark({ className }: { className?: string }) {
	return (
		<Base.Indicator
			className={cn(
				// motion-tick, not a scale from 0: the mark wipes in from its leading
				// stroke, so checking reads as a tick being drawn rather than a dot
				// swelling into a check. The dash takes the same wipe, which for a
				// horizontal bar is simply a line drawn left to right. It declares its
				// own transition list, so motion-interactive must not sit here too —
				// two transition-property declarations on one element and the later
				// class silently wins, dropping the clip-path.
				"flex items-center justify-center text-current motion-tick",
				className,
			)}
			render={(indicatorProps, state) => (
				<span {...indicatorProps}>
					<Icon
						name={state.indeterminate ? "minus" : "check"}
						// Weight, not size: a 24-unit glyph drawn at 11px thins its 1.5-unit
						// line to ~0.7px, lost on a filled box. A 2-unit stroke in the same
						// ink, round-joined, brings it to ~1.6px; on a stroked set it only
						// pins the width, so the mark reads at one weight in any set.
						className={cn(CHECK_MARK_SIZE, "[&_path]:stroke-current [&_path]:[stroke-width:2] [&_path]:[stroke-linejoin:round] [&_path]:[stroke-linecap:round]")}
					/>
				</span>
			)}
		/>
	)
}
CheckboxMark.displayName = "CheckboxMark"
