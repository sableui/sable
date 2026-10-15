import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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

/* doctor --fix and init, against starter-shaped apps. Installs are never run
 * here (--no-install); the install path reports the command instead. */
function starter(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), 'sable-fix-'))
  for (const [path, text] of Object.entries(files)) { mkdirSync(join(root, path, '..'), { recursive: true }); writeFileSync(join(root, path), text) }
  return root
}
function sable(root: string, args: string[]) {
  let output: string
  try { output = execFileSync(process.execPath, [cli, ...args, '--json'], { cwd: root, encoding: 'utf8' }) }
  catch (error) { output = String((error as { stdout: string }).stdout) }
  return JSON.parse(output)
}
const read = (root: string, path: string) => readFileSync(join(root, path), 'utf8')
const viteDeps = { dependencies: { '@sableui/react': '^0.11.0', react: '^19.1.0', 'react-dom': '^19.1.0' }, devDependencies: { vite: '^7.0.0', '@vitejs/plugin-react': '^5.0.0', tailwindcss: '^4.1.0', '@tailwindcss/vite': '^4.1.0' } }
const viteApp = (extra: Record<string, string> = {}) => starter({
  'package.json': JSON.stringify(viteDeps),
  'pnpm-lock.yaml': '',
  'vite.config.ts': "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})\n",
  'index.html': '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>\n',
  'src/main.tsx': "import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport './index.css'\nimport App from './App.tsx'\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)\n",
  'src/index.css': ':root {\n  font-family: system-ui;\n}\n',
  'src/App.tsx': 'import { Button } from "@sableui/react"\nexport default function App() { return <Button>Go</Button> }\n',
  ...extra,
})
type Fix = { check: string; status: string; file?: string; snippet?: string }
const fix = (data: { fixes: Fix[] }, check: string) => data.fixes.find((f) => f.check === check)

describe('doctor --fix', () => {
  it('wires a Vite starter: imports in order, Tailwind plugin, dedupe, fonts and IconProvider, then passes', () => {
    const root = viteApp()
    try {
      const { type, data } = sable(root, ['doctor', '--fix', '--no-install'])
      expect(type).toBe('doctor.fix')
      expect(data.failed).toBe(0)
      expect(data.fixes.every((f: Fix) => f.status === 'applied')).toBe(true)
      expect(read(root, 'src/index.css')).toMatch(/^@import "tailwindcss";\n@import "@sableui\/react\/styles\.css";\n@source "\.\.\/node_modules\/@sableui\/react\/dist\/\*\*\/\*\.\{js,mjs\}";\n:root/)
      const config = read(root, 'vite.config.ts')
      expect(config).toContain("import tailwindcss from '@tailwindcss/vite'")
      expect(config).toContain('plugins: [tailwindcss(), react()]')
      expect(config).toContain("resolve: { dedupe: ['react', 'react-dom'] }")
      expect(read(root, 'index.html')).toContain('family=DM+Mono')
      const main = read(root, 'src/main.tsx')
      expect(main).toContain('<IconProvider set={reiconIconSet}>\n      <App />\n    </IconProvider>')
      expect(main).toContain("import { reiconIconSet } from '@sableui/react/icons/reicon'")
      // Idempotent: a second run finds nothing left to do.
      expect(sable(root, ['doctor', '--fix', '--no-install']).data.fixes).toEqual([])
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
  it('writes nothing with --dry-run, and reports what it would change', () => {
    const root = viteApp()
    const files = ['vite.config.ts', 'src/index.css', 'src/main.tsx', 'index.html']
    try {
      const before = files.map((f) => read(root, f))
      const { data } = sable(root, ['doctor', '--dry-run'])
      expect(data.dryRun).toBe(true)
      expect(data.fixes.length).toBeGreaterThan(0)
      expect(data.fixes.every((f: Fix) => f.status === 'would-apply')).toBe(true)
      expect(data.failed).toBeGreaterThan(0)
      expect(files.map((f) => read(root, f))).toEqual(before)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
  it('moves Sable after tailwindcss when the order is reversed, keeping the existing @source', () => {
    const root = viteApp({ 'src/index.css': "@import '@sableui/react/styles.css';\n@import 'tailwindcss';\n@source '../node_modules/@sableui/react/dist/**/*.js';\n" })
    try {
      expect(fix(sable(root, ['doctor', '--fix', '--no-install']).data, 'css:order')?.status).toBe('applied')
      expect(read(root, 'src/index.css')).toBe("@import 'tailwindcss';\n@import \"@sableui/react/styles.css\";\n@source '../node_modules/@sableui/react/dist/**/*.js';\n")
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
  it('prints the install command from the lockfile instead of running it under --no-install', () => {
    const root = viteApp({ 'package.json': JSON.stringify({ ...viteDeps, dependencies: { react: '^19.1.0', 'react-dom': '^19.1.0' } }) })
    try {
      const install = fix(sable(root, ['doctor', '--fix', '--no-install']).data, 'install')
      expect(install?.status).toBe('manual')
      expect(install?.snippet).toBe('pnpm add @sableui/react')
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
  it('leaves a config shape it does not recognise to the user', () => {
    const root = viteApp({ 'vite.config.ts': "import { defineConfig } from 'vite'\nimport tailwindcss from '@tailwindcss/vite'\nconst shared = { plugins: [tailwindcss()] }\nexport default defineConfig(shared)\n" })
    try {
      const dedupe = fix(sable(root, ['doctor', '--fix', '--no-install']).data, 'dedupe')
      expect(dedupe?.status).toBe('manual')
      expect(dedupe?.snippet).toContain('dedupe')
      expect(read(root, 'vite.config.ts')).not.toContain('dedupe')
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
})

describe('sable init', () => {
  it('wires a Vite app and installs the agent skill', () => {
    const root = viteApp()
    try {
      const { type, data } = sable(root, ['init', '--no-install'])
      expect(type).toBe('init')
      expect(data.framework.id).toBe('vite')
      expect(data.packageManager).toBe('pnpm')
      expect(data.agent.status).toBe('applied')
      expect(existsSync(join(root, '.claude/skills/sable/SKILL.md'))).toBe(true)
      expect(data.providers.mounted).toBe(true)
      expect(data.doctor.failed).toBe(0)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
  it('creates the PostCSS config for Next.js and prints the client providers boundary', () => {
    const root = starter({
      'package.json': JSON.stringify({ dependencies: { next: '15.5.0', react: '19.1.0', 'react-dom': '19.1.0', '@sableui/react': '^0.11.0' }, devDependencies: { tailwindcss: '^4', '@tailwindcss/postcss': '^4' } }),
      'package-lock.json': '{}',
      'app/layout.tsx': 'import "./globals.css"\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return <html lang="en"><body>{children}</body></html>\n}\n',
      'app/globals.css': '@import "tailwindcss";\n',
      'app/page.tsx': 'import { Button } from "@sableui/react"\nexport default function Page() { return <Button>Go</Button> }\n',
    })
    try {
      const { data } = sable(root, ['init', '--no-install', '--no-agent'])
      expect(data.framework.label).toBe('Next.js (App Router)')
      expect(data.agent.status).toBe('skipped')
      expect(read(root, 'postcss.config.mjs')).toContain('"@tailwindcss/postcss": {}')
      expect(fix(data, 'css:build')?.status).toBe('applied')
      const icons = fix(data, 'icons')
      expect(icons?.status).toBe('manual')
      expect(icons?.file).toBe('app/providers.tsx')
      expect(icons?.snippet).toMatch(/^"use client"/)
      expect(data.doctor.failed).toBe(1)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
  it('refuses to run outside an app root', () => {
    const root = mkdtempSync(join(tmpdir(), 'sable-init-'))
    try { expect(sable(root, ['init']).code).toBe('ERR_INIT') }
    finally { rmSync(root, { recursive: true, force: true }) }
  })
})
