// Finish-review capture set for one session: node capsession.mjs <session> <station> [station ...]
// Every lesson page at 1280 and 390 (full page), one capture per figure at both widths (variant 1 if it exists,
// at two thirds of its steps), the map, and four practice states (fresh, solved, failing with a row open, phone).
import puppeteer from "puppeteer-core";
import fs from "node:fs";
const [session, ...stations] = process.argv.slice(2);
const OUT = `D:/claude/dsa-self-paced/.impeccable/review/${session}/`;
fs.mkdirSync(OUT, { recursive: true });
const base = "http://localhost:3005/dsa";
const content = "D:/claude/dsa-self-paced/app/dsa/_content/";
const meta = (s) => {
  const src = fs.readFileSync(`${content}${s}/meta.ts`, "utf8");
  const figs = [...src.matchAll(/figures: \[([^\]]*)\]/g)].map((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
  const probs = [...src.matchAll(/\{ n: (\d+), title: "[^"]*", from:/g)].length;
  return { lessons: figs.length, figs: figs.flat(), probs };
};
const M = Object.fromEntries(stations.map((s) => [s, meta(s)]));
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const log = [];
const HIDE = () => {
  const add = () => {
    const st = document.createElement("style");
    st.textContent = "nextjs-portal{display:none!important}";
    document.documentElement.appendChild(st);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add);
  else add();
};
for (const [w, tag] of [[1280, "desktop"], [390, "mobile"]]) {
  const p = await b.newPage();
  await p.evaluateOnNewDocument(HIDE);
  await p.setViewport({ width: w, height: w === 1280 ? 900 : 844 });
  await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  for (const s of stations) {
    for (let n = 1; n <= M[s].lessons; n++) {
      await p.goto(`${base}/${s}/${n}`, { waitUntil: "networkidle0" });
      await new Promise((r) => setTimeout(r, 500));
      const f = `${OUT}${tag}-${s}-${n}.png`;
      await p.screenshot({ path: f, fullPage: true });
      log.push(f);
    }
    for (const fig of M[s].figs) {
      const n = fig.split("-")[1].split(".")[0];
      await p.goto(`${base}/${s}/${n}`, { waitUntil: "networkidle0" });
      const el = await p.$(`figure[id="${fig}"]`);
      const vs = await el.$$(".fig__variants button");
      const v = vs.length > 1 ? 1 : 0;
      if (vs.length) {
        await vs[v].click();
        await new Promise((r) => setTimeout(r, 150));
      }
      const total = await el.$eval(".fig__controls", (c) => Number((c.textContent.match(/of (\d+)/) || [0, 1])[1]));
      const steps = Math.max(1, Math.ceil((total * 2) / 3));
      for (let i = 1; i < steps; i++) await (await el.$(".fig__controls .btn--board")).click();
      await new Promise((r) => setTimeout(r, 700));
      const f = `${OUT}${tag}-fig-${fig.replace(".", "_")}-v${v}-s${steps}of${total}.png`;
      await el.screenshot({ path: f });
      log.push(f);
    }
  }
  await p.close();
}
const p = await b.newPage();
await p.evaluateOnNewDocument(HIDE);
await p.setViewport({ width: 1280, height: 900 });
await p.goto(`${base}/`, { waitUntil: "networkidle0" });
await p.screenshot({ path: `${OUT}desktop-map.png`, fullPage: true });
log.push(`${OUT}desktop-map.png`);
async function practice(s, n, code, tag, width = 1280) {
  await p.setViewport({ width, height: 900 });
  const url = `${base}/${s}/practice/${n}`;
  await p.goto(url, { waitUntil: "networkidle0" });
  if (code !== null) {
    await p.evaluate(
      (k, c) => {
        const r = JSON.parse(localStorage.getItem("dsa:progress:v1") || "{}");
        r.figures ??= {};
        r.problems ??= {};
        r.problems[k] = { ...(r.problems[k] || {}), code: c };
        localStorage.setItem("dsa:progress:v1", JSON.stringify(r));
      },
      `${s.toUpperCase()}-P${n}`,
      code,
    );
    await p.goto(url, { waitUntil: "networkidle0" });
    await p.waitForFunction(() => [...document.querySelectorAll("button")].some((x) => /Run tests/.test(x.textContent) && !x.disabled), { timeout: 180000 });
    await p.evaluate(() => [...document.querySelectorAll("button")].find((x) => /Run tests/.test(x.textContent)).click());
    await p.waitForFunction(
      () => {
        const s = document.querySelector(".tests__summary");
        const x = [...document.querySelectorAll("button")].find((x) => /Run tests/.test(x.textContent));
        return s && x && !x.disabled && /of/.test(s.textContent);
      },
      { timeout: 300000 },
    );
    const fail = await p.$("tr.is-fail button, tr.is-fail");
    if (fail) await fail.click().catch(() => {});
  }
  await new Promise((r) => setTimeout(r, 500));
  const f = `${OUT}${tag}.png`;
  await p.screenshot({ path: f, fullPage: true });
  log.push(f);
}
const sol = (s, n) =>
  fs
    .readFileSync(`${content}${s}/solutions/p${n}.ts`, "utf8")
    .match(/export const code = `([\s\S]*?)`;/)[1]
    .replace(/\\`/g, "`")
    .replace(/\\\$\{/g, "${")
    .replace(/\\\\/g, "\\");
const first = stations[0];
const last = stations[stations.length - 1];
const failS = stations[stations.length - 1];
const failN = fs.existsSync(`naive_${failS}_p2.py`) ? 2 : 1;
await practice(first, 1, null, `desktop-practice-${first}-1-fresh`);
await practice(first, M[first].probs, sol(first, M[first].probs), `desktop-practice-${first}-${M[first].probs}-solved`);
await practice(failS, failN, fs.readFileSync(`naive_${failS}_p${failN}.py`, "utf8"), `desktop-practice-${failS}-${failN}-failing`);
await practice(last, 1, null, `mobile-practice-${last}-1`, 390);
await b.close();
fs.writeFileSync(OUT + "index.txt", log.map((x) => x.replace(OUT, "")).join("\n"));
console.log(session, log.length, "captures");
