# DSA course: deployment handoff

For the developer who will put the course on kartikvyas.in.
Owner: Kartik Vyas (learn@logicology.in). Written 2026-10-26.

This file covers deployment only. To change course content later, start with [HANDOFF-FINAL.md](HANDOFF-FINAL.md).

---

## 1. What you are deploying

- **The product.** A self-paced Data Structures and Algorithms course: 30 "stations" in 4 legs, with 180 lessons, 180 step-through figures and 170 practice problems.
- **How practice works.** Students write Python in the browser. It runs in **Pyodide** (Python compiled to WebAssembly) inside a Web Worker, so there is no server-side code execution.
- **Help without AI.** Help is written by the author: hint ladders, plus a note on every test.
- **The app.** A standalone **Next.js 16** app (App Router, React 19, TypeScript) at `D:\claude\dsa-self-paced`. All of it lives under the route **`/dsa`**.
- **Static and client-side.** There is no backend, no database, no login and no API route. Progress is stored in the student's browser.
- **Status.**
  - The content is finished and has had a full design review.
  - `npm run build` passes and exports 351 course pages (checked 2026-10-26).
  - Nothing has been deployed yet.

The intended home is **https://kartikvyas.in/dsa/**.

---

## 2. Requirements

| Need | Version used |
|---|---|
| Node.js | 24 (built with 24.19.0) |
| npm | the one that ships with Node 24 |
| Next.js | 16.3 (`^16.3.8`) |
| React / React DOM | 19.3 |
| TypeScript | 7.0 |

The runtime npm dependencies are:
- `next`, `react` and `react-dom`;
- `codemirror` and `@codemirror/{commands,lang-python,language,state,view}`;
- `@lezer/highlight`;
- `lucide-react` (icons).

Python is **not** needed to build or deploy. Python 3.14 is only used by the content scripts in `scripts/`.

Try it locally first:

```bash
npm install
npm run dev
```

Then open http://localhost:3005/dsa/.

---

## 3. Choose how to deploy

There are two ways. **Option A is the one the project was designed for.**

### Option A (recommended): merge it into the kartikvyas.in Next.js app as `/dsa`

The code was written to be copied into the platform app as one route section.

1. **Copy the folders.**
   - `app/dsa/` goes to `app/dsa/` in the platform app. That is all pages, components, content and styles.
   - `public/dsa/` goes to `public/dsa/`. That is `runner.mjs` (the Python worker) and `harness.py` (the test runner).
2. **Add the dependencies** listed in section 2 to the platform's `package.json`.
3. **Check the Next.js version.**
   - The platform must be on **Next.js 15 or later**: the pages read `params` as a Promise (`await params`).
   - On Next 14, the two dynamic pages need the older `params` form: `app/dsa/[station]/[lesson]/page.tsx` and `app/dsa/[station]/practice/[problem]/page.tsx`.
   - Next 16 is what was tested.
4. **Provide the fonts.**
   - `dsa.css` expects three CSS variables on an ancestor element: `--font-board`, `--font-read` and `--font-code`.
   - In this repo they come from `next/font/google` in `app/layout.tsx`. That is the stand-in root layout, so copy this part into the platform's root layout, or into `app/dsa/layout.tsx`:

   ```tsx
   import { Archivo, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
   const board = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-board", display: "swap" });
   const read = Source_Serif_4({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-read", display: "swap" });
   const code = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code", display: "swap" });
   // then put `${board.variable} ${read.variable} ${code.variable}` on <html> or on the .dsa wrapper
   ```

   - The `wdth` axis on Archivo is needed. The headings use a widened face.
5. **Styles are scoped.**
   - `app/dsa/dsa.css` is imported by `app/dsa/layout.tsx`, and every rule sits under the `.dsa` class, so it should not affect the rest of the site.
   - `app/globals.css` in this repo is only a stand-in for the platform's base styles (box-sizing, body margin). Don't copy it if the platform has its own.
6. **Replace the stand-ins.**
   - **`app/page.tsx`** is a mock of the platform home page. Don't copy it. If the home page should get a DSA card, its markup is in that file (the `dsa-card` classes are styled in `dsa.css`).
   - **`PlatformBar`** in `app/dsa/_components/Frame.tsx` is a stand-in for the site header. It is a link to `/` and a "DSA" link, and it is used on the map, lesson and practice pages. Swap it for the platform's real header, or keep it.
   - **Page titles** come from `app/dsa/layout.tsx`, using the template `"%s · DSA · kartikvyas.in"`. Adjust it if the platform has its own pattern.
7. **Set the environment variable** described in section 5.
8. **Build and deploy** the platform as you normally do. Every lesson and practice page has `generateStaticParams`, so all of them are pre-rendered at build time.

`output: "export"` and `trailingSlash: true` in this repo's `next.config.mjs` are for the standalone build. The platform does not need `output: "export"`. Do keep **trailing slashes** in mind: every internal link is written as `/dsa/.../`. Either set `trailingSlash: true` in the platform, or make sure both forms reach the same page.

### Option B: deploy the standalone static export

Use this if the course should go live before it is merged into the platform app, or if the platform is not a Next.js 15+ app.

```bash
npm install
npm run build        # writes the static site to out/
```

What `out/` contains, about 45 MB in all:

| Path | What it is |
|---|---|
| `out/dsa/` | the course pages; each page is `index.html` plus the data files Next.js needs |
| `out/_next/` | the JavaScript, CSS and fonts |
| `out/index.html` | the **stand-in home page**; don't publish it as kartikvyas.in's home |

Things to know before you upload `out/`:
- **Use a subdomain, or the same domain carefully.**
  - The simplest choice is a subdomain, for example `dsa.kartikvyas.in`, with `/` redirecting to `/dsa/`.
  - Putting `out/` under the main domain only works if the main site does not already use `/_next/`. Any Next.js site does.
- **Prefetch 404s are harmless.**
  - On a plain static host, Next 16's prefetch requests (`__next.*.__PAGE__.txt`) return 404, because the export writes them as nested folders.
  - Pages still work; links just do full page loads.
  - A host rewrite can fix it, and so can Option A.
- **Preview the export locally** before you upload it, with `npm run start` (`npx serve out -l 3005`). Stop the dev server first.

---

## 4. Hosting requirements (both options)

- **The course must be served at `/dsa/`.**
  - About 114 source files link to absolute paths such as `/dsa/bsrc/2/`.
  - The Python worker is loaded from `/dsa/runner.mjs`.
  - Serving the course under another path means changing those, or adding a `basePath` and updating the links.
- **MIME types.**
  - `/dsa/runner.mjs` must be served as JavaScript (`text/javascript`), because it is started as a **module worker**.
  - `/dsa/harness.py` is fetched as text; `text/plain` is fine.
- **Python download (Pyodide).**
  - The worker loads Pyodide 314.0.7 from `https://cdn.jsdelivr.net/pyodide/v314.0.7/full/`.
  - The first practice visit downloads about 10 MB. The browser caches it after that.
  - The students' network must allow jsDelivr. To self-host Pyodide instead, change the `PYODIDE` constant at the top of `public/dsa/runner.mjs`.
- **Content Security Policy.** If the site sends a CSP, it must allow at least:
  - `script-src`: `'self'` and `https://cdn.jsdelivr.net`, plus `'wasm-unsafe-eval'` (WebAssembly);
  - `connect-src`: `https://cdn.jsdelivr.net`;
  - `worker-src`: `'self'`.
- **No special headers.** No COOP/COEP headers or cross-origin isolation are needed. The app does not use SharedArrayBuffer.
- **Phones.** Phones never download Python. A practice page on a phone shows the problem and the hints, with "Continue on a laptop".

---

## 5. The instructor passcode (environment variable)

The owner can unlock every worked solution with a passcode. Students unlock a solution only after opening all of its hints.

- **Variable:** `NEXT_PUBLIC_DSA_INSTRUCTOR_HASH`.
- **Value:** the SHA-256 hash of the passcode, never the passcode itself. Generate it with:

  ```bash
  node scripts/hash-passcode.mjs "the owner's long passcode"
  ```

- **It is baked in at build time.** It is a `NEXT_PUBLIC_` variable, so it must be set in the environment that runs `next build`. Changing it later means rebuilding.
- **A hash already exists locally.** `.env.local` in this folder holds a 64-character hash. Confirm with the owner that it matches the passcode they want, or generate a new one.
  - `.env.local` is git-ignored and should not be committed.
  - `.env.example` shows the format.
- **If the variable is empty,** the "Instructor" link on practice pages says that no passcode is set.
- **This lock is not secure.**
  - It runs entirely in the browser.
  - A determined student can read the solution files or edit browser storage.
  - Real enforcement needs platform login and a server route. That has not been built (section 8).

---

## 6. Student progress

- Progress is stored in the student's own browser, in `localStorage` under the key **`dsa:progress:v1`**. The logic is in `app/dsa/_lib/progress.ts`.
- It holds how far each figure was stepped, the last place visited, and, for each problem, whether it is solved, how many hints are open, whether the solution is open, and the code typed.
- It does **not** follow the student to another browser or device.
- Clearing site data resets it.
- Instructor unlocks last for one browser tab (`sessionStorage`, `dsa:instructor`).
- No data is sent anywhere.

Joining this progress to the platform's own login and tracking is an open decision for the owner (section 8).

---

## 7. What to copy and what to leave behind

| Folder or file | Deploy? | Notes |
|---|---|---|
| `app/dsa/`, `public/dsa/` | **Yes** | The whole course. |
| `app/layout.tsx`, `app/page.tsx`, `app/globals.css` | No (stand-ins) | Take only the font set-up from `layout.tsx` (section 3, step 4). |
| `package.json`, `next.config.mjs`, `tsconfig.json` | Use as a reference | Merge the dependencies; keep your own configs. |
| `.env.example` | Reference | It shows the passcode variable. |
| `scripts/` | No | Content tools: the test builders, the solution writers and the checks. They are needed only when the course content changes. |
| `.impeccable/`, `shots/`, `*.md` handoffs | No | Design records, review captures and build history. |
| `videos/`, `voiceovers/` | No | They belong to other projects and are not part of this course. |
| `out/`, `.next/`, `node_modules/` | No | Build output; it is regenerated. |

`AGENTS.md` and `CLAUDE.md` are notes for AI coding agents. `next dev` rewrites part of `AGENTS.md`. Neither is needed on the site.

---

## 8. Open decisions (ask the owner, don't guess)

1. **Login and progress.** Should progress stay in the browser, or join the platform's planned login and server-side tracking?
2. **Solution lock.** How strongly should solutions be locked once there is login? This needs a server route.
3. **Course name.** "Data Structures and Algorithms" on the home card, and "THE LINE" on the map board, are working titles.
4. **Favicon,** page title pattern, and any analytics.
5. **Access and pricing.** Is it free or paid, and is it open to everyone or only to certain institutions or cohorts?
6. **What instructors see** of student progress. Today, instructors see nothing.

---

## 9. Check after deploying

On a laptop (Chrome, Edge, Firefox or Safari):
- [ ] `/dsa/` shows the course map with 30 stations.
- [ ] A lesson, such as `/dsa/bsrc/2/`, loads with fonts. The headings are a wide, heavy grotesk on a yellow board, and the body text is a serif.
- [ ] A figure steps forward and back, with the arrow buttons and the slider.
- [ ] On a practice page, such as `/dsa/bsrc/practice/1/`, "Python 3.14.x ready" appears after the first download (about 10 MB). Then "Run tests" runs and shows test rows.
- [ ] The browser console shows no CSP or MIME errors for `runner.mjs`, `harness.py` or `cdn.jsdelivr.net`.
- [ ] "Instructor" and the owner's passcode unlock a worked solution.
- [ ] Progress survives a page reload: a solved problem still shows as solved, and typed code is still in the editor.

On a phone (390px wide):
- [ ] Lessons never scroll sideways. Wide figures and code scroll inside their own box, with a "swipe sideways" line.
- [ ] A practice page shows the problem, the hints and "Continue on a laptop", and does not download Python.

---

## 10. Where to read more

| File | For |
|---|---|
| [HANDOFF-FINAL.md](HANDOFF-FINAL.md) | Changing course content: how the pieces fit, change recipes, the checks to run, and the owner's rules. |
| [README.md](README.md) | The folder map, the scripts, and how to add a station. |
| [DESIGN.md](DESIGN.md) | The design system as built. |
| [PRODUCT.md](PRODUCT.md) | Who the course is for and what success means. |
