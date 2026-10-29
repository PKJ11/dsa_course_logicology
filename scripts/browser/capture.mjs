// The B2 finish-review capture set (HASH and TREE). Copy and adapt for a new station: change OUT, the lesson list,
// the (figure, variant, steps) list and the practice cases. It reads naive_tree_p3.py from the working directory
// (write it from scripts/naive/tree.py first) and writes full-page and figure captures; slice tall pages with Pillow.
import puppeteer from "puppeteer-core";
import fs from "node:fs";
const OUT = "D:/claude/dsa-self-paced/.impeccable/review/b2/";
const base = "http://localhost:3005/dsa";
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const lessons = [...[1,2,3,4,5,6,7,8].map(n => ["hash", n]), ...[1,2,3,4,5,6,7].map(n => ["tree", n])];
// a meaningful mid step per figure: [fig, variantIndex, steps]
const figs = [["HASH-1.1",0,6],["HASH-2.1",1,10],["HASH-3.1",1,6],["HASH-4.1",0,9],["HASH-5.1",0,7],["HASH-6.1",1,6],["HASH-7.1",0,6],["HASH-8.1",0,7],
  ["TREE-1.1",1,7],["TREE-2.1",1,6],["TREE-3.1",0,6],["TREE-4.1",0,4],["TREE-5.1",2,5],["TREE-6.1",1,7],["TREE-7.1",1,8]];
const log = [];
for (const [w, tag] of [[1280, "desktop"], [390, "mobile"]]) {
  const p = await b.newPage();
  await p.setViewport({ width: w, height: w === 1280 ? 900 : 844 });
  await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  for (const [s, n] of lessons) {
    await p.goto(`${base}/${s}/${n}`, { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 400));
    const f = `${OUT}${tag}-${s}-${n}.png`; await p.screenshot({ path: f, fullPage: true }); log.push(f);
  }
  for (const [fig, v, steps] of figs) {
    const [code, rest] = fig.split("-");
    await p.goto(`${base}/${code.toLowerCase()}/${rest.split(".")[0]}`, { waitUntil: "networkidle0" });
    const el = await p.$(`figure[id="${fig}"]`);
    const vs = await el.$$(".fig__variants button"); if (vs.length) { await vs[v].click(); await new Promise(r => setTimeout(r, 100)); }
    for (let i = 1; i < steps; i++) await (await el.$(".fig__controls .btn--board")).click();
    await new Promise(r => setTimeout(r, 300));
    const f = `${OUT}${tag}-fig-${fig.replace(".", "_")}-v${v}-s${steps}.png`; await el.screenshot({ path: f }); log.push(f);
  }
  await p.close();
}
// map and practice
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 });
await p.goto(`${base}/`, { waitUntil: "networkidle0" }); await p.screenshot({ path: `${OUT}desktop-map.png`, fullPage: true }); log.push(`${OUT}desktop-map.png`);
async function practice(s, n, code, tag, width = 1280) {
  await p.setViewport({ width, height: 900 });
  const url = `${base}/${s}/practice/${n}`;
  await p.goto(url, { waitUntil: "networkidle0" });
  if (code !== null) {
    await p.evaluate((k, c) => { const r = JSON.parse(localStorage.getItem("dsa:progress:v1") || "{}"); r.figures ??= {}; r.problems ??= {}; r.problems[k] = { ...(r.problems[k] || {}), code: c }; localStorage.setItem("dsa:progress:v1", JSON.stringify(r)); }, `${s.toUpperCase()}-P${n}`, code);
    await p.goto(url, { waitUntil: "networkidle0" });
    await p.waitForFunction(() => [...document.querySelectorAll("button")].some(x => /Run tests/.test(x.textContent) && !x.disabled), { timeout: 120000 });
    await p.evaluate(() => [...document.querySelectorAll("button")].find(x => /Run tests/.test(x.textContent)).click());
    await p.waitForFunction(() => { const s = document.querySelector(".tests__summary"); const x = [...document.querySelectorAll("button")].find(x => /Run tests/.test(x.textContent)); return s && x && !x.disabled && /of/.test(s.textContent); }, { timeout: 240000 });
    const fail = await p.$("tr.is-fail button, tr.is-fail"); if (fail) { await fail.click().catch(() => {}); }
  }
  await new Promise(r => setTimeout(r, 400));
  const f = `${OUT}${tag}.png`; await p.screenshot({ path: f, fullPage: true }); log.push(f);
}
const sol = (s, n) => fs.readFileSync(`D:/claude/dsa-self-paced/app/dsa/_content/${s}/solutions/p${n}.ts`, "utf8").match(/export const code = `([\s\S]*?)`;/)[1].replace(/\`/g, "`").replace(/\\$\{/g, "${").replace(/\\/g, "\\");
await practice("hash", 2, null, "desktop-practice-hash-2-fresh");
await practice("hash", 6, sol("hash", 6), "desktop-practice-hash-6-solved");
await practice("tree", 3, fs.readFileSync("naive_tree_p3.py", "utf8"), "desktop-practice-tree-3-failing");
await practice("tree", 6, null, "mobile-practice-tree-6", 390);
await b.close();
fs.writeFileSync(OUT + "index.txt", log.map(x => x.replace(OUT, "")).join("\n"));
console.log(log.length, "captures");
