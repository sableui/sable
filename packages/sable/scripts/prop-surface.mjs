/**
 * The props each exported component really accepts, read from its type.
 *
 * A meta's props table documents what Sable adds; it does not restate what a
 * component forwards to its Base UI root (`Toggle`'s `pressed`, `Combobox`'s
 * `filter`). `sable grade` judged props against the tables alone and reported
 * those forwarded props as hallucinated while `tsc` accepted them. The checker
 * resolves the forwarded types, so the grade's notion of "declared" can be the
 * compiler's.
 *
 * React's DOM attributes are left out: they would multiply the registry for no
 * signal, and the grade already treats the common ones as universal.
 *
 * Build-only. The installed package reads the result from registry.json.
 */
import { createRequire } from "node:module"
import { join } from "node:path"

export function collectPropSurface(pkgRoot) {
	const ts = createRequire(join(pkgRoot, "package.json"))("typescript")
	const configPath = ts.findConfigFile(pkgRoot, ts.sys.fileExists, "tsconfig.json")
	const config = ts.parseJsonConfigFileContent(ts.readConfigFile(configPath, ts.sys.readFile).config, ts.sys, pkgRoot)
	const entry = join(pkgRoot, "src", "index.ts")
	const program = ts.createProgram([entry], { ...config.options, noEmit: true })
	const checker = program.getTypeChecker()
	const moduleSymbol = checker.getSymbolAtLocation(program.getSourceFile(entry))
	const fromReactTypes = (decl) => /[\\/]@types[\\/]react[\\/]/.test(decl.getSourceFile().fileName)

	const items = {}
	for (const exported of checker.getExportsOfModule(moduleSymbol)) {
		if (!/^[A-Z]/.test(exported.name)) continue
		const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
		const decl = symbol.valueDeclaration ?? symbol.declarations?.[0]
		if (!decl) continue
		const [signature] = checker.getTypeOfSymbolAtLocation(symbol, decl).getCallSignatures()
		const propsParam = signature?.getParameters()[0]
		if (!propsParam) continue
		const propsType = checker.getTypeOfSymbolAtLocation(propsParam, decl)
		// A discriminated props union exposes only its shared keys as a whole;
		// every arm's keys are legitimate on the element.
		const names = new Set()
		for (const arm of propsType.isUnion() ? propsType.types : [propsType]) {
			for (const prop of checker.getPropertiesOfType(checker.getApparentType(arm))) {
				const decls = prop.declarations ?? []
				if (decls.length && decls.every(fromReactTypes)) continue
				names.add(prop.name)
			}
		}
		if (names.size) items[exported.name] = [...names].sort()
	}
	return Object.fromEntries(Object.entries(items).sort(([a], [b]) => a.localeCompare(b)))
}
