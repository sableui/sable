import {
	StatusBar,
	StatusBarGroup,
	StatusBarSeparator,
	StatusDot,
	statusBarMeta,
} from "@sableui/react"
import { MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

function StatusBarDemo() {
	return (
		<div
			data-density="compact"
			className="overflow-hidden rounded-lg border border-border bg-panel"
		>
			{/* A stand-in for the canvas, not WorkspaceCanvas: that renders the page's
			    <main id="main-content">, and this demo already sits inside one. */}
			<div className="grid h-32 place-items-center bg-canvas text-ui-body text-muted-foreground">
				Canvas
			</div>
			<StatusBar>
				<span className="text-ui-num">2000 × 1500</span>
				<StatusBarSeparator />
				<span>3 layers</span>
				<StatusBarSeparator />
				<span>2 effects</span>
				<StatusBarGroup align="end">
					<StatusDot tone="success" />
					<span>Saved</span>
				</StatusBarGroup>
			</StatusBar>
		</div>
	)
}

export function StatusBarPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Status Bar" lede={ledeFor(statusBarMeta)} />

			<Section
				title="Live preview"
				description="Quiet facts about the document, like size, counts and save state."
			>
				<StatusBarDemo />
			</Section>

			<MetaFooter meta={statusBarMeta} />
		</>
	)
}
