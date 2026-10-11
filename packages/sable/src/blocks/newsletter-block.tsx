import { useId } from "react"
import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card"
import { Input } from "../components/input"
import { cn } from "../lib/cn"

// ---block-code---
const newsletter = { title: "The Cove digest", body: "One note a month on trusted workflows and product releases." }

export interface NewsletterBlockProps {
	className?: string
	/** false drops the card's surface and border — for a footer or muted section that already frames it. */
	framed?: boolean
	/** Called with the address on Subscribe or Enter. */
	onSubscribe?: (email: string) => void
}

export function NewsletterBlock({ className, framed = true, onSubscribe }: NewsletterBlockProps) {
	const emailId = useId()
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-sm", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>{newsletter.title}</CardTitle>
				<CardDescription>{newsletter.body}</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					className="grid gap-2 sm:grid-cols-[1fr_auto]"
					onSubmit={(event) => {
						event.preventDefault()
						onSubscribe?.(String(new FormData(event.currentTarget).get("email") ?? ""))
					}}
				>
					<label htmlFor={emailId} className="sr-only">
						Work email
					</label>
					<Input id={emailId} name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
					<Button type="submit" className="w-full sm:w-auto">
						Subscribe
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
