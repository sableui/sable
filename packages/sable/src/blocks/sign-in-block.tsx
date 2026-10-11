import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card"
import { Input } from "../components/input"
import { Separator } from "../components/separator"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
export interface SignInBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet, Dialog or muted section that already frames it. */
	framed?: boolean
	/** Called with the method the person chose. Wire your auth here. */
	onSignIn?: (method: "password" | "passkey") => void
}

export function SignInBlock({ className, framed = true, onSignIn }: SignInBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardTitle>Welcome back</CardTitle>
				<CardDescription>Sign in to pick up where you left off.</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					className="flex flex-col gap-4"
					onSubmit={(event) => {
						event.preventDefault()
						onSignIn?.("password")
					}}
				>
					<div className="flex flex-col gap-2">
						<Input name="email" type="email" autoComplete="email" placeholder="you@studio.com" aria-label="Email" />
						<Input name="password" type="password" autoComplete="current-password" placeholder="Password" aria-label="Password" />
					</div>
					<Button type="submit" className="w-full">
						Sign in
					</Button>
					<Separator label="or" />
					<Button variant="outline" className="w-full" iconStart={<Icon name="lock" />} onClick={() => onSignIn?.("passkey")}>
						Use a passkey
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
