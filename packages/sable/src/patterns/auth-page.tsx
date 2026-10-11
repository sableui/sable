import { useState } from "react"
import { Avatar } from "../components/avatar"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Card, CardContent } from "../components/card"
import { Entity } from "../components/entity"
import { Field, Form } from "../components/form"
import { Input } from "../components/input"
import { Separator } from "../components/separator"
import { Region, Stack } from "../layout"
import { Icon } from "../icon"

// ---pattern-code---
// A soft mesh of the theme's decorative tones over its brand colour, so the
// artwork follows every theme and mode. Each tone is lifted from its text
// strength (dark, restrained) to an art strength.
const artwork = [
	// design-lint-disable-next-line inline-color -- relative colour derived from the theme's own --tone token, so it follows every look
	"radial-gradient(in oklab at 18% 22%, oklch(from var(--tone-info) clamp(0.5, calc(l + 0.16), 0.9) max(calc(c * 1.25), 0.1) h), transparent 58%)",
	// design-lint-disable-next-line inline-color -- relative colour derived from the theme's own --tone token, so it follows every look
	"radial-gradient(in oklab at 82% 18%, oklch(from var(--tone-collectible) clamp(0.5, calc(l + 0.16), 0.9) max(calc(c * 1.25), 0.1) h), transparent 55%)",
	// design-lint-disable-next-line inline-color -- relative colour derived from the theme's own --tone token, so it follows every look
	"radial-gradient(in oklab at 70% 88%, oklch(from var(--tone-edition) clamp(0.5, calc(l + 0.16), 0.9) max(calc(c * 1.25), 0.1) h), transparent 60%)",
	// design-lint-disable-next-line inline-color -- relative colour derived from the theme's own --tone token, so it follows every look
	"radial-gradient(in oklab at 12% 92%, oklch(from var(--tone-standard) clamp(0.5, calc(l + 0.16), 0.9) max(calc(c * 1.25), 0.1) h), transparent 55%)",
	"var(--primary)",
].join(", ")

export function AuthPage() {
	const [pending, setPending] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})

	return (
		<main className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
			<Region max="form" safeArea={["top", "bottom"]} className="flex flex-col">
				{/* safeArea owns the region's own padding, so the breathing room sits one level in. */}
				<Stack gap={0} className="flex-1 py-8 sm:py-10">
					<a href="/" className="flex items-center gap-2.5 self-start rounded-sm motion-interactive motion-press">
						{/* The same mark the app shell's sidebar and header carry. */}
						<Icon name="gem" variant="solid" className="text-2xl" />
						<span className="text-title-lg">Atelier</span>
					</a>

					<Stack gap={4} justify="center" className="flex-1 py-12">
						<Stack gap={1.5}>
							<h1 className="text-heading-1">Welcome back</h1>
							<p className="text-body-lg text-muted-foreground">
								Sign in to collect new releases and manage your editions.
							</p>
						</Stack>

						<Form
							className="gap-5"
							errors={errors}
							onFormSubmit={() => {
								setPending(true)
								// Replace with your auth call; a rejected sign-in comes back as a field error.
								setTimeout(() => {
									setPending(false)
									setErrors({ password: "That email and password don’t match. Try again or reset your password." })
								}, 900)
							}}
						>
							<Field label="Email" name="email" validate={(value) => (value ? null : "Enter your email address.")}>
								<Input type="email" autoComplete="email webauthn" placeholder="you@example.com" />
							</Field>
							<Stack gap={1.5}>
								<Field label="Password" name="password" validate={(value) => (value ? null : "Enter your password.")}>
									<Input type="password" autoComplete="current-password" />
								</Field>
								<a href="/forgot-password" className="hit-target self-end text-body-sm text-muted-foreground link-underline motion-interactive">
									Forgot password?
								</a>
							</Stack>
							<Button type="submit" size="cta" loading={pending} loadingLabel="Signing in" className="w-full">
								Sign in
							</Button>
						</Form>

						<Separator label="or" />

						<Stack gap={1.5}>
							<Button variant="outline" size="cta" className="w-full">
								Sign in with a passkey
							</Button>
							<Button variant="outline" size="cta" className="w-full">
								Connect a wallet
							</Button>
						</Stack>

						<p className="text-body-md text-muted-foreground">
							No account?{" "}
							<a href="/signup" className="hit-target link-underline motion-interactive text-foreground">
								Create one
							</a>
						</p>
					</Stack>

					<p className="text-body-xs text-muted-foreground">
						By signing in you agree to the{" "}
						<a href="/terms" className="link-underline motion-interactive">
							Terms
						</a>{" "}
						and{" "}
						<a href="/privacy" className="link-underline motion-interactive">
							Privacy Policy
						</a>
						.
					</p>
				</Stack>
			</Region>

			{/* The brand panel is decoration: on a phone the form is the whole screen. */}
			<aside aria-label="Featured release" className="hidden p-3 lg:flex">
				<div className="flex flex-1 flex-col justify-end rounded-xl p-8" style={{ background: artwork }}>
					<Card className="max-w-md">
						<CardContent>
							<Stack gap={3}>
								<Badge tone="edition" className="self-start">
									Edition of 50
								</Badge>
								<p className="text-title-lg">
									“Every edition is a conversation with whoever holds it next.”
								</p>
								<Entity
									className="p-0"
									leading={<Avatar fallback="MO" />}
									title="Mara Okafor"
									subtitle="Untitled (gold rush), 2026"
								/>
							</Stack>
						</CardContent>
					</Card>
				</div>
			</aside>
		</main>
	)
}
