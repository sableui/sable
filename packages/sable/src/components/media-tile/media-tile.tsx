"use client";

import { useRender } from "@base-ui/react/use-render"
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react"
import { AspectBox } from "../../layout/AspectBox"
import { cn } from "../../lib/cn"
import { MediaImage } from "../media-image"
import {
	mediaTileInsetVariants,
	mediaTileSubtitleVariants,
	mediaTileTitleVariants,
	mediaTileVariants,
} from "./media-tile.variants"

type MediaTileSize = "sm" | "md" | "lg"

/** Named cover shapes. A number is a width / height ratio. */
const ASPECT = { square: 1, video: 16 / 9, poster: 2 / 3 } as const

export interface MediaTileProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
	/** The item's name. Also seeds the fallback art when it is a string. */
	title: ReactNode
	/** The second line — an artist, a channel, a price. Optional. */
	subtitle?: ReactNode
	/** Cover image URL. Without one (or when it fails) the cover is GradientArt seeded by the item. */
	src?: string
	/**
	 * Cover alt text. Defaults to `""`: the title right below already names the
	 * item, so describing the cover again makes a screen reader say it twice.
	 */
	alt?: string
	/** Seeds the fallback art. Defaults to `title` when it is a string. */
	seed?: string | number
	/**
	 * The cover's shape: `square` (albums, podcasts, playlists), `video` (16:9),
	 * `poster` (2:3 — films, books), or any width / height ratio.
	 * @default "square"
	 */
	aspect?: keyof typeof ASPECT | number
	/** Type tier, gaps and corner together. @default "md" */
	size?: MediaTileSize
	/**
	 * Where the tile goes. The title becomes the tile's link, stretched over the
	 * whole tile, so a click anywhere on it — cover included — follows it.
	 */
	href?: string
	/**
	 * The title link's element, for a router: `render={<Link to="/albums/1" />}`.
	 * Takes precedence over `href`.
	 */
	render?: useRender.RenderProp
	/** Makes the subtitle its own link (an artist page) — a separate tab stop above the tile's. */
	subtitleHref?: string
	/** The subtitle link's element, for a router: `subtitleRender={<Link to="/artists/2" />}`. */
	subtitleRender?: useRender.RenderProp
	/**
	 * An action over the cover's bottom-end corner — usually a play Button. It
	 * rests hidden on hover-capable devices and appears on hover or focus
	 * (`reveal-on-hover`); touch devices always show it. Name it for the item:
	 * "Play Low tide", not "Play".
	 */
	action?: ReactNode
	/**
	 * A small static label on the cover's top-start corner — a duration, "New",
	 * "Explicit". Use `<Badge appearance="overlay">` so it reads on any image.
	 */
	badge?: ReactNode
	/**
	 * The title's element. A tile in a titled section can be a heading the next
	 * level down, so screen-reader users can move tile to tile.
	 * @default "p"
	 */
	titleAs?: "h2" | "h3" | "h4" | "h5" | "p"
	/** Native image loading. `eager` for the first row above the fold. @default "lazy" */
	loading?: "lazy" | "eager"
}

/** A link built from `href` or a render prop. Its own component so the hook is always called. */
function TileLink({
	href,
	render,
	className,
	children,
}: {
	href?: string
	render?: useRender.RenderProp
	className: string
	children: ReactNode
}) {
	return useRender({
		render: render ?? <a href={href} />,
		props: { className, children },
		defaultTagName: "a",
	}) as ReactElement
}

/**
 * MediaTile — cover first, then the title and a subtitle: an album in a grid, a
 * video in a feed, a podcast, a product, a photo in a gallery.
 *
 *   <MediaTile title="Low tide, high noon" subtitle="Juno Avery" src={cover}
 *     render={<Link to="/albums/low-tide" />} subtitleRender={<Link to="/artists/juno" />}
 *     action={<Button size="icon" aria-label="Play Low tide, high noon"><Icon name="play" variant="solid" /></Button>} />
 *
 * **The whole tile is a link without wrapping it in one.** A tile holds a
 * second link (the artist) and a button (play), and interactive content cannot
 * nest — so instead of an `<a>` around everything, the TITLE is the link and its
 * `stretched-link` overlay covers the tile. The subtitle link and the action sit
 * above that overlay, so each is its own control: one click target per thing,
 * three tab stops, and the screen-reader name of the tile's link is its title,
 * not the whole card read as one sentence.
 *
 * **Tab order is title → subtitle → action.** The text comes first in the DOM
 * and the cover is drawn above it with `order`, so focus moves the way a
 * reader names the item — what it is, who made it, then what to do with it.
 */
export function MediaTile({
	title,
	subtitle,
	src,
	alt,
	seed,
	aspect = "square",
	size = "md",
	href,
	render,
	subtitleHref,
	subtitleRender,
	action,
	badge,
	titleAs: TitleTag = "p",
	loading,
	className,
	...props
}: MediaTileProps) {
	const linked = href != null || render != null
	const subtitleLinked = subtitleHref != null || subtitleRender != null
	const ratio = typeof aspect === "number" ? aspect : ASPECT[aspect]
	// Truncated text keeps its full string one hover away.
	const titleText = typeof title === "string" ? title : undefined

	return (
		<div
			data-slot="media-tile"
			data-size={size}
			className={cn(
				mediaTileVariants({ size }),
				mediaTileInsetVariants({ size }),
				"[--stretched-link-radius:var(--media-tile-radius)]",
				className,
			)}
			{...props}
		>
			<div className="flex min-w-0 flex-col gap-0.5">
				<TitleTag title={titleText} className={mediaTileTitleVariants({ size })}>
					{linked ? (
						<TileLink
							href={href}
							render={render}
							// No ring of its own: `stretched-link` draws focus around the
							// whole tile, since the whole tile is what this link is.
							className="stretched-link motion-interactive"
						>
							{title}
						</TileLink>
					) : (
						title
					)}
				</TitleTag>
				{subtitle != null ? (
					subtitleLinked ? (
						<TileLink
							href={subtitleHref}
							render={subtitleRender}
							className={cn(
								mediaTileSubtitleVariants({ size }),
								// Raised over the stretched overlay, so it is its own target.
								// `self-start` keeps the hit area to the words, not the column.
								"relative z-10 max-w-full self-start rounded-xs motion-interactive hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
							)}
						>
							{subtitle}
						</TileLink>
					) : (
						<p className={mediaTileSubtitleVariants({ size })}>{subtitle}</p>
					)
				) : null}
			</div>

			<AspectBox
				ratio={ratio}
				data-slot="media-tile-cover"
				// Drawn first, read last: see "Tab order" above.
				className="order-first rounded-(--media-tile-radius)"
			>
				<MediaImage src={src} alt={alt} seed={seed ?? titleText} loading={loading} />
				{linked || action != null ? (
					// The tile answers the pointer and the keyboard alike: a light scrim
					// deepens the cover so the action reads over any artwork. Hover only
					// where the device can hover — on touch a tap would leave it stuck on.
					<span
						aria-hidden
						className="pointer-events-none absolute inset-0 bg-overlay/25 opacity-0 motion-interactive group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
					/>
				) : null}
				{badge != null ? (
					<div
						data-slot="media-tile-badge"
						// Above the overlay to be seen; click-through so the cover still opens the tile.
						className="pointer-events-none absolute start-(--media-tile-inset) top-(--media-tile-inset) z-10 flex"
					>
						{badge}
					</div>
				) : null}
				{action != null ? (
					<div
						data-slot="media-tile-action"
						// A soft drop shadow on the slot, not the control: the action sits on
						// arbitrary art, and a play button in the brand colour over art in
						// the same hue (Ember's fire) needs an edge that is not its fill.
						className="reveal-on-hover absolute end-(--media-tile-inset) bottom-(--media-tile-inset) z-10 flex drop-shadow-md [--reveal-offset:calc(var(--spacing)*1)]"
					>
						{action}
					</div>
				) : null}
			</AspectBox>
		</div>
	)
}
MediaTile.displayName = "MediaTile"
