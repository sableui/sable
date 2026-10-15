import { CodeBlock } from "@sableui/react"
import { PageHeader, Section } from "../components/docs-ui"

const AGENT_PROMPT = `Set up Sable in this React 19 and Tailwind CSS 4 project.
Install @sableui/react from npm with this project's package manager.
Run pnpm exec sable init --dry-run, read what it will change, then run pnpm exec sable init.
Apply every step it prints as manual, in the file it names, then run pnpm exec sable doctor until it passes.
Read the installed package's AGENTS.md before building, then build and inspect the result.`

export function GettingStartedPage() {
	return <>
		<PageHeader title="Get started" lede="Install the package, let sable init wire it into your app, and render your first component. Use the same steps yourself or with a coding agent." />
		<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">
			Sable is on npm as @sableui/react. React 19, React DOM 19, and Tailwind CSS 4 are required.
		</p>
		<Section title="1. Install the package" description="Use your project's package manager; no registry setup or token is needed.">
			<CodeBlock code="pnpm add @sableui/react" />
		</Section>
		<Section title="2. Run sable init" description="From the app root. --dry-run lists every change first; nothing is written until you run it without the flag.">
			<CodeBlock code={'pnpm exec sable init --dry-run\npnpm exec sable init'} />
			<p className="text-body-md text-muted-foreground mt-4 max-w-(--measure-prose)">It reads your package manager from the lockfile and your framework from the project, installs what is missing (React, Tailwind and its build plugin), writes the stylesheet imports in order, adds React deduplication and the Tailwind plugin to a Vite config (a PostCSS config for Next.js), loads Figtree and DM Mono, mounts IconProvider in a Vite starter, installs the agent skill, and finishes with sable doctor.</p>
			<p className="text-body-md text-muted-foreground mt-4 max-w-(--measure-prose)">An edit it cannot make safely, such as a Next.js root layout or an unfamiliar config, is printed as a snippet with the file it belongs in. Vite and Next.js get every step; other setups get the packages and the stylesheet. In an app that is already set up, sable doctor --fix applies the same fixes to whatever doctor flags.</p>
		</Section>
		<Section title="3. Render a component" description="Import from the package root.">
			<CodeBlock filename="src/App.tsx" code={'import { Button } from "@sableui/react"\n\nexport default function App() {\n  return <Button>Save changes</Button>\n}'} />
		</Section>
		<Section title="Wiring it by hand" description="What sable init does, for setups it does not recognise or for checking its work. The @source path is relative to the stylesheet; this assumes src/styles.css and node_modules at the project root.">
			<CodeBlock filename="src/styles.css" code={'@import "tailwindcss";\n@import "@sableui/react/styles.css";\n@source "../node_modules/@sableui/react/dist/**/*.{js,mjs}";'} />
			<p className="text-body-md text-muted-foreground mt-4 max-w-(--measure-prose)">In a Vite project, keep your existing plugins, connect Tailwind, and add React deduplication. Import the stylesheet from your entry file.</p>
			<CodeBlock className="mt-4" filename="vite.config.ts" code={'import tailwindcss from "@tailwindcss/vite"\nimport { defineConfig } from "vite"\n\nexport default defineConfig({\n  plugins: [tailwindcss() /* , your other plugins */],\n  resolve: { dedupe: ["react", "react-dom"] },\n})'} />
			<p className="text-body-md text-muted-foreground mt-4 max-w-(--measure-prose)">Mount IconProvider once at the root: without it every icon renders nothing, including those inside Sable's components. Load Figtree and DM Mono through your font setup, or choose your own fonts with the theme tokens; font files are not included in the package.</p>
			<CodeBlock className="mt-4" filename="src/main.tsx" code={'import { IconProvider } from "@sableui/react"\nimport { reiconIconSet } from "@sableui/react/icons/reicon"\nimport "./styles.css"\n\n<IconProvider set={reiconIconSet}>\n  <App />\n</IconProvider>'} />
			<CodeBlock className="mt-4" code="pnpm exec sable doctor" />
		</Section>
		<Section title="Build with an agent" description="sable init installs the agent skill. Codex and Cursor share an entry in .agents; Claude Code uses .claude. Each entry reads the installed package's maintained skill. To install it on its own, run setup from the project root; --target selects a host and --dry-run inspects without writing.">
			<CodeBlock code="pnpm exec sable setup --agent" />
			<CodeBlock className="mt-4" code="$sable build a workshop booking app" />
			<p className="text-body-md text-muted-foreground mt-4">Use /sable in Claude Code or Cursor. <a className="underline" href="/build-with-sable">Build with Sable</a> connects inspiration, Canvas presets, builds, and audits. To update both the library and skill:</p>
			<CodeBlock className="mt-4" code={'pnpm update @sableui/react --latest\npnpm exec sable setup --agent --update'} />
			<p className="text-body-md text-muted-foreground mt-4 mb-4">Or copy this setup prompt into your coding agent:</p>
			<CodeBlock code={AGENT_PROMPT} />
		</Section>
	</>
}
