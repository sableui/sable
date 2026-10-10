import { createHash } from "node:crypto"
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

const hash = content => createHash("sha256").update(content).digest("hex")

/** Install discoverable loaders; the installed package owns the actual workflow. */
export function installAgentSkill({ root, packageRoot, target = "all", update = false, dryRun = false }) {
	const reject = (message) => { throw new Error(message) }
	if (!["all", "codex", "claude", "cursor"].includes(target)) reject("Choose --target all, codex, claude, or cursor.")
	if (!existsSync(join(root, "package.json"))) reject("Run setup from a project with a package.json.")
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
	const files = destinations.flatMap(destination => [
		{ path: `${destination}/SKILL.md`, content: readFileSync(entry, "utf8") },
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
	if (!dryRun) {
		for (const file of files) {
			mkdirSync(dirname(join(root, file.path)), { recursive: true })
			writeFileSync(join(root, file.path), file.content)
			receipt.files[file.path] = hash(file.content)
		}
		mkdirSync(dirname(join(root, receiptPath)), { recursive: true })
		writeFileSync(join(root, receiptPath), JSON.stringify(receipt, null, 2) + "\n")
	}
	return { destination: destinations[0], destinations, files: files.map(file => file.path), dryRun, update, next: "Use $sable build <your brief> in Codex or /sable build <your brief> in Claude Code or Cursor." }
}
