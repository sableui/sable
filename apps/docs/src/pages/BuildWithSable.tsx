import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Code,
	CodeBlock,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@sableui/react"
import { PageHeader, Section } from "../components/docs-ui"
import { COMMANDS, MODES, SECTIONS } from "../content/build-with-sable"
import { hrefFor } from "../lib/router"

/**
 * What setup writes into AGENTS.md and CLAUDE.md, as a pnpm app gets it: a
 * copy of instructionsBlock() in packages/sable/scripts/agent-setup.mjs.
 */
const INSTRUCTIONS_BLOCK = `<!-- sable:begin — managed by \`sable setup --agent\`; edit outside these markers -->
## Sable

This app's UI is built with Sable (\`@sableui/react\`). For any UI work (a page, a component, styling, layout, theming, a fix), load the \`sable\` skill first: \`/sable\` in Claude Code and Cursor, \`$sable\` in Codex. Do this even when the request does not mention Sable.

- Build from the installed components, utilities and tokens: \`pnpm exec sable search "<need>"\` before writing a component. Never rebuild a control Sable ships.
- Before calling UI work done, run \`pnpm exec sable check\` and fix what fails.
- When \`check\` lists app-built components that Sable already ships (Adoption), show the user that list and ask before moving working screens onto Sable.
<!-- sable:end -->`

/** sable check on an app an agent built without the skill. */
const ADOPTION_OUTPUT = `Adoption — low. 1 of 5 UI files compose Sable (1 distinct export); 4 app-built component(s) named for something Sable ships.
      This app has no component foundation besides Sable. Recommend moving the listed components onto Sable, behaviour first, and ask the user before changing working screens.
      src/components/Modal.tsx:1  Modal → Sable has Dialog (behaviour)
      src/components/PrimaryButton.tsx:1  PrimaryButton → Sable has Button (behaviour)
      src/components/SearchBar.tsx:1  SearchBar → Sable has SearchInput (behaviour)
      src/components/Tabs.tsx:1  Tabs → Sable has Tabs (behaviour)`

const FOUNDATIONS = [
	{ name: "None besides Sable", says: "Recommends the move plainly, a screen at a time. One-off components have nothing to preserve, and each is a focus or keyboard bug waiting." },
	{ name: "Its own primitives", says: "Offers the swaps and what each gains, and keeps yours where you prefer them, ideally rebuilt on Sable's behaviour." },
	{ name: "Another library", says: "Asks whether Sable replaces it or only covers new work, so one screen never mixes two control libraries." },
]

export function BuildWithSablePage() {
	return <>
		<PageHeader title="Build with Sable" lede="Describe what you want to make. Your agent builds it from Sable's components, tokens and design rules, checks it, and looks at the result before calling it done." />

		<Section id={SECTIONS.start.id} title={SECTIONS.start.title} description="A portfolio, store, booking service or app can start from a brief. Your idea decides the content and behaviour; Sable supplies the components, tokens and guidance.">
			<CodeBlock wrap highlight={false} code="/sable build a portfolio for a furniture designer, with projects, process notes, and a contact form" />
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">After sable init, plain requests work too: “add a pricing page” goes through Sable without naming it. /sable (Claude Code, Cursor) or $sable (Codex) just makes it explicit.</p>
		</Section>

		<Section id={SECTIONS.modes.id} title={SECTIONS.modes.title} description="Five modes cover a product's life. A plain request routes itself: a new brief is build, a follow-up is polish, one named defect is fix.">
			<Grid minItemWidth="20rem" track="fit" gap={2}>
				{MODES.map((mode) => (
					<Card key={mode.name}>
						<CardHeader>
							<CardTitle>/sable {mode.name}</CardTitle>
							<CardDescription>{mode.when}</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-3">
							<CodeBlock wrap highlight={false} code={mode.prompt} />
							<p className="text-body-sm text-muted-foreground">{mode.returns}</p>
						</CardContent>
					</Card>
				))}
			</Grid>
		</Section>

		<Section id={SECTIONS.unprompted.id} title={SECTIONS.unprompted.title} description="A skill loads only when a request names it, or when the agent decides it fits. Ask for “a pricing page” and an agent can skip it: it sees Tailwind and a stylesheet, writes its own Button and Modal, and puts Sable's tokens on them. The result looks nearly right and behaves like nothing in particular.">
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">So setup also writes a short block into AGENTS.md (Codex, Cursor) and CLAUDE.md (Claude Code), the files an agent reads on every task. Every UI request then goes through the skill, whether or not it says Sable.</p>
			<CodeBlock wrap highlight={false} filename="AGENTS.md" code={INSTRUCTIONS_BLOCK} />
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">sable init writes it, and sable upgrade adds it to an app set up before 0.18. Only the text between the markers is Sable's; your own instructions around it are never touched.</p>
		</Section>

		<Section id={SECTIONS.adoption.id} title={SECTIONS.adoption.title} description="An app can be wired for Sable and barely use it. sable check measures that as adoption: how many UI files compose Sable, and which of the app's own components do by hand what a Sable component already does.">
			<CodeBlock wrap highlight={false} filename="pnpm exec sable check src" code={ADOPTION_OUTPUT} />
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">It is never a failure, and your agent doesn't migrate on its own. In any mode, when adoption is low it shows you the swaps, controls and overlays first, says what each gains (“your Modal has no focus trap or Esc; Dialog has both”), and asks. Layout and look stay yours. How hard it pushes depends on what the app already stands on:</p>
			<Card>
				<CardContent flush>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>The app's foundation</TableHead>
								<TableHead>What your agent does</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{FOUNDATIONS.map((f) => (
								<TableRow key={f.name}>
									<TableCell className="whitespace-nowrap">{f.name}</TableCell>
									<TableCell>{f.says}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">Already have an app that's a mix? Update Sable, then say so. Your agent checks the app, lists what to swap, asks once, and moves it a screen at a time. It doesn't start a new build.</p>
			<CodeBlock code="pnpm exec sable upgrade" />
			<CodeBlock wrap highlight={false} code="Move this app onto Sable." />
		</Section>

		<Section id={SECTIONS.design.id} title={SECTIONS.design.title} description="Sable fixes behaviour, not layout. Controls, fields, overlays and anything with focus or keyboard handling always come from Sable. Parts such as Card, Entity, AspectBox and Badge are composed freely. Blocks, page shells and compositions such as MediaTile are references: your agent uses one when its layout fits the brief and composes its own from parts when it doesn't.">
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">Each brief names the product's signature surfaces, the one to three places its identity lives, like a shop's product card and search. Those are designed from the brief's direction; the rest takes Sable's defaults. Two shops built on Sable should not look alike.</p>
		</Section>

		<Section id={SECTIONS.inspire.id} title={SECTIONS.inspire.title} description="Bring images, websites or a description. Inspire studies the useful visual decisions and develops a reusable preset with a component preview. Its typography, surfaces, spacing and design notes can guide many different products.">
			<CodeBlock wrap highlight={false} code="/sable inspire these references into a warm, compact preset for a ceramics brand" />
		</Section>

		<Section id={SECTIONS.canvas.id} title={SECTIONS.canvas.title} description="Choose a preset in Canvas, adjust it on real Sable components, and check light and dark modes. Export it with a name and design notes, or import a preset your agent created.">
			<div>
				<Button variant="secondary" render={<a href={hrefFor("customize")} />}>Open Canvas</Button>
			</div>
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">Put the downloaded JSON file in your project's .sable/presets folder. It carries the full theme and the design guidance your agent reads.</p>
			<CodeBlock wrap highlight={false} code="/sable build a ceramics shop with collections and a cart, using .sable/presets/clay.json" />
		</Section>

		<Section id={SECTIONS.cli.id} title={SECTIONS.cli.title} description="The skill drives these through the CLI installed with the package, so the answers always match your version. You can run any of them yourself.">
			<Card>
				<CardContent flush>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Command</TableHead>
								<TableHead>What it does, and when</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{COMMANDS.map((command) => (
								<TableRow key={command.name} id={`cli-${command.name}`} className="scroll-mt-24">
									<TableCell className="whitespace-nowrap"><Code>sable {command.name}</Code></TableCell>
									{/* When sits under what it does: a third column left each
									    one a few words wide on a phone. */}
									<TableCell>
										<p>{command.does}</p>
										<p className="mt-1 text-muted-foreground">{command.when}</p>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">Run them through your package manager (pnpm exec sable, npm exec sable, yarn sable). Never a bare npx sable before the install: that fetches an unrelated package.</p>
		</Section>

		<Section id={SECTIONS.hook.id} title={SECTIONS.hook.title} description="In Claude Code, a Stop hook can run sable check before a task ends. While the check fails, Claude keeps working and sees what to fix. sable init offers it when you run it in a terminal; setup adds it with --hook.">
			<CodeBlock code="pnpm exec sable setup --agent --hook" />
		</Section>

		<Section id={SECTIONS.upgrade.id} title={SECTIONS.upgrade.title} description="The entry files and the instructions block read the workflow from your installed package. Updating Sable brings new components, contracts, guides and skill instructions together. Your project keeps its own presets and preferences.">
			<CodeBlock code="pnpm exec sable upgrade" />
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">It updates the package and runs the new version's init: skill and instructions refreshed, wiring checked. Coming from 0.17 or earlier, which has no upgrade command, do it once by hand: pnpm update @sableui/react --latest, then pnpm exec sable init.</p>
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">Every build retrieves Sable's component contracts, uses its supported variants and tokens, runs sable check, and looks at the working result. Your agent reports a library gap instead of recreating an available control, and is free to design its own layouts from Sable's parts.</p>
			<div>
				<Button variant="secondary" render={<a href={hrefFor("getting-started")} />}>Install and set up</Button>
			</div>
		</Section>

		<Section id={SECTIONS.mcp.id} title={SECTIONS.mcp.title} description="Sable's MCP server answers the same component, block, pattern and guide lookups as the CLI, with nothing installed first. Your agent can pass the version your project uses, so the answers match it.">
			<CodeBlock code="claude mcp add --transport http sable https://www.sableui.com/api/mcp" />
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">Cursor, VS Code and Codex take the same URL in their MCP settings. Once Sable is installed, the CLI in the package is quicker: it works offline and always matches your version.</p>
		</Section>
	</>
}
