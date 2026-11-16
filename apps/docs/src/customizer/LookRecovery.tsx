import { Button, EmptyState } from "@sableui/react"
import { Component, Fragment, type ReactNode } from "react"
import { SHARE_PARAMS } from "./look"

/** Everything the site reads at startup that a visitor (or an old build) may have left malformed. */
const LOOK_KEYS = ["sable-docs-look", "sable-docs-look-previous"]

/**
 * The outermost boundary, around the theme and customizer providers. Those sit
 * above every route, so a throw while reading a saved look or a share link
 * (`?shadows=bogus`, a value renamed since it was saved) used to blank every
 * page — and the bad value survived a reload, because the effect that clears
 * the address bar never ran.
 *
 * The first failure clears the saved look and the share params, then mounts
 * the providers again from a clean slate. If that fails too, the error is not
 * the look's: say so, with a reload, instead of looping.
 */
export class LookRecovery extends Component<{ children: ReactNode }, { error: unknown; attempt: number }> {
	state = { error: null as unknown, attempt: 0 }

	static getDerivedStateFromError(error: unknown) {
		return { error }
	}

	componentDidCatch(error: unknown) {
		console.error("[sable-docs] the site failed to start:", error)
		if (this.state.attempt > 0) return
		try {
			for (const key of LOOK_KEYS) window.localStorage.removeItem(key)
		} catch {
			/* storage unavailable: nothing saved to clear */
		}
		const url = new URL(window.location.href)
		for (const name of SHARE_PARAMS) url.searchParams.delete(name)
		window.history.replaceState(window.history.state, "", url)
		this.setState({ error: null, attempt: 1 })
	}

	render() {
		if (this.state.error == null) return <ErrorKey attempt={this.state.attempt}>{this.props.children}</ErrorKey>
		return (
			<EmptyState
				tone="destructive"
				size="lg"
				className="min-h-dvh"
				title="Sable's docs didn't start"
				description="Your saved Customize look has been cleared. Reloading usually fixes this; if it doesn't, Sable may have been updated since you opened this tab."
				action={<Button onClick={() => window.location.reload()}>Reload</Button>}
			/>
		)
	}
}

/** Re-keys the providers so a recovery mounts them fresh: their initial state re-reads storage and the URL. */
function ErrorKey({ attempt, children }: { attempt: number; children: ReactNode }) {
	return <Fragment key={attempt}>{children}</Fragment>
}
