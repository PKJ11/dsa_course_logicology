// node multishot.mjs FIG:variant:step:width ...   (step is 1-based)
import puppeteer from "puppeteer-core";
import fs from "node:fs";
fs.mkdirSync("shots", { recursive: true });
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const p = await b.newPage();
for (const spec of process.argv.slice(2)) {
  const [fig, v, n, w = "1280"] = spec.split(":");
  const [code, rest] = fig.split("-");
  await p.setViewport({ width: Number(w), height: 900 });
  await p.goto(`http://localhost:3005/dsa/${code.toLowerCase()}/${rest.split(".")[0]}`, { waitUntil: "networkidle0" });
  const f = await p.$(`figure[id="${fig}"]`);
  const vs = await f.$$(".fig__variants button"); if (vs.length) await vs[Number(v)].click(); await new Promise(r => setTimeout(r, 100));
  for (let i = 1; i < Number(n); i++) { await (await f.$(".fig__controls .btn--board")).click(); }
  await new Promise(r => setTimeout(r, 700));
  const file = `shots/${fig.replace(".", "_")}-v${v}-${n}-${w}.png`; await f.screenshot({ path: file }); console.log(file);
}
await b.close();
