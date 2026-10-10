// The iOS target: which Sable component builds each role in an iOS prototype.
//
// The rule is Sable first. Every screen is built from Sable components in the
// chosen preset. The only exceptions are the iOS system chrome Sable has no
// equivalent for — the app frame and status bar, the navigation bar, the tab
// bar and sheet presentation — and those come from the Sable adapter
// (@sableui/react/ios), never from Konsta directly (sable-lint:
// native-ui-import). An earlier map replaced Switch, Input, Slider, search,
// rows and toasts with Konsta controls; prototypes then stopped being Sable.
//
// Every Sable component needs a reviewed decision; build-ios-target fails on a
// missing or stale one. Unlisted components default to "preserve".
const ADAPTER = '@sableui/react/ios'
const SABLE = '@sableui/react'

const decisions = [
  ['replace', 'AppShell', ['NativeApp', 'IosPage', 'NavigationStack'], 'NativeApp is the app frame (status bar, safe areas, home indicator); each screen is an IosPage; each tab keeps one NavigationStack. Screen content is Sable.'],
  ['replace', 'StatusBar', ['NativeApp'], 'NativeApp draws the iOS status bar. App status belongs in Sable content (InlineStatus, Banner), not a desktop tool strip.'],
  ['replace', 'AppHeader', ['IosNavbar', 'IosBackLink', 'IosIconButton'], 'The screen title, back and bar actions are the iOS navigation bar. It takes the preset font and accent; keep its geometry.'],
  ['replace', 'BottomNav', ['IosTabbar', 'IosTab'], 'Top-level destinations are the iOS tab bar with a Sable Icon in each IosTab. Keep one NavigationStack per tab; pushed details never go in the tab bar.'],
  ['replace', 'Sheet', ['IosSheet'], 'IosSheet presents and dismisses (detents, drag, Escape, focus). Everything inside it is Sable: Form, Field, Input, Button.'],
  ['contextual', 'PageHeader', 'Screen title', ['IosNavbar'], 'A screen title is the navigation bar (`large` for the top of a tab). An editorial heading or product introduction inside the screen stays PageHeader or Sable typography.'],
  ['contextual', 'Button', 'Navigation-bar action', ['IosIconButton', 'IosBackLink'], 'Only actions in the navigation bar are adapter controls. Every other button — product actions, form submits, sheet actions, empty-state actions — is a Sable Button.'],
  ['recompose', 'SideNav Sidebar Breadcrumbs Tree', ['Card', 'CardList', 'Entity'], 'Hierarchy becomes drill-down: a list of interactive Entity rows in a Card that push the next screen with useNavigation().push. Back is the navigation bar.'],
  ['recompose', 'Table DataTable', ['Card', 'CardList', 'Entity', 'Description'], 'On a phone a table becomes rows: Entity per record in a CardList, with the detail on a pushed screen (Description for its fields). Keep sorting and filtering the task needs.'],
  ['recompose', 'Tooltip', ['Popover', 'Label'], 'There is no hover on a phone. Essential help is visible text, or a Popover on tap.'],
  ['recompose', 'Pagination', ['Button', 'Spinner'], 'Phones scroll: load more at the end of the list with a Sable Button, or load on scroll with a Spinner.'],
  ['recompose', 'FileDropzone', ['Attachment', 'Button'], 'Drag and drop is not a phone interaction. Pick files with a Sable Button; show them as Attachments.'],
  ['preview-only', 'Browser Phone', [], 'Frame a prototype with PhoneFrame from @sableui/react/ios/preview on a host page. Never draw device or browser chrome inside the app.'],
  ['redesign', 'Workspace PanelGroup PanelSection ScrubField CommandMenu', [], 'Desktop workspace tools have no honest phone form. Redesign the task as screens of Sable content first.'],
]

const strategyOf = new Map()
for (const entry of decisions) for (const name of entry[1].split(' ')) strategyOf.set(name, entry)

const PRESERVE_GUIDANCE = 'Use the Sable component as it is, in the preset. Adapt layout and touch targets to the phone; do not swap in a native lookalike or restyle it.'

/** A decision for every Sable component, from the registry's list. */
export function buildComponentMap(names) {
  return Object.fromEntries(names.map((name) => {
    const entry = strategyOf.get(name)
    if (!entry) return [name, { source: name, strategy: 'preserve', importFrom: SABLE, components: [name], guidance: PRESERVE_GUIDANCE }]
    if (entry[0] === 'contextual') {
      const [, , role, chrome, guidance] = entry
      return [name, {
        source: name, strategy: 'contextual', importFrom: null, components: [], guidance,
        contexts: [
          { role, strategy: 'replace', importFrom: ADAPTER, components: chrome },
          { role: 'Everything else', strategy: 'preserve', importFrom: SABLE, components: [name] },
        ],
        defaultContext: 'Everything else',
      }]
    }
    const [strategy, , components, guidance] = entry
    const importFrom = strategy === 'replace' ? ADAPTER : strategy === 'recompose' ? SABLE : null
    return [name, { source: name, strategy, importFrom, components, guidance }]
  }))
}

export const decidedNames = [...strategyOf.keys()]

export const targetRegistry = (names) => ({
  schemaVersion: 3, target: 'ios', platformVersion: '27', verifiedOn: '2026-10-10',
  designPolicy: {
    principle: 'Sable first. Every screen is built from Sable components in the chosen preset. The adapter supplies only the iOS system chrome Sable has no equivalent for: the app frame and status bar, the navigation bar, the tab bar and sheet presentation.',
    chrome: ['status bar and safe areas', 'navigation bar: title, large title, back, bar actions', 'tab bar', 'sheet presentation and dismissal', 'glass material'],
    sable: ['every control: Switch, Input, Slider, SearchInput, Select, Checkbox, Button', 'lists and rows: Card, CardList, Entity', 'forms: Form, Field', 'feedback: Toast, Banner, EmptyState, InlineStatus', 'all content, typography and imagery'],
    rule: 'Never import from konsta. Chrome comes from @sableui/react/ios; anything else is a Sable component. If Sable lacks something a screen needs, report it as a library gap rather than reaching for a native control.',
    styling: 'One document: Tailwind, Sable styles.css, the preset, then @sableui/react/ios/styles.css. The chrome reads the preset; Sable content follows it as on the web. Align content to px-(--ios-inset).',
  },
  implementation: { package: 'konsta', verifiedVersion: '5.5.0', license: 'MIT', install: 'pnpm add konsta', ownership: 'The adapter\'s optional peer, installed in the consuming project only for an iOS prototype. Apps never import it.' },
  integration: {
    importFrom: ADAPTER, stylesheet: '@sableui/react/ios/styles.css',
    previewImportFrom: '@sableui/react/ios/preview', previewStylesheet: '@sableui/react/ios/frame.css',
    chrome: ['NativeApp', 'IosPage', 'IosNavbar', 'IosBackLink', 'IosIconButton', 'IosTabbar', 'IosTab', 'IosSheet', 'NavigationStack', 'useNavigation', 'iosThemeStyle'],
    previewHelpers: ['PhoneFrame', 'phoneSizes', 'useIosPreviewBridge', 'useIosPreviewTheme', 'isIosPreviewTheme', 'loadIosPreviewFonts'],
  },
  sources: ['https://support.apple.com/en-gb/149076', 'https://developer.apple.com/videos/play/wwdc2026/251/', 'https://konstaui.com/react'],
  components: buildComponentMap(names),
})
