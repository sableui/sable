# Task: reviewing a rendered design

Review has two separate results: code conformance and observed design quality.
`sable grade` checks source; it cannot see a screen, operate a flow, or judge taste.
Its pattern similarity is descriptive. Original composition is not a defect.

## Capture a reviewable build

Save the surface brief, then capture the rendered route at a desktop width of at
least 1024px and a mobile width of at most 480px. Record the actual viewport,
route/state, supported color mode, and motion setting with each artifact. Inspect
the whole route as well as its first viewport. Ensure fonts and media have loaded.
Use a recording or an observed interaction report for behavior that a still cannot
show. Include reduced motion and every color mode the surface promises to support.

For connected routes, extend this review with
[reviewing-a-journey.md](./reviewing-a-journey.md), following the complete task and
recovery rather than judging isolated screens. For temporal behavior, use
[reviewing-motion.md](./reviewing-motion.md) to retain and inspect playable
evidence or a timestamped frame sequence with its limits. For identity-bearing
media and fonts, verify the actual assets, responsive crops, and fallbacks using
[creating-design-assets.md](./creating-design-assets.md).

```bash
npx sable grade src --json
npx sable grade --template > design/review.json
```

The first command reports `sourceHash`. Copy it into `build.sourceHash` in the
review template for the source you captured. Source changes invalidate that record;
re-capture affected states and update the hash after a repair. Artifact paths are
relative to the review JSON. The fingerprint covers all non-test files in the
supplied targets and Sable's runtime implementation, registry, and lint contract.
Use `sable grade src public --json` when images or fonts live in `public`; remote
resources are outside its coverage. Keep review JSON and captures outside those
targets so the review does not fingerprint itself. On shells with non-UTF-8
redirection defaults, save the template as UTF-8 JSON.

Source fingerprints normalize CRLF to LF in known text formats so the same
checkout remains identifiable on Windows and Linux. Binary assets and artifact
hashes retain their exact bytes. Before/after iteration records must reference
distinct capture files; assigning a second artifact ID to one file is insufficient.

Each artifact also requires a `sha256` hash of its inspected bytes. Running the
grader with `--review` reports `review.artifactHashes` for the current files. Copy
those values into artifact records only after inspecting the corresponding files;
replacing a capture at the same path then makes the review incomplete. Neither
the source fingerprint nor an artifact hash proves someone inspected the screen.

## Review these eight dimensions

| Dimension id | Look for concrete evidence |
|---|---|
| `purpose-story` | The user's task is clear, copy is specific, evidence precedes a request to act, and sections advance the story or workflow. |
| `hierarchy-type` | A clear focal point, meaningful contrast, intentional wrapping, legible real fonts, and a valid heading outline. |
| `layout-rhythm` | Shared anchors, coherent spacing relationships, useful density, and appropriate grouping rather than repeated default boxes. |
| `color-material` | Surface and ink pairs remain legible, accent has a job, imagery fits the direction, and all interactive states work. |
| `interaction` | The primary flow completes; hover, focus, loading, errors, empty states, and success communicate what happened. |
| `motion` | Transitions explain a change, timing suits use frequency, interruption behaves, and reduced motion keeps content available. |
| `responsive` | Content priority survives narrow widths, controls remain operable, text and media fit, and intended scroll regions are discoverable. |
| `accessibility` | Keyboard order, visible focus, names/roles, contrast, announcements, and touch targets work in the rendered context. |

For dense catalogues, inspect actual item names and values at phone width. A
table that fits the viewport can still crush its identifying column into a few
characters per line. Choose a readable row/card adaptation or a clearly
discoverable scroll region, preserving labels and access to the required fields.
Check long names, not only short placeholders. Inspect edge fades over the first
and last items too: a scroll hint must not wash out their text or actions.

For each dimension use `pass`, `revise`, or `untested`, with a specific observation
and supporting artifact IDs. Record the required behavioral checks separately:
`primary-flow`, `keyboard`, `overflow`, and `reduced-motion`. Do not mark a check
passed just because a component's underlying primitive supports it.

Before polishing, operate the first useful action from a fresh opening state at
both widths. A desktop sidebar often lands after a long introduction on mobile.
Check whether that order serves this task. When explanation genuinely comes
first, provide and test a clear route to the action; do not universally force a
button above the fold. Record what the visitor can understand and do before
scrolling, and what the next scroll reveals.

Inspect section boundaries and layered imagery at normal size and increased text
size. Negative margins, fixed-height heroes and positioned decoration can clip
labels or obscure live controls even when there is no horizontal overflow and
the heading outline is valid. Check that every control's visible area is also
clickable. Prefer a separate space for decoration when overlap has no purpose;
keep intentional overlaps only after verifying text, hit targets and narrow
layouts. An accessibility scan alone cannot settle this visual check.

Use opaque `focus-visible:ring-ring` or `ring-sidebar-ring`; reducing the ring to
`/40` or `/50` alpha can erase its contrast against the surface. The shared
`faded-focus-ring` rule catches those classes. A token contrast report establishes
the tested pairs, not the entire rendered product's accessibility.

A label on a filled role (a primary or destructive Button, the sidebar's active
item, a highlight, a success or warning badge) should clear 4.5:1 and APCA Lc 60 in
both modes. A colour retuned for dark mode often lands where dark ink passes the
ratio but reads muddy. `label-contrast`
in `sable lint` and `sable preset --check` find it and suggest the nearest pair
that reads; offer that pair. Keep a pair the user chose deliberately, recorded with
its reason (a lint disable or a preset `exceptions` entry), instead of overriding
it to finish.

Describe a defect as a visible or behavioral consequence: "The heading wraps to
six lines at 390px and pushes the action below the intended first decision point."
Then record the repair and before/after artifact IDs in `iterations`. Avoid vague
scores such as "feels 9/10 premium." Mark unsupported or uninspected claims untested.

```bash
npx sable grade src --review design/review.json --json --strict
```

The evidence validator checks the record's completeness, artifact existence, and
source identity. `review-recorded` means the stated review is complete; it is not
an independent visual judgment. `evidence-incomplete` and `revision-needed` must
not be presented as approved work. Keep remaining issues explicit in `openIssues`.

For system changes, prove transfer with distinct original surfaces whose
information architecture differs: for example, a reading or persuasion page and
an operating tool. Keep the same content truth across iterations. Compare the
results against each brief, rather than against how closely they resemble Sable's
existing reference pages. Then capture a conditional lesson using
[learning-from-builds.md](./learning-from-builds.md).
