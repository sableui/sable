import { Button, EmptyState } from "@sableui/react"
import { Component, type ReactNode, Suspense } from "react"

/**
 * Catches a page that throws — while loading its code or while rendering — so
 * one broken page shows a message with a way out instead of React unmounting
 * the whole site to a blank screen. The likeliest cause is a deploy since the
 * tab was opened (see lib/lazy-route.ts), which a reload fixes.
 */
export class RouteErrorBoundary extends Component<{ children: ReactNode }, { error: unknown }> {
	state = { error: null as unknown }

	static getDerivedStateFromError(error: unknown) {
		return { error }
	}

	componentDidCatch(error: unknown) {
		console.error("[sable-docs] page failed:", error)
	}

	render() {
		if (this.state.error == null) return this.props.children
		return (
			<EmptyState
				tone="destructive"
				size="lg"
				className="min-h-[50vh]"
				title="This page didn't load"
				description="Sable may have been updated since you opened this tab. Reloading gets the latest version."
				action={<Button onClick={() => window.location.reload()}>Reload</Button>}
			/>
		)
	}
}

/**
 * A route's lazy content: its loading fallback, and the boundary that catches
 * it failing. Keyed by the route, so moving to another page clears an error.
 */
export function RouteBoundary({ slug, fallback, children }: { slug: string; fallback: ReactNode; children: ReactNode }) {
	return (
		<RouteErrorBoundary key={slug}>
			<Suspense fallback={fallback}>{children}</Suspense>
		</RouteErrorBoundary>
	)
}
