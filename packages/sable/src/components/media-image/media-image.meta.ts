import type { ComponentMeta } from "../../lib/meta"

export const mediaImageMeta: ComponentMeta = {
	name: "MediaImage",
	summary:
		"An image that fills its box and falls back to GradientArt seeded by the item when it has no source or the source fails — Avatar's image-load tracking, for covers, thumbnails and product shots instead of faces.",
	status: "beta",
	keywords: [
		"image",
		"img",
		"image fallback",
		"broken image",
		"cover art",
		"album art",
		"thumbnail",
		"placeholder image",
		"onError",
		"missing image",
	],
	usage: {
		description:
			"Use MediaImage wherever content imagery may be missing or broken: a cover in a grid, a thumbnail in a row, a product shot. It fills the box it is given — an AspectBox for a cover, a sized and rounded box for a thumbnail — shows a quiet muted surface while the image loads, fades the image in once decoded, and paints GradientArt seeded by the item when there is no image to show, so a grid of missing covers still reads as distinct things. For a person use Avatar; for a whole tile with title and actions use MediaTile, which composes this.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Give the box the shape: `<AspectBox ratio={1} className=\"rounded-md\"><MediaImage … /></AspectBox>`, or `size-14 rounded-md` on MediaImage itself for a thumbnail. It clips to whatever radius the box has.",
			},
			{
				guidance: "do",
				description:
					"Pass `seed` (the title or an id) when `alt` is empty, so the fallback art is the item's own and stays the same in every list it appears in.",
			},
			{
				guidance: "do",
				description:
					"Leave `alt` empty when a visible title sits next to the image — a tile, a row — and describe it when the image stands alone. A set `alt` also names the fallback, so the description survives a broken URL.",
			},
			{
				guidance: "dont",
				description:
					"Do not hand-write `<img onError={() => setBroken(true)}>`. An image that fails before hydration never fires the handler on a prerendered page; MediaImage preloads off the DOM and catches it.",
			},
			{
				guidance: "dont",
				description:
					"Do not use it for profile pictures. A person is a circle with initials — Avatar, whose `variant=\"art\"` is the same fallback with the person's initials over it.",
			},
		],
	},
	related: { components: ["MediaTile", "Avatar", "GradientArt", "AspectBox"] },
	props: [
		{ name: "src", type: "string", description: "Image URL. Omitted, empty or failing to load ⇒ the fallback shows." },
		{
			name: "alt",
			type: "string",
			default: '""',
			description: "Alt text. Empty is decorative — right beside a visible title. When set and no image shows, it names the fallback instead.",
		},
		{ name: "seed", type: "string | number", description: "Seeds the fallback art. Defaults to `alt`; pass the title or an id when `alt` is empty." },
		{ name: "fallback", type: "ReactNode", description: "Replaces the GradientArt fallback — a glyph or monogram. Fills the frame under the same clipping." },
		{
			name: "fit",
			type: '"cover" | "contain"',
			default: '"cover"',
			description: "`cover` crops to fill (artwork, photos); `contain` letterboxes on the muted surface (a logo, a product that must not be cropped).",
		},
		{ name: "srcSet", type: "string", description: "Responsive sources, passed to the `<img>`." },
		{ name: "sizes", type: "string", description: "The `sizes` attribute for `srcSet`." },
		{ name: "loading", type: '"lazy" | "eager"', default: '"lazy"', description: "Native lazy loading. Use `eager` for the first row of a grid above the fold." },
		{ name: "className", type: "string", description: "Sizing and rounding when MediaImage is the box itself (`size-14 rounded-md`). Inside an AspectBox it already fills." },
	],
	variants: { fit: ["cover", "contain"] },
	tokensUsed: ["muted", "art-1", "art-2", "art-3", "art-4", "art-5", "art-6", "art-ground"],
	motion: [
		{
			slot: "arrival",
			recipe: "motion-fade",
			part: "image",
			why: "The image fades in over the muted surface once it has decoded, so a slow cover settles in instead of popping row by row as the grid loads.",
		},
		{ slot: "response", recipe: "none", part: "root", why: "Imagery, not a control. The tile or row around it answers the pointer." },
		{ slot: "transition", recipe: "none", part: "root", why: "Its only state change is loading → loaded or failed, which the arrival covers." },
		{ slot: "activity", recipe: "none", part: "root", why: "A loading image rests on a static muted surface; a shimmer per cover across a long grid would be noise." },
	],
	a11y: [
		"`alt` defaults to empty (decorative), because the usual neighbour is a visible title that already names the item; describe the image when it stands alone.",
		"When no image is on screen and `alt` is set, the frame takes `role=\"img\"` with that label, so a broken URL does not erase the description. The fallback art itself is always aria-hidden.",
		"The `<img>` mounts only once it has loaded, so assistive technology never meets a broken-image icon.",
	],
	examples: [
		{ label: "Cover with fallback", code: '<AspectBox ratio={1} className="rounded-md">\n\t<MediaImage src={album.cover} seed={album.title} />\n</AspectBox>' },
		{ label: "No image yet", code: '<AspectBox ratio={1} className="rounded-md">\n\t<MediaImage seed="Low tide, high noon" />\n</AspectBox>' },
		{ label: "Row thumbnail", code: '<MediaImage src={track.art} seed={track.title} className="size-12 shrink-0 rounded-sm" />' },
		{ label: "Logo, never cropped", code: '<AspectBox ratio={16 / 9} className="rounded-lg">\n\t<MediaImage src={brand.logo} alt={brand.name} fit="contain" />\n</AspectBox>' },
	],
}
