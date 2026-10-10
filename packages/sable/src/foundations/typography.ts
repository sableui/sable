import type { Foundation } from "./types"

const typography: Foundation = {
	slug: "typography",
	title: "Typography",
	summary:
		"Type is a closed vocabulary of paired utilities. Each one bundles size, weight, line-height and tracking, and is picked by role rather than by size.",
	headline: "6 families · 8 everyday tiers · 2 text colors · 1 utility per text node",
	vocabularies: [
		{
			title: "The everyday set",
			note: "Product UI is built almost entirely from these eight. Reach outside them on purpose.",
			terms: [
				{ name: "text-heading-1", value: "36px · 600", use: "The page title. Exactly one per route." },
				{ name: "text-heading-2", value: "28px · 600", use: "A major section of the page." },
				{ name: "text-title-lg", value: "16px · 600", use: "Names a component: card, dialog, sheet, list row." },
				{ name: "text-title-sm", value: "14px · 600", use: "Names a dense component: compact card, table section." },
				{ name: "text-body-md", value: "15px · 400", use: "The default paragraph, description and help text." },
				{ name: "text-body-sm", value: "13px · 400", use: "Secondary copy and table cells." },
				{ name: "text-label-lg", value: "14px · 600", use: "Buttons, field labels, tabs." },
				{ name: "text-caption", value: "12px · 400", use: "Timestamps, footnotes, meta rows." },
			],
		},
		{
			title: "The six families",
			note: "Every tier belongs to one family, and the family is the decision. Size follows from it.",
			terms: [
				{ name: "Display  display-lg…4xl", value: "48–120px · 700–800", use: "Type as image: landing heroes, campaign numbers. Never in product chrome; never two per view." },
				{ name: "Heading  heading-1…4", value: "36 / 28 / 22 / 18px · 600", use: "The document outline (h1–h4). Keep the order; never skip a level to get a size." },
				{ name: "Title  title-lg · title-sm", value: "16 / 14px · 600", use: "Names a UI part without claiming a document heading." },
				{ name: "Body  body-lg/md/sm/xs", value: "17 / 15 / 13 / 12px · 400", use: "Reading text. -lg is the lede (carries text-wrap: pretty); -xs is a dense-UI floor, not a prose size." },
				{ name: "Label  label-lg/md/sm · caption", value: "14 / 12 / 11px · 600; caption 12 · 400", use: "Functional, scannable text of one to three words. Caption is also the group-label tier: nav sections, menu groups." },
				{ name: "Mono  mono-xl/lg/md/caption/sm", value: "28 / 20 / 13 / 12 / 11px · tabular", use: "Numbers that are the content, IDs, hashes, code, aligned figures." },
			],
		},
		{
			title: "Text color",
			terms: [
				{ name: "text-foreground", value: "full contrast", use: "Primary text: headings, body, values." },
				{ name: "text-muted-foreground", value: "secondary contrast (AA on every surface)", use: "Supporting text: descriptions, captions, meta, placeholders." },
			],
		},
	],
	rules: [
		{
			rule: "One paired utility per text node. Compose it with a color and margin only.",
			why: "Each utility is a tuned set of size, weight, leading and tracking. Splitting it into text-* + font-* + tracking-* breaks the tuning and every theme override of it.",
			enforcedBy: "sable-lint: decomposed-type",
		},
		{
			rule: "Pick the tier by role, not by the size it renders at.",
			why: "A card title is title-lg even when body-lg is the same size: role fixes the weight (600 vs 400) and the rhythm around it.",
		},
		{
			rule: "Two text colors: foreground and muted-foreground.",
			why: "Both are contrast-tested against every surface in every theme. A third grey, or an opacity step, is untested contrast.",
		},
		{
			rule: "One heading-1 per route; headings descend without skipping levels.",
			why: "The heading outline is how screen-reader users navigate a page. Restyle with a tier rather than jumping a level for its size.",
		},
		{
			rule: "Hierarchy comes from a clear jump (heading → title → body), then weight and space, before size.",
			why: "Two sizes one step apart read as the same level. Space and weight separate levels more cheaply than another size.",
		},
		{
			rule: "Cap reading text at --measure-prose (65ch).",
			why: "Past roughly 75 characters the eye loses the line return. A wide region can still hold a 65ch column.",
		},
		{
			rule: "Numbers that must align use a mono tier (tabular figures).",
			why: "Proportional digits change width as values update, so totals and columns shimmy.",
		},
		{
			rule: "text-wrap: balance on headings, pretty on ledes, neither on long prose.",
			why: "balance evens short headlines; pretty only refuses a one-word last line. Both cost layout work that long prose does not repay.",
		},
		{
			rule: "A mark attached to a line of type (a dot, a bullet, a timeline marker, a leading icon) sits in a box one line tall (h-[1lh] items-center) and is sized in em.",
			why: "1lh is the line-height of the text beside it, so the mark centres on that line in every tier, density and theme. A px size with a mt-[3px] nudge is right for one font at one size and wrong everywhere else.",
		},
	],
	noGos: [
		{
			never: "Opacity on text (text-foreground/60, opacity-70 on a paragraph).",
			instead: "text-muted-foreground.",
			why: "An alpha step over an unknown surface has unknown contrast, and it shifts per theme.",
			enforcedBy: "sable-lint: text-opacity",
		},
		{
			never: "A hand-picked size, weight or tracking (text-[15px], font-medium, tracking-wide).",
			instead: "The paired utility for the role.",
			why: "Off-vocabulary type cannot be retuned by a theme or the customizer, so it drifts the moment either changes.",
			enforcedBy: "sable-lint: decomposed-type",
		},
		{
			never: "Uppercase in product chrome: nav and menu group labels, page eyebrows, table headers, section titles.",
			instead: "Sentence-case text-caption or text-label-md in muted-foreground; hierarchy from size, weight and space.",
			why: "Tracked capitals spread across a UI read as shouting and slow word recognition. The eyebrow tier (label-xs / overline) is an editorial accent: at most one per marketing view.",
		},
		{
			never: "Display tiers inside product UI, or two display sizes in one view.",
			instead: "heading-1 for a page title; mono-xl for a metric.",
			why: "Display is type as image. In chrome it competes with the content it is supposed to frame.",
		},
		{
			never: "Justified text, or reading copy below body-sm.",
			instead: "Ragged-right at body-md; body-xs only for dense data.",
			why: "Justification opens rivers on the web, which has no hyphenation control; 12px prose fails people with low vision.",
		},
		{
			never: "A new font family, or raw font-feature-settings / font-variation-settings.",
			instead: "The theme's sans, mono and optional display; font-variant-numeric and font-weight.",
			why: "Raw axis tags silently do nothing on a fallback font, and every theme declares a fallback stack.",
		},
	],
	details: [
		{
			title: "Steady numbers",
			before: '<span className="text-body-md">{price}</span>',
			after: '<span className="text-mono-md">{price}</span>',
			why: "Mono tiers set tabular-nums, so a ticking value stops nudging its neighbors sideways.",
		},
		{
			title: "Optically centred labels",
			before: "<button className=\"h-(--control-md) px-4 items-center\">Save</button>",
			after: "<Button>Save</Button>  {/* label wrapped in .sable-label-trim */}",
			why: "text-box: trim-both cap alphabetic centres the cap-height band the eye reads, not the line box. Measured: Helvetica otherwise sits a full 1px high on a 40px control.",
		},
		{
			title: "A marker centred on its line",
			before: '<span className="mt-[5px] size-2 rounded-full bg-primary" />',
			after: '<span className="flex h-[1lh] items-center"><span className="size-[0.5em] rounded-full bg-primary" /></span>',
			why: "The wrapper is exactly one line of the adjacent text tall, so the dot centres on the first line whatever the tier; em sizing keeps it in proportion when the type scales. Stepper indicator=\"dot\" is built this way.",
		},
		{
			title: "Balanced headings",
			before: '<h2 className="text-heading-2">Ship faster with fewer review rounds</h2>',
			after: '<h2 className="text-heading-2 text-balance">Ship faster with fewer review rounds</h2>',
			why: "Evens line lengths so a two-line heading does not end on a single orphaned word.",
		},
		{
			title: "Secondary text without opacity",
			before: '<p className="text-foreground/60">Updated 2m ago</p>',
			after: '<p className="text-caption text-muted-foreground">Updated 2m ago</p>',
			why: "muted-foreground is contrast-tested on every surface; a 60% alpha is not.",
		},
	],
	related: ["spacing", "accessibility", "sable token typography", "sable token typographyOverrides"],
}

export default typography
