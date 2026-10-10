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
 * Must render inside a Base UI Checkbox.Root (Checkbox, or CheckboxCard's root).
 */
export function CheckboxMark({ className }: { className?: string }) {
	return (
		<Base.Indicator
			className={cn(
				"flex items-center justify-center text-current motion-interactive ease-spring data-[starting-style]:scale-0 data-[starting-style]:opacity-0 data-[ending-style]:scale-0 data-[ending-style]:opacity-0",
				className,
			)}
			render={(indicatorProps, state) => (
				<span {...indicatorProps}>
					<Icon
						name={state.indeterminate ? "minus" : "check"}
						className={CHECK_MARK_SIZE}
					/>
				</span>
			)}
		/>
	)
}
CheckboxMark.displayName = "CheckboxMark"
