// node rows.mjs CODE n file.py : run code on a practice page and print every test row (name, status, time)
import puppeteer from "puppeteer-core";
import fs from "node:fs";
const [code, n, file] = process.argv.slice(2);
const sol = fs.readFileSync(file, "utf8");
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const p = await b.newPage();
await p.setViewport({ width: 1280, height: 900 });
const url = `http://localhost:3005/dsa/${code.toLowerCase()}/practice/${n}`;
await p.goto(url, { waitUntil: "networkidle0" });
await p.evaluate((k, s) => {
  const r = JSON.parse(localStorage.getItem("dsa:progress:v1") || "{}");
  r.figures ??= {};
  r.problems ??= {};
  r.problems[k] = { ...(r.problems[k] || {}), code: s };
  localStorage.setItem("dsa:progress:v1", JSON.stringify(r));
}, `${code}-P${n}`, sol);
await p.goto(url, { waitUntil: "networkidle0" });
const editor = await p.evaluate(() => document.querySelector(".cm-content")?.textContent.slice(0, 120));
console.log("editor starts:", editor);
await p.waitForFunction(() => [...document.querySelectorAll("button")].some((x) => /Run tests/.test(x.textContent) && !x.disabled), { timeout: 120000 });
await p.evaluate(() => [...document.querySelectorAll("button")].find((x) => /Run tests/.test(x.textContent)).click());
await p.waitForFunction(() => {
  const s = document.querySelector(".tests__summary");
  const x = [...document.querySelectorAll("button")].find((x) => /Run tests/.test(x.textContent));
  return s && x && !x.disabled && /of/.test(s.textContent);
}, { timeout: 600000 });
await new Promise((r) => setTimeout(r, 300));
console.log(await p.$eval(".tests__summary", (e) => e.textContent.trim()));
const rows = await p.evaluate(() => [...document.querySelectorAll("tr")].map((t) => t.textContent.replace(/\s+/g, " ").slice(0, 120)));
console.log(rows.join("\n"));
await b.close();
