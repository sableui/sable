import { createHash } from "node:crypto"
import { existsSync, lstatSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, isAbsolute, join, relative, resolve } from "node:path"

const hash = content => createHash("sha256").update(content).digest("hex")

const RESOLVE = `node -p "require.resolve('@sableui/react/registry.json')"`
const CONTEXT = "From the target project's dependency context, run:"

/**
 * The entry as written at `root`. When Sable is a dependency of a workspace
 * package rather than of the root, a bare `require.resolve` from the root fails
 * (pnpm does not hoist it), so the entry names the package and resolves through it.
 */
function entryContent(source, projectPath) {
	if (!projectPath) return source
	if (!source.includes(RESOLVE) || !source.includes(CONTEXT)) throw new Error("The installed skill entry has an unexpected shape. Reinstall Sable.")
	return source
		.replace(CONTEXT, `Sable is installed in this repository's \`${projectPath}\` package. From the repository root, run:`)
		.replace(RESOLVE, `node -p "require.resolve('@sableui/react/registry.json', { paths: ['${projectPath}'] })"`)
}

/**
 * How the project runs its own installed `sable`, read from its lockfile. Never a
 * bare `npx sable`, which would fetch an unrelated public package when this one
 * is missing.
 */
export function packageManager(root, project) {
	for (let dir = resolve(project); ; dir = dirname(dir)) {
		if (existsSync(join(dir, "pnpm-lock.yaml"))) return "pnpm"
		if (existsSync(join(dir, "yarn.lock"))) return "yarn"
		if (existsSync(join(dir, "package-lock.json"))) return "npm"
		if (dir === resolve(root) || dirname(dir) === dir) break
	}
	return "npm"
}

const STOP_HOOK_MARKER = "sable check --stop-hook"
// Words both Git Bash and PowerShell 5.1 pass through literally once double-quoted.
const PORTABLE = /^[\w@./ -]+$/
const quoted = (s) => (/^[\w./-]+$/.test(s) ? s : `"${s}"`)

/**
 * How to run this project's `sable` from `root`. A workspace package is reached
 * through the package manager's own workspace flag, since its `sable` bin is not
 * on the root's path.
 */
function sableRunner({ root, project }) {
	const projectPath = relative(resolve(root), resolve(project)).replaceAll("\\", "/")
	const pm = packageManager(root, project)
	if (projectPath) {
		let name
		try { name = JSON.parse(readFileSync(join(project, "package.json"), "utf8")).name } catch { /* unnamed */ }
		if (typeof name === "string" && PORTABLE.test(name))
			return {
				pnpm: `pnpm --filter ${quoted(name)} exec sable`,
				yarn: `yarn workspace ${quoted(name)} sable`,
				npm: `npm exec --workspace ${quoted(name)} --no -- sable`,
			}[pm]
	}
	return { pnpm: "pnpm exec sable", yarn: "yarn sable", npm: "npm exec --no -- sable" }[pm]
}

/**
 * The Claude Code Stop hook that runs `sable check` before a task can end:
 * settings.json → hooks.Stop[] → { hooks: [{ type: "command", command }] }.
 * Stop takes no matcher. The command exits 2 with the failures on stderr, which
 * keeps Claude working and shows it what to fix (code.claude.com/docs/en/hooks).
 *
 * The command is one plain invocation with no shell syntax — no `cd`, no `&&`,
 * no "${CLAUDE_PROJECT_DIR}" — because Claude Code runs hooks under Git Bash or,
 * without it on Windows, PowerShell 5.1, which supports neither. `sable check
 * --stop-hook` reads CLAUDE_PROJECT_DIR from its environment instead, and
 * `--root` names the Sable package when the entries live at a repository root.
 * A workspace package is reached through sableRunner.
 */
export function claudeStopHook({ root, project = root }) {
	const projectPath = relative(resolve(root), resolve(project)).replaceAll("\\", "/")
	if (projectPath.startsWith("..") || isAbsolute(projectPath)) throw new Error("--root must be the project directory or one of its ancestors, such as the repository root.")
	if (projectPath && !PORTABLE.test(projectPath)) throw new Error(`Unsupported characters for a portable hook in the project path: ${projectPath}. Add the hook by hand.`)
	const command = `${sableRunner({ root, project })} check --stop-hook${projectPath ? ` --root ${quoted(projectPath)}` : ""}`
	const entry = { hooks: [{ type: "command", command, timeout: 300 }] }
	return { settingsFile: ".claude/settings.json", command, entry, settings: { hooks: { Stop: [entry] } }, installed: false }
}

/**
 * Write the Stop hook into `.claude/settings.json`, only when asked (`--hook`).
 * Merges into existing settings, keeps every other key and hook, refuses
 * settings it cannot parse rather than overwrite them, and adds nothing when a
 * Sable check hook is already there.
 */
export function installClaudeStopHook({ root, project = root, dryRun = false }) {
	const hook = claudeStopHook({ root, project })
	const path = join(root, hook.settingsFile)
	let current = root
	for (const part of hook.settingsFile.split("/")) {
		current = join(current, part)
		try { if (lstatSync(current).isSymbolicLink()) throw new Error(`Refusing a linked destination: ${hook.settingsFile}`) }
		catch (error) { if (error.code !== "ENOENT") throw error }
	}
	let settings = {}
	if (existsSync(path)) {
		try { settings = JSON.parse(readFileSync(path, "utf8")) }
		catch { throw new Error(`${hook.settingsFile} is not valid JSON; fix it or add the hook by hand.`) }
		if (!settings || typeof settings !== "object" || Array.isArray(settings)) throw new Error(`${hook.settingsFile} is not a JSON object.`)
	}
	const hooks = settings.hooks ?? {}
	if (typeof hooks !== "object" || Array.isArray(hooks)) throw new Error(`${hook.settingsFile} has a "hooks" value that is not an object.`)
	const stop = hooks.Stop ?? []
	if (!Array.isArray(stop)) throw new Error(`${hook.settingsFile} has a "hooks.Stop" value that is not an array.`)
	const alreadyPresent = stop.some((group) => (group?.hooks ?? []).some((h) => String(h?.command ?? "").includes(STOP_HOOK_MARKER)))
	if (!alreadyPresent && !dryRun) {
		const next = { ...settings, hooks: { ...hooks, Stop: [...stop, hook.entry] } }
		mkdirSync(dirname(path), { recursive: true })
		writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`)
	}
	return { ...hook, installed: true, alreadyPresent }
}

const BLOCK_BEGIN = "<!-- sable:begin"
const BLOCK_END = "<!-- sable:end -->"

/**
 * The always-loaded half of the setup. A skill loads only when the request
 * names it or its description matches, so "make me a pricing page" in a wired
 * app can skip it entirely: the agent sees Tailwind and a stylesheet and writes
 * its own Button and Modal on Sable's tokens. Project instructions (AGENTS.md
 * for Codex and Cursor, CLAUDE.md for Claude Code) are read on every task, so a
 * few lines there send every UI request through the skill.
 *
 * Short on purpose: it is in context for every task, UI or not, so it points at
 * the skill rather than restating it.
 */
export function instructionsBlock({ root, project = root }) {
	const projectPath = relative(resolve(root), resolve(project)).replaceAll("\\", "/")
	const sable = sableRunner({ root, project })
	const where = projectPath ? `The UI in \`${projectPath}\`` : "This app's UI"
	return [
		`${BLOCK_BEGIN} — managed by \`sable setup --agent\`; edit outside these markers -->`,
		"## Sable",
		"",
		`${where} is built with Sable (\`@sableui/react\`). For any UI work (a page, a component, styling, layout, theming, a fix), load the \`sable\` skill first: \`/sable\` in Claude Code and Cursor, \`$sable\` in Codex. Do this even when the request does not mention Sable.`,
		"",
		`- Build from the installed components, utilities and tokens: \`${sable} search "<need>"\` before writing a component. Never rebuild a control Sable ships.`,
		`- Before calling UI work done, run \`${sable} check\` and fix what fails.`,
		"- When `check` lists app-built components that Sable already ships (Adoption), show the user that list and ask before moving working screens onto Sable.",
		BLOCK_END,
	].join("\n")
}

/** The managed block in `text`, as [start, end) offsets, or null. */
function findBlock(text) {
	const start = text.indexOf(BLOCK_BEGIN)
	if (start === -1) return null
	const end = text.indexOf(BLOCK_END, start)
	if (end === -1) throw new Error("A Sable block in the project instructions has no end marker. Fix or remove it, then rerun setup.")
	return [start, end + BLOCK_END.length]
}

/**
 * Which project-instruction files carry the block, per host: AGENTS.md for
 * Codex and Cursor, CLAUDE.md for Claude Code. A CLAUDE.md that already imports
 * AGENTS.md (`@AGENTS.md`) gets the block through that import, not twice.
 */
function instructionFiles(root, target) {
	const agents = target === "all" || target === "codex" || target === "cursor"
	const claude = target === "all" || target === "claude"
	const files = agents ? ["AGENTS.md"] : []
	if (claude) {
		const claudePath = join(root, "CLAUDE.md")
		const imports = existsSync(claudePath) && /^@(?:\.\/)?AGENTS\.md\s*$/m.test(readFileSync(claudePath, "utf8"))
		if (!(agents && imports)) files.push("CLAUDE.md")
	}
	return files
}

/**
 * Install discoverable loaders; the installed package owns the actual workflow.
 *
 * `project` is where Sable is a dependency (the directory setup runs in); `root`
 * is where the agent entries go. They differ in a monorepo, where agents start at
 * the repository root but Sable belongs to one workspace package.
 */
export function installAgentSkill({ root, project = root, packageRoot, target = "all", update = false, dryRun = false, instructions = true }) {
	const reject = (message) => { throw new Error(message) }
	if (!["all", "codex", "claude", "cursor"].includes(target)) reject("Choose --target all, codex, claude, or cursor.")
	if (!existsSync(join(project, "package.json"))) reject("Run setup from a project with a package.json.")
	if (!existsSync(root) || !statSync(root).isDirectory()) reject(`--root is not a directory: ${root}`)
	const projectPath = relative(resolve(root), resolve(project)).replaceAll("\\", "/")
	if (projectPath.startsWith("..") || isAbsolute(projectPath)) reject("--root must be the project directory or one of its ancestors, such as the repository root.")
	if (/['"\\`]/.test(projectPath)) reject(`Unsupported characters in the project path: ${projectPath}`)
	const canonical = join(packageRoot, "skills/sable/SKILL.md")
	const entry = join(packageRoot, "skills/entry/SKILL.md")
	if (!existsSync(canonical) || !existsSync(entry)) reject("The installed package is missing its skill. Reinstall Sable.")
	const destinations = target === "all" ? [".agents/skills/sable", ".claude/skills/sable"]
		: [target === "claude" ? ".claude/skills/sable" : ".agents/skills/sable"]
	const receiptPath = ".sable/agent-setup.json"
	function checkPath(path) {
		let current = root
		for (const part of path.split("/")) {
			current = join(current, part)
			try { if (lstatSync(current).isSymbolicLink()) reject(`Refusing a linked destination: ${path}`) }
			catch (error) { if (error.code !== "ENOENT") throw error }
		}
	}
	checkPath(receiptPath)
	let receipt = { schemaVersion: 1, files: {} }
	if (existsSync(join(root, receiptPath))) {
		receipt = JSON.parse(readFileSync(join(root, receiptPath), "utf8"))
		if (receipt.schemaVersion !== 1 || !receipt.files || typeof receipt.files !== "object") reject("Invalid Sable setup receipt.")
	}
	const skill = entryContent(readFileSync(entry, "utf8"), projectPath)
	const files = destinations.flatMap(destination => [
		{ path: `${destination}/SKILL.md`, content: skill },
		...(destination.startsWith(".agents/") ? [{ path: `${destination}/agents/openai.yaml`, content: readFileSync(join(packageRoot, "skills/sable/agents/openai.yaml"), "utf8") }] : []),
	])
	// Preflight every host and the receipt before any writes; preserve local edits.
	for (const file of files) {
		checkPath(file.path)
		if (!existsSync(join(root, file.path))) continue
		const current = readFileSync(join(root, file.path), "utf8")
		if (current === file.content) continue
		if (!update || receipt.files[file.path] !== hash(current)) reject(`Existing skill differs at ${file.path}. Use --update for managed files; keep or move local edits before setup.`)
	}
	/* The block in AGENTS.md / CLAUDE.md. Only the text between its markers is
	 * Sable's; everything around it is the project's and is never touched. It
	 * follows the skill files' rule: an unchanged older block refreshes under
	 * --update, one with local edits refuses. */
	const block = instructions ? instructionsBlock({ root, project }) : null
	const instructionPaths = block ? instructionFiles(root, target) : []
	const edits = []
	for (const path of instructionPaths) {
		checkPath(path)
		const key = `${path}#sable`
		const current = existsSync(join(root, path)) ? readFileSync(join(root, path), "utf8") : null
		const eol = current?.includes("\r\n") ? "\r\n" : "\n"
		const ours = block.replaceAll("\n", eol)
		const found = current === null ? null : findBlock(current)
		if (found) {
			const existing = current.slice(...found)
			if (existing === ours) continue
			if (!update || receipt.files[key] !== hash(existing.replaceAll("\r\n", "\n"))) reject(`The Sable block in ${path} differs. Use --update to refresh it; keep local edits outside its markers.`)
			edits.push({ path, key, content: current.slice(0, found[0]) + ours + current.slice(found[1]) })
		} else if (current === null) edits.push({ path, key, content: `${block}\n` })
		else edits.push({ path, key, content: `${current.replace(/\s*$/, "")}${eol}${eol}${ours}${eol}` })
	}
	if (!dryRun) {
		for (const file of files) {
			mkdirSync(dirname(join(root, file.path)), { recursive: true })
			writeFileSync(join(root, file.path), file.content)
			receipt.files[file.path] = hash(file.content)
		}
		for (const edit of edits) {
			writeFileSync(join(root, edit.path), edit.content)
			receipt.files[edit.key] = hash(block)
		}
		mkdirSync(dirname(join(root, receiptPath)), { recursive: true })
		writeFileSync(join(root, receiptPath), JSON.stringify(receipt, null, 2) + "\n")
	}
	return { destination: destinations[0], destinations, root, project: projectPath || ".", files: files.map(file => file.path), instructions: instructionPaths, instructionsChanged: edits.map(edit => edit.path), dryRun, update, next: block
		? "Ask your agent for what you want to build or change, in plain words. It uses Sable on its own; /sable (Codex: $sable) names it explicitly."
		: "Use $sable build <your brief> in Codex or /sable build <your brief> in Claude Code or Cursor." }
}
