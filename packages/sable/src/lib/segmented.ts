/**
 * The segmented control — a capsule track holding a row of fixed-size options,
 * one of which is filled. ToggleGroup `appearance="segmented"` and
 * ThemeSwitcher both wear it, so there is one segmented look in Sable rather
 * than a private one per component (ThemeSwitcher used to carry its own copy).
 *
 * Every size is on the spacing scale, so the track, its inset and its options
 * move together under density. A glide that travels between options must step
 * by `SEGMENTED_STEP` (option + gap), never by a fixed rem.
 *
 * Kept as literal strings so Tailwind's source scan generates every class.
 *
 * Corners follow the theme's control shape, `--button-radius`, the same value
 * Button wears: a capsule in Sable, square in Meridian, 4px in Prism, 12px in
 * Poppy. The track used to be `rounded-full` everywhere, so a square theme
 * still got a pill switcher beside its square buttons.
 */

/** The options' corners: the track's, less its border and inset (1px + 2px), so the curves stay concentric. */
export const SEGMENTED_INNER_RADIUS = "rounded-[max(0px,calc(var(--button-radius,9999px)-3px))]"

/** The track. `w-fit`: a row of fixed-size options must never stretch in a flex column. */
export const SEGMENTED_TRACK =
	"relative inline-flex w-fit flex-row items-center gap-0.5 rounded-[var(--button-radius,9999px)] border border-border bg-card p-0.5"

/**
 * One option's box: `size-7` square for an icon, growing with `px-2` for a short
 * label. On a coarse pointer the box itself grows to the 44px touch floor. A
 * `hit-target` slop cannot do this here: options sit side by side, so each slop
 * would take the taps meant for its neighbour.
 */
export const SEGMENTED_ITEM =
	"relative z-10 inline-flex h-7 min-w-7 items-center justify-center pointer-coarse:h-11 pointer-coarse:min-w-11 rounded-[max(0px,calc(var(--button-radius,9999px)-3px))] text-muted-foreground motion-interactive motion-press hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

/** The filled state of the chosen option. */
export const SEGMENTED_ITEM_ON = "bg-accent text-accent-foreground hover:text-accent-foreground"

/** The gliding fill of a fixed-size option: the option's own box, at both sizes. */
export const SEGMENTED_GLIDER_SIZE = "size-7 pointer-coarse:size-11"

/**
 * Sets `--segment-step`, one option plus the gap after it — the distance a
 * gliding fill moves per option. `size-7` + `gap-0.5` = 7.5 spacing units, and
 * `size-11` + `gap-0.5` = 11.5 on a coarse pointer.
 */
export const SEGMENTED_STEP = "[--segment-step:calc(var(--spacing)*7.5)] pointer-coarse:[--segment-step:calc(var(--spacing)*11.5)]"
