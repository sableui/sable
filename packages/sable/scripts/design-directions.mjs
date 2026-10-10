#!/usr/bin/env node
/** Rendered art-direction comparison; declared variety is not an automated taste score. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { artifactMime, hasText, inspectArtifacts, parseFlags, portablePath, projectPath, sha256, validId, validateScope } from "./design-preferences.mjs"

export const AXES = ["composition", "typography", "density", "imagery", "story", "motion"]
const STRUCTURAL = ["composition", "density", "story"]
const normalize = (value) => String(value).trim().toLowerCase().replace(/\s+/g, " ")
export const directionTemplate = {
	schemaVersion: 1, id: "replace-with-exploration-id", scope: { kind: "project", value: "" },
	brief: { prompt: "", outcome: "", audience: "", mode: "persuade", contentConstraints: [""] },
	directions: ["direction-a", "direction-b", "direction-c"].map((id) => ({ id, title: "", axes: Object.fromEntries(AXES.map((axis) => [axis, ""])), rationale: "", artifacts: ["desktop", "mobile", "interaction"].map((kind) => ({ kind, path: "", sha256: "", description: "" })) })),
}

export function validateDirections(manifest, { root = process.cwd() } = {}) {
	if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return { errors: ["Exploration must be an object."], manifest: null }
	const errors = []
	if (manifest.schemaVersion !== 1) errors.push("schemaVersion must be 1.")
	if (!validId(manifest.id)) errors.push("id must be a lowercase hyphenated slug of at most 80 characters.")
	errors.push(...validateScope(manifest.scope))
	for (const key of ["prompt", "outcome", "audience"]) if (!hasText(manifest.brief?.[key])) errors.push(`brief.${key} must state the common brief for every direction.`)
	if (!["persuade", "operate", "read", "experience"].includes(manifest.brief?.mode)) errors.push("brief.mode must be persuade, operate, read, or experience.")
	if (!Array.isArray(manifest.brief?.contentConstraints) || !manifest.brief.contentConstraints.length || manifest.brief.contentConstraints.some((item) => !hasText(item))) errors.push("brief.contentConstraints must name the content and functional constraints held constant across directions.")
	const directions = Array.isArray(manifest.directions) ? manifest.directions : []
	if (directions.length < 3 || directions.length > 6) errors.push("Render between 3 and 6 directions before comparison.")
	const ids = directions.map((direction) => direction?.id)
	if (ids.some((id) => !validId(id) || id === "tie") || new Set(ids).size !== ids.length) errors.push("Direction ids must be unique slugs and cannot be tie.")
	const seen = new Set()
	let totalBytes = 0
	const sealed = directions.map((direction, index) => {
		for (const key of ["title", "rationale"]) if (!hasText(direction?.[key])) errors.push(`directions[${index}].${key} is required.`)
		for (const axis of AXES) if (!hasText(direction?.axes?.[axis])) errors.push(`directions[${index}].axes.${axis} must describe a concrete choice, including an intentional absence of motion or imagery.`)
		for (const kind of ["desktop", "mobile", "interaction"]) if (!direction?.artifacts?.some((item) => item?.kind === kind)) errors.push(`directions[${index}] needs a ${kind} artifact.`)
		const result = inspectArtifacts(direction?.artifacts, { root, requireHashes: true, seen, label: `directions[${index}].artifacts` })
		errors.push(...result.errors)
		for (const artifact of result.artifacts) totalBytes += readFileSync(projectPath(root, artifact.path)).length
		return { id: direction?.id, title: direction?.title, axes: direction?.axes, rationale: direction?.rationale, artifacts: result.artifacts }
	})
	if (totalBytes > 60 * 1024 * 1024) errors.push("Combined artifacts must be at most 60 MiB; resize screenshots or shorten recordings before comparison.")
	const diversity = []
	for (let left = 0; left < directions.length; left++) for (let right = left + 1; right < directions.length; right++) {
		const a = directions[left], b = directions[right]
		const changed = AXES.filter((axis) => hasText(a?.axes?.[axis]) && hasText(b?.axes?.[axis]) && normalize(a.axes[axis]) !== normalize(b.axes[axis]))
		const structural = changed.filter((axis) => STRUCTURAL.includes(axis))
		if (changed.length < 2 || structural.length === 0) errors.push(`${a?.id} / ${b?.id}: vary at least two declared axes, including composition, density, or story. Palette-only variants do not demonstrate direction diversity.`)
		diversity.push({ left: a?.id, right: b?.id, changedAxes: changed, structuralAxes: structural })
	}
	return { errors, manifest: { schemaVersion: 1, id: manifest.id, scope: manifest.scope, brief: manifest.brief, directions: sealed }, diversity, notice: "Checks verify declared variation and captured evidence, not perceived originality or design quality. A still interaction capture shows a state, not animation timing. Review the rendered alternatives before choosing." }
}

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char])
const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029")

/** Labels are deterministic for this exploration but omit titles and rationales until revealed. */
export function comparisonOrder(manifest) {
	return [...manifest.directions].sort((a, b) => sha256(`${manifest.id}:${a.id}`).localeCompare(sha256(`${manifest.id}:${b.id}`))).map((direction, index) => ({ label: String.fromCharCode(65 + index), direction }))
}

export function renderComparison(manifest, { root, sourcePath, sourceHash }) {
	const order = comparisonOrder(manifest)
	const captures = (direction, label, kind) => direction.artifacts.filter((artifact) => artifact.kind === kind).map((artifact) => {
		const bytes = readFileSync(projectPath(root, artifact.path))
		if (sha256(bytes) !== artifact.sha256) throw new Error(`Evidence changed while building comparison: ${artifact.path}`)
		const mime = artifactMime(bytes)
		const src = `data:${mime};base64,${bytes.toString("base64")}`
		const caption = `Direction ${label} · ${kind} capture`
		return `<figure>${mime.startsWith("video/") ? `<video controls muted playsinline preload="metadata" aria-label="${escapeHtml(caption)}"><source src="${src}" type="${mime}"></video>` : `<img src="${src}" alt="${escapeHtml(caption)}" loading="lazy">`}<figcaption>${escapeHtml(caption)}</figcaption></figure>`
	}).join("")
	const cards = order.map(({ label, direction }) => `<article aria-labelledby="label-${label}"><h2 id="label-${label}">Direction ${label}</h2>${captures(direction, label, "desktop")}<details><summary>Mobile and interaction evidence for ${label}</summary>${captures(direction, label, "mobile")}${captures(direction, label, "interaction")}</details></article>`).join("")
	const rationales = order.map(({ label, direction }) => `<section><h3>${label}: ${escapeHtml(direction.title)}</h3><p>${escapeHtml(direction.rationale)}</p><dl>${AXES.map((axis) => `<dt>${axis}</dt><dd>${escapeHtml(direction.axes[axis])}</dd>`).join("")}</dl><h4>Capture notes</h4><ul>${direction.artifacts.map((artifact) => `<li>${escapeHtml(artifact.kind)}: ${escapeHtml(artifact.description)}</li>`).join("")}</ul></section>`).join("")
	const payload = { id: manifest.id, scope: manifest.scope, brief: manifest.brief.prompt, options: order.map(({ label, direction }) => ({ label, id: direction.id, artifacts: direction.artifacts })), source: { kind: "comparison", reference: sourcePath, sha256: sourceHash } }
	const script = `const data = JSON.parse(document.getElementById('comparison-data').textContent);
document.getElementById('judgment').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const values = new FormData(form);
  const label = values.get('choice');
  const choice = label === 'tie' ? 'tie' : data.options.find(option => option.label === label).id;
  const now = new Date();
  const record = {schemaVersion:1, id:data.id.slice(0,48)+'-'+now.toISOString().replace(/[^0-9]/g,''), scope:data.scope, brief:data.brief, options:data.options.map(({label,...option})=>option), choice, reviewer:{kind:values.get('kind'),name:values.get('name').trim()}, rationale:values.get('rationale').trim(),date:now.toISOString().slice(0,10),source:data.source};
  if (!record.reviewer.name || !record.rationale) {document.getElementById('status').textContent='Enter your name and a concrete reason before exporting.'; return;}
  const blob = new Blob([JSON.stringify(record,null,2)+'\\n'], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href=url; link.download=record.id+'.json'; link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  document.getElementById('status').textContent='Preference JSON downloaded. Nothing has been saved to Sable memory. Move it into the project, then run: sable prefer --record '+record.id+'.json';
});`
	const scriptHash = sha256(Buffer.from(script))
	const cspHash = Buffer.from(scriptHash, "hex").toString("base64")
	return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; media-src data:; style-src 'unsafe-inline'; script-src 'sha256-${cspHash}'; form-action 'none'; base-uri 'none'"><title>Rendered direction comparison</title><style>
:root{color-scheme:light dark;font-family:system-ui,sans-serif;background:Canvas;color:CanvasText;line-height:1.55}*{box-sizing:border-box}body{margin:0}main{max-width:1600px;margin:auto;padding:clamp(16px,4vw,56px)}h1{font-size:clamp(1.8rem,4vw,3rem);line-height:1.1;max-width:24ch}h2,h3{line-height:1.25}p,li{max-width:80ch}.comparison{display:grid;grid-template-columns:repeat(${Math.min(order.length, 3)},minmax(0,1fr));gap:24px;align-items:start;margin-block:32px}article{min-width:0}figure{margin:0 0 20px}img,video{display:block;width:100%;height:auto;border:1px solid GrayText}figcaption{font-size:.85rem;margin-top:8px;overflow-wrap:anywhere}details{border-block:1px solid GrayText;padding-block:12px;margin-block:20px}summary{cursor:pointer;padding:8px 0;font-weight:600}details section{margin-block:24px}dl{display:grid;grid-template-columns:8rem 1fr;gap:8px}dt{font-weight:600}dd{margin:0}form{max-width:760px}fieldset{padding:16px;margin:16px 0;border:1px solid GrayText}legend{font-weight:600}.choices{display:flex;flex-wrap:wrap;gap:12px}.choices label{display:flex;align-items:center;gap:8px;padding:12px;border:1px solid GrayText;cursor:pointer}label.field{display:grid;gap:8px;margin-block:20px}input,select,textarea,button{font:inherit}input,select,textarea{padding:12px;min-width:0;border:1px solid GrayText;border-radius:0;background:Field;color:FieldText}textarea{min-height:120px;resize:vertical}button{padding:12px 24px;cursor:pointer;background:ButtonFace;color:ButtonText;border:2px solid ButtonText}a:focus-visible,button:focus-visible,summary:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid Highlight;outline-offset:4px}code{overflow-wrap:anywhere}#status{min-height:3em}.notice{border-left:3px solid GrayText;padding-left:16px}@media(max-width:900px){.comparison{grid-template-columns:1fr}article{max-width:760px}dl{grid-template-columns:1fr}dd{margin-bottom:8px}}
</style></head><body><main><header><p>Sable · rendered exploration</p><h1>Compare the directions</h1><p>${escapeHtml(manifest.brief.prompt)}</p><p><strong>Outcome:</strong> ${escapeHtml(manifest.brief.outcome)} <strong>Audience:</strong> ${escapeHtml(manifest.brief.audience)}</p><ul>${manifest.brief.contentConstraints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><p class="notice">Review the visual evidence before revealing the rationale. Labels are stable within this comparison. Still captures show states; they do not establish animation timing or prove that an interaction works.</p></header><div class="comparison">${cards}</div><details><summary>Reveal direction names and rationale</summary>${rationales}</details><section aria-labelledby="judgment-title"><h2 id="judgment-title">Record a contextual judgment</h2><p>This choice applies to <strong>${escapeHtml(manifest.scope.kind)}: ${escapeHtml(manifest.scope.value)}</strong>. An agent decision remains an agent observation. This page downloads a record; it does not save anything to Sable automatically.</p><form id="judgment"><fieldset><legend>Which direction best serves this brief?</legend><div class="choices">${order.map(({ label }) => `<label><input type="radio" name="choice" value="${label}" required>Direction ${label}</label>`).join("")}<label><input type="radio" name="choice" value="tie" required>Tie / no preference</label></div></fieldset><label class="field">Reviewer type<select name="kind" required><option value="">Choose explicitly</option><option value="human">Human judgment</option><option value="agent">Agent observation</option></select></label><label class="field">Reviewer name<input name="name" autocomplete="name" required maxlength="200"></label><label class="field">Reason and context<textarea name="rationale" required maxlength="10000" placeholder="Explain which visible relationships serve this audience, and any tradeoff or limitation."></textarea></label><button type="submit">Download preference JSON</button><p id="status" role="status" aria-live="polite"></p></form><p>Move the downloaded JSON into your project, then run <code>sable prefer --record &lt;downloaded-file.json&gt;</code>. Original evidence paths and hashes remain bound to the project that generated this comparison.</p></section></main><script id="comparison-data" type="application/json">${safeJson(payload)}</script><script>${script}</script></body></html>`
}

function main() {
	const flags = parseFlags(process.argv.slice(2), ["--check", "--compare"], ["--template", "--json", "--help"])
	if (["--check", "--compare", "--template"].filter((key) => flags.has(key)).length !== 1 && !flags.has("--help")) throw new Error("Choose one action: --template, --check <file.json>, or --compare <file.json>.")
	if (flags.has("--help")) { process.stdout.write("sable explore — compare rendered art directions\n  --template | --check <file.json> | --compare <file.json>\n  --json\nRun from the project root. Render at least three directions, changing at least two declared axes including composition, density, or story. Every direction needs desktop, mobile, and interaction evidence with SHA-256 hashes. Checks establish evidence integrity and declared variety; they cannot judge visual quality. Comparison pages are local, anonymous until rationale is revealed, and export explicitly attributed preference JSON.\n"); return }
	if (flags.has("--template")) { process.stdout.write(`${JSON.stringify(flags.has("--json") ? { type: "explore.template", data: directionTemplate } : directionTemplate, null, 2)}\n`); return }
	const root = process.cwd()
	const file = projectPath(root, flags.get("--check") ?? flags.get("--compare"))
	const result = validateDirections(JSON.parse(readFileSync(file, "utf8")), { root })
	if (result.errors.length) throw new Error(result.errors.join("\n"))
	if (flags.has("--check")) { process.stdout.write(`${JSON.stringify({ type: "explore.check", data: { id: result.manifest.id, directions: result.manifest.directions.length, diversity: result.diversity, notice: result.notice } }, null, 2)}\n`); return }
	const directory = projectPath(root, ".sable/comparisons", { existing: false })
	mkdirSync(directory, { recursive: true })
	const sourcePath = `.sable/comparisons/${result.manifest.id}.manifest.json`
	const manifestPath = projectPath(root, sourcePath, { existing: false })
	const htmlPath = projectPath(root, `.sable/comparisons/${result.manifest.id}.html`, { existing: false })
	if (existsSync(manifestPath) || existsSync(htmlPath)) throw new Error(`Comparison ${result.manifest.id} already exists. Use a new id for an iteration so previous judgments retain their evidence.`)
	const source = `${JSON.stringify(result.manifest, null, 2)}\n`
	const html = renderComparison(result.manifest, { root, sourcePath, sourceHash: sha256(source) })
	writeFileSync(manifestPath, source, { flag: "wx" })
	writeFileSync(htmlPath, html, { flag: "wx" })
	process.stdout.write(`${JSON.stringify({ type: "explore.comparison", data: { id: result.manifest.id, path: portablePath(root, htmlPath), manifest: sourcePath, labels: comparisonOrder(result.manifest).map(({ label }) => label), notice: "Open this local HTML file. Review evidence and export a judgment with an explicit reviewer type. Nothing is inferred or saved to preference memory until sable prefer --record is run." } }, null, 2)}\n`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try { main() } catch (error) { process.stderr.write(`${JSON.stringify({ type: "error", code: "ERR_EXPLORATION_INVALID", message: error.message })}\n`); process.exitCode = 1 }
}
