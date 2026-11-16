/**
 * Pointer-target classes for controls whose DRAWN box is smaller than the target
 * a pointer needs.
 *
 * WCAG 2.5.8 (AA, 2.2) asks for 24x24 CSS px, and measures it **at rest** — a
 * target that grows on hover is one nobody can aim at, because the growth
 * happens after the aim. Sable has three places where the honest visual size is
 * below that floor and should stay there: the Tree disclosure (`--tree-column`
 * is 20px comfortable, 18px compact), a toast's dismiss control, and any icon
 * button tuned to sit inside a dense row. Growing the drawn box is the wrong fix
 * in each — Tree's column is also its indent step, so a bigger button pushes
 * every name in the tree one column right, and a bigger dismiss glyph makes the
 * loudest thing in a toast the way to get rid of it.
 *
 * So the target and the paint come apart. A centred pseudo-element takes the
 * hit; the element keeps its own size. A pseudo-element of a button is part of
 * that button's hit area, costs no DOM, and — being absolutely positioned — takes
 * no space in the flex row it sits in.
 *
 * Sized from `--control-xs` rather than a literal 24px, for two reasons. It is
 * the floor of the control ladder (28px comfortable, 24px compact), so the
 * target is never under the standard and never taller than the row it sits in,
 * in either register. And it moves with the ladder: a future register that
 * retunes `--control-xs` retunes these targets with it, instead of leaving a
 * hardcoded 24 behind to be found by an audit.
 *
 * Centring is symmetric, so `left-1/2` + `-translate-x-1/2` is correct in RTL
 * too — deliberately physical rather than logical, since mixing a logical inset
 * with a physical translate is what breaks under `dir="rtl"`.
 *
 * This lives in one place because the same idiom in five components drifts in
 * five directions, and a target that quietly reverts to the glyph box is exactly
 * the kind of regression nobody sees in review. It is asserted per component.
 */
export const hitTargetMin =
	"relative before:absolute before:left-1/2 before:top-1/2 before:size-(--control-xs) before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"

/**
 * `hitTargetMin`, grown to 44x44 under a coarse pointer — the touch floor the
 * accessibility foundation promises ("Hit area 44×44px"). A literal 44px, like
 * the `hit-target` utility and for the same reason: the WCAG touch floor is not
 * a control-ladder height, and a density scope must never shrink it.
 *
 * Only for a control that stands ALONE: a dialog's close, a banner's dismiss, a
 * code block's copy, a carousel's prev/next arrows. Two of these side by side would overlap by up to 20px, and
 * the later one in source order would take taps aimed at the visible box of the
 * earlier one — worse than a small target. Controls packed in a row (a Tree's
 * disclosures one row apart, chips, pagination numbers, calendar days, carousel
 * dots) keep `hitTargetMin`; their pitch, not their slop, sets their target.
 */
export const hitTargetTouch = `${hitTargetMin} pointer-coarse:before:size-[44px]`
