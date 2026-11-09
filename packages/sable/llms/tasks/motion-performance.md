# Diagnose motion performance

Record the interaction, representative content, browser and device before changing
the driver or CSS. Separate scripting, style, layout, paint and compositing.
Source scans, screenshots and a fast machine cannot establish frame rate.
Compare the same action and data after the repair.

| Symptom | Investigate | Appropriate repair |
| --- | --- | --- |
| Pointer movement slows as content grows | React commits, inherited variables, repeated geometry reads | Coalesce samples to one frame; write locally; read before writing; cancel obsolete work |
| Motion stalls during navigation | Long main-thread work and the actual driver | Let CSS/WAAPI own a suitable transition; reduce unrelated blocking work |
| Resizing moves a large page each frame | Layout scope and the required geometry | Bound the region; use useAutoSize when real flow must change |
| Blur or shadow is expensive | Paint area, layer size and target browser | Reduce area/effect after measurement; test replacements across browsers |
| A surface shifts when motion starts | Promotion and rasterization | Try temporary will-change only for a measured benefit, then remove it |

Prefer transform and opacity when they preserve the result. Scaling text is not
equivalent to changing panel height. Current Sable uses bounded layout transitions
in disclosure, useAutoSize, NumberTicker and intrinsic control sizing. Name and
measure the tradeoff instead of applying a blanket ban on layout properties.

CSS and WAAPI can allow compositing; neither guarantees hardware acceleration.
Filters and clip paths require browser/device evidence. A small blur is a starting
point, not a universal safe threshold. Do not replace shadows with filters solely
because a property table calls them cheaper.

Keep semantic React state for selected values. Visual pointer samples do not need
a render. Schedule at most one requestAnimationFrame, keep the latest sample, and
read geometry before writes. Write transform on the owned element or use a
non-inheriting registered property. A changing inherited custom property can
invalidate a large subtree. Cancel frames on leave, pointercancel, unmount and
motion-policy changes. Preserve consumer handlers and defaultPrevented behavior.
Tilt is a small reference implementation.

Avoid persistent will-change on every tile. Stop expensive JS loops offscreen or
in hidden documents; never start an expressive loop when expressive motion is off.
Bound simultaneous animations. Fewer commits or geometry reads support a cost
reduction, not a claim of 60/120 FPS. A narrow viewport tests layout; phone GPU,
touch and software-keyboard behavior require device testing. Keep zoom, selection
and normal scrolling available.

References: [Emil Kowalski's performance guidance](https://github.com/emilkowalski/skills/tree/main/skills/animation-performance),
[web.dev](https://web.dev/articles/animations-guide),
[MDN will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change).
Adapted as reference material; see [third-party notices](../../THIRD_PARTY_NOTICES.md).
