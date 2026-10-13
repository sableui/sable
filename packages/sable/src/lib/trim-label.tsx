import { Children, isValidElement } from "react"
import type { ReactNode } from "react"

/**
 * trimLabel — optically centre a control's text label inside its fixed height.
 *
 * The problem: a control centred with `align-items: center` centres its LINE
 * BOX, and a line box is ascent-to-descent — not the band of glyphs the eye
 * actually reads. Because a font's ascent-above-cap and descent-below-baseline
 * are not symmetric, centring the line box lands the visible letters off centre
 * by however lopsided that font happens to be. Measured on a 40px control at
 * 14px/600/1.25: Helvetica sits a full 1px high, Segoe UI ~0.13px, Verdana
 * ~0.06px.
 *
 * That spread is the reason this is not fixed with `padding-top: 1px`. A nudge
 * tuned to one face is wrong for the next one, and Sable ships a different face
 * per theme (Figtree, Instrument Sans, Inter, …), so a hardcoded correction is
 * guaranteed to be wrong for most of them.
 *
 * `text-box-trim` fixes it at the source: it trims the box to cap-height on top
 * and the alphabetic baseline on the bottom, so centring the box centres the
 * band that reads. It is derived from the font's own metrics, so it is right for
 * every face without tuning.
 *
 * Why a wrapper element is unavoidable: `text-box-trim` acts on the first and
 * last formatted LINES of a block container. A flex container has no line boxes
 * of its own — its children are flex items — so the property is completely inert
 * when set on the control itself. Verified, and it is a silent inertness: the
 * declaration is valid, `CSS.supports()` returns true, and nothing moves. Text
 * children of a flex container become ANONYMOUS flex items, which CSS cannot
 * target, so the text has to be given a real element to carry the trim.
 *
 * Only text is wrapped. Element children — icons, spinners, badges — stay their
 * own flex items so the control's `gap` keeps spacing them as before. Wrapping
 * every child in one span would collapse icon and label into a single item and
 * silently kill that gap.
 *
 * The trim itself is applied by the `sable-label-trim` class, which is declared
 * inside an `@supports` block in `styles.css` — so on a browser without
 * `text-box` (Firefox, at time of writing) this is an inert span and rendering
 * is byte-identical to before.
 */
export function trimLabel(children: ReactNode): ReactNode {
	// Fast path: a bare string/number label, which is the overwhelming majority.
	if (typeof children === "string" || typeof children === "number") {
		return <span className="sable-label-trim">{children}</span>
	}
	if (children == null || typeof children === "boolean") return children
	if (isValidElement(children)) return children

	// Adjacent text is ONE label. JSX splits `All ({count})` into four children
	// ("All (", 12, ")"), and wrapping each made four flex items, so the control's
	// gap pulled them apart into "All ( 12 )". Runs of text and numbers join into
	// one span; elements between them stay their own items.
	const out: ReactNode[] = []
	let run: (string | number)[] = []
	let wrapped = false
	const flush = () => {
		if (!run.length) return
		wrapped = true
		out.push(
			<span className="sable-label-trim" key={`label-${out.length}`}>
				{run.join("")}
			</span>,
		)
		run = []
	}
	for (const child of Children.toArray(children)) {
		if (typeof child === "string" || typeof child === "number") run.push(child)
		else {
			flush()
			out.push(child)
		}
	}
	flush()
	// Nothing textual to trim — hand back the original so we don't churn the tree.
	return wrapped ? out : children
}
