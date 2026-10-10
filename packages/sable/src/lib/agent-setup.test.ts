import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
// @ts-expect-error Plain JS tool shipped with the CLI.
import { installAgentSkill } from "../../scripts/agent-setup.mjs"

let scratch: string
let root: string
let packageRoot: string
beforeEach(() => {
	scratch = mkdtempSync(join(tmpdir(), "sable-agent-test-"))
	root = join(scratch, "project")
	packageRoot = join(scratch, "package")
	mkdirSync(root)
	writeFileSync(join(root, "package.json"), "{}")
	mkdirSync(join(packageRoot, "skills/sable/agents"), { recursive: true })
	writeFileSync(join(packageRoot, "skills/sable/SKILL.md"), "packaged instructions")
	mkdirSync(join(packageRoot, "skills/entry"), { recursive: true })
	writeFileSync(join(packageRoot, "skills/entry/SKILL.md"), "Read installed skills/sable/SKILL.md")
	writeFileSync(join(packageRoot, "skills/sable/agents/openai.yaml"), "display_name: Sable")
})
afterEach(() => rmSync(scratch, { recursive: true, force: true }))
describe("agent setup", () => {
	it("installs shared entries and metadata for all hosts, preserves project instructions, and repeats safely", () => {
		writeFileSync(join(root, "AGENTS.md"), "project rules")
		installAgentSkill({ root, packageRoot })
		installAgentSkill({ root, packageRoot })
		expect(readFileSync(join(root, ".agents/skills/sable/agents/openai.yaml"), "utf8")).toContain("Sable")
		expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toBe("project rules")
		expect(readFileSync(join(root, ".agents/skills/sable/SKILL.md"), "utf8")).toBe("Read installed skills/sable/SKILL.md")
		expect(readFileSync(join(root, ".claude/skills/sable/SKILL.md"), "utf8")).toBe("Read installed skills/sable/SKILL.md")
	})
	it("performs no writes in dry-run mode", () => {
		installAgentSkill({ root, packageRoot, dryRun: true })
		expect(existsSync(join(root, ".agents"))).toBe(false)
		expect(existsSync(join(root, ".claude"))).toBe(false)
		expect(existsSync(join(root, ".sable"))).toBe(false)
	})
	it("refuses a changed file before copying any missing files", () => {
		mkdirSync(join(root, ".agents/skills/sable"), { recursive: true })
		writeFileSync(join(root, ".agents/skills/sable/SKILL.md"), "local rules")
		expect(() => installAgentSkill({ root, packageRoot })).toThrow("Existing skill differs")
		expect(existsSync(join(root, ".agents/skills/sable/agents"))).toBe(false)
		expect(existsSync(join(root, ".claude"))).toBe(false)
	})
	it("requires an update to refresh managed entries but preserves local edits even with update", () => {
		installAgentSkill({ root, packageRoot })
		writeFileSync(join(packageRoot, "skills/entry/SKILL.md"), "Read updated installed instructions")
		expect(() => installAgentSkill({ root, packageRoot })).toThrow("Existing skill differs")
		installAgentSkill({ root, packageRoot, update: true })
		expect(readFileSync(join(root, ".claude/skills/sable/SKILL.md"), "utf8")).toContain("updated")
		writeFileSync(join(root, ".claude/skills/sable/SKILL.md"), "My local rules")
		writeFileSync(join(packageRoot, "skills/entry/SKILL.md"), "Another version")
		expect(() => installAgentSkill({ root, packageRoot, update: true })).toThrow("Existing skill differs")
		expect(readFileSync(join(root, ".agents/skills/sable/SKILL.md"), "utf8")).toBe("Read updated installed instructions")
	})
	it("uses the same discovery directory for Codex and Cursor and supports Claude alone", () => {
		const codex = installAgentSkill({ root, packageRoot, target: "codex" })
		const cursor = installAgentSkill({ root, packageRoot, target: "cursor" })
		expect(cursor.destinations).toEqual(codex.destinations)
		expect(existsSync(join(root, ".claude"))).toBe(false)
		installAgentSkill({ root, packageRoot, target: "claude" })
		expect(existsSync(join(root, ".claude/skills/sable/SKILL.md"))).toBe(true)
	})
	it("does not copy canonical instructions that can become stale after an upgrade", () => {
		installAgentSkill({ root, packageRoot })
		writeFileSync(join(packageRoot, "skills/sable/SKILL.md"), "new workflow")
		installAgentSkill({ root, packageRoot })
		expect(readFileSync(join(root, ".agents/skills/sable/SKILL.md"), "utf8")).not.toContain("packaged instructions")
	})
	it("refuses a linked setup receipt before writing any host entry", () => {
		const outside = join(scratch, "outside")
		mkdirSync(outside)
		symlinkSync(outside, join(root, ".sable"), process.platform === "win32" ? "junction" : "dir")
		expect(() => installAgentSkill({ root, packageRoot })).toThrow("linked destination")
		expect(existsSync(join(root, ".agents"))).toBe(false)
	})
	it("refuses a destination junction instead of writing outside the project", () => {
		const outside = join(scratch, "outside")
		mkdirSync(outside)
		symlinkSync(outside, join(root, ".agents"), process.platform === "win32" ? "junction" : "dir")
		expect(() => installAgentSkill({ root, packageRoot })).toThrow("linked destination")
		expect(existsSync(join(outside, "skills"))).toBe(false)
	})
})
