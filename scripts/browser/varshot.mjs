// node varshot.mjs FIG variant steps width
import puppeteer from "puppeteer-core";
const [fig, v, n, w = "1280"] = process.argv.slice(2);
const [code, rest] = fig.split("-");
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const p = await b.newPage(); await p.setViewport({ width: Number(w), height: 900 });
await p.goto(`http://localhost:3005/dsa/${code.toLowerCase()}/${rest.split(".")[0]}`, { waitUntil: "networkidle0" });
const f = await p.$(`figure[id="${fig}"]`);
const vs = await f.$$(".fig__variants button"); if (vs.length) await vs[Number(v)].click(); await new Promise(r => setTimeout(r, 100));
for (let i = 1; i < Number(n); i++) { await (await f.$(".fig__controls .btn--board")).click(); }
await new Promise(r => setTimeout(r, 800));
const file = `shots/${fig.replace(".", "_")}-v${v}-${n}-${w}.png`; await f.screenshot({ path: file }); console.log(file);
await b.close();
