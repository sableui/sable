---
name: sable
description: Build websites and apps with Sable, develop reusable presets from inspiration, audit interfaces, polish designs, and fix scoped defects using the installed library.
---

# Sable

Load the maintained instructions from this project's installed Sable package
before carrying out the request. This entry delegates so a package upgrade
supplies the updated skill, contracts, and guides together.

From the target project's dependency context, run:

```sh
node -p "require.resolve('@sableui/react/registry.json')"
```

Read `skills/sable/SKILL.md` under the returned registry's parent directory and
follow it for the user's request. Use that package's `bin/sable.mjs` for retrieval.
In the Sable monorepo, read `packages/sable/skills/sable/SKILL.md` directly.

If the package is missing, install `@sableui/react` from npm with the project's
package manager.
Read the installed registry's `consume` block and `AGENTS.md` to wire React,
Tailwind, CSS source scanning, and fonts. Do not fetch an unrelated public package
named `sable` or `sable-ui`. Explain missing access and continue
independent brief work when installation is blocked.

Primary modes are `build <idea> [using <preset>]`, `inspire <references or brief>`,
`audit <existing interface>`, `polish <target>`, and `fix <target>` for one scoped
defect. `create` aliases `build`.
These are agent modes, not terminal subcommands. Every build must query and use
the installed Sable components, variants, utilities, tokens, layouts, and guides,
then run its design lint and inspect the working result. Do not begin UI code
without loading the package skill.
