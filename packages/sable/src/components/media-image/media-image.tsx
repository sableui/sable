"use client";

import { Avatar as Base } from "@base-ui/react/avatar"
import { type ComponentProps, type ComponentPropsWithRef, type ReactNode, useState } from "react"
import { cn } from "../../lib/cn"
import { GradientArt } from "../gradient-art"

type ImageStatus = "idle" | "loading" | "loaded" | "error"

export interface MediaImageProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
	/** Image URL. Omitted, empty, or failing to load ⇒ the fallback shows. */
	src?: string
	/**
	 * Alt text. Defaults to `""` (decorative) — right when a visible title sits
	 * beside the image, as on a tile or a row. When it is set and no image shows,
	 * it names the fallback instead, so the description survives a broken URL.
	 */
	alt?: string
	/**
	 * Seeds the fallback art, so an item keeps its own colour wherever it
	 * appears. Defaults to `alt`; pass the title or an id when `alt` is empty.
	 */
	seed?: string | number
	/**
	 * Replaces the GradientArt fallback — a glyph, a monogram, a brand colour.
	 * It fills the frame, under the same clipping.
	 */
	fallback?: ReactNode
	/**
	 * `cover` (default) crops to fill — artwork, photos. `contain` letterboxes on
	 * the muted surface — a logo, a product shot that must not be cropped.
	 */
	fit?: "cover" | "contain"
	/** `srcSet` / `sizes` for responsive images, passed to the `<img>`. */
	srcSet?: string
	sizes?: string
	/** @default "lazy" — media grids are long, and a tile below the fold can wait. */
	loading?: "lazy" | "eager"
}

/**
 * MediaImage — an image that falls back to theme art when it has none.
 *
 *   <AspectBox ratio={1} className="rounded-md">
 *     <MediaImage src={album.cover} seed={album.title} />
 *   </AspectBox>
 *
 * It fills the box it is given (`size-full`), so the box owns the shape: an
 * AspectBox for a cover, `size-14 rounded-md` for a row's thumbnail.
 *
 * **Loading is Base UI's, not a second implementation.** The image status comes
 * from the same Base UI Avatar parts Avatar uses: the URL is preloaded off the
 * DOM and the `<img>` mounts only once it has decoded, so an error that fires
 * before hydration is still caught — the reason a plain `onError` misses broken
 * images on prerendered pages. Avatar's frame is a circle with a size ladder and
 * an initials tier; a cover is none of those, so this composes the primitive
 * rather than restyling Avatar out of its shape.
 *
 * **Three states, three surfaces.** No `src` (or a failed one) is GradientArt
 * seeded by the item, so a grid of missing covers still reads as distinct
 * things. While a real image is loading the frame stays a quiet muted surface
 * — painting the art first would flash a colourful stand-in for a frame and
 * then swap it for the photo. Once loaded, the image fades in.
 */
export function MediaImage({
	src,
	alt = "",
	seed,
	fallback,
	fit = "cover",
	srcSet,
	sizes,
	loading = "lazy",
	className,
	...props
}: MediaImageProps) {
	// Keyed by src: a new URL starts loading again rather than inheriting the
	// previous one's "error" (which would flash the art) or "loaded".
	const [tracked, setTracked] = useState<{ src?: string; status: ImageStatus }>({ src, status: "idle" })
	const status: ImageStatus = !src ? "error" : tracked.src === src ? tracked.status : "idle"
	const showFallback = status === "error"
	// With no <img> on screen the alt text has nowhere to live; the frame carries
	// it instead, exactly as Avatar does, so a broken URL is not a silent hole.
	const named = status !== "loaded" && alt ? { role: "img" as const, "aria-label": alt } : null

	return (
		<Base.Root
			render={<div />}
			data-slot="media-image"
			data-status={status}
			className={cn("relative block size-full overflow-hidden bg-muted", className)}
			{...named}
			// Rendered as a <div> (the art inside is block content), so the div
			// props are right; Base UI's types only know its default <span>.
			{...(props as ComponentProps<typeof Base.Root>)}
		>
			{src ? (
				<Base.Image
					src={src}
					srcSet={srcSet}
					sizes={sizes}
					alt={alt}
					loading={loading}
					decoding="async"
					onLoadingStatusChange={(next) => setTracked({ src, status: next })}
					className={cn("size-full motion-fade", fit === "contain" ? "object-contain" : "object-cover")}
				/>
			) : null}
			{showFallback ? (
				<div data-slot="media-image-fallback" aria-hidden className="absolute inset-0">
					{fallback ?? <GradientArt seed={seed ?? (alt || undefined)} className="size-full" />}
				</div>
			) : null}
		</Base.Root>
	)
}
MediaImage.displayName = "MediaImage"
