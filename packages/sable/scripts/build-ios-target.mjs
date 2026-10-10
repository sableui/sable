import { readFileSync, writeFileSync } from 'node:fs'
import { decidedNames, targetRegistry } from './ios-component-map.mjs'

const source = JSON.parse(readFileSync(new URL('../registry.json', import.meta.url), 'utf8'))
const names = source.components.map(c => c.name).sort()
const stale = decidedNames.filter(n => !names.includes(n))
if (stale.length) throw new Error(`iOS decisions name components that no longer exist: ${stale}`)
const target = targetRegistry(names)
// Every Sable component a decision points at must exist (a subcomponent such as CardList counts).
const exported = new Set(source.components.flatMap(c => [c.name, ...(c.subcomponents ?? []).map(s => s.name)]))
for (const decision of Object.values(target.components)) {
  for (const candidate of [decision, ...(decision.contexts ?? [])]) {
    if (candidate.importFrom === '@sableui/react') for (const c of candidate.components) if (!exported.has(c)) throw new Error(`iOS decision for ${decision.source} names a missing Sable component: ${c}`)
  }
}
const path = new URL('../targets/ios.json', import.meta.url)
const output = JSON.stringify(target, null, 2) + '\n'
if (process.argv.includes('--check')) {
  if (readFileSync(path, 'utf8') !== output) throw new Error('iOS target is stale. Run node scripts/build-ios-target.mjs')
} else writeFileSync(path, output)
const kept = Object.values(target.components).filter(c => c.strategy === 'preserve').length
console.log(`iOS target: ${names.length} components — ${kept} kept as Sable, ${names.length - kept} chrome, role or phone decisions`)
