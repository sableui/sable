import type { ComponentPropsWithRef, ReactNode } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import { Progress, ProgressTrack } from "../progress"
import {
	attachmentMediaVariants,
	attachmentVariants,
} from "./attachment.variants"

export interface AttachmentProps
	extends Omit<ComponentPropsWithRef<"div">, "onClick"> {
	/**
	 * File name. When it runs out of room the stem truncates and the extension
	 * stays (`quarterly-repo….pdf`), because the extension is what tells the
	 * reader what kind of file it is.
	 */
	name: string
	/** Size, type, or upload progress text — the quiet second line. */
	meta?: ReactNode
	/**
	 * Image preview URL. Present ⇒ the card shows a crop of the file instead of
	 * a glyph, which is the only useful label a photo has.
	 */
	thumbnail?: string
	/** Semantic icon name for a non-image file. @default "file" */
	icon?: string
	/**
	 * Shape. `card` for documents (name-led row), `media` for images (a tile that
	 * is mostly picture).
	 * @default "card"
	 */
	variant?: "card" | "media"
	/**
	 * Transfer state. `uploading` shows a determinate bar when `progress` is a
	 * number and an indeterminate one when it is not; `error` re-colors the card
	 * without changing its shape, so a failed upload stays recognisable.
	 * @default "idle"
	 */
	status?: "idle" | "uploading" | "error"
	/** Percentage 0–100. Omit while uploading for an indeterminate bar. */
	progress?: number
	/** Remove / retry / download controls. Stay clickable when the card is a trigger. */
	actions?: ReactNode
	/**
	 * Makes the whole card activate. Rendered as a real `<button>` stretched over
	 * the card rather than by wrapping it — see the note in the component.
	 */
	onOpen?: () => void
	/** Label for that stretched trigger. @default `Open ${name}` */
	openLabel?: string
}

/**
 * Attachment — a file or image attached to a message.
 *
 * Covers the four states an attachment actually moves through — queued,
 * uploading, failed, delivered — because a component that only renders the
 * delivered state pushes the other three back onto every caller, and they are
 * the states that are hard to get right.
 *
 *   <Attachment name="proposal.pdf" meta="2.4 MB · PDF" onOpen={() => open(file)}
 *     actions={<Button size="icon-xs" variant="ghost" aria-label="Remove"><Icon name="xmark" /></Button>} />
 *
 *   <Attachment variant="media" name="cover.png" thumbnail={url}
 *     status="uploading" progress={62} meta="Uploading…" />
 *
 * **The full-card trigger is a stretched button, not a wrapper.** Wrapping the
 * card in a `<button>` would nest the remove/retry controls inside it, which is
 * invalid HTML, unreachable by keyboard in the order it looks like, and
 * activates the card when you meant to activate the control. Instead the
 * trigger is an absolutely-positioned button covering the card, and the actions
 * sit above it in the stacking order — so the card is one tab stop, each action
 * is its own, and clicking an action never opens the file.
 */
export function Attachment({
	name,
	meta,
	thumbnail,
	icon,
	variant = "card",
	status = "idle",
	progress,
	actions,
	onOpen,
	openLabel,
	className,
	children,
	...props
}: AttachmentProps) {
	const glyph = icon ?? (thumbnail ? "image-stack" : "file")
	// Split off a short extension so only the stem truncates. A dotfile
	// (".env") or a long tail after the last dot is not an extension.
	const dot = name.lastIndexOf(".")
	const hasExtension = dot > 0 && name.length - dot <= 6
	const stem = hasExtension ? name.slice(0, dot) : name
	const extension = hasExtension ? name.slice(dot) : ""
	const isMedia = variant === "media"
	const tier = useTypeTier()
	// The label sits ABOVE the stretched trigger in the stacking order, so it
	// would swallow the clicks meant for it — but only when there is a trigger.
	// Without one, killing pointer events would also kill text selection on a
	// filename people copy.
	const textLayer = onOpen ? "pointer-events-none" : undefined

	return (
		<div
			data-status={status}
			className={cn(
				attachmentVariants({ variant, status, interactive: Boolean(onOpen) }),
				className,
			)}
			{...props}
		>
			{onOpen ? (
				// z-0 keeps this a local stacking concern inside the card's own
				// `isolate`, not a bid in the global layer order.
				<button
					type="button"
					onClick={onOpen}
					// ring-inset: the card clips its overflow (for the thumbnail and the
					// corner), so an outward ring on this full-bleed button was clipped
					// away entirely and keyboard focus showed nothing.
					className="absolute inset-0 z-0 cursor-pointer rounded-[var(--attachment-radius,var(--radius-md))] motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
				>
					<span className="sr-only">{openLabel ?? `Open ${name}`}</span>
				</button>
			) : null}

			<div className={cn(attachmentMediaVariants({ variant }))}>
				{thumbnail ? (
					// On a media tile the picture IS the label — there is no adjacent
					// filename to read. On a card it sits next to one, so describing it
					// again would just make AT say the name twice.
					<img
						src={thumbnail}
						alt={isMedia ? name : ""}
						className="size-full object-cover"
						loading="lazy"
					/>
				) : (
					<Icon name={glyph} className={isMedia ? "text-2xl" : "text-lg"} />
				)}
			</div>

			{isMedia ? (
				/* On a media tile the name would cover the picture, so it only appears
				   when there is something to say — a size, an upload state, an error.
				   `bg-overlay` rather than a themed surface: this ink sits on arbitrary
				   imagery, not on a theme surface, and has to stay legible over both. */
				meta || status !== "idle" ? (
					<div
						className={cn(
							"absolute inset-x-0 z-10 bg-overlay px-2 py-1",
							// Clear the progress bar (h-1) on the same edge rather than
							// letting it paint over the bottom of the text.
							status === "uploading" ? "bottom-1" : "bottom-0",
							textLayer,
						)}
					>
						<p
							className={cn(
								"truncate text-overlay-foreground",
								tier.secondary,
							)}
						>
							{meta ?? name}
						</p>
					</div>
				) : null
			) : (
				<div className={cn("z-10 min-w-0 flex-1", textLayer)}>
					<p
						data-slot="attachment-name"
						title={name}
						className={cn("flex min-w-0 text-foreground", tier.body)}
					>
						<span className="truncate">{stem}</span>
						{extension ? <span className="shrink-0">{extension}</span> : null}
					</p>
					{meta ? (
						// Truncated normally — a size and a type are recognisable from
						// their first few characters. NOT on error: the reason is the
						// only thing telling the reader whether to retry or pick a
						// different file, and "Upload failed — over the 50 MB l…" is
						// exactly the half of the sentence that does not help.
						<p
							className={cn(
								tier.secondary,
								status === "error"
									? "text-destructive"
									: "truncate text-muted-foreground",
							)}
						>
							{meta}
						</p>
					) : null}
					{status === "uploading" ? (
						// In the text column, under the meta it measures — not along
						// the card's bottom edge. On the edge the corner curve clipped
						// the bar at rounder settings, and the track, read against
						// whatever the card sits on, made the card look cut off.
						<Progress
							value={progress ?? null}
							aria-label={`Uploading ${name}`}
							className="mt-1.5 w-full"
						>
							<ProgressTrack className="h-1" />
						</Progress>
					) : null}
				</div>
			)}

			{actions ? (
				// On a media tile the picture fills the box, so in-flow actions were
				// pushed below it and clipped away. They float on the top-end corner
				// instead — pass `variant="floating"` buttons so they read on any image.
				<div
					className={cn(
						"z-10 flex shrink-0 items-center gap-1",
						isMedia ? "absolute end-1 top-1" : "relative",
					)}
				>
					{actions}
				</div>
			) : null}

			{isMedia && status === "uploading" ? (
				<Progress
					value={progress ?? null}
					aria-label={`Uploading ${name}`}
					className="pointer-events-none absolute inset-x-0 bottom-0 z-10 w-full"
				>
					<ProgressTrack className="h-1 rounded-none bg-muted" />
				</Progress>
			) : null}

			{children}
		</div>
	)
}
Attachment.displayName = "Attachment"
