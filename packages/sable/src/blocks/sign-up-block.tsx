import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { Field, Form } from "../components/form"
import { Input } from "../components/input"
import { cn } from "../lib/cn"

// ---block-code---
export interface SignUpBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet, Dialog or muted section that already frames it. */
	framed?: boolean
	/** Called with the submitted fields once the browser's validation passes. */
	onSignUp?: (account: { name: string; email: string; password: string }) => void
}

export function SignUpBlock({ className, framed = true, onSignUp }: SignUpBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-sm", className)}>
			<CardHeader>
				<CardTitle>Create your account</CardTitle>
				<CardDescription>Free for 14 days. No card needed.</CardDescription>
			</CardHeader>
			<Form
				className="gap-0"
				onSubmit={(event) => {
					event.preventDefault()
					const data = new FormData(event.currentTarget)
					onSignUp?.({
						name: String(data.get("name") ?? ""),
						email: String(data.get("email") ?? ""),
						password: String(data.get("password") ?? ""),
					})
				}}
			>
				<CardContent className="flex flex-col gap-3">
					<Field label="Name" name="name" required>
						<Input autoComplete="name" />
					</Field>
					<Field label="Work email" name="email" required>
						<Input type="email" autoComplete="email" placeholder="you@studio.com" />
					</Field>
					<Field label="Password" name="password" description="At least 12 characters." required>
						<Input type="password" autoComplete="new-password" minLength={12} />
					</Field>
				</CardContent>
				<CardFooter className="flex-col items-stretch gap-3">
					<Button type="submit" className="w-full">
						Create account
					</Button>
					<p className="text-center text-caption text-muted-foreground">
						Already have an account?{" "}
						<a href="/sign-in" className="text-foreground underline underline-offset-4 motion-interactive hover:text-muted-foreground">
							Sign in
						</a>
					</p>
				</CardFooter>
			</Form>
		</Card>
	)
}
