/**
 * The field shell — what makes a box read as "a text field you type into".
 *
 * Input, SearchInput and CommandMenuTrigger all wear it. The trigger is a
 * <button>, not an input, but it stands in for a search field in a header, so
 * it has to look exactly like one: the same soft-square corner, the same
 * `border-input` outline on the card surface, the same 2px focus ring, the
 * same disabled fade. Before this lived in one place the docs header carried a
 * hand-copied version that had already drifted to a third look (a borderless
 * `bg-muted` chip) — every class a valid token, so no lint rule could see it.
 *
 * Deliberately NOT in here: height (each caller picks a rung of the control
 * ladder), padding (each caller makes room for its own affordances), type
 * (callers read `useTypeTier()`), and the `aria-invalid` treatment (a button
 * cannot be invalid). Placeholder ink is in, because `placeholder:` is inert
 * on an element without a placeholder.
 *
 * Kept as literal strings so Tailwind's source scan generates every class.
 */
export const FIELD_SHELL =
	"rounded-sm border border-input bg-card motion-interactive placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

/** The field's error treatment, for the elements that can be invalid. */
export const FIELD_INVALID =
	"aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30"

/**
 * The compact field on the property-grid rung (`size="xs"`): an inset fill with
 * no border, lifting a step on hover. Input, SelectTrigger, ComboboxInput /
 * ComboboxChips and ScrubField all sit on this rung in the same panel, so they
 * are the same shape holding different content. Four hand copies of it had
 * already drifted (Input's had no hover step). Height and padding stay with
 * each caller, as for FIELD_SHELL; the focus ring is FIELD_SHELL's or the
 * caller's own.
 *
 * The hover is a fixed panel step because this rung only lives in a workspace
 * panel, whose surface is known.
 */
// design-lint-disable-next-line surface-hover -- the xs rung is only used inside workspace panels, a known surface
export const FIELD_SHELL_XS = "rounded-xs border-transparent bg-canvas hover:bg-panel-raised"
