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
independently. Load fonts through the consuming project's font setup.

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

Canvas's Export view downloads this same format with resolved theme values and
the current customizations. Enter a name and design guidance, save the JSON, and
place it in the target project. The browser cannot write into that project for
the agent. An imported preset can be edited and downloaded as a new revision.

Deliver the preset, its component preview, fonts to load, and any unverified
observations. Stop before building a full product. The next step is a concrete
`build <idea> using <preset file>` request, described in
[building-with-sable.md](./building-with-sable.md) and
[using-presets.md](./using-presets.md).
