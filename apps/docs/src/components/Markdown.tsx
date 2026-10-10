import { CodeBlock, cn } from "@sableui/react"
import { type ReactNode, useMemo } from "react"

/**
 * A small Markdown renderer for the guides.
 *
 * Deliberately not a Markdown library. The input is not arbitrary Markdown —
 * it is nine files we write and CI regenerates, using headings, paragraphs,
 * lists, tables, fenced code, blockquotes, and four inline forms. A parser for
 * exactly that is ~200 lines, ships nothing, and cannot render something the
 * source does not contain. A general library would add a dependency, a
 * sanitiser decision, and a second styling system to reconcile with Sable's
 * type tiers.
 *
 * The two things it does that a library would not do for free:
 *
 * 1. Code fences render through Sable's own `CodeBlock`, so every sample in
 *    every guide gets a copy button without the guides knowing about it.
 * 2. Links to sibling `.md` files are rewritten to docs routes. The sources
 *    cross-reference each other by filename (`[building-a-tool.md](./…)`)
 *    because they were written to be read on disk; left alone, every one of
 *    those would 404 on the site.
 */

/* ── Inline ──────────────────────────────────────────────────────────────── */

/** `**bold**`, `` `code` ``, `[text](href)`, `_em_` — in one pass, in order. */
const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))|(\*[^*\s][^*]*\*)/g

function resolveHref(href: string): { href: string; internal: boolean } {
	if (href.startsWith("#")) return { href, internal: true }
	return { href, internal: href.startsWith("/") }
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
	const out: ReactNode[] = []
	let last = 0
	let index = 0

	for (const match of text.matchAll(INLINE)) {
		const start = match.index ?? 0
		if (start > last) out.push(text.slice(last, start))
		const token = match[0]
		const key = `${keyPrefix}-${index++}`

		if (token.startsWith("`")) {
			out.push(
				<code
					key={key}
					className="text-mono-sm rounded bg-muted px-1.5 py-0.5 text-foreground"
				>
					{token.slice(1, -1)}
				</code>,
			)
		} else if (token.startsWith("**")) {
			// Recurse: the sources routinely bold a sentence that contains inline
			// code ("**Every `Pill` was a 7.5px sliver**"), and rendering the inner
			// text flat printed the backticks.
			out.push(
				<strong key={key} className="text-foreground">
					{renderInline(token.slice(2, -2), `${key}b`)}
				</strong>,
			)
		} else if (token.startsWith("[")) {
			const split = token.indexOf("](")
			const raw = token.slice(1, split)
			const { href, internal } = resolveHref(token.slice(split + 2, -1))
			const label = raw
			out.push(
				<a
					key={key}
					href={href}
					{...(internal
						? {}
						: { target: "_blank", rel: "noreferrer noopener" })}
					className="text-foreground underline underline-offset-2 motion-interactive hover:text-muted-foreground"
				>
					{label}
				</a>,
			)
		} else {
			out.push(
				<em key={key}>{renderInline(token.slice(1, -1), `${key}e`)}</em>,
			)
		}
		last = start + token.length
	}

	if (last < text.length) out.push(text.slice(last))
	return out
}

/* ── Blocks ──────────────────────────────────────────────────────────────── */

type Block =
	| { kind: "heading"; level: number; text: string; id: string }
	| { kind: "paragraph"; text: string }
	| { kind: "list"; ordered: boolean; items: { text: string; depth: number }[] }
	| { kind: "code"; code: string; lang?: string }
	| { kind: "table"; head: string[]; rows: string[][] }
	| { kind: "quote"; text: string }

export function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.replace(/`/g, "")
		.replace(/[^\w\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
}

function splitRow(line: string): string[] {
	return line
		.replace(/^\||\|$/g, "")
		.split("|")
		.map((cell) => cell.trim())
}

export function parseMarkdown(source: string): Block[] {
	const lines = source.replace(/\r\n/g, "\n").split("\n")
	const blocks: Block[] = []
	let i = 0

	while (i < lines.length) {
		const line = lines[i]

		if (!line.trim()) {
			i++
			continue
		}

		// Fenced code. Everything until the closing fence is verbatim — no inline
		// parsing, or a `**` in a code sample becomes bold.
		if (line.startsWith("```")) {
			const lang = line.slice(3).trim() || undefined
			const body: string[] = []
			i++
			while (i < lines.length && !lines[i].startsWith("```")) {
				body.push(lines[i])
				i++
			}
			i++ // closing fence
			blocks.push({ kind: "code", code: body.join("\n"), lang })
			continue
		}

		const heading = line.match(/^(#{1,6})\s+(.*)$/)
		if (heading) {
			const text = heading[2].trim()
			blocks.push({
				kind: "heading",
				level: heading[1].length,
				text,
				id: slugifyHeading(text),
			})
			i++
			continue
		}

		// Table: a header row followed by the |---|---| separator.
		if (line.trim().startsWith("|") && lines[i + 1]?.includes("--")) {
			const head = splitRow(line)
			i += 2
			const rows: string[][] = []
			while (i < lines.length && lines[i].trim().startsWith("|")) {
				rows.push(splitRow(lines[i]))
				i++
			}
			blocks.push({ kind: "table", head, rows })
			continue
		}

		if (line.startsWith("> ")) {
			const body: string[] = []
			while (i < lines.length && lines[i].startsWith("> ")) {
				body.push(lines[i].slice(2))
				i++
			}
			blocks.push({ kind: "quote", text: body.join(" ") })
			continue
		}

		const bullet = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/)
		if (bullet) {
			const ordered = /\d/.test(bullet[2])
			const baseIndent = bullet[1].length
			const items: { text: string; depth: number }[] = []
			while (i < lines.length) {
				const next = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/)
				if (next) {
					// Indentation carries meaning here: token-intent.md nests each
					// token's "Not …" contrast under the token it belongs to, and
					// flattening it puts the correction on the same footing as the
					// definition it is correcting.
					const indent = next[1].replace(/\t/g, "    ").length - baseIndent
					items.push({ text: next[3], depth: Math.min(Math.max(indent, 0) / 4, 3) | 0 })
					i++
					continue
				}
				// A wrapped continuation line belongs to the item above it. The
				// sources hard-wrap at ~80 columns, so nearly every list item has one.
				if (lines[i].trim() && lines[i].startsWith("  ") && items.length) {
					items[items.length - 1].text += ` ${lines[i].trim()}`
					i++
					continue
				}
				break
			}
			blocks.push({ kind: "list", ordered, items })
			continue
		}

		// Paragraph: run to the next blank line, joining the hard wraps.
		const body: string[] = []
		while (
			i < lines.length &&
			lines[i].trim() &&
			!lines[i].startsWith("```") &&
			!/^#{1,6}\s/.test(lines[i]) &&
			!lines[i].trim().startsWith("|") &&
			!lines[i].startsWith("> ") &&
			!/^(\s*)([-*]|\d+\.)\s+/.test(lines[i])
		) {
			body.push(lines[i].trim())
			i++
		}
		if (body.length) blocks.push({ kind: "paragraph", text: body.join(" ") })
		else i++
	}

	return blocks
}

const HEADING_CLASS: Record<number, string> = {
	1: "text-heading-1",
	2: "text-heading-2",
	3: "text-heading-3",
	4: "text-title-md",
	5: "text-title-sm",
	6: "text-title-sm",
}

function Block({ block, index }: { block: Block; index: number }) {
	switch (block.kind) {
		case "heading": {
			const Tag = `h${Math.min(block.level, 6)}` as "h2"
			return (
				<Tag
					id={block.id}
					className={cn(
						HEADING_CLASS[block.level],
						// The scroll offset clears the sticky top bar, so an anchored
						// heading does not land underneath it.
						"scroll-mt-24",
						block.level === 1 ? "mb-4" : "mt-12 mb-3 first:mt-0",
					)}
				>
					{renderInline(block.text, `h${index}`)}
				</Tag>
			)
		}
		case "paragraph":
			return (
				<p className="text-body-md text-muted-foreground mt-4 max-w-(--measure-prose)">
					{renderInline(block.text, `p${index}`)}
				</p>
			)
		case "list": {
			const Tag = block.ordered ? "ol" : "ul"
			return (
				<Tag
					className={cn(
						"text-body-md text-muted-foreground mt-4 grid gap-2 max-w-(--measure-prose) pl-5",
						block.ordered ? "list-decimal" : "list-disc",
					)}
				>
					{block.items.map((item, itemIndex) => (
						<li
							// Items have no identity of their own; the list is static once
							// parsed, so position is a stable key.
							// biome-ignore lint/suspicious/noArrayIndexKey: static parsed content
							key={itemIndex}
							className={cn(
								// `border` is the HAIRLINE token — deliberately near-invisible
								// against its own surface, which is correct for a 1px rule and
								// wrong for a glyph. As a marker colour it made every numbered
								// step in every guide unreadable in every theme. Markers are
								// text: they get a text token.
								"pl-1 marker:text-muted-foreground",
								item.depth === 1 && "ml-5",
								item.depth >= 2 && "ml-10",
							)}
						>
							{renderInline(item.text, `li${index}-${itemIndex}`)}
						</li>
					))}
				</Tag>
			)
		}
		case "code":
			return (
				<div className="mt-5">
					<CodeBlock code={block.code} filename={block.lang} />
				</div>
			)
		case "quote":
			return (
				<blockquote className="text-body-md text-muted-foreground mt-5 max-w-(--measure-prose) border-l-2 border-highlight pl-4">
					{renderInline(block.text, `q${index}`)}
				</blockquote>
			)
		case "table":
			return (
				<div className="mt-5 overflow-x-auto scrollbar-quiet rounded-lg border border-border">
					<table className="w-full text-left">
						<thead>
							<tr className="border-b border-border bg-muted/40">
								{block.head.map((cell) => (
									<th
										key={cell}
										className="text-label-md text-muted-foreground p-3"
									>
										{renderInline(cell, `th${index}`)}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{block.rows.map((row, rowIndex) => (
								<tr
									// biome-ignore lint/suspicious/noArrayIndexKey: static parsed content
									key={rowIndex}
									className="border-b border-border align-top last:border-0"
								>
									{row.map((cell, cellIndex) => (
										<td
											// biome-ignore lint/suspicious/noArrayIndexKey: static parsed content
											key={cellIndex}
											className="text-body-sm text-muted-foreground p-3"
										>
											{renderInline(cell, `td${index}-${rowIndex}-${cellIndex}`)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)
	}
}

export interface HeadingEntry {
	id: string
	text: string
	level: number
}

/** The h2s of a document, for an on-page table of contents. */
export function outline(source: string): HeadingEntry[] {
	return parseMarkdown(source)
		.filter(
			(block): block is Extract<Block, { kind: "heading" }> =>
				block.kind === "heading" && block.level === 2,
		)
		.map((block) => ({ id: block.id, text: block.text, level: block.level }))
}

export function Markdown({
	source,
	/** Drop the document's own h1 — the page already renders a title. */
	skipTitle = false,
}: {
	source: string
	skipTitle?: boolean
}) {
	const blocks = useMemo(() => {
		const parsed = parseMarkdown(source)
		// Drop the document's own title heading whatever LEVEL it is — the page
		// header above already carries it. Keying on `h1` was not enough:
		// token-intent.md is generated as a fragment and opens on `## Token
		// intent`, so the page rendered its title twice.
		if (skipTitle && parsed[0]?.kind === "heading") return parsed.slice(1)
		return parsed
	}, [source, skipTitle])

	return (
		<div>
			{blocks.map((block, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static parsed content
				<Block key={index} block={block} index={index} />
			))}
		</div>
	)
}

/**
 * Jump to a heading. Deliberately does NOT touch the hash: the whole router is
 * hash-based, so writing a fragment would be read as a route change and
 * navigate away from the page the reader is on.
 */
export function scrollToHeading(id: string): void {
	document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}
