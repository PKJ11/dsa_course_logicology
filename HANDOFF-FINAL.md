# DSA self-paced: final handoff

Owner: Kartik Vyas (learn@logicology.in). Written 2026-10-08; updated 2026-10-26, after the A2 review, the last station group.

Start here for any future change. This file says what exists, how it fits together, how to make common changes safely, and which rules to keep. The full build history, session by session, is in [HANDOFF.md](HANDOFF.md). Read it only when you need to know *why* something was decided.

---

## 1. Where things stand

- **The course is complete.** It has 30 stations in 4 legs, with 180 lessons, 180 step-through figures and 170 practice problems, and every station is open.
- **Impeccable finish reviews**, each ending in **ship**:
  - A1 (BSRC) on 2026-10-04;
  - B2, B3 and B4 on 2026-10-06;
  - C1–C4 and D1–D5 on 2026-10-08;
  - B1 (LINK, STAQ) on 2026-10-26 (`.impeccable/review/b1-findings.md`);
  - A2 (PYTH, CORR, BIGO, ARRS, RECR, SORT) on 2026-10-26, in three sets (`.impeccable/review/a2-findings.md`).
  - **Every station has now had a finish review.**
- **Leg A was reviewed by the owner** during the build (BSRC after A1, then A2).
- **`npm run build`** exports a static site of **351 pages** to `out/`: 180 lessons, 170 practice pages and the map.
- **It runs as a standalone Next.js 16 app.** It is meant to move into kartikvyas.in later as the `/dsa` section.

| Leg | Stations (code: name) |
|---|---|
| A | PYTH Python for DSA (optional) · CORR Correctness · BIGO Cost: Big-O · ARRS Arrays and strings · BSRC Binary search · RECR Recursion and backtracking · SORT Sorting |
| B | LINK Linked lists · STAQ Stacks and queues · HASH Hashing · TREE Trees and BSTs · BALT Balanced trees · HEAP Heaps · TRIE Tries · DSUF Union-find · RNGQ Range queries |
| C | GRDY Greedy · DVCQ Divide and conquer · DYNP Dynamic programming · BITS Bit manipulation · MATH Number theory and counting |
| D | GRPH Graphs · PATH Shortest paths · SPAN Minimum spanning trees · CONN Connectivity · FLOW Network flow · STRG String algorithms · GEOM Computational geometry · ADDP Advanced DP · HARD Hard problems (last station) |

Names: a station has a four-letter code (`BSRC`). A lesson is `BSRC-2`, a figure `BSRC-2.1`, and a practice problem `BSRC-P1`.

---

## 2. Run it and see it

```bash
npm install
npm run dev          # http://localhost:3005/dsa/
npm run build        # static site in out/
npm run start        # serves out/ on port 3005 (stop the dev server first)
```

- Course map: http://localhost:3005/dsa/
- A lesson: http://localhost:3005/dsa/bsrc/2/
- A practice problem: http://localhost:3005/dsa/bsrc/practice/1/
- In the Claude desktop app, the dev server is the "dsa" entry in `.claude/launch.json`. Start it from the Browser pane.
- **Instructor passcode.** It unlocks any solution. Set `NEXT_PUBLIC_DSA_INSTRUCTOR_HASH` to the output of the command below. Only the hash is stored, never the passcode.

```bash
node scripts/hash-passcode.mjs "your long passcode"
```

- Versions in use: Node 24, Python 3.14 (for the scripts), Next 16, React 19, TypeScript 7. In the browser it runs Pyodide 314.0.7, loaded from jsDelivr.
- **Next.js 16 is newer than most guides.** Before changing framework code (routing, config, metadata), read the guide in `node_modules/next/dist/docs/` (see AGENTS.md).

---

## 3. What to read for what

| File | Read it when |
|---|---|
| **This file** | You start any change. |
| [README.md](README.md) | You need the folder map, the script list, or the **21 test-writing rules** under "Adding a station". |
| [DESIGN.md](DESIGN.md) | You touch anything visual. It is the design system as built: colours, type, the Four Weights Rule, every stage and its marks, and per-station figure rules. `.impeccable/design.json` is its machine-readable sidecar; keep the two in step. |
| [PRODUCT.md](PRODUCT.md) | You need the product truth: who it is for, and what success means. |
| [SYLLABUS-DRAFT.md](SYLLABUS-DRAFT.md) | You change what a station covers. |
| [SHAPE-BRIEF.md](SHAPE-BRIEF.md) | You change the core flow (lesson → figure → practice). |
| [HANDOFF.md](HANDOFF.md) | You need the reason behind a decision. Search it for the station code; each session has a "Decisions made" list. |
| `HANDOFF-B4.md` … `HANDOFF-D5.md` | These are the short starting notes for each build session. They are history only. |
| `.impeccable/review/` | You want to see a review: captures per session, and `cd-findings.md` with every finding of the C/D review and its status. |

---

## 4. How the pieces fit

```
app/dsa/
  page.tsx                       the course map
  [station]/[lesson]/page.tsx    a lesson page
  [station]/practice/[problem]/  a practice page
  _data/syllabus.ts              the 30 stations, 4 legs; `open: true` shows a station; LEGS derives "live"
  _components/                   shared parts (see below)
  _content/<code>/               one folder per station
  _content/registry.ts, bodies.ts, defs.ts, solutions.ts   the registries the pages read
  _lib/progress.ts               progress in this browser (localStorage "dsa:progress:v1")
  _lib/python.ts                 talks to the Pyodide worker
  dsa.css                        the design system, scoped under .dsa
public/dsa/runner.mjs            the Pyodide worker (a module worker)
public/dsa/harness.py            runs learner code against tests; test helpers (README lists them all)
scripts/                         test builders, solution writers, checks (section 7)
```

**One station folder** (`app/dsa/_content/<code>/`), as described in DESIGN.md under "Content Folder":
- `meta.ts`: the lessons (title, minutes, figure ids, sections) and the problem list.
- `lesson<n>.tsx`: the lesson text, written in JSX. It uses `Invariant` (the yellow band), `Note`, `M` (inline maths), `CodeBlock`, and the station's figures.
- `algos.ts`: **step generators**. Each figure is a list of steps worked out in advance. A step holds the picture data, a `caption` and an optional `readout` and `verdict`.
- `figures.tsx`: each figure is a `Stepper` that draws one step with a stage from `_components/Stages.tsx` or `ArrayTrack.tsx`.
- `problems.tsx`: the problem statement, starter code, three hints (Nudge, Approach, Pseudocode) and the tests, which it imports from `tests/p<n>.json`.
- `tests/p<n>.json`: **generated** by `scripts/build_<code>.py`, so never edit it by hand.
- `solutions/p<n>.ts`: **generated** by `scripts/sol_<code>.py`. It is loaded only when a solution unlocks.
- `index.ts`: maps each lesson number to its body.

**Shared components** (`app/dsa/_components/`):

| File | What it holds |
|---|---|
| `Stepper.tsx` | The figure frame, step controls and variants. |
| `Stages.tsx` | Every drawing: Grid, Tree, Graph, Plane, Timeline, Queue, Spans, SkipList, Links, HashTable, CallStack, Follow, Bar. |
| `ArrayTrack.tsx` | The array drawn as platforms and trains. |
| `Prose.tsx` | `Invariant`, `Note`, `M`, and `keepTogether` (so expressions never break across lines). |
| `Code.tsx` + `CodeHint.tsx` | Code blocks, with the "swipe sideways" line under them. |
| `LessonShell.tsx` | The lesson page layout and contents rail. |
| `Practice.tsx` + `Editor.tsx` | The practice screen: CodeMirror editor, test rows, hint ladder, solution lock. |
| `CourseMap.tsx`, `Board.tsx`, `Frame.tsx` | The map, the station board and the platform frame. |

**Help without AI.** Each problem has a hint ladder, and each test row has a "What this usually means" note. A solution unlocks only after every hint is open, or with the instructor passcode. This lock runs in the browser, so a determined student can get round it. Real enforcement needs platform login and a server, which has not been decided yet (section 9).

---

## 5. How to make common changes

Always finish with the checks in section 7.

**Change lesson text.** Edit `app/dsa/_content/<code>/lesson<n>.tsx`. Follow the writing rules in section 6. If you add or rename an `h2`, update the matching section in `meta.ts`; the rail and the anchors come from there.

**Change a figure.**
- Change the steps in `algos.ts`: the states, captions and readouts. Change `figures.tsx` only for layout or variants.
- Print the captions before you look at the pictures. `node --experimental-transform-types` can import `algos.ts` directly.
- Keep one heavy frame per step (section 6).
- Then run `figcheck` and `multishot` for that station at 1280px and 390px.

**Change a shared component or `dsa.css`.**
- Many stations use each stage. After a change, run `figcheck` and `pages` on **every station that uses it**; when unsure, run all of them.
- Record the change in DESIGN.md and in `.impeccable/design.json`.

**Change a problem's statement, hints or starter.** Edit `problems.tsx`. If the change alters what the function must return, the tests must change too (next item).

**Change a problem's tests.**
1. Edit `scripts/build_<code>.py`. Each `expect` is computed from a trusted solution. For C and D stations that solution lives in `scripts/trusted_<code>.py`.
2. Run the builder from `scripts/` (commands below).
3. Update the wrong versions in `scripts/naive/<code>.py` when needed. `NAIVE` holds the ones `check-problems` must catch. `EXTRA` holds more wrong versions, run by hand; each must fail its listed tests.
4. Run `check-problems` for that station and `pycheck` in the browser.
5. Every test needs a `why` note that explains what a failure means. A note that is just the answer is not enough.

```bash
cd scripts
python build_<code>.py
python cross_<code>.py      # C/D stations: brute-force cross-check of the trusted solution
```

**Change a solution or its notes.** Edit `scripts/sol_<code>.py`, then run it from `scripts/`. It rewrites `solutions/` and `index.ts`.

**Add a lesson, a problem or a station.** Follow README "Adding a station" (steps 1–4 and the 21 test rules). Copy the closest existing station and use `python scripts/register.py CODE` to open it.

**When practice would repeat a lesson's code.** Owner rule: a lesson gives code for its own examples, and a problem asks for something different. The owner's decision (2026-10-08) was to keep the problem and cut the lesson's code down to its core step, with the rest in words. A problem may be re-posed instead, as was done for GRDY-P1 and PATH-P5.

---

## 6. Rules to keep (owner)

**Writing** (lessons, captions, problems, hints, test notes, solution notes):
- Use plain English and short sentences. Define each term the first time it appears.
- Use no figures of speech.
- Never use these phrases: "climb", "trick", "multiplied by itself", "for free". Grep new text for them.
- Write powers as superscripts, with the meaning in words: "2ⁿ (n twos multiplied together)", "10¹⁸ (a 1 followed by 18 zeros)". Explain notation in words too.
- The railway theme is visual only. Labels and status words stay plain ("Completed", not "Ridden"; "last station").
- Lessons are for understanding. Coding happens on the practice screen.

**Design** (DESIGN.md has the details):
- The board is yellow with black lettering, and platform blue is for plates. Don't change these.
- **The Four Weights Rule:**

  | Weight | Used for |
  |---|---|
  | 3px | bands |
  | 2px | marks (current row, arrows, walked edges) |
  | 1.5px | objects |
  | 1px | rows |

  The 3px heavy frame on the current item is the one exception, and **each step has one heavy frame**. Several items changed in one step are Board Pale with no frame (`path` cells, `.tt tr.is-path` rows).
- Removed or pruned items are **hatched**. **Red is only for wrong results** or broken rules, never for "removed".
- No tag sits on an edge, plate or axis number. Graph vertices can carry their tag at `tr`, `br`, `t` or `tl`.
- Expressions never break inside a term, and the page never scrolls sideways at 390px. A wide code block or table scrolls inside its box, with the "swipe sideways" line under it.

**Working:**
- Write long scripts with the Write tool, not bash heredocs, which often fail to parse here.
- Never stop processes by image name (`taskkill /IM`). Find the process ID and stop that one. A puppeteer run started from a background shell keeps going after the shell is stopped; `ps -ef` and `ps -W` show the IDs.
- This is not Logicology work. Don't use Logicology branding.

---

## 7. Checks before calling a change done

```bash
npx tsc --noEmit
python scripts/check-problems.py <code> [<code> ...]
npm run build
```

- `check-problems` runs every reference solution and every naive one; run it without codes to check all 170 problems.
  - On Windows, set `PYTHONIOENCODING=utf-8` first, or it crashes on the superscripts.
  - Add `-u` when sending its output to a file, so the file fills as it runs.
  - It flags "TOO SLOW for the browser" when this laptop is slow, because the laptop's speed varies about threefold. Check the timing again before you change any limit.
- `npm run build` should export 351 pages.

**Browser checks** (`scripts/browser/`, run against the dev server on port 3005). Copy the scripts to a scratch folder and run `npm i puppeteer-core` there. They use the installed Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`.

```bash
node figcheck.mjs CODE <lessons>              # steps every figure at 1280 and 390, reports errors and sideways scroll
node pages.mjs CODE <lessons> <problems>      # sideways scroll at 390; code blocks that scroll at 1280
node pycheck.mjs CODE <problems>              # runs the reference solutions in Pyodide
node multishot.mjs FIG:variant:step:width ... # screenshots, e.g. PATH-4.1:1:5:390
node rows.mjs CODE n file.py                  # runs any code on a practice page, row by row, with times
node capsession.mjs <session> <station> ...   # a full review capture set; then: python slice.py <dir>
```

**A design review**, like the ones already done, follows the impeccable process:
1. Capture with `capsession`, then run `slice.py`.
2. Run the detector once.
3. Use one fresh `impeccable-finish-reviewer` per session.
4. Fix everything in one batch, then recapture.
5. Run verdict passes, at most two rounds.
6. Update DESIGN.md and HANDOFF.

HANDOFF.md, under "Finish review of C1–C4 and D1–D5", shows it in full.

---

## 8. Things that bite (learned the hard way)

- **Recursion in Pyodide.** A `functools.cache` function overflows the browser's stack at about 250 nested calls, while plain recursion passes 1,000. Keep "memo is fine" problems under 200 deep.
- **Deeply nested data crashes Pyodide when it is freed.** Keep test data under about 2,000 levels. Tests build linked lists and trees with `chain()`, `tree()` and `bst()`, and the harness cuts those links after each test. Structures the learner builds go through `free(...)`.
- **Some Python operations run in C** (`min()`, slices, `in`, `find`, `list.pop(0)` in Chrome), so slow methods can pass. Time naive versions in the browser with `rows.mjs`, not only in CPython (README rules 17, 20, 21).
- **Pseudo-random test data** must mix its bits (README rules 15–16; `mix()` in `build_grph.py`).
- **`keepTogether` must not run on band text.** It makes a short piece fully unbreakable, so a band turns into one long line. Bands only glue terms (`together()` in `Prose.tsx`).
- **The dev server stops sometimes.** This happens after `npm run build` and when the background task that started it hits its time limit. Restart it with the "dsa" preview, or with `npm run dev`.

---

## 9. Open items (the owner decides)

- **Moving into kartikvyas.in.** The step-by-step guide for the developer is [DEPLOY-HANDOFF.md](DEPLOY-HANDOFF.md) (2026-10-26).
  - Copy `app/dsa/` and `public/dsa/` into the platform app.
  - Add the dependencies: the CodeMirror packages, `@lezer/highlight` and `lucide-react`.
  - Keep `.dsa` scoping, and replace the stand-in `app/page.tsx` card and the platform frame with the real ones.
  - The app is a static export (`output: "export"`, `trailingSlash: true`); check that this fits the platform's setup.
- **Login and progress storage.** Progress now lives in the browser only (`_lib/progress.ts`). How it joins the platform's tracking work is open.
- **How strongly the solution lock is enforced** once there is login. Real enforcement needs a server route.
- **Other platform decisions:** what instructors see, access and pricing, the final course name on the home card, and the favicon.
- **Owner content review.** Everything was written by Claude. The owner reviewed Leg A. The "Decisions made" lists in HANDOFF.md name the choices most worth a second look, for example:
  - HARD-P3 is checked by time, not by node counts;
  - HARD-P5 uses 13 fixed Miller–Rabin bases;
  - FLOW-P3 and FLOW-P5 need the faster methods.
- **Problems changed in the A2 review (2026-10-26)**, for the owner to read:
  - PYTH-P4 is now "The codes seen once" (`single_codes`); the old "Count the codes" was lesson 4's own figure.
  - RECR-P6 is now "Parcels inside parcels" (`depth_sum`: each number times its depth); the old `flatten` was RECR-6.1's own trace.
  - CORR-P4's functions 1 and 3 are now `count_rises` and `first_max_index`; the old two were solved in CORR lessons.
  - RECR-P2 is "Steps on the footbridge", `count_ways` (was `climb`).
- **LINK-P3/P4 changed on 2026-10-26:** P3 is now "Reverse a section" and P4 the new "Turn each group round"; the whole-list reverse is gone (it was LINK-4.1's own code).
- **Leftover wording.** The banned words are gone from Legs A, C and D and from LINK and STAQ. They are still in HASH (lessons 3 and 8, problems) and TREE (lessons 2 and 6, problems, `build_tree.py`). Two more turned up in the A2 sweep (2026-10-26): DSUF-P3's solution note says "come for free" (`sol_dsuf.py`), and BITS-3's section id is `tricks` (seen only in the URL). Names inside scripts (`CLIMB` in `trusted_math.py`, a comment in `trusted_grph.py`) are not student text.
- **Small visual points** that the reviewers called not material:
  - the GEOM-1 shoelace bars show in the inline-maths amber colour;
  - the text colour on PATH-2.1's 0-weight plates was not checked;
  - the BITS-2.1/3.1 result rows while they fill were not seen in a capture.
- **One known factual point to decide.** HASH-1 says the last letter is multiplied by 31 "once". In the formula shown just after it, the last letter is not multiplied at all; the second-to-last is multiplied once.
