---
name: DSA self-paced (kartikvyas.in /dsa)
description: One railway line of stations; lessons are timetable rows and pointers run like trains along numbered platforms.
colors:
  board: "#f4c430"
  board-deep: "#e2ae12"
  board-pale: "#fdf3cf"
  ink: "#141414"
  ink-2: "#3a3a37"
  ink-3: "#66655f"
  ground: "#ffffff"
  ground-2: "#f3f3f0"
  ground-3: "#e9e9e4"
  rule-soft: "#d6d5cf"
  platform-blue: "#1e5aa8"
  platform-blue-deep: "#164683"
  platform-blue-pale: "#e6eef8"
  signal-red: "#b3282d"
  signal-red-pale: "#fbeaea"
  syntax-string: "#8a5300"
  syntax-number: "#7a2f8f"
  syntax-builtin: "#0d6b6b"
  syntax-comment: "#74736c"
typography:
  display:
    fontFamily: "Archivo, 'Arial Narrow', sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 116"
  invariant:
    fontFamily: "Archivo, 'Arial Narrow', sans-serif"
    fontSize: "1.55rem"
    fontWeight: 750
    lineHeight: 1.28
    fontVariation: "'wdth' 106"
  headline:
    fontFamily: "Archivo, 'Arial Narrow', sans-serif"
    fontSize: "1.65rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 110"
  title:
    fontFamily: "Archivo, 'Arial Narrow', sans-serif"
    fontSize: "1.2rem"
    fontWeight: 750
    fontVariation: "'wdth' 104"
  body:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.66
  lede:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "1.3rem"
    fontWeight: 400
    lineHeight: 1.55
  ui:
    fontFamily: "Archivo, 'Arial Narrow', sans-serif"
    fontSize: "15px"
    fontWeight: 650
    lineHeight: 1
    fontVariation: "'wdth' 104"
  label:
    fontFamily: "Archivo, 'Arial Narrow', sans-serif"
    fontSize: "12.5px"
    fontWeight: 750
    letterSpacing: "0.02em"
    fontFeature: "'tnum'"
  plate:
    fontFamily: "Archivo, 'Arial Narrow', sans-serif"
    fontSize: "15px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.06em"
    fontVariation: "'wdth' 125"
  code:
    fontFamily: "'JetBrains Mono', ui-monospace, Consolas, monospace"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: "0px"
  hairline: "2px"
  train: "6px 6px 2px 2px"
  node: "50%"
spacing:
  gutter: "32px"
  gutter-sm: "16px"
  wrap: "1240px"
  column: "66ch"
  rail: "200px"
  column-gap: "48px"
  fig-stage: "26px 22px 18px"
components:
  button-default:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.hairline}"
    padding: "0 16px"
    height: "40px"
  button-default-hover:
    backgroundColor: "{colors.ground-2}"
  button-board:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.hairline}"
    padding: "0 16px"
    height: "40px"
  button-board-hover:
    backgroundColor: "{colors.board-deep}"
  button-board-disabled:
    backgroundColor: "{colors.board-pale}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.board}"
    rounded: "{rounded.hairline}"
    height: "40px"
  button-sm:
    padding: "0 11px"
    height: "32px"
  plate-lg:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.board}"
    typography: "{typography.plate}"
    rounded: "{rounded.none}"
    padding: "14px 16px 13px"
  plate-md:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.board}"
    typography: "{typography.plate}"
    padding: "7px 9px 6px"
  plate-sm:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.board}"
    padding: "5px 6px 4px"
  plate-blue:
    backgroundColor: "{colors.platform-blue}"
    textColor: "{colors.ground}"
  plate-muted:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink-3}"
  station-board:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    padding: "26px 0 24px"
  figure-head:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    padding: "9px 16px 8px"
  figure-stepno:
    backgroundColor: "{colors.platform-blue}"
    textColor: "{colors.ground}"
    padding: "5px 7px 4px"
  platform-index:
    backgroundColor: "{colors.platform-blue}"
    textColor: "{colors.ground}"
    height: "20px"
  cell:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    height: "52px"
    width: "48px"
  cell-mid:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
  cell-found:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
  cell-violated:
    backgroundColor: "{colors.signal-red-pale}"
    textColor: "{colors.signal-red}"
  timetable-row-current:
    backgroundColor: "{colors.board-pale}"
    textColor: "{colors.ink}"
  verdict-ok:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
  verdict-bad:
    backgroundColor: "{colors.signal-red-pale}"
    textColor: "{colors.signal-red}"
  verdict-info:
    backgroundColor: "{colors.platform-blue-pale}"
    textColor: "{colors.platform-blue-deep}"
  segmented-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.board}"
  field:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.hairline}"
    padding: "0 10px"
    height: "34px"
---

# Design System: DSA self-paced (kartikvyas.in /dsa)

## Overview

**Creative North Star: "Trains at a Glance"**

The course is one railway line, drawn the way an Indian Railways station board and timetable booklet are drawn. Every station has a four-letter code (BSRC, ARRS, RECR) set in a black plate; every lesson is a stop on that station's route strip; every list of things to do is a timetable of dense rows between black rules. Inside lessons, an array is a row of numbered platforms and its pointers (lo, mid, hi) are trains, one rail each, stepping a whole platform at a time.

The frame is loud and the reading is quiet. Station-board yellow with black lettering in an expanded, heavy grotesk owns headings, plates and the one invariant line per lesson. Everything a student reads at length is set in a serif on plain white. Colour carries little meaning on its own: every state is shown by a mark (a frame, a hatch, a double rule, a strike) so the system works in greyscale and for colour-blind students.

The world is flat, square and ruled. Depth comes from rule weight (3px, 2px, 1.5px, 1px), not shadow. Motion is one whole step at a time; a tree whose shape changes glides to its new shape over 420ms.

The whole section is scoped under the `.dsa` root so it can move into kartikvyas.in; the platform bar and breadcrumb above it are a neutral system-font stand-in for the host site and are not part of this world.

**Key Characteristics:**
- Yellow board, black plates, white ground, serif prose.
- Four-letter station codes in black plates name every place in the course.
- State by mark, never colour alone: current, eliminated, found, violated each have a shape.
- Four rule weights do the work shadows do elsewhere.
- Square corners; round only for route dots, station nodes and trains.
- Every figure is a pure function of "step n of N".

## Colors

A two-voice palette: board yellow and ink black carry the world, platform blue marks position, signal red marks failure, and there is no green.

### Primary
- **Station-Board Yellow** (board): the station board band, the invariant band, the solved band, the primary "Next step" and "Practice" actions, the mid and found cells, plate lettering on black. Hover deepens to **Board Deep** (board-deep); disabled and quiet highlight drop to **Board Pale** (board-pale), which also fills the current timetable row and marked code lines.
- **Board Ink** (ink): all lettering, every structural rule, plate backgrounds, the figure head bar, pressed segmented buttons, the mid train, "done" route dots and station nodes, true predicate chips.

### Secondary
- **Platform-Number Blue** (platform-blue): position only. Index plates above array cells, the "you are here" route dot and station node (with a ground-and-blue halo ring), the current contents-rail entry, the step-number plate in figure captions, the window bracket over the array, the scrubber thumb, leg letters on the course map, the hover state of route-strip end plates. It also serves the interaction layer: text links, the focus ring, the caret and keyword highlighting in code. **Blue Deep** and **Blue Pale** pair only in the informational verdict.

### Tertiary
- **Signal Red** (signal-red) with **Red Pale** (signal-red-pale): failure and violated invariants only. A violated cell (red strike on pale red), an emptied or broken window bracket, a failing verdict, failing test states, the runtime error dot, a parcel day over capacity, the top rule and title of a warning note, the boot error box.

### Neutral
- **White Ground** (ground): the page, figure stage, cells, buttons at rest.
- **Ground 2** (ground-2): code block fill, figure variant bar, inline code chips, practice work pane, hover fill.
- **Ground 3** (ground-3): pressed/active fill, out-of-window index plates, later-leg letters.
- **Ink 2** (ink-2) and **Ink 3** (ink-3): secondary text and muted/locked/to-do states respectively.
- **Soft Rule** (rule-soft): the 1px dividers between timetable rows, station rows, caption and stage, rung rows.
- **Syntax** (syntax-string, syntax-number, syntax-builtin, syntax-comment): code highlighting only, shared by static code blocks and the editor; keywords use platform blue, function names ink at 600.

### Named Rules
**The No Green Rule.** There is no success colour. Success, "found", "solved" and "pass" are ink: a double rule, a filled mark, or the yellow band between heavy black rules. Never introduce green for a later station.

**The Blue Means Position Rule.** Blue answers "where": an index, a platform, a window, you-are-here, the current step. Outside of links and focus, if a blue element does not mark a position, it is wrong.

**The Red Means Broken Rule.** Red appears only when something failed or an invariant was violated. Warnings that are merely advisory use the warning note (red top rule and title), never red fills.

## Typography

**Display Font:** Archivo, variable width axis (with Arial Narrow fallback), the "board" face
**Body Font:** Source Serif 4 (with Georgia), the "read" face
**Label/Mono Font:** JetBrains Mono (with ui-monospace, Consolas)

**Character:** A wide, heavy railway grotesk for everything that is signage, set against a calm book serif for everything that is reading. The width axis is part of the voice: plates run widest (125), the board title 116, headings 104 to 116, running UI at 100 to 104.

### Hierarchy
- **Display** (800, 3rem, 1.02, wdth 116, uppercase, balanced): the station board title only. 1.75rem on compact boards (practice), 2rem under 760px.
- **Invariant** (750, 1.55rem, 1.28, wdth 106): the single loud sentence on the yellow invariant band; 1.28rem on phones.
- **Headline** (800, 1.65rem, 1.15, wdth 110): lesson section headings (h2), which are also the contents-rail anchors. Leg names on the map sit at the same weight, 1.6rem.
- **Title** (750, 1.2rem, wdth 104): lesson h3, station names on the map (700, 1.2rem).
- **Body** (400, 1.125rem / 18px, 1.66): all lesson prose in a 66ch column. Lede paragraph at 1.3rem, 1.55, ink-2. Practice statement 1.06rem; figure captions 1.05rem, 1.5; hint bodies and note bodies about 1.02rem.
- **UI** (650, 15px, wdth 104): buttons, summaries, code block heads, test summaries.
- **Label** (700 to 750, 12 to 13.5px, tabular figures): timetable column heads (12.5px, 0.02em), route stop labels (12px, 0.04em, wdth 112), index plates, predicate chips, metadata.
- **Plate** (800, wdth 125, 0.06em): station codes at 26px (lg), 15px (md), 12px (sm).
- **Code** (JetBrains Mono, 14.5px, 1.6): code blocks and editor; 18px weight 500 in array cells; 12.5px weight 700 on train bodies; 13px for rail names.

### Named Rules
**The Read Mode Rule.** Serif prose never sits on yellow. Yellow carries board-face text only (titles, plates, the invariant sentence, the solved line, button labels). Anything a student reads as a paragraph is Source Serif on white or Ground 2.

**The Caps Are For Boards Rule.** Uppercase is used for the station board title and inside plates, nowhere else. Section headings, figure titles, notes and timetable heads stay in sentence case.

**The Tabular Rule.** Every number that can change or line up (step counts, indices, minutes, test counts, timetable columns) uses tabular figures.

## Layout

A centred wrap of 1240px with 32px gutters (16px under 760px). Full-bleed bands (station board, route strip) run edge to edge with their content in the wrap.

**Lesson page order:** platform bar and breadcrumb (host stand-in), station board, route strip, then a three-track grid: contents rail (200px) | reading column (66ch) | margin (1fr), 48px gaps, 44px top and 96px bottom padding. Figures, code that needs room and the lesson close break out with the "wide" span across column and margin (max 940px). Margin notes take the third track. Under 1120px the grid collapses to one 72ch column, the rail folds into an "In this lesson" disclosure between 1px soft rules, and wide items return to the column.

**Course map:** the line (1fr) beside a sticky 320px aside (running status, progress, legend), 56px gap; under 1020px the aside moves above the line.

**Practice:** problem (0.92fr) | work pane (1.08fr, Ground 2) separated by a 1.5px ink rule, max 1480px. Under 860px the work pane is hidden and a "laptop only" panel (Board Pale, 1.5px ink frame) replaces it.

**Rhythm:** paragraphs 1.05em apart, h2 2.6rem above and 0.8rem below, figures 2rem above and 2.4rem below, invariant 2rem/2.2rem, notes 1.8rem. Breakpoints in use: 760px (phone), 860px (practice), 1020px (map), 1120px (lesson rail).

## Elevation & Depth

Flat. There are no drop shadows in the world. Depth and emphasis come from rule weight and from fills: a heavy 3px ink rule opens or closes a major band (board edges, invariant, solved, lesson close, timetable top, rail lines, leg heads); a 1.5px ink rule frames objects (figures, buttons, cells, code block edges, timetable head, departure cards); a 2px rule marks a state or a moving part (current row, window bracket, strikes, trains, arrows); a 1px soft rule divides rows. Box-shadow appears only as drawn rule work: inset frames on cells and marked rows, and the ground-plus-blue halo ring on "you are here".

### Named Rules
**The Four Weights Rule.** 3px for bands, 2px for marks, 1.5px for objects, 1px for rows. A band opens or closes a major area (board edges, invariant, solved band, timetable top, rail lines). A mark is a rule that signals a state or a moving part rather than framing a thing: the rules around the current timetable row, the warning note's red top rule, the window bracket and its end ticks, strike-throughs on violated values, the dashed target outline, pointer trains and the scrubber thumb, status marks and hint rung numbers, arrows between nodes, and the halo rings on "you are here" and probed plates. An object is a thing with edges (figures, buttons, cells, code blocks, cards); a row is a division inside a list. Do not introduce a fifth weight. The one exception is the 3px heavy frame of the current cell or node, which borrows the band weight on purpose so the current step is the loudest object on the stage; SVG edges in the Links stage are drawn at 1.75px so they read like 2px marks after anti-aliasing.

## Shapes

Square by default (0px). A 2px hairline radius softens only hand-operated controls: buttons, segmented controls, fields, inline code chips and the scrubber thumb. Circles are reserved for the railway geometry: route-strip dots (19px, 3px ink ring), map station nodes (24px, 30px when open), the contents-rail current dot and the found-cell check flag. Trains have a rounded cab (6px 6px 2px 2px) and a triangular coupler pointing up at their platform. Hatching (135° stripes) means eliminated; sleeper-ticked double rails mean track (scrubber, pointer rails, boot progress bar).

## Components

### Station Board
The opening of every page. Full-bleed yellow band between 3px ink rules; grid of black plate (left), uppercase display title, and a sub-line of facts separated by 5px black squares ("Binary search", "Lesson 2 of 6", "14 min"). Optional aside on the right. Compact variant (14px padding, 1.75rem title, md plate) on practice pages. On phones the plate, title and sub-line stack and the square separators drop. At 2rem uppercase the phone column (358px) holds about 14 letters per word; a longer word (COUNTEREXAMPLES) pushes the page sideways. Give that lesson a `boardTitle` in its meta with a soft hyphen (`­`) at the word's natural joint ("counter­examples"). The board then breaks the word only when it must, and lists, links and the tab title keep the plain `title`.

### Plates
Black rectangle, yellow board-face lettering at width 125: the name of a place (BSRC, BSRC-P1, BSRC-3). Sizes lg/md/sm. Blue plate variant marks a position; muted plate (white, ink-3, soft inset ring) marks a station not yet open. A plate is also used once as the label of an invariant band (INVARIANT, COST, RULE).

### Route Strip
White band under the board with a 1px soft bottom rule. Previous station (chevron, sm plate, name) left, next station right; a long station name ("Recursion and backtracking", "Cost: Big-O and friends") wraps to a second, balanced line in its 200px column (13px, line height 1.25) and is never cut with an ellipsis; a hyphenated term in it ("Big-O") is kept on one line (A2 review, 2026-10-26); between them a 3px ink line with one stop per lesson. Stop dot: empty ring = not completed, filled ink = completed, blue with halo = here (label turns blue). Labels are the stop code (BSRC-1..6) in 12px caps-width board face; under 760px only the current label shows (at 11px) and end names hide. End plates turn blue on hover. **Practice strip on phones:** the two end plates share the first row and the stops take their own full-width row below them, with the same current-only label.

### Contents Rail
A 3px ink left rule with section links (14px, ink-2). The current section is blue, bold, with a 9px blue dot sitting on the rule. Sticky at 24px on wide screens; a disclosure under 1120px.

### Timetable
The house list format: map lesson tables, test rows, any tabular comparison. 3px ink top rule, 1.5px ink rule under the head and at the bottom, 1px soft rules between rows, 9px 12px cells, tabular figures, right-aligned numeric columns. **Current row:** Board Pale fill between 2px ink rules, bold. **Future rows:** text made transparent so the row reserves its place. Failing test rows tint pale red and expand to a detail with the authored "why" in serif.

### Figure (visualizer frame)
Anatomy, top to bottom, inside a 1.5px ink frame on white:
1. **Head bar:** ink fill; figure code "FIG BSRC-2.1" in yellow board caps (13px, wdth 120); title in white 15px; keyboard hint at right (hidden on phones).
2. **Variants bar (optional):** Ground 2, label plus a segmented control; pressed segment is ink with yellow text. Changing variant restarts at step 1.
3. **Stage:** 26px 22px 18px padding, horizontal scroll if needed. Holds an array track, number line, parcels, or side-by-side "vs" pair, plus a centred mono readout line with an optional verdict.
4. **Caption:** blue step plate "4/6" then one serif sentence (backticks become inline code). Reserves 4.6em so steps do not jump.
5. **Controls:** 1.5px ink top rule; restart, previous (icon buttons), "Next step" (board button, the primary action), play/pause, the sleeper scrubber with a blue thumb, and "Step 4 of 6" right-aligned.

The figure is focusable; arrow keys, Home and End step it; the URL hash pins a step (#BSRC-2.1:5); each step is announced politely. Autoplay advances every 1300ms.

### Array Track (platforms and trains)
- **Window bracket:** 2px blue bar over the in-window cells with end ticks and a blue label ("if 41 is anywhere, it is in here"); turns red when the window is empty or broken.
- **Index plates:** blue 20px plates with white tabular digits; grey on Ground 3 when out of window.
- **Cells (48px, 36px on phones):** 1.5px ink borders sharing edges, mono values.
- **Predicate row (optional):** T/F/? chips; true is ink with yellow text, false is ink-3 outline, unknown is dashed.
- **One past the end:** the track always reserves one empty slot after the last cell, so a pointer can stand at index n (a slice's `stop`, a loop that has finished). On phones 8 cells plus that slot and the rail names are wider than the stage; wrap such a track in `.track-tight` (33px cells and 12px less stage padding on phones; PYTH-1.1).
- **Rails:** one per pointer, named in mono at left, drawn as a double rail with sleepers; trains are white cabs with ink borders and a coupler, the mid train is ink with yellow text, a blue variant exists for a highlighted pointer. Trains move whole platforms over 220ms.

**State vocabulary (shared by every future figure):**
| State | Mark |
|---|---|
| current / mid | yellow fill inside a heavy 3px ink frame, bold |
| eliminated / out | 135° grey hatching, faded value, grey index plate |
| found | yellow fill inside a double ink rule (3px, 3px yellow gap, 1.5px), bold, ink check flag |
| violated | pale red fill, red value with 2px strike-through |
| target | dashed 2px ink outline inset 7px |
| done (route, map, marks) | solid ink fill |
| part done | half ink fill |
| to do / locked / later | ink-3 outline, dashed track |
| here | blue fill with ground-and-blue halo ring |

### Other Stages (`_components/Stages.tsx`)
Every stage draws one step from plain data and uses the state vocabulary above.
- **CodeTrace:** the program with the running line marked, beside a Variables table (changed rows highlighted) and an optional aside. Code ligatures are off, so `==` reads as two characters.
- **CallStack:** frames listed top first, each "running", "waiting" or "returns x"; header shows the depth. `plain` drops the states, for a stack held in a list (RECR-6.1).
- **Tree:** recursion trees, decision trees and heaps as SVG. Leaves one unit apart, parents centred over children; hidden nodes keep their place so the tree does not jump. States: cur, done, found, out (hatched), dup (yellow AGAIN tag), todo (dashed edge). Edge labels for yes/no or take/skip. Put returned values in the label ("fib(4) = 3"), not in `note`, because notes sit on the edges. Pass `unit` when one label is much wider than the leaves, or the whole tree shrinks. **Edge labels** (`edge`) are ink 11.5px board face with a 4px white halo (`paint-order: stroke`), so a line that passes close never runs through them. One- and two-character labels (trie letters, bits, Huffman 0 and 1) sit beside the middle of the edge, pushed 8px out at right angles to it on its outer side; longer labels (yes, no, take c) start 6px beside the middle (8px on a vertical edge) and run away from the edge.
- **Tree `binary`** (TREE): give each node `side: "L" | "R"` and pass `binary`; nodes are then placed by in-order position, so a lone right child sits to the right of its parent and a search tree reads in sorted order from left to right. Hidden nodes still take their place (an insert does not make the tree jump). Missing children can be drawn as dashed `#` stub nodes (`todo`) where the figure is about them (TREE-7.1). Wrap a tree in `Follow`.
- **Tree `slide`** (BALT, HEAP): each node is a group moved by a CSS transform and each edge a path whose `d` is set as a CSS property, so both glide to their new places over `--slide` (420ms) instead of being redrawn. Keep node ids stable across steps (BALT: one id per key; HEAP: one id per value or entry), so a rotation or a swap moves the nodes. Browsers without CSS `d` (Safari) move the edges at once. In `binary` mode a rotation keeps every node's x (in-order is unchanged) and only changes depths.
- **Tree tags** (`tag`, `tagKind` on a node): a small board-face tag just right of the node, 15px tall, 10px type. `plain` (white, ink rule) for an AVL balance or a name (`x`, `y` in a rotation); `bad` (red) only when the tag shows a broken rule (balance ±2); `ink` (black, yellow letter). Red-black colours are tags, **R** plain and **B** ink: the course never uses the colour red for a red node, because red means a mistake. Trees with tags get 22px more room on the right. A plain tag also names the subtree that moves across in a rotation (`moves`, BALT-2.1); the double rule stays reserved for found. A broken red-black rule (a red node with a red child, BALT-4.1) is never drawn on the nodes, which carry the R tags: the nodes stay plain (the new node `cur`), and the readout line names the two nodes with a red verdict, "a red node has a red child" (owner decision, 2026-10-06).
- **SkipList** (BALT-6, SVG): one row per level, level 0 at the bottom, numbered by blue plates at the left; a grey head column with a dot on every level, the keys' towers as 42×28 boxes in columns 58px apart, a muted None plate at the end of each level. Arrows are the Links edges (1.75px; `cur` 3px for the search path or changed links, `old` dashed, `bad` red). States and edges are keyed `"level:column"` (column −1 is the head). A height of 0 keeps a key's column empty, so a key can be inserted without the others moving. Wrap it in `Follow`.
- **Hatched `out` in SVG stages:** the hatch is set as an inline `fill` style, because the stage CSS (`.tnode rect:first-child`) otherwise paints over the pattern. Tree and Links nodes in the `out` state now show the hatch (TREE-5.1, HASH-7.1, HEAP-4.1).
- **Heap figures** (HEAP): the tree (Tree with `slide`, `level` 58, `unit` 52, non-binary placement: a lone left child sits under its parent) above the list that stores it (ArrayTrack named "the list"). Keep heap figures to 8 values so the list fits a phone without scrolling. Priority-queue entries are labelled `priority, count, task` and use a wider `unit`. Lazy removal (HEAP-4.1) shows the removed entry hatched at the root on its own step before it is thrown away, so the caption and the picture agree. In the k-way merge (HEAP-5.1) the three input lists are three ArrayTracks in a `stage-row` on wide screens and one small Grid (rows A, B, C, taken values hatched, short lists simply end) on phones, so the heap and the output stay on screen.
- **Trie figures** (TRIE): a non-binary Tree with one node per prefix. The node shows the prefix it stands for (the root says `root`), the edge above it carries the letter (`edge`), and an ink `end` tag marks a stored word. Every prefix the figure will ever need is in the node list from step 1, hidden until it exists, and nodes are sorted by prefix, so siblings read in alphabetical order and the tree never jumps. `unit` 84 leaves room for the tags (96 for a compressed trie, whose labels are whole strings; 80 for a trie of 4-bit numbers, whose leaves carry a plain tag with the number). A failed search is not a wrong result: the missing child is a dashed `todo` ghost node, the parent stays `cur`, and the verdict is informational (blue), not red. In a compressed trie a merge removes the middle nodes from the list (so no empty column is left) and the lower node slides up; an edge split adds the new middle node, which was hidden in the same column, and the old child slides down. Every trie figure inks (`done`) the nodes already walked through, the path above the current node, in inserts, searches (found or not), compressed-trie inserts and the bitwise walk alike. On phones the 4-bit trie (TRIE-5.1) narrows to `unit` 60 and shows each leaf's number as a `note` under the leaf instead of a tag; the compressed trie narrows to `unit` 80.
- **Tree forests** (DSUF): every node without a `parent` is a root, and the trees stand side by side in list order, `forestGap` units apart (0.35 by default, 0.4 in DSUF). A tree with one root is laid out exactly as before. Union-find figures draw the forest (Tree with `slide`, `level` 58, `unit` 44, or 50 when roots carry a plain rank tag) above the parent list that stores it (ArrayTrack named "parent"), as heap figures do. Node ids follow the elements, so a union or a path compression moves whole subtrees. The path of a find is `cur`, the root `found`, the root that was just linked `cur` and its new parent `found`; the changed parent cell is `mid`. Ranks: on wide screens a plain tag beside each root; on every width a `rank` ArrayTrack under the parent list (blank for non-roots). On phones the tags are left out and the forest narrows (`unit` 36, `forestGap` 0.06), so a row of 8 single nodes fits 358px.
- **Spans** (RNGQ, HTML): rows of range bars on the same columns as an ArrayTrack of `n` cells. Put the Spans and the track in the same `Named` (the track's name plate goes above both), so they share one scroll box and every bar sits exactly over the cells it covers; the Spans box copies the track's width and left margin (44px, 34px on phones), and row names (`name`) sit in that margin. A bar (`l`, `r` inclusive, counted from the first cell; `label`; `state`; `tag`) is 30px tall with 3px gaps, 1.5px ink frame, mono label; states are the shared marks (`cur` yellow in a 3px frame, `found` double rule, `done` ink, `out` hatched, `todo` dashed, `bad` red). A `tag` is a small ink flag on the bar's top right, used for a pending lazy add (`+3`). Used for Fenwick trees (one row per bar length 8, 4, 2, 1; the track counts from 1 with `base`), segment trees (one row per level; the array cells are the leaves and take the leaf marks), lazy tags, the two blocks of a sparse-table query (rows `1st` and `2nd`) and √n block sums. Keep such arrays to 8 cells. In segment-tree walks (RNGQ-4.1, 5.1) the node or cell being taken is `cur` (heavy frame) on its own step and becomes `found` (double rule) afterwards, and a partly-inside parent gives up its heavy frame while its children are visited, so the caption's node is always the only heavy frame.
- **Timeline** (GRDY, HTML): rows of interval bars placed by time over a numbered axis from `from` to `to`. Bars cover the half-open time `[from, to)` and are placed in percent of the span, so the plot is fluid and always fits the stage (60px per time unit at most on desktop); each bar is 3px narrower than its span, so bars that touch stay apart. Bars are 30px tall, 1.5px ink frame, mono label, and take the shared marks (`cur` yellow in a 3px frame, `found` double rule, `done` ink, `out` hatched, `todo` dashed, `bad` red); a `tag` is a small flag on the bar's top right (`plain` white, `ink`, `bad` red), used for a finish time or a hatched booking's `skip`. Keep tags off bars of 1 time unit, which are too narrow on phones; put such numbers in the readout line instead (GRDY-2.1's lateness). `marks` are vertical lines over the rows: `blue` (2px, blue label plate) for a position in time (`now 5`, `free 8`), `dash` (2px dashed ink-3, white label) for a limit such as a deadline. Row names sit in a 52px left margin (50px on phones, enough for `greedy`). Bars keep their `id`, so a swap of two jobs glides over `--slide`. The axis numbers every unit, every second unit on phones when the span is over 8. The same stage draws coins along an amount and items along a bag's kilograms (GRDY-1.1, GRDY-5.1); a small `tt vars` table of items can sit under it.
- **Huffman figures** (GRDY-4.1): a Tree forest with `slide` (`level` 62, `unit` 54, `forestGap` 0.3); the roots stand in queue order (lightest first), so each join slides the trees into their new order. Leaves are labelled `letter count`, joined nodes by their weight; edges carry `0` (left, the lighter tree) and `1`. The two trees being joined are `cur`, the new node `found`; the final step puts each code as a `note` under its leaf. Below it, an ArrayTrack named "queue, lightest first"; the Decode variant swaps it for a bit track with a `read` train and marks the path being walked `cur`.
- **Plane** (DVCQ, SVG; GEOM reuses it): points on a grid of whole-number coordinates from 0..`w` by 0..`h`, y going up. The SVG has no width attribute: `.plane` stretches to the stage (640px at most), a ResizeObserver measures it, and the drawing is made at that size, so it always fits a phone and labels keep their size (12.5px board-face letters with a white halo). 1px soft grid lines; ink-3 axis numbers, every second one when a unit is under 22px. **Points are squares, not dots** (circles stay reserved for the line's own geometry): plain white in a 1.5px ink frame, `cur` yellow in a 3px frame and larger, `found` yellow with an inner ink square (the double rule), `done` ink, `out` hatched grey, `todo` dashed, `bad` red; `lp` moves a label left, above or below. `lines` are vertical: `blue` (2px, blue plate) for a position such as the dividing line `x = 7.5`, `dash` (2px dashed ink-3, white plate) for a limit such as the strip edges `−δ`, `+δ`; when plates would touch, the limit plates move up a row. `boxes`: `strip` is a Board Pale band (the strip 2δ wide), `shade` a quiet Ground 2 area (the half not being looked at), and a plain box is a 1.5px ink frame that can be split into dashed squares (`nx`, `ny`: the δ × 2δ box of 8 squares). `segs` join two points: `cur` 2px ink (being compared), `found` 2px ink over a 9px yellow band (the best pair), `old` dashed grey (compared, not better), `bad` red (breaks a rule); `label` puts a distance plate at the middle. Distances are shown as `√5`, with the decimal in the readout.
- **Plane, GEOM options:** `arrow` on a segment draws a vector (the line stops short of the point's square and ends in a head that takes the segment's colour); `polys` are filled polygons through listed point ids, drawn under the grid lines (`pale` Board Pale for an area or a hull, `out` hatched for an area that is taken away, `shade` Ground 2); a point's `label` can differ from its id (an empty label for the far end of a track piece, or for Pick's interior points).
- **Geometry figures** (GEOM, the Plane stage, whole-number coordinates only): vectors from O are `cur` arrows with plates `a`, `b`; the cross product's parallelogram and triangle are `pale` polygons, the fourth corner a dashed point with no label; in the shoelace split (GEOM-1.1, "A polygon") triangles with a negative cross product are hatched, and Pick's interior points are dashed points. Orientation (GEOM-2.1) shades the triangle being measured and makes the judged point `cur`; pieces that meet get the `found` band, pieces that do not are dashed `old` with a blue verdict. The monotone chain (GEOM-3.1) draws the chain as plain segments, the new point `cur`, the point being popped hatched with the shortcut dashed, and the hull as `found` edges round a `pale` polygon. The sweep (GEOM-4.1) is the blue line with an `x = …` plate; finished pieces dashed `old`, pieces being checked `cur`, a meeting pair `found`; the ordered list of pieces is a Queue (`end="none"`, lowest first) in the `.graph-row` side column.
- **Graph** (GRPH; PATH, SPAN, CONN, FLOW, ADDP and HARD reuse it, SVG): vertices at fixed places on a grid of units (`x`, `y`, y going **down**, from 0..`w` by 0..`h`; fractions allowed). Like Plane, the SVG is measured to its box with a ResizeObserver and drawn at that size, so it fits a 390px phone with labels at full size; the unit is capped (`unit`, 84px by default), so a small graph is not blown up on a wide screen, and the drawing is centred. Keep each vertex's id and place the same in every step: the drawing never jumps. **Vertices are square-cornered boxes** (30px tall, at least 30px wide, mono 13.5px label; circles stay reserved for the line's own geometry). Vertex states: plain white; `seen` Board Pale (reached, waiting in the queue or on the path); `cur` yellow in the 3px heavy frame; `done` ink with a yellow label (finished); `found` yellow with an inner ink frame (the double rule); `out` hatched; `todo` dashed; `bad` red. A `tag` sits on the top-right corner (15px, board face 10px): `plain` white (a distance, team 0, an in-degree), `ink` (team 1, finish times d/f once a vertex is done), `bad` red (an in-degree that can never reach 0). Team numbers are 0 and 1 as tags, never two colours. **Edges** are 1.75px ink (read as 2px marks), with arrowheads when `directed`; `cur` 3px (being followed or just changed); `tree` 2px on a 9px Board Pale band (the edge that first reached a vertex: the BFS or DFS tree); `found` 2px on a 9px yellow band (an answer: a route, a cycle); `old` dashed grey (looked at and not used, or removed, as in Kahn's method); `todo` dotted pale (not added yet); `bad` red 2px (breaks a rule: the edge inside one team, the edges of a cycle that stops a topological order). An edge `label` is a small white plate at its middle (edge kinds `back`, `forward`, `cross` in GRPH-3; weights and capacities in D2 and D3). `bend` curves an edge by that many pixels to its left (seen from a to b), for two edges between the same vertices or to arc over a vertex (GRPH-3.1's back edge arcs over the top row with `bend` 60). `a === b` draws a loop above the vertex. Lay graphs out so no edge passes through a vertex and few edges cross; a label on a crowded spot is the first thing to break on a phone (GRPH-3.1 was re-laid out for this).
- **Queue** (GRPH, HTML): the frontier of a search as a row of 36px boxes under a muted name plate, front at the left (`end="front"`, a small ink-3 `front` under the first box), or a stack held in a list (`end="top"`, `top` under the last), or a plain list such as an output order (`end="none"`). Boxes take `seen` (Board Pale), `cur` (yellow in a 3px frame: the item being taken), `done` (ink), `out` (hatched) and `bad`. An empty queue is a dashed `empty` box. It scrolls sideways inside its own box when long.
- **Graph figures** (GRPH): `.graph-row` puts the graph (up to 520px) beside a fixed 260px side column (`.graph-side`), so nothing moves as the queue or stack grows; under 760px the side column drops below the graph. The side holds a Queue (BFS, Kahn's ready vertices, the output order), a `CallStack` (recursive DFS: `dfs(A)` running and waiting) or a plain CallStack named `stack` or `path (stack)` whose items read `A  next: D` or `all tried` (the explicit stack of (vertex, iterator) pairs), or a `tt vars` table (adjacency lists; edge list). The adjacency matrix is a Grid with letter plates under the graph. Steps are made per vertex taken (BFS, Kahn) or per edge looked at (DFS, cycles), with the edges looked at in that step flashed `cur` or `old` for that step only. Grid graphs (GRPH-7.1) are the Grid stage: walls `out` (hatched), distances as values, the newest wave `cur`, a traced route `path` with the end `found`, islands labelled A, B, C and finished islands `done`; a Queue of `r,c` squares sits under it.
- **Weighted graph figures** (PATH, SPAN; the Graph stage): every edge's cost is its label plate, written with a true minus (`−2`). Vertex tags carry the best time so far (`∞` before a vertex is reached; `−∞` as a `bad` tag for a vertex a negative cycle can reach) or, in Kruskal's method, the name of the vertex's group. The parent edge of each vertex is `tree` (Board Pale band), an answer (the route found, a kept spanning-tree edge) `found`, an edge looked at and not used, skipped (a loop in Kruskal) or dropped in a swap `old`, the edge being relaxed `cur`; red only for wrong results and broken rules (Dijkstra's late relaxation of a negative edge, the edges of a negative cycle, the stations Dijkstra or a plain queue got wrong). Heaps and deques are `Queue` rows of `time vertex` entries, smallest first, with out-of-date entries (lazy removal) hatched `out`. Side panels: a three-column `tt vars` table (station, time, parent) when relaxing by hand (PATH-1.1); the edge list in relaxation order (PATH-4.1); the edges sorted by cost with a hatched `skip` word (`.tt-skip`, never red) in Kruskal (SPAN-2.1); a topological order as a plain Queue (PATH-6.1). Floyd–Warshall (PATH-5.1) puts a 4 × 4 Grid with letter plates in the side column: the changed cell `cur`, the two cells it was made from `src`, the wrong entry of the k-inside variant `bad`; the vertex k is `found`, i and j `seen` (the changed cell is the step's one heavy frame). A* (PATH-7.1) is a Grid maze: walls `out`, reached squares show g, waiting squares carry h as a cell `tag`, taken squares `done`, the route `path`, the goal `found`. A cut (SPAN-4.1) is one side's vertices in `seen` (Board Pale) with crossing edges `cur` and the cheapest crossing edge `found`. The timed network of PATH-1 and PATH-3 is GRPH-2's line stretched to `h` 2.6 so plates and tags stay apart on a phone; SPAN's seven-vertex network is 6 × 2.4.
- **Connectivity figures** (CONN; the Graph stage): Vertices are junctions or conditions; edges carry no plates except the word `back` on a back edge in the bridge search. Tags carry discovery/low numbers (`3/1`), a finish number, or a group number (`g0` in Kosaraju's second pass, `0` and `1` for groups in topological order). Vertices on the search path are Board Pale (seen), finished vertices ink (done), the vertex being worked on current, and a group just popped, a cut vertex or a true condition found (the double rule). Bridges get the yellow found band; tree edges the Board Pale band; edges looked at and ignored (into a finished group) are flashed dashed old. Kosaraju's second pass draws every edge turned round. In the graph of groups (CONN-1.1), only the streets between groups are shaded. Tarjan's own stack is a Queue named `stack` (top at the right) in the 260px side column; Kosaraju's finish order goes in the readout line, because eight boxes do not fit the side column. Two edges between the same pair (a repeated line, or x → y and y → x in an implication graph) bend apart with `bend`. 2-SAT draws the conditions on a hexagon with each one opposite its own negation (`a` opposite `¬a`), so each edge x → y has its mirror ¬y → ¬x on the far side and no edges cross; false conditions are hatched, true ones found, and only a variable and its negation in one group are red (a broken rule).
- **Flow network figures** (FLOW; the Graph stage): Each edge plate reads flow/capacity (`9/10`), or the capacity alone before any flow; edges that carry flow have the Board Pale tree band, the augmenting path being sent the yellow found band, and the arcs just changed are 3px current. Red only for broken rules: an edge over its capacity, a vertex where flow in and flow out differ. The residual graph is a separate view of the same stage: a forward arc with the room left and a dashed back arc with the flow that can be undone, each drawn only when above 0, bent apart when both exist. Tags give the BFS distance (level) from s in the residual graph; in Dinic's method lines outside the level graph are dashed old and dead-end vertices hatched. A cut shades the source side Board Pale (seen), marks crossing edges current (the final smallest cut found) and edges back into the side dashed. Bipartite matching puts the left side at x = 0 and the right at x = 2; matched edges are found, an augmenting path alternates current (not matched) and found (matched), matched vertices are ink, and König's cover vertices get the double rule.
- **Advanced DP figures** (ADDP; no stage changes): tree DP is a letters-only Tree over a Grid with one column per node and word row plates (`value`/`take`/`skip`, `size`/`down`/`total`), the node being worked on current in both and its children's cells `src`; the walk back marks used answers `path`. DP on a DAG is the Graph in topological order, stretched to `h` 3.6 so edge plates clear vertex tags on a phone, with tags for counts or best values, the chosen incoming edge `tree`, the route `found`, and the order as a plain Queue. Interval tables are upper-triangle Grids (`blank` below the diagonal) under a one-row `piles` Grid whose current stretch is `path`; the wrong-order variant reads an unfilled cell (`todo`, dashed) and its result is `bad`. Bitmask rows are labelled with the mask in binary (place 0 at the right, `rowHeadWidth` 52) beside a distance Grid. Digit DP is transposed (rows = digits 0–9, columns = places of N) so it fits a phone; counted blocks ink, digits above N hatched, the tight digit the one heavy frame and then `path`. Knuth's rule puts each cell's best split in a cell `tag`. Lines on a hull are Plane segments with lettered left ends; dropped lines `old`, questions the blue line, the envelope `found`, the kept lines a Queue.
- **Hard problem figures** (HARD; no stage changes): a certificate check is a Graph with plain group tags (0, 1, 2), each edge `cur` while checked and `tree` once passed, red only for an edge inside one group. Search with a yes/no helper is a one-row Grid of T/F values. The 3-SAT reduction draws a triangle per clause (labels like `¬x2`), the edges between opposites bent below or above the rows, the chosen set `found`. Branch and bound is a Tree (`unit` 74, edge labels `+A`/`−A`) under a two-row item Grid: node labels are values, plain tags are bounds (`≤109`), pruned branches and items that do not fit (labelled `–`) are hatched, never red. The vertex cover's taken edges and their ends are `found`, covered edges `tree`, skipped edges flash `old`; the tour from a tree keeps one edge per city pair (a trip edge replaces the tree edge, so keys never repeat), tree `tree`, trip `found`, first visits in a Queue. Miller–Rabin is a Grid with one row per base and columns `d`, `2d`, `4d`, …; a value that proves nothing is `path`, a witness `found`, and only a strong liar's "prime" gets a red verdict.
- **Recursion trees for divide and conquer** (DVCQ-1.1, 3.1, 5.1): Tree with the part each call works on as its label (`0–3`, or the values), and its answer added when solved (`0–3: 4`, `13 × 22 = 286`); a merge's count is a `plain` tag (`+12`). Calls still to do are `todo` (dashed), the call being worked on `cur`, solved calls `done`, the final answer `found`; a call whose children are on screen but unsolved is plain. One-digit products under Karatsuba's leaves are notes. The 16-leaf comparison tree (DVCQ-5.1, "Plain split") uses compact labels (`1×2`) and `unit` 46, and scrolls inside `Follow` on phones.
- **Work per level** (DVCQ-2.1): a Timeline with one row per level of a recursion, each bar one call whose length is its work, laid end to end; a dashed `n` mark shows the top level's work. Used for recurrences the basic master theorem does not cover (n/5 + 7n/10, n/3 + 2n/3, n log n work). Bars narrower than about one unit carry no label.
- **Median of medians** (DVCQ-6.1): a Grid of 5 rows with one group per column; the medians row `cur`, the pivot `found`, the block known to be at most the pivot `done` (ink) and the block known to be at least it `cur`. The groups are put in order of their medians for the proof step only, and the caption says so.
- **Timetables in figures** with five columns (DSUF-4.1) use 6px side padding on every cell so they fit a phone; numbers are rounded to one decimal place.
- **Follow** (`.follow`): a sideways scroll box that, after each step, scrolls just enough to bring the first marked node (`.tnode` with `is-cur`, `is-found` or `is-bad`) into view, or else the first `is-cur`, `is-found`, `is-bad` mark or current array cell (`.cell.is-mid`). A marked node comes before a marked edge, because a current edge ends at its node's edge and following it left the node cut off. The current node comes before found or bad ones: a decision tree keeps its recorded leaves `found`, and the leftmost of them used to win over the step's current node (RECR-4.1, A2 review). It keeps the target 24px from the right edge and 60px from the left edge (clear of pinned rail names); when scrolling back would leave less than 72px of scroll, it goes to the start, so the rail names and index plates show. Inside a Follow box, Array Track rail names are sticky at the left edge on the ground colour, so a scrolled rail keeps its name. When its content is wider than the box, a small ink-3 line under it says "Wider than the screen: swipe sideways to see the rest." Use it for every tree, hash table or list that can be wider than a phone, so the current node is never off screen. The HashTable has no scroll box of its own; wrap it in `Follow`. When it holds a sliding tree, a skip list or a Links list, it measures again 420ms after the step, once the nodes have reached their places.
- **Grid:** matrices and boards with blue row and column plates.
- **DP tables** (DYNP, the Grid stage): `colHead` and `rowHead` replace the plate numbers with labels (the letters of two strings, item names, bag sizes). An empty string is a muted Ground 3 plate with a dash, for the empty prefix; `null` leaves a row without a plate (a single list under a `Named` plate); `rowHeadWidth` widens the plate column for a word label (`best` and `end` 40px, `len` and `tails` 42px). Three marks are DP-only:
  - `from` (`up`, `left`, `diag`, or a list): a small arrow at the edge of the cell that faces the cell its value came from. 12px, 2px ink stroke (a mark), board yellow on done cells, 10px on phones; inside the current cell's heavy frame the arrows move 2px in. The arrows are recorded when the cell is filled and stay, so the finished table can be walked back (DYNP-9).
  - `src`: the cell is being read to work out the current cell. It takes the dashed target outline, and its own arrows fade to 30%. Sources that are not neighbours (the knapsack's `x − w`, the LIS's `j < i`, `best[i − 2]`) are shown only this way.
  - `path` (a cell state): Board Pale fill and a bold value, for a traced-back path and for calls waiting on the stack (DYNP-2.1). The cell where a walk takes something (a letter, an item) is `found`; its double rule hides the arrows.
  - On phones, grid cells are 40px tall and a cell with an up or diagonal arrow pushes its value 8px down; a table of 8 or more columns narrows to 36px cells (`.grid2--wide`), so 8 columns plus a word label fit a 390px screen (332px of stage). The grid keeps 8px on the right for a found cell's check flag. Small numbers that belong to the input (a grid's costs, the order answers were stored) are cell `tag`s.
  - DYNP figures: the call tree with repeated calls tagged AGAIN beside a one-row table of how often each amount was asked (1.1); a memo table beside the CallStack, tags giving the order answers were stored (2.1); filling row by row, then one list reused (3.1); two-row tables `a` over `best` or `end` (4.1) and `a` over `len` or `tails` (6.1); a cost grid with costs as tags (5.1); LCS and edit-distance tables with letter plates (7.1); the knapsack table, one row right to left, and left to right with the second use of an item marked `bad` (8.1), with a compact `tt vars` list of items (`.dynp-items`, 280px); walking back with `path` and `found` (9.1). Keep tables to 8 columns.
- **Bit rows** (BITS, the Grid stage): a number is a Grid row of 0s and 1s, written highest place first as Python prints binary, under column plates that give each bit's **place number** (`colHead` 7 … 0), so place 0 is at the right. This was decided once for the station; captions say "place k", never "bit at index k". Rows carry word plates (`rowHead`: `x`, `y`, `x & y`, `mask`, `result`, `worth`, `x − 1`) with `rowHeadWidth` 44, and 8 columns plus that plate fit a 390px phone (the `grid2--wide` 36px cells). A whole row being written is `path` (Board Pale); the place being worked on is `cur` in the result row and `src` (dashed) in the rows it reads; a finished result row is `done` (ink); bits that fall off in a shift are `out` (hatched); places outside a mask are `out` in every submask row (BITS-5.1). Overflow is shown by the red verdict alone, not by striking the bits (127 + 1 in 8 bits is a wrong result, but each bit is a correct bit). A subset table (BITS-5.1) puts one mask per row with the mask's value as the row plate, item places as columns and a `sum` column whose `src` outline points at the smaller subset it was built from. The count table for 0 to 15 (BITS-4.1) is two rows of 8 with row plates `+0` and `+8`.
- **Grid `blank`** (a cell option, STRG): no frame and no fill, for a place with nothing in it, such as the columns a shifted pattern does not cover. It keeps the column, so rows stay aligned.
- **String figures** (STRG, the Grid stage): columns are places in the text. The text is one row (`T`, or `s` when a string is matched against itself), the pattern a row under it shifted to the place being tried (blank cells elsewhere), and a table row under that (`π`, `Z`, `h` for hashes, `d₁`/`d₂` for palindrome counts). Row plates are single letters so 8 columns fit a 390px phone; the lessons name them. Letters already known to match, the Z-box and Manacher's box are `path` (Board Pale); the pair being compared is `cur` in both rows; a table entry being read (π[k − 1], Z[i − l], the mirror d[j]) is `src` (dashed); a full match `found`; a finished table row `done`. A mismatch is never red. A hash collision is shown by the red verdict alone, with the hash cell `cur`: the hash value itself is correct (the same rule as BITS overflow). Suffix arrays (STRG-5.1) put one suffix per row, its letters in columns 0 … n − 1 and the row plate giving its start, with extra columns `pair` (small text) and `rank`, or `lcp`; the letters being compared are `path`, and a column being filled is `path`, not a column of heavy frames.
- **Grid `small`** (a cell option): text of four characters or more (`−128`, `1071`) drops to 14px (12.5px on phones), so it does not touch the cell's frame. The BITS and MATH step generators set it automatically from the value's length.
- **Number tables** (MATH, the Grid stage): Euclid's algorithm as one row per division (`a b q r`, new rows `cur` on the remainder, the two cells they came from `src`, the gcd `found`); the extended algorithm as rows `r q x y` whose x and y keep r = a·x + b·y, negative values written with a true minus; a power table (`bit`, `power`, `result` under places 3 … 0); Fibonacci matrix powers as rows `M¹ M² M⁴ M⁸ result` with column plates `k+1`, `k`, `k−1`; the sieve as numbers 1 to 48 eight to a row with no plates (`showIdx={false}`), crossed-out numbers `out` (hatched, never red), the multiples crossed in this step also `src` (dashed), primes `done` (ink), and smallest prime factors as cell `tag`s on crossed cells only; multiplication tables modulo 7 and 8 with each 1 `found`; two clocks as a 3 × 5 grid of x % 3 by x % 5; Pascal's triangle with `from` arrows `diag` and `up` (C(n − 1, k − 1) and C(n − 1, k)), and its odd entries as `done` (the pattern modulo 2). A clock of remainders (MATH-2.1) is an ArrayTrack of 0 … 6 whose train shows the true number (9 sits under 2). Fair shuffles (MATH-7.1) are a one-row Grid in a `Named` "the list" with settled places `done`; a reservoir is "the stream" over a two-cell "kept" Grid, items thrown out `out`.
- **Chain:** linked nodes with name tags as trains (a simple one-way row; PYTH-5).
- **Links** (LINK, SVG): linked nodes whose references can be rewired. Data per step: nodes (`x` slot, may be a fraction; `row` 0 main, −1 raised above, 1 and 2 below; `none` for a muted None plate; `hidden`), edges (`from`, `to`, `kind` next or prev, state) and names (rails underneath, as in the Array Track). Node box: value, then a next part with a dot (two-way lists add a prev part on the left; `double` puts next arrows 8px above the centre line and prev arrows 8px below). Edge routing: forward on the same row is a straight arrow; backward (a reversed link, a circular list, a loop) arcs above the row for next and below for prev; between rows an arrow leaves the dot vertically and enters the target through its top or bottom. Edge states: `cur` = 3px ink (just changed), `old` = dashed grey (the link that was just replaced), `bad` = red (a link that loses nodes). Node states are the Tree marks (`cur`, `done`, `found`, `out` hatched, `bad`). Nodes and trains move by transform over 220ms. Lift a node to row −1 when a link skips over it, so the arrow does not run through it. **On phones** (760px and below, `useCompact`) the list is never scaled down: it is drawn full size with 80px slots, 60px nodes (80px two-way) and a 50px name gutter, inside `Follow`, and every train carries its own name (`cur 5`, `head 12`, an off-rail `a None`), so a rail keeps its name however far the list scrolls. (Scaling an 8-node loop to fit made its values about 7px; a sticky HTML name column covered trains near the edge.) Wrap every Links stage in `Follow`.
- **HashTable** (HASH, HTML): a hash table drawn as a column of rows, one per bucket or slot, each with a blue index plate. `mode="chain"`: a small grey head box (a dot when the chain is not empty) and the chain's keys as boxes joined by arrows, new keys on the right. `mode="slots"`: one wide cell per slot holding a key (with an optional muted `sub`, such as a value), empty, or a deleted marker (`tomb`: hatched with a small "deleted" label). `marks` puts a blue train with a name (`i`, or the key being placed) to the left of a row, and gives that row's plate a blue halo. Entry states are the shared marks (`cur`, `found` with the check flag, `done`, `out` hatched, `bad`, `todo` dashed). Slots are 96px wide and 36px tall (78px on phones); chain boxes are at least 52px (44px on phones); a current bucket head turns yellow inside an ink frame. Put the hash arithmetic in the readout line under the table (`hash(22) % 5 = 2`). Two tables side by side (a table while it grows) go in a `stage-row`, each in a `Named`, each table in its own `Follow`. Wide chains scroll inside that `Follow` box on phones.
- **ArrayTrack `base`:** the number on the first index plate. Use it to split a long array into two rows on phones (HASH-8.1 shows 16 bits as 0–7 and 8–15 when `useCompact()` is true).
- **Links labels** longer than three characters (sentinels named `front` and `back`) are drawn at 12.5px so they fit the value part of a two-way node. Two-way nodes are 92px wide in a 96px slot, so space them at `x = k * 1.4` when the arrows between them must be visible (HASH-7.1).
- **Small dict tables** inside a stage use `tt vars` capped at `min(100%, 360px)` wide, with the current key's row marked (`is-current`).
- **Several rows changed in one step** (PATH-4.1, a Bellman–Ford round): mark them `is-path` (Board Pale, no frame, `.tt tr.is-path`), so the step keeps one heavy frame. `is-current` is for the single row being worked on.
- **Graph tag corners** (`tagAt` on a node): `tr` (default) on the top-right corner; `br` on the bottom-right, for a vertex whose edges leave up and to the right (bottom rows of SPAN-2.1, PATH-1.1, CONN-1.1/2.1); `t` centred above the vertex, for one with edges at all four corners (ADDP-2.1's C); `tl` on the top-left corner, for a vertex an arc comes into from the top right (GRPH-3.1's A; the stage then adds 26px of left padding). The stage adds 12px under the drawing when any tag is `br`. Pick the corner no edge leaves from; station data can list the vertices with `below: [...]`.
- **Short graphs on phones**: a network drawn 2 units high shrinks so far on a 390px phone that plates sit on tags; CONN-3.1 and the FLOW network are 2.6 high for that reason.
- **Tree `full`** (DVCQ-5.1, HARD-3.1): the SVG is never scaled down to its box; it keeps its labels at full size inside a `Follow` box that scrolls. When no node is marked yet (a search before its first step), Follow scrolls to the first node, the root. A search figure draws its root plain at step 1, so the first step is not an empty stage.
- **Timeline `tagAt: "end"`** puts a bar's tag just outside its right end, for short bars whose label the corner tag would cover (GRDY-3.1's "skip").
- **Tree `walked`** (a node option): the edge from its parent is drawn at 2px (the mark weight), for the path a walk has taken so far (GRDY-4.1 decoding); nodes on it are ink (`done`) and the node just reached is current.
- **ArrayTrack `path`** (a cell state, as in Grid): Board Pale with a bold value, for cells already walked (Huffman decoding's bit row).
- **Plane labels** never sit left of a point at x = 0 or 1, where the axis numbers are: put them above (`lp: "t"`) or at the other end of the line (ADDP-6.1 names its lines at the right ends). Axis numbers are 10.5px, 11.5px on phones.
- **A point or cell is hatched only on the step it is removed** when the removal belongs to one pass of several (GEOM-3.1: the lower hull, once finished, is drawn `found` while the upper walk runs, and a lower-hull corner popped from the upper stack is never hatched).
- **Deleted, removed or evicted items** use the eliminated mark (`out`, hatched), never red: removing an item is not a failure. Red stays for wrong results and broken rules (the "remove by emptying" variant of HASH-3.1).
- **Bar:** a bar inside a timetable cell; above 1 it shows "off the scale".
- **Named:** a muted plate naming a track. Use it whenever a figure shows more than one track; the ArrayTrack `label` is for screen readers only.
- **Outbox** (`.outbox`): printed output under a code trace.
- A **named track with a window** gets 12px of top room so the window label is not clipped by the track's scroll box (STAQ-6.1).
- Pointer names longer than four letters (`front`) need about 12px of left room when the track sits in its own scroll box (STAQ-3.1).
Wide trees, tracks and tables scroll inside the stage on phones; the page itself never scrolls sideways.

### Verdicts
Inline board-face badges under a stage. Ok: ink text in a 4px double ink rule on white. Bad: red text, red border, red pale. Info: blue deep on blue pale.

### Invariant Band
The lesson's one loud line: yellow band between 3px ink rules, sm plate label at left, sentence in the invariant style. At most one per idea; it is board-face signage, not a prose container.

**Keeping expressions whole** (`_components/Prose.tsx`). Band text and `M` children are glued: indexed terms (`d[i][j]`), short calls and groups (`min(r − i, Z[i − l])`) and arrows with their two ends (`0 → 1`) stay on one line, and plain text between them can still break. Figure readouts (`ReadoutText`) go through `keepTogether`, which also splits at " · " and never breaks an item of up to 24 characters. Do not use `keepTogether` on band text: a short piece between two no-break spans would become one more unbreakable piece, and the band would turn into a single line that pushes the page sideways. When a band holds a long formula, write it as `nowrap` spans with each operator at the start of the next piece (`≤ group(b) < group(¬b)`), so a line breaks only between clauses. Captions keep a name and its value together with a no-break space (`E 6`).

### Notes
Timetable notes: 1px ink rules above and below, no fill, no side stripe; title in 15px board face weight 800, body serif at 1.02rem. Warning variant: 2px red top rule and red title. Margin notes in the third column: 3px ink top rule, 14px board face, ink-2.

### Code Block
1.5px ink rules top and bottom on Ground 2; head with file name (13px board, 650) over a 1px soft rule; mono 14.5px with counter line numbers. A marked line is Board Pale between 1.5px ink rules, the same grammar as the current timetable row.

When a code block is wider than its column, or a figure's CodeTrace code is wider than its panel, `CodeHint` shows the Follow line under it ("Wider than the screen: swipe sideways to see the rest."); a lesson table (`.tt-wrap`) that overflows gets the same line from `LessonShell`'s `Body`. Both measure with a ResizeObserver and stay hidden otherwise. Long trailing comments move to their own line above the code, so phones scroll less. On phones, a variants bar with three or more options becomes an even two-column grid (1.5px ink gaps; an odd last option spans the row).

### Buttons
- **Shape:** 2px radius, 1.5px ink border, 40px tall (32px small), 16px side padding.
- **Default:** white, hover Ground 2, active Ground 3.
- **Board (primary):** yellow, hover Board Deep, disabled Board Pale at 38% opacity.
- **Ink:** black with yellow text, hover #2c2c2a. An ink button rendered as a link (a "next" link styled as a button) keeps its board-yellow label; the section's link rule (links inherit their colour) must not win over it.
- **Icon:** 40px square; icons are Lucide line icons at 17 to 18px, stroke 2.25.
- **Focus:** 3px blue outline, 2px offset (global).
- Transitions 120ms on colour only.

### Lesson Close and Departures
A 3px ink top rule, a status line with a square mark (empty, half, full), then a two-column grid of departure cards (1.5px ink frame, 16px 18px): the practice departure is yellow with an md plate (BSRC-P1), the next-lesson departure is white with its plate. Hover goes Ground 2 or Board Deep.

### Course Map
Legs headed by a blue 40px letter square, name and a live/coming-soon tag over a 3px ink rule. A leg is live when any of its stations is open (`LEGS` derives `live` from `STATIONS`), so the tag can never disagree with the stations under it. The last station's row carries a small `last station` plate. Stations hang on a 6px black vertical rail with circular nodes (done filled, here blue with halo, open larger, later legs dashed grey rail with smaller ink-3 nodes). Each station row: md plate, name, meta; an open station expands to its lesson timetable. The aside holds status cards: 1.5px ink frame with an ink head bar in yellow text.

### Practice
Problem statement in serif with a sample flag; work pane holds an editor bar (file chip, runtime dot: ink ready, blinking yellow loading, red error; "Run tests" top right), the CodeMirror editor (blue cursor, yellow selection and active line), test timetable, and a yellow solved band between 3px rules. Hints are a numbered ladder (Nudge, Approach, Pseudocode): 30px square rung numbers, ink when open, ink-3 when locked. If Pyodide itself crashes (for example its stack runs out while freeing very deeply nested data), the row shows an error, the runner restarts, and the remaining tests carry on.

### Inputs / Fields
34px, 1.5px ink border, 2px radius, board face 14px, white; focus is the global blue ring.

### Content Folder (how a new station is shaped)
Each open station lives in `app/dsa/_content/<code>/` (lowercase code) and repeats the BSRC shape:
- `meta.ts`: `<CODE>_LESSONS` (n, title, minutes, figure ids like "CODE-n.k", sections with id and title that become h2 ids and rail entries, linked practice number) and `<CODE>_PROBLEMS` (n, title, from lessons).
- `index.ts`: `<CODE>_BODIES`, lesson number to body component.
- `lesson<n>.tsx`: the body, opening with a `lesson__lede` paragraph, h2s matching meta sections, using `Invariant`, `Note`, `M`, `CodeBlock` and the station's figures.
- `figures.tsx`: client figure components, each a `Stepper` (id, lesson, title, total, caption, optional `Variants`) rendering `ArrayTrack` or a new stage type from step data.
- `algos.ts`: step generators returning the full array of steps up front, using the shared cell-state names; captions use backticks for code.
- `problems.tsx`: `<CODE>_PROBLEM_DEFS` (statement, starter, three hints Nudge/Approach/Pseudocode, tests imported from `tests/p<n>.json` with name, args, expect, show, why).
- `solutions/p<n>.ts` lazily imported through `solutions/index.ts`, exporting `code` and `notes`.
Then register the station with `python scripts/register.py CODE`, which adds it to the four registries in `_content/` (`registry.ts`, `bodies.ts`, `defs.ts`, `solutions.ts`) and sets `open: true` in `_data/syllabus.ts`.

## Do's and Don'ts

### Do:
- **Do** open every page with a station board: black code plate, uppercase title, square-separated facts.
- **Do** name places with four-letter codes in plates (CODE, CODE-n, CODE-Pn, FIG CODE-n.k).
- **Do** show every state with the shared marks: heavy frame for current, hatching for eliminated, double rule for found, red strike for violated.
- **Do** list lessons, tests and comparisons as timetables: 3px top rule, 1.5px head rule, 1px soft row rules, tabular figures, current row Board Pale between 2px ink rules.
- **Do** build every figure on the Stepper: head bar, optional variants, stage, blue step plate caption, controls ending in "Step n of N".
- **Do** move pointers as whole steps over 220ms with cubic-bezier(0.16, 1, 0.3, 1), and drop all motion under reduced motion.
- **Do** keep prose in Source Serif 4 at 18px in a 66ch column on white.

### Don't:
- **Don't** put serif prose on yellow; yellow carries board-face signage only.
- **Don't** use green anywhere; success is ink in a double rule or the yellow band between heavy rules.
- **Don't** use blue for decoration or emphasis; it marks position (indices, platforms, you-are-here, current step) and links and focus.
- **Don't** use red for anything but failure and violated invariants.
- **Don't** use coloured side stripes on notes or callouts; notes are bounded by full-width rules.
- **Don't** add drop shadows, gradients or rounded cards; depth is rule weight.
- **Don't** set uppercase outside the board title and plates.
- **Don't** fall back to the category defaults the world refuses: a sidebar course tree (the contents rail lists only the current lesson's sections; the course lives on the map), an indigo accent, progress rings.
