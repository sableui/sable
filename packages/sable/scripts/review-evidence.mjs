/** Review completeness is measurable; visual quality still requires a reviewer. */
import { createHash } from "node:crypto"
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs"
import { resolve } from "node:path"

export const DIMENSIONS = [
	"purpose-story", "hierarchy-type", "layout-rhythm", "color-material",
	"interaction", "motion", "responsive", "accessibility",
]
export const CHECKS = ["primary-flow", "keyboard", "overflow", "reduced-motion"]

/**
 * One filled example of each artifact shape, so the required fields are in the
 * template rather than discoverable only by submitting a review and reading the
 * errors. Ids and paths say `example`, the hash is a placeholder that matches no
 * file, and the validator rejects them until they are replaced with real
 * captures — a copied template cannot pass on its examples.
 */
export const EXAMPLE_ARTIFACTS = [
	{
		id: "example-wide",
		kind: "screenshot",
		path: "captures/example-wide.png",
		sha256: "replace-with-review.artifactHashes-after-inspecting-the-file",
		viewport: { width: 1440, height: 900 },
		state: "dashboard, loaded",
		colorMode: "light",
		motion: "full",
	},
	{
		id: "example-keyboard",
		kind: "report",
		path: "captures/example-keyboard.md",
		sha256: "replace-with-review.artifactHashes-after-inspecting-the-file",
		state: "checkout flow, keyboard only",
	},
]

export function reviewTemplate() {
	return {
		schemaVersion: 1,
		build: { name: "", brief: "", revision: "", sourceHash: "" },
		reviewer: { name: "", method: "agent" },
		artifacts: EXAMPLE_ARTIFACTS.map((artifact) => structuredClone(artifact)),
		dimensions: DIMENSIONS.map((id) => ({ id, status: "untested", observation: "", evidence: [] })),
		checks: CHECKS.map((id) => ({ id, status: "untested", observation: "", evidence: [] })),
		iterations: [],
		openIssues: [],
	}
}

const filled = (value) => typeof value === "string" && value.trim().length > 0
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value)

export function assessReview(review, { baseDir, sourceHash }) {
	const limitations = "Validates recorded evidence and review completeness. It does not inspect images or certify visual quality."
	if (review == null) return { status: "unreviewed", issues: ["No review supplied. Use sable grade --template."], limitations }
	const issues = []
	let revisions = false
	const issue = (message) => issues.push(message)
	if (!object(review)) return { status: "evidence-incomplete", issues: ["Review must be a JSON object."], limitations }
	if (review.schemaVersion !== 1) issue("schemaVersion must be 1.")
	if (!filled(review.build?.name) || !filled(review.build?.brief)) issue("build.name and build.brief are required.")
	if (review.build?.sourceHash !== sourceHash) issue("build.sourceHash must match the current graded sourceHash; recapture and review after source changes.")
	if (!filled(review.reviewer?.name) || !["human", "agent"].includes(review.reviewer?.method)) issue("reviewer needs a name and method (human or agent).")

	const artifacts = Array.isArray(review.artifacts) ? review.artifacts : []
	const artifactHashes = {}
	if (!artifacts.length) issue("Provide artifacts from the rendered build.")
	const byId = new Map()
	for (const artifact of artifacts) {
		if (!object(artifact) || !filled(artifact.id)) { issue("Every artifact needs an id."); continue }
		if (byId.has(artifact.id)) { issue(`Duplicate artifact id: ${artifact.id}.`); continue }
		let valid = true
		let resolvedPath
		const invalid = (message) => { issue(`Artifact ${artifact.id}: ${message}`); valid = false }
		if (!["screenshot", "recording", "report"].includes(artifact.kind)) invalid("kind must be screenshot, recording, or report.")
		if (!filled(artifact.state)) invalid("state is required.")
		if (!filled(artifact.path)) invalid("path is required.")
		else {
			const path = resolve(baseDir, artifact.path)
			try {
				if (!existsSync(path) || !statSync(path).isFile() || statSync(path).size === 0) invalid(`missing or empty file: ${artifact.path}.`)
				else {
					resolvedPath = realpathSync(path)
					if (process.platform === "win32") resolvedPath = resolvedPath.toLowerCase()
					const sha256 = createHash("sha256").update(readFileSync(path)).digest("hex")
					artifactHashes[artifact.id] = sha256
					if (artifact.sha256 !== sha256) invalid("sha256 must match the inspected file. See artifactHashes for current bytes; inspect changed artifacts before accepting a new hash.")
				}
			} catch { invalid(`cannot read file: ${artifact.path}.`) }
		}
		if (artifact.kind === "screenshot" || artifact.kind === "recording") {
			const { width, height } = artifact.viewport ?? {}
			if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) invalid("viewport needs positive integer width and height.")
			if (!["light", "dark"].includes(artifact.colorMode)) invalid("colorMode must be light or dark.")
			if (!["full", "reduced"].includes(artifact.motion)) invalid("motion must be full or reduced.")
		}
		byId.set(artifact.id, { ...artifact, valid, resolvedPath })
	}
	const validArtifacts = [...byId.values()].filter((artifact) => artifact.valid)
	const screenshots = validArtifacts.filter((artifact) => artifact.kind === "screenshot")
	if (!screenshots.some((artifact) => artifact.viewport.width >= 1024)) issue("Include a wide screenshot (viewport width >= 1024).")
	if (!screenshots.some((artifact) => artifact.viewport.width <= 480)) issue("Include a narrow screenshot (viewport width <= 480).")
	if (!validArtifacts.some((artifact) => artifact.motion === "reduced")) issue("Include evidence captured with reduced motion.")

	function evidence(ids, label) {
		if (!Array.isArray(ids) || !ids.length) { issue(`${label}: reference at least one artifact.`); return }
		for (const id of ids) if (!byId.get(id)?.valid) issue(`${label}: unknown or invalid artifact ${String(id)}.`)
	}
	function observations(entries, required, statuses, label) {
		const list = Array.isArray(entries) ? entries : []
		for (const id of required) {
			const matches = list.filter((entry) => object(entry) && entry.id === id)
			if (matches.length !== 1) { issue(`${label}: expected one ${id} observation.`); continue }
			const entry = matches[0]
			if (!statuses.includes(entry.status)) issue(`${label} ${id}: invalid status.`)
			if (entry.status === "untested") issue(`${label} ${id}: untested.`)
			if (entry.status === "revise" || entry.status === "fail") revisions = true
			if (!filled(entry.observation)) issue(`${label} ${id}: describe what was observed.`)
			evidence(entry.evidence, `${label} ${id}`)
		}
		for (const entry of list) if (!required.includes(entry?.id)) issue(`${label}: unknown id ${String(entry?.id)}.`)
	}
	observations(review.dimensions, DIMENSIONS, ["pass", "revise", "untested"], "Dimension")
	observations(review.checks, CHECKS, ["pass", "fail", "untested"], "Check")
	if (!Array.isArray(review.iterations)) issue("iterations must be an array; use [] if no revision was needed.")
	else for (const [index, iteration] of review.iterations.entries()) {
		if (!filled(iteration?.defect) || !filled(iteration?.action)) issue(`Iteration ${index + 1}: describe the defect and action.`)
		evidence(iteration?.before, `Iteration ${index + 1} before`)
		evidence(iteration?.after, `Iteration ${index + 1} after`)
		if (Array.isArray(iteration?.before) && Array.isArray(iteration?.after) && iteration.after.some((id) => iteration.before.includes(id))) issue(`Iteration ${index + 1}: before and after must use distinct captures.`)
		if (Array.isArray(iteration?.before) && Array.isArray(iteration?.after)) {
			const beforePaths = new Set(iteration.before.map((id) => byId.get(id)?.resolvedPath).filter(Boolean))
			if (iteration.after.some((id) => beforePaths.has(byId.get(id)?.resolvedPath))) issue(`Iteration ${index + 1}: before and after reference the same file; changing artifact ids does not create a new capture.`)
		}
	}
	if (!Array.isArray(review.openIssues)) issue("openIssues must be an array; use [] only when no issues remain.")
	else if (review.openIssues.length) revisions = true
	return {
		status: issues.length ? "evidence-incomplete" : revisions ? "revision-needed" : "review-recorded",
		issues,
		openIssues: review.openIssues ?? [],
		artifactHashes,
		limitations,
	}
}
