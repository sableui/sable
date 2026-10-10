# Task: develop taste and range with Sable

Taste is contextual judgment: deciding what deserves emphasis, which relationships
make a composition coherent, and whether the result serves its audience. The
accessibility, semantic-token, and behavior contracts are the floor. A consumer's
type character, density, imagery, spatial rhythm, shape, and motion can vary.

## Read a small, contrasting reference set

```bash
npx sable atlas --search "editorial image hierarchy" --contrast --limit 3 --json
npx sable atlas --show <reference-id> --json
```

Open the returned `evidence[].absolutePath` images with the agent's image viewer.
Reading the annotations without viewing the captures does not establish visual
understanding. The atlas is the project's own (`.sable/atlas/atlas.json`) and works offline;
the package ships none, and an empty result means working from the user's
references. Images are reference evidence, never assets to copy into a new
brand's product.

Choose references for the audience and information problem. Retrieve one close
analogue and at least one useful contrasting approach when the brief is open.
Search is contextual lexical retrieval with family diversity, not semantic image
search or an aesthetic ranking. `--mode` and `--family` are hard filters. A result
can be irrelevant despite matching a word; no result is better than inventing a
connection. `sable atlas --check` detects changed or missing captures.

For each reference, name one relationship that transfers and one boundary. For
example, an image can carry the primary claim while navigation recedes. That does
not make tiny navigation or a long loading sequence suitable for a public service.
Gallery inclusion is discovery provenance. Read the recorded limitations and
distinguish a captured state from observed temporal behavior.

## Express a direction as choices

Keep the factual brief fixed. Describe composition, typography, density, imagery,
story, and motion as relationships that can be seen or operated. Include spacing
and color decisions in the rationale and consumer-owned theme. State how the
direction adapts to smaller viewports and how its primary interaction works.

Coherence matters within a design; range matters across the set of designs. A
strong result can be bright, dense, playful, quiet, expressive, or austere. Avoid
turning familiar signals such as serif headlines, beige surfaces, dark canvases,
hairlines, pills, and oversized type into unconditional definitions of quality.
Avoid prohibiting these choices universally for the same reason.

When the direction depends on assets, continue with
[creating-design-assets.md](./creating-design-assets.md): specify and realize
the subject, treatment, crop, font source, and delivery constraints. Carry the
chosen direction across a full task with
[reviewing-a-journey.md](./reviewing-a-journey.md), and assess temporal quality
using [reviewing-motion.md](./reviewing-motion.md). Read these when relevant;
three first-view studies alone do not establish full-product consistency.

## Compare rendered alternatives

Start alternatives from different answers to the user's problem, rather than
assigning an editorial, poster, and dashboard look to every brief. For each
proposal state what the visitor should notice first, how they reach the first
useful action, and what information remains visible while deciding. Then choose
type, color, imagery and density that support that answer. Those familiar styles
remain valid when the brief warrants them; their presence is not evidence of range.

Compare across recent builds as well as within this set. If unrelated briefs keep
receiving the same headline treatment, section order and card geometry, revisit
one direction's information structure. Do not introduce novelty that makes the
task harder merely to increase difference. Record that tradeoff explicitly.

When requested alternatives or a consequential design choice needs comparison,
build bounded studies: the first
viewport and one representative interaction, including a mobile adaptation.
Use the same content and function. Change composition or information rhythm as
well as another meaningful axis. Palette swaps alone do not explore a direction.
For a small refinement or a user-pinned identity, keep the existing direction and
compare only the decision in question. A new build can proceed directly from its
brief and selected preset. The `explore` tool requires three to six evidence-bound
directions; smaller comparisons can be delivered directly.

```bash
npx sable explore --template > design/exploration.json
npx sable explore --check design/exploration.json --json
npx sable explore --compare design/exploration.json --json
```

Fill the template after rendering, with project-relative artifact paths and exact
SHA-256 hashes. Each direction needs desktop, mobile, and interaction evidence.
The validator checks declared differences and file integrity. It cannot determine
whether different prose describes visually identical layouts; inspect the images.
An interaction screenshot proves a state, not easing, duration, or interruption.
Observe behavior or retain a recording when temporal quality is being assessed.

Open the generated comparison HTML. It initially hides direction names and
rationales so the brief and rendered work lead the judgment. Inspect the captures
at a useful size. A comparison can end in a tie. Develop the selected direction,
then perform the full rendered review and repair the observed defects.

When work has a time or cost limit, make the bounded studies runnable early and
reserve time for an actual first-use check. Prioritize the primary flow, loaded
assets and narrow-screen layout before extra explanatory records. Save a small
checkpoint after each direction: files produced, states operated, defects found,
and checks still untested. A timeout with screenshots is still an incomplete run;
do not silently retry it as though the failed attempt never happened.

## Keep personal judgment separate from craft lessons

The comparison page exports a preference JSON; it does not silently write to a
project or update a model. Record the exported file from the project root:

```bash
npx sable prefer --record design/preference.json
npx sable prefer --search "hierarchy" --scope project:example --json
npx sable prefer --check --json
```

Record the chosen option or tie, both accepted and rejected alternatives, the
reason, the brief, scope, and the actual reviewer. Supported scopes are personal,
project, brand, and task-type. Search requires a scope so a choice for one context
does not quietly become a rule everywhere. Human attribution is self-reported;
the offline CLI cannot authenticate the reviewer. Never author an agent's choice
as a human preference. Agent observations are excluded from retrieval by default;
use `--reviewer agent` or `--reviewer all` when explicitly reviewing those records.

Version the `.sable/preferences/` records with their evidence. Bring a record to
another project deliberately with its linked artifacts and matching scope; there
is no hidden cross-project collection. A saved record affects the next build only
when an agent retrieves, inspects, and applies it. Respect explicit current user
instructions over earlier preference records. Keep counterexamples and changed
preferences as new records rather than rewriting a past decision.

Use `sable learn` for observed causal lessons, such as a text-control collision
under zoom. Use `sable prefer` for judgments among viable alternatives. Promote a
lesson into general guidance only after reviewing its transfer to another domain.

## Test transfer, quality, and range independently

Use the local comparison HTML generated by `sable explore --compare` when
alternatives need review. Attribute choices to the actual reviewer; agent
observations do not become human preferences. For a reusable design input,
follow [creating-a-preset.md](./creating-a-preset.md).

Freeze unfamiliar briefs and their content. Compare the old workflow against the
new one under the same model, time/effort budget, assets, and task constraints.
Keep the test briefs out of reference curation. Preserve source and rendered
artifacts for each run; do not edit a frozen baseline to improve its score.

Review anonymously, with ties allowed, against audience fit, hierarchy, spatial
rhythm, color/material coherence, interaction clarity, motion, and adaptation.
Check task completion and accessibility separately. Compare stylistic range
across the batch; novelty does not excuse poor usability or an incoherent page.
Independent agent critique is useful evidence, not a substitute for actual human
preferences. Calibrate any automated ranking against human comparisons before
claiming that it predicts a person's taste. A few proof builds establish workflow
feasibility; repeated held-out comparisons are needed to establish a quality lift.

This process improves retrieved context, decisions, and memory. It does not
fine-tune the agent's underlying model or guarantee universal aesthetic quality.
