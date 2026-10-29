// node secshot.mjs URLPATH sectionId width [height]
import puppeteer from "puppeteer-core";
const [path, id, w = "390", h = "900"] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const p = await b.newPage();
await p.setViewport({ width: Number(w), height: Number(h) });
await p.goto(`http://localhost:3005/dsa/${path}`, { waitUntil: "networkidle0" });
const el = await p.$(`#${id}`);
const box = await el.boundingBox();
const y = box.y + (await p.evaluate(() => window.scrollY));
const file = `shots/sec-${path.replace(/\//g, "_")}-${id}-${w}.png`;
await p.screenshot({ path: file, clip: { x: 0, y: Math.max(0, y - 10), width: Number(w), height: Number(h) }, captureBeyondViewport: true });
console.log(file);
await b.close();
