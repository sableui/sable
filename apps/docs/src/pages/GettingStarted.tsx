import { CodeBlock } from "@sableui/react"
import { PageHeader, Section } from "../components/docs-ui"
import { hrefFor } from "../lib/router"

/**
 * The install, upgrade and wire-by-hand page. Its markdown twin is
 * packages/sable/llms/tasks/getting-started.md, which keeps the same headings
 * in the same order: change one, change the other.
 */

const AGENT_PROMPT = `Set up Sable in this React project.
Install @sableui/react from npm with this project's package manager.
Run pnpm exec sable init --dry-run, read what it will change, then run pnpm exec sable init.
Apply every step it prints as manual, in the file it names, then run pnpm exec sable doctor until it passes.
Read the installed package's AGENTS.md before building, then build and inspect the result.`

const MAIN_TSX = `import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { IconProvider } from "@sableui/react"
import { reiconIconSet } from "@sableui/react/icons/reicon"
import App from "./App"
import "./styles.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IconProvider set={reiconIconSet}>
      <App />
    </IconProvider>
  </StrictMode>,
)`

const VITE_CONFIG = `import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { dedupe: ["react", "react-dom"] },
})`

export function GettingStartedPage() {
	return <>
		<PageHeader title="Get started" lede="Install the package, let sable init wire it into your app, and render your first component. Use the same steps yourself or with a coding agent." />
		<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">
			Sable is on npm as @sableui/react. It needs React 19 and Tailwind CSS 4; sable init installs whichever is missing.
		</p>
		<Section title="1. Install the package" description="Use your project's package manager; no registry setup or token is needed.">
			<CodeBlock code="pnpm add @sableui/react" />
		</Section>
		<Section title="2. Run sable init" description="From the app root. --dry-run lists every change first; nothing is written until you run it without the flag.">
			<CodeBlock code={'pnpm exec sable init --dry-run\npnpm exec sable init'} />
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">It reads your package manager from the lockfile and your framework from the project. It installs what is missing (React, Tailwind and its build plugin), writes the stylesheet imports in order, installs the agent skill with a short block in AGENTS.md and CLAUDE.md that sends every UI request through it, and finishes with sable doctor.</p>
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">In a Vite app it also adds the Tailwind plugin and React deduplication to the Vite config, adds the Figtree and DM Mono links to index.html, and wraps the starter's App in IconProvider. In a Next.js app it writes a PostCSS config and prints the providers file and font tags for you to paste: <a className="underline" href={hrefFor("nextjs")}>Next.js</a> has the whole layout. It does not add antialiasing, alternate theme CSS or the optional providers.</p>
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">Anything it cannot change safely, such as an unfamiliar config, is printed as a snippet with the file it belongs in. In an app that is already set up, sable doctor --fix applies the same fixes to whatever doctor flags.</p>
		</Section>
		<Section title="3. Render a component" description="Import from the package root.">
			<CodeBlock filename="src/App.tsx" code={'import { Button } from "@sableui/react"\n\nexport default function App() {\n  return <Button>Save changes</Button>\n}'} />
		</Section>
		<Section id="update" title="Update Sable" description="One command updates the package and your agent's setup together. It is safe on an app that already works.">
			<CodeBlock code="pnpm exec sable upgrade" />
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">It updates @sableui/react, then runs the new version's init: the skill entries and the AGENTS.md and CLAUDE.md block are refreshed and the wiring is checked. Coming from 0.17 or earlier, which has no upgrade command, do it once by hand:</p>
			<CodeBlock code={'pnpm update @sableui/react --latest\npnpm exec sable init'} />
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">If an agent built your UI without Sable's components, tell it to “move this app onto Sable”. It lists what to swap and asks before changing anything. <a className="underline" href={`${hrefFor("build-with-sable")}#adoption`}>How that works</a>.</p>
		</Section>
		<Section id="by-hand" title="Wire it by hand" description="What sable init does in a Vite app, for setups it does not recognise or for checking its work.">
			<CodeBlock code={'pnpm add @sableui/react\npnpm add -D tailwindcss @tailwindcss/vite'} />
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">The @source path is relative to the stylesheet; this one assumes src/styles.css with node_modules at the project root.</p>
			<CodeBlock filename="src/styles.css" code={'@import "tailwindcss";\n@import "@sableui/react/styles.css";\n@source "../node_modules/@sableui/react/dist/**/*.{js,mjs}";'} />
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">Connect Tailwind and add React deduplication, keeping your existing plugins.</p>
			<CodeBlock filename="vite.config.ts" code={VITE_CONFIG} />
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">Mount IconProvider once at the root: without it every icon renders nothing, including those inside Sable's components.</p>
			<CodeBlock filename="src/main.tsx" code={MAIN_TSX} />
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">Load Figtree and DM Mono in index.html, or choose your own fonts with the theme tokens; the package includes no font files.</p>
			<CodeBlock filename="index.html" code={'<link rel="preconnect" href="https://fonts.googleapis.com" />\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />\n<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Figtree:wght@300..900&display=swap" rel="stylesheet" />'} />
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">Then set up your agent and check the wiring:</p>
			<CodeBlock code={'pnpm exec sable setup --agent\npnpm exec sable doctor'} />
		</Section>
		<Section title="Build with an agent" description="sable init already set your agent up. Ask for what you want in plain words; Build with Sable covers the modes, presets and commands.">
			<p className="text-body-md text-muted-foreground max-w-(--measure-prose)">Starting from an empty project? Copy this setup prompt into your coding agent:</p>
			<CodeBlock code={AGENT_PROMPT} />
		</Section>
		<Section title="Where to go next" description="Short guides for the setups and problems that come up first.">
			<ul className="sable-list max-w-(--measure-prose)">
				<li><a className="underline" href={hrefFor("nextjs")}>Next.js</a>: the providers file, fonts and colour mode before first paint.</li>
				<li><a className="underline" href={hrefFor("color-mode")}>Colour mode and themes</a>: a dark default, the theme switcher, alternate theme CSS.</li>
				<li><a className="underline" href={hrefFor("troubleshooting")}>Troubleshooting</a>: unstyled, iconless, blank or wrong-theme pages.</li>
				<li><a className="underline" href={hrefFor("converting-an-app")}>Migrate an app</a>, including one built on shadcn/ui.</li>
				<li><a className="underline" href={hrefFor("build-with-sable")}>Build with Sable</a>: the agent modes, presets and the CLI.</li>
			</ul>
		</Section>
	</>
}
