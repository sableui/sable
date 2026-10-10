import { Button } from "../components/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/card"
import { Field, Form } from "../components/form"
import { Input } from "../components/input"
import { Separator } from "../components/separator"
import { Region, Stack } from "../layout"

// ---pattern-code---
export function AuthPage() {
	return (
		<main className="grid min-h-dvh place-items-center bg-background">
			<Region max="form" safeArea={["top", "bottom"]}>
				<Stack gap={3}>
					<Card>
						<CardHeader>
							{/* CardTitle carries the type; the h1 inside it is the page heading. */}
							<CardTitle>
								<h1>Sign in</h1>
							</CardTitle>
							<CardDescription>Welcome back — pick up where you left off.</CardDescription>
						</CardHeader>
						<CardContent>
							<Form onSubmit={(event) => event.preventDefault()}>
								<Field label="Email" required>
									<Input type="email" name="email" autoComplete="email" placeholder="you@example.com" />
								</Field>
								<Field label="Password" required>
									<Input type="password" name="password" autoComplete="current-password" />
								</Field>
								<Button type="submit" className="w-full">
									Sign in
								</Button>
								<Separator label="or" />
								<Button variant="outline" className="w-full">
									Continue with wallet
								</Button>
							</Form>
						</CardContent>
					</Card>
					<p className="text-center text-body-sm text-muted-foreground">
						No account?{" "}
						<a href="/signup" className="link-underline motion-interactive text-foreground">
							Create one
						</a>
					</p>
				</Stack>
			</Region>
		</main>
	)
}
