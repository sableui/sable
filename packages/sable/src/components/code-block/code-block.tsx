import { type ComponentPropsWithRef, type ReactNode, createContext, useContext, useRef } from "react"
import { Icon } from "../../icon"
import { useCopy } from "../../lib/use-copy"
import { useEdgeFade } from "../../lib/use-edge-fade"
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

/*
 * The copy affordance's glyph. Both marks stay mounted and cross-fade through
 * motion-icon-swap: the plain `copied ? "check" : "copy"` swap changed the
 * icon between two frames, so the confirmation was easy to miss at the corner
 * of a block. The wrapper is aria-hidden — the button's own label names it, and
 * the outcome is announced by the block's live region (see CopiedStatus).
 */
function CopyGlyph({ copied }: { copied: boolean }) {
	return (
		<span aria-hidden="true" className="motion-icon-swap">
			<span data-active={!copied} className="inline-flex">
				<Icon name="copy" />
			</span>
			<span data-active={copied} className="inline-flex">
				<Icon name="check" />
			</span>
		</span>
	)
}

/*
 * "Copied", for assistive tech. A glyph change is silent to a screen reader, so
 * the copy otherwise happened without a word. A polite live region that is
 * always mounted (an announcement only lands in a region that already exists)
 * rather than a changing aria-label: a focused button's name changing is read
 * by some screen readers and not others, and the label is also the button's
 * description of what it does, which "Copied" is not.
 */
function CopiedStatus({ copied }: { copied: boolean }) {
	return (
		<span role="status" className="sr-only">
			{copied ? "Copied" : ""}
		</span>
	)
}

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
 * copy affordance; the body is a horizontally scrollable monospace pre whose
 * edges fade while there is more to scroll (see useEdgeFade). Without a
 * header, the copy button takes its own column beside the code rather than
 * floating over it, so a long line can never scroll underneath it.
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
	const preRef = useRef<HTMLPreElement>(null)
	const fade = useEdgeFade(preRef, "horizontal")

	if (prompt != null) {
		return (
			<div
				className={cn("flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 py-1 ps-3 pe-1", className)}
				{...props}
			>
				<code className="truncate text-mono-md text-foreground">
					<span className="select-none text-muted-foreground">{prompt} </span>
					{code}
				</code>
				{showCopy ? (
					<Button variant="ghost" size="icon-sm" aria-label="Copy command" onClick={copy} className="shrink-0 text-muted-foreground">
						<CopyGlyph copied={copied} />
					</Button>
				) : null}
				{showCopy ? <CopiedStatus copied={copied} /> : null}
			</div>
		)
	}

	const copyColumn = !hasHeader && showCopy
	return (
		<div
			className={cn(
				"overflow-hidden rounded-md border border-border bg-muted/40",
				copyColumn && "flex items-start",
				className,
			)}
			{...props}
		>
			{hasHeader ? (
				<div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
					<span className="text-mono-caption text-muted-foreground">{filename}</span>
					{showCopy ? (
						<Button variant="ghost" size="icon-sm" aria-label="Copy code" onClick={copy} className="text-muted-foreground">
							<CopyGlyph copied={copied} />
						</Button>
					) : null}
				</div>
			) : null}
			{/* The type tier sits on the <pre>, not the inline <code>: a pre's line
			    boxes take their height from its own font, so a mono size set only
			    on the inner element left every line at the body's taller leading.
			    text-mono-md, because code is reading text — mono-sm is the tiny
			    tracked tier for kbd hints. The pre is the scroll region, so it
			    carries the fade mask; it has no border of its own to fade. */}
			<pre
				ref={preRef}
				onScroll={fade.sync}
				style={fade.style}
				className={cn(
					"overflow-x-auto overscroll-x-contain p-4 text-mono-md text-foreground scrollbar-quiet",
					copyColumn && "min-w-0 flex-1 pe-2",
				)}
			>
				<code>{highlighter ? highlighter(code) : code}</code>
			</pre>
			{copyColumn ? (
				<Button variant="ghost" size="icon-sm" aria-label="Copy code" onClick={copy} className="m-2 ms-0 shrink-0 text-muted-foreground">
					<CopyGlyph copied={copied} />
				</Button>
			) : null}
			{showCopy ? <CopiedStatus copied={copied} /> : null}
		</div>
	)
}
CodeBlock.displayName = "CodeBlock"
