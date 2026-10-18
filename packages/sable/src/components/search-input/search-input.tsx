import { type ComponentPropsWithRef, useState } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { FIELD_INVALID, FIELD_SHELL, MOBILE_FIELD_TIER } from "../../lib/field-shell"
import { useDensity, useTypeTier } from "../../lib/density"
import { Button } from "../button/button"

export interface SearchInputProps
	extends Omit<ComponentPropsWithRef<"input">, "onChange" | "value" | "defaultValue"> {
	/** Controlled value of the search field. */
	value?: string
	/**
	 * Uncontrolled initial value. The field then tracks its own text, so the
	 * clear button still appears and still empties it.
	 */
	defaultValue?: string
	/**
	 * Sizes and places the whole field — the magnifier, the input and the clear
	 * button together (`max-w-80`, `flex-1`). Width set here moves all three.
	 */
	className?: string
	/** Classes for the `<input>` element alone, for the rare input-only override. */
	inputClassName?: string
	/** Called with the next string on every keystroke. */
	onValueChange?: (value: string) => void
	/**
	 * Called when the clear button is pressed. If omitted, the component still
	 * fires `onValueChange("")` so a controlled value resets to empty.
	 */
	onClear?: () => void
}

/**
 * SearchInput — a styled search field with a leading magnifier and a clearable
 * X. Soft-square (rounded-sm), field surface, 2px focus ring — same shell as
 * Input, padded to make room for the leading and trailing affordances. The
 * clear button only renders while the value is non-empty.
 *
 *   <SearchInput value={q} onValueChange={setQ} placeholder="Search posts" />
 *
 * Controlled via `value` + `onValueChange`, or uncontrolled via `defaultValue`;
 * pass `onClear` to hook the reset. `className` sizes the whole field.
 */
export function SearchInput({
	value,
	defaultValue,
	onValueChange,
	onClear,
	placeholder = "Search",
	className,
	inputClassName,
	ref,
	type,
	...props
}: SearchInputProps) {
	// Uncontrolled use keeps its own copy of the text, so "is there a query to
	// clear?" has an answer either way — without it a defaultValue field never
	// showed its clear button.
	const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "")
	const controlled = value !== undefined
	const current = controlled ? value : uncontrolled
	const hasValue = current.length > 0

	function change(next: string) {
		if (!controlled) setUncontrolled(next)
		onValueChange?.(next)
	}

	function handleClear() {
		change("")
		onClear?.()
	}

	const tier = useTypeTier()
	const density = useDensity()
	return (
		// The wrapper is the field: className lands here, so a width cap moves the
		// clear button with the input instead of leaving it at the far edge of a
		// wider box.
		<div className={cn("relative inline-flex w-full items-center", className)}>
			<Icon
				name="search"
				className="pointer-events-none absolute start-3 text-sm text-muted-foreground"
			/>
			<input
				ref={ref}
				type={type ?? "search"}
				value={current}
				onChange={(event) => change(event.target.value)}
				placeholder={placeholder}
				className={cn(
					"flex h-(--control-md) w-full ps-9 pe-9 text-foreground",
					// The shell Input and CommandMenuTrigger wear too — lib/field-shell.
					FIELD_SHELL,
					FIELD_INVALID,
					"[&::-webkit-search-cancel-button]:appearance-none",
					tier.body,
					density === "comfortable" && MOBILE_FIELD_TIER,
					inputClassName,
				)}
				{...props}
			/>
			{hasValue && !props.disabled ? (
				// The wrapper carries the arrival, the button keeps its own response.
				// motion-appear declares a transition list of its own, and on the
				// Button it would fight motion-interactive for the one
				// transition-property slot — whichever sorted last would win, and
				// either the hover ease or the arrival would silently go. Removal
				// stays instant: an emptied field should not wait on its X.
				<span className="absolute end-2 flex motion-appear">
					{/* Sable's own icon button, not a hand-sized <button>: the hit area,
					    focus ring, press and disabled fade follow the control ladder with
					    every other icon button. Muted ink until hovered, so the X never
					    out-shouts the query it clears. */}
					<Button
						variant="ghost"
						size="icon-xs"
						onClick={handleClear}
						aria-label="Clear search"
						className="text-muted-foreground hover:text-foreground"
					>
						<Icon name="xmark" />
					</Button>
				</span>
			) : null}
		</div>
	)
}
SearchInput.displayName = "SearchInput"
