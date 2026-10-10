/**
 * lint-rules — the rule table, shared by both linters.
 *
 * There are two callers and they see the SAME rules, which is the whole point of
 * this file existing:
 *
 *   scripts/design-lint.mjs   lints Sable's own src/, contract from themes/_contract.ts
 *   bin/sable-lint.mjs        lints a CONSUMER's app,  contract from registry.json
 *
 * The second one exists because of a real failure. Three task docs told agents to
 * run `pnpm design-lint` under the heading "These are not a formality" — and the
 * package shipped no bin and no scripts/ directory, so no consumer could run any
 * of it. A converting agent hand-grepped instead and found `border-orange-500`
 * that a previous Sable conversion had shipped unlinted for weeks. Ten of the
 * eleven rules below are about consumer code; only `self-import` is internal.
 * We were enforcing the contract on the one codebase least likely to break it.
 *
 * Rules carry `scope`:
 *   "both"    — applies to any code using Sable (the default, and most of them)
 *   "package"  — only meaningful inside this package
 *   "consumer" — only meaningful in apps built with Sable (design-lint skips it)
 *
 * A rule is a lexical matcher, not an AST pass: `regex`, or `find(line)` returning
 * [{ match }]. That is enough for the class-string patterns we police and keeps
 * both linters zero-dependency.
 */

/** Utility prefixes that take a colour token. */
export const COLOR_PREFIX =
	"(?:bg|text|border|fill|stroke|ring|ring-offset|from|to|via|decoration|outline|divide|caret|accent|shadow)"

/**
 * Yield every JSX opening tag whose name matches `tagPattern`, as
 * `{ tag, attrs, index }`.
 *
 * This is a scanner rather than a regex because the obvious regex is wrong in a
 * way that hides: `<button ... />` with an `onClick={() => {}}` on it contains a
 * `>` INSIDE the attribute list, so `<tag[^<>]*>` stops at the arrow and reports
 * a tag whose attributes are truncated one line in. The arrow-function handler is
 * the single most common thing on an interactive element, which means the naive
 * version fails exactly on the elements the motion rule exists to find. So: walk
 * forward from the tag name, tracking string and brace nesting, and stop at the
 * first `>` that is genuinely at depth zero.
 *
 * Still lexical — it does not parse JSX, and it does not need to. It only has to
 * answer "which text belongs to this tag".
 */
function* openingTags(text, tagPattern) {
	const nameRe = /<([A-Za-z][\w.]*)(?=[\s/>])/g
	for (const m of text.matchAll(nameRe)) {
		if (!tagPattern.test(m[1])) continue
		let i = m.index + m[0].length
		let depth = 0
		let quote = null
		for (; i < text.length; i++) {
			const ch = text[i]
			if (quote) {
				if (ch === "\\") i++
				else if (ch === quote) quote = null
				continue
			}
			if (ch === '"' || ch === "'" || ch === "`") quote = ch
			else if (ch === "{") depth++
			else if (ch === "}") depth--
			else if (ch === ">" && depth === 0) break
		}
		if (i >= text.length) continue // unterminated — malformed source, not our problem
		yield { tag: m[1], attrs: text.slice(m.index + m[0].length, i), index: m.index }
	}
}

/**
 * The text of a tag's `className` expression — `"…"`, `{"…"}`, `{cn("…", x && "…")}`
 * — or "" when there is none. Brace-balanced, so a `cn(...)` call spanning lines
 * comes through whole. Callers then look at the CLASSES inside it, which is the
 * only part of the expression these rules judge.
 */
function classNameOf(attrs) {
	const m = /\bclassName\s*=\s*/.exec(attrs)
	if (!m) return ""
	let i = m.index + m[0].length
	const open = attrs[i]
	if (open === '"' || open === "'" || open === "`") {
		const end = attrs.indexOf(open, i + 1)
		// Quotes kept: callers read the class strings out of the expression.
		return end === -1 ? "" : attrs.slice(i, end + 1)
	}
	if (open !== "{") return ""
	let depth = 0
	const start = i
	for (; i < attrs.length; i++) {
		if (attrs[i] === "{") depth++
		else if (attrs[i] === "}" && --depth === 0) return attrs.slice(start + 1, i)
	}
	return ""
}

/** Every class token in a className expression, with its variant prefixes (`hover:`, `md:`) split off. */
function classTokens(expr) {
	const out = []
	for (const s of expr.matchAll(/(["'`])((?:(?!\1).)*)\1/gs)) {
		for (const raw of s[2].split(/\s+/)) {
			if (!raw || raw.includes("${")) continue
			// The base utility is what follows the last `:` outside brackets.
			let depth = 0
			let cut = 0
			for (let k = 0; k < raw.length; k++) {
				if (raw[k] === "[" || raw[k] === "(") depth++
				else if (raw[k] === "]" || raw[k] === ")") depth--
				else if (raw[k] === ":" && depth === 0) cut = k + 1
			}
			out.push({ raw, base: raw.slice(cut).replace(/^!/, "") })
		}
	}
	return out
}

/**
 * Build the rule table against a token contract.
 *
 * @param {{ semanticTokens: Set<string>, motionTokens: Set<string> }} contract
 */
export function makeRules({ semanticTokens, motionTokens }) {
	// Easing utility names = the theme's motion-ease-* tokens + Tailwind built-ins.
	const easeNames = new Set([
		...[...motionTokens]
			.filter((t) => t.startsWith("motion-ease-"))
			.map((t) => t.replace("motion-ease-", "")),
		"in",
		"out",
		"in-out",
		"linear",
		"initial",
	])

	// A tone/overlay/highlight colour utility (with optional /opacity), capturing
	// the token name to validate. Compiled once (matchAll clones the regex per
	// call, so reusing a /g regex is safe). `g` is required by matchAll.
	const toneUtility = new RegExp(
		`\\b${COLOR_PREFIX}-((?:tone-[a-z-]+|highlight|overlay)[a-z-]*)(?:/\\d+)?\\b`,
		"g",
	)

	/* A physical direction utility, with the VALUE shape spelled out rather than a
	 * loose `[\w-]+` tail. That is the whole difference between a rule people obey
	 * and a rule people disable: prose is full of "left-aligned", "right-hand",
	 * "left-to-right" and `right-click`, and every one of them matches the loose
	 * version. Requiring a Tailwind value — a number, a fraction, `auto`, `px`,
	 * `full`, an arbitrary [..] or a var (..) — leaves only real class strings.
	 * The leading char is captured too so a variant prefix (`md:`, `hover:`,
	 * `data-[side=left]:`) and a negative (`-ml-2.5`) both come through intact. */
	const physicalDirection =
		/(?:^|[\s"'`{(:[])(-?(?:ml|mr|pl|pr|left|right)-(?:\[[^\]]*\]|\((?:--)?[\w-]+\)|auto|px|full|\d+(?:\.\d+)?(?:\/\d+)?)|text-(?:left|right))(?![\w-])/g

	/* surface-hover: an interaction-state variant setting a background to a
	 * fixed token. `accent` is included: sable-surface-interactive's own docs
	 * name `hover:bg-accent` as the thing it replaces — a fixed hover that is
	 * right on one surface and invisible or loud on the next. */
	const surfaceState =
		/\b(hover|focus-visible|sable-highlighted|sable-selected|data-\[highlighted\]|data-\[selected\]|data-\[checked\]|aria-selected|aria-\[selected=true\]):bg-(background|card|popover|muted|secondary|accent|panel-raised|panel|canvas)\b(?:\/(?:\d+|\[[^\]]+\]))?(?![\w-])/g

	return [
		{
			id: "inline-color",
			scope: "both",
			why: "Inline oklch()/hex color. Use a semantic token (bg-card, text-tone-edition-foreground, bg-overlay…). Literal colors belong only in a theme file.",
			regex: /oklch\s*\(|#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g,
		},
		{
			id: "palette-ref",
			scope: "both",
			why: "Raw palette-step reference (e.g. --zinc-950, text-(--purple-heart-700), border-orange-500). Palette steps are theme-internal — name a semantic token instead. After the tone-foreground + overlay tokens, this rule has ZERO sanctioned exceptions.",
			// Two shapes, and the second is the one that got away. A CSS var ending in
			// a ramp step catches `--zinc-950`; a bare Tailwind palette utility catches
			// `border-orange-500`, which is what actually shipped in a consumer app for
			// weeks. Semantic/layout/motion tokens never end in a numeric step, so both
			// halves are theme-agnostic.
			regex: new RegExp(
				"--[a-zA-Z][\\w-]*-(?:50|100|200|300|400|500|600|700|800|900|950)\\b" +
					`|\\b${COLOR_PREFIX}-(?:slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)\\b`,
				"g",
			),
		},
		{
			id: "raw-control-height",
			scope: "both",
			code: true,
			why:
				"A control-ladder height hardcoded in px. Read the ladder instead — h-(--control-md), h-(--control-xs), … — so a data-density scope can retune every control at once (DESIGN.md → Registers). " +
				"Only the ladder's own values are flagged, so a genuine non-control measure (a gauge diameter, a WCAG touch floor) is a real exception: disable with a reason.",
			// Deliberately narrow: matching every h-[Npx] would fire on badge dots,
			// device frames and panel widths, and a rule that mostly cries wolf just
			// teaches people to sprinkle disables.
			regex: /\b(?:min-)?h-\[(?:24|28|32|36|40|44|48)px\]/g,
		},
		{
			id: "raw-black-white",
			scope: "both",
			code: true,
			why: "bg-black/bg-white/text-white/etc. The anti-pattern is pure #000/#fff. For scrims & media surfaces use the `overlay` / `overlay-foreground` tokens; for theme surfaces use semantic tokens.",
			regex: new RegExp(`\\b${COLOR_PREFIX}-(?:black|white)\\b`, "g"),
		},
		{
			id: "self-import",
			scope: "package",
			why: "Importing the package's own public barrel (@sableui/react) from inside src/ risks circular imports and export-order surprises, and weakens internal module boundaries. Deep-import the specific module with a relative path (e.g. ../../icon, ../button).",
			regex: /from\s+["']@sableui\/react\b[^"']*["']/g,
		},
		{
			id: "tailwind-color-alias",
			scope: "both",
			since: "0.1.0",
			// Comment-stripped: the docs below discuss this exact string.
			code: true,
			why: "`var(--color-*)` is TAILWIND's generated alias, not a Sable token, and it is NOT theme-aware. `@theme inline` makes the UTILITIES follow the active theme, but the emitted `--color-*` custom property is frozen to whatever the DEFAULT theme resolved at build time — so hand-written CSS inside a `data-sable-theme` subtree silently paints the default theme's colour. Read the semantic token instead: `var(--primary)`, `var(--background)`, `var(--border-strong)`. This shipped twice in one build: a hero gradient that computed to near-white instead of the brand accent, and a whole page rendering in the default theme's typeface. Nothing errors — it just renders the wrong theme.",
			regex: /var\(\s*--color-[\w-]+/g,
		},
		{
			id: "unmanaged-overflow",
			scope: "both",
			// Checked against the comment-stripped line: doc comments discuss
			// `overflow-y-auto` constantly and style nothing.
			code: true,
			why: "A scroll container with no scrollbar policy. Pair the overflow utility with `scrollbar-quiet` (a quiet bar that appears while scrolling) or `scrollbar-hidden` (no bar — only when something else carries the affordance, e.g. Scroller's horizontal edge fades). Left bare, the platform draws its own: stepper arrows on Windows, hard against the padding edge, poking out of any rounded corner. See DESIGN.md → Scrolling.",
			find(line) {
				const overflow = line.match(/\boverflow(?:-[xy])?-(?:auto|scroll)\b/)
				if (!overflow) return []
				// The policy may sit anywhere on the same line — before the overflow
				// utility, after it, or in an adjacent class in the same string.
				if (/\bscrollbar-(?:quiet|hidden)\b/.test(line)) return []
				return [{ match: overflow[0] }]
			},
		},
		{
			id: "transition-colors",
			scope: "both",
			code: true,
			why: "Bare `transition-colors` bypasses the motion kill-switch. Use the `motion-interactive` recipe (the single transition declarer for interactive chrome).",
			regex: /\btransition-colors\b/g,
		},
		{
			id: "transition-all",
			scope: "both",
			since: "0.1.0",
			code: true,
			why: "`transition: all` watches every animatable property, so anything that changes for an unrelated reason — a padding step, a shadow swap, a width recalculated by the layout — animates too, and the browser cannot pre-compute what it is transitioning. Use `motion-interactive`, or name the properties you actually animate.",
			// Both spellings: Tailwind's utility (with any variant prefix in front of
			// it) and the raw declaration in a stylesheet or a style object.
			regex: /\btransition-all\b|\btransition(?:Property)?\s*:\s*["']?all\b/g,
		},
		{
			id: "builtin-animate",
			scope: "both",
			code: true,
			why: "Tailwind's built-in animate-{spin,pulse,bounce,ping} ignore --motion-scale, so the reduced-motion / MotionProvider-off policy can't freeze them. Use the scale-aware motion-{spin,pulse,shimmer,dot-bounce,ping} loader recipes.",
			regex: /\banimate-(?:spin|pulse|bounce|ping)\b/g,
		},
		{
			id: "raw-duration",
			scope: "both",
			code: true,
			why: "Raw duration-<n> (e.g. duration-150) bypasses --motion-scale. Use duration-(--motion-duration-{instant|fast|base|slow|slower|enter|exit}).",
			regex: /\bduration-\d+\b/g,
		},
		{
			id: "faded-focus-ring",
			scope: "both",
			code: true,
			why: "Opacity on semantic focus ink weakens the theme's tested contrast. Use ring-ring or ring-sidebar-ring at full opacity; tune the semantic token in the theme instead.",
			find(line) {
				return [...line.matchAll(/\b(?:ring|outline)-(?:sidebar-)?ring\/(\d+(?:\.\d+)?|\[[^\]]+\])/g)]
					.filter((match) => match[1] !== "100")
					.map((match) => ({ match: match[0] }))
			},
		},
		{
			id: "text-opacity",
			scope: "both",
			code: true,
			since: "0.1.0",
			why: "Opacity on a surface text ink (text-foreground/60). An alpha step over an unknown surface has unknown contrast and shifts per theme. Use text-muted-foreground — it is contrast-tested on every surface. See `sable docs typography`.",
			// Only the inks that HAVE a tested secondary step. overlay-foreground and
			// the tone inks sit on imagery or a tone fill with no muted counterpart,
			// so an alpha there is a legitimate (and reviewed) choice.
			regex: /\btext-(?:muted-|card-|popover-)?foreground\/(?:\d+(?:\.\d+)?|\[[^\]]+\])/g,
		},
		{
			id: "highlight-as-ink",
			scope: "both",
			code: true,
			since: "0.1.0",
			why: "`highlight` is a SURFACE, always paired with `highlight-foreground` (bg-highlight text-highlight-foreground). Presets disagree on what it looks like (a vivid accent in some, a quiet wash in Atelier and Verdant), so as a bare text or icon ink it vanishes in half of them. For an accented mark put the icon in a bg-highlight chip; for links and hovers use text-foreground.",
			regex: /\btext-highlight(?!-foreground)\b/g,
		},
		{
			id: "decomposed-type",
			scope: "both",
			code: true,
			why: "Hand-rolled typography: a bare text-{size} together with a font-{weight}. Use a paired utility (text-heading-1, text-body-md, text-label-lg…) which bundles size+weight+line-height+tracking.",
			find(line) {
				const hasSize = /\btext-(?:xs|sm|base|lg|xl|[2-9]xl)\b/.test(line)
				const weight = line.match(
					/\bfont-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/,
				)
				return hasSize && weight ? [{ match: weight[0] }] : []
			},
		},
		{
			id: "unknown-token",
			scope: "both",
			why: "Unknown tone/overlay/highlight token — Tailwind silently no-ops a typo'd token (no compile error). Check the spelling against the token list in registry.json.",
			find(line) {
				const out = []
				for (const m of line.matchAll(toneUtility)) {
					if (!semanticTokens.has(m[1])) out.push({ match: m[0] })
				}
				return out
			},
		},
		{
			id: "raw-z-index",
			scope: "both",
			code: true,
			why: "Raw z-index utility. Name a step on the layering scale — z-(--z-sticky|nav|overlay|toast|skip-link) — so stacking is one ordered system rather than a bidding war. See DESIGN.md → Layering.",
			// The rule DESIGN.md has stated since 0.17.0, unenforced until 0.44.0 —
			// and broken by fourteen of Sable's own portaled surfaces, every one of
			// them writing `z-50` while --z-overlay sat declared and unused. A rule
			// nothing checks is a rule the components drift away from first.
			//
			// Small positive z-indexes are left alone: z-0/z-10/z-20 are local
			// stacking inside a component's own box (a carousel arrow over its
			// slide), not participation in the global layer order. The scale starts
			// at 30 for exactly that reason.
			find(line) {
				const out = []
				for (const m of line.matchAll(/(?:^|[\s"'`])-?z-(\d+)\b/g)) {
					if (Number(m[1]) >= 30) out.push({ match: m[0].trim() })
				}
				for (const m of line.matchAll(/(?:^|[\s"'`])-?z-\[[^\]]+\]/g)) {
					out.push({ match: m[0].trim() })
				}
				return out
			},
		},
		{
			id: "static-interactive",
			scope: "both",
			/* When this rule started failing builds. A consuming app upgrading across
			 * several releases needs to know which findings are NEW contract, not
			 * rot it has been ignoring — `sable-lint --since <their old version>`
			 * answers that. Rules predating this field carry no `since`; they are
			 * simply "older than the tracking". */
			since: "0.1.0",
			// A whole-file rule: a JSX opening tag routinely spans a dozen lines, and
			// the class string that says "I react to a pointer" is almost never on the
			// same line as the one that would say how.
			file: true,
			code: true,
			why:
				"An element styled for pointer states (hover:/active:/focus-visible:) with no motion recipe on it. Add `motion-interactive` (colour/opacity chrome) or `motion-press` (it also moves under the press). " +
				"Every other motion rule here is PROHIBITIVE — they fire on motion that is present and wrong, and none of them can fire on motion that is absent, so a component that simply snaps between states passes the whole contract. This is the rule that asks for the motion in the first place.",
			scan(text) {
				const out = []
				// Intrinsic elements only. `<Button className="hover:…">` brings its own
				// motion from the component, and flagging it would teach people that the
				// fix is to bolt a recipe onto a Sable component — which is how you end
				// up with two transitions fighting over the same property.
				for (const m of openingTags(text, /^[a-z][a-z0-9]*$/)) {
					const attrs = m.attrs
					if (!/\bclassName\s*=/.test(attrs)) continue
					if (!/\b(?:hover|active|focus-visible):/.test(attrs)) continue
					if (/\bmotion-[a-z-]+/.test(attrs)) continue
					// `transition-colors` is already caught by its own rule and its fix is
					// the same recipe; reporting both on one element is noise.
					if (/\btransition-colors\b/.test(attrs)) continue
					out.push({
						index: m.index,
						match: `<${m.tag} …${/\b(?:hover|active|focus-visible):[\w[\]/.-]+/.exec(attrs)?.[0] ?? ""}`,
					})
				}
				return out
			},
		},
		{
			id: "native-ui-import",
			/* CONSUMER-scoped: an iOS prototype importing Konsta directly. Konsta is
			 * there for the system chrome Sable has no equivalent for, and the
			 * adapter (@sableui/react/ios) wraps exactly that set. A direct import
			 * is how a Konsta Toggle, ListInput or Searchbar ends up where Sable's
			 * Switch, Input or SearchInput belongs — which the first iOS prototypes
			 * did, until the rule existed. */
			scope: "consumer",
			since: "0.1.0",
			file: true,
			code: true,
			why:
				"A direct import from konsta. In an iOS prototype, Sable components build every screen; Konsta supplies only system chrome, and that comes through @sableui/react/ios (NativeApp, IosPage, IosNavbar, IosBackLink, IosTabbar, IosTab, IosSheet, IosIconButton, NavigationStack). For a row, input, switch, slider, search, button, list or toast, use the Sable component — `sable target ios --component <Name>` says which.",
			scan(text) {
				const out = []
				for (const m of text.matchAll(/from\s+["'](konsta(?:\/[\w-]+)?)["']/g)) out.push({ index: m.index, match: `import from "${m[1]}" → @sableui/react/ios or a Sable component` })
				return out
			},
		},
		{
			id: "hand-rolled-control",
			/* CONSUMER-scoped: apps built WITH Sable. The package's own components are
			 * where these roles are allowed to be implemented; everywhere else, a
			 * hand-written radio group or range input is a Sable component re-built
			 * worse. Sable's own docs site shipped exactly that — a Customize panel of
			 * role="radio" buttons with no arrow keys, a native range, a native colour
			 * picker — because nothing here could say "use the component". */
			scope: "consumer",
			since: "0.1.0",
			file: true,
			code: true,
			why:
				"A hand-built control where Sable ships the component. Sable's version carries the keyboard model, focus handling, ARIA wiring and theming (it is built on Base UI); a hand-rolled one usually misses some of it — a role=\"radio\" button row without arrow keys is the common case. Use the named component. If none genuinely fits (a 2D pad, a bespoke strip), keep it keyboard-complete and add the escape hatch with the reason.",
			scan(text) {
				const ROLE = {
					radio: "RadioGroup / ToggleGroup",
					radiogroup: "RadioGroup / ToggleGroup",
					slider: "Slider",
					switch: "Switch",
					checkbox: "Checkbox",
					tab: "Tabs",
					tablist: "Tabs",
					menu: "Menu",
					menuitem: "Menu",
					listbox: "Select / Combobox",
					option: "Select / Combobox",
					combobox: "Combobox",
					dialog: "Dialog / Sheet",
					alertdialog: "AlertDialog",
					tooltip: "Tooltip",
					toolbar: "Toolbar",
					progressbar: "Progress",
					meter: "Meter",
					separator: "Separator",
				}
				const INPUT = {
					range: "Slider",
					color: "ColorField",
					checkbox: "Checkbox / Switch",
					radio: "RadioGroup",
					number: "NumberField",
					date: "DatePicker",
					"datetime-local": "DatePicker granularity=\"minute\"",
				}
				const NATIVE = { select: "Select", dialog: "Dialog", progress: "Progress", meter: "Meter", hr: "Separator" }
				const out = []
				// Intrinsic elements only: <Radio role=…> is a Sable component already.
				for (const m of openingTags(text, /^[a-z][a-z0-9]*$/)) {
					// `role="x"`, `role={"x"}`, `role={`x`}`; a computed role is not judged.
					const role = /\brole\s*=\s*\{?\s*["'`]([a-z]+)["'`]/.exec(m.attrs)?.[1]
					const type =
						m.tag === "input" ? /\btype\s*=\s*\{?\s*["'`]([a-z-]+)["'`]/.exec(m.attrs)?.[1] : undefined
					const use = (role && ROLE[role]) || (type && INPUT[type]) || NATIVE[m.tag]
					if (!use) continue
					const what = role ? `role="${role}"` : type ? `<input type="${type}">` : `<${m.tag}>`
					out.push({ index: m.index, match: `${what} → use ${use}` })
				}
				return out
			},
		},
		{
			id: "floating-surface",
			scope: "both",
			since: "0.1.0",
			code: true,
			why:
				"A floating surface with a resting surface's fill or edge. `shadow-md` and above mean the element floats (menus, popovers, selects, tooltips, dialogs, sheets, toasts, a floating panel), and a floating surface is `bg-popover text-popover-foreground` with `border-border-floating` (or `ring-border-floating`). " +
				"FILL: `background` is the bottom of the stack and `card` sits on it — background < card < popover in every dark mode — so a floating panel on either reads as sunk beneath what it hovers over (Sable's Customize inspector shipped on `bg-background`; Dialog, Sheet and Toast shipped on `bg-card`). " +
				"EDGE: the shadow carries the elevation; a full `border-border` hairline on top of it stacks into a heavy outline. `border-floating` is the lighter, alpha edge made for this. A device screen or other genuine page ground that carries a shadow takes the escape hatch with the reason.",
			find(line) {
				const out = []
				// One class string at a time: the classes must share an element.
				for (const m of line.matchAll(/(["'`])((?:(?!\1).)*)\1/g)) {
					const cls = m[2]
					// Bare utilities only: `hover:shadow-md` on an interactive card is a
					// state, not a floating layer.
					if (!/(?:^|\s)shadow-(?:md|lg|xl|2xl)(?=\s|$)/.test(cls)) continue
					const fill = /(?:^|\s)bg-(background|card)(?=[\s/]|$)/.exec(cls)?.[1]
					if (fill) out.push({ match: `bg-${fill} + floating shadow → bg-popover` })
					const edge = /(?:^|\s)(border|ring)-border(?=[\s/]|$)/.exec(cls)?.[1]
					if (edge) out.push({ match: `${edge}-border + floating shadow → ${edge}-border-floating` })
				}
				return out
			},
		},
		{
			id: "lookalike-control",
			/* CONSUMER-scoped, the sibling of hand-rolled-control. That rule sees a
			 * control by its ROLE (role="radio", <input type="range">); this one sees
			 * it by its CLOTHES — a raw element wearing a Sable component's shell.
			 * The docs header shipped a <button> dressed as a search field for
			 * months, and every styling rule passed it: the classes were all
			 * semantic tokens. Correct styling is how a reinvention hides. */
			scope: "consumer",
			since: "0.1.0",
			file: true,
			code: true,
			why:
				"A raw element dressed as a Sable component. `border-input` is the field shell (Input, Textarea, SearchInput, Select…); a `bg-primary` / `bg-secondary` / `bg-destructive` fill or a `--control-*` height on a <button> or <a> is a Button. Hand-built, they drift from the component — no density, no loading or disabled states, no focus contract — and every token on them still passes lint. Use the component: Button (a link takes `render={<a href=… />}`), Input / SearchInput, or CommandMenuTrigger for a search-shaped button that opens a palette. If none fits, that is a library gap: say so, then take the escape hatch with the reason.",
			scan(text) {
				const out = []
				for (const m of openingTags(text, /^[a-z][a-z0-9]*$/)) {
					// Native fields are hand-rolled-control's job; don't double-report.
					if (m.tag === "input" || m.tag === "textarea" || m.tag === "select") continue
					const cls = /\bclassName\s*=\s*\{?\s*(?:cn\()?\s*["'`]([^"'`]*)["'`]/.exec(m.attrs)?.[1] ?? ""
					if (!cls) continue
					if (/(?:^|\s)border-input(?=\s|$)/.test(cls)) {
						out.push({ index: m.index, match: `<${m.tag}> with the field shell (border-input) → use Input / SearchInput / CommandMenuTrigger` })
						continue
					}
					if (m.tag !== "button" && m.tag !== "a") continue
					const fill = /(?:^|\s)bg-(primary|secondary|destructive)(?=\s|$)/.exec(cls)?.[1]
					if (fill) {
						out.push({ index: m.index, match: `<${m.tag}> with a button fill (bg-${fill}) → use Button` })
						continue
					}
					if (/(?:^|\s)h-\(--control-[a-z]+\)/.test(cls)) {
						out.push({ index: m.index, match: `<${m.tag}> sized as a control (h-(--control-*)) → use Button` })
					}
				}
				return out
			},
		},
		{
			id: "hand-derived-surface",
			/* CONSUMER-scoped. Mixing ink into a surface by hand is what the
			 * relative-surface utilities compute — and the tell that the library
			 * was skipped. Twice in one day Sable's own docs hand-derived a fill
			 * (a fixed token, then an outline to rescue it) while sable-surface*
			 * sat in styles.css, unlisted. The utilities are catalogued now; this
			 * points at them from the place the workaround gets written. */
			scope: "consumer",
			since: "0.1.0",
			code: true,
			why:
				"A colour hand-mixed from the foreground ink — `color-mix(… var(--foreground) …)`. Sable already derives these from the surface underneath, in every theme and mode: `sable-well` (a recessed track, pad or well), `sable-surface` + `sable-surface-interactive` (hover and selected fills on any surface), `bg-hairline` / `border-hairline` (a faint ink edge or fill). `npx sable search` finds them; `registry.json → utilities` explains each. If none fits, it is a gap — report it, then take the escape hatch with the reason.",
			find(line) {
				const out = []
				for (const m of line.matchAll(/color-mix\([^;"'`]*?var\(--foreground\)/g)) {
					out.push({ match: m[0].length > 60 ? `${m[0].slice(0, 57)}…` : m[0] })
				}
				return out
			},
		},
		{
			id: "surface-hover",
			/* A RATCHET in the package, a gate everywhere else. Sable's own
			 * components predate sable-surface-interactive and carry a handful of
			 * these; design-lint grandfathers them in lint-baseline.json and fails
			 * on any new one. sable-lint (apps, consumers) has no baseline, so there
			 * it simply fails — the point is that new code uses the recipe. */
			scope: "both",
			ratchet: true,
			ratchetHint: "Use sable-surface-interactive for the state, or disable the rule at the site with a reason if the surface underneath is genuinely fixed.",
			code: true,
			since: "0.1.0",
			why:
				"A hover, highlight or selected state painted with a fixed token (hover:bg-muted, hover:bg-accent, hover:bg-popover, data-[selected]:bg-card…). It only reads on the surface it was designed for: on a well, a muted row or a popover it can match the parent, and the state turns into a hole. Use `sable-surface-interactive`, which steps hover and selected off whatever surface the element sits on — or a Sable component whose states are built in. " +
				"Exempt: an opacity step on the element's own surface (bg-popover/90 hover:bg-popover, bg-card hover:bg-card/85), which is not a surface swap.",
			find(line, ctx) {
				// The utility catalogue's `insteadOf` prose names these patterns as
				// the thing to avoid; it is the one file whose job is to spell them out.
				if (/(?:^|\/)utility-docs\.ts$/.test(ctx?.file ?? "")) return []
				const out = []
				for (const m of line.matchAll(surfaceState)) {
					const surface = m[2]
					// The same surface, unprefixed, as the base on the same class string:
					// an opacity step (bg-popover/90 → hover:bg-popover, bg-card →
					// hover:bg-card/85), which reads on any ground — not a surface swap.
					if (new RegExp(`(?:^|[\\s"'\`])bg-${surface}(?:/|(?![\\w-]))`).test(line)) continue
					out.push({ match: m[0] })
				}
				return out
			},
		},
		{
			id: "control-height-override",
			/* Fields and buttons own their height through `size` (the control
			 * ladder). Squeezing one with a height class gives a control that looks
			 * like the ladder but isn't on it: ColorField shrank an Input this way and
			 * the docs Playground did the same to a SelectTrigger, at a height no
			 * component offers. */
			scope: "both",
			code: true,
			since: "0.1.0",
			why:
				"A control-height class passed to a sized component (h-(--control-*) on Input, Button, SelectTrigger or ComboboxInput). These components take their height from `size` — Button: xs | sm | md | cta | icon-*; Input, SelectTrigger, ComboboxInput: md | xs. Use the size prop; if no size fits, that is a gap in the component, not a className.",
			find(line) {
				const out = []
				for (const m of line.matchAll(/<(Input|Button|SelectTrigger|ComboboxInput)\b[^>]*?\bh-\(--control-[a-z]+\)/g)) {
					out.push({ match: `<${m[1]} … h-(--control-…)` })
				}
				return out
			},
		},
		{
			id: "clickable-static",
			/* A click handler on an element that is not a control. It works for a
			 * mouse and nothing else: no tab stop, no Enter/Space, no role, no focus
			 * ring. hand-rolled-control sees a control by its role and
			 * lookalike-control by its clothes; this sees it by its handler, which
			 * is the one thing a reinvented button always has. */
			scope: "both",
			since: "0.1.0",
			file: true,
			code: true,
			why:
				"An `onClick` on a non-interactive element (div, span, li, img, td, tr, section, article, p). It reaches mouse users only: no focus, no Enter/Space, no role. Use Button (variant=\"ghost\" for a quiet hit area; `render={<a href=… />}` for a link), or a Sable component whose rows are interactive (Entity, TreeRow, a Menu/Select item). A handler that only stops propagation, or a backdrop whose keyboard path is elsewhere, takes the escape hatch with the reason.",
			scan(text) {
				const STATIC = /^(?:div|span|li|img|td|tr|section|article|p)$/
				const out = []
				for (const m of openingTags(text, STATIC)) {
					if (!/\bonClick\s*=/.test(m.attrs)) continue
					// A declared role (option, treeitem, row…) means a container owns the
					// keyboard model — aria-activedescendant or roving focus. A computed
					// role is not judged.
					if (/\brole\s*=/.test(m.attrs)) continue
					out.push({ index: m.index, match: `<${m.tag} onClick> → use Button or an interactive Sable row` })
				}
				return out
			},
		},
		{
			id: "hand-written-fade",
			/* An edge fade masked by hand onto a scroll region. Scroller owns the
			 * edge fade: it shows only on the side that has more, follows the
			 * scroll position, and stays off the scrollbar. A static mask fades
			 * content that is already fully in view. */
			scope: "both",
			since: "0.1.0",
			code: true,
			why:
				"A hand-written `mask-image` gradient. For a scroll region, Scroller draws the edge fade — only on the side that has more, following the scroll. For streaming text, StreamingText. For clamped text that expands, ShowMore. If none of these fit, take the escape hatch with the reason.",
			find(line, ctx) {
				const file = ctx?.file ?? ""
				// The owners, and the catalogue that names the pattern in prose.
				if (/(?:^|\/)(?:scroller|streaming-text|show-more)\/[^/]+\.tsx?$/.test(file)) return []
				if (/(?:^|\/)utility-docs\.ts$/.test(file)) return []
				if (/(?:^|\/)styles\.css$/.test(file)) return []
				return [...line.matchAll(/mask(?:-image|Image)?[\s:=\[("'`]+[^;"'`]*?linear-gradient|mask-linear-|\[mask-image:/g)].map((m) => ({
					match: m[0].length > 50 ? `${m[0].slice(0, 47)}…` : m[0],
				}))
			},
		},
		{
			id: "raw-button",
			/* PACKAGE-scoped RATCHET. CopyButton and SplitButton both drifted the same
			 * way: a component hand-built its own <button> with its own size, icon
			 * scale and hover, so it never matched the Button beside it. The existing
			 * occurrences (tree rows, chips, select triggers…) are recorded in
			 * lint-baseline.json; a NEW raw <button> in a component fails until it is
			 * either a composed `Button` or carries a disable with its reason. */
			scope: "package",
			ratchet: true,
			ratchetHint: "Compose Sable's Button (variant + size) instead, or — if this control is genuinely not a button-shaped action (a row, a chip, a trigger with its own anatomy) — disable the rule at the site with the reason.",
			code: true,
			since: "0.1.0",
			why:
				"A component renders a raw <button> instead of composing Sable's Button. A hand-built button picks its own height, padding, icon size, radius, hover and focus ring, so it drifts from every other button (CopyButton was 28px with a 14px glyph beside 32px icon buttons).",
			find(line, ctx) {
				// Button is where the element is allowed to live.
				if (/(?:^|\/)button\/button\.tsx$/.test(ctx?.file ?? "")) return []
				if (/(?:^|\/)[^/]+\.test\.tsx$/.test(ctx?.file ?? "")) return []
				// The utility catalogue names the raw element in prose.
				if (/(?:^|\/)utility-docs\.ts$/.test(ctx?.file ?? "")) return []
				// `<button` may end the line when its attributes follow on the next ones.
				return [...line.matchAll(/<button(?=[\s>]|$)/g)].map(() => ({ match: "<button" }))
			},
		},
		{
			id: "destructive-item-ink",
			/* A destructive menu row painted by hand. MenuItem and ContextMenuItem
			 * take `variant="destructive"`, which keeps the destructive ink when the
			 * row is highlighted and washes the highlight in the destructive tone. A
			 * `className="text-destructive"` loses the ink the moment the default
			 * highlight repaints the row — which is the state someone is in when they
			 * are about to click it. */
			scope: "both",
			since: "0.1.0",
			file: true,
			code: true,
			why:
				"A menu row coloured by className (text-destructive, a tone ink, or a destructive highlight). MenuItem and ContextMenuItem take `variant=\"destructive\"`, which keeps the ink while highlighted and tints the highlight to match; a class override loses it on hover. Use the variant.",
			scan(text) {
				const out = []
				for (const m of openingTags(text, /^(?:MenuItem|ContextMenuItem)$/)) {
					const hit = classTokens(classNameOf(m.attrs)).find(({ base }) =>
						/^(?:text-(?:destructive|warning|success|info|tone-[a-z-]+)|bg-destructive)(?:\/[\w.[\]]+)?$/.test(base),
					)
					if (hit) out.push({ index: m.index, match: `<${m.tag} className="${hit.raw}"> → variant="destructive"` })
				}
				return out
			},
		},
		{
			id: "component-restyle",
			/* A library component re-skinned from the outside. The look of a Button,
			 * Pill or Badge — its fill, edge, corner, ring and shadow — is what its
			 * variants are for; an override class gives one call site a look no other
			 * site can ask for, and it silently fights the variant's own states
			 * (hover, selected, focus) underneath. The fix is a real variant: use the
			 * one that exists (Button `variant="floating"` for a control over content,
			 * Pill `appearance="outline"` for a quiet chip, Badge `appearance`/`tone`)
			 * or add one to the component. Layout classes stay allowed: width, margin,
			 * flex/grid placement and positioning are the caller's business. */
			scope: "both",
			since: "0.1.0",
			file: true,
			code: true,
			why:
				"A look-changing class on a Sable component (border*, bg-*, rounded*, ring-*, shadow-* on Button, Pill or Badge). Their appearance is set by variants — Button `variant` (floating for a control over content), Pill `appearance`/`size`, Badge `appearance`/`tone` — and an override fights the variant's own hover, selected and focus states. Use a real variant, or add one to the component. Layout classes (width, margin, flex, position) are fine.",
			scan(text) {
				const out = []
				for (const m of openingTags(text, /^(?:Button|Pill|Badge)$/)) {
					const hit = classTokens(classNameOf(m.attrs)).find(({ base }) =>
						/^-?(?:border|bg|rounded|ring|shadow)(?:-|$)/.test(base),
					)
					if (hit) out.push({ index: m.index, match: `<${m.tag} className="… ${hit.raw} …"> → use a variant` })
				}
				return out
			},
		},
		{
			id: "table-edge-padding",
			/* A table's outer columns inset by hand. Table reads `--table-edge-px`
			 * for the first and last column, and CardContent `flush` sets it to the
			 * card's own padding (`--card-p`), so a full-bleed table lines up with
			 * the CardHeader at every density. A hand-set `pl-6` matches one density
			 * and drifts at the other. */
			scope: "both",
			since: "0.1.0",
			file: true,
			code: true,
			why:
				"Inline-edge padding hand-set on a TableHead or TableCell (pl-*, pr-*, ps-*, pe-*). Table insets its first and last columns by `--table-edge-px`; put the table in `<CardContent flush>`, which sets it to the card's padding at every density — or set `[--table-edge-px:…]` on a wrapper. Never pad the cells by hand.",
			scan(text) {
				const out = []
				for (const m of openingTags(text, /^(?:TableHead|TableCell)$/)) {
					const hit = classTokens(classNameOf(m.attrs)).find(({ base }) => /^(?:pl|pr|ps|pe)-/.test(base))
					if (hit) out.push({ index: m.index, match: `<${m.tag} className="${hit.raw}"> → CardContent flush` })
				}
				return out
			},
		},
		{
			id: "popup-separator-bleed",
			/* A separator bled to a popup's edges by a fixed amount. The popup's
			 * padding is `popup-inset`, which grows with the radius and the density;
			 * a fixed `-mx-1` stops short of the edges once a rounder preset or a
			 * roomier density grows the inset. `popup-bleed` bleeds by exactly
			 * popup-inset. */
			scope: "both",
			since: "0.1.0",
			file: true,
			code: true,
			why:
				"A separator bled to the popup edge with a fixed negative margin (-mx-1, -mx-[…]). Popup padding is `popup-inset`, which follows the radius and the density; use `popup-bleed`, which bleeds by exactly that amount, or the popup's own *Separator part (MenuSeparator, ContextMenuSeparator, SelectSeparator) which already does.",
			scan(text) {
				const out = []
				const seen = new Set()
				const negX = /(?:^|\s|:)-mx-[\w.[\]()-]+/
				for (const m of openingTags(text, /Separator$/)) {
					const hit = classTokens(classNameOf(m.attrs)).find(({ base }) => /^-mx-/.test(base))
					if (!hit) continue
					seen.add(m.index)
					out.push({ index: m.index, match: `<${m.tag} className="${hit.raw}"> → popup-bleed` })
				}
				// A hand-drawn rule: a 1px-high class string with a negative inline margin.
				for (const s of text.matchAll(/(["'`])((?:(?!\1)[^\n])*)\1/g)) {
					const cls = s[2]
					if (!/(?:^|\s)h-(?:px|\[1px\])(?=\s|$)/.test(cls)) continue
					const hit = negX.exec(cls)
					if (!hit) continue
					// Skip a string already reported through its *Separator tag.
					if ([...seen].some((i) => s.index > i && s.index - i < 400)) continue
					out.push({ index: s.index, match: `${hit[0].trim()} on a 1px rule → popup-bleed` })
				}
				return out
			},
		},
		{
			id: "fixed-spacing",
			/* PACKAGE-scoped. Padding, gaps and insets in Sable's components sit on
			 * the spacing scale (`p-4`, `--spacing(4)`, `calc(var(--spacing) * 4)`)
			 * because the density ("Character") control works by retuning
			 * `--spacing`. A literal `px-[12px]` or `padding: "1.5rem"` is the one
			 * measure that does not move, so the component comes out half-dense.
			 * Hairlines (≤2px) and em-sized values (which follow the type, by design)
			 * are not spacing and are left alone; positional offsets (top-[-6px] on
			 * an arrow) are geometry, not spacing, and are not matched. */
			scope: "package",
			since: "0.1.0",
			code: true,
			why:
				"A fixed rem/px padding, margin, gap or inset in a component (p-[1.5rem], px-[12px], gap-[0.5rem], padding: \"12px\", \"--card-p\": \"1.5rem\"). Spacing goes on the scale — a step (p-3, gap-2) or `--spacing(n)` / `calc(var(--spacing) * n)` in an arbitrary value — so the density control moves it. Keep fixed units only for what must not scale (a 1px hairline, a ring width), and disable the rule at the site with that reason.",
			find(line) {
				const out = []
				const tooSmall = (n, unit) => Math.abs(Number(n)) <= (unit === "px" ? 2 : 0.125)
				for (const m of line.matchAll(
					/(?:^|[\s"'`:(])(-?(?:p[xytbrlse]?|m[xytbrlse]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|scroll-[pm][xytbrlse]?)-\[(-?\d*\.?\d+)(px|rem)\])/g,
				)) {
					if (!tooSmall(m[2], m[3])) out.push({ match: m[1] })
				}
				for (const m of line.matchAll(
					/\b((?:padding|margin|gap|rowGap|columnGap|inset)(?:Inline|Block)?(?:Top|Bottom|Left|Right|Start|End)?\s*:\s*["'`](-?\d*\.?\d+)(px|rem)\b)/g,
				)) {
					if (!tooSmall(m[2], m[3])) out.push({ match: m[1] })
				}
				for (const m of line.matchAll(
					/(["'`]--[\w-]*(?:-p|-px|-py|-pad|-padding|-gap|-inset)["'`]\s*:\s*["'`](-?\d*\.?\d+)(px|rem)["'`])/g,
				)) {
					if (!tooSmall(m[2], m[3])) out.push({ match: m[1] })
				}
				return out
			},
		},
		{
			id: "physical-direction",
			/* PACKAGE-scoped on purpose, and it is a RATCHET rather than a gate.
			 *
			 * ~56 of Sable's own files carry a physical direction utility today. A rule
			 * that fails on all of them the day it lands is a rule someone turns off,
			 * so `design-lint` holds a per-file baseline (scripts/physical-direction-
			 * baseline.json) and fails only where a file's count goes UP — the same
			 * shape as build-registry's guidance floor: set the bar at what the code
			 * already clears, then lower the baseline as the debt is paid.
			 *
			 * It stays out of `sable-lint` (which drops `scope: "package"`) until the
			 * backfill lands, because a consumer gets no baseline file and would meet
			 * this rule as several hundred unratcheted failures on first upgrade.
			 * Promote to `scope: "both"` when Sable's own baseline reaches zero. */
			scope: "package",
			ratchet: true,
			ratchetHint: "Write the new code with logical properties, or — if this file's geometry is genuinely physical — disable the rule at the site with a reason.",
			code: true,
			why:
				"Direction-dependent spacing/position written as PHYSICAL geometry. Use the logical property — ms-*/me-* (margin), ps-*/pe-* (padding), text-start/text-end, and inset-inline-start/end — so an RTL locale mirrors for free instead of needing a parallel stylesheet. " +
				"Exempt, because the geometry really is physical: a device safe-area edge (the notch does not mirror), anything positioned against a transform/translate (the `left-1/2 -translate-x-1/2` centring idiom is symmetric), and a `data-[side=…]:` guard (the positioner already resolved the side for the writing mode).",
			find(line, ctx) {
				// The safe-area layer: `env(safe-area-inset-left)` names a real edge of
				// a real device. Exempted by file as well as by value, because the
				// helper that builds those insets is keyed on the physical edge names.
				if (/(?:^|\/)_?[Ss]afe[Aa]rea\.tsx?$/.test(ctx?.file ?? "")) return []
				// A transform on the same class string means the offset is being used
				// to centre or nudge, not to pick a side. `left-1/2 -translate-x-1/2`
				// mirrors correctly as written; rewriting it logically would be wrong.
				if (/\b(?:translate|rotate|skew|transform)\b/.test(line)) return []
				const out = []
				for (const m of line.matchAll(physicalDirection)) {
					const util = m[1]
					if (util.includes("safe-area-inset")) continue
					// `data-[side=left]:right-[-6px]` — the anchor positioner emits the
					// side it actually resolved to, so the utility is already correct in
					// both writing modes.
					const before = line.slice(0, m.index + m[0].length - util.length)
					if (/data-\[side=[a-z]+\]:$/.test(before)) continue
					out.push({ match: util })
				}
				return out
			},
		},
		{
			id: "unknown-motion",
			scope: "both",
			why: "Unknown motion token. duration-(--…) must reference a --motion-duration-* token, and ease-* must be a real easing.",
			find(line) {
				const out = []
				for (const m of line.matchAll(/\bduration-\(--([a-z0-9-]+)\)/g)) {
					if (!motionTokens.has(m[1])) out.push({ match: m[0] })
				}
				for (const m of line.matchAll(/\bease-([a-z][a-z-]*)\b/g)) {
					if (!easeNames.has(m[1])) out.push({ match: m[0] })
				}
				return out
			},
		},
	]
}

/* ── Disable-directive parser (with mandatory reason). ─────────────────────────
   A contract still needs a rare, AUDITABLE exception:
     // design-lint-disable-next-line <ruleId> -- <why>
     ...code...                        // design-lint-disable-line <ruleId> -- <why>
     // design-lint-disable <ruleId> -- <why>   (block; until design-lint-enable)
     // design-lint-enable <ruleId>
   A disable with no reason is itself an error — the audit trail is mandatory. */
export const DIRECTIVE =
	/design-lint-(disable-next-line|disable-line|disable|enable)\s+([a-z-]+)\s*(?:--\s*(.*))?$/

export function parseDirectives(lines) {
	const suppress = lines.map(() => new Set())
	const missingReason = []
	const blockOpen = new Map() // ruleId -> startLineIndex (inclusive)

	lines.forEach((line, i) => {
		const m = line.match(DIRECTIVE)
		if (!m) return
		const [, kind, ruleId, reason] = m
		const hasReason = reason && reason.trim().length > 0
		if (kind !== "enable" && !hasReason) {
			missingReason.push({ line: i + 1, ruleId })
			return // no reason → directive is void, violation will surface
		}
		if (kind === "disable-line") suppress[i].add(ruleId)
		else if (kind === "disable-next-line") {
			if (i + 1 < suppress.length) suppress[i + 1].add(ruleId)
		} else if (kind === "disable") blockOpen.set(ruleId, i)
		else if (kind === "enable") {
			const start = blockOpen.get(ruleId)
			if (start != null) {
				for (let j = start; j <= i; j++) suppress[j].add(ruleId)
				blockOpen.delete(ruleId)
			}
		}
	})
	// An unterminated block disables to EOF.
	for (const [ruleId, start] of blockOpen) {
		for (let j = start; j < suppress.length; j++) suppress[j].add(ruleId)
	}
	return { suppress, missingReason }
}

/**
 * Lint one file's text. Returns [{ line, ruleId, match, why }].
 *
 * Shared so the two linters cannot disagree about what a violation is — including
 * the subtle part: a directive comment's own reason text usually names the very
 * pattern it excepts ("#000 is mask machinery"), so the reason must not itself be
 * scanned.
 */
/**
 * Blank out comment CONTENT while preserving every newline, so line numbers in
 * the stripped copy still match the original.
 *
 * Rules that opt in with `code: true` are checked against this instead of the
 * raw line. The case that forced it: a doc comment explaining *why* a container
 * uses `overflow-y-auto` is prose, styles nothing, and had no business tripping
 * a rule about scroll containers — and a comment-prefix heuristic cannot see
 * that a continuation line inside a block comment is still a comment.
 *
 * Every rule that matches a CLASS STRING opts in, because the same
 * failure kept recurring and it is worse than mere noise. A codebase that fixed
 * an anti-pattern properly tends to leave a comment SAYING SO — and the comment
 * names the thing it removed. Two independent hits in one afternoon: a Sable doc
 * comment describing the `transition-colors` rule tripped that rule, and a
 * consuming app's comment recording that a stray `z-[60]` had been measured and
 * deleted was reported as a live `raw-z-index`. In both, the linter was flagging
 * the evidence that the work was done. That is precisely how a team concludes
 * the tool cries wolf and stops reading it.
 *
 * Deliberately NOT opted in: `inline-color`, `palette-ref` and the token-name
 * checks. A hex in prose is usually a real reference to a real value, and those
 * two rules are the ones with the strongest "zero sanctioned exceptions" stance
 * — better they over-report into a visible disable than quietly skip a literal
 * that a comment happens to sit beside.
 */
function stripComments(src) {
	return src
		.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
		.replace(/(^|[^:])\/\/[^\n]*/gm, (m, p) => p + " ".repeat(m.length - p.length))
}

export function lintText(text, rules, ctx) {
	const lines = text.split(/\r?\n/)
	const codeLines = stripComments(text).split(/\r?\n/)
	const { suppress, missingReason } = parseDirectives(lines)
	const out = []

	for (const { line, ruleId } of missingReason) {
		out.push({
			line,
			ruleId: "directive-reason",
			match: `design-lint-disable ${ruleId}`,
			why: "A design-lint-disable directive MUST state a reason after `--`. The exception has to be auditable.",
		})
	}

	lines.forEach((line, i) => {
		const di = line.indexOf("design-lint-")
		let scanned = di === -1 ? line : line.slice(0, di)

		/* In a stylesheet, a custom-property DECLARATION is theme authoring, and
		 * blanking it exempts both halves at once: the name (`--brand-500` is a
		 * legitimate token to define, even though the same string as a *reference*
		 * is a palette leak) and the value (`oklch(…)` is how a colour token is
		 * declared at all). A REFERENCE survives, because `var(--zinc-700)` does not
		 * match `--zinc-700:` — so borrowing someone's palette step still fires,
		 * which is the actual rule. Without this, the linter is unusable on the one
		 * file type where colour literals belong. */
		if (ctx?.isStylesheet) scanned = scanned.replace(/--[\w-]+\s*:\s*[^;}]*/g, " ")
		// The same slicing applied to the comment-stripped mirror, for `code` rules.
		const codeLine = codeLines[i] ?? ""
		const scannedCode = di === -1 ? codeLine : codeLine.slice(0, di)

		for (const rule of rules) {
			if (rule.file) continue
			if (suppress[i].has(rule.id)) continue
			const subject = rule.code ? scannedCode : scanned
			const hits = rule.find
				? rule.find(subject, ctx)
				: [...subject.matchAll(rule.regex)].map((m) => ({ match: m[0] }))
			for (const h of hits) {
				out.push({ line: i + 1, ruleId: rule.id, match: h.match, why: rule.why })
			}
		}
	})

	/* Whole-file rules. A line-at-a-time matcher can only ask questions about one
	 * line, and the useful question about a JSX element ("it reacts to a pointer —
	 * does it do so with motion?") spans the whole tag, which is routinely a dozen
	 * lines of attributes. These get the full text and report a character offset,
	 * which is converted to a line here so `design-lint-disable-next-line` keeps
	 * working exactly as it does for every other rule. */
	const fileRules = rules.filter((r) => r.file)
	if (fileRules.length) {
		// Offset → line, by counting newlines before it. Built once per file.
		const lineStarts = [0]
		for (let i = 0; i < text.length; i++) if (text[i] === "\n") lineStarts.push(i + 1)
		const lineOf = (index) => {
			let lo = 0
			let hi = lineStarts.length - 1
			while (lo < hi) {
				const mid = (lo + hi + 1) >> 1
				if (lineStarts[mid] <= index) lo = mid
				else hi = mid - 1
			}
			return lo
		}
		const strippedText = stripComments(text)
		for (const rule of fileRules) {
			for (const h of rule.scan(rule.code ? strippedText : text, ctx)) {
				const i = h.line != null ? h.line - 1 : lineOf(h.index ?? 0)
				if (suppress[i]?.has(rule.id)) continue
				out.push({ line: i + 1, ruleId: rule.id, match: h.match, why: rule.why })
			}
		}
	}

	return out
}

/** Group + print violations. Shared so both linters read identically. */
export function report(label, violations, filesScanned, footer) {
	if (violations.length === 0) {
		console.log(`[${label}] ✓ ${filesScanned} files clean — the contract holds.`)
		return 0
	}
	console.error(`[${label}] ✗ ${violations.length} violation(s) in ${filesScanned} files:\n`)
	const byRule = new Map()
	for (const v of violations) {
		if (!byRule.has(v.ruleId)) byRule.set(v.ruleId, [])
		byRule.get(v.ruleId).push(v)
	}
	for (const [ruleId, list] of byRule) {
		console.error(`  ● ${ruleId} — ${list[0].why}`)
		for (const v of list) console.error(`      ${v.file}:${v.line}  →  ${v.match}`)
		console.error("")
	}
	console.error(footer)
	return 1
}
