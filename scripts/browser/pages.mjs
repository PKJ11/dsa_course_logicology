// node pages.mjs CODE lessons problems: page width at 390px (sideways scroll) and code blocks that scroll sideways at 1280px.
import puppeteer from "puppeteer-core";
const [code, nl, np] = process.argv.slice(2);
const lo = code.toLowerCase();
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const p = await b.newPage();
const urls = [];
for (let k = 1; k <= Number(nl); k++) urls.push(`http://localhost:3005/dsa/${lo}/${k}`);
for (let k = 1; k <= Number(np); k++) urls.push(`http://localhost:3005/dsa/${lo}/practice/${k}`);
let bad = 0;
for (const w of [390, 1280]) {
  await p.setViewport({ width: w, height: 900 });
  for (const u of urls) {
    await p.goto(u, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 300));
    const r = await p.evaluate(() => {
      const over = document.documentElement.scrollWidth - innerWidth;
      const blocks = [...document.querySelectorAll("pre, .code, .cm-scroller")].filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => (e.closest("figure")?.querySelector(".code__head")?.textContent || e.textContent.slice(0, 40)).trim());
      return { over, blocks };
    });
    const flag = r.over > 0 || (w === 1280 && r.blocks.length);
    if (flag) bad++;
    console.log(`${w} ${u.replace("http://localhost:3005", "")} ${r.over > 0 ? `SIDEWAYS ${r.over}px` : "ok"}${w === 1280 && r.blocks.length ? ` code scrolls: ${r.blocks.join(" | ")}` : ""}`);
  }
}
console.log(bad ? `${bad} problems` : "all clean");
await b.close();
