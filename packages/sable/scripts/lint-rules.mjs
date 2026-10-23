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

const STEP = "(?:50|100|200|300|400|500|600|700|800|900|950)"
/** Every family Tailwind ships, whether or not Sable generates it. */
const TAILWIND_FAMILIES = ["slate", "gray", "grey", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"]
/** The tones that get a generated scale — keep in step with PALETTE_TONES in src/lib/palette.ts. */
const PALETTE_TONE_SCALES = ["tone-1", "tone-2", "tone-3", "tone-info", "tone-warning", "success", "destructive"]
/** Everything src/palette.css generates — keep in step with PALETTE_SCALES in src/lib/palette.ts. */
export const PALETTE_SCALES = ["neutral", "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink", ...PALETTE_TONE_SCALES]

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
		yield { tag: m[1], attrs: text.slice(m.index + m[0].length, i), index: m.index, end: i }
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

/**
 * Every class token in a className expression, with its variant prefixes (`hover:`, `md:`) split off.
 * `variants` are the top-level prefixes only: `[@media(hover:none)]:opacity-100`
 * has the ONE variant `[@media(hover:none)]` — the `hover:` inside the brackets
 * is a media feature, not a variant.
 */
function classTokens(expr) {
	const out = []
	for (const s of expr.matchAll(/(["'`])((?:(?!\1).)*)\1/gs)) {
		for (const raw of s[2].split(/\s+/)) {
			if (!raw || raw.includes("${")) continue
			// The base utility is what follows the last `:` outside brackets.
			let depth = 0
			let from = 0
			const variants = []
			for (let k = 0; k < raw.length; k++) {
				if (raw[k] === "[" || raw[k] === "(") depth++
				else if (raw[k] === "]" || raw[k] === ")") depth--
				else if (raw[k] === ":" && depth === 0) {
					variants.push(raw.slice(from, k))
					from = k + 1
				}
			}
			out.push({ raw, base: raw.slice(from).replace(/^!/, ""), variants })
		}
	}
	return out
}

/** A variant that styles a pointer state: hover, active, focus-visible — and their group-/peer- (optionally /named) forms. */
const POINTER_STATE_VARIANT = /^(?:(?:group|peer)-)?(?:hover|active|focus-visible)(?:\/[\w-]+)?$/

/** Utilities that set a property no transition can interpolate: display, visibility, text-decoration-line. */
const DISCRETE_UTILITY = /^(?:hidden|block|inline|inline-block|flex|inline-flex|grid|inline-grid|contents|table|invisible|visible|collapse|underline|overline|line-through|no-underline)$/

/* ── Assembly lookalikes: the shared reading of an element and its content. ────
 * lookalike-control sees a control by its clothes. The four lookalike-* rules
 * below see the bigger pieces an app assembles from Sable's utilities and tokens
 * — a card grid, a link tile, an avatar chip, a cover frame — which every token
 * rule passes, because every class on them is legal. An e2e build shipped all
 * four through lint, a 100/100 grade and a visual review; a source audit found
 * them. The helpers here are what those rules and grade's surface inventory read. */

/** Breakpoint variants that Grid's `cols` map takes (Tailwind's defaults). */
const BREAKPOINT_VARIANT = /^(?:sm|md|lg|xl|2xl)$/

/** Children that make a grid a form layout, not a collection: fields and their parts. */
const FORM_PART = /^(?:input|select|textarea|label|fieldset|legend|button|option)$|Field|Input|Label|Select|Textarea|Checkbox|Switch|Radio|Combobox|Slider|Button|Fieldset|Form/

/** A corner radius that makes a box a surface: any step but none or full. */
const SURFACE_RADIUS = /^rounded(?:-(?:xs|sm|md|lg|xl|[2-4]xl|\[[^\]]+\]|\([^)]+\)|concentric[\w-]*))?$/

/** A fixed square-ish measure: `size-12`, `size-[52px]`, `size-(--x)`. Percentages and keywords are not fixed. */
const FIXED_MEASURE = /^(?:\d+(?:\.\d+)?|\[[^\]%]+\]|\([^)%]+\))$/

/** Media an avatar or a cover frame holds. */
const MEDIA_CHILD = /<(?:img|picture|video|GradientArt|Image)\b/

/**
 * The text with the literal part of every template literal that holds MARKUP
 * blanked (length and newlines kept, so offsets and line numbers hold). A docs
 * page carries JSX as data — a code sample in a backtick string — and a lookalike
 * rule must not report the sample. A className template (`grid ${cols}`) carries
 * no `<tag`, so it is kept and its classes still count.
 */
function maskMarkupTemplates(text) {
	const out = text.split("")
	const stack = [] // { from, segs } = inside a template literal; number = brace depth of a ${ } inside one
	let quote = null
	const close = (t) => {
		if (!t.segs.some(([a, b]) => /<[A-Za-z]/.test(text.slice(a, b)))) return
		for (const [a, b] of t.segs) for (let k = a; k < b; k++) if (out[k] !== "\n") out[k] = " "
	}
	for (let i = 0; i < text.length; i++) {
		const c = text[i]
		const top = stack[stack.length - 1]
		if (top && typeof top === "object") {
			if (c === "\\") i++
			else if (c === "`") {
				top.segs.push([top.from, i])
				stack.pop()
				close(top)
			} else if (c === "$" && text[i + 1] === "{") {
				top.segs.push([top.from, i])
				stack.push(0)
				i++
			}
			continue
		}
		if (quote) {
			// JSX text is full of apostrophes; a quote never spans a line in code.
			if (c === "\\") i++
			else if (c === quote || c === "\n") quote = null
			continue
		}
		if (c === "'" || c === '"') quote = c
		else if (c === "`") stack.push({ from: i + 1, segs: [] })
		else if (typeof top === "number") {
			if (c === "{") stack[stack.length - 1]++
			else if (c === "}") {
				if (top === 0) {
					stack.pop()
					stack[stack.length - 1].from = i + 1
				} else stack[stack.length - 1]--
			}
		}
	}
	return out.join("")
}

/** Index of the `}` closing the `{` at `i`. Strings are skipped; a quote ends at a line break (JSX text). */
function skipBraces(text, i) {
	let depth = 0
	let quote = null
	for (; i < text.length; i++) {
		const c = text[i]
		if (quote) {
			if (c === "\\") i++
			else if (c === quote || (c === "\n" && quote !== "`")) quote = null
			continue
		}
		if (c === '"' || c === "'" || c === "`") quote = c
		else if (c === "{") depth++
		else if (c === "}" && --depth === 0) return i
	}
	return text.length
}

/** Index of the `>` ending the tag that opens at `i`, as openingTags finds it. */
function tagEnd(text, i) {
	let depth = 0
	let quote = null
	for (i++; i < text.length; i++) {
		const c = text[i]
		if (quote) {
			if (c === "\\") i++
			else if (c === quote) quote = null
			continue
		}
		if (c === '"' || c === "'" || c === "`") quote = c
		else if (c === "{") depth++
		else if (c === "}") depth--
		else if (c === ">" && depth === 0) return i
	}
	return text.length
}

/**
 * What an element directly holds: the tag names of its child elements, its
 * child `{…}` expressions, its loose text, and its whole inner source. Lexical,
 * like everything here: it pairs `<x>` with `</x>` by depth and skips `{…}`
 * whole, so a comparison inside an expression cannot open a tag.
 */
function elementContent(text, open) {
	const out = { tags: [], exprs: [], text: "", inner: "" }
	if (/\/\s*$/.test(open.attrs)) return out // self-closing
	const start = open.end + 1
	const limit = Math.min(text.length, start + 40000)
	let depth = 0
	let i = start
	while (i < limit) {
		const c = text[i]
		if (c === "{") {
			const j = skipBraces(text, i)
			if (depth === 0) out.exprs.push(text.slice(i + 1, j))
			i = j + 1
			continue
		}
		if (c === "<" && text[i + 1] === "/") {
			if (depth === 0) break
			depth--
			const j = text.indexOf(">", i)
			i = j === -1 ? limit : j + 1
			continue
		}
		if (c === "<" && /[A-Za-z>]/.test(text[i + 1] ?? "")) {
			const name = /^<([A-Za-z][\w.]*)?/.exec(text.slice(i, i + 80))?.[1]
			const j = tagEnd(text, i)
			if (depth === 0 && name) out.tags.push(name)
			if (text[j - 1] !== "/") depth++
			i = j + 1
			continue
		}
		if (depth === 0) out.text += c
		i++
	}
	out.inner = text.slice(start, i)
	return out
}

/**
 * Is the tag at `index` the element handed to a component's `render` prop?
 * `<Card render={<a href="/x" className="…" />}>` already renders the Sable
 * component; its element's classes are not an app-built surface.
 */
function insideRender(text, index) {
	// The nearest `render={` before the tag whose brace is still open at it —
	// which also covers a render function, `render={({ className, ...props }) => <a …`.
	const before = text.slice(Math.max(0, index - 600), index)
	const opens = [...before.matchAll(/\brender\s*=\s*\{/g)]
	const last = opens[opens.length - 1]
	if (!last) return false
	let depth = 0
	for (let k = last.index + last[0].length - 1; k < before.length; k++) {
		if (before[k] === "{") depth++
		else if (before[k] === "}") depth--
	}
	return depth > 0
}

/** Unprefixed class bases (no `md:`, `hover:`…) of an element, plus every token. */
function classesOf(attrs) {
	const tokens = classTokens(classNameOf(attrs))
	const plain = tokens.filter((t) => !t.variants.length).map((t) => t.base)
	return { tokens, plain, has: (re) => plain.some((b) => re.test(b)), find: (re) => plain.find((b) => re.test(b)) }
}

/** A fixed size on a round box: `size-12`, or equal `h-*` and `w-*`. Returns the measure or null. */
function fixedSize(c) {
	const size = c.find(/^size-/)?.slice(5)
	if (size && FIXED_MEASURE.test(size)) return size
	const h = c.find(/^h-/)?.slice(2)
	const w = c.find(/^w-/)?.slice(2)
	return h && h === w && FIXED_MEASURE.test(h) ? h : null
}

/** Padding big enough for a card: p-3 and up (or py-3 and up), or an arbitrary/var padding. */
function cardPadding(c) {
	return c.plain.some((b) => {
		const m = /^p[y]?-(?:(\d+(?:\.\d+)?)|\[[^\]]+\]|\([^)]+\))$/.exec(b)
		return m && (m[1] == null || Number(m[1]) >= 3)
	})
}

/** Grid's `gap` prop for a Tailwind `gap-N` (rhythm units are 2 spacing steps). */
function gridGap(c) {
	const n = /^gap-(\d+(?:\.\d+)?)$/.exec(c.find(/^gap-\d/) ?? "")?.[1]
	return n == null ? "" : ` gap={${Number(n) / 2}}`
}

/** `aspect-*` → AspectBox's ratio, as source. */
function aspectRatio(base) {
	if (base === "aspect-square") return "1"
	if (base === "aspect-video") return "16 / 9"
	const m = /^aspect-(?:\[(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)\]|(\d+)\/(\d+))$/.exec(base)
	return m ? `${m[1] ?? m[3]} / ${m[2] ?? m[4]}` : "…"
}

/**
 * The app-owned surfaces in one file: intrinsic elements wearing a surface's
 * or a shape's classes. Not failures — a review list, so an agent's reuse
 * inventory starts from what the source actually holds rather than from memory.
 * `sable grade` collects it and `sable check` prints it.
 *
 *   surface      bg-card / bg-popover, or border + radius + padding   → Card (or the component that owns it)
 *   media frame  aspect-* + overflow-hidden                           → AspectBox
 *   round        rounded-full at a fixed size                         → Avatar, or StatusDot for a dot
 */
export function surfaceInventory(text) {
	const src = maskMarkupTemplates(stripComments(text))
	const out = []
	for (const m of openingTags(src, /^[a-z][a-z0-9]*$/)) {
		if (insideRender(src, m.index)) continue
		const c = classesOf(m.attrs)
		if (!c.plain.length) continue
		let kind = null
		let consider = null
		const size = c.has(/^rounded-full$/) ? fixedSize(c) : null
		if (size) {
			kind = "round"
			const holds = m.tag === "img" || (() => {
				const content = elementContent(src, m)
				return MEDIA_CHILD.test(content.inner) || /^[A-Z]{1,3}$/.test(content.text.trim())
			})()
			consider = holds
				? "Avatar"
				: /^(?:0?\.5|1|1\.5|2|2\.5|3|px)$/.test(size)
					? "StatusDot, if it reports a status"
					: "Avatar if it shows a person; otherwise app-owned (a handle, a swatch)"
		} else if (c.has(/^aspect-(?!auto$)/) && c.has(/^overflow-(?:hidden|clip)$/)) {
			kind = "media frame"
			consider = "AspectBox"
		} else if (
			c.has(/^bg-(?:card|popover)(?:\/|$)/) ||
			(c.has(/^border(?:-\d+)?$/) && c.has(SURFACE_RADIUS) && c.has(/^p[xy]?-/))
		) {
			kind = "surface"
			consider = m.tag === "a" || m.tag === "button" ? `Card render={<${m.tag} />}` : "Card, or the component that owns this surface"
		}
		if (!kind) continue
		const classes = c.plain.join(" ")
		out.push({ index: m.index, tag: m.tag, kind, classes: classes.length > 70 ? `${classes.slice(0, 67)}…` : classes, consider })
	}
	return out
}

/**
 * Class names that say which Sable part an element is standing in for. An app
 * that writes `<span className="crumb">` and styles `.crumb` in its own CSS
 * passes every token rule and the surface inventory above, which reads only
 * Tailwind's utilities: a work tracker shipped hand-built breadcrumbs, a topbar,
 * property rows, a brand row, status dots and an avatar stack through a 100/100
 * grade that way, each a part Sable ships. Matched on the whole class, or the
 * class minus its leading app words (`issue-toolbar` → `toolbar`), so a word
 * inside a longer name (`property-label`) does not count. Curated, like
 * adoption's aliases: these are names an app gives a rebuilt part.
 */
const PART_CLASSES = [
	[/^(?:bread)?crumbs?$/, "Breadcrumbs"],
	[/^(?:top|app|header|title)-?bar$/, "WorkspaceBar", "in a Workspace; AppHeader on a page"],
	[/^tool-?bar$/, "Toolbar"],
	[/^tab-?bar$/, "TabsList"],
	[/^status-?bar$/, "StatusBar"],
	[/^(?:property|prop-row|property-row|meta-row)$/, "PropertyRow"],
	[/^(?:brand|logo)(?:-row)?$/, "SidebarBrand"],
	[/^(?:[a-z]+-)?dot$/, "StatusDot"],
	[/^(?:avatars|avatar-(?:stack|group|list|row)|(?:team|user|member)-avatars|facepile)$/, "AvatarGroup"],
	[/^(?:account|profile)-(?:row|menu|footer|switcher)$|^user-(?:menu|footer)$|^(?:sidebar|nav|rail)-(?:footer|account|user)$/, "SidebarAccount", "in SidebarFooter, as the account Menu's trigger"],
	[/^(?:nav|sidebar|rail)-(?:group|section)(?:-label)?$/, "SidebarGroup"],
	[/^(?:notifications?|(?:notification|file|list|user|member|contact)-(?:row|item))$/, "Entity", "rows in a CardList"],
	[/^(?:kbd|keycap)$/, "Kbd"],
	[/^(?:badge|chip|pill)$/, "Badge"],
	[/^(?:empty-state|blank-state)$/, "EmptyState"],
	[/^(?:spinner|loader)$/, "Spinner"],
	[/^skeleton$/, "Skeleton"],
	[/^(?:divider|separator)$/, "Separator"],
	[/^progress(?:-bar|-track)?$/, "Progress"],
	[/^(?:modal|dialog)$/, "Dialog"],
	[/^(?:drawer|side-sheet)$/, "Sheet"],
	[/^segmented(?:-control)?$/, "ToggleGroup"],
]
/** Tailwind utilities, whose last word can look like a part name (`bg-card`). */
const UTILITY_CLASS = /^(?:bg|text|border|ring|shadow|fill|stroke|outline|from|to|via|divide|accent|caret|decoration|placeholder|size|w|h|min|max|p[xytrbl]?|m[xytrbl]?|gap|rounded|motion|sable)-/

/**
 * The elements in one file whose class names mirror a Sable part, for the
 * reuse inventory. `parts` is the set of names Sable exports (components and
 * their parts), so a map entry the catalog does not have is never reported.
 * An element that already holds the part (`<div className="tabbar"><TabsList>`)
 * is a layout wrapper, not a rebuild, and is skipped.
 */
export function partMirrors(text, parts) {
	const src = maskMarkupTemplates(stripComments(text))
	const out = []
	for (const m of openingTags(src, /^[a-z][a-z0-9]*$/)) {
		if (insideRender(src, m.index)) continue
		for (const token of classesOf(m.attrs).plain) {
			if (UTILITY_CLASS.test(token) || !/^[a-z][a-z0-9-]*$/.test(token)) continue
			const words = token.split("-")
			const candidates = words.map((_, i) => words.slice(i).join("-"))
			const hit = PART_CLASSES.find(([re]) => candidates.some((c) => re.test(c)))
			if (!hit || !parts.has(hit[1])) continue
			if (new RegExp(`<${hit[1]}\\b`).test(elementContent(src, m).inner)) continue
			out.push({ index: m.index, tag: m.tag, token, part: hit[1], ...(hit[2] ? { hint: hit[2] } : {}) })
			break
		}
	}
	return out
}

/**
 * Sable parts composed in a way another part already does better: the shape a
 * records workspace drifted into when nothing said otherwise. Read lexically
 * from one file's JSX, so each is a note for the reuse inventory, never a
 * failure. `parts` is the set of names the installed catalog exports, so a note
 * never points at a part this version does not have.
 */
const COMPOSITION_NOTES = [
	{
		within: "Sidebar",
		has: /<SideNav\b/,
		what: "SideNav inside a Sidebar",
		consider: "SidebarNav with SidebarGroup and SidebarItem: the rail's own rows, on the same columns as SidebarBrand and SidebarAccount (SideNav brings another set)",
		needs: "SidebarGroup",
	},
	{
		within: "SidebarFooter",
		has: /<(?:Entity|Badge)\b/,
		what: "an Entity or Badge in the rail's footer",
		consider: "SidebarAccount as the account Menu's trigger: one row, with settings and appearance in its menu and a detail line in place of a badge",
		needs: "SidebarAccount",
	},
	{
		within: "CollapsiblePanel",
		has: /<DataTable\b/,
		what: "a DataTable per group inside Collapsibles",
		consider: "one DataTable with groupBy and groups: one header, columns that line up, a count and an add action per group",
		needs: "DataTable",
	},
	{
		within: "WorkspaceBar",
		has: /<TabsList(?![^>]*variant=)/,
		what: "underline tabs in a WorkspaceBar",
		consider: "TabsList variant=\"pill\": a view switch in tool chrome reads as a control beside the bar's others; underline is the page-section idiom",
		needs: "Tabs",
	},
]

export function compositionNotes(text, parts) {
	const src = stripComments(text)
	const out = []
	for (const note of COMPOSITION_NOTES) {
		if (!parts.has(note.needs)) continue
		const open = new RegExp(`<${note.within}\\b[^>]*>`, "g")
		for (const m of src.matchAll(open)) {
			const end = src.indexOf(`</${note.within}>`, m.index)
			if (end < 0) continue
			const inner = src.slice(m.index + m[0].length, end)
			const hit = note.has.exec(inner)
			if (!hit) continue
			out.push({ index: m.index + m[0].length + hit.index, what: note.what, consider: note.consider })
			break
		}
	}
	// Menus side by side, each its own: a File / Edit / View row that the
	// keyboard can't walk (no ←/→ between titles) and the pointer can't sweep (no
	// hover switch once one is open). Only TITLED triggers count, since a word
	// is what makes a menu bar: a literal trigger whose content is text, or a
	// local wrapper (`function BarMenu`) that renders one and is called with a
	// `label`/`title` string. A row menu repeated down a list (an icon trigger,
	// or a wrapper called per item) is not a menu bar.
	if (parts.has("Menubar") && !/<Menubar\b/.test(src)) {
		const literal = [...src.matchAll(/<MenuTrigger\b/g)]
		// The trigger's own content: its tag (a render={<Button>File</Button>}
		// lives there) and, unless it self-closes, its children. Walked by brace
		// depth, since the render prop's JSX has its own `>` and `/>`.
		const titled = (at) => {
			let depth = 0
			let i = at
			for (; i < src.length; i++) {
				const c = src[i]
				if (c === "{") depth++
				else if (c === "}") depth--
				else if (depth === 0 && c === ">") break
			}
			const selfClosing = src[i - 1] === "/"
			const close = selfClosing ? -1 : src.indexOf("</MenuTrigger>", i)
			const inner = src.slice(at, close < 0 ? i + 1 : close + 1)
			return !/<Icon\b/.test(inner) && />\s*[A-Z][\w &]{0,24}\s*</.test(inner)
		}
		let triggers = literal.filter((m) => titled(m.index)).length
		for (const m of src.matchAll(/function\s+([A-Z]\w*)\s*\(|const\s+([A-Z]\w*)\s*=\s*\(/g)) {
			const name = m[1] ?? m[2]
			const next = src.slice(m.index + m[0].length).search(/\n(?:export\s+)?(?:function|const)\s+[A-Z]/)
			const body = src.slice(m.index, next < 0 ? src.length : m.index + m[0].length + next)
			if (/<MenuTrigger\b/.test(body))
				triggers += [...src.matchAll(new RegExp(`<${name}\\b[^>]*\\b(?:label|title)=["'][^"']+["']`, "g"))].length
		}
		if (triggers >= 2 && literal[0])
			out.push({ index: literal[0].index, what: `${triggers} menus side by side, each its own`, consider: "Menubar with MenubarTrigger titles, when they are the app's menus (File, Edit, View): ←/→ moves between them and hover switches once one is open. Unrelated menus in a toolbar stay separate" })
	}
	// A native date field: the OS draws its own format and size, beside a
	// product that formats dates its own way everywhere else.
	const date = /<(?:input|Input)\b[^>]*\btype=["']date["']/.exec(src)
	if (date && parts.has("DatePicker"))
		out.push({ index: date.index, what: "a native date input", consider: "DatePicker (size=\"xs\" in a property row, formatOptions for the trigger text)" })
	return out
}

/**
 * Build the rule table against a token contract.
 *
 * @param {{ semanticTokens: Set<string>, motionTokens: Set<string>, labelContrast?: ((css: string) => { index: number, match: string }[]) | null, statusText?: ((css: string) => { index: number, match: string }[]) | null }} contract
 *   `labelContrast` and `statusText` are the stylesheet scanners from
 *   label-contrast.mjs. They are passed in so this table stays dependency free;
 *   without one its rule is listed and reports nothing.
 */
export function makeRules({ semanticTokens, motionTokens, labelContrast = null, statusText = null }) {
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
			why: "Inline oklch()/hex color. Use a semantic token (bg-card, text-tone-1-foreground, bg-overlay…). Literal colors belong only in a theme file.",
			regex: /oklch\s*\(|#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g,
		},
		{
			id: "palette-ref",
			scope: "package",
			why: "Palette-step reference (e.g. --zinc-950, text-(--purple-heart-700), border-orange-500, bg-tone-1-100) in a component. A component paints roles only, so it re-themes with the role; the generated palette is for apps. After the tone-foreground + overlay tokens, this rule has ZERO sanctioned exceptions.",
			// Two shapes, and the second is the one that got away. A CSS var ending in
			// a ramp step catches `--zinc-950`; a bare Tailwind palette utility catches
			// `border-orange-500`, which is what actually shipped in a consumer app for
			// weeks. Semantic/layout/motion tokens never end in a numeric step, so both
			// halves are theme-agnostic.
			regex: new RegExp(
				`--[a-zA-Z][\\w-]*-${STEP}\\b` +
					`|\\b${COLOR_PREFIX}-(?:${[...TAILWIND_FAMILIES, ...PALETTE_TONE_SCALES].join("|")})-${STEP}\\b`,
				"g",
			),
		},
		{
			id: "palette-ref",
			scope: "consumer",
			why: "Palette step that does not follow the theme (e.g. --zinc-950, text-(--purple-heart-700), bg-lime-500). Sable generates neutral, red, orange, yellow, green, teal, blue, purple and pink, plus a scale under every tone (bg-tone-1-100), all from the active theme — use one of those for decorative or categorical colour, and a semantic token for surfaces, text and actions. A theme's own ramps are internal, and Tailwind's other families are switched off.",
			// The generated palette (src/lib/palette.ts) is themed, so an app may use
			// it; anything else ending in a step is a theme's internal ramp or a
			// Tailwind family Sable switched off, and paints nothing or the wrong thing.
			regex: new RegExp(
				`--(?!(?:${PALETTE_SCALES.join("|")})-${STEP}\\b)[a-zA-Z][\\w-]*-${STEP}\\b` +
					`|\\b${COLOR_PREFIX}-(?:${TAILWIND_FAMILIES.filter((name) => !PALETTE_SCALES.includes(name)).join("|")})-${STEP}\\b`,
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
					// Judged on the parsed variants, not a regex over the text: a
					// capability query like `[@media(hover:none)]:opacity-100` has
					// "hover:" in it and no pointer state at all.
					const states = classTokens(classNameOf(attrs)).filter(({ variants }) =>
						variants.some((v) => POINTER_STATE_VARIANT.test(v)),
					)
					const pointer = states[0]
					if (!pointer) continue
					if (/\bmotion-[a-z-]+/.test(attrs)) continue
					// `reveal-on-hover` declares motion-interactive's own transition
					// list, so for this rule it is a recipe.
					if (/\breveal-on-hover\b/.test(attrs)) continue
					// `transition-colors` is already caught by its own rule and its fix is
					// the same recipe; reporting both on one element is noise.
					if (/\btransition-colors\b/.test(attrs)) continue
					out.push({
						index: m.index,
						match: `<${m.tag} …${pointer.raw}`,
						// `motion-interactive` cannot help a state that only flips display
						// or an underline: there is nothing to interpolate. Point at the
						// fix that can.
						...(states.every(({ base }) => DISCRETE_UTILITY.test(base)) && {
							why:
								"An element whose pointer state only flips a discrete property (display, visibility, an underline), which no transition can animate, so `motion-interactive` alone will not help. " +
								"To reveal an action on hover, keep it rendered and put `reveal-on-hover` on it with `group` on its row or tile: it fades with opacity, shows on focus, and stays visible on touch, where a hand-written `opacity-0 group-hover:opacity-100` hides it for good. To cross-fade two icons, `motion-icon-swap`. " +
								"If an instant flip is the intent, disable the rule on that line with the reason.",
						}),
						// A group-hover opacity swap is a hover REVEAL, and adding
						// motion-interactive to it would still leave the action invisible on
						// every touch device. Point at the utility that is right on both.
						...(states.some(({ base, variants }) => /^opacity-/.test(base) && variants.some((v) => /^group-hover\b/.test(v))) && {
							why:
								"A hover reveal (`group-hover:opacity-*`) with no motion — and, as written, an action no touch device can ever see, because touch has no hover. " +
								"Use `reveal-on-hover` on the action with `group` on its row or tile: it is hidden only where `(hover: hover)`, shows on focus-within, keeps an open menu's trigger visible, and fades on the motion tokens.",
						}),
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
			id: "shadcn-leftover",
			/* CONSUMER-scoped. A shadcn/Radix migration is done when nothing still
			 * imports the old stack. The leftovers compile and mostly render, which is
			 * the problem: a Radix Dialog beside Sable's has its own focus, layering
			 * and motion, and `asChild` on a Sable trigger is silently ignored (Base
			 * UI composes through `render`). The migration guide used to end with a
			 * grep for these; the grep is now this rule. A deliberate keeper, such as
			 * a Radix part Sable does not ship yet, takes a reasoned disable. */
			scope: "consumer",
			since: "0.12.0",
			file: true,
			code: true,
			why:
				"Leftover shadcn/ui or Radix code. Sable replaces the stack: `asChild` → `render`, `@radix-ui/*` and `@/components/ui/*` → the Sable component (`sable search \"<name>\"`), `lucide-react` → <Icon name> under IconProvider, `sonner` → ToastProvider + toast, `vaul` → Sheet, `cmdk` → CommandMenu, `input-otp` → OtpField, `next-themes` → SableThemeProvider. `sable docs migrating-from-shadcn` has the full map.",
			scan(text) {
				const REPLACEMENT = {
					"lucide-react": "<Icon name> under IconProvider",
					sonner: "ToastProvider + toast",
					vaul: "Sheet",
					cmdk: "CommandMenu",
					"input-otp": "OtpField",
					"next-themes": "SableThemeProvider",
				}
				const out = []
				for (const m of text.matchAll(/from\s+["']((@radix-ui\/[\w-]+)|[@~]\/components\/ui(?:\/[\w-]+)?|lucide-react|sonner|vaul|cmdk|input-otp|next-themes)["']/g)) {
					const target = REPLACEMENT[m[1]] ?? "the Sable component (sable search)"
					out.push({ index: m.index, match: `import from "${m[1]}" → ${target}` })
				}
				// The JSX prop, not prose: `<DialogTrigger asChild>`, `asChild={true}`.
				for (const m of text.matchAll(/<[A-Z][\w.]*\b[^<>]*?\s(asChild)(?=[\s=/>])/g))
					out.push({ index: m.index + m[0].lastIndexOf("asChild"), match: "asChild → render={<Element />}" })
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
				"A raw element dressed as a Sable component. `border-field-border` (or the older `border-input`) is the field shell (Input, Textarea, SearchInput, Select…); a `bg-primary` / `bg-secondary` / `bg-destructive` fill or a `--control-*` height on a <button> or <a> is a Button. Hand-built, they drift from the component — no density, no loading or disabled states, no focus contract — and every token on them still passes lint. Use the component: Button (a link takes `render={<a href=… />}`), Input / SearchInput, or CommandMenuTrigger for a search-shaped button that opens a palette. If none fits, that is a library gap: say so, then take the escape hatch with the reason.",
			scan(text) {
				const out = []
				for (const m of openingTags(text, /^[a-z][a-z0-9]*$/)) {
					// Native fields are hand-rolled-control's job; don't double-report.
					if (m.tag === "input" || m.tag === "textarea" || m.tag === "select") continue
					const cls = /\bclassName\s*=\s*\{?\s*(?:cn\()?\s*["'`]([^"'`]*)["'`]/.exec(m.attrs)?.[1] ?? ""
					if (!cls) continue
					// The shell's outline is `border-field-border` (since the field tokens);
					// `border-input` is what it was, and what a hand copy still reaches for.
					const shell = /(?:^|\s)(border-input|border-field-border)(?=\s|$)/.exec(cls)?.[1]
					if (shell) {
						out.push({ index: m.index, match: `<${m.tag}> with the field shell (${shell}) → use Input / SearchInput / CommandMenuTrigger` })
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
		/* ── Assembly lookalikes. The siblings of lookalike-control for the pieces
		 * bigger than a control: a card grid, a link tile, an avatar, a cover frame.
		 * One id each, so an exception is disabled for the one shape it covers.
		 * CONSUMER-scoped: the package's own components are where these are built.
		 * Each one demands a signal beyond the classes that a single legitimate use
		 * would not carry — mapped items, a fill AND padding, content in the circle,
		 * media in the frame — because a lookalike rule that fires on a form layout
		 * or a text link is a rule people learn to disable. */
		{
			id: "lookalike-grid",
			scope: "consumer",
			since: "0.7.0",
			file: true,
			code: true,
			why:
				"A raw CSS grid laid over a collection — `grid` with an auto-fill/auto-fit `minmax()` track, or uniform `grid-cols-N` columns over mapped or repeated items. That is Sable's `Grid`: `cols` takes the same counts per breakpoint (`{ base: 2, md: 4 }`), `minItemWidth` is the auto-fit track with a `min(…, 100%)` guard so a cell never overflows a narrow container (a bare `minmax(12rem,1fr)` does), every track is `minmax(0, 1fr)` so one long string cannot blow a column out, and the gap defaults to the theme's `--grid-gutter` or takes rhythm units (`gap={2}` = `gap-4`). " +
				"Not flagged: a grid with no columns, a form layout (field children, no mapping), a non-uniform track (`grid-cols-[auto_1fr]`), a `ul`/`ol`/`dl` (Grid renders a div), or an element with a widget role.",
			scan(text) {
				const src = maskMarkupTemplates(text)
				const out = []
				for (const m of openingTags(src, /^div$/)) {
					if (insideRender(src, m.index)) continue
					// A widget or a graphic (role="img", "grid", "radiogroup") owns its own
					// semantics; a list role is still a collection.
					if (/\brole\s*=/.test(m.attrs) && !/\brole\s*=\s*\{?\s*["'`]list["'`]/.test(m.attrs)) continue
					const c = classesOf(m.attrs)
					if (!c.has(/^grid$/)) continue
					const tracks = c.tokens.filter((t) => /^grid-cols-/.test(t.base))
					if (!tracks.length) continue
					const auto = tracks
						.map((t) => /^grid-cols-\[repeat\(auto-(?:fill|fit),\s*minmax\((min\([^)]*\)|[^,]+),/.exec(t.base))
						.find(Boolean)
					if (auto) {
						const min = auto[1].replace(/_/g, " ").replace(/^min\(\s*([^,]+),.*$/, "$1").trim()
						out.push({ index: m.index, match: `raw auto-fill grid → <Grid minItemWidth="${min}"${gridGap(c)}>` })
						continue
					}
					// Uniform column counts per breakpoint, or nothing: a track Grid cannot
					// express (`[auto_1fr]`, `subgrid`, a container-query variant) is
					// a layout, not a collection grid.
					const cols = {}
					let uniform = true
					for (const t of tracks) {
						const bp = t.variants.length === 0 ? "base" : t.variants.length === 1 && BREAKPOINT_VARIANT.test(t.variants[0]) ? t.variants[0] : null
						const n = /^grid-cols-(?:(\d+)|\[repeat\((\d+),\s*minmax\(0,\s*1fr\)\)\])$/.exec(t.base)
						if (!bp || !n) {
							uniform = false
							break
						}
						cols[bp] = Number(n[1] ?? n[2])
					}
					if (!uniform) continue
					if (Math.max(...Object.values(cols)) < 2) continue
					const content = elementContent(src, m)
					// Children placed by span are an explicit layout (Columns + Col), not
					// a collection of equal cells.
					if (/\b(?:col|row)-(?:span|start|end)-/.test(content.inner)) continue
					// The child expression itself maps (`{items.map(…)}`); a map nested in
					// one child's markup (`{cond ? <Panel>{a.map(…)}</Panel> : null}`) is
					// that child's list, not this grid's cells.
					const mapped = content.exprs.some((e) => /\.(?:flat)?[mM]ap\s*\(|Array\.from\s*\(/.test(e.split("<")[0]))
					// Three or more of the same component or item element. Bare wrappers
					// (div, span, p) say nothing about a collection, and fields make a form.
					const counts = new Map()
					for (const tag of content.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
					const repeated = [...counts].some(([tag, n]) => n >= 3 && !/^(?:div|span|p)$/.test(tag) && !FORM_PART.test(tag))
					if (!mapped && !repeated) continue
					// `grid md:grid-cols-2` is one column until md, as Tailwind's implicit track is.
					if (!("base" in cols)) cols.base = 1
					const order = ["base", "sm", "md", "lg", "xl", "2xl"].filter((b) => b in cols)
					const prop = order.length === 1 ? `{${cols.base}}` : `{{ ${order.map((b) => `${b === "2xl" ? '"2xl"' : b}: ${cols[b]}`).join(", ")} }}`
					out.push({ index: m.index, match: `raw grid over ${mapped ? "mapped" : "repeated"} items → <Grid cols=${prop}${gridGap(c)}>` })
				}
				return out
			},
		},
		{
			id: "lookalike-card",
			scope: "consumer",
			since: "0.7.0",
			file: true,
			code: true,
			why:
				"A link or button dressed as a card — a radius, a surface (`bg-card` / `bg-popover`, or a border) and card padding on an <a>, <button> or router <Link>. That is `<Card render={<Link to=… />}>` (or `<a href>` / `<button>`): rendered as a link or button, Card adds the hover (a stronger edge and shadow), a full-card focus-visible ring and motion-interactive easing; its padding follows the density control (`--card-p`) and its corner follows the theme radius; children answer the hover with `group-hover/card:`. Hand-built, a tile keeps none of that when the theme or density moves. " +
				"Not flagged: a text link, a nav row (no surface), a pill (`rounded-full`), a button fill (lookalike-control's), or an element inside a `render` prop.",
			scan(text) {
				const src = maskMarkupTemplates(text)
				// A `Link` the file takes from Sable is Sable's.
				const sableLinks = new Set(
					[...src.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']@sableui\/react[^"']*["']/g)].flatMap((m) =>
						m[1].split(",").map((s) => s.trim().split(/\s+as\s+/).pop()),
					),
				)
				const out = []
				for (const m of openingTags(src, /^(?:a|button|Link|NavLink)$/)) {
					if (sableLinks.has(m.tag) || insideRender(src, m.index)) continue
					const c = classesOf(m.attrs)
					if (!c.has(SURFACE_RADIUS)) continue
					const fill = c.find(/^bg-(?:card|popover)(?:\/|$)/) ?? c.find(/^sable-surface$/)
					const edge = c.find(/^border(?:-\d+)?$/)
					if (!fill && !edge) continue
					if (!cardPadding(c)) continue
					if (c.has(/^bg-(?:primary|secondary|destructive)$/)) continue
					const el = m.tag === "a" ? "<a href=… />" : m.tag === "button" ? "<button />" : `<${m.tag} to=… />`
					const radius = c.find(SURFACE_RADIUS)
					out.push({ index: m.index, match: `<${m.tag}> dressed as a card (${[radius, edge, fill].filter(Boolean).join(" ")}) → <Card render={${el}}>` })
				}
				return out
			},
		},
		{
			id: "agent-initials",
			scope: "both",
			since: "0.21.0",
			code: true,
			why:
				"An AI agent drawn as an Avatar with initials (`fallback=\"AI\"`, \"Bot\", \"GPT\"). \"AI\" in a circle reads as a person called A. I., and it cannot show the agent working. An agent's turns take `<AgentAvatar state=… />`: the default agent identity, which sinks to think and comes up to talk, so the row needs no spinner of its own. Pass `live={false}` on every agent turn but the newest.",
			regex: /<Avatar\b[^>]*?\bfallback=\{?["'](?:AI|A\.I\.|Bot|GPT)["']\}?/g,
		},
		{
			id: "lookalike-avatar",
			scope: "consumer",
			since: "0.7.0",
			file: true,
			code: true,
			why:
				"A round, fixed-size box holding a person's or artist's picture — `rounded-full` + `size-*` (or equal `h-*`/`w-*`) around an <img>, GradientArt or initials, or a round fixed-size <img> itself. That is `Avatar`: `src`/`alt` with a fallback that shows while the image loads or when it fails, `variant=\"art\"` for initials over GradientArt seeded by the person (a stable colour each, from the theme), a `size` ladder, an accessible name (role=img), a `status` slot that clears the circle, and AvatarGroup for an overlapping stack. " +
				"Not flagged: a dot or an icon in a circle (no picture or initials), a round box without a fixed size, or AvatarRoot and its parts.",
			scan(text) {
				const src = maskMarkupTemplates(text)
				const out = []
				for (const m of openingTags(src, /^(?:div|span|figure|img)$/)) {
					if (insideRender(src, m.index)) continue
					const c = classesOf(m.attrs)
					if (!c.has(/^rounded-full$/)) continue
					const size = fixedSize(c)
					if (!size) continue
					let holds = null
					if (m.tag === "img") holds = "an image"
					else {
						const content = elementContent(src, m)
						if (/<GradientArt\b/.test(content.inner)) holds = "GradientArt"
						else if (MEDIA_CHILD.test(content.inner)) holds = "an image"
						else if (
							/^[A-Z]{1,3}$/.test(content.text.trim()) ||
							content.exprs.some((e) => /initial|\[0\]|charAt\(0\)|\.(?:slice|substring)\(0,\s*[12]\)/i.test(e))
						)
							holds = "initials"
					}
					if (!holds) continue
					const use = holds === "an image" ? "<Avatar src alt fallback>" : '<Avatar variant="art" fallback="…">'
					out.push({ index: m.index, match: `<${m.tag}> rounded-full size-${size} holding ${holds} → ${use}` })
				}
				return out
			},
		},
		{
			id: "lookalike-media-frame",
			scope: "consumer",
			since: "0.7.0",
			file: true,
			code: true,
			why:
				"A cover or media frame built by hand — an `aspect-*` ratio + `overflow-hidden` wrapped around an <img>, <video>, <picture> or GradientArt. That is `AspectBox`: `ratio` as a number reserves the box before the media arrives (no layout shift while a cover loads or a shader starts), it clips and positions what it holds (`relative w-full overflow-hidden`), and it is the one frame the media components share, so a change to how frames behave reaches every cover. Put the radius on it as a className. For a cover with its title beneath (an album, an episode, a product), `MediaTile` composes this frame with fallback art for a missing or broken image and an action revealed on hover. " +
				"Not flagged: a ratio box with no media in it (a pad, a canvas well), a frame without overflow clipping, an <img> sized by its own aspect class, or a round fixed-size frame (lookalike-avatar's).",
			scan(text) {
				const src = maskMarkupTemplates(text)
				const out = []
				for (const m of openingTags(src, /^(?:div|span|figure|a|li)$/)) {
					if (insideRender(src, m.index)) continue
					const c = classesOf(m.attrs)
					const aspect = c.find(/^aspect-(?!auto$)/)
					if (!aspect || !c.has(/^overflow-(?:hidden|clip)$/)) continue
					// A round, fixed-size frame is an avatar, reported by lookalike-avatar.
					if (c.has(/^rounded-full$/) && fixedSize(c)) continue
					const inner = elementContent(src, m).inner
					const media = /<GradientArt\b/.test(inner) ? "GradientArt" : MEDIA_CHILD.exec(inner)?.[0].slice(1)
					if (!media) continue
					out.push({ index: m.index, match: `<${m.tag}> ${aspect} overflow-hidden around <${media}> → <AspectBox ratio={${aspectRatio(aspect)}}>` })
				}
				return out
			},
		},
		{
			id: "label-contrast",
			/* CONSUMER-scoped. An app retunes `--primary` and keeps the theme's
			 * label — and a red lifted for dark mode lands where dark ink passes
			 * the ratio and reads muddy, and white fails it. Sable's themes are
			 * held to this in themes.test.ts; an app is told and offered the fix,
			 * and keeps its own choice with a reasoned disable. */
			scope: "consumer",
			since: "0.6.0",
			file: true,
			code: true,
			why:
				"A label on a filled role — brand (`--primary`, `--sidebar-primary`, `--highlight`) or status (`--destructive`, `--success`, `--tone-warning`, `--tone-info`), each with its `-foreground` — should clear 4.5:1 AND APCA Lc 60. A pair can pass the ratio and still read muddy (dark ink on a bright red-orange, Lc 42). The finding names the nearest pair that reads, with the fill's lightness moved and hue kept, keeping the ink its light-mode colour takes. A status colour drawn on a surface (`text-destructive`, borders, rings) reads `--<status>-text`, so moving the fill does not move the page's text. " +
				"If the pair is your brand's deliberate choice, keep it on the record: `/* design-lint-disable-next-line label-contrast -- <reason> */` above the declaration.",
			scan(text, ctx) {
				return ctx?.isStylesheet && labelContrast ? labelContrast(text) : []
			},
		},
		{
			id: "status-text-drift",
			/* CONSUMER-scoped. 0.6 split each status colour into a fill and a
			 * `-text`; an app that retunes only the fill paints its buttons in its
			 * own red and its error text, borders and rings in the theme's. Nothing
			 * on screen says which is which, so the stylesheet is read for it. */
			scope: "consumer",
			since: "0.6.1",
			file: true,
			code: true,
			why:
				"A status colour has two tokens: the fill (`--destructive`, `--success`, `--tone-warning`, `--tone-info`), which `bg-*` paints, and its `-text` (`--destructive-text` …), which `text-*`, `border-*`, `ring-*`, `outline-*`, `fill-*` and `stroke-*` read. Setting the fill alone leaves the text on the theme's colour, so a retuned red button sits beside the theme's red error message. Set the `-text` in the same theme and mode: the fill itself where it already reads on your surfaces, or a step of it moved away from them (lighter in dark mode) so it clears 4.5:1 on a card.",
			scan(text, ctx) {
				return ctx?.isStylesheet && statusText ? statusText(text) : []
			},
		},
		{
			id: "form-required-error",
			/* CONSUMER-scoped. A support app set `error` on a required Field and
			 * never saw it: Form validates every Field before it calls onSubmit, so
			 * an empty one stopped the submit with the browser's wording and the
			 * handler that sets `error` never ran. */
			scope: "consumer",
			since: "0.8.0",
			file: true,
			code: true,
			why:
				"A `required` Field with an `error` prop, inside a `Form` that validates for you. On submit Form checks every Field first, so an empty required one stops the submit with the browser's message (\"Please fill out this field.\") and your onSubmit, which would set `error`, never runs. Either let your code own validation, `<Form noValidate>` (onSubmit always runs and the Field shows your `error`), or let Form validate and word the message on the Field: `messages={{ valueMissing: \"Enter a subject.\" }}`.",
			scan(text) {
				const src = maskMarkupTemplates(text)
				const out = []
				// A boolean prop is on when written bare or as anything but `={false}`.
				const flag = (attrs, name) => {
					const m = new RegExp(`(?:^|\\s)${name}(?![\\w-])(\\s*=\\s*\\{\\s*false\\s*\\})?`).exec(attrs)
					return Boolean(m) && !m[1]
				}
				for (const form of openingTags(src, /^Form$/)) {
					if (flag(form.attrs, "noValidate")) continue
					const { inner } = elementContent(src, form)
					for (const field of openingTags(inner, /^Field$/)) {
						if (!flag(field.attrs, "required") || !/(?:^|\s)error\s*=/.test(field.attrs)) continue
						out.push({ index: form.end + 1 + field.index, match: "required Field with error inside a validating Form → <Form noValidate> or messages={{ valueMissing }}" })
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
				"A colour hand-mixed from the foreground ink — `color-mix(… var(--foreground) …)`. Sable already derives these from the surface underneath, in every theme and mode: `sable-well` (a recessed track, pad or well), `sable-surface` + `sable-surface-interactive` (hover and selected fills on any surface), `bg-hairline` / `border-hairline` (a faint ink edge or fill). `npx sable search` finds them; `registry.json → utilities` explains each. If none fits, it is a gap — report it, then take the escape hatch with the reason. " +
				"Exempt: the value of a `--theme-*` hook (`--theme-panel-field: color-mix(…)`), which is how a theme tunes a derived token.",
			find(line) {
				const out = []
				for (const m of line.matchAll(/color-mix\([^;"'`]*?var\(--foreground\)/g)) {
					// A theme hook is the sanctioned place to retune a derived surface,
					// in CSS or as an arbitrary property ([--theme-x:color-mix(…)]).
					if (/--theme-[\w-]+\s*:\s*$/.test(line.slice(0, m.index))) continue
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
				"A look-changing class on a Sable component (border*, bg-*, rounded*, ring-*, shadow-* on Button, Pill or Badge). Their appearance is set by variants — Button `variant` (floating for a control over content), Pill `appearance`/`size`, Badge `appearance`/`tone` — and an override fights the variant's own hover, selected and focus states. Use a real variant, or add one to the component. Layout classes (width, margin, flex, position) are fine. If the component is defective rather than missing a look, patch it with `sable patch <Component>` (recorded, and re-checked on every upgrade) instead of restyling it.",
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

/**
 * An `--ignore` glob as a RegExp over a CWD-relative, forward-slash path:
 * `**` crosses directories, `*` stays within one. Shared by sable-lint and
 * sable grade so the same flag skips the same files in both.
 */
export function ignoreGlob(glob) {
	return new RegExp(
		`^${glob
			.replace(/[.+^${}()|[\]\\]/g, "\\$&")
			.replace(/\*\*/g, "\0")
			.replace(/\*/g, "[^/]*")
			.replace(/\0/g, ".*")}$`,
	)
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
				out.push({ line: i + 1, ruleId: rule.id, match: h.match, why: h.why ?? rule.why })
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
				out.push({ line: i + 1, ruleId: rule.id, match: h.match, why: h.why ?? rule.why })
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
