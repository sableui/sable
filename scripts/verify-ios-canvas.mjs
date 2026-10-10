import puppeteer from 'puppeteer'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'

// The iOS canvas is one native document: the real canvas scenes sit in Konsta
// pages, and both read the Customize panel's tokens from <html>.
const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
const capture = async name => page.screenshot({ path: `.evidence/ios/${name}.png`, fullPage: true })
const button = async (surface, text) => {
  const handle = await surface.evaluateHandle(text => [...document.querySelectorAll('button, [role=button]')].find(el => el.checkVisibility() && (el.textContent.trim() === text || el.getAttribute('aria-label') === text)), text)
  assert(handle.asElement(), `Visible button: ${text}`)
  await handle.asElement().evaluate(el => el.scrollIntoView({ block: 'center' }))
  await handle.asElement().click()
  await handle.dispose()
}
const text = surface => surface.evaluate(() => [...document.querySelectorAll('.ios-navigation-stack:not([hidden])')].map(el => el.textContent).join(' '))
try {
  await page.setViewport({ width: 1440, height: 1100 })
  await page.goto('http://localhost:4000/customize?theme=base&mode=light&target=ios', { waitUntil: 'networkidle0' })
  await page.waitForSelector('iframe[title="Sable canvas iPhone demo"]')
  const native = page.frames().find(frame => frame.url().includes('/ios-canvas.html'))
  assert(native, 'Native canvas frame')
  const readPrimary = () => page.$eval('html', el => getComputedStyle(el).getPropertyValue('--primary').trim())
  const synced = async () => native.waitForFunction(value => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() === value, {}, await readPrimary())
  await synced()
  const navHeight = await native.$eval('.k-navbar', el => el.getBoundingClientRect().height)
  assert(await native.evaluate(() => {
    const bottom = document.querySelector('.ios-prototype').getBoundingClientRect().bottom
    const layers = [...document.querySelectorAll('.native-tabbar > .pointer-events-none')]
    return layers.length === 2 && layers.every(el => Math.abs(el.getBoundingClientRect().bottom - bottom) < 1)
  }), 'Toolbar blur and tint extend through the home indicator safe area')
  assert.match(await text(native), /Untitled \(gold rush\).*Mara Okafor/s, 'Same collection scene, in the native document')
  assert.equal(await native.evaluate(() => document.documentElement.scrollWidth), 402, 'Content fits the iPhone viewport')
  await button(native, 'Monthly')
  assert.match(await text(native), /\$20/, 'Billing scene responds')
  await button(native, 'Activity')
  await native.waitForFunction(() => /Order #2048/.test(document.querySelector('.ios-navigation-stack:not([hidden])').textContent))
  await button(native, 'Explore')
  assert.match(await text(native), /\$20/, 'Tab switch preserves billing choice')
  await button(native, 'Settings')
  const sw = '.ios-navigation-stack:not([hidden]) [role="switch"]'
  await native.waitForSelector(sw)
  const checked = await native.$eval(sw, el => el.getAttribute('aria-checked'))
  await native.focus(sw)
  await page.keyboard.press('Space')
  assert.notEqual(await native.$eval(sw, el => el.getAttribute('aria-checked')), checked, 'Sable Switch is keyboard operable')
  assert.equal(await native.evaluate(() => document.querySelectorAll('.k-list, .k-toggle, .k-list-input').length), 0, 'Settings are Sable components, not Konsta controls')
  await button(native, 'Explore')
  await button(native, 'About this canvas')
  await native.waitForSelector('dialog[open]')
  await page.keyboard.press('Escape')
  await native.waitForFunction(() => !document.querySelector('dialog').open)
  await page.click('button[aria-label="Verdant"]')
  await page.waitForFunction(() => document.documentElement.getAttribute('data-sable-theme') === 'verdant')
  await native.waitForFunction(() => getComputedStyle(document.documentElement).getPropertyValue('--font-display').includes('Instrument Serif'))
  await synced()
  assert.equal(await native.$eval('.k-navbar', el => el.getBoundingClientRect().height), navHeight, 'Preset changes retain native navigation geometry')
  const checkChrome = async () => {
    const chrome = await native.evaluate(() => {
      const probe = (property, value) => {
        const el = document.createElement('span')
        el.style[property] = value
        document.querySelector('.ios-prototype').appendChild(el)
        const out = getComputedStyle(el)[property]
        el.remove()
        return out
      }
      const info = document.querySelector('[aria-label="About this canvas"]').getBoundingClientRect()
      return {
        canvas: getComputedStyle(document.querySelector('.ios-prototype')).backgroundColor === probe('color', 'var(--background)'),
        accent: getComputedStyle(document.querySelector('.native-tabbar [aria-current="page"] svg')).color === probe('color', 'var(--primary)'),
        bodyFont: getComputedStyle(document.querySelector('.ios-prototype')).fontFamily === probe('fontFamily', 'var(--font-sans)'),
        titleFont: getComputedStyle(document.querySelector('.ios-navigation-title')).fontFamily === probe('fontFamily', 'var(--font-display, var(--font-sans))'),
        info: { width: info.width, height: info.height },
      }
    })
    assert.deepEqual({ ...chrome, info: undefined }, { canvas: true, accent: true, bodyFont: true, titleFont: true, info: undefined }, 'Native chrome follows the preset background, accent and fonts')
    assert(chrome.info.width === 44 && chrome.info.height === 44, 'Info action keeps a square 44px touch target')
    return chrome
  }
  const lightChrome = await checkChrome()
  assert.match(await text(native), /\$20/, 'Preset change preserves demo state')
  mkdirSync('.evidence/ios', { recursive: true })
  await capture('canvas-ios-desktop')
  await button(page, 'Dark')
  await native.waitForFunction(() => document.documentElement.classList.contains('dark') && document.querySelector('.ios-prototype').classList.contains('dark'))
  await synced()
  const darkChrome = await checkChrome()
  await capture('canvas-ios-dark')
  await button(page, 'Web')
  assert(await page.evaluate(() => [...document.querySelectorAll('button')].some(el => el.checkVisibility() && el.textContent === 'Collect')), 'Web scenes remain available')
  await button(page, 'iOS')
  assert.match(await text(native), /\$20/, 'Platform switch preserves demo state')
  await page.setViewport({ width: 375, height: 900 })
  await page.click('button[aria-label="Close customize"]')
  await page.waitForFunction(() => document.querySelector('.ios-phone-frame').getBoundingClientRect().right <= innerWidth)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 375, 'Canvas fits phone width')
  await capture('canvas-ios-mobile')
  assert.deepEqual(errors, [], 'Canvas browser errors')
  console.log('Verified one-document scenes, live preset/fonts/colors on native chrome, 44px info action, preserved native geometry, billing state, keyboard settings, sheet Escape, and mobile bounds.')
  writeFileSync('.evidence/ios/canvas-report.json', JSON.stringify({ executedOn: new Date().toISOString(), checks: ['same collection/billing/activity components in the native document', 'live preset/token/font sync', 'native fonts and accents', 'home-area scrim', '44px info touch target', 'preserved native geometry', 'light/dark sync', 'billing state across tabs/platforms', 'native keyboard switch', 'sheet Escape', 'desktop/mobile bounds'], chrome: { light: lightChrome, dark: darkChrome }, appErrors: errors }, null, 2) + '\n')
} finally { await browser.close() }
