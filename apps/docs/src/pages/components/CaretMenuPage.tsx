import {
	Avatar,
	CaretMenu,
	CaretMenuItem,
	ChatComposer,
	Icon,
	Textarea,
	caretMenuMeta,
	useCaretTrigger,
} from "@sableui/react"
import { useEffect, useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/* Sample content. */
const PEOPLE = [
	{ id: "ada", name: "Ada Lovelace", initials: "AL" },
	{ id: "grace", name: "Grace Hopper", initials: "GH" },
	{ id: "alan", name: "Alan Turing", initials: "AT" },
	{ id: "katherine", name: "Katherine Johnson", initials: "KJ" },
	{ id: "margaret", name: "Margaret Hamilton", initials: "MH" },
]

const COMMANDS = [
	{ name: "summarize", hint: "Summarize the thread so far", icon: "sparkles" },
	{ name: "translate", hint: "Translate your draft", icon: "comment" },
	{ name: "clear", hint: "Start a new conversation", icon: "trash" },
]

const CHANNELS = ["general", "design", "design-systems", "engineering", "launch", "random", "support"]

/**
 * The full pairing in a ChatComposer: `@` for people (names with spaces),
 * `/` for commands at the start of the message. Shared with the Chat
 * Composer page, which shows the same thing from the composer's side.
 */
export function MentionsComposer() {
	const trigger = useCaretTrigger({ triggers: [{ char: "@", allowSpaces: true }, { char: "/", atStart: true }] })
	const [log, setLog] = useState<string[]>([])
	const q = trigger.match?.query.toLowerCase() ?? ""
	const commands = trigger.match?.trigger.char === "/"
	const people = PEOPLE.filter((p) => p.name.toLowerCase().includes(q))
	const matching = COMMANDS.filter((c) => c.name.startsWith(q))
	return (
		<div className="flex w-full max-w-xl flex-col gap-3">
			<ChatComposer
				fieldRef={trigger.fieldRef}
				placeholder="Type @ to mention someone, or / for a command"
				onSend={(text) => setLog((l) => [...l, `Sent: ${text}`])}
			/>
			<CaretMenu
				trigger={trigger}
				label={commands ? "Commands" : "People"}
				status={commands ? (matching.length ? undefined : "No such command") : people.length ? undefined : "No one matches"}
			>
				{commands
					? matching.map((c) => (
							<CaretMenuItem
								key={c.name}
								icon={<Icon name={c.icon} />}
								description={c.hint}
								onSelect={() => {
									setLog((l) => [...l, `Ran /${c.name}`])
									trigger.replace("")
								}}
							>
								/{c.name}
							</CaretMenuItem>
						))
					: people.map((p) => (
							<CaretMenuItem
								key={p.id}
								icon={<Avatar size="sm" fallback={p.initials} />}
								onSelect={() => trigger.replace(`@${p.name} `)}
							>
								{p.name}
							</CaretMenuItem>
						))}
			</CaretMenu>
			{log.length ? (
				<ul className="text-body-sm text-muted-foreground">
					{log.slice(-3).map((line, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: a short, append-only demo log
						<li key={i}>{line}</li>
					))}
				</ul>
			) : null}
		</div>
	)
}

/** `#` on a plain Textarea, with results that arrive later, like a server's. */
function ChannelsNote() {
	const trigger = useCaretTrigger({ triggers: [{ char: "#" }] })
	const query = trigger.match?.query ?? null
	const [results, setResults] = useState<string[]>([])
	const [loading, setLoading] = useState(false)
	// A stand-in for a debounced fetch: the app owns this, not CaretMenu.
	useEffect(() => {
		if (query === null) return
		setLoading(true)
		const timer = setTimeout(() => {
			setResults(CHANNELS.filter((c) => c.includes(query.toLowerCase())))
			setLoading(false)
		}, 300)
		return () => clearTimeout(timer)
	}, [query])
	return (
		<div className="w-full max-w-xl">
			<Textarea ref={trigger.fieldRef} aria-label="Note" rows={4} placeholder="Type # to link a channel. Try a long line, then # near the right edge." />
			<CaretMenu
				trigger={trigger}
				label="Channels"
				status={loading ? "Searching…" : results.length ? undefined : "No channels match"}
			>
				{loading
					? null
					: results.map((c) => (
							<CaretMenuItem key={c} onSelect={() => trigger.replace(`#${c} `)}>
								#{c}
							</CaretMenuItem>
						))}
			</CaretMenu>
		</div>
	)
}

export function CaretMenuPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Caret Menu" lede={ledeFor(caretMenuMeta)} />

			<Section
				title="Mentions and slash commands"
				description="Type @ for people or / at the start for a command. Arrow keys move, Enter or Tab picks, Escape closes. Enter picks instead of sending while the list is open."
			>
				<Example
					code={
						'const trigger = useCaretTrigger({ triggers: [{ char: "@", allowSpaces: true }, { char: "/", atStart: true }] })\nconst q = trigger.match?.query.toLowerCase() ?? ""\n\n<ChatComposer fieldRef={trigger.fieldRef} onSend={send} />\n<CaretMenu trigger={trigger} label="People">\n\t{people.filter((p) => p.name.toLowerCase().includes(q)).map((p) => (\n\t\t<CaretMenuItem key={p.id} onSelect={() => trigger.replace(`@${p.name} `)}>{p.name}</CaretMenuItem>\n\t))}\n</CaretMenu>'
					}
				>
					<MentionsComposer />
				</Example>
			</Section>

			<Section
				title="On a textarea, with remote results"
				description="The app fetches from the query and says what the list is doing through status. The list sits at the caret, wherever the line wraps."
			>
				<Example
					code={
						'const trigger = useCaretTrigger({ triggers: [{ char: "#" }] })\n<Textarea ref={trigger.fieldRef} aria-label="Note" />\n<CaretMenu trigger={trigger} label="Channels" status={loading ? "Searching…" : undefined}>\n\t{results.map((c) => <CaretMenuItem key={c} onSelect={() => trigger.replace(`#${c} `)}>#{c}</CaretMenuItem>)}\n</CaretMenu>'
					}
				>
					<ChannelsNote />
				</Example>
			</Section>

			<MetaFooter meta={caretMenuMeta} />
		</>
	)
}
