# Ember — art direction

Style vocabulary only. Never describes subject matter: an illustration prompt composes this spec with a subject derived from the build's own content, never from the reference this theme came from.

## Light as the accent

The accent's primary role is **illumination, not fill**. Its signature gesture is a radial bloom behind a subject, falling off steeply into the warm near-black ground. Where the accent IS used as fill it is total and full-bleed — an entire band, edge to edge — never a tint, a panel, or a soft wash. There is no intermediate tinted surface anywhere in this system.

## Two registers, deliberately unblended

1. **Photographic / rendered** — high-contrast silhouettes against saturated coloured light. Deep crushed blacks with no midtone detail in the subject, steep falloff, a hot core desaturating outward. No visible background elements. Editorial and cinematic rather than product-lit. This register lives on the dark grounds.
2. **Soft-body 3D "clay"** — matte puffed volumes with rounded bevelled edges, cream and warm amber only, diffuse ambient occlusion, a soft contact shadow, no specular highlights. Toy-like but precise, floating slightly above a pale neutral gradient. This register lives exclusively on the light band.

The two never mix within a section. Placing a clay render on a dark ground, or a crushed-black silhouette on the light band, breaks the system's logic.

## Registration chrome

The recurring non-illustrative device: tick rulers along section edges (1px hairlines at ~9px intervals, interrupted by bold labels where they mark something real), full-height hairline crosshairs, small triangle position markers, and micro-labels pinned to the far left and right edges of a band. The vocabulary of a measuring instrument laid over an editorial layout.

This is what keeps a maximal accent from reading as loud — and it is the highest-fidelity device available to a build with no licensed imagery, since it is pure CSS. Keep every element at the `border` token value or below; the moment the chrome competes with content it stops reading as substrate.

## Line-icon language

Single-weight accent strokes, rounded joins, geometric construction, drawn at a consistent ~24px optical size, sitting alone at the end of a row. Never filled, never multi-colour.

## Surface treatment

No texture, no grain, no noise, no glass, no blur-for-its-own-sake. Every surface is perfectly flat. All visual richness comes from photographic light and from render form — never from applied surface effects. Elevation is absent by design: separation is carried by hairline borders and by hard, full-bleed ground changes.
