import { Button, type ToastPosition, toast } from "@sableui/react"
import { createContext, useContext, useEffect } from "react"
import type { PlaygroundControl, PlaygroundValue } from "../components/Playground"

/**
 * The Toast playground.
 *
 * Toast is the one component whose playground cannot be a rendered element: a
 * toast is a call (`toast.success(title, options)`), and its position belongs
 * to the `ToastProvider` the page already mounts — a second provider would
 * render every toast twice, since they all read one store. So the stage is a
 * button that makes the call, and the position control reaches up to the
 * page's provider through this context.
 */

/** Lets the playground move the page's one `ToastProvider`. No-op outside the Toast page. */
export const ToastPositionControl = createContext<(position: ToastPosition) => void>(() => {})

export const TOAST_DEFAULT_POSITION: ToastPosition = "top-right"

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
	const setPosition = useContext(ToastPositionControl)
	const position = values.position as ToastPosition
	useEffect(() => setPosition(position), [position, setPosition])
	return <Button onClick={() => show(values)}>Show toast</Button>
}

/** Text as a JS string literal, quotes escaped. */
function literal(text: string): string {
	return JSON.stringify(text)
}

/** The call as a consumer writes it, plus the provider when its position is not the default. */
export function toastSnippet(values: Record<string, PlaygroundValue>): string {
	const helper = values.type === "neutral" ? "toast" : `toast.${values.type}`
	const options: string[] = []
	if (values.description) options.push(`description: ${literal(String(values.description))}`)
	if (values.timeout !== "default") options.push(`timeout: ${values.timeout}`)
	if (values.action === true) options.push('actionProps: { children: "Undo", onClick: undo }')
	const args = [literal(String(values.title || "Notification"))]
	if (options.length) args.push(`{\n\t${options.join(",\n\t")},\n}`)
	const call = `${helper}(${args.join(", ")})`
	if (values.position === TOAST_DEFAULT_POSITION) return call
	return `// Once, near the app root\n<ToastProvider position="${values.position}">{children}</ToastProvider>\n\n// Anywhere\n${call}`
}
