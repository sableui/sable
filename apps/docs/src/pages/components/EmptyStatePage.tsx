import { Button, EmptyState, Icon, emptyStateMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function EmptyStatePage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Empty State"
				lede={ledeFor(emptyStateMeta)}
			/>

			<Section
				title="With icon and action"
				description="Say what's empty, then offer the next step."
			>
				<Example className="justify-center">
					<EmptyState
						icon={<Icon name="info" />}
						title="No posts yet"
						description="Create your first."
						action={<Button>New post</Button>}
					/>
				</Example>
			</Section>

			<Section title="Title only">
				<Example className="justify-center">
					<EmptyState title="Nothing here yet" />
				</Example>
			</Section>

			<Section title="Page-level error" description="tone=&quot;destructive&quot; announces it; size=&quot;lg&quot; makes the title a heading; code shows the error figure.">
				<Example
					code={`<EmptyState tone="destructive" size="lg" code="404" title="Page not found"
  description="The page you are looking for has moved or never existed."
  action={<Button>Go home</Button>} />`}
				>
					<EmptyState
						tone="destructive"
						size="lg"
						code="404"
						title="Page not found"
						description="The page you are looking for has moved or never existed."
						action={<Button>Go home</Button>}
					/>
				</Example>
			</Section>

			<Section title="Error card" description="surface=&quot;card&quot; for a block that failed to load within a page.">
				<Example
					code={`<EmptyState tone="destructive" surface="card" title="Could not load this edition"
  description="Check your connection and try again."
  action={<Button variant="secondary">Retry</Button>} />`}
				>
					<EmptyState
						tone="destructive"
						surface="card"
						className="max-w-sm"
						title="Could not load this edition"
						description="Check your connection and try again."
						action={<Button variant="secondary">Retry</Button>}
					/>
				</Example>
			</Section>

			<MetaFooter meta={emptyStateMeta} />
		</>
	)
}
