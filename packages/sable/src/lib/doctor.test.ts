import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const cli = resolve(__dirname, '../../bin/sable.mjs')
function inspect(css: string, source = '<SableThemeProvider defaultThemeId="personal" />', extra: Record<string, string> = {}) {
  const root = mkdtempSync(join(tmpdir(), 'sable-doctor-'))
  try {
    mkdirSync(join(root, 'src'))
    writeFileSync(join(root, 'package.json'), JSON.stringify({ dependencies: { '@sableui/react': '0.65.0', react: '^19', 'react-dom': '^19', tailwindcss: '^4' } }))
    writeFileSync(join(root, 'src/styles.css'), css)
    writeFileSync(join(root, 'src/app.tsx'), source)
    for (const [path, text] of Object.entries(extra)) { mkdirSync(join(root, path, '..'), { recursive: true }); writeFileSync(join(root, path), text) }
    let output: string
    try { output = execFileSync(process.execPath, [cli, 'doctor', '--json'], { cwd: root, encoding: 'utf8' }) }
    catch (error) { output = String((error as { stdout: string }).stdout) }
    return JSON.parse(output).data
  } finally { rmSync(root, { recursive: true, force: true }) }
}
const imports = "@import 'tailwindcss';\n@import '@sableui/react/styles.css';\n@source '../node_modules/@sableui/react/dist/**/*.js';"

describe('doctor first-use consumer wiring', () => {
  it('follows local generated imports for workspace consumer CSS in source and dist modes', () => {
    for (const mode of ['src', 'dist']) {
      const css = `@import 'tailwindcss';\n@import './generated/sable.css';`
      const extra = { 'src/generated/sable.css': `@import '../../../../packages/sable/${mode}/styles.css';\n@import '../../../../packages/sable/${mode}/themes.css';\n@source '../../../../packages/sable/${mode}/**/*.js';` }
      expect(inspect(css, undefined, extra).failed).toBe(0)
      expect(inspect(css.split('\n').reverse().join('\n'), undefined, extra).checks.find((check: { name: string }) => check.name === 'css:order').status).toBe('fail')
    }
  })
  it('accepts single-quoted imports and a portable scoped preset', () => {
    expect(inspect(`${imports}\n[data-sable-theme="personal"] { --background: white; --primary: green; }`).failed).toBe(0)
  })
  it('does not demand alternate CSS for a color-mode provider on the Sable theme', () => {
    expect(inspect(imports, '<SableThemeProvider defaultPreference="light" />').failed).toBe(0)
  })
  it('still rejects a selected design theme without CSS', () => {
    expect(inspect(imports).checks.find((check: { name: string }) => check.name === 'themes').status).toBe('fail')
  })
  it('does not treat commented-out imports or theme definitions as wiring', () => {
    const report = inspect(`/* @import 'tailwindcss'; @import '@sableui/react/styles.css'; [data-sable-theme="personal"] { --background: white; } */`)
    expect(report.checks.find((check: { name: string }) => check.name === 'css:styles').status).toBe('fail')
    expect(report.checks.find((check: { name: string }) => check.name === 'themes').status).toBe('fail')
  })
  it('rejects reversed import order with either quote style', () => {
    const report = inspect("@import '@sableui/react/styles.css';\n@import 'tailwindcss';")
    expect(report.checks.find((check: { name: string }) => check.name === 'css:order').status).toBe('fail')
  })
  // Icons are opt-in: an app that renders Sable with no IconProvider gets every
  // icon — its own and those inside Sable's components — as nothing, silently.
  it('fails an app that imports Sable but mounts no IconProvider', () => {
    const icons = inspect(imports, 'import { Button } from "@sableui/react"\nexport const App = () => <Button>Go</Button>').checks.find((check: { name: string }) => check.name === 'icons')
    expect(icons.status).toBe('fail')
    expect(icons.detail).toBe('No <IconProvider> — every <Icon> renders nothing.')
    expect(icons.fix).toContain('@sableui/react/icons/reicon')
  })
  it('passes an app that mounts an IconProvider', () => {
    const source = 'import { Button, IconProvider } from "@sableui/react"\nimport { reiconIconSet } from "@sableui/react/icons/reicon"\nexport const App = () => <IconProvider set={reiconIconSet}><Button>Go</Button></IconProvider>'
    const report = inspect(imports, source)
    expect(report.checks.find((check: { name: string }) => check.name === 'icons').status).toBe('pass')
    expect(report.failed).toBe(0)
  })
  it('accepts a bundled alternate stylesheet', () => {
    expect(inspect(`${imports}\n@import '@sableui/react/theme/prism.css';`).failed).toBe(0)
  })
})
