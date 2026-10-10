import { execFileSync } from 'node:child_process'
import { readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const cli = resolve(__dirname, '../../bin/sable.mjs')
const registry = JSON.parse(readFileSync(resolve(__dirname, '../../registry.json'), 'utf8'))
function retrieve(args: string[], cwd?: string) {
  try { return JSON.parse(execFileSync(process.execPath, [cli, ...args, '--json'], { cwd, encoding: 'utf8' })) }
  catch (error) { return JSON.parse(String((error as { stdout: string }).stdout)) }
}

describe('optional iOS target', () => {
  it('retrieves all semantic decisions from a consumer with no native package installed', () => {
    const consumer = mkdtempSync(join(tmpdir(), 'sable-ios-consumer-'))
    try {
      const result = retrieve(['target', 'ios'], consumer)
      expect(result.type).toBe('target')
      expect(Object.keys(result.data.components).sort()).toEqual(registry.components.map((c: { name: string }) => c.name).sort())
      expect(result.data.implementation.package).toBe('konsta')
      expect(result.data.implementation.install).toBe('pnpm add konsta')
    } finally { rmSync(consumer, { recursive: true, force: true }) }
  })
  it('keeps every control and content component as Sable', () => {
    for (const name of ['Switch', 'Input', 'Slider', 'SearchInput', 'Select', 'Checkbox', 'Toast', 'Card', 'Entity', 'Form', 'Dialog', 'Menu', 'Tabs']) {
      const decision = retrieve(['target', 'ios', '--component', name]).data
      expect(decision.strategy, name).toBe('preserve')
      expect(decision.importFrom, name).toBe('@sableui/react')
      expect(decision.components, name).toEqual([name])
    }
  })
  it('replaces only system chrome, and only with the Sable adapter', () => {
    expect(retrieve(['target', 'ios', '--component', 'BottomNav']).data.components).toEqual(['IosTabbar', 'IosTab'])
    expect(retrieve(['target', 'ios', '--component', 'Sheet']).data.components).toEqual(['IosSheet'])
    expect(retrieve(['target', 'ios', '--component', 'Workspace']).data.strategy).toBe('redesign')
    const map = retrieve(['target', 'ios']).data
    for (const decision of Object.values(map.components) as { strategy: string; importFrom: string | null; contexts?: { importFrom: string }[] }[]) {
      for (const candidate of [decision, ...(decision.contexts ?? [])]) expect(candidate.importFrom ?? '').not.toMatch(/konsta/)
      if (decision.strategy === 'replace') expect(decision.importFrom).toBe('@sableui/react/ios')
    }
  })
  it('rejects unknown targets and components with recoverable errors', () => {
    expect(retrieve(['target', 'android']).code).toBe('ERR_BAD_ARGUMENT')
    expect(retrieve(['target', 'ios', '--component']).code).toBe('ERR_BAD_ARGUMENT')
    const result = retrieve(['target', 'ios', '--component', 'Swich'])
    expect(result.code).toBe('ERR_UNKNOWN_COMPONENT')
    expect(result.suggestions).toContain('Switch')
  })
  it('chooses Button and PageHeader by role, defaulting to Sable', () => {
    for (const name of ['Button', 'PageHeader']) {
      const decision = retrieve(['target', 'ios', '--component', name]).data
      expect(decision.strategy).toBe('contextual')
      expect(decision.defaultContext).toBe('Everything else')
      expect(decision.contexts.find((c: { role: string }) => c.role === 'Everything else')).toMatchObject({ strategy: 'preserve', importFrom: '@sableui/react', components: [name] })
    }
  })
  it('keeps the iOS runtime optional and outside Sable core', () => {
    const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8'))
    for (const group of ['dependencies', 'optionalDependencies']) expect(pkg[group]?.konsta).toBeUndefined()
    expect(pkg.peerDependenciesMeta.konsta.optional).toBe(true)
    expect(pkg.exports['./ios'].default).toBe('./src/ios/index.ts')
    expect(readFileSync(resolve(__dirname, '../index.ts'), 'utf8')).not.toMatch(/from ["']\.\/ios/)
  })
})
