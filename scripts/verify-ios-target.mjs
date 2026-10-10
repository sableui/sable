import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

// The iOS target is Sable first: every control and content component stays
// Sable; only system chrome is replaced, and only by the Sable adapter.
const read = path => JSON.parse(readFileSync(path, 'utf8'))
const sable = read('packages/sable/package.json')
const map = read('packages/sable/targets/ios.json')
const registry = read('packages/sable/registry.json')
assert.deepEqual(Object.keys(map.components).sort(), registry.components.map(c => c.name).sort())
for (const group of ['dependencies', 'optionalDependencies']) assert(!sable[group]?.konsta, `No required Konsta in Sable ${group}`)
assert.equal(sable.peerDependenciesMeta.konsta.optional, true, 'Konsta is an optional peer')
const adapterExports = new Set(readFileSync('packages/sable/src/ios/index.ts', 'utf8').split(/\W+/))
const sableNames = new Set(registry.components.flatMap(c => [c.name, ...(c.subcomponents ?? []).map(s => s.name)]))
for (const decision of Object.values(map.components)) {
  for (const candidate of [decision, ...(decision.contexts ?? [])]) {
    assert(!/konsta/.test(candidate.importFrom ?? ''), `${decision.source} must not point at Konsta`)
    for (const component of candidate.components) {
      if (candidate.importFrom === '@sableui/react/ios') assert(adapterExports.has(component), `Adapter exports ${component}`)
      else assert(sableNames.has(component), `Sable component: ${component}`)
    }
  }
}
const invoke = (...args) => JSON.parse(execFileSync(process.execPath, ['packages/sable/bin/sable.mjs', ...args, '--json'], { encoding: 'utf8' }))
for (const name of ['Switch', 'Input', 'Slider', 'SearchInput', 'Toast', 'Card']) assert.equal(invoke('target', 'ios', '--component', name).data.strategy, 'preserve', `${name} stays Sable`)
assert.equal(invoke('target', 'ios', '--component', 'BottomNav').data.components[0], 'IosTabbar')
assert.equal(invoke('target', 'ios', '--component', 'Button').data.defaultContext, 'Everything else')
assert(invoke('manifest').data.commands.some(c => c.name === 'target'))
assert.throws(() => invoke('target', 'ios', '--component', 'MissingControl'), error => /ERR_UNKNOWN_COMPONENT/.test(String(error.stdout)), 'Unknown component fails with a recoverable error')
const kept = Object.values(map.components).filter(c => c.strategy === 'preserve').length
console.log(`Verified ${registry.components.length} decisions: ${kept} kept as Sable, chrome only from the adapter, no Konsta targets, CLI retrieval and errors, core dependency isolation.`)
