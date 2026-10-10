import { type ComponentPropsWithRef, type ReactNode, createContext, useContext } from "react"
import { Icon } from "../../icon"
import { useCopy } from "../../lib/use-copy"
import { Button } from "../button/button"
import { cn } from "../../lib/cn"

/**
 * Turns source text into highlighted output. Sable ships no highlighter — the
 * package stays dependency-free — so an app supplies one (sugar-high, Shiki,
 * Prism…), either per block via `highlight` or once for every block via
 * `<CodeHighlightProvider>`. Return React nodes; the copy button always copies
 * the original `code`, never the rendered markup.
 */
export type CodeHighlighter = (code: string) => ReactNode

const CodeHighlightContext = createContext<CodeHighlighter | null>(null)

/** Supplies a highlighter to every CodeBlock beneath it. */
export function CodeHighlightProvider({ highlight, children }: { highlight: CodeHighlighter; children: ReactNode }) {
	return <CodeHighlightContext.Provider value={highlight}>{children}</CodeHighlightContext.Provider>
}

export interface CodeBlockProps extends ComponentPropsWithRef<"div"> {
	/** The code to display. */
	code: string
	/** Optional filename shown in the header bar. */
	filename?: string
	/** Show the copy affordance. Defaults to true. */
	showCopy?: boolean
	/**
	 * Highlighter for this block. Overrides `<CodeHighlightProvider>`; pass
	 * `false` to render plain text even inside a provider.
	 */
	highlight?: CodeHighlighter | false
	/**
	 * A shell prompt ("$", ">"…). Makes this a one-line command: the prompt is
	 * dimmed and unselectable, the line truncates, and copy takes only `code`.
	 * What Snippet was.
	 */
	prompt?: string
}

/**
 * A multi-line code block. An optional header bar carries the filename and a
 * copy affordance; the body is a horizontally scrollable monospace pre.
 * Highlighting is opt-in through `highlight` or `CodeHighlightProvider`.
 * Soft-square (rounded-md), never a pill.
 */
export function CodeBlock({
	code,
	filename,
	showCopy = true,
	highlight,
	prompt,
	className,
	...props
}: CodeBlockProps) {
	const contextHighlight = useContext(CodeHighlightContext)
	const highlighter = highlight === false ? null : (highlight ?? contextHighlight)
	// A header bar only when there is something to title. A bar holding nothing
	// but a copy icon reads as an empty strip above the code; with no filename
	// the copy affordance floats in the corner instead.
	const hasHeader = Boolean(filename)
	const { copy, copied } = useCopy(code)

	if (prompt != null) {
		return (
			<div
				className={cn("flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 py-1 ps-3 pe-1", className)}
				{...props}
			>
				<code className="truncate text-mono-sm text-foreground">
					<span className="select-none text-muted-foreground">{prompt} </span>
					{code}
				</code>
				{showCopy ? (
					<Button variant="ghost" size="icon-sm" aria-label="Copy command" onClick={copy} className="shrink-0 text-muted-foreground">
						<Icon name={copied ? "check" : "copy"} />
					</Button>
				) : null}
			</div>
		)
	}

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-md border border-border bg-muted/40",
				className,
			)}
			{...props}
		>
			{hasHeader ? (
				<div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
					<span className="text-mono-caption text-muted-foreground">{filename}</span>
					{showCopy ? (
						<Button variant="ghost" size="icon-sm" aria-label="Copy code" onClick={copy} className="text-muted-foreground">
							<Icon name={copied ? "check" : "copy"} />
						</Button>
					) : null}
				</div>
			) : showCopy ? (
				<Button variant="ghost" size="icon-sm" aria-label="Copy code" onClick={copy} className="absolute end-2 top-2 z-1 text-muted-foreground">
					<Icon name={copied ? "check" : "copy"} />
				</Button>
			) : null}
			{/* The type tier sits on the <pre>, not the inline <code>: a pre's line
			    boxes take their height from its own font, so a mono size set only
			    on the inner element left every line at the body's taller leading.
			    text-mono-md, because code is reading text — mono-sm is the tiny
			    tracked tier for kbd hints. */}
			<pre
				className={cn(
					"overflow-x-auto overscroll-x-contain p-4 text-mono-md text-foreground scrollbar-quiet",
					!hasHeader && showCopy ? "pe-12" : "",
				)}
			>
				<code>{highlighter ? highlighter(code) : code}</code>
			</pre>
		</div>
	)
}
CodeBlock.displayName = "CodeBlock"
