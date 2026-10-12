import { Button, type ToastPosition, toast } from "@sableui/react"
import { createContext, useContext, useEffect } from "react"
import type { PlaygroundControl, PlaygroundValue } from "../components/Playground"

/**
 * The Toast playground.
 *
 * Toast is the one component whose playground cannot be a rendered element: a
 * toast is a call (`toast.success(title, options)`), and its position belongs
 * and layout belong to the `ToastProvider` the page already mounts — a second
 * provider would render every toast twice, since they all read one store. So
 * the stage is a button that makes the call, and the position and stacked
 * controls reach up to the page's provider through this context.
 */

/** The page provider's settings the playground and examples can change. */
export interface ToastProviderSettings {
	position: ToastPosition
	stacked: boolean
}

export const TOAST_DEFAULT_PROVIDER: ToastProviderSettings = { position: "top-right", stacked: false }

/** Lets the playground change the page's one `ToastProvider`. No-op outside the Toast page. */
export const ToastProviderControl = createContext<(settings: Partial<ToastProviderSettings>) => void>(() => {})

/** The options of the call itself — meta describes the provider, not these. */
export const TOAST_CONTROLS: PlaygroundControl[] = [
	{
		prop: "type",
		kind: "enum",
		options: ["neutral", "success", "error", "warning", "info", "loading"],
		initial: "success",
		label: "Type",
		description: "Which helper to call: toast(), toast.success(), toast.error()…",
	},
	{ prop: "title", kind: "text", options: [], initial: "Edition published", label: "Title" },
	{
		prop: "description",
		kind: "text",
		options: [],
		initial: "It's live on your profile.",
		label: "Description",
	},
	{
		prop: "action",
		kind: "boolean",
		options: ["true", "false"],
		initial: false,
		label: "Undo action",
		description: "actionProps — a toast with an action stays until dismissed by default.",
	},
	{
		prop: "timeout",
		kind: "enum",
		options: ["default", "3000", "10000", "0"],
		initial: "default",
		label: "Timeout",
		labels: { default: "Default", "3000": "3 seconds", "10000": "10 seconds", "0": "Until dismissed" },
		description:
			"Omitted, success/warning/info leave after 5s; error, loading and action toasts stay.",
	},
]

type ToastHelper = "success" | "error" | "warning" | "info" | "loading"

function show(values: Record<string, PlaygroundValue>) {
	const title = String(values.title || "Notification")
	const description = String(values.description ?? "") || undefined
	const timeout = values.timeout === "default" ? undefined : Number(values.timeout)
	let id = ""
	const options = {
		description,
		timeout,
		actionProps:
			values.action === true
				? { children: "Undo", onClick: () => toast.dismiss(id) }
				: undefined,
	}
	id =
		values.type === "neutral"
			? toast(title, options)
			: toast[values.type as ToastHelper](title, options)
}

/** The stage: one button that fires the configured toast. */
export function ToastStage({ values }: { values: Record<string, PlaygroundValue> }) {
	const setProvider = useContext(ToastProviderControl)
	const position = values.position as ToastPosition
	const stacked = values.stacked === true
	useEffect(() => setProvider({ position, stacked }), [position, stacked, setProvider])
	return <Button onClick={() => show(values)}>Show toast</Button>
}

/** Text as a JS string literal, quotes escaped. */
function literal(text: string): string {
	return JSON.stringify(text)
}

/** The call as a consumer writes it, plus the provider when it is not the default one. */
export function toastSnippet(values: Record<string, PlaygroundValue>): string {
	const helper = values.type === "neutral" ? "toast" : `toast.${values.type}`
	const options: string[] = []
	if (values.description) options.push(`description: ${literal(String(values.description))}`)
	if (values.timeout !== "default") options.push(`timeout: ${values.timeout}`)
	if (values.action === true) options.push('actionProps: { children: "Undo", onClick: undo }')
	const args = [literal(String(values.title || "Notification"))]
	if (options.length) args.push(`{\n\t${options.join(",\n\t")},\n}`)
	const call = `${helper}(${args.join(", ")})`
	const provider: string[] = []
	if (values.position !== TOAST_DEFAULT_PROVIDER.position) provider.push(`position="${values.position}"`)
	if (values.stacked === true) provider.push("stacked")
	if (!provider.length) return call
	return `// Once, near the app root\n<ToastProvider ${provider.join(" ")}>{children}</ToastProvider>\n\n// Anywhere\n${call}`
}
