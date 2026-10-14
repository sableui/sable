import { Avatar } from "../components/avatar"
import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { Field, Form } from "../components/form"
import { Input } from "../components/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/select"
import { Textarea } from "../components/textarea"
import { cn } from "../lib/cn"
import { Grid, Row, Stack } from "../layout"

// ---block-code---
const profile = {
	name: "Ada Lovelace",
	initials: "AL",
	handle: "ada",
	bio: "Product designer working on tools for small teams. Writing about process every month.",
	timezone: "europe-london",
}

const timezones = [
	{ value: "europe-london", label: "London (GMT+1)" },
	{ value: "europe-paris", label: "Paris (GMT+2)" },
	{ value: "america-new-york", label: "New York (GMT−4)" },
	{ value: "america-los-angeles", label: "Los Angeles (GMT−7)" },
	{ value: "asia-tokyo", label: "Tokyo (GMT+9)" },
]

export interface ProfileFormBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
	/** Called with the form's fields on Save profile. */
	onSave?: (fields: FormData) => void
}

export function ProfileFormBlock({ className, framed = true, onSave }: ProfileFormBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-2xl", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>Profile</CardTitle>
				<CardDescription>How your team sees you.</CardDescription>
			</CardHeader>
			{/* The one explicit save: profile text is drafted, then committed. */}
			<Form
				className="gap-0"
				onSubmit={(event) => {
					event.preventDefault()
					onSave?.(new FormData(event.currentTarget))
				}}
			>
				<CardContent>
					<Stack gap={3}>
						<Row gap={2}>
							<Avatar variant="art" size="lg" fallback={profile.initials} alt={profile.name} />
							<Stack gap={0.5} align="start">
								<Row gap={1}>
									<Button type="button" variant="outline" size="sm">
										Upload photo
									</Button>
									<Button type="button" variant="ghost" size="sm">
										Remove
									</Button>
								</Row>
								<p className="text-caption text-muted-foreground">Square PNG or JPG, at least 400 px.</p>
							</Stack>
						</Row>
						<Grid cols={{ base: 1, sm: 2 }} gap={3}>
							<Field label="Display name" name="displayName" required>
								<Input defaultValue={profile.name} autoComplete="name" />
							</Field>
							<Field label="Handle" name="handle" description={`atelier.com/@${profile.handle}`} required>
								<Input defaultValue={profile.handle} autoComplete="username" spellCheck={false} />
							</Field>
						</Grid>
						<Field label="Bio" name="bio" description="Shown on your profile and in comments.">
							<Textarea rows={3} defaultValue={profile.bio} />
						</Field>
						<Grid cols={{ base: 1, sm: 2 }} gap={3}>
							<Field label="Timezone" name="timezone" description="Release times use this zone.">
								<Select defaultValue={profile.timezone} items={timezones}>
									<SelectTrigger />
									<SelectContent>
										{timezones.map((zone) => (
											<SelectItem key={zone.value} value={zone.value}>
												{zone.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						</Grid>
					</Stack>
				</CardContent>
				<CardFooter actions className="justify-end">
					<Button type="submit">Save profile</Button>
				</CardFooter>
			</Form>
		</Card>
	)
}
