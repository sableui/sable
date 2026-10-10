/**
 * skeleton — reduce a pattern's source to its composition tree.
 *
 * Why this exists: the patterns tier answers "how does a page compose", but it
 * answers it inside 130 lines of realistic demo source — fixture arrays, copy,
 * per-cell formatting. An agent picking a starting point has to read all of it
 * to see the four decisions that actually matter (which shell, which region cap,
 * which grid, what nests where), and a 782KB registry means it often reads the
 * pattern it already guessed instead of comparing all eight.
 *
 * A skeleton is the same tree with the content removed: elements, the props that
 * carry layout meaning, and nesting. DashboardPage goes from 127 lines to ~25.
 * Cheap enough to print all eight and choose, which is the point — composition
 * is the decision that has to be right before any component is picked.
 *
 * This is lexical, not a parser. It leans on the fact that pattern source is
 * ours and is formatted by Biome: one element per line, tabs for depth, so the
 * indentation already IS the tree. That trade buys zero dependencies in a file
 * that ships to consumers. It is exact for the patterns in this package (a test
 * pins every one of them) and makes no claim about arbitrary JSX.
 */

/**
 * Props that survive. These are the ones that change the SHAPE of the page —
 * caps, spans, rhythm, direction, emphasis tier. Everything else (`label`,
 * `icon`, `href`, `placeholder`, event handlers) describes content, and content
 * is the thing the reader is trying to see past.
 */
const STRUCTURAL = new Set([
	"align",
	"as",
	"aside",
	"bleed",
	"className",
	"cols",
	"count",
	"density",
	"direction",
	"fill",
	"footer",
	"gap",
	"header",
	"inset",
	"justify",
	"level",
	"max",
	"minItemWidth",
	"orientation",
	"ratio",
	"register",
	"safeArea",
	"side",
	"sidebar",
	"size",
	"span",
	"start",
	"sticky",
	"tone",
	"variant",
	"wrap",
])

/** Props whose value is a nested subtree — rendered as a branch label, not a prop. */
const SLOT_HINT = /^([a-zA-Z][a-zA-Z0-9]*)=\{\(?$/
/** A whole attribute on one line: `max="form"`, `gap={3}`, `cols={{ base: 1 }}`. */
const SIMPLE_ATTR = /^([a-zA-Z][a-zA-Z0-9]*)=(?:"([^"]*)"|\{(.*)\})$/
const OPEN_TAG = /^<([A-Za-z][\w.]*)/

/**
 * Pull the structural props out of a tag's attribute text.
 *
 * Hand-rolled rather than a regex because prop values nest braces —
 * `cols={{ base: 1, sm: 2 }}` — and the obvious `\{([^}]*)\}` truncates at the
 * first `}`, which silently turns a responsive breakpoint map (the single most
 * important thing a Grid line has to say) into a malformed fragment.
 */
function structuralProps(text) {
	const kept = []
	let i = 0
	while (i < text.length) {
		const rest = text.slice(i)
		const m = rest.match(/^\s*([a-zA-Z][a-zA-Z0-9]*)/)
		if (!m) {
			i += 1
			continue
		}
		const key = m[1]
		i += m[0].length
		if (text[i] !== "=") {
			if (STRUCTURAL.has(key)) kept.push(key) // boolean shorthand
			continue
		}
		i += 1
		let value
		if (text[i] === '"') {
			const end = text.indexOf('"', i + 1)
			value = text.slice(i + 1, end === -1 ? text.length : end)
			i = end === -1 ? text.length : end + 1
			if (STRUCTURAL.has(key)) kept.push(`${key}="${value}"`)
		} else if (text[i] === "{") {
			let depth = 0
			const from = i
			for (; i < text.length; i++) {
				if (text[i] === "{") depth++
				else if (text[i] === "}" && --depth === 0) {
					i++
					break
				}
			}
			value = text.slice(from + 1, i - 1)
			// A JSX value (`header={<AppHeader … />}`) is a slot, not a prop: the
			// element is composition, and printing it inline dumps its whole
			// subtree onto the parent's line. Multi-line slots become branches in
			// skeletonize(); a one-line JSX prop on a one-line tag is just dropped.
			if (STRUCTURAL.has(key) && !value.trimStart().startsWith("<")) kept.push(`${key}={${value}}`)
		}
	}
	return kept
}

/** `<Grid cols={…} gap={3}` → `{ name, props }`, ignoring content-carrying props. */
function readTag(trimmed) {
	const name = trimmed.match(OPEN_TAG)[1]
	// Cut at the `>` that ends the OPEN tag, tracking quotes and braces. Trimming
	// a trailing `>` instead is wrong for the very common one-line element
	// `<span className="x">text</span>`, where the leftover `</span` scans as a
	// bare attribute and every such line prints a phantom `span` prop.
	const rest = trimmed.slice(1 + name.length)
	let end = rest.length
	let depth = 0
	let quote = null
	for (let i = 0; i < rest.length; i++) {
		const c = rest[i]
		if (quote) {
			if (c === quote) quote = null
		} else if (c === '"' || c === "'") quote = c
		else if (c === "{") depth++
		else if (c === "}") depth--
		else if (c === ">" && depth === 0) {
			end = rest[i - 1] === "/" ? i - 1 : i
			break
		}
	}
	return { name, props: structuralProps(rest.slice(0, end)) }
}

/**
 * @param {string} code A pattern's `code` string from registry.json.
 * @returns {{ tree: string, elided: number }} `tree` is the skeleton; `elided`
 *   counts module-scope fixture bindings dropped ahead of the component.
 */
export function skeletonize(code) {
	const lines = code.split("\n")

	// Drop module scope. Patterns declare their demo data above the component;
	// none of it is composition.
	const start = lines.findIndex((l) => /^(export )?function [A-Z]/.test(l))
	const head = start === -1 ? [] : lines.slice(0, start)
	const elided = head.filter((l) => /^const [A-Za-z]/.test(l)).length
	const body = start === -1 ? lines : lines.slice(start)

	const out = []
	let baseIndent = null
	// A tag whose props Biome broke across lines is still one element. Track it
	// so those lines land back on the tag instead of appearing to be its children
	// — `density="compact"` indented under `<Entity>` reads as a child element,
	// which is the one thing a composition tree must never get wrong.
	let open = null

	for (const line of body) {
		const indent = line.match(/^\t*/)[0].length
		const t = line.trim()
		if (!t) continue

		if (open) {
			if (/^\/?>$/.test(t)) {
				open = null
				continue
			}
			const attr = t.match(SIMPLE_ATTR)
			if (attr && indent > open.indent && attr[3] !== undefined && attr[3].trimStart().startsWith("<")) {
				// `header={<AppHeader title={…} />}` on its own line: the same branch
				// shape as a multi-line slot — a label, then the element beneath it.
				if (baseIndent === null) baseIndent = open.indent
				const depth = Math.max(0, indent - baseIndent)
				const inner = attr[3].trim()
				if (OPEN_TAG.test(inner)) {
					const { name, props } = readTag(inner)
					out.push({ depth, text: `${attr[1]}:` }, { depth: depth + 1, text: null, name, props })
				}
				continue
			}
			if (attr && indent > open.indent) {
				if (STRUCTURAL.has(attr[1])) {
					open.node.props.push(
						attr[2] !== undefined ? `${attr[1]}="${attr[2]}"` : `${attr[1]}={${attr[3]}}`,
					)
				}
				continue
			}
			if (indent <= open.indent) open = null
		}

		let node = null
		if (OPEN_TAG.test(t)) {
			const { name, props } = readTag(t)
			node = { text: null, name, props }
			// No terminator on this line → its remaining props are still coming.
			if (!/\/?>$/.test(t)) open = { indent, node }
		} else if (/^\{[^}]*\.map\(/.test(t)) {
			// `{items.map((item) => (` — one element repeated. The reader needs to
			// know a repeat happens here; the iteration variable is noise.
			node = { text: "{…repeat}" }
		} else {
			const slot = t.match(SLOT_HINT)
			if (slot) node = { text: `${slot[1]}:` }
		}
		if (node === null) continue

		if (baseIndent === null) baseIndent = indent
		out.push({ depth: Math.max(0, indent - baseIndent), ...node })
	}

	// Everything prints self-closing: depth comes from indentation, so a closing
	// tag would be a second line saying what the first line already said.
	for (const n of out) {
		if (n.text === null) n.text = `<${n.name}${n.props.length ? ` ${n.props.join(" ")}` : ""} />`
	}

	// Collapse runs of identical siblings. Five <SidebarItem /> lines say exactly
	// as much as one line saying there are five, and the difference is the whole
	// nav fitting on screen next to the rest of the page.
	const collapsed = []
	for (const node of out) {
		const prev = collapsed[collapsed.length - 1]
		if (prev && prev.depth === node.depth && prev.text === node.text) {
			prev.count = (prev.count ?? 1) + 1
			continue
		}
		collapsed.push({ ...node })
	}

	const tree = collapsed
		.map((n) => `${"  ".repeat(n.depth)}${n.text}${n.count ? `  ×${n.count}` : ""}`)
		.join("\n")

	return { tree, elided }
}
