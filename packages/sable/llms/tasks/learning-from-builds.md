# Task: learning from audits and builds

A useful lesson connects a decision to an observed consequence and says where it
stops applying. "Use bigger type" is not enough. "A display-led section lost its
hierarchy when the feature title used the compact card tier; matching the tier,
measure, and surrounding spacing restored emphasis" is a testable lesson.

## Retrieve before inventing

```bash
npx sable learn --search "motion workspace" --json
npx sable learn --show motion-needs-a-reason --json
```

The command reads packaged precedents and the current project's
`.sable/lessons/*.json`. It works offline at the installed package version and
does not require a plugin. Entries carry `appliesWhen`, `avoidWhen`, origin,
confidence, and evidence. A search match is a candidate; inspect the conditions
before applying it. Curated precedents preserve earlier observed failure mechanisms
in shipped markdown. They are not fresh tests of the current build.

## Record observed consequences as lessons

After [reviewing-a-design.md](./reviewing-a-design.md), distill zero or one new
lesson unless several independent discoveries warrant records. Search first to
avoid duplicates. Record the failed hypothesis too when it explains a boundary.

```bash
npx sable learn --template > design/lesson.json
```

Fill the template with a specific id, searchable tags, mode/register, principle,
conditions for applying and avoiding it, observed before/after change, date,
reviewer, source build, and Sable version. Evidence paths are relative to the
project root, unlike review artifacts which are relative to their review JSON.
Link distinct, existing before and after artifacts and describe what was observed.
Reference the associated design review in the source description.

```bash
npx sable learn --record design/lesson.json
npx sable learn --check
```

Run from the project root. Recording writes a new `.sable/lessons/<id>.json` with
exclusive creation; it refuses duplicate ids and never edits the installed package.
Version those files with the project and retain the linked artifacts. Package
upgrades preserve this local memory. Missing artifacts are reported as errors, not
silently ignored. The CLI does not send evidence anywhere.

All local records remain `provisional`, including a human's record. Artifact
existence validates traceability, not the reviewer's conclusion. Reuse a lesson in
a different composition or domain before treating it as broad guidance. If it
fails, preserve that counterexample in a distinct, related lesson rather than
rewriting history. Maintainers can curate repeated, scoped findings into bundled
precedents with a source record and explicit transfer boundaries.

## Keep learning portable

Store general decisions in lessons; keep customer data, brand assets, and detailed
private audit captures in the project evidence. Distributed precedents should be
neutral and specific. A visual technique should never become a global rule just
because it worked for one dark technical page. Typography weight, square versus
round shape, accent restraint, and scroll choreography all depend on the brief.

Use the package CLI to retrieve guidance, build, inspect, and record what you learn.

## Record preferences in their own memory

`sable prefer` stores comparisons between rendered alternatives, a choice or tie,
the reason, reviewer, and personal/project/brand/task-type scope. It does not turn
a subjective choice into a correctness rule. `sable explore` creates the local
comparison interface and export. See [developing-taste.md](./developing-taste.md)
for the visual atlas, scoped retrieval, comparison workflow, and transfer tests.
Only label a record human when it reflects an actual human's stated judgment.
