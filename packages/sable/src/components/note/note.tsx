import type { VariantProps } from "class-variance-authority"
import type { ComponentPropsWithRef, ReactNode } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { STATUS_TONE_ICON, type StatusTone } from "../../lib/status-tone"
import { noteVariants } from "./note.variants"

type NoteTone = StatusTone

/**
 * Ink for the action, per tone. It follows the icon's tone rather than the
 * body's, so the remedy reads as belonging to the severity — except `neutral`,
 * whose icon is `muted-foreground`: quiet is right for a glyph and wrong for
 * the only interactive thing in the box.
 */
const toneAction: Record<NoteTone, string> = {
	info: "text-tone-info",
	warning: "text-tone-warning",
	success: "text-success",
	destructive: "text-destructive",
	neutral: "text-foreground",
}

/**
 * A Note's remedy, as data rather than as a slot.
 *
 * Deliberately NOT `ReactNode`. A Note is quiet supporting information, and the
 * moment the action is a free slot it becomes a `<Button>` — which is how a
 * near-background `secondary` fill ends up punched into a tone tint, and how the
 * remedy ends up outweighing the sentence explaining it. Passing a label and a
 * handler means the callout owns placement, weight, ink and motion, and there is
 * no styling decision left to get wrong.
 */
export interface NoteAction {
	/** The remedy as a verb phrase — "Unload chat model", never "Click here". */
	label: string
	/** Handler for a button-shaped action. Ignored when `href` is set. */
	onClick?: () => void
	/** Render as a link to somewhere instead of an in-place action. */
	href?: string
}

export interface NoteProps
	extends ComponentPropsWithRef<"div">,
		VariantProps<typeof noteVariants> {
	/** Optional bold lead-in rendered above the body (text-title-sm). */
	title?: string
	/**
	 * Override the tone's leading glyph. A string swaps just the icon NAME
	 * (keeping the tone's color); a ReactNode fully replaces the rendered
	 * glyph; `null` removes it; omit to keep the tone's default — so a neutral
	 * Note can show a `lock` callout without inventing a new severity.
	 */
	icon?: string | ReactNode | null
	/**
	 * A single remedy the reader can act on, rendered below the body and aligned
	 * to the text column. One only — a callout with two actions is a decision
	 * point, which is a Dialog's job.
	 */
	action?: NoteAction
}

/** A callout / admonition box. The tone carries severity; the leading icon matches. */
export function Note({
	tone = "info",
	title,
	icon,
	action,
	className,
	children,
	...props
}: NoteProps) {
	const resolved = tone ?? "info"
	const { name, className: iconClassName } = STATUS_TONE_ICON[resolved]
	const glyph =
		icon === undefined ? (
			<Icon name={name} className={cn("text-base", iconClassName)} />
		) : icon === null ? null : typeof icon === "string" ? (
			<Icon name={icon} className={cn("text-base", iconClassName)} />
		) : (
			icon
		)
	// The glyph sits in a box exactly one line tall in the type of the line it
	// leads (the title's when there is one, else the body's), so it centres on
	// that first line at any type scale or density — not on a fixed nudge.
	const leadingIcon = glyph ? (
		<span
			data-slot="note-icon"
			className={cn("flex h-[1lh] shrink-0 items-center", title ? "text-title-sm" : "text-body-sm")}
		>
			{glyph}
		</span>
	) : null
	return (
		<div
			role="note"
			className={cn(noteVariants({ tone: resolved }), className)}
			{...props}
		>
			{leadingIcon}
			<div className="min-w-0 flex-1">
				{title ? <p className="text-title-sm">{title}</p> : null}
				<div className={cn(title && "mt-1")}>{children}</div>
				{action ? <NoteActionControl action={action} tone={resolved} /> : null}
			</div>
		</div>
	)
}
Note.displayName = "Note"

/**
 * The remedy control. Typographic rather than a button: it sits in the callout's
 * voice, aligned to the text column so it reads as the sentence's next move, and
 * `mt-2` keeps it tethered to the copy instead of floating in the box's padding.
 *
 * Two decisions worth stating, because both were wrong on the first pass:
 *
 * - **The chevron only appears for `href`.** A right chevron means *navigate* or
 *   *disclose*; an `onClick` remedy ("Unload chat model") does neither, so the
 *   glyph promised a destination that did not exist. It is true for a link and
 *   false for an action, and it used to render for both.
 * - **The underline is at rest, not on hover.** It says *interactive*, which is
 *   true of both shapes, without claiming *navigates*, which is true of one. It
 *   also has to be there: with the glyph gone, a `neutral` Note's action carries
 *   `text-foreground` — the same ink as the body — so tone alone distinguished
 *   nothing, and the control leaned entirely on color in a system whose own rule
 *   is that color is never the sole signal. Hover thickens it rather than
 *   introducing it, so the rest state is doing real work.
 */
function NoteActionControl({
	action,
	tone,
}: {
	action: NoteAction
	tone: NoteTone
}) {
	const className = cn(
		"mt-2 inline-flex items-center gap-0.5 rounded-sm text-label-sm",
		toneAction[tone],
		"underline underline-offset-4 decoration-1 hover:decoration-2",
		"motion-interactive motion-press",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
	)
	if (action.href) {
		return (
			<a href={action.href} className={className}>
				{action.label}
				<Icon name="chevron-right" className="text-sm" />
			</a>
		)
	}
	return (
		<button type="button" onClick={action.onClick} className={className}>
			{action.label}
		</button>
	)
}
