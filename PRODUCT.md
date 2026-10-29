# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

A new section inside the existing kartikvyas.in Next.js app. It has its own pages, progress and code runner, and is not built from the iframe "interactive modules" the platform already uses. Learners write **Python**, run in the browser (Pyodide was proposed and not yet confirmed). The platform's source code is not in this workspace. This folder holds the product record until the build has a home in that repo.

## Users

Students on Kartik Vyas's teaching platform, kartikvyas.in, with mixed or open enrolment across institutions. Their coding backgrounds vary: some have written very little code and others are comfortable. They learn Data Structures and Algorithms on their own schedule, outside live class time.

## Product Purpose

DSA self-paced learning lets a student work through data structures and algorithms alone. They follow a structured path, watch and manipulate each structure, write Python against tests, and get help when they're stuck, all without an instructor present. The goal is to make the student a real expert in DSA, not just someone who can clear placement interviews. That means proving why something works, analysing its cost, building it from scratch and using Python's own tools for it. Success means a student finishes the path able to reason about, choose and implement the right structure or algorithm, and doesn't drop out because they got stuck.

## Positioning

It is part of the teaching platform the students already use, not a separate site. Four learning mechanisms are combined in one place:

1. **Interactive visualizations.** Students manipulate arrays, trees and graphs and step through algorithms.
2. **Python in the browser.** Students write and run solutions against tests with nothing to install.
3. **A structured path with practice.** Ordered lessons, problem sets and progress tracking.
4. **Authored help, no AI.** Every problem has graduated hints, and every test has a written explanation of what its failure usually means. All of it is written by the course author, not generated. There is deliberately no AI tutor (owner decision, 2026-10-04).

## Operating Context

- Students reach it through kartikvyas.in, where institutions and their course materials are listed (VNIT, MICA and JIT were listed on 2 Oct 2026).
- Study is self-paced and usually done alone, on desktop or mobile browsers.
- The platform's existing modules follow this pattern: numbered chapters, "Try it" widgets, short quick checks, practice and a final quiz. That pattern is a reference for the student's mental model. It is not a format this section must reuse.
- A separate requirements draft (`D:\claude\student-action-analysis`) plans student login, server-side progress and activity tracking for the platform. How this section relates to that work is undecided.

## Capabilities and Constraints

Confirmed:
- Interactive visualizations of data structures and algorithm steps.
- In-browser Python coding with tests.
- A structured lesson path with practice problems and progress tracking.
- Authored graduated hints per problem and a written explanation per test case.
- No AI anywhere in the course (owner decision, 2026-10-04).
- The full worked solution unlocks only after the student has opened every hint for that problem. An **instructor passcode** unlocks any solution at any time; it is for the owner, not for students (owner, 2026-10-04).

Open decisions:
- Syllabus: the depth is decided (comprehensive, expert-level) and the station codes are four letters. The draft line of 30 stations and 180 lessons in `SYLLABUS-DRAFT.md` awaits confirmation.
- The Python runtime (Pyodide proposed) and how tests are written and judged.
- How strongly the solution lock is enforced. The prototype's lock can be bypassed by a determined student; proper enforcement needs the platform's login and a server.
- Login and progress storage: whether this section depends on the platform's planned login and tracking work, or has its own.
- Whether instructors see student progress for this section, and what they see.
- Whether it is free or paid, and whether it is open or limited to certain institutions or cohorts.

## Brand Commitments

It lives under the kartikvyas.in platform. It is separate from Logicology: don't use Logicology branding, games or voice here.

## Evidence on Hand

None yet. There are no lessons, problems, learner data, testimonials or outcome figures. Future work must not invent student counts, completion rates, placement results, reviews or institution endorsements.

## Product Principles

1. **Never leave a self-paced learner stuck.** With no instructor in the room, the product supplies the next step through a hint, a visualization or a smaller problem. It does that before a student gives up, and it doesn't hand over the full answer straight away.
2. **See it, then code it.** Each idea is understood by watching and manipulating the structure before the learner implements it in Python.
3. **Meet mixed backgrounds.** Don't assume prior CS training. Give beginners a way in and give experienced students a fast path.
4. **Zero setup.** Everything runs in the browser inside the platform students already use.
5. **Honest progress.** Progress reflects what the learner has actually done and solved, not just pages opened.
