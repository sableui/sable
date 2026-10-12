import type { ComponentMeta } from "../../lib/meta"

export const mediaTileMeta: ComponentMeta = {
	name: "MediaTile",
	summary:
		"A cover-first tile — square, 16:9 or poster artwork with an optional play-style action over it, then a title and a subtitle that can each be links — that is one link as a whole without nesting its other controls inside one.",
	status: "beta",
	keywords: [
		"album",
		"album art",
		"cover",
		"tile",
		"media card",
		"video thumbnail",
		"podcast",
		"playlist",
		"gallery",
		"product tile",
		"poster",
		"grid item",
		"play button",
		"music",
	],
	usage: {
		description:
			"The item in a media grid or shelf: an album, a playlist, a video, a podcast, a film, a photo, a product. The cover leads and carries the weight; the title and subtitle sit underneath without a card around them. The whole tile follows the title's link, the subtitle can link somewhere else (the artist, the channel), and an action — usually play — floats over the cover's corner, revealed on hover and focus and always shown on touch. A missing or broken cover becomes GradientArt seeded by the title, so a grid of items without artwork still reads as distinct things.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Lay tiles out with `Grid` (`<Grid minItemWidth=\"10rem\">`) or a horizontal `Scroller` for a shelf. The tile fills its cell; the grid decides the width.",
			},
			{
				guidance: "do",
				description:
					"Pass `render={<Link to=\"…\" />}` (or `href`) for where the tile goes, and `subtitleRender` / `subtitleHref` for a second destination. Each stays a separate control; never wrap the tile in your own link.",
			},
			{
				guidance: "do",
				description:
					"Name the action for its item — `aria-label=\"Play Low tide, high noon\"`, not \"Play\". A grid of twenty identical \"Play\" buttons is unusable from a screen reader's list of controls.",
			},
			{
				guidance: "do",
				description:
					"Use `titleAs=\"h3\"` when the tiles sit under a section heading, so screen-reader users can move tile to tile by heading.",
			},
			{
				guidance: "dont",
				description:
					"Do not build this from `Card render={<Link />}`. A card that is a link cannot hold a second link or a button — interactive content cannot nest — which is exactly what a media tile needs.",
			},
			{
				guidance: "dont",
				description:
					"Do not put more than one action on the cover. A second control over the art is a toolbar on a thumbnail; move secondary actions (add to queue, share) into an OverflowMenu in the action slot or onto the item's page.",
			},
			{
				guidance: "dont",
				description:
					"Do not use it for a framed commerce card with a price and a buy button — that is ProductCardBlock — or for a person, which is an Avatar.",
			},
		],
		anatomy: [
			{ name: "Cover", required: true, description: "An AspectBox holding MediaImage: the image, or GradientArt seeded by the title. Drawn first, read last." },
			{ name: "Title", required: true, description: "The item's name. When the tile links, this is the link, stretched over the whole tile." },
			{ name: "Subtitle", required: false, description: "The second line. Optionally its own link, raised above the stretched one." },
			{ name: "Action", required: false, description: "One control over the cover's bottom-end corner — usually play. Revealed on hover and focus; always visible on touch." },
			{ name: "Badge", required: false, description: "A static label over the cover's top-start corner — a duration, \"New\". Click-through." },
		],
	},
	related: { components: ["MediaImage", "GradientArt", "Grid", "AspectBox", "Card", "Scroller"] },
	props: [
		{ name: "title", type: "ReactNode", description: "The item's name. Seeds the fallback art when it is a string." },
		{ name: "subtitle", type: "ReactNode", description: "The second line — an artist, a channel, a year." },
		{ name: "src", type: "string", description: "Cover image URL. Without one, or when it fails, the cover is GradientArt seeded by the item." },
		{ name: "alt", type: "string", default: '""', description: "Cover alt text. Empty by default: the title below already names the item." },
		{ name: "seed", type: "string | number", description: "Seeds the fallback art. Defaults to `title` when it is a string." },
		{
			name: "aspect",
			type: '"square" | "video" | "poster" | number',
			default: '"square"',
			description: "The cover's shape: square (albums, podcasts), video (16:9), poster (2:3 — films, books), or any width / height ratio.",
		},
		{ name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Moves the type tier, the cover-to-text gap, the corner and the overlay inset together." },
		{ name: "href", type: "string", description: "Where the tile goes. The title becomes the link, stretched over the whole tile." },
		{ name: "render", type: "useRender.RenderProp", description: "The title link's element, for a router: `render={<Link to=\"/albums/1\" />}`. Takes precedence over `href`." },
		{ name: "subtitleHref", type: "string", description: "Makes the subtitle its own link — a separate tab stop above the tile's." },
		{ name: "subtitleRender", type: "useRender.RenderProp", description: "The subtitle link's element, for a router." },
		{ name: "action", type: "ReactNode", description: "One control over the cover's bottom-end corner, usually a play Button. Hidden until hover or focus on hover-capable devices; always shown on touch." },
		{ name: "badge", type: "ReactNode", description: "A static label on the cover's top-start corner — `<Badge appearance=\"overlay\">`." },
		{ name: "titleAs", type: '"h2" | "h3" | "h4" | "h5" | "p"', default: '"p"', description: "The title's element. A heading one level below the section's lets screen-reader users move tile to tile." },
		{ name: "loading", type: '"lazy" | "eager"', default: '"lazy"', description: "Native image loading. `eager` for the first row above the fold." },
		{ name: "...div props", type: 'Omit<ComponentPropsWithRef<"div">, "title">', description: "Spread onto the root." },
	],
	variants: { size: ["sm", "md", "lg"], aspect: ["square", "video", "poster"] },
	tokensUsed: ["foreground", "muted-foreground", "muted", "overlay", "ring"],
	motion: [
		{
			slot: "arrival",
			recipe: "motion-fade",
			part: "Cover",
			why: "The cover image fades in over a quiet surface once it decodes, so a grid loading on a slow connection settles tile by tile instead of popping.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Cover",
			why: "Hovering the tile deepens the cover with a light scrim and lifts the action in (`reveal-on-hover`), so it is clear the whole tile is one target and where its action is.",
		},
		{ slot: "transition", recipe: "none", part: "root", why: "A tile has no states of its own to move between; the action carries any (play / pause)." },
		{ slot: "activity", recipe: "none", part: "root", why: "Nothing runs inside a tile; a now-playing indicator belongs to the player, not the grid." },
	],
	a11y: [
		"No nested interactive content: the title is the tile's link, and its `stretched-link` overlay covers the tile, while the subtitle link and the action sit above it as separate controls.",
		"Tab order is title → subtitle → action. The text comes first in the DOM and the cover is drawn above it with CSS `order`, so focus follows how a reader names the item.",
		"Focusing the title link rings the whole tile, rounded like the cover, because the whole tile is what the link is; the subtitle link and the action ring themselves.",
		"The action is hidden with opacity only, and only where the device can hover; it stays in the tab order and the accessibility tree, appears when anything in the tile has focus, and is always visible on touch.",
		"The cover is decorative by default (`alt=\"\"`), since the title names the item; the fallback art is aria-hidden.",
		"Truncated titles keep their full text in the link's accessible name and in a `title` tooltip.",
	],
	examples: [
		{
			label: "Album grid",
			code: '<Grid minItemWidth="10rem" gap={3}>\n\t{albums.map((album) => (\n\t\t<MediaTile\n\t\t\tkey={album.id}\n\t\t\ttitle={album.title}\n\t\t\tsubtitle={album.artist}\n\t\t\tsrc={album.cover}\n\t\t\trender={<Link to={`/albums/${album.id}`} />}\n\t\t\tsubtitleRender={<Link to={`/artists/${album.artistId}`} />}\n\t\t\taction={\n\t\t\t\t<Button size="icon" aria-label={`Play ${album.title}`} onClick={() => play(album)}>\n\t\t\t\t\t<Icon name="play" variant="solid" />\n\t\t\t\t</Button>\n\t\t\t}\n\t\t/>\n\t))}\n</Grid>',
		},
		{
			label: "Video tile with a duration",
			code: '<MediaTile\n\taspect="video"\n\ttitle="Building a synth from scratch"\n\tsubtitle="Undertow Sessions · 2 days ago"\n\tsrc={video.thumbnail}\n\thref={`/watch/${video.id}`}\n\tbadge={<Badge appearance="overlay">12:04</Badge>}\n/>',
		},
		{
			label: "Gallery, no links",
			code: '<Grid minItemWidth="8rem" gap={2}>\n\t{photos.map((photo) => (\n\t\t<MediaTile key={photo.id} size="sm" title={photo.caption} src={photo.url} alt={photo.description} />\n\t))}\n</Grid>',
		},
		{
			label: "Poster shelf",
			code: '<MediaTile aspect="poster" size="lg" titleAs="h3" title="The Long Dark" subtitle="2026 · Drama" href="/films/the-long-dark" />',
		},
	],
}
