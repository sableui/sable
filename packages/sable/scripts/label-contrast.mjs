/**
 * The `label-contrast` lint rule's reader: which brand-fill tokens a stylesheet
 * overrides, in which mode and theme, measured on top of the installed theme.
 *
 * The rule itself lives in lint-rules.mjs with the others; it stays dependency
 * free by taking this scanner as an argument. The measuring is the package's own
 * (`checkLabelledFills` from the built `presets` entry), so the linter, `sable
 * preset --check`, Sable's theme tests and Customize cannot disagree about what
 * reads.
 *
 * An app overriding `--primary` usually leaves `--primary-foreground` to the
 * theme, and that is exactly the pair that goes wrong — so a pair is completed
 * from the theme the selector names (`[data-sable-theme="ember"]`), or the
 * default theme. Only pairs the stylesheet itself declares a half of are
 * reported; the theme's own pairs are Sable's to keep.
 */

import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const DARK = /\.dark\b|\[data-(?:theme|mode|color-scheme)=["']?dark|prefers-color-scheme:\s*dark/
const LIGHT = /\.light\b|\[data-(?:theme|mode|color-scheme)=["']?light|prefers-color-scheme:\s*light/
const THEME = /data-sable-theme=["']?([\w-]+)/

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))

/** Every `--name: value` inside a block, with its offset and enclosing preludes. */
export function customProperties(css) {
	const out = []
	const stack = []
	let start = 0
	const take = (end) => {
		const text = css.slice(start, end)
		const m = text.match(/^\s*--([\w-]+)\s*:\s*([\s\S]*?)\s*$/)
		if (m && stack.length) out.push({ name: m[1], value: m[2], index: start + text.indexOf("--"), context: stack.join(" ") })
	}
	for (let i = 0; i < css.length; i++) {
		const ch = css[i]
		if (ch === "{") {
			stack.push(css.slice(start, i).trim())
			start = i + 1
		} else if (ch === "}") {
			take(i)
			stack.pop()
			start = i + 1
		} else if (ch === ";") {
			take(i)
			start = i + 1
		}
	}
	return out
}

const modeOf = (decl) => (DARK.test(decl.context) ? "dark" : LIGHT.test(decl.context) ? "light" : "both")
const applies = (decl, mode) => {
	const m = modeOf(decl)
	return m === "both" || m === mode
}

/**
 * Light and dark token maps. A declaration outside any dark scope reaches dark
 * mode too: an app's stylesheet loads after Sable's, so `:root { --primary }`
 * outranks the theme's equal-specificity `.dark` value.
 */
function modeMaps(decls, base) {
	const light = { ...base?.light }
	const dark = { ...base?.dark }
	for (const d of decls) {
		if (applies(d, "light")) light[d.name] = d.value
		if (applies(d, "dark")) dark[d.name] = d.value
	}
	return { light, dark }
}

function resolveAll(map) {
	const resolve = (value, depth) =>
		depth > 12
			? value
			: value.replace(/var\(\s*--([\w-]+)\s*(?:,\s*([^()]*))?\)/g, (m, name, fallback) =>
					map[name] != null ? resolve(map[name], depth + 1) : fallback?.trim() || m,
				)
	return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, resolve(v, 0)]))
}

/**
 * A scanner for one stylesheet's text, or null when the package's built entry
 * is missing (the rule then reports nothing rather than guessing).
 */
export async function labelContrastScanner(pkgRoot, defaultTheme = "sable") {
	const entry = join(pkgRoot, "dist/presets/index.js")
	if (!existsSync(entry)) return null
	const { checkLabelledFills, LABELLED_FILLS } = await import(pathToFileURL(entry).href)
	const watched = new Set(LABELLED_FILLS.flatMap((f) => [f, `${f}-foreground`]))
	const themes = new Map()
	const theme = (id) => {
		if (!themes.has(id)) {
			const file = join(pkgRoot, "dist/themes", id, `${id}.css`)
			themes.set(id, existsSync(file) ? modeMaps(customProperties(stripComments(readFileSync(file, "utf8")))) : null)
		}
		return themes.get(id)
	}

	return (css) => {
		const decls = customProperties(css)
		if (!decls.some((d) => watched.has(d.name))) return []
		const byTheme = new Map()
		for (const d of decls) {
			const id = d.context.match(THEME)?.[1] ?? defaultTheme
			if (!byTheme.has(id)) byTheme.set(id, [])
			byTheme.get(id).push(d)
		}
		const out = []
		// One declaration failing the same way in both modes is one finding.
		const seen = new Map()
		for (const [id, group] of byTheme) {
			const maps = modeMaps(group, theme(id) ?? theme(defaultTheme))
			const { findings } = checkLabelledFills({ light: resolveAll(maps.light), dark: resolveAll(maps.dark) })
			for (const f of findings) {
				const own = group.filter((d) => (d.name === f.fill || d.name === `${f.fill}-foreground`) && applies(d, f.mode))
				if (!own.length) continue
				const at = own.findLast((d) => d.name === `${f.fill}-foreground`) ?? own.at(-1)
				const pair = `--${f.fill}-foreground on --${f.fill} is ${f.ratio.toFixed(2)}:1, APCA Lc ${Math.abs(f.lc).toFixed(0)}`
				const fix = ` → try --${f.fill}: ${f.suggestion.fill}; --${f.fill}-foreground: ${f.suggestion.ink}`
				const key = `${at.index}|${pair}${fix}`
				const twin = seen.get(key)
				if (twin) {
					twin.match = `light and dark: ${pair}${fix}`
					continue
				}
				const finding = { index: at.index, match: `${f.mode}: ${pair}${fix}` }
				seen.set(key, finding)
				out.push(finding)
			}
		}
		return out
	}
}
