import type { ComponentPropsWithRef } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"

export interface VideoProps
	extends Omit<ComponentPropsWithRef<"video">, "controls" | "poster" | "src"> {
	/** Video source URL. When omitted, a poster/placeholder with a play overlay renders. */
	src?: string
	/** Poster image shown before playback (and as the placeholder backdrop). */
	poster?: string
	/** Show native playback controls. Defaults to true. */
	controls?: boolean
	/**
	 * Placeholder only (no `src`): makes the play mark a real button that calls
	 * this — e.g. to load the source. Without it the mark is decorative, and
	 * nothing on the frame pretends to be pressable.
	 */
	onRequestPlay?: () => void
}

/**
 * The play mark sits ON media, so it takes the overlay pair — the tokens built
 * to stay legible over any image — not the page's background/foreground.
 */
const PLAY_MARK =
	"flex size-14 items-center justify-center rounded-full bg-overlay/85 text-overlay-foreground shadow-sm"

/**
 * A styled video player frame. Renders a rounded, bordered media surface with a
 * 16:9 aspect ratio. With a `src`, it mounts a native `<video>` (controls on by
 * default). Without a `src`, it shows the `poster` (or an empty media backdrop)
 * behind a centered play overlay — a real button when `onRequestPlay` is set,
 * a decorative mark otherwise. The `<video>` props (event handlers, `muted`, …)
 * only apply once there is a `src` to play; the placeholder has no element
 * for them.
 */
export function Video({
	src,
	poster,
	controls = true,
	onRequestPlay,
	className,
	...props
}: VideoProps) {
	return (
		<div
			className={cn(
				"relative aspect-video overflow-hidden rounded-lg border border-border bg-overlay",
				className,
			)}
		>
			{src ? (
				<video
					className="size-full"
					controls={controls}
					poster={poster}
					src={src}
					{...props}
				/>
			) : (
				<div className="size-full">
					{poster ? (
						<img
							src={poster}
							alt=""
							className="size-full object-cover"
						/>
					) : null}
					<div className="absolute inset-0 flex items-center justify-center">
						{onRequestPlay ? (
							// design-lint-disable-next-line raw-button -- an on-media play disc: it needs the overlay token pair and a 56px circle, and no Button variant or size offers either (Button has no overlay variant yet)
							<button
								type="button"
								aria-label="Play video"
								onClick={onRequestPlay}
								className={cn(PLAY_MARK, "cursor-pointer motion-interactive motion-press hover:bg-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")}
							>
								<Icon name="play" variant="solid" className="translate-x-px text-xl" />
							</button>
						) : (
							<div aria-hidden className={PLAY_MARK}>
								<Icon name="play" variant="solid" className="translate-x-px text-xl" />
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
Video.displayName = "Video"
