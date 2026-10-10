# Task: create assets that carry the design

Use this workflow when imagery, illustration, or type materially establishes the
surface's identity or explains its content. A useful asset changes what someone
understands or feels. Adding a decorative image to every section is unnecessary.

## Define the asset's job before producing it

Keep the asset plan with the surface brief, for example `design/<surface>/assets.json`.
The optional [asset-plan template](../taste/asset-plan.template.json) is a plain
planning record, not a `sable grade` or `sable explore` schema. Fill only relevant
fields; `null` means unresolved, never tested or zero cost.

For each important asset, specify:

| Decision | Concrete example |
|---|---|
| Role and message | A workshop photograph shows the scale of the table and what a visitor will make. |
| Subject and composition | Hands working clay at lower right; clear space at upper left for the heading. |
| Visual treatment | Side lighting, warm paper background, shallow shadows; retain clay texture and avoid a glossy product-render finish. |
| Relationship to the set | Product illustrations share line weight and viewpoint while their silhouettes distinguish the actual varieties. |
| Placement and crop | Wide establishing view on desktop; a tighter alternate composition on mobile that retains both hands and the object. |
| Source and readiness | User-provided photo with confirmed usage scope; original SVG; generated illustration; or explicitly provisional placeholder. |
| Delivery target | Expected display dimensions, format candidates, byte budget, and loading priority. |

Words such as "premium" or "editorial" need these visible decisions to become
actionable. For an exact reference reconstruction, preserve its imagery roles and
framing; report unavailable source assets or substitutions. Atlas captures are
study evidence, not a product asset library.

## Produce the right material

- Use provided assets when they fit the brief and permitted usage. Record their
  source, creator when known, license or permission reference, attribution needs,
  and any unresolved usage restriction. Finding an image online does not establish
  permission to ship it. Do not label unresolved rights as cleared.
- Use original SVG or other code-native art for diagrams, marks, or illustration
  systems that benefit from controlled geometry. Build a representative set before
  repeating it: six recolored versions of one symbol may fail to distinguish six
  subjects. Informative marks must not imply inaccurate counts or measurements.
- Use an available image-generation workflow for original raster material when
  it serves the brief. Include subject, framing, light, material, palette, crop
  constraints, and exclusions in the prompt. Inspect the actual result; a prompt
  is not an asset. Record generated origin honestly. Generated scenes are not
  evidence of a real customer's product, venue, testimonial, or outcome.
- For video, define the subject, shot sequence or loop, pacing, crop, poster, and
  whether sound is meaningful. Use supplied, appropriately sourced, or generated
  footage within the task's scope. Keep a usable poster/fallback. Motion review is
  covered in [reviewing-motion.md](./reviewing-motion.md).

For fonts, record family and role, required weights, language/glyph coverage,
source, and relevant license. Load the actual files through the app's supported
font pipeline, such as local `@font-face`, a framework loader, or a provider link.
Declaring a font in a theme does not load it. Verify the font system and rendered
text, including fallback, long titles, numerals, and relevant accented characters.
An unavailable face needs an honest substitute rather than a broken provider URL.

## Compose, crop, and deliver

Test assets in the layout early with real copy. Choose the image focal point and
text position together. Use `srcset`/`sizes` for resolution choices and `<picture>`
or another explicit art-direction mechanism when the mobile composition should
change. Inspect crops at the actual breakpoints: scaling a wide frame can remove
its subject or leave unusably tiny detail.

Give meaningful images useful alternative text; keep decorative imagery out of
the reading order. Avoid baking essential copy into an image when live text can
carry it. Provide equivalent information for a diagram or meaningful video.

Choose a project-specific byte budget, including the combined initial image and
font payload. Measure actual output bytes. Compare formats and encodings at the
required size; retain a lossless or vector original when useful, and inspect the
optimized export for damaged edges, banding, small-text loss, or changed color.
Do not preload every asset or lazy-load the primary visual by habit. Verify the
chosen loading behavior in the actual page, including slow or failed media.

A temporary placeholder may unblock composition. Label it in the review/asset
plan, preserve its intended dimensions, and make missing material clear to the
reviewer. Replace it before calling that visual complete, or state the remaining
limitation. Generation prompts and implementation notes belong in authoring
artifacts, not the finished product flow.

## Verify the assembled result

Inspect desktop and mobile renders after fonts and media load, then test their
fallback states. Check that the asset advances the intended message, remains
recognizable at its smallest use, has a consistent relationship to the set, and
does not compromise text or controls. Retain before/after evidence when revising
an asset or crop; changing a file without viewing the new bytes is not review.

Record delivered paths, dimensions, bytes, and the captures actually inspected.
Use [reviewing-a-design.md](./reviewing-a-design.md) to connect those artifacts to
the build's source hash. Include local asset directories in the fingerprint;
remote resources need separate provenance because the source hash cannot freeze
their contents. Reuse a successful treatment as a conditional principle, not a
requirement that every future brand use the same illustration or font pairing.
