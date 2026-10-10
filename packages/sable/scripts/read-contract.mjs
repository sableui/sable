/**
 * read-contract — lexically read a token array out of themes/_contract.ts.
 *
 * `_contract.ts` is the single source of truth for token names, and several build
 * scripts need it as plain data without importing TypeScript. Reading it as text
 * keeps them zero-dependency.
 *
 * Comments are stripped BEFORE extracting quoted names, because the contract
 * documents itself inline and a quoted phrase in a comment is not a token. That
 * was not theoretical: `// … See DESIGN.md → "Theme contract".` sits inside the
 * SEMANTIC_TOKENS literal and was being read as a token named `Theme contract`.
 * Harmless where the set is only ever tested for membership, and not harmless at
 * all once the set became the thing the registry is generated from.
 */

/** @param {string} source `_contract.ts` text. @param {string} name e.g. "SEMANTIC_TOKENS" */
export function readContractArray(source, name) {
	const start = source.indexOf(`${name} = [`)
	if (start === -1) throw new Error(`read-contract: could not find ${name}`)
	const end = source.indexOf("]", start)
	const body = source
		.slice(start, end)
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/(^|[^:])\/\/[^\n]*/g, "$1")
	return [...body.matchAll(/"([^"]+)"/g)].map((m) => m[1])
}

/** Motion token NAMES, as the registry stores them (bare) vs the contract (full). */
export function motionNamesFromRegistry(motion) {
	return [
		...(motion?.durations ?? []).map((d) => `motion-duration-${d}`),
		...(motion?.easings ?? []).map((e) => `motion-ease-${e}`),
		motion?.scale,
	].filter(Boolean)
}
