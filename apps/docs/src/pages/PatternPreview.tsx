import { Spinner } from "@sableui/react"
import { type ComponentType, lazy, Suspense } from "react"

/**
 * Bare full-page pattern renderer — no DocsShell. Served at `/preview/<slug>`
 * and embedded by the Patterns page in an iframe so shell patterns (AppShell,
 * skip links, #main-content) never nest inside the docs' own shell.
 */
const previews: Record<string, ComponentType> = {
	"dashboard-page": lazy(() =>
		import("@sableui/react/patterns").then((m) => ({ default: m.DashboardPage })),
	),
	"settings-page": lazy(() =>
		import("@sableui/react/patterns").then((m) => ({ default: m.SettingsPage })),
	),
	"auth-page": lazy(() =>
		import("@sableui/react/patterns").then((m) => ({ default: m.AuthPage })),
	),
	"list-detail-page": lazy(() =>
		import("@sableui/react/patterns").then((m) => ({ default: m.ListDetailPage })),
	),
	"feed-page": lazy(() =>
		import("@sableui/react/patterns").then((m) => ({ default: m.FeedPage })),
	),
	"landing-page": lazy(() =>
		import("@sableui/react/patterns").then((m) => ({ default: m.LandingPage })),
	),
	"brand-landing-page": lazy(() =>
		import("@sableui/react/patterns").then((m) => ({ default: m.BrandLandingPage })),
	),
	"chat-panel": lazy(() =>
		import("@sableui/react/patterns").then((m) => ({ default: m.ChatPanel })),
	),
}

export function PatternPreview({ slug }: { slug: string }) {
	const Preview = previews[slug]
	if (!Preview) {
		return (
			<div className="flex min-h-dvh items-center justify-center text-body-md text-muted-foreground">
				Unknown pattern: {slug}
			</div>
		)
	}
	return (
		<Suspense
			fallback={
				<div className="flex min-h-dvh items-center justify-center">
					<Spinner />
				</div>
			}
		>
			<Preview />
		</Suspense>
	)
}
