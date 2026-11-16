"use client"

import { useRef, useState } from "react"
import { Button } from "../components/button"
import { ButtonGroup } from "../components/button-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card"
import { Combobox, ComboboxChips, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList } from "../components/combobox"
import { Field } from "../components/form"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../components/menu"
import { MiddleTruncate } from "../components/middle-truncate"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/select"
import { Separator } from "../components/separator"
import { toast } from "../components/toast"
import { Icon } from "../icon"
import { cn } from "../lib/cn"
import { useCopy } from "../lib/use-copy"

// ---block-code---
const doc = { title: "Q4 roadmap", url: "https://atlas.example/d/q4-roadmap-8f3a9c2e5b8d1f4a6c0e" }

// `label` is what a chip and a row show; `value` is what onInvite reports.
const people = [
	{ value: "ana", label: "Ana Chen" },
	{ value: "kofi", label: "Kofi Mensah" },
	{ value: "amira", label: "Amira Haddad" },
	{ value: "jo", label: "Jo Lund" },
	{ value: "tala", label: "Tala Begay" },
]

const roles = [
	{ value: "view", label: "Can view" },
	{ value: "comment", label: "Can comment" },
	{ value: "edit", label: "Can edit" },
]

const access = [
	{ value: "invited", label: "Only people invited" },
	{ value: "link", label: "Anyone with the link" },
] as const

type Person = (typeof people)[number]
type Access = (typeof access)[number]["value"]

export interface ShareBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Dialog or Popover that already frames it. */
	framed?: boolean
	/**
	 * Called with the people chosen and the role they get. Return a promise to
	 * hold the toast until the invites are sent: it resolves to "Invited …", and
	 * a rejection says they were not sent and keeps the people chosen.
	 */
	onInvite?: (invite: { people: string[]; role: string }) => void | Promise<void>
	/** Called with who the link opens for, the moment it changes. */
	onAccessChange?: (access: Access) => void
	/** Called after the link has been copied. */
	onCopyLink?: () => void
}

export function ShareBlock({ className, framed = true, onInvite, onAccessChange, onCopyLink }: ShareBlockProps) {
	const [chosen, setChosen] = useState<Person[]>([])
	const [role, setRole] = useState(roles[0].value)
	const [linkAccess, setLinkAccess] = useState<Access>(access[0].value)

	// The toast follows the outcome, not the press: the app's answer decides it.
	const invite = async () => {
		const names = chosen.length === 1 ? `Invited ${chosen[0].label}` : `Invited ${chosen.length} people`
		try {
			await onInvite?.({ people: chosen.map((person) => person.value), role })
			toast.success(names)
			setChosen([])
		} catch {
			toast.error("The invites were not sent. Try again.")
		}
	}

	// One copy behaviour for the three formats: the text is read at click time.
	const text = useRef(doc.url)
	const { copy } = useCopy(() => text.current)
	const copyAs = async (value: string, done: string) => {
		text.current = value
		if (await copy()) {
			toast.success(done)
			onCopyLink?.()
		} else {
			toast.error("Could not copy the link")
		}
	}

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>Share “{doc.title}”</CardTitle>
				<CardDescription>Invite people, or send them the link.</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<Field label="Add people">
					<Combobox multiple items={people} value={chosen} onValueChange={(next: Person[]) => setChosen(next)}>
						<ComboboxChips placeholder="Search by name" />
						<ComboboxContent>
							<ComboboxEmpty>No one by that name.</ComboboxEmpty>
							<ComboboxList>
								{(person: Person) => (
									<ComboboxItem key={person.value} value={person}>
										{person.label}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</Field>
				<div className="flex items-center gap-2">
					<Select items={roles} value={role} onValueChange={(next: unknown) => setRole(String(next))}>
						<SelectTrigger aria-label="Role" className="min-w-0 flex-1" />
						<SelectContent>
							{roles.map((item) => (
								<SelectItem key={item.value} value={item.value}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button disabled={chosen.length === 0} onClick={invite}>
						Invite
					</Button>
				</div>
				<Separator />
				<Field label="Link access">
					<Select
						items={access}
						value={linkAccess}
						onValueChange={(next: unknown) => {
							setLinkAccess(next as Access)
							onAccessChange?.(next as Access)
						}}
					>
						<SelectTrigger />
						<SelectContent>
							{access.map((item) => (
								<SelectItem key={item.value} value={item.value}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
				<div className="flex items-center gap-3">
					{/* Both ends of a link matter: the site, and the id that tells two links apart. */}
					<MiddleTruncate
						text={doc.url.replace("https://", "")}
						startChars={10}
						endChars={4}
						className="min-w-0 flex-1 text-mono-sm text-muted-foreground"
					/>
					<ButtonGroup aria-label="Share link">
						<Button variant="outline" size="sm" iconStart={<Icon name="link" />} onClick={() => copyAs(doc.url, "Link copied")}>
							Copy link
						</Button>
						<Menu>
							<MenuTrigger render={<Button variant="outline" size="icon-sm" aria-label="More ways to copy" />}>
								<Icon name="chevron-down" />
							</MenuTrigger>
							<MenuContent align="end">
								<MenuItem
									icon={<Icon name="file" />}
									onClick={() => copyAs(`[${doc.title}](${doc.url})`, "Copied as Markdown")}
								>
									Copy as Markdown
								</MenuItem>
								<MenuItem
									icon={<Icon name="layout" />}
									onClick={() => copyAs(`<iframe src="${doc.url}/embed"></iframe>`, "Embed code copied")}
								>
									Copy embed code
								</MenuItem>
							</MenuContent>
						</Menu>
					</ButtonGroup>
				</div>
			</CardContent>
		</Card>
	)
}
