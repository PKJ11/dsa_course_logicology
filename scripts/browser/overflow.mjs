import puppeteer from "puppeteer-core";
const [url, w] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const p = await b.newPage(); await p.setViewport({ width: Number(w), height: 900 });
await p.goto(url, { waitUntil: "networkidle0" }); await new Promise(r=>setTimeout(r,500));
console.log(await p.evaluate(() => { const W = innerWidth; const out = []; for (const e of document.querySelectorAll("*")) { const r = e.getBoundingClientRect(); if (r.right > W + 1 && r.width > 0) out.push(`${e.tagName}.${(e.className && e.className.baseVal === undefined ? e.className : "").toString().slice(0,40)} right=${Math.round(r.right)} w=${Math.round(r.width)}`); } return out.slice(0, 25).join("\n") + "\nscrollW=" + document.documentElement.scrollWidth; }));
await b.close();
