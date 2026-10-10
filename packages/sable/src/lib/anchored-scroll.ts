/**
 * Overflow classes for anchored (positioner-backed) popup surfaces.
 *
 * Base UI's Positioner measures the room between the anchor and the collision
 * boundary and publishes it on the positioner element as `--available-height`.
 * A popup that caps against that value re-measures for free when the popup
 * flips side, when the anchor moves, and when the window resizes — a fixed
 * `max-h` is wrong at every viewport but one.
 *
 * The failure this prevents is invisible, which is why it belongs in one place:
 * an uncapped popup taller than the screen simply runs off it, and the rows past
 * the fold read as "that is the whole list" rather than "there is more". A
 * *capped* surface that does not scroll is the same bug wearing a different hat,
 * so the cap and the overflow always ship together.
 *
 * `scrollbar-quiet` because a popup is a small surface floating over the work,
 * and the platform's default scrollbar — arrow buttons and all — is wider than
 * the popup's own padding and louder than anything in it. `overscroll-contain`
 * so a wheel gesture that reaches the end of the list stops there instead of
 * chaining into the page behind the popup.
 *
 * The cap goes on the **popup**, not the positioner: `max-height` is a
 * border-box measure, so the popup's own border and padding are inside the
 * space the positioner measured.
 */
export const anchoredScroll =
	"max-h-[var(--available-height)] overflow-y-auto overscroll-contain scrollbar-quiet"

/**
 * The same, for listbox popups that prefer a shorter resting height than the
 * whole gap (Select, Combobox): 18rem, but never more than the room
 * actually there. `min()` collapses to `--available-height` on a short viewport,
 * which is the case the bare `max-h-[18rem]` got wrong.
 */
export const anchoredListScroll =
	"max-h-[min(18rem,var(--available-height))] overflow-y-auto overscroll-contain scrollbar-quiet"
