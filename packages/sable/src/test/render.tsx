import { render, type RenderOptions } from "@testing-library/react"
import type { ReactElement, ReactNode } from "react"
import { IconProvider } from "../icon"
import type { IconRenderProps } from "../icon"

/**
 * Test render helpers. Components reach for `<Icon>`, which needs an
 * `IconProvider` in the tree, so `renderWithProviders` wraps the UI in a
 * minimal test icon set. The set honors the same a11y contract a real set must:
 * a `title` makes the icon a labelled image; otherwise it is hidden from AT.
 */

export function testIconSet({
	name,
	title,
	className,
}: IconRenderProps): ReactNode {
	return (
		<span
			data-icon={name}
			className={className}
			role={title ? "img" : undefined}
			aria-label={title}
			aria-hidden={title ? undefined : true}
		/>
	)
}

function Providers({ children }: { children: ReactNode }) {
	return <IconProvider set={testIconSet}>{children}</IconProvider>
}

export function renderWithProviders(
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) {
	return render(ui, { wrapper: Providers, ...options })
}

// Re-export the library surface so tests import everything from one place.
export * from "@testing-library/react"
