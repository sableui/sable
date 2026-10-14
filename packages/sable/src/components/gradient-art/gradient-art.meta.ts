import type { ComponentMeta } from "../../lib/meta"

export const gradientArtMeta: ComponentMeta = {
	name: "GradientArt",
	summary:
		"Placeholder artwork painted by a static WebGL shader from the preset's own art direction (the --art-* tokens: palette, ground, warp, softness, grain) — Ember burns, Prism airbrushes, Meridian is grainy monochrome — with a CSS gradient underneath for prerendered pages and browsers without WebGL2.",
	status: "beta",
	keywords: ["gradient", "mesh gradient", "grain", "shader", "artwork", "placeholder image", "cover", "banner", "avatar fallback", "generative"],
	usage: {
		description:
			"Use GradientArt where a real image belongs but none exists yet, or where the image is decoration: a product cover before upload, a profile banner, an album tile, an avatar with no photo. It reads the theme's own tokens, so it follows every preset, mode and live edit; `seed` fixes each item's composition so a list of covers or avatars stays individually recognisable.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Pass a stable `seed` per item — the name for an avatar, the title for a cover. Each item then keeps the same art across renders, reloads and themes, which is what lets someone recognise it.",
			},
			{
				guidance: "do",
				description:
					"Size it with layout classes (`aspect-[4/3]`, `h-20`, `size-10 rounded-full`) and put any glyph or initials inside as children; they render above the art.",
			},
			{
				guidance: "do",
				description:
					"Keep the default `mesh` for covers, tiles and avatars. Reach for `grain` where a printed, tactile surface suits — a banner, a hero card — and keep one variant per surface type so art reads as a system.",
			},
			{
				guidance: "dont",
				description:
					"Do not put body text over it. The art spans the palette's lightest and most saturated tones, so no single ink is guaranteed to clear contrast across it; reserve overlays for a short label on a scrim or an avatar's initials.",
			},
			{
				guidance: "dont",
				description:
					"Do not pass colours, and reach for `tones` rarely. The art follows the preset's --art-* tokens on purpose; to change how a product's art looks, set the --theme-art-* hooks in its theme or preset, so every cover, banner and avatar changes together.",
			},
			{
				guidance: "dont",
				description:
					"Do not use it as a page or hero background. It paints at the element's pixel size, so a full-viewport instance costs a large frame on every theme change; it is sized for covers, banners and tiles.",
			},
		],
	},
	related: { components: ["Avatar", "Card", "AspectBox"] },
	props: [
		{ name: "variant", type: '"mesh" | "grain"', default: '"mesh"', description: "mesh: soft spots of colour pulled together by gentle waves. grain: glowing light over deep corners with a printed texture." },
		{
			name: "tones",
			type: '("info" | "3" | "2" | "1" | "warning")[]',
			description: "Paint these `--tone-*` colours instead of the preset's art palette. Leave unset to follow the preset's art direction.",
		},
		{ name: "seed", type: "string | number", description: "Fixes the composition: the same seed paints the same art in every theme. Pass a stable id." },
		{ name: "children", type: "ReactNode", description: "Rendered above the art — initials, a glyph, a short label." },
		{ name: "className", type: "string", description: "Size and shape: aspect, height, rounding." },
	],
	variants: { variant: ["mesh", "grain"] },
	tokensUsed: ["art-1", "art-2", "art-3", "art-4", "art-5", "art-6", "art-ground", "art-warp", "art-softness", "art-grain", "primary", "tone-info", "tone-3", "tone-2", "tone-1", "tone-warning"],
	motion: [
		{
			slot: "arrival",
			recipe: "motion-interactive",
			part: "canvas",
			why: "The shader frame fades in over the CSS gradient it replaces, so the swap from fallback to shader reads as the art settling rather than a flash.",
		},
		{ slot: "response", recipe: "none", part: "root", why: "Artwork, not a control: it does not react to the pointer." },
		{
			slot: "transition",
			recipe: "custom",
			part: "canvas",
			why: "A theme change repaints the frame in place on the next animation frame; there are no states to move between.",
		},
		{ slot: "activity", recipe: "none", part: "root", why: "Static by design: nothing animates between paints, so it costs nothing while idle and respects reduced motion without a branch." },
	],
	a11y: [
		"Decorative by default: the canvas is aria-hidden. When the art stands for something (an avatar), label the element that contains it, not the art.",
		"Children render above the art in the normal reading order, so initials or a label are announced as usual.",
	],
	examples: [
		{ label: "Product cover", code: '<GradientArt seed="Untitled (gold rush)" className="aspect-[4/3] rounded-lg" />' },
		{ label: "Grain banner", code: '<GradientArt variant="grain" seed="juno" tones={["info", "1"]} className="h-20 rounded-md" />' },
		{
			label: "Avatar with initials",
			code: '<GradientArt seed="Mara Okafor" className="grid size-10 place-items-center rounded-full text-label-md text-overlay-foreground">MO</GradientArt>',
		},
	],
}
