# Task: review motion as playable behavior

Use this workflow when a meaningful transition, direct manipulation, media, or
story depends on time. Sable already supplies motion tokens and behavior
primitives. This guide reviews their composition and any external driver. A
deliberately static arrival is valid; every surface does not need animation.

## State what the movement should explain

For each behavior under review, record the trigger, the elements or state that
change, the intended relationship, the driver, and the expected final state.
Include duration or scroll range when known, easing, interruption/reversal,
keyboard/touch equivalence, and the reduced-motion result. For a reference, keep
observed behavior separate from a proposed recreation.

Example: expanding a selected workshop exposes its details while retaining the
date choice. Repeated toggles should end in the user's latest requested state,
without an invisible focus target or an extra queued transition. Reduced motion
can reveal the same content immediately while preserving focus and feedback.

## Capture the kind of evidence the claim needs

| Evidence | What it establishes | What it does not establish |
|---|---|---|
| Still screenshot | A visible state at capture time | Duration, smoothness, trigger, or reversal |
| Timestamped frame sequence | Sampled states and their recorded capture times | Continuous motion between samples or a measured frame rate |
| Playable recording | The recorded sequence, including visible response to actions | Other devices, refresh rates, or unrecorded inputs |
| Runtime event/animation report | Logged events, computed values, or declared timing | Perceived quality or that every declared animation ran |

Use a recording when available. Otherwise retain real sampled frames and a
small manifest listing their order, timestamps, actions, and observed outcomes.
Do not synthesize intermediate frames or assign evenly spaced timestamps to
captures that were not taken that way. If recording is unavailable, say so;
observed behavior can still be reported with its limits.

Record viewport, route/state, color mode, full/reduced motion, input actions, and
capture conditions. Preserve the real playback speed. A slowed study copy may
help inspection, but label its retiming and retain the original. Mask or avoid
private data before capture. Include the source hash and hashes of final artifacts.

## Make the evidence inspectable

Provide a local review page with playback controls, or an ordered frame viewer
with previous/next controls and visible timestamps. Do not autoplay a review
recording. For a video, native controls are sufficient:

```html
<figure>
  <video controls preload="metadata" poster="open-menu.webp"
    aria-describedby="motion-note" src="menu-toggle.webm"></video>
  <figcaption id="motion-note">
    Desktop, full motion. Open, close during entry, then reopen.
    This recording shows the observed run, not a performance benchmark.
  </figcaption>
</figure>
```

Use actual files from the run, provide text describing the actions and outcomes,
and captions or an equivalent transcript when meaningful audio is present. Open
the saved review artifact and confirm it plays or advances correctly; a file's
existence alone is insufficient.

## Test the behavior, including interruption

Operate the trigger, reverse it before completion, repeat it, and navigate or
resize during it when those are plausible product actions. Check that the final
state matches intent, input does not queue unexpectedly, focus remains usable,
and canceled work does not report success. Inspect the behavior at normal speed:
is the response immediate enough for its frequency, and does the movement explain
the change without delaying access to content?

Repeat relevant behavior with reduced motion enabled. This should preserve state,
focus, status, and controls; hiding the animated content is not an equivalent
result. Test a custom driver directly—Sable's policy cannot disable an unrelated
animation by itself. Pause or otherwise control meaningful persistent media as
appropriate to the surface, and verify its static/loading fallback.

## Record conclusions at the right confidence

Separate source-declared timing, runtime measurements, and visual observations.
A CSS duration is not elapsed end-to-end latency. State where a value was measured
and what the measurement covers; avoid precise timing claims from visual guesses.
Use specific findings such as "closing during entry left focus in the hidden
panel," then retain the repaired run beside the original.

The existing `sable grade` review schema accepts `recording` and `report`
artifacts as well as screenshots; see [reviewing-a-design.md](./reviewing-a-design.md)
for their hashes and required context. A frame manifest can be a report, with its
linked frame files preserved. The validator checks the referenced artifact bytes,
not every link inside a report or the quality of playback. Keep full and reduced
evidence distinct, mark unexercised behaviors untested, and promote a motion
lesson only within the contexts the observation supports.
