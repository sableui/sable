# Task: create a preset from inspiration

A preset is a versioned design input: Sable theme values, font requirements,
design guidance, and optional attributed observations. It is reusable across
products. It does not encode a reference site's content or page structure.

Use the agent's `inspire` mode with images, URLs, a description, or a combination.
Inspect the actual supplied evidence. Record typography relationships, surface
contrast, spacing, shape, imagery treatment, and observed motion. Label each
reference decision as measured, estimated, derived, or user-edited. A screenshot
cannot establish animation timing, hidden behavior, or an unseen responsive state.

Choose an original direction suitable for the user's future product. Map that
direction onto the installed Sable token vocabulary. Preserve readable semantic
roles and supported control behavior rather than recoloring every primitive
independently. Load fonts through the consuming project's font setup. Page widths
are optional: set `page-inset` and the `region-*` caps (`form`, `feed`, `content`,
`wide`, `full`) in `tokens.shared` only when the direction calls for a different
page proportion, and keep each cap's role.

```bash
pnpm exec sable preset --template
pnpm exec sable preset --check .sable/presets/clay.json --json
pnpm exec sable preset --css .sable/presets/clay.json
```

The template starts from a complete Sable theme snapshot. Give it a unique ID and
label; author its tokens, direction, and reference observations. Avoid IDs of
bundled themes. Save the record at `.sable/presets/<id>.json`. Advance `revision`
when changing a shared record; keep earlier revisions when reproducibility matters.

Preview using real Sable components or import the JSON in Canvas. Inspect both
light and dark modes and test long text, focus, disabled controls, floating
surfaces, and errors. Token validation checks the contract and safe CSS structure;
rendered review establishes contrast, coherence, and suitability.

`--check` also measures the label on every filled role against its `-foreground`,
in both modes: the brand fills `primary`, `sidebar-primary` and `highlight`, and the
status fills `destructive`, `success`, `tone-warning` and `tone-info`. A label must
clear 4.5:1 and APCA Lc 60, because a pair can pass the ratio and still read muddy
(dark ink on a bright red-orange). A failing pair stops the check with
`ERR_PRESET_CONTRAST` and the nearest pair that reads, with the fill's lightness
moved and its hue kept. A fill keeps the ink its light-mode colour takes, so a
colour with a white label keeps white in dark mode and its fill comes down to meet
it. Offer that pair to the user.

Each status colour has two tokens. The fill (`destructive`) carries its label;
`destructive-text` is the same colour drawn on a surface, and `text-destructive`,
`border-destructive` and `ring-destructive` read it. In dark mode the two usually
differ: a saturated fill low enough for white, and a lighter text value that reads
on a dark card. Author both; lowering the fill never darkens the page's error text.
If the user chose the failing pair on purpose (a brand book, a reference to match),
keep it and record the decision in the preset rather than overriding it:

```json
"exceptions": [{ "rule": "label-contrast", "mode": "dark", "token": "primary", "reason": "Brand book specifies dark ink on the bright fill." }]
```

An accepted pair is reported with its reason on every check; it is never silent.

Canvas's Export view downloads this same format with resolved theme values and
the current customizations. Enter a name and design guidance, save the JSON, and
place it in the target project. The browser cannot write into that project for
the agent. An imported preset can be edited and downloaded as a new revision.

Deliver the preset, its component preview, fonts to load, and any unverified
observations. Stop before building a full product. The next step is a concrete
`build <idea> using <preset file>` request, described in
[building-with-sable.md](./building-with-sable.md) and
[using-presets.md](./using-presets.md).
