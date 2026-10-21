/**
 * app-css — what an app's own stylesheets do to Sable that its TSX does not show.
 *
 * The surface inventory and the part mirrors read className strings. An app that
 * styles semantic classes in a .css file hides the rest: a work tracker passed a
 * 100/100 grade with 48/42/34/25px bar and row heights, `.issue-table th { height:
 * 25px; padding … }` re-laying Sable's table from outside, a disclosure chevron
 * rotated by `[aria-expanded=false] svg`, and its light colours overridden on
 * :root with nothing for dark — so dark mode rendered Sable's dark palette under
 * the app's light accents, and nobody had a control to see it.
 *
 * Everything here is a note for the reuse inventory except `modes`, which grade
 * reports as a warning: a half-themed palette is a defect a user sees the moment
 * they switch modes, while a fixed height or a reached-in selector can be a
 * deliberate choice. Lexical, like the rest of grade; it parses enough CSS to
 * know each declaration's selector and the @-rules around it.
 */

/** Every declaration block with its selector and enclosing @-rule preludes. */
export function cssRules(css) {
	const src = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
	const rules = []
	const stack = []
	let start = 0
	let quote = null
	for (let i = 0; i < src.length; i++) {
		const c = src[i]
		if (quote) {
			if (c === "\\") i++
			else if (c === quote) quote = null
			continue
		}
		if (c === '"' || c === "'") quote = c
		else if (c === "{") {
			const prelude = src.slice(start, i).split(";").at(-1).trim()
			stack.push({ prelude, index: start + src.slice(start, i).lastIndexOf(prelude), body: i + 1 })
			start = i + 1
		} else if (c === "}") {
			const top = stack.pop()
			if (top && !top.prelude.startsWith("@")) {
				const body = src.slice(start, i)
				const context = stack.map((s) => s.prelude)
				// Nested rules: `.a { .b { … } }` — the declarations are the block's own text.
				rules.push({ selector: top.prelude, context, body, index: top.index, bodyIndex: top.body })
			}
			start = i + 1
		}
	}
	return rules
}

const declarations = (body) =>
	[...body.matchAll(/(?:^|;|\})\s*(--[\w-]+|[a-z-]+)\s*:\s*([^;{}]+)/g)].map((m) => ({ prop: m[1], value: m[2].trim(), offset: m.index + m[0].indexOf(m[1]) }))

const lineOf = (text, index) => text.slice(0, index).split("\n").length

/** A selector's last compound names a bar, a row, a header or a table cell. */
const BAR_OR_ROW = /(?:^|[\s>+~])(?:th|td|tr|thead|header)(?![\w-])|\.[\w-]*(?:bar|row|header|cell|tab|toolbar|item)(?![\w-])/
/** The density ladder's own names, re-declared by hand. */
const LADDER = /^--(?:control-(?:xs|sm|md|lg|cta)|chrome-bar-height|status-bar-height)$/

/**
 * Notes on one stylesheet. `semantic` is the theme contract's colour token
 * names, used by `modes` across all of an app's stylesheets, not here.
 */
export function cssNotes(css) {
	const notes = []
	const seen = new Set()
	const add = (index, kind, what, consider) => {
		const key = `${kind}|${what}`
		if (seen.has(key)) return
		seen.add(key)
		notes.push({ line: lineOf(css, index), kind, what, consider })
	}
	for (const r of cssRules(css)) {
		const decls = declarations(r.body)
		const at = (d) => r.bodyIndex + d.offset
		if (/\[(?:aria-expanded|data-panel-open|data-open|data-state)[^\]]*\][^{,]*\bsvg\b/.test(r.selector) && decls.some((d) => /^(?:transform|rotate)$/.test(d.prop) && /rotate/.test(`${d.prop} ${d.value}`))) {
			add(r.index, "rebuilt part", `${r.selector} rotates a disclosure chevron by hand`, "CollapsibleIndicator, which flips with the panel and eases (Accordion, Select and Menu triggers already flip theirs)")
		}
		if (/(?:^|[\s>+~])(?:th|td|thead|tr)(?![\w-])/.test(r.selector) && /^[.#[]/.test(r.selector.trim())) {
			const props = decls.filter((d) => /^(?:height|min-height|padding|padding-block|padding-inline|font-size|font-weight)$/.test(d.prop))
			if (props.length) add(r.index, "override", `${r.selector} { ${props.map((d) => d.prop).join(", ")} } re-lays a Sable table from outside`, "the table's density (rows follow a Workspace or Density scope), a column's className for its width, CardContent flush for edge padding")
		}
		if (/\[data-(?:selected|highlighted|active|checked|pressed)\]/.test(r.selector) && /^[.#]/.test(r.selector.trim())) {
			add(r.index, "override", `${r.selector} restyles a Sable state from outside`, "the state's own tokens set on the theme (--muted for a selected row), or the component's variant")
		}
		for (const d of decls) {
			const px = /^(\d+(?:\.\d+)?)px$/.exec(d.value)?.[1]
			if (/^(?:height|min-height)$/.test(d.prop) && px && Number(px) >= 16 && Number(px) <= 64 && BAR_OR_ROW.test(r.selector)) {
				add(at(d), "fixed height", `${r.selector} { ${d.prop}: ${d.value} }`, "the density ladder: --chrome-bar-height, --status-bar-height or --control-* follow the register (WorkspaceBar, StatusBar, a Density scope) instead of pinning one size")
			}
		}
		const ladder = decls.filter((d) => LADDER.test(d.prop) && /^\d/.test(d.value))
		if (ladder.length) {
			const where = [...r.context.filter((c) => c.startsWith("@media")), r.selector].join(" ")
			add(at(ladder[0]), "fixed height", `${where} { ${ladder.map((d) => `${d.prop}: ${d.value}`).join("; ")} } re-declares the density ladder`, "Workspace's density prop or <Density value=…>; the compact and comfortable ladders are already measured")
		}
	}
	return notes
}

/** The selectors and @-rules that put a declaration in the dark mode. */
const DARK = /\.dark\b|\[data-(?:mode|theme|color-scheme)=["']?dark|prefers-color-scheme:\s*dark|:root\.dark|html\.dark|\[data-dark\]/

/**
 * Light and dark coverage of the theme's colour tokens across every stylesheet.
 * Returns the tokens an app sets only for light, and whether it set any dark
 * values at all. A preset carries both modes; hand-written :root overrides
 * usually carry one.
 */
export function modeCoverage(sheets, semantic) {
	const light = new Map()
	const dark = new Set()
	for (const { rel, text } of sheets) {
		for (const r of cssRules(text)) {
			const scope = [...r.context, r.selector].join(" ")
			const isDark = DARK.test(scope)
			for (const d of declarations(r.body)) {
				const name = d.prop.slice(2)
				if (!d.prop.startsWith("--") || !semantic.has(name)) continue
				if (isDark) dark.add(name)
				else if (!light.has(name)) light.set(name, { file: rel, line: lineOf(text, r.index) })
			}
		}
	}
	const lightOnly = [...light].filter(([name]) => !dark.has(name)).map(([name, at]) => ({ name, ...at }))
	return { light: light.size, dark: dark.size, lightOnly }
}
