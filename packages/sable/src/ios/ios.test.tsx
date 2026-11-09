import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NavigationStack, useNavigation } from './navigation'
import * as adapter from './index'
import { iosThemeStyle } from './theme'
import { isIosPreviewTheme } from './preview-theme'

describe('optional iOS integration', () => {
  it('passes only Sable semantic tokens to the native root, never geometry', () => {
    const style = iosThemeStyle({ '--background': 'var(--paper)', '--primary': 'var(--accent)', '--font-display': 'Brand Serif', ...({ '--spacing': '2px', '--radius': '0' } as object) })
    expect(style).toEqual({ '--background': 'var(--paper)', '--primary': 'var(--accent)', '--font-display': 'Brand Serif' })
    expect(iosThemeStyle({})).toEqual({})
  })

  it('maps the preset onto native chrome in CSS, with iOS values when Sable is absent', () => {
    const css = readFileSync(resolve(__dirname, 'styles.css'), 'utf8')
    for (const mapping of ['--ios-canvas: var(--background,', '--ios-ink: var(--foreground,', '--color-primary: var(--primary,', '--ios-display: var(--font-display,']) expect(css).toContain(mapping)
    expect(css).toMatch(/\.k-navbar[^{]*\{\s*--spacing: 0\.25rem/)
  })

  it('keeps independent tab routes and restores the originating focus on back', () => {
    function Root({ name }: { name: string }) {
      const navigation = useNavigation()
      return <button onClick={() => navigation.push('detail', <><h1 tabIndex={-1}>{name} detail</h1><button onClick={navigation.pop}>Back</button></>)}>{name}</button>
    }
    const { rerender } = render(<><NavigationStack label="Notes"><Root name="Open note" /></NavigationStack><NavigationStack label="Saved" active={false}><Root name="Open saved" /></NavigationStack></>)
    const origin = screen.getByRole('button', { name: 'Open note' })
    origin.focus(); fireEvent.click(origin)
    expect(screen.getByRole('heading', { name: 'Open note detail' })).toHaveFocus()
    rerender(<><NavigationStack label="Notes" active={false}><Root name="Open note" /></NavigationStack><NavigationStack label="Saved"><Root name="Open saved" /></NavigationStack></>)
    expect(screen.queryByRole('heading', { name: 'Open note detail' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Open saved' })).toBeVisible()
    rerender(<><NavigationStack label="Notes"><Root name="Open note" /></NavigationStack><NavigationStack label="Saved" active={false}><Root name="Open saved" /></NavigationStack></>)
    expect(screen.getByRole('heading', { name: 'Open note detail' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(origin).toHaveFocus()
  })

  it('draws the tab bar lens from a copy that assistive tech and the keyboard never reach', () => {
    const { container } = render(
      <adapter.NativeApp>
        <adapter.IosTabbar aria-label="Main navigation">
          <adapter.IosTab active id="notes-tab" onClick={() => {}} label="Notes" />
          <adapter.IosTab label="Saved" />
        </adapter.IosTabbar>
      </adapter.NativeApp>,
    )
    const tabs = screen.getAllByRole('link')
    expect(tabs.map(tab => tab.textContent)).toEqual(['Notes', 'Saved'])
    expect(screen.getByRole('link', { name: 'Notes' })).toHaveAttribute('aria-current', 'page')
    const lens = container.querySelector('.native-tab-lens')!
    expect(lens).toHaveAttribute('aria-hidden', 'true')
    expect(lens).toHaveAttribute('inert')
    // Both layers (flat and refracting) carry every tab, as plain spans with no ids or state.
    expect(lens.querySelectorAll('.native-tab-lens-row')).toHaveLength(2)
    expect(lens.querySelectorAll('button, a, [id], [aria-current], [tabindex]')).toHaveLength(0)
    expect(lens.textContent).toBe('NotesSavedNotesSaved')
  })

  it('exports system chrome only: screens are built from Sable components', () => {
    expect(Object.keys(adapter).sort()).toEqual(['IosBackLink', 'IosIconButton', 'IosNavbar', 'IosPage', 'IosSheet', 'IosTab', 'IosTabbar', 'NativeApp', 'NavigationStack', 'iosThemeStyle', 'useNavigation'])
  })

  it('rejects malformed preview payloads and unapproved font URLs', () => {
    const message = { type: 'sable:ios-theme', mode: 'dark', icons: 'fallback', reducedMotion: false, tokens: { '--primary': 'red' }, fonts: ['https://fonts.googleapis.com/css2?family=Figtree'] }
    expect(isIosPreviewTheme(message)).toBe(true)
    for (const malformed of [null, { ...message, tokens: [] }, { ...message, tokens: { color: 'red' } }, { ...message, fonts: ['https://fonts.googleapis.com.evil.test/font.css'] }, { ...message, mode: 'system' }, { ...message, icons: 'unknown' }]) expect(isIosPreviewTheme(malformed)).toBe(false)
  })
})
