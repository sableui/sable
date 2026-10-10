import puppeteer from 'puppeteer'
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
const errors = []
const optionalFailures = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => {
  if (message.type() !== 'error') return
  if (message.location().url === 'https://api.github.com/repos/sableui/sable' && message.text().includes('404')) return
  errors.push(`${message.text()} (${message.location().url})`)
})
page.on('response', response => {
  if (response.status() < 400) return
  if (response.status() === 404 && response.url() === 'https://api.github.com/repos/sableui/sable') optionalFailures.push(response.url())
  else errors.push(`Resource ${response.status()}: ${response.url()}`)
})
try {
  await page.setViewport({ width: 402, height: 874, deviceScaleFactor: 1 })
  await page.goto('http://localhost:4000/native.html', { waitUntil: 'networkidle0' })
  await page.waitForSelector('.ios-prototype')
  await page.waitForFunction(() => document.querySelector('.native-tab-glass').style.getPropertyValue('--ios-glass-optics').startsWith('url('))
  // One document: the chrome and the Sable content read the same preset tokens.
  const resolve = (expression) => page.evaluate(expression => {
    const probe = document.createElement('span')
    probe.style.color = expression
    document.querySelector('.ios-prototype').appendChild(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  }, expression)
  const identity = await page.evaluate(() => ({
    canvas: getComputedStyle(document.querySelector('.ios-prototype')).backgroundColor,
    navigationFont: getComputedStyle(document.querySelector('.ios-navigation-title')).fontFamily,
    tabIcons: document.querySelectorAll('.native-tabbar svg.reicon').length,
    headerScrim: getComputedStyle(document.querySelector('.ios-route'), '::before').backgroundImage.startsWith('linear-gradient'),
    noDuplicateScrims: [...document.querySelectorAll('.k-navbar > .pointer-events-none')].every(el => getComputedStyle(el).display === 'none'),
    chromeSpacing: getComputedStyle(document.querySelector('.k-navbar')).getPropertyValue('--spacing').trim(),
  }))
  assert.equal(identity.canvas, await resolve('var(--background)'), 'Native canvas is the preset background')
  const displayFont = await page.evaluate(() => {
    const probe = document.createElement('span')
    probe.style.fontFamily = 'var(--font-display, var(--font-sans))'
    document.querySelector('.ios-prototype').appendChild(probe)
    const font = getComputedStyle(probe).fontFamily
    probe.remove()
    return font
  })
  assert.equal(identity.navigationFont, displayFont, 'Native titles use the preset display font')
  assert.equal(identity.tabIcons, 3, 'Tab bar uses the app icon set')
  assert(identity.headerScrim && identity.noDuplicateScrims, 'Continuous header scrim')
  assert.equal(identity.chromeSpacing, '0.25rem', 'Native chrome pins iOS spacing')
  assert.equal(await page.evaluate(() => document.querySelectorAll('.k-list, .k-block, .k-toggle, .k-list-input, .k-searchbar, .k-range').length), 0, 'Screens are Sable components; Konsta only draws chrome')
  mkdirSync('.evidence/ios', { recursive: true })
  await page.screenshot({ path: '.evidence/ios/phone-light.png' })
  const visible = '.ios-navigation-stack:not([hidden]) .ios-route:not([hidden])'
  const clickText = async (text, scope = '') => {
    if (scope === 'dialog') await page.waitForFunction(() => {
      const box = document.querySelector('.ios-sheet').getBoundingClientRect()
      return Math.abs(box.top - (innerHeight - box.height)) < 1
    })
    await page.waitForFunction((text, scope) => [...document.querySelectorAll(`${scope} :is(button, [role=button])`)].some(el => el.checkVisibility() && (el.textContent.trim().includes(text) || el.getAttribute('aria-label') === text)), {}, text, scope)
    const handle = await page.evaluateHandle((text, scope) => [...document.querySelectorAll(`${scope} :is(button, [role=button])`)].find(el => el.checkVisibility() && (el.textContent.trim().includes(text) || el.getAttribute('aria-label') === text)), text, scope)
    const element = handle.asElement()
    assert(element, `Visible button: ${text}`)
    await element.scrollIntoView()
    await element.click()
    await handle.dispose()
  }
  const wait = async fn => page.waitForFunction(fn)
  await clickText('A quiet morning', visible)
  await wait(() => !!document.querySelector('.ios-route:not([hidden]) h1'))
  const motion = await page.evaluate(() => document.getAnimations().filter(animation => animation.effect?.target?.closest('.ios-route')).map(animation => ({ currentTime: animation.currentTime, playState: animation.playState, duration: animation.effect.getTiming().duration })))
  assert(motion.length > 0, 'Native route transition actually runs')
  await page.screenshot({ path: '.evidence/ios/detail.png' })
  await clickText('Saved', '.native-tabbar')
  assert.equal(await page.$eval('.ios-navigation-stack:not([hidden])', el => el.getAttribute('aria-label')), 'Saved fieldnotes')
  await clickText('Notes', '.native-tabbar')
  assert.equal(await page.$eval('.ios-navigation-stack:not([hidden]) h1', el => el.textContent), 'A quiet morning', 'Tab retains detail')
  await clickText('Back', visible)
  await wait(() => !document.querySelector('.ios-navigation-stack:not([hidden]) .ios-route:not([hidden]) h1'))
  assert.match(await page.evaluate(() => document.activeElement.textContent), /A quiet morning/, 'Back restores focus')
  await page.type(`${visible} input[aria-label="Search fieldnotes"]`, 'no such note')
  await wait(() => document.body.textContent.includes('No fieldnotes found'))
  await clickText('Clear search', visible)
  await clickText('New fieldnote', visible)
  await wait(() => document.querySelector('dialog').open && document.querySelector('.ios-sheet').getBoundingClientRect().top < 800)
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab')
    assert(await page.evaluate(() => document.activeElement === document.body || document.querySelector('dialog').contains(document.activeElement)), 'Modal excludes background focus; browser chrome can receive Tab')
  }
  assert(await page.evaluate(() => { document.querySelector('.native-tabbar button').focus(); return !document.activeElement.closest('.native-tabbar') }), 'Background is inert to programmatic focus')
  await clickText('Add fieldnote', 'dialog')
  await wait(() => document.getElementById('note-title').getAttribute('aria-invalid') === 'true')
  await page.type('#note-title', 'An afternoon outside')
  await page.type('input[placeholder="Where were you?"]', 'Denver')
  await page.type('textarea', 'A new fieldnote created in the prototype.')
  await page.screenshot({ path: '.evidence/ios/sheet.png' })
  await clickText('Add fieldnote', 'dialog')
  await wait(() => !document.querySelector('dialog').open)
  assert(await page.evaluate(() => document.body.textContent.includes('An afternoon outside')), 'Save creates note')
  await wait(() => document.body.textContent.includes('Fieldnote added'))
  await clickText('New fieldnote', visible)
  await wait(() => document.querySelector('dialog').open)
  await page.keyboard.press('Escape')
  await wait(() => !document.querySelector('dialog').open)
  await clickText('New fieldnote', visible)
  await wait(() => document.querySelector('dialog').open)
  await clickText('Cancel', 'dialog')
  await wait(() => !document.querySelector('dialog').open)
  await clickText('New fieldnote', visible)
  await wait(() => document.querySelector('dialog').open && document.querySelector('.ios-sheet').getBoundingClientRect().top < 500)
  await page.click('[aria-label="Expand sheet"]')
  assert.equal(await page.$eval('.ios-sheet', el => el.style.height), '90%', 'Large detent')
  await wait(() => {
    const box = document.querySelector('.ios-sheet').getBoundingClientRect()
    return Math.abs(box.top - (innerHeight - box.height)) < 1
  })
  const grabber = await page.$('[aria-label="Reduce sheet height"]')
  const box = await grabber.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 110, { steps: 8 })
  await page.mouse.up()
  await wait(() => !document.querySelector('dialog').open)
  await clickText('An afternoon outside', visible)
  await wait(() => !!document.querySelector('.ios-route:not([hidden]) h1'))
  await page.mouse.move(8, 420); await page.mouse.down(); await page.mouse.move(130, 420, { steps: 8 }); await page.mouse.up()
  await wait(() => !document.querySelector('.ios-navigation-stack:not([hidden]) .ios-route:not([hidden]) h1'))
  await clickText('Settings', '.native-tabbar')
  await page.focus(`${visible} [role=switch]`)
  await page.keyboard.press('Space')
  await wait(() => document.querySelector('.ios-prototype').classList.contains('dark'))
  await page.waitForSelector(`${visible} input[type=range]`)
  await page.focus(`${visible} input[type=range]`)
  await page.keyboard.press('End')
  await wait(() => document.querySelector('.ios-prototype').style.getPropertyValue('--ios-glass-tint') === '1')
  await page.keyboard.press('Home')
  await wait(() => document.querySelector('.ios-prototype').style.getPropertyValue('--ios-glass-tint') === '0')
  await page.screenshot({ path: '.evidence/ios/phone-dark.png' })
  await clickText('Notes', '.native-tabbar')
  await clickText('A quiet morning', visible)
  await wait(() => !!document.querySelector('.ios-route:not([hidden]) h1'))
  const darkIdentity = await page.evaluate(() => ({
    dark: document.documentElement.classList.contains('dark'),
    canvas: getComputedStyle(document.querySelector('.ios-prototype')).backgroundColor,
  }))
  assert(darkIdentity.dark, 'Dark appearance reaches <html>, so portaled Sable popups follow it')
  assert.equal(darkIdentity.canvas, await resolve('var(--background)'), 'Dark chrome and content share the preset background')
  await page.screenshot({ path: '.evidence/ios/content-dark.png' })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  assert.equal(await page.$eval('.ios-route', el => getComputedStyle(el).animationDuration), '0s')
  assert.equal(await page.$eval('.ios-sheet', el => getComputedStyle(el).transitionDuration), '0s')
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 402, 'No horizontal overflow')
  console.log('Native interactions and shared preset identity verified; checking the catalog frame.')
  await page.setViewport({ width: 1280, height: 1100 })
  await page.goto('http://localhost:4000/ios-prototype', { waitUntil: 'networkidle0' })
  await page.waitForSelector('iframe.ios-phone-screen')
  console.log('Catalog loaded; capturing desktop and mobile layouts.')
  await page.screenshot({ path: '.evidence/ios/catalog-desktop.png', fullPage: true })
  await page.setViewport({ width: 375, height: 900 })
  await page.waitForFunction(() => document.querySelector('.ios-phone-frame').getBoundingClientRect().right <= innerWidth)
  await page.screenshot({ path: '.evidence/ios/catalog-mobile.png', fullPage: true })
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 375, 'Catalog fits phone width')
  assert.deepEqual(errors, [], 'Browser errors')
  console.log('Verified detail/back, independent tabs, search recovery, modal focus, validation/save, Escape/cancel, detents/drag, edge swipe, dark/reduced motion, desktop/mobile framing; no app errors.')
  if (optionalFailures.length) console.log('Existing optional public GitHub star metadata unavailable (private repository, 404).')
  const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex')
  const sources = ['apps/docs/native/main.tsx', 'apps/docs/native/native.css', 'apps/docs/src/pages/IosPrototype.tsx', 'packages/sable/targets/ios.json', ...readdirSync('packages/sable/src/ios').filter(name => !name.includes('.test.')).map(name => `packages/sable/src/ios/${name}`)]
  writeFileSync('.evidence/ios/interaction-report.json', JSON.stringify({
    executedOn: new Date().toISOString(), nativeViewport: [402, 874], catalogViewports: [[1280, 1100], [375, 900]],
    checks: ['screens built from Sable components', 'detail and back focus', 'independent tabs', 'search recovery', 'modal focus and inert background', 'validation then save', 'Escape during entry', 'cancel', 'large detent and drag dismiss', 'edge swipe back', 'keyboard dark toggle', 'glass tint endpoints', 'system reduced motion', 'frame bounds at mobile width'],
    motion, brandIdentity: { light: identity, dark: darkIdentity }, sources: Object.fromEntries(sources.map(path => [path, hash(path)])),
    artifacts: Object.fromEntries(readdirSync('.evidence/ios').filter(name => name.endsWith('.png')).map(name => [name, hash(`.evidence/ios/${name}`)])),
    appErrors: errors, optionalPublicMetadataFailures: optionalFailures,
    limits: ['Browser approximation of iOS; no OS APIs or SF Symbols', 'CSS/runtime observations and still captures; no playable recording or performance benchmark', 'Sample state lasts for the preview session'],
  }, null, 2) + '\n')
} finally { await browser.close() }
