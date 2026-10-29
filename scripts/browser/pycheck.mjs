// node pycheck.mjs CODE n
// For each problem: put the reference code in localStorage, reload the practice page, run the tests in
// Pyodide and print the summary line.
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const [code, nStr] = process.argv.slice(2);
const lo = code.toLowerCase();
const root = "D:/claude/dsa-self-paced/app/dsa/_content/" + lo + "/solutions/";
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
let fails = 0;
for (let n = 1; n <= Number(nStr); n++) {
  const src = fs.readFileSync(root + `p${n}.ts`, "utf8");
  const sol = src.match(/export const code = `([\s\S]*?)`;/)[1].replace(/\\`/g, "`").replace(/\\\$\{/g, "${").replace(/\\\\/g, "\\");
  const url = `http://localhost:3005/dsa/${lo}/practice/${n}`;
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.evaluate((key, sol) => {
    const raw = JSON.parse(localStorage.getItem("dsa:progress:v1") || "{}");
    raw.figures ??= {};
    raw.problems ??= {};
    raw.problems[key] = { ...(raw.problems[key] || {}), code: sol };
    localStorage.setItem("dsa:progress:v1", JSON.stringify(raw));
  }, `${code}-P${n}`, sol);
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => /Run tests/.test(b.textContent) && !b.disabled), { timeout: 120000 });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /Run tests/.test(b.textContent)).click());
  await page.waitForFunction(() => {
    const s = document.querySelector(".tests__summary");
    const b = [...document.querySelectorAll("button")].find((b) => /Run tests/.test(b.textContent));
    return s && b && !b.disabled && /\d+\s*\/\s*\d+|of/.test(s.textContent);
  }, { timeout: 180000 });
  await new Promise((r) => setTimeout(r, 300));
  const summary = await page.$eval(".tests__summary", (e) => e.textContent.trim().replace(/\s+/g, " "));
  const failed = await page.$$eval(".tests tr.is-fail, .tests tr.is-error, tr.is-fail, tr.is-error", (r) => r.map((x) => x.textContent.trim().slice(0, 160)));
  if (failed.length) fails++;
  console.log(`${code}-P${n}: ${summary}${failed.length ? "\n   " + failed.join("\n   ") : ""}`);
}
if (errs.length) console.log("page errors:", errs.join(" | "));
await browser.close();
console.log(fails ? `${fails} problems with failures` : "all pass");
