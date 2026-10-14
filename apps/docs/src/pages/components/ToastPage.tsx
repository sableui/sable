import { Button, Toggle, ToggleGroup, ToastProvider, toastMeta, useToast } from "@sableui/react"
import { useCallback, useContext, useState } from "react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"
import {
	TOAST_DEFAULT_PROVIDER,
	ToastProviderControl,
	type ToastProviderSettings,
} from "../../lib/toast-playground"

/** Pushes a simple title + description toast. Must render under <ToastProvider>. */
function BasicTrigger() {
	const toast = useToast()
	return (
		<Button
			onClick={() =>
				toast.add({
					title: "Post published",
					description: "Your edition is live on Studio.",
				})
			}
		>
			Publish
		</Button>
	)
}

/** Demonstrates description-only and persistent (timeout: 0) toasts. */
function VariantsTrigger() {
	const toast = useToast()
	return (
		<>
				<Button
					variant="secondary"
					onClick={() =>
						toast.add({ description: "Link copied to clipboard." })
					}
				>
					Description only
				</Button>
				<Button
					variant="secondary"
					onClick={() =>
						toast.add({
							title: "Uploading…",
							description: "Pinning your media to Arweave. This won't auto-dismiss.",
							timeout: 0,
						})
					}
				>
					Persistent
				</Button>
		</>
	)
}

/**
 * The action path. `actionProps` is Base UI's own shape — children plus any
 * button props — and the renderer mounts a ToastAction for it. Dismissal is the
 * handler's, not the button's, so the id from add() is what closes it.
 */
function ActionTrigger() {
	const toast = useToast()
	return (
		<Button
			variant="secondary"
			onClick={() => {
				const id = toast.add({
					title: "Layer deleted",
					description: "Backdrop was removed from the document.",
					actionProps: {
						children: "Undo",
						onClick: () => toast.close(id),
					},
				})
			}}
		>
			Delete a layer
		</Button>
	)
}

/**
 * Adds four toasts at once to show the limit-aware stack, as a list or as a
 * deck. The layout toggle moves the page's provider, like the playground does.
 */
function StackTrigger({ stacked }: { stacked: boolean }) {
	const toast = useToast()
	const setProvider = useContext(ToastProviderControl)
	return (
		<>
		<ToggleGroup
			value={[stacked ? "stacked" : "list"]}
			onValueChange={(v: unknown[]) => v[0] && setProvider({ stacked: v[0] === "stacked" })}
			aria-label="Layout"
		>
			<Toggle value="list">List</Toggle>
			<Toggle value="stacked">Stacked</Toggle>
		</ToggleGroup>
		<Button
			variant="secondary"
			onClick={() => {
				toast.add({ title: "Saved", description: "Draft #1" })
				toast.add({ title: "Saved", description: "Draft #2" })
				toast.add({ title: "Saved", description: "Draft #3" })
				toast.add({ title: "Saved", description: "Draft #4 (evicts the oldest)" })
			}}
		>
			Add four
		</Button>
		</>
	)
}

export function ToastPage() {
	// One provider for the page, as in an app: every provider subscribes to the
	// same toast store, so several on one page would each render every toast.
	// The playground and the stacking example change this provider rather than adding one.
	const [settings, setSettings] = useState<ToastProviderSettings>(TOAST_DEFAULT_PROVIDER)
	const setProvider = useCallback(
		(next: Partial<ToastProviderSettings>) => setSettings((current) => ({ ...current, ...next })),
		[],
	)
	return (
		<ToastProvider limit={3} position={settings.position} stacked={settings.stacked}>
			<ToastProviderControl.Provider value={setProvider}>
				<PageHeader eyebrow="Components" title="Toast" lede={ledeFor(toastMeta)} />

				<ComponentPlayground meta={toastMeta} />

				<Section
					title="Basic"
					description="A title and a line of detail. It dismisses itself after a few seconds."
				>
					<Example>
						<BasicTrigger />
					</Example>
				</Section>

				<Section
					title="Description only and persistent"
					description="A single line, or one that stays until it's dismissed."
				>
					<Example>
						<VariantsTrigger />
					</Example>
				</Section>

				<Section
					title="With an action"
					description="A toast with an action, like Undo, stays until it's dismissed."
				>
					<Example>
						<ActionTrigger />
					</Example>
				</Section>

				<Section
					title="Stacking"
					description="Up to three at once. A new one pushes out the oldest. With stacked, they sit on top of one another, the newest in front; hover the stack to fan it out."
				>
					<Example>
						<StackTrigger stacked={settings.stacked} />
					</Example>
				</Section>

				<Section title="Beside an open Sheet">
					<p className="max-w-(--measure-prose) text-body-md text-muted-foreground">
						A stack on the same edge as an open Sheet moves out of the way of its actions: beside the sheet where there is
						room, and on a narrow screen from the bottom to the top, off the sheet's footer. A bottom sheet sends bottom
						toasts to the top, and a top sheet sends top toasts to the bottom.
					</p>
				</Section>

				<MetaFooter meta={toastMeta} />
			</ToastProviderControl.Provider>
		</ToastProvider>
	)
}
