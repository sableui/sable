import { Button, CodeBlock } from "@sableui/react"
import { PageHeader, Section } from "../components/docs-ui"
import { hrefFor } from "../lib/router"

export function BuildWithSablePage() {
	return <>
		<PageHeader title="Build with Sable" lede="Describe what you want to make. Use a preset to guide its design, then let your agent build with Sable's components and design rules." />
		<Section title="Start with your idea" description="A portfolio, store, booking service, or app can start directly from a brief. Your idea determines the content and behavior; Sable supplies reusable components, tokens, and guidance.">
			<CodeBlock code="$sable build a portfolio for a furniture designer, with projects, process notes, and a contact form" />
			<p className="mt-4 text-body-md text-muted-foreground">Use $sable in Codex or /sable in Claude Code and Cursor. The same four modes work across these agents.</p>
		</Section>
		<Section title="Develop a preset from inspiration" description="Bring images, websites, or a description. Inspire studies useful visual decisions and develops a reusable preset with a component preview. Its typography, surfaces, spacing, and design notes can guide many different products.">
			<CodeBlock code="$sable inspire these references into a warm, compact preset for a ceramics brand" />
		</Section>
		<Section title="Customize, preview, and save" description="Choose a preset in Canvas, adjust it on real Sable components, and check light and dark modes. Export it with a name and design notes, or import a preset your agent created.">
			<Button variant="secondary" render={<a href={hrefFor("customize")} />}>Open Canvas</Button>
			<p className="mt-4 text-body-md text-muted-foreground">Place the downloaded JSON file in your project's .sable/presets folder. The file carries the full theme and design guidance your agent will read.</p>
			<CodeBlock className="mt-4" code="$sable build a ceramics shop with collections and a cart, using .sable/presets/clay.json" />
		</Section>
		<Section title="Audit and polish an existing product" description="Audit inspects an existing interface and reports prioritized findings. Polish applies improvements and checks the affected states. An inspiration reference helps establish a direction; the product still follows your brief.">
			<CodeBlock code={'$sable audit our checkout and report design, usability, and accessibility findings\n$sable polish our checkout and fix the reported issues'} />
		</Section>
		<Section title="Keep the skill and library together" description="Setup installs small agent entry files that read the workflow from your installed package. Updating Sable brings updated components, contracts, guides, and skill instructions together. Your project keeps its own presets and preferences.">
			<CodeBlock code={'pnpm exec sable setup --agent\npnpm update @sableui/react --latest\npnpm exec sable setup --agent --update'} />
			<p className="mt-4 text-body-md text-muted-foreground">Every build must retrieve Sable's component contracts, use its supported variants and tokens, run design lint, and inspect the working result. Your agent should report a library gap instead of recreating an available control.</p>
			<Button className="mt-4" variant="secondary" render={<a href={hrefFor("getting-started")} />}>Install and set up</Button>
		</Section>
	</>
}
