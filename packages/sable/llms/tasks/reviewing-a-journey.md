# Task: review a complete product journey

A polished opening can lead into an incoherent or unfinished product. Use this
workflow when the request spans connected routes or a meaningful sequence of
states. It extends [reviewing-a-design.md](./reviewing-a-design.md); a one-control
refinement does not need a product-wide audit.

## Define the path and what must stay consistent

Write the user's starting situation, intended result, and the shortest meaningful
path. Include a recovery or reversal that matters to that task. For example:
discover a workshop → inspect details → choose date and seats → enter attendee
details → confirm → revisit, change, or cancel the booking. A demo may keep data
locally, but must communicate that boundary and demonstrate its actual outcome.

Keep a compact journey record beside the brief. Use a table or project-owned JSON;
this is not a new Sable CLI schema:

| Step | Route/state | User question and action | Carries forward | Review evidence |
|---|---|---|---|---|
| Choose | Workshop detail | Is this suitable, and which date works? | Workshop, date, seat count | Actual desktop/mobile state and exercised selection |
| Commit | Attendee form | What is required, and what happens next? | Selection plus valid entries | Error, correction, pending, and success where implemented |
| Return | Booking detail | What did I arrange, and how can I change it? | Confirmed result and current status | Re-entry, change, cancellation, or recovery |

Record shared terms, navigation, type roles, color meanings, action hierarchy,
form treatment, spacing anchors, and motion policy once. Preserve those across
the path. Allow purposeful differences: discovery can be expressive while entry
is compact and confirmation is calm. Consistency does not mean identical layouts.

## Review transitions as well as screens

Operate the primary path with real state changes. Check the selected item, count,
price or other task facts where present; do not silently reset them between pages.
Inspect forward navigation, browser Back, re-entry, and refresh according to the
product's promised persistence. Use isolated fixtures for local testing.

A successful storage write is only half of persistence. Confirm a record, reload
with the same browser storage, and verify that the UI restores the exact saved
choice. Then change it, cancel it, and reload again. Test invalid stored data or
denied storage when the app claims to handle them. A confirmation screenshot and
the presence of a localStorage key do not prove restoration. When an edit is
abandoned, preserve the last confirmed record unless the user explicitly deleted
it; describe save and removal failures according to what may survive a reload.

Exercise the relevant failure and recovery cases: unavailable choices, validation,
slow or failed saves, empty results, duplicates, and cancellation. Select cases
from the actual behavior rather than adding a checklist of imaginary features.
User input should survive a recoverable error when appropriate; retry should not
silently duplicate an action. A success message must describe what really happened.

Follow keyboard focus through each transition and through removal of a focused
control. Check headings, names, visible focus, and announcements in context.
Repeat the important path on a narrow viewport using touch-sized controls; a
stacked layout alone does not prove mobile completion. Review supported color
modes and reduced motion. Use [reviewing-motion.md](./reviewing-motion.md) for
behavior whose quality depends on time or interruption.

## Compare the whole path visually

Create a contact sheet or local review page in journey order, with full-size
captures available. Look for drift that is difficult to notice one page at a time:
changing content width without a task reason, multiple names for one action,
inconsistent primary-button hierarchy, unstable selected/error colors, changing
font character, unrelated empty-state art, or large jumps in density.

Then revisit each transition live. The contact sheet cannot prove preserved
state, focus destination, completion, or animation quality. Distinguish deliberate
changes in emphasis from accidental inconsistency; do not flatten every route
into the same shell to make the sheet look uniform.

## Repair and keep the evidence honest

Fix the smallest shared cause when a defect repeats. Review at least the affected
routes after changing a shared token or component; a local fix that shifts every
form is not contained to the screenshot where it was noticed. Preserve the
selected identity unless the user asks for a new direction.

Retain the journey table, route/state captures, relevant interaction reports or
recordings, source identity, and unresolved items. Existing `sable grade` review
records can reference these as screenshot, recording, or report artifacts. Their
hashes establish identity, not that the journey was correctly exercised. Report
which path completed, which failures were tested, and which boundaries remain
simulated or untested. A working isolated journey is evidence of that journey;
broader product reliability and preference claims need broader evaluation.
