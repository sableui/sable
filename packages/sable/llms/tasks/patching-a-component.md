# Task: patching a Sable component

A Sable component has a defect that blocks your app, and the fix has not shipped.
Don't restyle it from the outside with `className` (`component-restyle` flags
that, and it fights the component's own states), and don't copy the component
into the app (it imports Sable internals, and the copy drifts from every later
fix). Patch the installed module and record why. Sable then re-checks the patch
on every upgrade and tells you when to drop it.

## Record it, then patch it

```bash
pnpm exec sable patch Card --reason "Row hover pokes past a flush card's corners" \
  --repro "Hover the last row of the Tickets table at a 20px card radius"
```

The record goes in `.sable/patches.json`: the component, the files it covers,
the Sable version, each file's hash as Sable shipped it, your reason and your
repro. Commit it. The command prints the steps for your package manager:

- **pnpm:** `pnpm patch @sableui/react@<version>`, edit the file in the folder
  it prints, then `pnpm patch-commit <folder>`.
- **Yarn 2+:** `yarn patch @sableui/react`, edit, then `yarn patch-commit -s <folder>`.
- **npm or Yarn 1:** edit `node_modules/@sableui/react/<file>`, run
  `npx patch-package @sableui/react`, and add `"postinstall": "patch-package"`.

A component's patch covers its own modules (`dist/components/card/*.js`). When
the defect is in a shared module, add it with `--file dist/lib/trim-label.js`.
Keep the change as small as the defect. Then report it upstream (`--issue` keeps
the link), so the library fix can replace the patch.

## On every upgrade

`sable doctor`, and so `sable check`, re-checks each recorded patch against the
installed Sable:

| State | Doctor | What to do |
|---|---|---|
| Same version, patch applied | passes | nothing |
| Same version, not applied | warns | make the patch (the printed steps) |
| Newer Sable changed a patched file | **fails**, citing the changelog entries that name the component | re-run the repro on Sable's own files. Fixed: `sable patch Card --drop` and remove the patch. Still broken: re-patch, then `sable patch Card --keep` |
| Newer Sable left the file alone, patch carried over | passes | nothing |
| Newer Sable left the file alone, patch lost | **fails** | re-apply it, then `--keep` |

Nothing is kept or dropped silently. pnpm also stops an install whose patch
names a version that is no longer installed; that is the same alert, earlier.

`sable patch --list` shows every patch and its state.
