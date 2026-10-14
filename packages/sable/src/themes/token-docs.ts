/**
 * Token intent — why each token exists, when to reach for it, and what it is most
 * often confused with.
 *
 * The token *names* were already a contract (`_contract.ts`) and the *values* live
 * in each theme. What was missing is the part an agent actually needs: 116 tokens
 * with names and no stated intent. A name tells you `accent` exists. It does not
 * tell you that `accent`, `secondary` and `muted` are three near-identical
 * surfaces distinguished only by role, or which one a hover state should use.
 *
 * `build-registry` checks this file covers every token group and emits it into
 * `registry.json → tokenDocs`, so the reasoning ships with the catalog rather
 * than living in a contributor's head.
 *
 * ── Rules for writing an entry ───────────────────────────────────────────────
 *
 * - `intent` is what it IS, in one line. Not a restatement of the name.
 * - `whenToUse` must be concrete enough to act on. "For emphasis" is useless;
 *   "the fill behind a selected row in a list" is actionable.
 * - `insteadOf` is the most valuable field and the one to fill first: name the
 *   token it gets wrongly used in place of, and say how to tell them apart.
 *   Almost every real misuse in this library has been a near-miss, not a wild
 *   guess.
 * - `*-foreground` tokens are DERIVED, not written by hand — see
 *   `foregroundDoc()`. Twenty-two hand-written variations on "the ink that must
 *   be legible on X" is twenty-two chances to drift.
 */

export interface TokenDoc {
	/** What the token is, in one line. */
	intent: string
	/** Concretely when to reach for it. */
	whenToUse: string
	/** The token it is most often wrongly used in place of, and how to tell. */
	insteadOf?: string
	/** Tokens it is meaningless without, or must be paired with. */
	pairsWith?: string[]
}

/**
 * Every `X-foreground` is the same idea: ink paired with `X`. The
 * contract is that you never pick ink independently of its surface.
 */
function foregroundDoc(base: string): TokenDoc {
	return {
		intent: `Ink paired with \`${base}\`. Evaluate the rendered contrast together; never choose it independently.`,
		whenToUse: `Whenever the background is \`${base}\`. Use them as a pair — \`bg-${base} text-${base}-foreground\` — so a theme can retune the surface and the ink together.`,
		insteadOf: `\`foreground\`. That is the ink for \`background\` only; on any other surface it is a contrast gamble that happens to pass in the default theme and fails in another.`,
		pairsWith: [base],
	}
}

const SEMANTIC_BASES: Record<string, TokenDoc> = {
	background: {
		intent: "The page. The furthest-back surface in the page register.",
		whenToUse: "The document body, and any surface meant to read as 'the page itself'. Never anything that floats: background is the BOTTOM of the surface stack (background < card < popover in every dark mode), so a floating panel painted with it reads as a hole beneath the cards it hovers over.",
		insteadOf:
			"`popover` for anything floating, `card` for a bounded block on the page. `canvas`. `canvas` is the *work* surface in a tool — the artboard being edited — which is not the page behind the UI. Using `background` for an artboard makes the thing being edited indistinguishable from the chrome around it.",
	},
	card: {
		intent: "A raised content container on the page.",
		whenToUse:
			"A bounded block of related content on a page: an article teaser, a settings group, a stat panel.",
		insteadOf:
			"`popover`. A card sits *in* the document flow; a popover floats above it and needs its own elevation and border treatment. And never inside a docked panel — use `panel` surfaces and `PanelSection`; a card in a 240px panel spends its border and inset on nothing. Never rely on `card` as a FILL to separate something from the page: a preset's `card` can equal `background`, because a card separates by its border. A track, well or pad that must read with no border is `muted`.",
	},
	popover: {
		intent: "A floating surface: menu, popover, tooltip body, select list, dialog, and any persistent floating panel (an inspector, a toolbar over a canvas).",
		whenToUse: "Anything rendered in a layer above the page that needs its own background, dismissible or not. The test is elevation: if it floats over content (`shadow-md` or higher, fixed or absolutely positioned above the page), it is popover. Pair with `text-popover-foreground`.",
		insteadOf:
			"`card` and `background`. The distinction is elevation, not shape or lifetime: a panel that stays open is still floating. `background` is the page ground and `card` sits on it; both read as sunk under a floating panel. In light mode several presets make all three equal, so a floating surface also needs its edge (ring or border) and shadow, never the fill alone.",
	},
	muted: {
		intent: "A recessed surface. Quieter than the page, not interactive.",
		whenToUse:
			"An inset well: a code block background, a disabled field, a read-only region, a table's zebra stripe, a segmented-control track. On the page it always differs from `background`. Inside any OTHER surface (a card, a popover, a floating panel) use the `sable-well` utility instead: it derives the well from the surface it sits in, so it is the same visible step everywhere, whereas `muted` can land within a step of a popover in some dark modes. Never compensate with an outline on every well — that turns a panel into a stack of boxes.",
		insteadOf:
			"`secondary` and `accent`. All three are near-identical in most themes, which is exactly why the rule is by ROLE: `muted` is *recessed and inert*, `secondary` is a *control fill*, `accent` is a *transient state*. Pick by what the surface does, never by which looks right — they diverge in other themes.",
	},
	"muted-foreground": {
		intent: "De-emphasised ink. The single most-used token after `foreground`.",
		whenToUse:
			"Secondary text: captions, helper text, placeholder-adjacent labels, a property name next to its value, timestamps.",
		insteadOf:
			"`foreground` at reduced opacity. Opacity on text compounds unpredictably against whatever is behind it and can fall below the contrast floor; this token is a tuned value that does not.",
		pairsWith: ["background", "card", "muted"],
	},
	border: {
		intent: "The default hairline. Tuned to be subtle.",
		whenToUse: "Input outlines, badge edges, card borders — chrome that should not draw the eye.",
		insteadOf:
			"`border-strong`. Reach for `border-strong` when the line carries *structure* (a grid rule, a table divider, a section separator) and for `border` when it merely bounds a control.",
	},
	"border-strong": {
		intent: "A structural divider. Visibly stronger than `border`.",
		whenToUse: "Grid lines, table rules, separators between major sections.",
		insteadOf:
			"`border`. If removing the line would make the layout ambiguous, it is structural and belongs here.",
	},
	"border-floating": {
		intent: "The edge of a floating surface. Fainter than `border`: the shadow carries the elevation.",
		whenToUse:
			"Every floating surface — popover, menu, select, tooltip, dialog, sheet, toast, a floating panel — as `border-border-floating` or `ring-border-floating`, together with `bg-popover` and a `shadow-md`+ shadow. Derived for every theme (a faint alpha of the foreground); a theme may tune it with `--theme-border-floating`.",
		insteadOf:
			"`border`. A full hairline plus a shadow stacks into a heavy outline around anything that floats. `border` is for resting edges: inputs, cards, badges.",
	},
	input: {
		intent: "The outline of a form control specifically.",
		whenToUse: "Text inputs, textareas and selects. Not the edge of a checkbox, radio or switch — that is `control-border`.",
		insteadOf:
			"`border`. They are often the same value, but a theme is entitled to make form controls read differently from other chrome, and only this token gives it the hook.",
	},
	"control-border": {
		intent: "The resting edge of a control whose outline is the whole control. Held to 3:1 (WCAG 1.4.11) on every surface.",
		whenToUse:
			"An unchecked checkbox, an unselected radio, an off switch track, a selection card's check or radio mark — anywhere removing the edge would make the control disappear.",
		insteadOf:
			"`input`. A text field is also found by its fill, caret and placeholder, so its outline may stay quiet; a checkbox has nothing else, and at `input`'s strength it measures about 1.4:1.",
	},
	ring: {
		intent: "The focus indicator colour.",
		whenToUse: "Only for `focus-visible`. Nothing else.",
		insteadOf:
			"`primary`. Focus must remain distinguishable from selection; if the ring is the same colour as a selected state, a keyboard user cannot tell where focus is.",
	},
	primary: {
		intent: "The one high-emphasis action colour.",
		whenToUse:
			"The single most important action on a surface — one per view. A submit button, the primary CTA.",
		insteadOf:
			"`accent`. `primary` says *do this*; `accent` says *this is the current one*. Two primary buttons on one screen means neither is primary.",
	},
	secondary: {
		intent: "A lower-emphasis control fill.",
		whenToUse: "A secondary button, a segmented control's resting fill, a neutral chip.",
		insteadOf:
			"`muted`. `secondary` is for something you can *press*; `muted` is for a surface that is inert. See the `muted` note — role, not appearance.",
	},
	accent: {
		intent: "A transient state fill: hover, selected, current.",
		whenToUse:
			"The fill behind a hovered menu item, a selected list row, the active segment of a switcher.",
		insteadOf:
			"`primary` for selection, and `muted` for hover. `accent` is the state layer; the other two are emphasis and recession respectively.",
	},
	destructive: {
		intent: "Irreversible or data-losing actions.",
		whenToUse: "Delete, revoke, remove, discard — and the error state of a form field.",
		insteadOf:
			"`tone-warning`. Destructive means *this destroys something*; warning means *be careful*. A confirmation dialog's action is destructive; the banner explaining it is a warning.",
	},
	success: {
		intent: "A confirmed, completed, healthy state.",
		whenToUse: "A passing check, a saved indicator, a healthy status dot.",
		insteadOf:
			"`tone-info`. Success asserts an outcome; info asserts a fact. 'Saved' is success, '3 items' is info.",
	},
	"tone-1": {
		intent:
			"Extra colour 1, the lead of the three a theme defines beyond its status colours. The numbered tones exist so a product can classify content (categories, plans, series) without inventing colours per feature; the product decides what each one means.",
		whenToUse: "The most prominent category in a classified set, or the first series of a chart.",
		insteadOf:
			"`primary`. A tone classifies the *thing*; primary drives an *action*. A category badge is not a button.",
	},
	"tone-2": {
		intent: "Extra colour 2: the second category in a classified set.",
		whenToUse: "A second category, distinct from tone-1, in a badge, dot, card or chart.",
		insteadOf: "`tone-1`. Distinct categories must stay visually distinct.",
	},
	"tone-3": {
		intent: "Extra colour 3: the third, and usually the quietest, category in a classified set.",
		whenToUse: "A third category, or the baseline one that means 'nothing special'.",
		insteadOf:
			"`muted`. A tone is *semantic classification* that a reader is meant to decode; `muted` is de-emphasis. If a legend would help the user, it is a tone.",
	},
	"tone-info": {
		intent: "Domain tone: neutral, factual information.",
		whenToUse: "An informational note or banner, a neutral count, a 'did you know' surface.",
		insteadOf:
			"`success`. Info states a fact; success states an outcome. Also not `primary` — an info banner is not an action.",
	},
	"tone-warning": {
		intent: "Domain tone: proceed with care, nothing is broken yet.",
		whenToUse: "A caution banner, a nearing-limit indicator, a soloed/overridden state in a tool.",
		insteadOf:
			"`destructive`. Warning is *advisory*; destructive is *consequential*. If nothing is lost by continuing, it is a warning.",
	},
	highlight: {
		intent: "A marker on content the user is meant to notice — search hits, diffs, annotations.",
		whenToUse: "Highlighting matched text, a changed line, a called-out passage.",
		insteadOf:
			"`accent`. `accent` is UI state that follows the pointer or selection; `highlight` marks the *content* and persists independently of interaction.",
	},
	overlay: {
		intent: "A scrim over the page behind a modal, and the wash behind media chrome.",
		whenToUse: "Dialog and sheet backdrops, letterboxing, a pill sitting on top of an image.",
		insteadOf:
			"`bg-black/50`. Pure black is never right — it crushes whatever is behind it, and a theme cannot tune it. This token is the sanctioned answer, which is why `raw-black-white` is a lint rule.",
	},
	sidebar: {
		intent:
			"The app sidebar's own surface. Heads a small family (`sidebar-*`) that lets navigation chrome diverge from the page without overriding page tokens.",
		whenToUse: "The `Sidebar` / `SideNav` background.",
		insteadOf:
			"`card`. A sidebar is persistent chrome, not content — a theme frequently wants it a different tone from the cards inside the page it frames.",
	},
	"sidebar-primary": {
		intent: "The high-emphasis colour *within* the sidebar.",
		whenToUse: "The active nav item's fill, when the sidebar has its own tonal world.",
		insteadOf:
			"`primary`. Page primary on a sidebar surface may not clear contrast; this token is tuned against `sidebar`.",
		pairsWith: ["sidebar"],
	},
	"sidebar-accent": {
		intent: "The state layer within the sidebar — hover, current.",
		whenToUse: "Hovered or current nav items.",
		insteadOf: "`accent`, for the same contrast reason as `sidebar-primary`.",
		pairsWith: ["sidebar"],
	},
	"sidebar-border": {
		intent: "Hairlines inside the sidebar.",
		whenToUse: "Dividers between nav sections, and the sidebar's own trailing edge.",
		insteadOf: "`border`, which is tuned against page surfaces.",
		pairsWith: ["sidebar"],
	},
	"sidebar-ring": {
		intent: "Focus indicator inside the sidebar.",
		whenToUse: "`focus-visible` on nav items.",
		insteadOf: "`ring`, which is tuned against page surfaces.",
		pairsWith: ["sidebar"],
	},
}

const WORKSPACE_SURFACES: Record<string, TokenDoc> = {
	canvas: {
		intent: "The WORK surface — the artboard, the document being edited.",
		whenToUse: "Behind the thing the tool operates on. `WorkspaceCanvas` uses it.",
		insteadOf:
			"`background`. The thing being edited is not the page behind the UI, and collapsing the two makes the document indistinguishable from its chrome.",
	},
	panel: {
		intent: "Docked chrome: the surface of a side panel or an inspector.",
		whenToUse: "`Panel`, `WorkspaceBar`, `StatusBar` backgrounds.",
		insteadOf:
			"`card`. Panels are chrome and sit in a deliberately compressed tonal band — see DESIGN.md → Registers. A card's elevation language is wrong here.",
	},
	"panel-raised": {
		intent: "One step up from `panel`: a selected row, a hover fill, a nested well.",
		whenToUse: "Tree row selection, hovered panel rows, and the light square of a checkerboard.",
		insteadOf:
			"`accent`. In a workspace the tonal band is only a few units wide; `accent` is a page-register step and reads as a shout in chrome.",
	},
	"panel-field": {
		intent: "The inset fill of a compact control docked in a panel.",
		whenToUse:
			'The `size="xs"` field rung (Input, SelectTrigger, ScrubField share it) and `<Button variant="field">`. A panel control of your own that should sit among those fields.',
		insteadOf:
			"`canvas`. `canvas` names the work surface, and its step off the panel is too faint to read as a field in dark mode. This one is mixed from the panel itself, so it follows a theme that retunes the panel. Tune it with `--theme-panel-field`.",
		pairsWith: ["panel-field-hover"],
	},
	"panel-field-hover": {
		intent: "The hover step of a `panel-field` control.",
		whenToUse: "`hover:bg-panel-field-hover` on anything filled with `panel-field`.",
		insteadOf:
			"`hover:bg-panel-raised`. A fixed surface token as a hover is what the surface-hover lint rejects; this one is defined against the panel field it steps from.",
		pairsWith: ["panel-field"],
	},
	hairline: {
		intent: "The 1px structural line that carries all separation in tool chrome.",
		whenToUse: "Between panel sections, under a toolbar, above a status bar.",
		insteadOf:
			"a bigger tonal step. This is one of the two rules the workspace register deliberately reverses: on a page prefer space or tone over a line, in chrome the hairline *is* the structure.",
	},
	"hairline-strong": {
		intent: "A hairline that must be seen — an input edge, a swatch ring.",
		whenToUse: "Bounding a control whose fill is arbitrary (a colour swatch) or user content.",
		insteadOf: "`hairline`, when the line would otherwise disappear against what it bounds.",
	},
}

const RADIUS: Record<string, TokenDoc> = {
	"theme-radius-none": {
		intent: "Square. A deliberate 0.",
		whenToUse:
			"Edge-to-edge surfaces, table cells, anything whose corners meet another element's corners.",
		insteadOf:
			"omitting a radius class. Stating `none` records the intent; omitting it means the next person cannot tell square-on-purpose from square-by-accident.",
	},
	"theme-radius-xs": {
		intent: "The tightest real corner. Reads as 'crisp', not 'rounded'.",
		whenToUse:
			"Tool-chrome controls, tree rows, small swatches — anywhere the radius should be felt but not seen. The workspace register runs ~5px on essentially everything.",
		insteadOf:
			"`sm`. In a 24px-tall control an `sm` radius starts to read as a lozenge.",
	},
	"theme-radius-sm": {
		intent: "The default control corner.",
		whenToUse: "Inputs, buttons in the page register, badges, small cards.",
	},
	"theme-radius-md": {
		intent: "A container corner.",
		whenToUse: "Cards, panels, popovers, menus — surfaces that hold other things.",
		insteadOf:
			"`sm`. A container should be softer than the controls inside it, or the nesting reads inverted.",
	},
	"theme-radius-lg": {
		intent: "A prominent container corner.",
		whenToUse: "Dialogs, sheets, hero media, feature cards.",
	},
	"theme-radius-xl": {
		intent: "The softest rectangular corner. A styling statement.",
		whenToUse: "Marketing surfaces, large imagery, a theme that wants a soft character.",
		insteadOf:
			"`full`. `xl` is still a rectangle with soft corners; `full` is a capsule. Using `xl` on a small element makes it look like a failed capsule.",
	},
	"theme-radius-full": {
		intent: "A capsule or circle — radius exceeds half the height.",
		whenToUse:
			"Avatars, status dots, notification badges, pills, and page-register actions (the 'round action in a tight container' contrast that says *this is a control*).",
		insteadOf:
			"any fixed radius, for circles. And NOT in tool chrome: neither Figma nor Paper has a single pill in its chrome, which is why the compact density scope flattens `--button-radius` to ~5px.",
	},
}

const MOTION: Record<string, TokenDoc> = {
	"motion-scale": {
		intent: "A global multiplier on every duration. The accessibility lever.",
		whenToUse:
			"Set to 0 to disable motion (the reduced-motion path), or tune globally to speed the whole system up or down. Every duration token is expressed against it.",
		insteadOf:
			"per-component overrides, and `@media (prefers-reduced-motion)` scattered through components. One multiplier is auditable; fifty local checks are not.",
	},
	"motion-duration-instant": {
		intent: "Effectively no delay, but still a transition.",
		whenToUse: "Colour shifts on hover for small controls, where any perceptible delay feels laggy.",
	},
	"motion-duration-fast": {
		intent: "A quick state change.",
		whenToUse: "Hover and press feedback, checkbox and switch state, small fades.",
	},
	"motion-duration-base": {
		intent: "The default. Reach for this unless you have a reason not to.",
		whenToUse: "Most transitions: disclosure, popover open, tab indicator, selection.",
	},
	"motion-duration-slow": {
		intent: "A change big enough that the eye needs to follow it.",
		whenToUse: "Sheet and drawer travel, large layout shifts, page-level transitions.",
		insteadOf:
			"`base` for large distances. Perceived speed depends on distance — the same duration reads as snappy over 8px and abrupt over 400px.",
	},
	"motion-duration-slower": {
		intent: "Deliberate, cinematic pacing.",
		whenToUse: "Onboarding, hero reveals, celebratory moments. Rare in product UI.",
	},
	"motion-duration-enter": {
		intent: "How long a thing takes to appear.",
		whenToUse: "Paired with `exit`, for anything that mounts and unmounts.",
		insteadOf:
			"one duration for both directions. Entrances should be a touch slower than exits — arriving deserves attention, leaving should get out of the way.",
		pairsWith: ["motion-duration-exit"],
	},
	"motion-duration-exit": {
		intent: "How long a thing takes to leave — shorter than its entrance.",
		whenToUse: "Dismissals, closes, unmounts.",
		pairsWith: ["motion-duration-enter"],
	},
	"motion-ease-standard": {
		intent: "The default curve. Eases in and out.",
		whenToUse: "Anything that both starts and stops on screen: colour, opacity, small moves.",
	},
	"motion-ease-decelerate": {
		intent: "Fast out, slow in — arrives and settles.",
		whenToUse: "Something entering the viewport: a popover opening, a sheet sliding in.",
		insteadOf:
			"`standard` for entrances. An entrance that eases *in* appears to hesitate before committing.",
	},
	"motion-ease-emphasized": {
		intent: "A stronger curve for movement the user should track.",
		whenToUse: "A sliding indicator, a thumb travelling between positions, a reordering row.",
	},
	"motion-ease-spring": {
		intent: "A slight overshoot that settles. Physical, not bouncy.",
		whenToUse: "A control confirming a state change — a checked icon scaling up.",
		insteadOf:
			"`bounce`. Spring overshoots once and settles; bounce oscillates. Oscillation on a routine state change reads as unserious.",
	},
	"motion-ease-bounce": {
		intent: "Oscillating easing. Rarely correct.",
		whenToUse:
			"Only where a bounce is literally what is depicted — loading dots, a playful empty state. Not for entrances, and not for anything a user will see hundreds of times.",
		insteadOf:
			"`spring` for almost everything. If you are reaching for bounce to add character, you probably want `emphasized`.",
	},
	"motion-ease-linear": {
		intent: "Constant rate. No acceleration.",
		whenToUse:
			"Continuous, non-physical motion only: a spinner, a marquee, a shimmer, a progress bar filling at a known rate.",
		insteadOf:
			"any eased curve for looping motion. Easing on a loop makes a visible pulse at the seam.",
	},
}

const DENSITY: Record<string, TokenDoc> = {
	"control-xs": {
		intent: "The workspace control floor — 24px compact, 28px comfortable.",
		whenToUse: "Icon buttons and numeric fields in tool chrome; the smallest a control gets.",
		insteadOf:
			"a hardcoded height. And note this changes the control's *height*, never its hit area: a 24px icon button still needs a padded 44px target.",
	},
	"control-sm": { intent: "One step below default.", whenToUse: "Compact rows, dense toolbars, secondary controls." },
	"control-md": {
		intent: "The default control height. 40px page, 32px workspace.",
		whenToUse: "Almost every button, input and select. The size you get if you say nothing.",
	},
	"control-cta": {
		intent: "A prominent, touch-first action.",
		whenToUse: "The main call to action on a page, and full-width mobile actions.",
		insteadOf: "`lg`. CTA is about *emphasis*; `lg` is about *size*.",
	},
	"control-lg": { intent: "The largest control step.", whenToUse: "Hero forms, spacious marketing surfaces." },
	"field-numeric-width": {
		intent: "The width of a numeric property field.",
		whenToUse: "Property grids, so every number in a panel lines up without per-field tuning.",
	},
	"control-gap": {
		intent: "The gap between an icon and a label inside a control.",
		whenToUse: "Buttons and toggles. Tightens with density so a compact control keeps its proportions.",
		insteadOf: "`gap-2`, which stays 8px in a compact region.",
	},
	"item-px": {
		intent: "The inline padding of a row inside a menu, select or list.",
		whenToUse: "Menu, Select and Combobox rows; anything that should line up with them.",
		pairsWith: ["item-gap"],
	},
	"item-gap": {
		intent: "The gap between a row's icon, label and trailing mark.",
		whenToUse: "Menu, Select and Combobox rows.",
		pairsWith: ["item-px"],
	},
	"panel-width": { intent: "The resting width of a docked panel.", whenToUse: "The default for `Panel`; Figma runs 241px, Paper 240px." },
	"panel-width-min": { intent: "How narrow a panel may be dragged.", whenToUse: "`PanelResizer` clamps to it.", pairsWith: ["panel-width-max"] },
	"panel-width-max": { intent: "How wide a panel may be dragged.", whenToUse: "`PanelResizer` clamps to it.", pairsWith: ["panel-width-min"] },
	"chrome-bar-height": { intent: "The height of a top toolbar or menubar row.", whenToUse: "`WorkspaceBar`." },
	"status-bar-height": { intent: "The height of the bottom ambient strip.", whenToUse: "`StatusBar`." },
	"tree-rail": {
		intent: "A hierarchy panel's single left edge.",
		whenToUse: "Section headers and depth-0 rows. Read it via `treeIndent(0)`, never as a literal.",
		pairsWith: ["tree-column", "tree-indent"],
	},
	"tree-column": {
		intent: "The width of a tree's disclosure and type-icon columns.",
		whenToUse: "Sizing the twisty and kind-marker slots. Also the size the marks are drawn at.",
		insteadOf:
			"a value different from `--tree-indent`. They MUST be equal — see `tree-indent`.",
		pairsWith: ["tree-indent"],
	},
	"tree-indent": {
		intent: "One level of nesting in a tree.",
		whenToUse: "Via `treeIndent(depth)`. Never compute an inset by hand.",
		insteadOf:
			"anything other than `--tree-column`'s value. A step smaller than the column puts a child's content LEFT of where its parent's starts, so nesting reads inverted — this shipped once as 14px against a 16px column. Asserted in themes.test.ts.",
		pairsWith: ["tree-column"],
	},
}

const TYPE_TIERS: Record<string, TokenDoc> = {
	"type-display": {
		intent:
			"The largest type: display-lg through display-4xl. Marketing-scale, one per view at most.",
		whenToUse: "A landing page hero, a section opener on a brand surface.",
		insteadOf:
			"`heading-1` for page titles. Display is a *statement*; headings are *structure*. A settings page titled in display-3xl looks like an advert.",
	},
	"type-heading": {
		intent: "Structural document headings, heading-1 through heading-4.",
		whenToUse:
			"The real outline of a page. Pick the level by depth in the document, not by desired size.",
		insteadOf:
			"`display` for size, or `title` for structure. If it belongs in a table of contents, it is a heading.",
	},
	"type-title": {
		intent: "The title of a *component*, not of a document.",
		whenToUse: "A card's heading, a dialog title, a section label inside a panel.",
		insteadOf:
			"`heading-*`. A card title is not part of the page outline, and using a heading tier for it produces a document structure that lies to a screen reader's heading navigation.",
	},
	"type-overline": {
		intent: "The small, letter-spaced eyebrow above a title.",
		whenToUse: "Eyebrows, kickers, stat captions, badge labels.",
		insteadOf:
			"`caption` with hand-added tracking. The transform is themeable here, so a quieter theme can opt into sentence case rather than being stuck with uppercase.",
	},
	"type-ui": {
		intent:
			"Chrome typography for the workspace register — 10–12px at weights 450–550, in ABSOLUTE px.",
		whenToUse:
			"Every piece of text in tool chrome: panel labels, tree rows, status bars, menu items.",
		insteadOf:
			"`body-*` or `label-*`. Those are page-register tiers at 14–16px, which in a 240px panel is roughly a third too large. And note the px: sized in rem these tiers rendered at 10.5px against a 14px desktop root — a caught bug, now asserted in themes.test.ts.",
	},
}

const TEXT_TIERS: Record<string, TokenDoc> = {
	body: {
		intent: "The reading tier: body-lg through body-xs. Prose and long-form content.",
		whenToUse: "Paragraphs, descriptions, help text, anything a person reads a sentence of.",
		insteadOf:
			"`label-*`. Body is for reading, label is for naming. A form's help text is body; the field's name is a label. Getting this wrong is why some UIs feel like a wall of controls.",
	},
	label: {
		intent: "The naming tier: label-lg through label-xs. Short, denser, slightly heavier.",
		whenToUse: "Field labels, table column headers, button text, tab titles, chip text.",
		insteadOf:
			"`body-*` at the same size. Labels carry more weight and tighter leading because they are scanned, not read.",
	},
	caption: {
		intent: "The smallest page-register tier. Metadata beneath something.",
		whenToUse: "Image captions, timestamps, footnotes, a card's secondary line.",
		insteadOf:
			"`text-overline`. Caption sits *below* and explains; overline sits *above* and categorises.",
	},
	mono: {
		intent: "The monospace family: mono-xl through mono-sm, plus mono-caption.",
		whenToUse:
			"Code, identifiers, hashes, keyboard keys, and any figure where digits must align in a column.",
		insteadOf:
			"the sans tiers for numeric data. Proportional digits make a column of numbers ragged; that is what `text-ui-num` solves in chrome and mono solves on a page.",
	},
}

const LAYOUT: Record<string, TokenDoc> = {
	baseline: {
		intent: "One line of body text — body size × leading, rounded to divide evenly. The unit the page is set in, the way a printed page is measured in lines.",
		whenToUse:
			"Thinking about vertical space in lines: a group is ½–1 line apart, sections 2–3 lines. Read it; never set it — it derives from the type.",
		insteadOf: "a fixed pixel grid. A design with larger type gets a larger baseline, and its gaps grow with it.",
		pairsWith: ["baseline-step", "baseline-split", "leading-scale"],
	},
	"baseline-step": {
		intent: "The baseline divided into `baseline-split` equal steps — 8px at Sable's 15/24 body. Line heights round to it and the spacing scale is half of it.",
		whenToUse:
			"Indirectly, through `Stack`/`Row`/`Grid` gap numbers (one step each) and even Tailwind spacing steps (`p-4` is two steps). Spacing between blocks is whole steps of it.",
		insteadOf: "`rhythm-unit`, which is the same length today; the step is the source and the rhythm unit follows it.",
	},
	"baseline-split": {
		intent: "How many steps one baseline divides into. A theme picks it through `--theme-baseline-split`; thirds by default.",
		whenToUse:
			"In a theme, rarely: halves (2) read calmer and more editorial. Finer than thirds stops giving structure unless every value is chosen by eye.",
	},
	"leading-scale": {
		intent: "How open the reading text is set, as a multiple of each reading tier's leading. Compact ↔ Airy in the customizer; a theme sets `--theme-leading-scale`.",
		whenToUse:
			"To make a theme denser or airier as a whole. More leading is a longer line, so a larger step, so every gap grows with the text it spaces.",
		insteadOf:
			"setting `--spacing` by hand. That moves the spacing away from the type, and the gaps stop landing on the lines.",
	},
	"rhythm-unit": {
		intent: "The vertical rhythm base — one baseline step (8px at the default scale). Every vertical measure is a multiple of it, and it follows the type and the density control.",
		whenToUse:
			"Through `Stack`/`Row`/`Grid` gap numbers, which are rhythm units rather than pixels. A gap of 2 is 16px at the default scale, and grows or tightens with density.",
		insteadOf:
			"arbitrary vertical spacing. The rhythm is what makes unrelated sections of a page feel like one document.",
	},
	"grid-columns": {
		intent: "The column count of the content grid — 12.",
		whenToUse: "`Grid`/`Columns`, WITHIN a region, for genuinely multi-column content.",
		insteadOf:
			"using a column span as the page's reading width. A span is not a measure — see `measure-prose`.",
	},
	"grid-gutter": {
		intent: "The gap between grid columns and rows — 2 baseline steps on phones, 3 on desktop, snapped to the step.",
		whenToUse: "`Grid`/`Columns` spacing.",
	},
	"page-inset": {
		intent: "The page's outer breathing room, left and right.",
		whenToUse: "The gutter between content and the viewport edge, at every breakpoint.",
		insteadOf:
			"a global max-width. Sable caps width per REGION by role, never once for the whole page.",
	},
	"measure-prose": {
		intent: "The maximum comfortable line length for prose, in `ch`.",
		whenToUse: "Any long-form text column.",
		insteadOf:
			"a layout width. Measure and width are different things: a wide region can still hold a narrow measure, and capping the region instead makes everything else in it too narrow.",
	},
	"region-form": {
		intent: "The region cap for a form — narrow, because fields should not run long.",
		whenToUse: "Settings pages, auth screens, any column of inputs.",
		insteadOf: "`region-content`. A 700px-wide text input is harder to use, not more generous.",
	},
	"region-feed": {
		intent: "The region cap for a scrolling list of items.",
		whenToUse: "Feeds, timelines, search results.",
	},
	"region-content": {
		intent: "The default region cap for mixed page content.",
		whenToUse: "Article bodies with media, documentation, most product pages.",
	},
	"region-wide": {
		intent: "A wide region for dense or tabular content.",
		whenToUse: "Data tables, dashboards, galleries — content that genuinely needs the room.",
	},
	"region-full": {
		intent: "No cap. Edge to edge.",
		whenToUse: "Hero imagery, full-bleed sections, and a workspace, which is always edge-to-edge.",
	},
	"region-ultrawide (legacy — prefer region-full)": {
		intent: "Deprecated. Kept so existing usage keeps resolving.",
		whenToUse: "Nothing new. Use `region-full`.",
		insteadOf: "`region-full`, which is what this became.",
	},
}

/**
 * The full map. `*-foreground` entries are generated so they cannot drift from
 * their base, and the type scale is documented per TIER rather than per token —
 * `type-display-4xl-tracking` has no intent independent of `display`.
 */
export const TOKEN_DOCS: Record<string, TokenDoc> = {
	...SEMANTIC_BASES,
	...WORKSPACE_SURFACES,
	...RADIUS,
	...MOTION,
	...DENSITY,
	...TYPE_TIERS,
	...TEXT_TIERS,
	...LAYOUT,
	foreground: {
		intent: "The default ink, for `background`.",
		whenToUse: "Body text and any content sitting directly on the page.",
		insteadOf:
			"any other surface's ink. On `card`, `popover`, `panel` or a tone, use that surface's own `-foreground`.",
		pairsWith: ["background"],
	},
	...Object.fromEntries(
		[
			"card",
			"popover",
			"primary",
			"secondary",
			"accent",
			"destructive",
			"success",
			"tone-3",
			"tone-2",
			"tone-1",
			"tone-info",
			"tone-warning",
			"highlight",
			"overlay",
			"sidebar",
			"sidebar-primary",
			"sidebar-accent",
			"canvas",
			"panel",
		].map((base) => [`${base}-foreground`, foregroundDoc(base)]),
	),
	...Object.fromEntries(
		["destructive", "success", "tone-warning", "tone-info"].map((base) => [
			`${base}-text`,
			{
				intent: `\`${base}\` drawn on a surface: text, icons, borders and focus rings.`,
				whenToUse: `Write \`text-${base}\`, \`border-${base}\` or \`ring-${base}\` — they read this token; only \`bg-${base}\` reads the fill.`,
				insteadOf: `\`${base}\` itself for marks on a page. The fill is tuned to carry a label (dark mode lowers it under white ink), which can leave it too dark to read on a dark card.`,
				pairsWith: ["background", "card", "popover", "muted"],
			} satisfies TokenDoc,
		]),
	),
}

/**
 * Docs for the two extra tiers the typography utilities expose but the type
 * SCALE contract does not — body and label are the page register's reading and
 * control tiers, and mono is its own family.
 */

/**
 * Layout foundation. These are not colours or sizes but the page's skeleton, and
 * they were entirely undocumented.
 */

/**
 * Advertised name → canonical doc key. `registry.tokens` advertises the UTILITY
 * name (`radii.none`, `typography.body-md`) while the theme contract uses the CSS
 * variable name (`theme-radius-none`, `type-display-4xl-size`). One alias table
 * beats two copies of the prose.
 */
const ALIASES: Record<string, string> = {
	none: "theme-radius-none",
	xs: "theme-radius-xs",
	sm: "theme-radius-sm",
	md: "theme-radius-md",
	lg: "theme-radius-lg",
	xl: "theme-radius-xl",
	full: "theme-radius-full",
	"theme-leading-scale": "leading-scale",
	"theme-baseline-split": "baseline-split",
}

/**
 * Resolve a token to its doc, by exact key, then alias, then longest tier prefix
 * — so `type-display-4xl-tracking`, `display-4xl` and `body-md` all resolve.
 */
export function tokenDoc(token: string): TokenDoc | undefined {
	if (TOKEN_DOCS[token]) return TOKEN_DOCS[token]
	const alias = ALIASES[token]
	if (alias && TOKEN_DOCS[alias]) return TOKEN_DOCS[alias]

	// Longest prefix wins, so `type-ui-*` never resolves through `type-u`, and
	// `title-sm` prefers `type-title` over a shorter accidental match.
	const tiers = { ...TYPE_TIERS, ...TEXT_TIERS }
	const keys = Object.keys(tiers).sort((a, b) => b.length - a.length)
	for (const k of keys) {
		if (token === k || token.startsWith(`${k}-`)) return tiers[k]
		// Utility form: `display-4xl` against the `type-display` tier key.
		const bare = k.replace(/^type-/, "")
		if (token === bare || token.startsWith(`${bare}-`)) return tiers[k]
		const normalized = token.replace(/^type-/, "")
		if (normalized === bare || normalized.startsWith(`${bare}-`)) return tiers[k]
	}
	return undefined
}
