# MediaTile

**Status:** beta

A cover-first tile — square, 16:9 or poster artwork with an optional play-style action over it, then a title and a subtitle that can each be links — that is one link as a whole without nesting its other controls inside one.

**Keywords:** album, album art, cover, tile, media card, video thumbnail, podcast, playlist, gallery, product tile, poster, grid item, play button, music

## Usage

The item in a media grid or shelf: an album, a playlist, a video, a podcast, a film, a photo, a product. The cover leads and carries the weight; the title and subtitle sit underneath without a card around them. The whole tile follows the title's link, the subtitle can link somewhere else (the artist, the channel), and an action — usually play — floats over the cover's corner, revealed on hover and focus and always shown on touch. A missing or broken cover becomes GradientArt seeded by the title, so a grid of items without artwork still reads as distinct things.

### Best practices

- Do: Lay tiles out with `Grid` (`<Grid minItemWidth="10rem">`) or a horizontal `Scroller` for a shelf. The tile fills its cell; the grid decides the width.
- Do: Pass `render={<Link to="…" />}` (or `href`) for where the tile goes, and `subtitleRender` / `subtitleHref` for a second destination. Each stays a separate control; never wrap the tile in your own link.
- Do: Name the action for its item — `aria-label="Play Low tide, high noon"`, not "Play". A grid of twenty identical "Play" buttons is unusable from a screen reader's list of controls.
- Do: Use `titleAs="h3"` when the tiles sit under a section heading, so screen-reader users can move tile to tile by heading.
- Don't: Do not build this from `Card render={<Link />}`. A card that is a link cannot hold a second link or a button — interactive content cannot nest — which is exactly what a media tile needs.
- Don't: Do not put more than one action on the cover. A second control over the art is a toolbar on a thumbnail; move secondary actions (add to queue, share) into an OverflowMenu in the action slot or onto the item's page.
- Don't: Do not use it for a framed commerce card with a price and a buy button — that is ProductCardBlock — or for a person, which is an Avatar.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Cover | yes | An AspectBox holding MediaImage: the image, or GradientArt seeded by the title. Drawn first, read last. |
| Title | yes | The item's name. When the tile links, this is the link, stretched over the whole tile. |
| Subtitle | no | The second line. Optionally its own link, raised above the stretched one. |
| Action | no | One control over the cover's bottom-end corner — usually play. Revealed on hover and focus; always visible on touch. |
| Badge | no | A static label over the cover's top-start corner — a duration, "New". Click-through. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | ReactNode | — | The item's name. Seeds the fallback art when it is a string. |
| subtitle | ReactNode | — | The second line — an artist, a channel, a year. |
| meta | ReactNode | — | Lines under the subtitle, in its muted type: a price beside its sale price, a count of finishes, a status Badge. A wrapping block, where the subtitle is one truncated line. Use it for a product tile instead of building one. |
| src | string | — | Cover image URL. Without one, or when it fails, the cover is GradientArt seeded by the item. |
| srcSet | string | — | Responsive cover candidates, passed to the `<img>`. |
| sizes | string | — | The cover's layout width for `srcSet`, e.g. `"(min-width: 64rem) 25vw, 50vw"`. |
| alt | string | "" | Cover alt text. Empty by default: the title below already names the item. |
| seed | string \| number | — | Seeds the fallback art. Defaults to `title` when it is a string. |
| position | CSSProperties["objectPosition"] | "center" | Which part of the cover the crop keeps — CSS `object-position`, forwarded to the cover's MediaImage: `"50% 30%"` for a face, `"top"` for a poster's title. Store it with the image when each one frames differently. |
| aspect | "square" \| "video" \| "poster" \| number | "square" | The cover's shape: square (albums, podcasts), video (16:9), poster (2:3 — films, books), or any width / height ratio. |
| size | "sm" \| "md" \| "lg" | "md" | Moves the type tier, the cover-to-text gap, the corner and the overlay inset together. |
| href | string | — | Where the tile goes. The title becomes the link, stretched over the whole tile. |
| render | useRender.RenderProp | — | The title link's element, for a router: `render={<Link to="/albums/1" />}`. Takes precedence over `href`. |
| subtitleHref | string | — | Makes the subtitle its own link — a separate tab stop above the tile's. |
| subtitleRender | useRender.RenderProp | — | The subtitle link's element, for a router. |
| action | ReactNode | — | One control over the cover's bottom-end corner, usually a play Button. Hidden until hover or focus on hover-capable devices; always shown on touch. |
| badge | ReactNode | — | A static label on the cover's top-start corner — `<Badge appearance="overlay">`. |
| titleAs | "h2" \| "h3" \| "h4" \| "h5" \| "p" | "p" | The title's element. A heading one level below the section's lets screen-reader users move tile to tile. |
| loading | "lazy" \| "eager" | "lazy" | Native image loading. `eager` for the first row above the fold. |
| ...div props | Omit<ComponentPropsWithRef<"div">, "title"> | — | Spread onto the root. |

## Variants

- **size**: sm, md, lg
- **aspect**: square, video, poster

## Tokens used

`foreground`, `muted-foreground`, `muted`, `overlay`, `ring`

## Motion

- **arrival** · Cover · `motion-fade` — The cover image fades in over a quiet surface once it decodes, so a grid loading on a slow connection settles tile by tile instead of popping.
- **response** · Cover · `motion-interactive` — Hovering the tile deepens the cover with a light scrim and lifts the action in (`reveal-on-hover`), so it is clear the whole tile is one target and where its action is.
- **transition** · root · _no motion_ — A tile has no states of its own to move between; the action carries any (play / pause).
- **activity** · root · _no motion_ — Nothing runs inside a tile; a now-playing indicator belongs to the player, not the grid.

## Accessibility

- No nested interactive content: the title is the tile's link, and its `stretched-link` overlay covers the tile, while the subtitle link and the action sit above it as separate controls.
- Tab order is title → subtitle → action. The text comes first in the DOM and the cover is drawn above it with CSS `order`, so focus follows how a reader names the item.
- Focusing the title link rings the whole tile, rounded like the cover, because the whole tile is what the link is; the subtitle link and the action ring themselves.
- The action is hidden with opacity only, and only where the device can hover; it stays in the tab order and the accessibility tree, appears when anything in the tile has focus, and is always visible on touch.
- The cover is decorative by default (`alt=""`), since the title names the item; the fallback art is aria-hidden.
- Truncated titles keep their full text in the link's accessible name and in a `title` tooltip.

## Related

- Components: MediaImage, GradientArt, Grid, AspectBox, Card, Scroller

## Examples

### Product tile

```tsx
import { Badge, Grid, MediaTile } from "@sableui/react"
// <Link> = your router's link (react-router, next/link, @tanstack/router, …)

<Grid minItemWidth="14rem" gap={4}>
	{products.map((product) => (
		<MediaTile
			key={product.id}
			aspect={4 / 5}
			title={product.name}
			subtitle={product.material}
			src={product.image}
			srcSet={product.imageSet}
			sizes="(min-width: 64rem) 25vw, 50vw"
			render={<Link to={`/products/${product.slug}`} />}
			badge={product.isNew ? <Badge appearance="overlay">New</Badge> : undefined}
			meta={
				<>
					<span className="text-foreground">{formatPrice(product.price)}</span>
					<span>{product.finishes.length} finishes</span>
				</>
			}
		/>
	))}
</Grid>
```

### Album grid

```tsx
import { Button, Grid, Icon, MediaTile } from "@sableui/react"
// <Link> = your router's link (react-router, next/link, @tanstack/router, …)

<Grid minItemWidth="10rem" gap={3}>
	{albums.map((album) => (
		<MediaTile
			key={album.id}
			title={album.title}
			subtitle={album.artist}
			src={album.cover}
			render={<Link to={`/albums/${album.id}`} />}
			subtitleRender={<Link to={`/artists/${album.artistId}`} />}
			action={
				<Button size="icon" aria-label={`Play ${album.title}`} onClick={() => play(album)}>
					<Icon name="play" variant="solid" />
				</Button>
			}
		/>
	))}
</Grid>
```

### Video tile with a duration

```tsx
import { Badge, MediaTile } from "@sableui/react"

<MediaTile
	aspect="video"
	title="Building a synth from scratch"
	subtitle="Undertow Sessions · 2 days ago"
	src={video.thumbnail}
	href={`/watch/${video.id}`}
	badge={<Badge appearance="overlay">12:04</Badge>}
/>
```

### Gallery, no links

```tsx
import { Grid, MediaTile } from "@sableui/react"

<Grid minItemWidth="8rem" gap={2}>
	{photos.map((photo) => (
		<MediaTile key={photo.id} size="sm" title={photo.caption} src={photo.url} alt={photo.description} />
	))}
</Grid>
```

### Portfolio grid with crop focus

```tsx
import { Grid, MediaTile } from "@sableui/react"

<Grid minItemWidth="16rem" gap={4}>
	{projects.map((project) => (
		<MediaTile
			key={project.slug}
			aspect="video"
			title={project.title}
			subtitle={project.client}
			src={project.thumbnail}
			position={project.focus}
			href={`/work/${project.slug}`}
		/>
	))}
</Grid>
```

### Poster shelf

```tsx
import { MediaTile } from "@sableui/react"

<MediaTile aspect="poster" size="lg" titleAs="h3" title="The Long Dark" subtitle="2026 · Drama" href="/films/the-long-dark" />
```
