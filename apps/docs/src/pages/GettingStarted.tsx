import { CodeBlock } from "@sableui/react"
import { PageHeader, Section } from "../components/docs-ui"

const AGENT_PROMPT = `Set up Sable in this React 19 and Tailwind CSS 4 project.
Install @sableui/react from npm with this project's package manager.
Read the installed package's AGENTS.md and registry.json consume block.
Configure React deduplication and the CSS imports and @source path for this project.
Use pnpm exec sable setup --agent to install the Sable skill.
Use the built-in icons first; no providers are required for a first Button.
Run pnpm exec sable doctor, then build and inspect the result.`

export function GettingStartedPage() {
	return <>
		<PageHeader title="Get started" lede="Install the package, connect your stylesheet, and render your first component. Use the same steps yourself or with a coding agent." />
		<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">
			Sable is on npm as @sableui/react. React 19, React DOM 19, and Tailwind CSS 4 are required.
		</p>
		<Section title="1. Install the package" description="Use your project's package manager; no registry setup or token is needed.">
			<CodeBlock code="pnpm add @sableui/react" />
		</Section>
		<Section title="2. Connect the stylesheet" description="The @source path is relative to this stylesheet. This example assumes src/styles.css and node_modules at the project root.">
			<CodeBlock filename="src/styles.css" code={'@import "tailwindcss";\n@import "@sableui/react/styles.css";\n@source "../node_modules/@sableui/react/dist/**/*.{js,mjs}";'} />
		</Section>
		<Section title="3. Configure your bundler" description="In a Vite project, keep your existing plugins and add React deduplication. Tailwind 4 must already be connected to your build.">
			<CodeBlock filename="vite.config.ts" code={'import { defineConfig } from "vite"\n\nexport default defineConfig({\n  // Keep your React and Tailwind plugins here.\n  resolve: { dedupe: ["react", "react-dom"] },\n})'} />
			<p className="text-body-md text-muted-foreground mt-4">Load Figtree and DM Mono through your font setup, or choose your own fonts with the theme tokens. Font files are not included in the component package.</p>
		</Section>
		<Section title="4. Render a component" description="Import the stylesheet in your entry file. Reicon icons work immediately; providers are optional.">
			<CodeBlock filename="src/App.tsx" code={'import { Button } from "@sableui/react"\nimport "./styles.css"\n\nexport default function App() {\n  return <Button>Save changes</Button>\n}'} />
			<CodeBlock className="mt-4" code="pnpm exec sable doctor" />
		</Section>
		<Section title="Build with an agent" description="Run setup from the project root. Codex and Cursor share an entry in .agents; Claude Code uses .claude. Each entry reads the installed package's maintained skill. Use --target to select a host and --dry-run to inspect without writing.">
			<CodeBlock code="pnpm exec sable setup --agent" />
			<CodeBlock className="mt-4" code="$sable build a workshop booking app" />
			<p className="text-body-md text-muted-foreground mt-4">Use /sable in Claude Code or Cursor. <a className="underline" href="/build-with-sable">Build with Sable</a> connects inspiration, Canvas presets, builds, and audits. To update both the library and skill:</p>
			<CodeBlock className="mt-4" code={'pnpm update @sableui/react --latest\npnpm exec sable setup --agent --update'} />
			<p className="text-body-md text-muted-foreground mt-4 mb-4">Or copy this setup prompt into your coding agent:</p>
			<CodeBlock code={AGENT_PROMPT} />
		</Section>
	</>
}
