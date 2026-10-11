#!/usr/bin/env node
/**
 * build-registry — generate registry.json's `components[]` (and `version`) from
 * the per-component `*.meta.ts` files, the single source of truth.
 *
 * Why: registry.json is the machine-readable catalog an agent (or a consuming
 * app) reads to understand the library. Hand-maintaining it let it drift (it
 * once sat at 0.2.0 while the package shipped 0.5.0, and its one-line summaries
 * were a lossy copy of the metas, which already carry the full props / variants /
 * tokensUsed / a11y / examples). This script makes the catalog **complete and
 * un-lie-able**: every component is emitted from its meta, sorted, with the full
 * contract — and `--check` fails CI if the committed file is out of sync.
 *
 * Node 22 type-strips the `.meta.ts` imports (they are pure data + a type-only
 * import), so this stays a plain Node script with no build step or extra dep.
 *
 *   node scripts/build-registry.mjs          # write registry.json
 *   node scripts/build-registry.mjs --check  # exit 1 if out of sync (CI gate)
 */

import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync as readFileRaw,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { motionNamesFromRegistry, readContractArray } from "./read-contract.mjs"
import { readLessons } from "./design-memory.mjs"
import { collectPropSurface } from "./prop-surface.mjs"

/**
 * Every read in this file goes through here, and the `\r` strip is the whole
 * reason it exists.
 *
 * The generator lifts source text straight into its output — a meta's `examples`
 * become `code` strings in registry.json and fenced blocks in the llms mirrors.
 * On a Windows checkout that text arrives CRLF, so the CRs were **baked into the
 * generated artifacts** (173 of them, escaped as `\r\n` inside JSON strings) and
 * the output became a function of the machine that produced it. CI regenerates
 * on Linux from an LF checkout, compares byte-for-byte, and had failed on every
 * commit generated from Windows since 41ff14e — a red build nobody could
 * reproduce locally, which is the worst kind.
 *
 * Normalising on the way IN fixes both directions at once: the artifacts stop
 * carrying stray CRs, and `--check` becomes reproducible on any platform.
 */
function readFileSync(path, encoding) {
	const text = readFileRaw(path, encoding)
	return typeof text === "string" ? text.replace(/\r\n/g, "\n") : text
}

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = join(HERE, "..")
const COMPONENTS = join(PKG_ROOT, "src", "components")
const REGISTRY_PATH = join(PKG_ROOT, "registry.json")
const PKG = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8"))
const COMPONENT_GUIDANCE =
	(
		await import(
			pathToFileURL(join(PKG_ROOT, "src", "lib", "component-guidance.ts")).href
		)
	).componentGuidance ?? {}

// The component taxonomy — role + register per component. A contract like the
// token and icon contracts: validated in both directions below, because it
// previously lived only in the docs app and four shipped components had drifted
// out of it entirely.
const TAXONOMY_MOD = await import(
	pathToFileURL(join(PKG_ROOT, "src", "lib", "taxonomy.ts")).href
)
const COMPONENT_GROUPS = TAXONOMY_MOD.COMPONENT_GROUPS
const COMPONENT_TAXONOMY = TAXONOMY_MOD.COMPONENT_TAXONOMY

// Token intent — why each token exists and what it is confused with. The names
// and values were already contracts; this is the part an agent needs and the one
// that was missing for all 116 of them.
const TOKEN_DOCS_MOD = await import(
	pathToFileURL(join(PKG_ROOT, "src", "themes", "token-docs.ts")).href
)
const TOKEN_DOCS = TOKEN_DOCS_MOD.TOKEN_DOCS
const tokenDoc = TOKEN_DOCS_MOD.tokenDoc

const check = process.argv.includes("--check")

/* ── Themes: generated from the theme folders, never hand-listed. ──────────────
 * `registry.json → themes.available` used to be hand-authored, and it fell two
 * themes behind (Ember and Inkwell shipped; the registry still listed five). An
 * agent reading the registry had no way to know they existed. Now each folder
 * under src/themes/ with an index.ts is a theme, its manifest is imported, and
 * the build fails if it is missing from the runtime registry, the package
 * exports, or themes.css — the three places a half-wired theme hid before. */
const THEMES_DIR = join(PKG_ROOT, "src", "themes")
const THEME_REGISTRY_SRC = readFileSync(join(THEMES_DIR, "registry.ts"), "utf8")
const THEMES_CSS_SRC = readFileSync(join(PKG_ROOT, "src", "themes.css"), "utf8")
const themeErrors = []
const themeEntries = []
for (const dir of readdirSync(THEMES_DIR, { withFileTypes: true })) {
	if (!dir.isDirectory() || !existsSync(join(THEMES_DIR, dir.name, "index.ts"))) continue
	const mod = await import(pathToFileURL(join(THEMES_DIR, dir.name, "index.ts")).href)
	const manifest = mod.default
	if (!manifest?.id) {
		themeErrors.push(`src/themes/${dir.name}/index.ts has no default-exported ThemeManifest.`)
		continue
	}
	const order = THEME_REGISTRY_SRC.indexOf(`${dir.name}Theme,`, THEME_REGISTRY_SRC.indexOf("themeManifests"))
	if (order < 0) themeErrors.push(`theme "${manifest.id}" is not listed in src/themes/registry.ts → themeManifests.`)
	if (!PKG.exports[`./theme/${manifest.id}`] || !PKG.exports[`./theme/${manifest.id}.css`])
		themeErrors.push(`theme "${manifest.id}" has no "./theme/${manifest.id}" + ".css" entries in package.json exports.`)
	if (!PKG.publishConfig?.exports?.[`./theme/${manifest.id}`] || !PKG.publishConfig?.exports?.[`./theme/${manifest.id}.css`])
		themeErrors.push(`theme "${manifest.id}" has no "./theme/${manifest.id}" + ".css" entries in package.json publishConfig.exports.`)
	if (manifest.id !== "sable" && !THEMES_CSS_SRC.includes(`./themes/${dir.name}/${dir.name}.css`))
		themeErrors.push(`theme "${manifest.id}" is not imported by src/themes.css.`)
	themeEntries.push({ order, dir: dir.name, manifest })
}
themeEntries.sort((a, b) => a.order - b.order)
/** First family of a CSS font stack, unquoted: `"Work Sans", sans-serif` → `Work Sans`. */
const firstFamily = (stack) => stack.split(",")[0].trim().replace(/^["']|["']$/g, "")
const themesAvailable = themeEntries.map(({ dir, manifest }) => ({
	id: manifest.id,
	label: manifest.label,
	deprecated: manifest.deprecated,
	featured: !manifest.deprecated,
	css: `./src/themes/${dir}/${dir}.css`,
	manifest: `./src/themes/${dir}/index.ts`,
	import: manifest.id === "sable" ? "@sableui/react/styles.css" : `@sableui/react/theme/${manifest.id}.css`,
	modes: manifest.modes,
	defaultMode: manifest.defaultMode,
	fonts: Object.fromEntries(Object.entries(manifest.fonts).map(([role, stack]) => [role, firstFamily(stack)])),
	fontStacks: manifest.fonts,
	artDirection: existsSync(join(THEMES_DIR, dir, "art-direction.md")) ? `./src/themes/${dir}/art-direction.md` : undefined,
}))

/* ── Foundations: the typed rules (src/foundations/*.ts) → llms/foundations/*.md
 * and registry.json → foundations. One source for the docs pages, the CLI
 * (`sable docs typography`) and the registry, so a rule cannot say one thing
 * on the site and another to an agent. Order follows src/foundations/index.ts. */
const FOUNDATIONS_DIR = join(PKG_ROOT, "src", "foundations")
const FOUNDATIONS_INDEX_SRC = readFileSync(join(FOUNDATIONS_DIR, "index.ts"), "utf8")
const foundationOrder = (FOUNDATIONS_INDEX_SRC.match(/FOUNDATIONS = \[([^\]]+)\]/)?.[1] ?? "")
	.split(",").map((s) => s.trim()).filter(Boolean)
const foundations = []
for (const name of foundationOrder) {
	const file = join(FOUNDATIONS_DIR, `${name}.ts`)
	if (!existsSync(file)) {
		themeErrors.push(`src/foundations/index.ts lists "${name}" but src/foundations/${name}.ts does not exist.`)
		continue
	}
	const f = (await import(pathToFileURL(file).href)).default
	if (!f?.slug || !Array.isArray(f.rules) || !Array.isArray(f.noGos))
		themeErrors.push(`src/foundations/${name}.ts must default-export a Foundation.`)
	else foundations.push(f)
}
for (const file of readdirSync(FOUNDATIONS_DIR)) {
	const name = file.replace(/\.ts$/, "")
	if (!file.endsWith(".ts") || ["index", "types"].includes(name) || file.endsWith(".test.ts")) continue
	if (!foundationOrder.includes(name))
		themeErrors.push(`src/foundations/${file} is not listed in src/foundations/index.ts → FOUNDATIONS.`)
}

function renderFoundationMd(f) {
	const out = [`# ${f.title}`, "", f.summary, "", `**${f.headline}**`, ""]
	for (const v of f.vocabularies) {
		out.push(`## ${v.title}`, "")
		if (v.note) out.push(v.note, "")
		out.push("| Name | Value | Use |", "|---|---|---|")
		for (const t of v.terms) out.push(`| \`${t.name}\` | ${t.value} | ${t.use} |`)
		out.push("")
	}
	out.push("## Rules", "")
	f.rules.forEach((r, i) => {
		out.push(`${i + 1}. **${r.rule}** ${r.why}${r.enforcedBy ? ` *Enforced by ${r.enforcedBy}.*` : ""}`)
	})
	out.push("", "## Never", "")
	for (const n of f.noGos) {
		out.push(`- **Never:** ${n.never} **Instead:** ${n.instead} ${n.why}${n.enforcedBy ? ` *Enforced by ${n.enforcedBy}.*` : ""}`)
	}
	if (f.details.length) {
		out.push("", "## Details", "")
		for (const d of f.details) {
			out.push(`### ${d.title}`, "", "```tsx", `// before`, d.before, `// after`, d.after, "```", "", d.why, "")
		}
	}
	if (f.related.length) out.push("", `**Related:** ${f.related.map((r) => `\`${r.includes(" ") ? r : `sable docs ${r}`}\``).join(" · ")}`)
	return `${out.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`
}

/* ── Export surface: every value/type importable from the package barrel. ────
 * Built by scanning the explicit export blocks (components/x/index.ts, icon,
 * motion, the root barrel) and the layout `export * from "./X"` files. Used to
 * auto-derive each example's import line and to fail the build when an example
 * references a component that doesn't exist. */

// Components an example may legitimately reference that the package does NOT
// export — each maps to the line emitted alongside the sable import.
const EXTERNAL_COMPONENTS = {
	Link: '// <Link> = your router\'s link (react-router, next/link, @tanstack/router, …)',
}
const EXTERNAL_TYPES = {
	DateRange: 'import type { DateRange } from "react-day-picker"',
}

function addExportBlockNames(txt, values, types) {
	for (const m of txt.matchAll(/export\s+(type\s+)?\{([^}]+)\}/g)) {
		const blockIsType = Boolean(m[1])
		for (let entry of m[2].split(",")) {
			entry = entry.trim()
			if (!entry) continue
			const isType = blockIsType || entry.startsWith("type ")
			const name = entry
				.replace(/^type\s+/, "")
				.split(/\s+as\s+/)
				.pop()
				.trim()
			if (!name) continue
			;(isType ? types : values).add(name)
		}
	}
	for (const m of txt.matchAll(
		/export\s+(?:function|const|class)\s+([A-Za-z0-9_$]+)/g,
	)) {
		values.add(m[1])
	}
	for (const m of txt.matchAll(/export\s+(?:type|interface)\s+([A-Za-z0-9_$]+)/g)) {
		types.add(m[1])
	}
}

function collectExportSurface() {
	const values = new Set()
	const types = new Set()
	for (const dir of readdirSync(COMPONENTS)) {
		const idx = join(COMPONENTS, dir, "index.ts")
		try {
			addExportBlockNames(readFileSync(idx, "utf8"), values, types)
		} catch {
			/* no index — skipped; the meta check below still runs */
		}
	}
	const layoutIdx = readFileSync(join(PKG_ROOT, "src", "layout", "index.ts"), "utf8")
	for (const m of layoutIdx.matchAll(/export \* from "\.\/([\w-]+)"/g)) {
		addExportBlockNames(
			readFileSync(join(PKG_ROOT, "src", "layout", `${m[1]}.tsx`), "utf8"),
			values,
			types,
		)
	}
	for (const p of ["icon/index.ts", "motion/index.ts", "lib/cn.ts", "index.ts"]) {
		addExportBlockNames(
			readFileSync(join(PKG_ROOT, "src", p), "utf8"),
			values,
			types,
		)
	}
	return { values, types }
}

const SURFACE = collectExportSurface()

// Icon names an example may use — the consumer-buildable icon contract.
const ICON_CONTRACT = new Set(
	JSON.parse(readFileSync(REGISTRY_PATH, "utf8")).iconContract?.names ?? [],
)

/**
 * Attribute names per JSX tag, as [{ tag, props }].
 *
 * Written as a scanner rather than a regex because the regex version was wrong in
 * the way that matters: it read words out of quoted values and prose, so a
 * `placeholder="Tell the story behind this"` reported props named `the`, `story`
 * and `behind`. It also could not survive an arrow function in a prop value,
 * whose `>` ends the tag as far as any `[^<>]` pattern is concerned.
 *
 * So: track quote state and brace depth, and only take identifiers sitting at
 * depth 0 outside quotes.
 */
function jsxAttributes(code) {
	const out = []
	for (let i = 0; i < code.length; i++) {
		if (code[i] !== "<") continue
		const m = /^<([A-Z][A-Za-z0-9]*)/.exec(code.slice(i))
		if (!m) continue
		let j = i + m[0].length
		let depth = 0
		let quote = null
		let attrs = ""
		for (; j < code.length; j++) {
			const ch = code[j]
			if (quote) {
				if (ch === quote) quote = null
				continue
			}
			if (ch === '"' || ch === "'" || ch === "`") {
				quote = ch
				continue
			}
			if (ch === "{") depth++
			else if (ch === "}") depth--
			else if (ch === ">" && depth === 0) break
			if (depth === 0) attrs += ch
		}
		out.push({
			tag: m[1],
			// Identifiers followed by `=` (valued) or standing alone (boolean).
			props: [...attrs.matchAll(/(?:^|\s)([a-zA-Z][\w-]*)(?=\s*=|\s|\/|$)/g)].map(
				(a) => a[1],
			),
		})
		i = j
	}
	return out
}

/** Derive the import block for an example's code. Returns { imports, unknown }. */
function deriveImports(code) {
	const used = new Set()
	const usedTypes = new Set()
	const externalLines = new Set()
	const unknown = []

	// JSX tags — `<Foo` not preceded by an identifier char (excludes generics
	// like `useState<Date>`). Dotted tags resolve by their root.
	const jsxTags = new Set(
		[...code.matchAll(/(?<![A-Za-z0-9_$])<([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]),
	)
	for (const tag of jsxTags) {
		if (SURFACE.values.has(tag)) used.add(tag)
		else if (EXTERNAL_COMPONENTS[tag]) externalLines.add(EXTERNAL_COMPONENTS[tag])
		else unknown.push(tag)
	}
	// Non-JSX value exports (hooks, helpers, consts): lowercase or ALL_CAPS names
	// only — capitalized components are matched as JSX tags above, never inside
	// strings/prose. Short names (cn, …) must appear as a call to count.
	for (const name of SURFACE.values) {
		if (used.has(name)) continue
		if (!/^[a-z]/.test(name) && !/^[A-Z][A-Z0-9_]+$/.test(name)) continue
		const re =
			name.length <= 3
				? new RegExp(`\\b${name}\\s*\\(`)
				: new RegExp(`\\b${name}\\b`)
		if (re.test(code)) used.add(name)
	}
	for (const t of SURFACE.types) {
		if (used.has(t)) continue
		if (new RegExp(`\\b${t}\\b`).test(code)) usedTypes.add(t)
	}
	for (const [t, line] of Object.entries(EXTERNAL_TYPES)) {
		if (!SURFACE.types.has(t) && new RegExp(`\\b${t}\\b`).test(code))
			externalLines.add(line)
	}

	const names = [
		...[...used].sort((a, b) => a.localeCompare(b)),
		...[...usedTypes].sort((a, b) => a.localeCompare(b)).map((t) => `type ${t}`),
	]
	const lines = []
	if (names.length) lines.push(`import { ${names.join(", ")} } from "@sableui/react"`)
	lines.push(...[...externalLines].sort())
	return { imports: lines.length ? lines.join("\n") : undefined, unknown }
}

/* ── Collect every components/<dir>/<name>.meta.ts ─────────────────────────── */
const metaFiles = []
for (const dir of readdirSync(COMPONENTS)) {
	const full = join(COMPONENTS, dir)
	if (!statSync(full).isDirectory()) continue
	for (const f of readdirSync(full)) {
		if (/\.meta\.tsx?$/.test(f)) metaFiles.push({ dir, file: join(full, f) })
	}
}

/* ── Meta → catalog entry, with contract checks. Shared by components and
 * layout primitives. ──────────────────────────────────────────────────────── */
const contractErrors = []

/* Preserve curated descriptions and derive newly enforced rules from source.
 * A rule must not require a manual edit of generated registry.json to become
 * discoverable. The source `why` is a complete fallback for its fails-on text. */
const enforcementRules = JSON.parse(readFileSync(REGISTRY_PATH, "utf8")).enforcement?.rules ?? []
{
	const { makeRules } = await import("./lint-rules.mjs")
	const advertised = new Set(enforcementRules.map((rule) => rule.id))
	const live = makeRules({
		semanticTokens: new Set(["background"]),
		motionTokens: new Set(["motion-scale"]),
	})
	for (const rule of live) {
		if (!advertised.has(rule.id)) enforcementRules.push({ id: rule.id, "fails-on": rule.why })
	}
}

/* Every example's code, collected during the meta pass and checked AFTER it, in
 * `checkExampleProps()`. It has to be a second pass: validating `<Region max=…>`
 * inside AppHeader's example needs Region's props table, which is a different
 * meta — and the first version of this check sidestepped that by only looking at
 * a component's OWN tags. That exemption was the bug. `<Region size="content">`
 * (the prop is `max`) sat in four metas and the first code block of
 * building-a-page.md, teaching a spelling that React spreads onto the div as an
 * inert attribute: no error, no warning, silently uncapped width. */
const EXAMPLE_TAGS = []

function toEntry(meta, path) {
	const metaGuidance = COMPONENT_GUIDANCE[meta.name] ?? {}
	const keywords = meta.keywords ?? metaGuidance.keywords
	const usage = meta.usage ?? metaGuidance.usage
	const related = meta.related ?? metaGuidance.related

	/* Guidance may live in the meta OR in lib/component-guidance.ts, and the meta
	 * wins WHOLE — `??` replaces the object, it does not merge. So a component in
	 * both places silently loses everything the central entry said and the meta did
	 * not restate. That happened: ThemeSelector's "use ThemeSwitcher for colour
	 * mode" dont vanished the moment a `usage` block was added to its meta, with no
	 * warning anywhere. One home per component. */
	if (meta.usage && metaGuidance.usage) {
		contractErrors.push(
			`${meta.name}: has usage in BOTH its meta and lib/component-guidance.ts. The meta wins whole, so the central entry is dead code and anything it says that the meta does not is lost. Merge it into the meta and delete the central entry.`,
		)
	}
	// Stronger form of the same rule, now that all 71 component entries have been
	// migrated: a COMPONENT's guidance belongs in its own meta, full stop. Scoped
	// to components by path — `toEntry` also runs for the layout primitives, and
	// the central file IS their colocated home (they share one layout.meta.ts, so
	// there is no per-primitive file to move into).
	if (path?.startsWith("components/") && !meta.usage && metaGuidance.usage) {
		contractErrors.push(
			`${meta.name}: guidance is in lib/component-guidance.ts rather than its own meta. That file is now for layout primitives only — move keywords/usage/related into ${meta.name}'s meta so there is one home per component.`,
		)
	}

	// Contract checks (CONTRIBUTING.md → Component meta) — enforced, not honor-system:
	// props hold the ROOT's props only (a capitalized entry that isn't the root
	// itself is a subcomponent hiding in props), and a composite must show its
	// composed JSX form in at least one example.
	const rootNames = new Set([
		meta.name,
		`${meta.name} (Root)`,
		`${meta.name}Provider`,
	])
	for (const p of meta.props ?? []) {
		if (/^[A-Z]/.test(p.name) && !rootNames.has(p.name)) {
			contractErrors.push(
				`${meta.name}: props entry "${p.name}" reads as a subcomponent — move it to subcomponents[] (props hold the root's props only).`,
			)
		}
	}
	if (meta.subcomponents?.length) {
		const composed = (meta.examples ?? []).some((e) =>
			meta.subcomponents.some((s) =>
				e.code.includes(`<${s.name.split(/[\s/]/)[0]}`),
			),
		)
		if (!composed) {
			contractErrors.push(
				`${meta.name}: has subcomponents but no example shows the composed JSX form.`,
			)
		}
	}

	if (meta.status === "stable") {
		const practices = usage?.bestPractices ?? []
		if (!keywords?.length) {
			contractErrors.push(
				`${meta.name}: stable components need keywords for agent discovery.`,
			)
		}
		if (!usage?.description) {
			contractErrors.push(
				`${meta.name}: stable components need usage.description guidance.`,
			)
		}
		if (!practices.some((p) => p.guidance === "do")) {
			contractErrors.push(
				`${meta.name}: stable components need at least one usage.bestPractices "do" item.`,
			)
		}
		if (!practices.some((p) => p.guidance === "dont")) {
			contractErrors.push(
				`${meta.name}: stable components need at least one usage.bestPractices "dont" item.`,
			)
		}
		if (meta.subcomponents?.length && !usage?.anatomy?.length) {
			contractErrors.push(
				`${meta.name}: components with subcomponents need usage.anatomy entries for the composed parts.`,
			)
		}
	}

	// Related components must still exist. Removing a component left five metas
	// pointing agents at `StatusBadge` after it was gone — nothing checked the
	// list, so a consolidation silently stranded every cross-reference to it.
	for (const name of meta.related?.components ?? []) {
		const folder = join(PKG_ROOT, "src/components", name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase())
		if (deriveImports(`<${name} />`).unknown.length && !existsSync(folder)) {
			contractErrors.push(`${meta.name}: related component "${name}" is not exported by the package. Point at what replaced it, or drop the entry.`)
		}
	}

	// Examples must be complete + copy-pasteable: no elisions, no phantom
	// components, and every example carries an auto-derived import block.
	const examples = (meta.examples ?? []).map((ex) => {
		// An elision placeholder is `…` standing in for omitted JSX (sole/leading
		// child or `{…}`) — a trailing `…` inside real UI copy ("Saving…") is fine.
		if (/>\s*…/.test(ex.code) || /\{\s*…\s*\}/.test(ex.code)) {
			contractErrors.push(
				`${meta.name} — "${ex.label}": example elides its content (…) — examples must be complete, copy-pasteable code.`,
			)
		}
		EXAMPLE_TAGS.push({ owner: meta.name, label: ex.label, code: ex.code, path })

		const { imports, unknown } = deriveImports(ex.code)
		for (const tag of unknown) {
			contractErrors.push(
				`${meta.name} — "${ex.label}": <${tag}> is not exported by the package (phantom component). Use real exports, or add it to EXTERNAL_COMPONENTS if consumers genuinely supply it.`,
			)
		}
		// Both spellings: <Icon name="…"> and any component taking an `icon="…"`
		// name prop (ScrubField, Badge, …). Checking only the element let an
		// off-contract `icon="opacity"` ship in three examples — a consumer
		// copying it gets no glyph at all, because an unknown name resolves to
		// null rather than throwing.
		const iconRefs = [
			...ex.code.matchAll(/<Icon\s[^>]*name="([^"]+)"/g),
			...ex.code.matchAll(/\bicon="([a-z0-9-]+)"/g),
		]
		for (const m of iconRefs) {
			if (!ICON_CONTRACT.has(m[1])) {
				contractErrors.push(
					`${meta.name} — "${ex.label}": icon "${m[1]}" is not in registry.json → iconContract.names — an example must not teach an off-contract icon.`,
				)
			}
		}
		return imports ? { ...ex, imports } : { ...ex }
	})

	const taxon = COMPONENT_TAXONOMY[meta.name]
	return {
		name: meta.name,
		status: meta.status,
		// Emitted, not just checked: an agent reading the catalog needs to know
		// that `Toast` is a family label and there is nothing to `import { Toast }`.
		...(meta.system ? { system: true } : {}),
		...(meta.supersededBy ? { supersededBy: meta.supersededBy } : {}),
		// Role and register, emitted per component so a consumer of registry.json
		// gets the grouping too. Before this the catalog was a flat list of 100
		// components with no sibling signal at all.
		...(taxon ? { group: taxon[0], register: taxon[1] } : {}),
		...(path ? { path } : {}),
		summary: meta.summary,
		...(keywords ? { keywords } : {}),
		...(usage ? { usage } : {}),
		...(related ? { related } : {}),
		props: meta.props,
		...(meta.subcomponents ? { subcomponents: meta.subcomponents } : {}),
		...(meta.variants ? { variants: meta.variants } : {}),
		tokensUsed: meta.tokensUsed,
		// Emitted in full, opt-outs included. A consumer auditing their app needs to
		// see that Separator declined `response` on purpose just as much as they need
		// to see that Dialog fills it — otherwise every unfilled slot reads as a bug
		// worth re-litigating.
		...(meta.motion ? { motion: meta.motion } : {}),
		...(meta.a11y ? { a11y: meta.a11y } : {}),
		examples,
	}
}

/* ── Import each component meta and emit its catalog entry. ─────────────────── */
const components = []
for (const { dir, file } of metaFiles) {
	const mod = await import(pathToFileURL(file).href)
	const meta = Object.values(mod).find(
		(v) =>
			v &&
			typeof v === "object" &&
			"name" in v &&
			"summary" in v &&
			"props" in v,
	)
	if (!meta) {
		console.error(`[build-registry] ✗ no ComponentMeta export in ${file}`)
		process.exit(1)
	}
	components.push(toEntry(meta, `components/${dir}`))
}
components.sort((a, b) => a.name.localeCompare(b.name))

/* ── Taxonomy contract, validated in BOTH directions. ────────────────────────
 * The grouping used to live only in the docs app's nav array, so nothing
 * checked it: PanelGroup, PanelSection, ScrubField and StatusBar shipped in
 * 0.31.0 unfiled and undocumented and survived four releases that way. These
 * two loops are the reason that cannot recur. */
const DOCS_PAGES = join(PKG_ROOT, "..", "..", "apps", "docs", "src", "pages", "components")
const taxonomyNames = new Set(Object.keys(COMPONENT_TAXONOMY))
for (const c of components) {
	const taxon = COMPONENT_TAXONOMY[c.name]
	if (!taxon) {
		contractErrors.push(
			`${c.name}: missing from src/lib/taxonomy.ts. Every component must declare a group and a register — an unfiled component is invisible in the nav and has no sibling signal in the catalog.`,
		)
		continue
	}
	taxonomyNames.delete(c.name)
	if (!COMPONENT_GROUPS.includes(taxon[0])) {
		contractErrors.push(
			`${c.name}: group "${taxon[0]}" is not one of COMPONENT_GROUPS (${COMPONENT_GROUPS.join(", ")}).`,
		)
	}
	if (!["page", "workspace", "either"].includes(taxon[1])) {
		contractErrors.push(`${c.name}: register "${taxon[1]}" must be page | workspace | either.`)
	}
	// The catalog name must be a REAL export. `Error` sat in the catalog for
	// months while the package exported `ErrorState` — so every agent reading the
	// catalog wrote `import { Error }`, which does not exist and, worse, names the
	// JS global. The catalog is the API as far as an agent is concerned; a name
	// that isn't importable is a catalog that lies.
	if (!SURFACE.values.has(c.name)) {
		// `system: true` says the name labels a family (Toast → ToastProvider,
		// toast(), parts). Even then it must prefix something real, so a typo can't
		// hide behind the flag. Note that prefix-matching ALONE would have passed
		// `Error` — `ErrorState` starts with it — which is why the flag is explicit
		// rather than inferred.
		const prefixes = [...SURFACE.values].some((v) => v.startsWith(c.name))
		if (!c.system) {
			contractErrors.push(
				`${c.name}: the catalog advertises this name but the package barrel exports no such value. Rename the meta's \`name\` to the exported name, or export it — or, if it genuinely labels a system of parts rather than one import, set \`system: true\` in the meta.`,
			)
		} else if (!prefixes) {
			contractErrors.push(
				`${c.name}: declared \`system: true\`, but nothing in the export surface even starts with "${c.name}".`,
			)
		}
	}
	// Every component gets a docs page. This is the check whose absence let four
	// components ship with no page at all.
	if (existsSync(DOCS_PAGES) && !existsSync(join(DOCS_PAGES, `${c.name}Page.tsx`))) {
		contractErrors.push(
			`${c.name}: no docs page at apps/docs/src/pages/components/${c.name}Page.tsx. A shipped component without a page is undiscoverable.`,
		)
	}
}
// The other direction: a taxonomy entry naming a component that no longer exists
// is stale, and would render a nav link to nothing.
for (const orphan of taxonomyNames) {
	contractErrors.push(
		`taxonomy.ts lists "${orphan}", which is not a component on disk. Remove the stale entry.`,
	)
}

/* ── Guidance floor: a RATCHET, not a target. ─────────────────────────────────
 * An audit found every component carries usage/do/dont/a11y/related, but most sit
 * at exactly the minimum — two dos, one dont, one example — while the handful
 * written most recently carry three or more of each. The gap is depth, not
 * presence, and depth is invisible without a number attached to it.
 *
 * These minima are set to what the library ALREADY satisfies, so the gate cannot
 * be met by deleting guidance and can be raised as the debt is paid down. Run
 * `--doc-report` to see the distribution and the weakest entries. */
// Ratchet history: examples raised 1 → 2 once the thirteen single-example
// components had a second one that taught something the first could not (usually
// "which of these three near-identical components do I actually want", which is
// the question a single happy-path example never answers).
// Ratchet history:
//   examples 1 → 2  once the thirteen single-example components had a second one
//                   that disambiguated them from their near-neighbours.
//   dont     1 → 2  once all 71 single-dont components had a second. Note the
//                   trap this invites: seven of those second donts merely
//                   restated the first, which inflates the count and teaches
//                   nothing. They were found by similarity-checking the pairs and
//                   rewritten. A ratchet measures presence; only review catches
//                   redundancy.
//   a11y     1 → 2  once the last five single-note components had a second.
const GUIDANCE_FLOOR = { do: 1, dont: 2, a11y: 2, examples: 2, related: 1 }
const guidanceScores = []
for (const c of components) {
	const bp = c.usage?.bestPractices ?? []
	const s = {
		name: c.name,
		group: c.group,
		do: bp.filter((b) => b.guidance === "do").length,
		dont: bp.filter((b) => b.guidance === "dont").length,
		a11y: (c.a11y ?? []).length,
		examples: (c.examples ?? []).length,
		related: (c.related?.components ?? []).length,
		usage: c.usage?.description ? 1 : 0,
	}
	s.score = s.usage * 3 + Math.min(s.do, 3) + Math.min(s.dont, 3) * 2 + Math.min(s.a11y, 3) + Math.min(s.examples, 3) + (s.related ? 1 : 0)
	guidanceScores.push(s)

	if (!s.usage) {
		contractErrors.push(
			`${c.name}: no usage.description. An agent cannot tell why the component exists or when to reach for it.`,
		)
	}

	/* Deprecation must be STRUCTURED, not prose. CategoryPill announced
	 * "DEPRECATED" in its summary while carrying status: "stable" — an agent
	 * reading the contract would have used it without hesitation. Checked both
	 * ways so the two can never drift apart again. */
	// A deprecated PROP is declared on the prop (`deprecated: "<use instead>"`)
	// and does not deprecate its component; prose saying so without the field
	// is the same uninterpretable contract one level down.
	for (const p of c.props ?? []) {
		if (!p.deprecated && /\bdeprecat/i.test(p.description)) {
			contractErrors.push(
				`${c.name}.${p.name}: its description says "deprecated" but the prop has no \`deprecated\` field. Set deprecated: "<what to use instead>".`,
			)
		}
	}
	const saysDeprecated = /\bdeprecat/i.test(
		JSON.stringify({ ...c, props: (c.props ?? []).filter((p) => !p.deprecated) }),
	)
	if (saysDeprecated && c.status !== "deprecated") {
		contractErrors.push(
			`${c.name}: its documentation says "deprecated" but status is "${c.status}". Set status: "deprecated" — prose an agent has to interpret is not a contract.`,
		)
	}
	if (c.status === "deprecated" && !c.supersededBy) {
		contractErrors.push(
			`${c.name}: status is "deprecated" with no supersededBy. A deprecation without a forward path strands the reader.`,
		)
	}
	if (c.supersededBy && !COMPONENT_TAXONOMY[c.supersededBy]) {
		contractErrors.push(
			`${c.name}: supersededBy "${c.supersededBy}" is not a component. The replacement must be real.`,
		)
	}
	for (const [field, min] of Object.entries(GUIDANCE_FLOOR)) {
		if (s[field] < min) {
			contractErrors.push(
				`${c.name}: ${field} = ${s[field]}, below the guidance floor of ${min}. The floor is ${Object.entries(GUIDANCE_FLOOR).map(([k, v]) => `${k} ≥ ${v}`).join(", ")} — and a second entry must state a DIFFERENT failure, not restate the first.`,
			)
		}
	}
}

if (process.argv.includes("--doc-report")) {
	guidanceScores.sort((a, b) => a.score - b.score)
	const MAXS = 3 + 3 + 6 + 3 + 3 + 1
	console.log(`\n[doc-report] guidance depth, ${components.length} components (max ${MAXS})\n`)
	console.log("  score  component              do dont a11y  ex rel")
	for (const s of guidanceScores) {
		console.log(
			`  ${String(s.score).padStart(2)}/${MAXS}  ${s.name.padEnd(22)} ${String(s.do).padStart(2)} ${String(s.dont).padStart(4)} ${String(s.a11y).padStart(4)} ${String(s.examples).padStart(3)} ${String(s.related).padStart(3)}`,
		)
	}
	const mean = (guidanceScores.reduce((a, b) => a + b.score, 0) / guidanceScores.length).toFixed(1)
	console.log(`\n  mean ${mean}/${MAXS} · at-or-below 13: ${guidanceScores.filter((s) => s.score <= 13).length} · <2 examples: ${guidanceScores.filter((s) => s.examples < 2).length}`)
}

/* ── Layout primitives: same meta contract, aggregated from src/layout. ─────── */
const layoutMod = await import(
	pathToFileURL(join(PKG_ROOT, "src", "layout", "layout.meta.ts")).href
)
const layoutPrimitives = {
	doctrine: [
		"A page's width is a Region — a centered, opt-in, purpose-named cap (prose/form/feed/content/wide/full). Pick by ROLE, not size. Never a global page max-width.",
		"The 12-column grid (Grid/Columns) is used WITHIN a region, for genuinely multi-column content. Never use a column span as the page's reading width.",
		"App chrome is not on the grid: Sidebar and rails are fixed-width chrome outside the content grid.",
		"Measure ≠ width: cap text line-length (prose, in ch) independently of a region's layout width.",
		"Every vertical measure is a multiple of --rhythm-unit (8px); Stack/Row gap numbers are rhythm units, not pixels.",
	],
	primitives: layoutMod.layoutPrimitiveMetas.map((m) => toEntry(m, "layout")),
}

/* ── Example props must be documented props — across components. ──────────────
 * Runs here, once every meta has been read, so a tag in one component's example
 * can be validated against the meta that actually owns it. Props on a tag we do
 * not own (a router `<Link>`) are skipped; DOM/global attributes are React's
 * contract, not ours. */
function checkExampleProps() {
	// tag name → the props its own meta documents.
	const propsByTag = new Map()
	const addTag = (name, props) => {
		if (!name) return
		const set = propsByTag.get(name) ?? new Set()
		for (const p of props) set.add(p)
		propsByTag.set(name, set)
	}
	const fromMeta = (m) => {
		const own = (m.props ?? []).map((p) => p.name)
		addTag(m.name, own)
		for (const sub of m.subcomponents ?? []) {
			// A subcomponent's props live in its `type` string; it also inherits the
			// parent's table, since metas routinely document a shared prop once.
			addTag(sub.name, [
				...own,
				...[...(sub.type ?? "").matchAll(/([a-zA-Z][\w]*)\??:/g)].map((x) => x[1]),
			])
		}
	}
	for (const c of components) fromMeta(c)
	for (const p of layoutPrimitives.primitives) fromMeta(p)

	/* Props inherit. `PageProps extends RegionProps`, so `<Page max="feed">` is
	 * correct even though `max` is documented on Region — and the first version of
	 * this check reported it as undocumented. Resolve the chain from the source so
	 * inheritance is a fact read from the code, not a list maintained by hand. */
	const extendsOf = new Map()
	const scanExtends = (file) => {
		for (const m of readFileSync(file, "utf8").matchAll(
			/interface ([A-Z][A-Za-z]*)Props extends ([A-Z][A-Za-z]*)Props/g,
		)) {
			if (m[2] !== "Component") extendsOf.set(m[1], m[2])
		}
	}
	for (const f of readdirSync(join(PKG_ROOT, "src", "layout"))) {
		if (f.endsWith(".tsx")) scanExtends(join(PKG_ROOT, "src", "layout", f))
	}
	for (const dir of readdirSync(COMPONENTS)) {
		const d = join(COMPONENTS, dir)
		if (!statSync(d).isDirectory()) continue
		for (const f of readdirSync(d)) {
			if (f.endsWith(".tsx") && !/\.(meta|test)\.tsx$/.test(f)) scanExtends(join(d, f))
		}
	}
	// Walk each chain to a fixed point, guarding against a cycle.
	for (const tag of [...propsByTag.keys()]) {
		const seen = new Set([tag])
		let cur = extendsOf.get(tag)
		while (cur && !seen.has(cur)) {
			seen.add(cur)
			for (const p of propsByTag.get(cur) ?? []) propsByTag.get(tag).add(p)
			cur = extendsOf.get(cur)
		}
	}

	const GLOBAL_PROPS = new Set([
		"key", "ref", "className", "style", "id", "children", "render", "role",
		"onClick", "onChange", "onKeyDown", "onValueChange", "value", "defaultValue",
		"disabled", "type", "name", "placeholder", "checked", "defaultChecked",
		"htmlFor", "href", "src", "alt", "title", "aria-label", "data-testid",
		// Native attributes and DOM events on components that spread to an element.
		"onSubmit", "onFocus", "onBlur", "onInput", "onDragOver", "onDragLeave",
		"onDrop", "onDragStart", "onMouseEnter", "onMouseLeave", "onPointerDown",
		"accept", "autoFocus", "readOnly", "required", "rows", "target", "rel",
	])

	for (const ex of EXAMPLE_TAGS) {
		for (const { tag, props } of jsxAttributes(ex.code)) {
			const documented = propsByTag.get(tag)
			if (!documented) continue // not ours (router Link, host element)
			for (const prop of props) {
				if (GLOBAL_PROPS.has(prop) || prop.startsWith("data-") || prop.startsWith("aria-"))
					continue
				if (documented.has(prop)) continue
				contractErrors.push(
					`${ex.owner} — "${ex.label}": <${tag}> is passed \`${prop}\`, which appears in no props or subcomponent table for ${tag}. Document it, or fix the example.`,
				)
			}
		}
	}
}
checkExampleProps()

/* ── Example code must carry a scrollbar policy. ───────────────────────────────
 * `design-lint` enforces this in component source, but it skips *.meta.ts — and
 * meta examples are the half agents actually copy. `registry.json` shipped
 * `<Tree className="min-h-0 flex-1 overflow-y-auto">` and
 * `<WorkspaceCanvas className="overflow-y-auto">` for several releases, which is
 * a catalog teaching the exact thing the linter forbids in our own code. A rule
 * enforced on one side of the contract and not the other is not enforced.
 *
 * Pattern source is excluded: it lives in real .tsx that the linter already
 * covers, so checking it here would double-report the same line. */
function checkExampleScrollPolicy() {
	const OVERFLOW = /\boverflow(?:-[xy])?-(?:auto|scroll)\b/
	for (const ex of EXAMPLE_TAGS) {
		// Class strings only — an example may legitimately narrate overflow in prose.
		for (const m of ex.code.matchAll(/className=(?:"([^"]*)"|'([^']*)')/g)) {
			const classes = m[1] ?? m[2] ?? ""
			const hit = classes.match(OVERFLOW)
			if (!hit) continue
			if (/\bscrollbar-(?:quiet|hidden)\b/.test(classes)) continue
			contractErrors.push(
				`${ex.owner} — "${ex.label}": \`${hit[0]}\` with no scrollbar policy. Add \`scrollbar-quiet\` (a quiet bar that appears while scrolling) or \`scrollbar-hidden\` (only when something else carries the affordance). Examples are what consumers copy, so an unmanaged scroll container here becomes one in their app.`,
			)
		}
	}
}
checkExampleScrollPolicy()


/* ── Patterns: canonical page shells. The SOURCE is the contract — the code
 * after each file's `// ---pattern-code---` marker is emitted verbatim, so the
 * registry's page recipes always compile (they're typechecked, design-linted,
 * and rendered live by the docs app). ───────────────────────────────────────── */
const PATTERNS_DIR = join(PKG_ROOT, "src", "patterns")
const REACT_IMPORTS = [
	"useState",
	"useEffect",
	"useMemo",
	"useCallback",
	"useRef",
	"useId",
]

/**
 * Load a copy-in tier (patterns, blocks): each `<base>.meta.ts` + `<base>.tsx`
 * pair, with the source after the `// ---<kind>-code---` marker emitted
 * verbatim and its consumer imports derived. `extra` maps the meta to the
 * tier's own catalog fields.
 */
async function loadCompositions(kind, dir, extra = () => ({})) {
	const items = []
	for (const f of readdirSync(dir)) {
		if (!/\.meta\.ts$/.test(f)) continue
		const base = f.replace(/\.meta\.ts$/, "")
		const mod = await import(pathToFileURL(join(dir, f)).href)
		const meta = Object.values(mod).find(
			(v) => v && typeof v === "object" && "name" in v && "intent" in v,
		)
		if (!meta) {
			console.error(`[build-registry] ✗ no ${kind} meta export in ${f}`)
			process.exit(1)
		}
		const text = readFileSync(join(dir, `${base}.tsx`), "utf8")
		const parts = text.split(new RegExp(`// ---${kind}-code---\\r?\\n`))
		if (parts.length !== 2) {
			contractErrors.push(
				`${meta.name}: ${kind} file needs exactly one \`// ---${kind}-code---\` marker separating imports from source.`,
			)
			continue
		}
		const code = parts[1].trim()
		if (/>\s*…/.test(code) || /\{\s*…\s*\}/.test(code)) {
			contractErrors.push(`${meta.name}: ${kind} source elides content (…).`)
		}
		const { imports, unknown } = deriveImports(code)
		for (const tag of unknown) {
			contractErrors.push(
				`${meta.name}: <${tag}> is not exported by the package (phantom component in ${kind}).`,
			)
		}
		for (const m of code.matchAll(/<Icon\s[^>]*name="([^"]+)"/g)) {
			if (!ICON_CONTRACT.has(m[1])) {
				contractErrors.push(
					`${meta.name}: <Icon name="${m[1]}"> is not in the icon contract.`,
				)
			}
		}
		// A type argument is allowed between name and call: `useState<boolean[]>(`.
		const reactNames = REACT_IMPORTS.filter((h) =>
			new RegExp(`\\b${h}\\s*(?:<[^>()]*>)?\\s*\\(`).test(code),
		)
		const importLines = [
			...(reactNames.length
				? [`import { ${reactNames.join(", ")} } from "react"`]
				: []),
			...(imports ? [imports] : []),
		]
		items.push({
			name: meta.name,
			path: `${kind}s/${base}.tsx`,
			summary: meta.summary,
			intent: meta.intent,
			...extra(meta),
			...(meta.notes ? { notes: meta.notes } : {}),
			...(meta.a11y ? { a11y: meta.a11y } : {}),
			imports: importLines.join("\n"),
			code,
		})
	}
	return items.sort((a, b) => a.name.localeCompare(b.name))
}

const patternItems = await loadCompositions("pattern", PATTERNS_DIR)

/* ── Blocks: section-sized compositions, shipped the same way as patterns. The
 * block contract is checked here because it is what keeps a block a block:
 * its props are layout and the primary action only, never content, so the
 * copied file stays one clean starting point. ──────────────────────────────── */
const BLOCKS_DIR = join(PKG_ROOT, "src", "blocks")
const blockItems = await loadCompositions("block", BLOCKS_DIR, (meta) => ({
	family: meta.family,
	kind: meta.kind,
	...(meta.width ? { width: meta.width } : {}),
}))
for (const b of blockItems) {
	if (!/Block$/.test(b.name)) contractErrors.push(`${b.name}: a block's name ends in "Block".`)
	if (!b.family) contractErrors.push(`${b.name}: a block declares a \`family\` for the catalog.`)
	if (b.kind === "card" && !b.width) {
		contractErrors.push(`${b.name}: a card block declares its designed \`width\` ({ min, max }).`)
	}
	// Every block takes className, so a host can size and place it.
	if (!new RegExp(`function ${b.name}\\(\\{[^}]*\\bclassName\\b`).test(b.code)) {
		contractErrors.push(`${b.name}: a block accepts \`className\` on its root.`)
	}
	// A card block built on Card offers framed={false} for hosts that already
	// frame it. Section blocks hold cards but are not one, so there is no frame
	// to drop.
	if (b.kind === "card" && /<Card\b/.test(b.code) && !/\bframed\b/.test(b.code)) {
		contractErrors.push(`${b.name}: a block built on Card accepts \`framed\` (Card variant default / flat).`)
	}
}

/* ── llms/ markdown mirrors: one self-contained .md per component/pattern/
 * layout primitive, so an agent can fetch a single file instead of grepping
 * registry.json. Slugs: components/layout use the kebab-case leaf (dir name
 * or PascalCase→kebab of the name — layout primitives all share path
 * "layout", so there's no per-item path segment to reuse); patterns reuse
 * the file's own base name (already kebab-case). ─────────────────────────── */

function kebab(name) {
	return name
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/\s+/g, "-")
		.toLowerCase()
}
function componentSlug(c) {
	return c.path.split("/").pop()
}
function patternSlug(p) {
	return p.path.replace(/^patterns\//, "").replace(/\.tsx$/, "")
}
function blockSlug(b) {
	return b.path.replace(/^blocks\//, "").replace(/\.tsx$/, "")
}
function layoutSlug(m) {
	return kebab(m.name)
}

function mdTable(headers, rows) {
	if (!rows.length) return ""
	const esc = (s) => String(s ?? "—").replace(/\|/g, "\\|").replace(/\r?\n/g, " ")
	return [
		`| ${headers.join(" | ")} |`,
		`| ${headers.map(() => "---").join(" | ")} |`,
		...rows.map((r) => `| ${r.map(esc).join(" | ")} |`),
	].join("\n")
}

/** Render a component or layout-primitive catalog entry (shared shape) as a
 * self-contained markdown mirror. */
function renderEntryMd(entry) {
	const lines = [`# ${entry.name}`, "", `**Status:** ${entry.status}`, "", entry.summary, ""]
	if (entry.keywords?.length) lines.push(`**Keywords:** ${entry.keywords.join(", ")}`, "")

	if (entry.usage) {
		lines.push("## Usage", "")
		if (entry.usage.description) lines.push(entry.usage.description, "")
		const dos = entry.usage.bestPractices?.filter((p) => p.guidance === "do") ?? []
		const donts = entry.usage.bestPractices?.filter((p) => p.guidance === "dont") ?? []
		if (dos.length || donts.length) {
			lines.push("### Best practices", "")
			for (const d of dos) lines.push(`- Do: ${d.description}`)
			for (const d of donts) lines.push(`- Don't: ${d.description}`)
			lines.push("")
		}
		if (entry.usage.anatomy?.length) {
			lines.push(
				"### Anatomy",
				"",
				mdTable(
					["Part", "Required", "Description"],
					entry.usage.anatomy.map((a) => [a.name, a.required ? "yes" : "no", a.description]),
				),
				"",
			)
		}
	}

	if (entry.subcomponents?.length) {
		lines.push(
			"## Subcomponents",
			"",
			mdTable(
				["Name", "Type", "Description"],
				entry.subcomponents.map((s) => [s.name, s.type, s.description]),
			),
			"",
		)
	}

	if (entry.props?.length) {
		lines.push(
			"## Props",
			"",
			mdTable(
				["Name", "Type", "Default", "Description"],
				entry.props.map((p) => [p.name, p.type, p.default, p.description]),
			),
			"",
		)
	}

	if (entry.variants) {
		lines.push("## Variants", "")
		for (const [group, values] of Object.entries(entry.variants))
			lines.push(`- **${group}**: ${values.join(", ")}`)
		lines.push("")
	}

	if (entry.tokensUsed?.length) {
		lines.push("## Tokens used", "", entry.tokensUsed.map((t) => `\`${t}\``).join(", "), "")
	}

	/* Rendered for the same reason `a11y` is: the llms/ mirrors are what an agent
	 * actually reads before writing a line of code, and a field that exists only
	 * in registry.json is a field that never reaches the point of decision. The
	 * declined slots are printed too — "this does not animate, here is why" is the
	 * sentence that stops the next agent from adding motion where it was ruled
	 * out, which is the failure mode on the other side of this whole change. */
	if (entry.motion?.length) {
		lines.push("## Motion", "")
		for (const slot of ["arrival", "response", "transition", "activity"]) {
			for (const m of entry.motion.filter((x) => x.slot === slot)) {
				const how =
					m.recipe === "none"
						? "_no motion_"
						: m.recipe === "custom"
							? "_custom (outside the recipe layer)_"
							: `\`${m.recipe}\``
				lines.push(`- **${slot}** · ${m.part} · ${how} — ${m.why}`)
			}
		}
		lines.push("")
	}

	if (entry.a11y?.length) {
		lines.push("## Accessibility", "")
		for (const a of entry.a11y) lines.push(`- ${a}`)
		lines.push("")
	}

	if (entry.related) {
		lines.push("## Related", "")
		if (entry.related.components?.length)
			lines.push(`- Components: ${entry.related.components.join(", ")}`)
		if (entry.related.patterns?.length)
			lines.push(`- Patterns: ${entry.related.patterns.join(", ")}`)
		lines.push("")
	}

	if (entry.examples?.length) {
		lines.push("## Examples", "")
		for (const ex of entry.examples) {
			lines.push(`### ${ex.label}`, "")
			lines.push("```tsx", [ex.imports, ex.code].filter(Boolean).join("\n\n"), "```", "")
		}
	}

	return `${lines.join("\n").trimEnd()}\n`
}

/** Render a pattern's or block's markdown mirror — the emitted source verbatim. */
function renderPatternMd(p) {
	const lines = [`# ${p.name}`, "", p.summary, "", `**Intent:** ${p.intent}`, ""]
	if (p.family) {
		const width = p.width ? ` · designed for ${p.width.min}–${p.width.max} wide (fills its container up to the max)` : ""
		lines.push(`**Block:** ${p.family} · ${p.kind}${width}`, "")
	}
	if (p.notes?.length) {
		lines.push("## Notes", "")
		for (const n of p.notes) lines.push(`- ${n}`)
		lines.push("")
	}
	if (p.a11y?.length) {
		lines.push("## Accessibility", "")
		for (const a of p.a11y) lines.push(`- ${a}`)
		lines.push("")
	}
	lines.push(
		"## Source",
		"",
		"```tsx",
		[p.imports, p.code].filter(Boolean).join("\n\n"),
		"```",
		"",
	)
	return `${lines.join("\n").trimEnd()}\n`
}

// Concatenated in the same order the catalog uses: patterns, layout primitives,
// components — so llms-full.txt reads the same way the catalog is organized.
const REGISTRY_TOKENS = JSON.parse(readFileSync(REGISTRY_PATH, "utf8")).tokens

/* ── The token list must come FROM the contract, not from the last build. ─────
 * This block reads `registry.json` — its own previous output — which made the
 * token families self-perpetuating: whatever was seeded stayed, and a token added
 * to `_contract.ts` afterwards could never enter. `border-strong` was added to the
 * contract and sat outside the registry indefinitely, which mattered more than it
 * looks: `sable-lint` builds a CONSUMER's token vocabulary from registry.json, so
 * a token missing here is a token flagged as a typo in someone else's codebase.
 * The contract is now authoritative for `semantic`, and `motion` is cross-checked
 * both ways (its registry shape is durations/easings/recipes, not a name list, so
 * it is validated rather than regenerated). */
{
	const contractSrc = readFileSync(join(PKG_ROOT, "src", "themes", "_contract.ts"), "utf8")
	const semantic = readContractArray(contractSrc, "SEMANTIC_TOKENS")
	const prior = new Map(
		(REGISTRY_TOKENS.semantic ?? []).map((e) => [typeof e === "string" ? e : e.name, e]),
	)
	REGISTRY_TOKENS.semantic = semantic.map((name) => prior.get(name) ?? name)
	// Optional hooks must be discoverable without becoming required declarations
	// in every theme. Derive them from source so existing user-added hooks cannot
	// remain an undocumented stylesheet feature.
	REGISTRY_TOKENS.typographyOverrides = readContractArray(contractSrc, "TYPE_REFINEMENT_TOKENS")
	// Derived tokens: every theme gets them from styles.css, so they are not in
	// SEMANTIC_TOKENS (which each theme must declare) — but an agent still needs
	// to know they exist and what they are for, so they are advertised here.
	REGISTRY_TOKENS.derived = [
		...readContractArray(contractSrc, "WORKSPACE_SURFACE_TOKENS"),
		...readContractArray(contractSrc, "DERIVED_EDGE_TOKENS"),
	]

	const contractMotion = new Set(readContractArray(contractSrc, "MOTION_TOKENS"))
	const registryMotion = new Set(motionNamesFromRegistry(REGISTRY_TOKENS.motion))
	for (const name of contractMotion) {
		if (!registryMotion.has(name)) {
			contractErrors.push(
				`tokens.motion omits "${name}" — it is in _contract.ts MOTION_TOKENS but not in registry.json, so a consumer running sable-lint would see it as an unknown token.`,
			)
		}
	}
	for (const name of registryMotion) {
		if (!contractMotion.has(name)) {
			contractErrors.push(
				`tokens.motion advertises "${name}", which is not in _contract.ts MOTION_TOKENS. Either add it to the contract or drop it from registry.json.`,
			)
		}
	}
}

/* ── Motion: the recipe list, the per-component declarations, the coverage. ───
 * Sable's four motion rules (raw-duration, builtin-animate, transition-colors,
 * unknown-motion) are all PROHIBITIVE — every one fires on motion that is present
 * and wrong, and not one can fire on motion that is absent. A component with no
 * animation at all cleared every gate in the system, which is exactly the shape
 * an agent optimises into: it writes what is checked. `motion` in the meta is the
 * declaration; this block is what makes the declaration mean something. */
const SHIPPED_RECIPES = new Set(
	[...readFileSync(join(PKG_ROOT, "src", "styles.css"), "utf8").matchAll(
		/@utility\s+((?:motion|animate)-[a-z-]+)\s*\{/g,
	)].map((m) => m[1]),
)

/* The advertised list and the shipped list must be the same list. `sable-lint`
 * and every consuming agent read the registry's copy, so a recipe defined in
 * styles.css but absent here is a recipe nobody outside this package knows
 * exists — which is what happened to motion-orbit, motion-text-shimmer and
 * motion-draw, all shipped and none advertised. */
{
	const advertised = new Set(REGISTRY_TOKENS.motion?.recipes ?? [])
	for (const name of SHIPPED_RECIPES) {
		if (!advertised.has(name)) {
			contractErrors.push(
				`tokens.motion.recipes omits "${name}" — styles.css defines it as an @utility, so it works, but nothing reading registry.json knows it exists.`,
			)
		}
	}
	for (const name of advertised) {
		if (!SHIPPED_RECIPES.has(name)) {
			contractErrors.push(
				`tokens.motion.recipes advertises "${name}", which styles.css does not define. A recipe in the catalog that silently no-ops is worse than one that is missing.`,
			)
		}
	}
}

/* ── Utilities: every @utility and @custom-variant is documented exactly once. ─
 * styles.css ships a layer between tokens and components — relative surfaces,
 * frames, state variants, scroll policies — and none of it was in the registry.
 * `sable search "well"` returned the `muted` token, so agents hand-mixed the
 * colour `sable-well` already computes. Each name in styles.css must now be
 * documented in exactly ONE of: `UTILITY_DOCS` (src/utilities/utility-docs.ts),
 * `tokens.typography` (the paired `text-*` tiers, named without `text-`), or
 * `tokens.motion.recipes` (`motion-*` / `animate-*`). None is a utility nobody
 * can find; two is two descriptions waiting to disagree. Reverse direction too:
 * a doc for a utility styles.css no longer defines is a recipe that no-ops. */
const UTILITY_DOCS_MOD = await import(
	pathToFileURL(join(PKG_ROOT, "src", "utilities", "utility-docs.ts")).href
)
const UTILITY_DOCS = UTILITY_DOCS_MOD.UTILITY_DOCS
const UTILITY_FAMILIES = UTILITY_DOCS_MOD.UTILITY_FAMILIES
const UTILITIES_ELSEWHERE = UTILITY_DOCS_MOD.UTILITIES_ELSEWHERE
{
	// Line-anchored, so the header comment's prose ("the paired typography
	// @utility set") is not read as a utility named `set`.
	const css = readFileSync(join(PKG_ROOT, "src", "styles.css"), "utf8")
	const shipped = [
		...[...css.matchAll(/^[ \t]*@utility\s+([a-z][a-z0-9-]*(?:-\*)?)\s*\{/gm)].map((m) => ({ name: m[1], kind: "utility" })),
		...[...css.matchAll(/^[ \t]*@custom-variant\s+([a-z][a-z0-9-]*)\s*[({]/gm)].map((m) => ({ name: m[1], kind: "variant" })),
	]
	const typographyNames = new Set(
		(REGISTRY_TOKENS.typography ?? []).map((e) => `text-${typeof e === "string" ? e : e.name}`),
	)
	const recipeNames = new Set(REGISTRY_TOKENS.motion?.recipes ?? [])
	const docNames = new Map()
	for (const doc of UTILITY_DOCS) {
		if (docNames.has(doc.name)) contractErrors.push(`utilities: "${doc.name}" is documented twice in src/utilities/utility-docs.ts.`)
		docNames.set(doc.name, doc)
	}
	const shippedNames = new Map(shipped.map((s) => [s.name, s]))
	for (const { name, kind } of shipped) {
		const homes = [
			docNames.has(name) && "utilities (src/utilities/utility-docs.ts)",
			typographyNames.has(name) && "tokens.typography",
			recipeNames.has(name) && "tokens.motion.recipes",
		].filter(Boolean)
		const decl = kind === "variant" ? "@custom-variant" : "@utility"
		if (homes.length === 0) {
			contractErrors.push(
				`utilities: styles.css declares \`${decl} ${name}\` but nothing documents it, so no agent can find it. ` +
					`Add an entry to src/utilities/utility-docs.ts${name.startsWith("text-") ? " (or a tokens.typography entry for a paired page tier)" : ""}${/^(motion|animate)-/.test(name) ? " (or list it in registry.json → tokens.motion.recipes)" : ""}.`,
			)
		} else if (homes.length > 1) {
			contractErrors.push(`utilities: \`${decl} ${name}\` is documented in ${homes.join(" AND ")}. Keep exactly one.`)
		}
		const doc = docNames.get(name)
		if (doc && doc.kind !== kind) {
			contractErrors.push(`utilities: "${name}" is a ${decl} in styles.css but utility-docs.ts says kind "${doc.kind}".`)
		}
	}
	for (const doc of UTILITY_DOCS) {
		if (!shippedNames.has(doc.name)) {
			contractErrors.push(`utilities: utility-docs.ts documents "${doc.name}", which styles.css does not declare. A documented utility that silently no-ops is worse than a missing one.`)
		}
		if (!UTILITY_FAMILIES.includes(doc.family)) {
			contractErrors.push(`utilities: "${doc.name}" has family "${doc.family}", not one of ${UTILITY_FAMILIES.join(", ")}.`)
		}
		for (const field of ["intent", "whenToUse", "insteadOf", "example"]) {
			if (!doc[field]?.trim()) contractErrors.push(`utilities: "${doc.name}" has no ${field}.`)
		}
		if (!doc.keywords?.length) contractErrors.push(`utilities: "${doc.name}" has no keywords — search ranks on them.`)
	}
}

/* Per-component motion declarations. Shape and truthfulness only — whether a
 * component has ENOUGH motion is the coverage report below, which is deliberately
 * report-only until the backfill lands (the same ratchet the guidance floor used:
 * measure first, set the floor to what the library already clears, then raise). */
const MOTION_SLOTS = ["arrival", "response", "transition", "activity"]
for (const c of components) {
	if (!c.motion) continue
	const seen = new Set()
	for (const m of c.motion) {
		const where = `${c.name}: motion[${m.slot ?? "?"}/${m.part ?? "?"}]`
		if (!MOTION_SLOTS.includes(m.slot)) {
			contractErrors.push(
				`${where}: slot "${m.slot}" is not one of ${MOTION_SLOTS.join(", ")}.`,
			)
			continue
		}
		if (!m.part) contractErrors.push(`${where}: no part. Motion that cannot name what moves is motion nobody checked.`)
		// The reason is mandatory in BOTH directions. An opt-out with no reason is
		// indistinguishable from an oversight, and a filled slot with no reason
		// teaches the next reader nothing about when to copy it.
		if (!m.why?.trim()) {
			contractErrors.push(
				`${where}: no why. State what the motion is FOR — what a user would misread without it — not a restatement of the recipe.`,
			)
		}
		if (!["none", "custom"].includes(m.recipe) && !SHIPPED_RECIPES.has(m.recipe)) {
			contractErrors.push(
				`${where}: recipe "${m.recipe}" is not a shipped motion recipe. Use one of: ${[...SHIPPED_RECIPES].join(", ")} — or "none" (the slot does not apply) / "custom" (filled outside the recipe layer), each with a why.`,
			)
		}
		/* Keyed on the RECIPE too, because two recipes on one slot+part is the
		 * sanctioned composition, not a mistake: Button's response is
		 * motion-interactive (which declares the transition, scale included) plus
		 * motion-press (which supplies only the pressed target). Rejecting that
		 * pair would have made the contract disagree with the recipe that exists
		 * specifically to be paired. What is still a mistake is the same recipe
		 * listed twice for the same part. */
		const key = `${m.slot}:${m.part}:${m.recipe}`
		if (seen.has(key)) {
			contractErrors.push(
				`${where}: "${m.recipe}" is listed twice for ${m.slot} on "${m.part}".`,
			)
		}
		seen.add(key)
	}
}

/* Coverage. "Interactive" is read off the component's own source rather than
 * declared, because a flag you set by hand is a flag that goes stale — and the
 * question this answers ("does the thing under my pointer react?") is a property
 * of the code, not of anyone's intent about it.
 *
 * The signal is pointer-STATE STYLING, not event handlers, and the difference is
 * load-bearing: Button declares no onClick anywhere — it forwards one — so a
 * handler-based test scored the most interactive component in the library as
 * inert. Anything carrying `hover:` / `active:` / `focus-visible:` has already
 * decided it reacts to a pointer; the only open question is whether it does so
 * with motion. The variants file counts too, since that is where cva components
 * keep exactly these classes. */
const POINTER_STATE = /\b(?:hover|active|focus-visible|group-hover|peer-hover):/
const STATEFUL = /\bdata-\[?(?:state|open|selected|checked|active)|\baria-expanded\b|\bdata-(?:open|state)=/
const motionScores = components.map((c) => {
	const dir = componentSlug(c)
	const read = (suffix) => {
		const p = join(COMPONENTS, dir, `${dir}.${suffix}`)
		return existsSync(p) ? readFileSync(p, "utf8") : ""
	}
	const src = read("tsx") + read("variants.ts")
	// "custom" counts as filled — the slot IS answered, just not by a utility.
	const filled = new Set((c.motion ?? []).filter((m) => m.recipe !== "none").map((m) => m.slot))
	return {
		name: c.name,
		group: c.group,
		declared: Boolean(c.motion),
		interactive: POINTER_STATE.test(src),
		stateful: STATEFUL.test(src),
		filled,
	}
})

if (process.argv.includes("--motion-report")) {
	const missing = (pred, slot) => motionScores.filter((s) => pred(s) && !s.filled.has(slot))
	const undeclared = motionScores.filter((s) => !s.declared)
	console.log(`\n[motion-report] ${components.length} components\n`)
	console.log(`  declared motion:        ${components.length - undeclared.length}`)
	console.log(`  interactive, no response: ${missing((s) => s.interactive, "response").length}`)
	console.log(`  stateful, no transition:  ${missing((s) => s.stateful, "transition").length}`)
	console.log("\n  component              grp  int sta  arr res tra act")
	for (const s of [...motionScores].sort((a, b) => a.filled.size - b.filled.size || a.name.localeCompare(b.name))) {
		const mark = (slot) => (s.filled.has(slot) ? " ● " : s.declared ? " ○ " : " · ")
		console.log(
			`  ${s.name.padEnd(22)} ${String(s.group ?? "").slice(0, 4).padEnd(4)} ${s.interactive ? " ✓ " : " · "} ${s.stateful ? " ✓ " : " · "} ${MOTION_SLOTS.map(mark).join("")}`,
		)
	}
	console.log("\n  ● filled  ○ declined with a reason  · not declared at all")
	console.log("  Fill a slot, or declare it `recipe: \"none\"` with a why. Both are answers; silence is not.\n")
}

/* ── Token intent: attach a doc to every token name the registry advertises. ──
 * `registry.tokens` used to be flat arrays of NAMES — 116 tokens telling an agent
 * that `accent` exists and nothing about when to use it instead of `secondary` or
 * `muted`. Every advertised token must now carry its intent, and the build fails
 * if one does not. */
const documentedTokens = {}
let undocumented = []
for (const [family, names] of Object.entries(REGISTRY_TOKENS)) {
	if (!Array.isArray(names)) {
		documentedTokens[family] = names
		continue
	}
	documentedTokens[family] = names.map((entry) => {
		// Idempotent: a previous run already replaced the bare string with an
		// object, so re-reading the registry must not choke on its own output.
		const name = typeof entry === "string" ? entry : entry.name
		const doc = tokenDoc(name)
		if (!doc) undocumented.push(`${family}.${name}`)
		return doc ? { name, ...doc } : { name }
	})
}
// Gated HERE, not via `contractErrors` — that array is already reported and
// exited on further up the file, so pushing to it from this point would be
// silently dropped. (It was, on the first run: 43 of 86 tokens undocumented and
// the build still printed ✓.)
if (undocumented.length) {
	console.error(
		`[build-registry] ✗ ${undocumented.length} token(s) advertised in registry.json → tokens with no entry in src/themes/token-docs.ts.\n` +
			`    A token name without stated intent is a name an agent has to guess at.\n` +
			undocumented.map((t) => `    - ${t}`).join("\n"),
	)
	process.exit(1)
}

const mirrors = [
	...foundations.map((f) => ({
		kind: "foundations",
		slug: f.slug,
		content: renderFoundationMd(f),
	})),
	...patternItems.map((p) => ({
		kind: "patterns",
		slug: patternSlug(p),
		content: renderPatternMd(p),
	})),
	...blockItems.map((b) => ({
		kind: "blocks",
		slug: blockSlug(b),
		content: renderPatternMd(b),
	})),
	...layoutPrimitives.primitives.map((m) => ({
		kind: "layout",
		slug: layoutSlug(m),
		content: renderEntryMd(m),
	})),
	...components.map((c) => ({
		kind: "components",
		slug: componentSlug(c),
		content: renderEntryMd(c),
	})),
	// Token intent is REFERENCE, not orientation: you consult it when choosing a
	// colour, not before you start. It shipped inline in llms.txt first, which put
	// ~4,000 words of lookup table in the file every agent reads before doing
	// anything. A mirror is the right shape — llms.txt links to it.
	{ kind: "reference", slug: "token-intent", content: llmsTokenIntent() },
	// Same shape for the utility layer: consulted when styling around a
	// component, linked from llms.txt rather than inlined into it.
	{ kind: "reference", slug: "utilities", content: llmsUtilities() },
]

const patterns = {
	about:
		"Canonical full-page compositions. Copy the code as a route starting point (imports included), or import the same component from `@sableui/react/patterns` to preview it before diverging. Reuse when the information architecture fits; original compositions built from layout primitives are equally valid. Pattern resemblance does not establish design quality.",
	items: patternItems,
}

const blocks = {
	about:
		"Section-sized compositions — a sign-in card, a pricing card, an order tracker — smaller than a page shell and with no behaviour of their own. Copy the code (imports included) and edit the content constants at the top, or import the same component from `@sableui/react/blocks` to see it in place first. Props are the block contract only: `className` (a card block fills its container up to its designed `width.max`; size it from the parent or with className), `framed` on Card-built blocks (false drops the surface for a Sheet, Dialog or section that already frames it), and the primary action's callback. Content is never a prop.",
	retrieve: "sable block <Name>",
	items: blockItems,
}

/* ── Variant drift: the meta must match the cva source. ──────────────────────
 * `Button` gained `xs` and `icon-xs` in 0.31.0 for the workspace control floor
 * and its meta was never updated, so the catalog advertised 5 sizes against 7 in
 * the code for ten releases. An agent reading the contract simply could not know
 * the workspace sizes existed. Comparing the meta against the variants file is
 * mechanical, so there is no reason for it to be manual. */
for (const { dir } of metaFiles) {
	const variantsPath = join(COMPONENTS, dir, `${dir}.variants.ts`)
	if (!existsSync(variantsPath)) continue
	const src = readFileSync(variantsPath, "utf8")
	const entry = components.find((c) => componentSlug(c) === dir)
	if (!entry) continue

	// Each `axis: { key: "…", "key-2": "…" }` block inside cva's variants object.
	for (const axisMatch of src.matchAll(/\n\t{2,3}([a-zA-Z]+): \{\n([\s\S]*?)\n\t{2,3}\},/g)) {
		const axis = axisMatch[1]
		if (["variants", "defaultVariants", "compoundVariants"].includes(axis)) continue
		const keys = [...axisMatch[2].matchAll(/^\s*"?([a-zA-Z][\w-]*)"?:/gm)].map((m) => m[1])
		if (keys.length === 0) continue
		const declared = entry.variants?.[axis]
		if (!declared) continue // axis not advertised at all — a separate judgement call
		const missing = keys.filter((k) => !declared.includes(k))
		const phantom = declared.filter((k) => !keys.includes(k))
		if (missing.length) {
			contractErrors.push(
				`${entry.name}: variants.${axis} omits ${missing.map((k) => `"${k}"`).join(", ")} — present in ${dir}.variants.ts but absent from the meta, so the catalog understates what the component can do.`,
			)
		}
		if (phantom.length) {
			contractErrors.push(
				`${entry.name}: variants.${axis} advertises ${phantom.map((k) => `"${k}"`).join(", ")}, which ${dir}.variants.ts does not define.`,
			)
		}
	}
}

/* ── Task entry points: hand-authored, but not unchecked. ────────────────────
 * Everything else in llms/ is organised by ARTIFACT (component, token, pattern).
 * These four are organised by what you are DOING, which is the routing layer an
 * agent needs before it can pick an artifact at all. They are prose, so they are
 * not generated — but they are load-bearing, so their existence and their
 * internal links are verified. */
const TASKS_DIR = join(PKG_ROOT, "llms", "tasks")
const REQUIRED_TASKS = [
	"creating-design-assets.md",
	"reviewing-a-journey.md",
	"reviewing-motion.md",
	"developing-taste.md",
	"building-with-sable.md",
	"building-an-ios-prototype.md",
	"creating-a-preset.md",
	"using-presets.md",
	"designing-a-surface.md",
	"reviewing-a-design.md",
	"learning-from-builds.md",
	"building-a-page.md",
	"building-a-tool.md",
	"adding-a-component.md",
	"converting-an-app.md",
	// The one that runs AFTER an app is already on Sable. Converting is a project;
	// staying converted is not, and nothing in the package used to say so — the
	// rules ship with every upgrade and silently widen what counts as a violation,
	// with no doc telling a consuming agent that re-auditing is a task that exists.
	"auditing-an-app.md",
]
for (const task of REQUIRED_TASKS) {
	const path = join(TASKS_DIR, task)
	if (!existsSync(path)) {
		contractErrors.push(
			`llms/tasks/${task} is missing. The task entry points are how an agent finds the right artifact; without them the catalog is a flat list of 100 names.`,
		)
		continue
	}
	// Relative links inside a task doc must resolve, or the routing dead-ends.
	const body = readFileSync(path, "utf8")
	for (const m of body.matchAll(/\]\((\.\.?\/[^)#]+)\)/g)) {
		const target = join(TASKS_DIR, m[1])
		if (!existsSync(target)) {
			contractErrors.push(`llms/tasks/${task}: link to "${m[1]}" does not resolve.`)
		}
	}
}

// Taste travels with the package, not just an optional plugin. Fail before
// publishing on invalid records or missing distilled evidence.
const taste = readLessons(PKG_ROOT)
contractErrors.push(...taste.errors.map((error) => `taste: ${error}`))
// The package ships no reference atlas: its captures are other companies'
// sites. `sable atlas` reads a project's own; one appearing here is a mistake.
if (existsSync(join(PKG_ROOT, "llms", "atlas"))) contractErrors.push("atlas: llms/atlas must not exist in the package; keep reference captures outside the repository.")
const tasteIds = taste.lessons.map((lesson) => lesson.id)
if (new Set(tasteIds).size !== tasteIds.length) contractErrors.push("taste: lesson ids must be unique.")

/* ── ONE gate, deliberately last. ────────────────────────────
 * This gate used to sit immediately after the component loop, which meant any
 * check added further down the file pushed into an array that had ALREADY been
 * reported — a check that runs, finds problems, and is silently discarded.
 * That happened twice: the token-intent check (43 of 86 tokens undocumented and
 * the build still printed OK) and the llms/tasks check. Adding a new check
 * should not require knowing where the gate lives, so the gate goes last. */
contractErrors.push(...themeErrors)
if (contractErrors.length) {
	console.error(
		`[build-registry] ✗ ${contractErrors.length} contract violation(s):\n` +
			contractErrors.map((e) => `    - ${e}`).join("\n"),
	)
	process.exit(1)
}

/* ── Preserve the hand-authored static blocks; regenerate version + components. */
const registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"))
registry.version = PKG.version
registry.description = "Themeable React components, semantic tokens, layout patterns, presets, and package-owned agent skills. Default theme: Sable."
// Where and how to install comes from package.json, so the recipe agents read
// can never disagree with where the package is actually published.
registry.name = PKG.name
registry.consume.package = PKG.name
registry.consume.private = PKG.publishConfig.access !== "public"
registry.consume.registry = PKG.publishConfig.registry
registry.consume.auth = registry.consume.private ? "Authentication required by the registry." : "None: a public npm package."
delete registry.consume.npmrc
registry.consume.install = `pnpm add ${PKG.name}`
registry.consume.agentSetup = {
	command: "pnpm exec sable setup --agent",
	preview: "pnpm exec sable setup --agent --dry-run",
	monorepo: "When Sable belongs to one workspace package, run setup in that package with --root at the repository root: pnpm --filter <package> exec sable setup --agent --root <path to root>. Entries go to the root and resolve Sable through the package.",
	targets: { codex: ".agents/skills/sable", cursor: ".agents/skills/sable", claude: ".claude/skills/sable" },
	canonical: "skills/sable/SKILL.md in the installed package; entries resolve it on every task",
	upgrade: "pnpm update @sableui/react --latest; pnpm exec sable setup --agent --update",
	preserves: "Local edits, project instructions, presets and preferences; setup only refreshes unchanged managed entries and refuses linked destinations.",
}
registry.consume.designTheme = "Set data-sable-theme for alternate or app-owned themes; omit the attribute or use base for the default. Register portable presets with presetManifest() through SableThemeProvider customThemes, and load their scoped CSS and fonts."
registry.consume.ios = {
	when: "Only for an explicitly requested browser iOS prototype; match components by role with sable target ios --json.",
	install: "pnpm add konsta",
	entry: "@sableui/react/ios",
	css: '@import "tailwindcss"; then @import "@sableui/react/ios/styles.css"; in the isolated native document.',
	previewEntry: "@sableui/react/ios/preview",
	previewCss: "@sableui/react/ios/frame.css",
	guide: "sable docs building-an-ios-prototype",
	updates: "Consume the shipped adapter instead of copying demo helpers. Package upgrades update the brand bridge, material, safe areas, navigation, sheets and input bindings.",
}
registry.consume.cssOptional = {
	"themes.css": "@import \"@sableui/react/themes.css\"; — all bundled alternatives. styles.css already includes the Sable theme. Alternate CSS is scoped by data-sable-theme.",
	"theme/<id>.css": "@import \"@sableui/react/theme/prism.css\"; — one bundled alternative. Prefer this when the app uses exactly one.",
	symptom: "The active theme renders as the Sable theme when its stylesheet has not been imported. Load the selected theme CSS before applying its ID.",
}
registry.layoutPrimitives = layoutPrimitives
registry.patterns = patterns
registry.blocks = blocks
registry.components = components
registry.propSurface = {
	about:
		"Every prop each exported component accepts, read from its TypeScript type — including what it forwards to its Base UI root, which the component's own props table does not restate. React's DOM attributes are omitted. `sable grade` judges props against this. Generated from src/index.ts — do not hand-edit.",
	items: collectPropSurface(PKG_ROOT),
}
registry.tokens = documentedTokens
registry.utilities = {
	about:
		"The CSS layer between tokens and components: relative surfaces that derive hover and well fills from the surface they sit in, frames that compute concentric inner radii, state variants that match Base UI data attributes and ARIA alike, scroll policies, and chrome type tiers. Reach for these before hand-writing CSS or mixing colours. Generated from src/utilities/utility-docs.ts — do not hand-edit.",
	retrieve: "sable utility <name>",
	elsewhere: UTILITIES_ELSEWHERE,
	families: UTILITY_FAMILIES,
	items: utilitiesInFamilyOrder(),
}
registry.foundations = foundations.map((f) => ({
	slug: f.slug,
	title: f.title,
	summary: f.summary,
	headline: f.headline,
	retrieve: `sable docs ${f.slug}`,
	vocabularies: f.vocabularies,
	rules: f.rules,
	noGos: f.noGos,
}))
registry.themes = {
	default: "sable",
	available: themesAvailable,
	fontsNote:
		"fonts is the first family of each role's stack; fontStacks is the full stack the theme CSS declares. The host app loads the files (Google Fonts for every built-in primary). Generated from src/themes/*/index.ts — do not hand-edit.",
}
registry.enforcement = { ...registry.enforcement, rules: enforcementRules }
registry.consume.designWorkflow = {
	brief: "sable docs designing-a-surface",
	taste: "sable docs developing-taste",
	skill: "sable setup --agent; build, inspire, audit, polish; package-owned skills/sable/SKILL.md",
	presets: "sable docs using-presets; sable preset --check <path> --json; sable preset --css <path>",
	assets: "sable docs creating-design-assets",
	journey: "sable docs reviewing-a-journey",
	motionReview: "sable docs reviewing-motion",
	visualAtlas: "Optional, project-owned (.sable/atlas/atlas.json); the package ships none. sable atlas --search \"<context>\" --contrast --limit 3 --json; then --show <id> and view the returned evidence paths",
	exploration: "Optional when alternatives materially affect the brief: sable explore --template; build bounded rendered directions; --check <manifest.json>; --compare <manifest.json>",
	preferences: "sable prefer --search \"<decision>\" --scope project:<id> --json; human choices and agent observations remain distinct",
	precedents: "sable learn --search \"<context>\" --json",
	composition: "Inspect a relevant pattern skeleton. Reuse when its information architecture fits; original compositions from layout primitives are equally valid.",
	review: "sable docs reviewing-a-design",
	evidenceTemplate: "sable grade --template",
	learning: "sable docs learning-from-builds",
	localMemory: ".sable/lessons/ for causal observations; .sable/preferences/ for scoped judgments; both project-owned and preserved across package upgrades",
	qualityLimit: "Source checks and evidence completeness do not independently judge visual quality. Inspect rendered desktop/mobile states and real interactions.",
}

/**
 * The metas are IMPORTED, not read as text, so normalising reads does not reach
 * their string literals: a multi-line `examples[].code` template in a meta
 * carries whatever newline the file was authored with, and on Windows that is
 * CRLF. Those CRs then land inside JSON strings as `\r\n`. So the object gets
 * normalised on the way out too — same reason as `readFileSync` above, other end
 * of the pipe.
 */
function normalizeNewlines(value) {
	if (typeof value === "string") return value.replace(/\r\n/g, "\n")
	if (Array.isArray(value)) return value.map(normalizeNewlines)
	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([k, v]) => [k, normalizeNewlines(v)]),
		)
	}
	return value
}

// `blocks` sits beside `patterns`, not at the end where a new key would land.
const orderedRegistry = {}
for (const [key, value] of Object.entries(registry)) {
	if (key === "blocks") continue
	orderedRegistry[key] = value
	if (key === "patterns") orderedRegistry.blocks = registry.blocks
}
const output = `${JSON.stringify(normalizeNewlines(orderedRegistry), null, 2)}\n`

/* ── llms.txt: regenerate the marker-delimited catalog section so the index of
 * components / layout primitives / patterns can never drift from the metas. ── */
const LLMS_PATH = join(PKG_ROOT, "llms.txt")
const LLMS_START = "<!-- generated:catalog:start (build-registry.mjs — do not hand-edit) -->"
const LLMS_END = "<!-- generated:catalog:end -->"

function firstSentence(s) {
	const m = s.match(/^.*?[.!?](?=\s|$)/)
	return (m ? m[0] : s).trim()
}

/**
 * Token intent, in llms.txt.
 *
 * The catalog told an agent which tokens exist; it never said which to reach for.
 * `accent`, `secondary` and `muted` are near-identical surfaces separated only by
 * role, and that distinction lived nowhere machine-readable. `insteadOf` is the
 * field that does the work, so it is rendered as its own line.
 */
function llmsTokenIntent() {
	const lines = [
		"## Token intent",
		"",
		"Which token to reach for, and what it is most often confused with. Generated from `src/themes/token-docs.ts`; the full data is `registry.json → tokens`.",
		"",
	]
	for (const [family, list] of Object.entries(documentedTokens)) {
		if (!Array.isArray(list)) continue
		lines.push(`### ${family} (${list.length})`, "")
		for (const t of list) {
			if (!t.intent) continue
			lines.push(`- **\`${t.name}\`** — ${t.intent} *Use for:* ${t.whenToUse}`)
			if (t.insteadOf) lines.push(`    - **Not** ${t.insteadOf}`)
		}
		lines.push("")
	}
	return lines.join("\n").trimEnd()
}

function utilitiesInFamilyOrder() {
	return UTILITY_FAMILIES.flatMap((family) => UTILITY_DOCS.filter((u) => u.family === family))
}

/** The utility layer as a reference mirror — llms/reference/utilities.md. */
function llmsUtilities() {
	const lines = [
		"## Utilities",
		"",
		"The `@utility` and `@custom-variant` layer in `styles.css`: what each one is, when to reach for it, and what you would hand-write without it. Generated from `src/utilities/utility-docs.ts`; the full data is `registry.json → utilities`; one entry at a time with `sable utility <name>`.",
		"",
		`- **Typography:** ${UTILITIES_ELSEWHERE.typography}`,
		`- **Motion:** ${UTILITIES_ELSEWHERE.motion}`,
		"",
	]
	for (const family of UTILITY_FAMILIES) {
		const list = UTILITY_DOCS.filter((u) => u.family === family)
		if (!list.length) continue
		lines.push(`### ${family} (${list.length})`, "")
		for (const u of list) {
			const label = u.kind === "variant" ? `${u.name}:` : u.name
			lines.push(`- **\`${label}\`** — ${u.intent} *Use for:* ${u.whenToUse}`)
			lines.push(`    - **Instead of** ${u.insteadOf}`)
			lines.push(`    - \`${u.example}\``)
		}
		lines.push("")
	}
	return lines.join("\n").trimEnd()
}

function llmsCatalog() {
	const lines = ["## Catalog", ""]
	lines.push(
		`### Foundations (${foundations.length}) — the rules for type, space, shape, surfaces, motion, scrolling and accessibility (registry.json → foundations; \`sable docs <slug>\`)`,
		"",
	)
	for (const f of foundations) {
		lines.push(`- **${f.title}** — ${f.headline}. ${firstSentence(f.summary)} → [\`llms/foundations/${f.slug}.md\`](./llms/foundations/${f.slug}.md)`)
	}
	lines.push("")
	lines.push(
		`### Patterns (${patternItems.length}) — canonical page shells, copy as route starting points (registry.json → patterns; importable from \`@sableui/react/patterns\`)`,
		"",
	)
	for (const p of patternItems) {
		const slug = patternSlug(p)
		lines.push(
			`- **${p.name}** — ${firstSentence(p.summary)} → [\`llms/patterns/${slug}.md\`](./llms/patterns/${slug}.md)`,
		)
	}
	lines.push(
		"",
		`### Blocks (${blockItems.length}) — section-sized compositions (cards, forms, lists), copy as starting points (registry.json → blocks; importable from \`@sableui/react/blocks\`; \`sable block <Name>\`)`,
		"",
	)
	for (const b of blockItems) {
		const slug = blockSlug(b)
		lines.push(
			`- **${b.name}** (${b.family}) — ${firstSentence(b.summary)} → [\`llms/blocks/${slug}.md\`](./llms/blocks/${slug}.md)`,
		)
	}
	lines.push(
		"",
		`### Layout primitives (${layoutPrimitives.primitives.length}) — full contracts in registry.json → layoutPrimitives`,
		"",
	)
	for (const m of layoutPrimitives.primitives) {
		const slug = layoutSlug(m)
		lines.push(
			`- **${m.name}** — ${firstSentence(m.summary)} → [\`llms/layout/${slug}.md\`](./llms/layout/${slug}.md)`,
		)
	}
	lines.push(
		"",
		`### Utilities (${UTILITY_DOCS.length}) — relative surfaces, frames, state variants, scroll policies, chrome type; reach for these before hand-written CSS (registry.json → utilities; \`sable utility <name>\`) → [\`llms/reference/utilities.md\`](./llms/reference/utilities.md)`,
		"",
	)
	for (const family of UTILITY_FAMILIES) {
		const names = UTILITY_DOCS.filter((u) => u.family === family).map((u) => `\`${u.kind === "variant" ? `${u.name}:` : u.name}\``)
		if (names.length) lines.push(`- **${family}** — ${names.join(", ")}`)
	}
	lines.push(`- **elsewhere** — paired \`text-*\` page tiers: registry.json → tokens.typography; \`motion-*\` / \`animate-*\` recipes: registry.json → tokens.motion.recipes.`)
	lines.push(
		"",
		`### Components (${components.length}) — full props/subcomponents/variants/guidance/a11y/examples in registry.json → components`,
		"",
	)
	for (const c of components) {
		const slug = componentSlug(c)
		// Status is worth a marker only when it is not `stable`. A deprecation
		// buried in prose is a deprecation an agent will read straight past, so it
		// leads the line and names the replacement.
		const flag =
			c.status === "deprecated"
				? `**DEPRECATED — use ${c.supersededBy} instead.** `
				: c.status === "stable"
					? ""
					: `**${c.status.toUpperCase()}.** `
		// Parts are named here, not only in the mirror, because an agent's first
		// move is to grep this file — and something absent from it reads as
		// something that does not exist. `SimpleTooltip` is fully documented in
		// tooltip.md and was concluded missing for exactly that reason. 137 names
		// cost ~2KB and make every exported part findable at the routing layer.
		const parts = (c.subcomponents ?? []).map((s) => s.name).filter(Boolean)
		const partsSuffix = parts.length ? ` *Parts:* ${parts.join(", ")}.` : ""
		lines.push(
			`- **${c.name}** — ${flag}${firstSentence(c.summary)}${partsSuffix} → [\`llms/components/${slug}.md\`](./llms/components/${slug}.md)`,
		)
	}
	return lines.join("\n")
}

function updateLlms(txt) {
	const block = `${LLMS_START}\n${llmsCatalog()}\n${LLMS_END}`
	if (txt.includes(LLMS_START) && txt.includes(LLMS_END)) {
		const start = txt.indexOf(LLMS_START)
		const end = txt.indexOf(LLMS_END) + LLMS_END.length
		return txt.slice(0, start) + block + txt.slice(end)
	}
	return `${txt.trimEnd()}\n\n${block}\n`
}

const llmsCurrent = readFileSync(LLMS_PATH, "utf8")
// The intro blurb is hand-authored and states a component count, which had drifted
// to "92 components" against an actual 100. Rewrite the number rather than trust a
// prose claim about generated data — a stale count is the first thing an agent reads.
// Same for the per-theme font line: it listed five themes after seven shipped.
const llmsThemeFonts = themesAvailable
	.filter(({ featured }) => featured)
	.map(({ id, fonts }) => `${id}: ${[fonts.sans, fonts.mono].join(" + ")}${fonts.display ? ` + ${fonts.display} (display)` : ""}`)
	.join(" · ")
const llmsOutput = updateLlms(
	llmsCurrent
		.replace(/\b\d+ components,/, `${components.length} components,`)
		.replace(/Per theme — [^\n]*?\. The machine-readable/, `Per theme — ${llmsThemeFonts}. The machine-readable`),
)

/* ── llms/<kind>/<slug>.md mirrors + llms-full.txt: the flattened single-file
 * dump. Header = everything above the generated catalog marker (the hand-authored
 * "For AI agents" / "How it works" / "Motion" / "Docs" / "Consuming" sections);
 * body = every mirror, in the same patterns → layout → components order the
 * catalog uses, divided by a clear rule. ───────────────────────────────────── */
const LLMS_DIR = join(PKG_ROOT, "llms")
const LLMS_FULL_PATH = join(PKG_ROOT, "llms-full.txt")
const DIVIDER = "\n\n---\n\n"

const llmsHeader = llmsOutput.slice(0, llmsOutput.indexOf(LLMS_START)).trimEnd()
const authoredDocs = ["tasks", "taste"].flatMap((kind) =>
	readdirSync(join(LLMS_DIR, kind)).filter((file) => file.endsWith(".md")).sort()
		.map((file) => readFileSync(join(LLMS_DIR, kind, file), "utf8").trim()),
)
const llmsFullOutput =
	[llmsHeader, ...authoredDocs, ...mirrors.map((m) => m.content.trim())].join(DIVIDER) + "\n"

function listFilesRecursive(dir) {
	const out = []
	let entries
	try {
		entries = readdirSync(dir, { withFileTypes: true })
	} catch {
		return out
	}
	for (const e of entries) {
		const full = join(dir, e.name)
		if (e.isDirectory()) out.push(...listFilesRecursive(full))
		else out.push(full)
	}
	return out
}

if (check) {
	if (llmsCurrent !== llmsOutput) {
		console.error(
			"[build-registry] ✗ llms.txt catalog section is OUT OF SYNC. Run `node scripts/build-registry.mjs` and commit the result.",
		)
		process.exit(1)
	}
	const current = readFileSync(REGISTRY_PATH, "utf8")
	if (current !== output) {
		console.error(
			`[build-registry] ✗ registry.json is OUT OF SYNC with the component metas / package version.\n` +
				"    Run `node scripts/build-registry.mjs` and commit the result.",
		)
		process.exit(1)
	}

	const expected = new Map(
		mirrors.map((m) => [join(LLMS_DIR, m.kind, `${m.slug}.md`), m.content]),
	)
	const mismatches = []
	for (const [path, content] of expected) {
		if (!existsSync(path)) mismatches.push(`missing: ${path.slice(PKG_ROOT.length + 1)}`)
		else if (readFileSync(path, "utf8") !== content)
			mismatches.push(`out of sync: ${path.slice(PKG_ROOT.length + 1)}`)
	}
	// `llms/tasks/` is hand-authored prose, verified separately (existence + link
	// resolution) rather than regenerated, so it is not "stray".
	const HAND_AUTHORED = ["tasks", "taste", "atlas"].map((kind) => join(LLMS_DIR, kind))
	for (const f of listFilesRecursive(LLMS_DIR)) {
		if (HAND_AUTHORED.some((dir) => f.startsWith(`${dir}/`) || f.startsWith(`${dir}\\`))) continue
		if (!expected.has(f)) mismatches.push(`stray file: ${f.slice(PKG_ROOT.length + 1)}`)
	}
	if (mismatches.length) {
		console.error(
			`[build-registry] ✗ llms/ markdown mirrors are OUT OF SYNC (${mismatches.length}):\n` +
				mismatches.map((m) => `    - ${m}`).join("\n") +
				"\n    Run `node scripts/build-registry.mjs` and commit the result.",
		)
		process.exit(1)
	}

	let llmsFullCurrent = ""
	try {
		llmsFullCurrent = readFileSync(LLMS_FULL_PATH, "utf8")
	} catch {
		/* missing — treated as out of sync below */
	}
	if (llmsFullCurrent !== llmsFullOutput) {
		console.error(
			"[build-registry] ✗ llms-full.txt is OUT OF SYNC. Run `node scripts/build-registry.mjs` and commit the result.",
		)
		process.exit(1)
	}

	console.log(
		`[build-registry] ✓ registry.json + llms/ (${mirrors.length} mirrors) + llms-full.txt in sync (${components.length} components).`,
	)
} else {
	writeFileSync(REGISTRY_PATH, output)
	writeFileSync(LLMS_PATH, llmsOutput)

	// Wipe only the GENERATED kinds. `llms/tasks/` is hand-authored prose — the
	// task-shaped entry points that route an agent to the right artifacts — and a
	// blanket rmSync would silently delete it on the next build.
	for (const kind of new Set(mirrors.map((m) => m.kind))) {
		rmSync(join(LLMS_DIR, kind), { recursive: true, force: true })
	}
	for (const m of mirrors) {
		const dir = join(LLMS_DIR, m.kind)
		mkdirSync(dir, { recursive: true })
		writeFileSync(join(dir, `${m.slug}.md`), m.content)
	}
	writeFileSync(LLMS_FULL_PATH, llmsFullOutput)

	console.log(
		`[build-registry] ✓ wrote registry.json (${components.length} components, ${layoutPrimitives.primitives.length} layout primitives, ${patternItems.length} patterns, ${blockItems.length} blocks) + llms.txt catalog + llms/ (${mirrors.length} mirrors) + llms-full.txt.`,
	)
}
