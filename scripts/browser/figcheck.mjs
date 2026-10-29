// node figcheck.mjs CODE n [FIG:step ...]
// Opens lessons 1..n at 1280px and 390px, clicks every variant and steps each figure to its end.
// Reports console errors and sideways page scroll. Extra args "CODE-n.k:step" screenshot that figure.
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const [code, nStr, ...shots] = process.argv.slice(2);
const base = "http://localhost:3005/dsa";
const lo = code.toLowerCase();
const outDir = new URL("./shots/", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
let problems = 0;
const lessons = nStr.includes("-") ? (() => { const [a, b] = nStr.split("-").map(Number); return Array.from({ length: b - a + 1 }, (_, k) => a + k); })() : Array.from({ length: Number(nStr) }, (_, k) => k + 1);
for (const width of [1280, 390]) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900 });
  const errs = [];
  page.on("console", (m) => m.type() === "error" && !m.text().startsWith("Failed to load resource") && errs.push(m.text()));
  page.on("response", (r) => r.status() >= 400 && !r.url().includes("favicon") && errs.push(`${r.status()} ${r.url()}`));
  page.on("pageerror", (e) => errs.push(String(e)));
  for (const n of lessons) {
    errs.length = 0;
    await page.goto(`${base}/${lo}/${n}`, { waitUntil: "networkidle0" });
    const figs = await page.$$eval("figure[id]", (fs) => fs.map((f) => f.id));
    let steps = 0;
    for (const id of figs) {
      const fig = await page.$(`figure[id="${id}"]`);
      const variants = await fig.$$(".fig__variants button");
      const count = Math.max(1, variants.length);
      for (let v = 0; v < count; v++) {
        if (variants.length) {
          await variants[v].click();
          await new Promise((r) => setTimeout(r, 80));
        }
        for (let guard = 0; guard < 400; guard++) {
          const btn = await fig.$(".fig__controls .btn--board");
          const dis = await btn.evaluate((b) => b.disabled);
          if (dis) break;
          await btn.click();
          steps++;
        }
      }
    }
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const bad = errs.length || scroll > 1;
    if (bad) problems++;
    console.log(`${width}px ${code}-${n}: ${figs.join(",")} ${steps} steps${scroll > 1 ? ` SIDEWAYS ${scroll}px` : ""}${errs.length ? " ERRORS " + errs.join(" | ") : ""}`);
  }
  for (const s of shots) {
    const [fig, step] = s.split(":");
    const lesson = fig.split("-")[1].split(".")[0];
    await page.goto(`${base}/${lo}/${lesson}#${fig}:${step}`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 400));
    const el = await page.$(`figure[id="${fig}"]`);
    if (el) {
      const file = `${outDir}${fig.replace(".", "_")}-${step}-${width}.png`;
      await el.screenshot({ path: file });
      console.log("shot", file);
    }
  }
  await page.close();
}
await browser.close();
console.log(problems ? `${problems} PROBLEMS` : "all clean");
