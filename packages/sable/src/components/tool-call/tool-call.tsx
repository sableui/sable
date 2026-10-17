import type { ComponentPropsWithRef, ReactNode } from "react"
import { useRef } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import { CodeBlock } from "../code-block"
import {
	Collapsible,
	CollapsibleIndicator,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "../collapsible"
import { Spinner } from "../spinner"
import { toolCallHeaderVariants, toolCallVariants } from "./tool-call.variants"

export type ToolCallStatus = "running" | "awaiting" | "complete" | "error" | "denied"

export const TOOL_CALL_STATUS_LABELS: Record<ToolCallStatus, string> = {
	running: "Running",
	awaiting: "Needs approval",
	complete: "Done",
	error: "Failed",
	denied: "Denied",
}

const STATUSES = Object.keys(TOOL_CALL_STATUS_LABELS) as ToolCallStatus[]

export interface ToolCallProps
	extends Omit<ComponentPropsWithRef<"div">, "title" | "children"> {
	/** The tool's own name, as the model called it (`search_docs`). Shown in mono. */
	name: string
	/**
	 * What the call does, in words a person reads ("Searched the docs"). Leads the
	 * row, with `name` after it. Omit it and the row leads with `name`.
	 */
	title?: ReactNode
	/**
	 * Where the call is. `awaiting` is a call held for the person's approval;
	 * `denied` is one they declined.
	 * @default "running"
	 */
	status?: ToolCallStatus
	/** Overrides the status word ("Running", "Done", …), for another language or a more specific phrase. */
	statusLabel?: string
	/** The arguments. A string shows as is; anything else as formatted JSON. */
	input?: unknown
	/** The result, shown the same way as `input`. `children` replaces it with a rendered result. */
	output?: unknown
	/** What went wrong, for `status="error"`. Always visible, under the row, not behind the disclosure. */
	error?: ReactNode
	/** A rendered result in place of `output`'s code view: a list of hits, a chart, a diff. */
	children?: ReactNode
	/** Open the details on mount. @default false */
	defaultOpen?: boolean
	/** Controlled open state of the details. */
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

function formatData(value: unknown): string {
	if (typeof value === "string") return value
	try {
		return JSON.stringify(value, null, 2) ?? String(value)
	} catch {
		return String(value)
	}
}

/**
 * ToolCall — one tool an agent called, inside its turn: what it did, where it
 * is, and the arguments and result one click away.
 *
 *   <ToolCall
 *     name="search_docs"
 *     title="Searched the docs"
 *     status="complete"
 *     input={{ query: "date range" }}
 *     output={{ hits: 3 }}
 *   />
 *
 * The row is the summary, so a thread of ten calls stays scannable; the details
 * are a disclosure because almost nobody reads them and the person checking
 * one call needs all of it. The status glyph is the one thing that moves: the
 * spinner swaps for the outcome when the call settles, which is the moment
 * worth seeing. A status change is announced once, politely, after mount — a
 * thread loaded from history announces nothing.
 */
export function ToolCall({
	name,
	title,
	status = "running",
	statusLabel,
	input,
	output,
	error,
	children,
	defaultOpen = false,
	open,
	onOpenChange,
	className,
	...props
}: ToolCallProps) {
	const tier = useTypeTier()
	const word = statusLabel ?? TOOL_CALL_STATUS_LABELS[status]
	// Announce changes, not the state a call arrived in: a long thread restored
	// from history would otherwise read every call's outcome aloud on load.
	const mountedStatus = useRef(status).current
	const announcement = status === mountedStatus ? "" : `${typeof title === "string" ? title : name}: ${word}`

	const hasInput = input !== undefined
	const hasOutput = children !== undefined || output !== undefined
	const hasDetails = hasInput || hasOutput

	const row = (
		<>
			{/* Every glyph stays mounted so the outgoing one can collapse while the
			    next resolves (motion-icon-swap). The spinner's loop is paused once
			    it is not the live glyph, so settled calls cost nothing. */}
			<span aria-hidden="true" className="motion-icon-swap size-4 shrink-0">
				{STATUSES.map((s) => (
					<span key={s} data-active={s === status} className="inline-flex">
						{s === "running" ? (
							<Spinner
								size="sm"
								role="none"
								aria-label={undefined}
								className={cn("text-muted-foreground", status !== "running" && "[&_svg]:[animation-play-state:paused]")}
							/>
						) : (
							<Icon name={GLYPHS[s].name} className={GLYPHS[s].className} />
						)}
					</span>
				))}
			</span>
			<span className={cn("flex min-w-0 flex-1 items-baseline gap-2", tier.body)}>
				<span className={cn("truncate text-foreground", !title && "font-mono")}>{title ?? name}</span>
				{title ? <span className={cn("hidden truncate font-mono text-muted-foreground sm:inline", tier.secondary)}>{name}</span> : null}
			</span>
			<span className={cn("shrink-0 text-muted-foreground", tier.secondary, status === "error" && "text-destructive")}>{word}</span>
			{hasDetails ? <CollapsibleIndicator /> : null}
		</>
	)

	const errorLine =
		status === "error" && error ? (
			<p className={cn("px-3 pb-2 text-destructive", tier.supporting)}>{error}</p>
		) : null
	const live = (
		<span role="status" className="sr-only">
			{announcement}
		</span>
	)

	if (!hasDetails) {
		return (
			<div data-status={status} className={cn(toolCallVariants({ status }), className)} {...props}>
				<div className={toolCallHeaderVariants({ interactive: false })}>{row}</div>
				{errorLine}
				{live}
			</div>
		)
	}

	return (
		<Collapsible
			data-status={status}
			defaultOpen={defaultOpen}
			open={open}
			onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
			className={cn(toolCallVariants({ status }), className)}
			{...props}
		>
			<CollapsibleTrigger className={cn("group/collapsible", toolCallHeaderVariants({ interactive: true }))}>
				{row}
			</CollapsibleTrigger>
			{errorLine}
			<CollapsiblePanel>
				<div className="flex flex-col gap-3 border-t border-border p-3">
					{hasInput ? <Detail label="Input" tier={tier.label} code={formatData(input)} /> : null}
					{children !== undefined ? (
						children
					) : output !== undefined ? (
						<Detail label="Output" tier={tier.label} code={formatData(output)} />
					) : null}
				</div>
			</CollapsiblePanel>
			{live}
		</Collapsible>
	)
}
ToolCall.displayName = "ToolCall"

const GLYPHS: Record<Exclude<ToolCallStatus, "running">, { name: string; className: string }> = {
	awaiting: { name: "clock", className: "text-tone-warning" },
	complete: { name: "check", className: "text-muted-foreground" },
	error: { name: "warning", className: "text-destructive" },
	denied: { name: "xmark", className: "text-muted-foreground" },
}

function Detail({ label, tier, code }: { label: string; tier: string; code: string }) {
	return (
		<div className="flex min-w-0 flex-col gap-1.5">
			<span className={cn("text-muted-foreground", tier)}>{label}</span>
			<CodeBlock code={code} />
		</div>
	)
}
