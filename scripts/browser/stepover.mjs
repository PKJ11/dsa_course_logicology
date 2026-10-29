// node stepover.mjs CODE n width : step every variant of lesson n's figures, report sideways overflow per step and the widest offenders
import puppeteer from "puppeteer-core";
const [code, n, w = "390"] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const p = await b.newPage(); await p.setViewport({ width: Number(w), height: 900 });
await p.goto(`http://localhost:3005/dsa/${code.toLowerCase()}/${n}`, { waitUntil: "networkidle0" });
const check = async (tag) => {
  const r = await p.evaluate(() => {
    const over = document.documentElement.scrollWidth - window.innerWidth;
    if (over <= 1) return null;
    // skip elements inside a box that clips or scrolls (a code block's long line is not the culprit); count text that sticks out of its box
    const clipped = (e) => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowX !== "visible") return true; return false; };
    const bad = [...document.querySelectorAll("body *")].filter((e) => Math.max(e.getBoundingClientRect().right, e.getBoundingClientRect().left + e.scrollWidth) > window.innerWidth + 1 && !clipped(e) && getComputedStyle(e).overflowX === "visible").reverse().slice(0, 6).map((e) => `${e.tagName}.${e.className?.baseVal ?? e.className} r=${Math.round(e.getBoundingClientRect().right)}`);
    return { over, bad };
  });
  if (r) console.log(tag, JSON.stringify(r));
};
await check("load");
for (const fig of await p.$$("figure[id]")) {
  const vs = await fig.$$(".fig__variants button");
  for (let v = 0; v < Math.max(1, vs.length); v++) {
    if (vs.length) { await vs[v].click(); await new Promise((r) => setTimeout(r, 100)); }
    for (let s = 1; s < 60; s++) {
      await check(`v${v} s${s}`);
      const btn = await fig.$(".fig__controls .btn--board");
      if (await btn.evaluate((x) => x.disabled)) break;
      await btn.click(); await new Promise((r) => setTimeout(r, 450));
    }
  }
}
console.log("done"); await b.close();
