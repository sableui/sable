import { type ComponentPropsWithRef, useState } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { FIELD_INVALID, FIELD_SHELL, FIELD_SHELL_XS, MOBILE_FIELD_TIER } from "../../lib/field-shell"
import { useDensity, useTypeTier } from "../../lib/density"
import { hitTargetMin } from "../../lib/hit-target"
import { Button } from "../button/button"

/** The rungs of the control ladder a SearchInput stands on. */
export type SearchInputSize = "md" | "sm" | "xs"

/**
 * Geometry per rung. Height reads the ladder, so a `data-density` scope
 * retunes every rung at once; nothing here names a pixel height.
 *
 * The magnifier and the clear button are absolutely placed in a flex row
 * (`items-center`), which centres both vertically at any height. What changes
 * per rung is the inset from the edge and the clear button's box: each rung's
 * button is the field height less the same inset top and bottom, so the X sits
 * in the field with even space around it at every rung and density. The
 * inline padding clears the magnifier at the start and the button at the end.
 * Below `md` the drawn X can fall under 24px in a compact scope, so its
 * pointer target comes apart from its paint (lib/hit-target).
 *
 * - `md` — the form field (40px, compact 32).
 * - `sm` — the toolbar field (32px, compact 28): the `--control-sm` rung that
 *   Button `sm`, Toggle and Pill `lg` share, so filters + search + actions in
 *   one row are one height.
 * - `xs` — the tool-panel field (28px, compact 24), Input `xs`'s inset surface:
 *   no outline, `panel-field` fill. A layers-panel filter, not a page toolbar.
 *
 * Kept as literal strings so Tailwind's source scan generates every class.
 */
const SIZES = {
	md: {
		field: "h-(--control-md) ps-9 pe-9",
		icon: "start-3 text-sm",
		clear: "end-2",
		button: undefined,
	},
	sm: {
		field: "h-(--control-sm) ps-8 pe-8",
		icon: "start-2.5 text-sm",
		clear: "end-1",
		button: cn("size-[calc(var(--control-sm)-var(--spacing)*2)] [--button-icon:0.875rem]", hitTargetMin),
	},
	xs: {
		field: cn("h-(--control-xs) ps-6 pe-7", FIELD_SHELL_XS),
		icon: "start-1.5 text-xs",
		clear: "end-0.5",
		button: cn("size-[calc(var(--control-xs)-var(--spacing))] [--button-icon:0.75rem]", hitTargetMin),
	},
} satisfies Record<SearchInputSize, { field: string; icon: string; clear: string; button: string | undefined }>

export interface SearchInputProps
	extends Omit<ComponentPropsWithRef<"input">, "onChange" | "value" | "defaultValue" | "size"> {
	/**
	 * Which rung of the control ladder the field stands on — the same names as
	 * Input, Select and Combobox. `md` is the form field. `sm` is the toolbar
	 * field: it shares `--control-sm` with Pill `lg` and Button `sm`, so a row
	 * of filter chips beside the search is one height. `xs` is the inset
	 * tool-panel field, Input `xs`'s surface. The magnifier and clear button
	 * scale and stay centred at every rung. The native numeric `size` attribute
	 * is omitted; the field's width comes from `className`.
	 * @default "md"
	 */
	size?: SearchInputSize
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
	size = "md",
	ref,
	type,
	...props
}: SearchInputProps) {
	const rung = SIZES[size]
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
				className={cn("pointer-events-none absolute text-muted-foreground", rung.icon)}
			/>
			<input
				ref={ref}
				type={type ?? "search"}
				value={current}
				onChange={(event) => change(event.target.value)}
				placeholder={placeholder}
				className={cn(
					"flex w-full text-foreground",
					// The shell Input and CommandMenuTrigger wear too — lib/field-shell.
					// xs layers the inset tool-panel surface over it, as Input xs does.
					FIELD_SHELL,
					FIELD_INVALID,
					rung.field,
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
				<span className={cn("absolute flex motion-appear", rung.clear)}>
					{/* Sable's own icon button, not a hand-sized <button>: the hit area,
					    focus ring, press and disabled fade follow the control ladder with
					    every other icon button. Muted ink until hovered, so the X never
					    out-shouts the query it clears. */}
					<Button
						variant="ghost"
						size="icon-xs"
						onClick={handleClear}
						aria-label="Clear search"
						className={cn("text-muted-foreground hover:text-foreground", rung.button)}
					>
						<Icon name="xmark" />
					</Button>
				</span>
			) : null}
		</div>
	)
}
SearchInput.displayName = "SearchInput"
