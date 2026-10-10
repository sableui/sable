import { StrictMode, useEffect, useState, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardList,
	EmptyState,
	Entity,
	Field,
	Form,
	Icon,
	IconProvider,
	Input,
	MotionProvider,
	SearchInput,
	Slider,
	Switch,
	Textarea,
	ToastProvider,
	fallbackIconSet,
	toast,
} from "@sableui/react"
import { reiconIconSet } from "@sableui/react/icons/reicon"
import {
	IosBackLink,
	IosIconButton,
	IosNavbar,
	IosPage,
	IosSheet,
	IosTab,
	IosTabbar,
	NativeApp,
	NavigationStack,
	useNavigation,
} from "@sableui/react/ios"
import { useIosPreviewTheme } from "@sableui/react/ios/preview"
import "./native.css"

/*
 * Fieldnotes — an invented collection app, built the way the iOS guide says:
 * Sable first. Every screen is Sable components (Card, Entity, SearchInput,
 * Switch, Slider, Form, Field, Input, Button, EmptyState, toast). The adapter
 * supplies only the iOS chrome — the app frame, navigation bars, tab bar and
 * sheet presentation. In the docs it takes the reader's Customize look from
 * the host page through useIosPreviewTheme.
 */

type Note = { id: string; title: string; place: string; text: string; saved: boolean }
const samples: Note[] = [
	{ id: "1", title: "A quiet morning", place: "Mount Falcon, Colorado", text: "The trail was still cool. A few birds, the scent of pine, and no reason to hurry. Take the west loop next time.", saved: true },
	{ id: "2", title: "At the water’s edge", place: "Bear Lake, Colorado", text: "Clouds passed over the lake as we stopped for lunch. The water reflected the ridge almost perfectly.", saved: false },
	{ id: "3", title: "The long way home", place: "Golden Gate Canyon", text: "Found a new path through the aspens. A longer walk than planned, and a place worth visiting again.", saved: true },
]

/** A grouped section on an iOS screen: a heading on the page margin over a Sable Card. */
function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="flex flex-col gap-2 px-(--ios-inset) pb-6">
			<h2 className="text-title-sm text-muted-foreground">{title}</h2>
			{children}
		</section>
	)
}

function Detail({ note, onSave }: { note: Note; onSave: (id: string) => void }) {
	const navigation = useNavigation()
	const [saved, setSaved] = useState(note.saved)
	return (
		<IosPage>
			<IosNavbar title="Fieldnote" left={<IosBackLink onClick={navigation.pop}>Back</IosBackLink>} />
			<article className="flex flex-col gap-4 px-(--ios-inset) pt-2 pb-8">
				{/* Placeholder artwork from the preset's own colors. */}
				<div aria-hidden className="aspect-[4/3] rounded-xl bg-linear-to-br from-primary/15 via-muted to-muted" />
				<p className="text-body-sm text-muted-foreground">{note.place}</p>
				<h1 tabIndex={-1} className="text-heading-1">{note.title}</h1>
				<p className="text-body-lg">{note.text}</p>
				<Button
					size="cta"
					variant={saved ? "secondary" : "primary"}
					onClick={() => {
						setSaved((value) => !value)
						onSave(note.id)
					}}
				>
					{saved ? "Remove from saved" : "Save fieldnote"}
				</Button>
			</article>
		</IosPage>
	)
}

function Notes({ notes, savedOnly, onCreate, onSave }: { notes: Note[]; savedOnly?: boolean; onCreate: () => void; onSave: (id: string) => void }) {
	const navigation = useNavigation()
	const [query, setQuery] = useState("")
	const filtered = notes.filter((note) => (!savedOnly || note.saved) && `${note.title} ${note.place}`.toLowerCase().includes(query.toLowerCase()))
	return (
		<IosPage>
			<IosNavbar
				large
				title={savedOnly ? "Saved" : "Fieldnotes"}
				right={
					<IosIconButton onClick={onCreate} aria-label="New fieldnote">
						<Icon name="plus" className="shrink-0 text-xl" />
					</IosIconButton>
				}
			/>
			{savedOnly ? null : (
				<header className="flex flex-col gap-2 px-(--ios-inset) pb-4">
					<p className="text-heading-3">Small moments. Places to remember.</p>
					<p className="text-body-md text-muted-foreground">A little space for what you notice.</p>
				</header>
			)}
			<div className="px-(--ios-inset) pb-4">
				<SearchInput aria-label="Search fieldnotes" placeholder="Search fieldnotes" value={query} onValueChange={setQuery} onClear={() => setQuery("")} />
			</div>
			<div className="px-(--ios-inset) pb-6">
				{filtered.length ? (
					<Card>
						<CardList>
							{filtered.map((note) => (
								<Entity
									key={note.id}
									interactive
									density="comfortable"
									onSelect={() => navigation.push(note.id, <Detail note={note} onSave={onSave} />)}
									leading={<Icon name="book" className="text-xl text-muted-foreground" />}
									title={note.title}
									subtitle={note.place}
									action={note.saved && !savedOnly ? <Badge tone="success">Saved</Badge> : <Icon name="chevron-right" className="text-muted-foreground" />}
								/>
							))}
						</CardList>
					</Card>
				) : (
					<EmptyState
						icon={<Icon name="search" />}
						title="No fieldnotes found"
						description="Try another search or add a new moment."
						action={<Button variant="secondary" onClick={() => setQuery("")}>Clear search</Button>}
					/>
				)}
			</div>
		</IosPage>
	)
}

function Settings({ dark, setDark, reduced, setReduced, tint, setTint }: { dark: boolean; setDark: (value: boolean) => void; reduced: boolean; setReduced: (value: boolean) => void; tint: number; setTint: (value: number) => void }) {
	return (
		<IosPage>
			<IosNavbar large title="Settings" />
			<Section title="Appearance">
				<Card>
					<CardList>
						<Entity density="comfortable" title="Dark appearance" action={<Switch aria-label="Dark appearance" checked={dark} onCheckedChange={setDark} />} />
						<Entity density="comfortable" title="Reduce motion" action={<Switch aria-label="Reduce motion" checked={reduced} onCheckedChange={setReduced} />} />
					</CardList>
				</Card>
			</Section>
			<Section title="Glass">
				<Card>
					<CardContent>
						<Field label="Glass tint" description="From clear to tinted. Content stays on solid surfaces.">
							<Slider value={tint * 100} min={0} max={100} onValueChange={(value) => setTint((Array.isArray(value) ? value[0] : value) / 100)} />
						</Field>
					</CardContent>
				</Card>
			</Section>
			<Section title="About this preview">
				<Card>
					<CardList>
						<Entity density="comfortable" title="Platform" action={<span className="text-body-md text-muted-foreground">iOS 27</span>} />
						<Entity density="comfortable" title="Look" action={<span className="text-body-md text-muted-foreground">From Customize</span>} />
					</CardList>
				</Card>
				<p className="text-body-sm text-muted-foreground">Fieldnotes is an invented sample app, running as an interactive browser prototype.</p>
			</Section>
		</IosPage>
	)
}

function NewNote({ onAdd }: { onAdd: (note: Note) => void }) {
	const [error, setError] = useState("")
	return (
		<Form
			className="flex flex-col gap-4"
			onFormSubmit={(values) => {
				const title = String(values.title ?? "").trim()
				if (!title) {
					setError("Add a title for your fieldnote.")
					document.getElementById("note-title")?.focus()
					return
				}
				onAdd({ id: crypto.randomUUID(), title, place: String(values.place ?? "").trim() || "A place to remember", text: String(values.text ?? "").trim(), saved: false })
			}}
		>
			<Field name="title" label="Title" error={error || undefined}>
				<Input id="note-title" placeholder="What did you notice?" onChange={(event) => event.target.value.trim() && setError("")} />
			</Field>
			<Field name="place" label="Place">
				<Input placeholder="Where were you?" />
			</Field>
			<Field name="text" label="Note">
				<Textarea placeholder="Keep a few details…" />
			</Field>
			<Button type="submit" size="cta">Add fieldnote</Button>
		</Form>
	)
}

function Demo() {
	const look = useIosPreviewTheme()
	const [dark, setDark] = useState(false)
	const [reduced, setReduced] = useState(false)
	// The host's look sets the starting appearance; Settings can still change it here.
	useEffect(() => {
		if (!look) return
		setDark(look.mode === "dark")
		setReduced(look.reducedMotion)
	}, [look])
	const [tint, setTint] = useState(0.35)
	const [tab, setTab] = useState("notes")
	const [notes, setNotes] = useState(samples)
	const [open, setOpen] = useState(false)
	const [sheetKey, setSheetKey] = useState(0)
	const toggleSave = (id: string) => setNotes((previous) => previous.map((note) => (note.id === id ? { ...note, saved: !note.saved } : note)))
	const create = () => {
		setSheetKey((key) => key + 1)
		setOpen(true)
	}
	const tabs = [
		{ id: "notes", label: "Notes", icon: "list" },
		{ id: "saved", label: "Saved", icon: "heart" },
		{ id: "settings", label: "Settings", icon: "gear" },
	]
	return (
		<IconProvider set={look?.icons === "fallback" ? fallbackIconSet : reiconIconSet}>
			<MotionProvider>
				<ToastProvider position="top-center">
					<NativeApp mode={dark ? "dark" : "light"} reducedMotion={reduced} glassTint={tint}>
						<NavigationStack label="Fieldnotes" active={tab === "notes"}>
							<Notes notes={notes} onCreate={create} onSave={toggleSave} />
						</NavigationStack>
						<NavigationStack label="Saved fieldnotes" active={tab === "saved"}>
							<Notes notes={notes} savedOnly onCreate={create} onSave={toggleSave} />
						</NavigationStack>
						<NavigationStack label="Settings" active={tab === "settings"}>
							<Settings dark={dark} setDark={setDark} reduced={reduced} setReduced={setReduced} tint={tint} setTint={setTint} />
						</NavigationStack>
						<IosTabbar aria-label="Main navigation">
							{tabs.map((item) => (
								<IosTab
									key={item.id}
									active={tab === item.id}
									onClick={() => setTab(item.id)}
									icon={<Icon name={item.icon} className="shrink-0 text-2xl" />}
									label={item.label}
								/>
							))}
						</IosTabbar>
						<IosSheet open={open} onOpenChange={setOpen} title="New fieldnote">
							<NewNote
								key={sheetKey}
								onAdd={(note) => {
									setNotes((previous) => [note, ...previous])
									setOpen(false)
									setTab("notes")
									toast.success("Fieldnote added")
								}}
							/>
						</IosSheet>
					</NativeApp>
				</ToastProvider>
			</MotionProvider>
		</IconProvider>
	)
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Demo />
	</StrictMode>,
)
