/* DSA practice runner: a module worker (Pyodide 314 needs one) that loads Pyodide and the harness, then
   runs one request at a time. The page enforces time limits by terminating this worker, so an infinite
   loop never freezes it. */

const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";
let py = null;

async function boot() {
  try {
    self.postMessage({ type: "stage", stage: "fetching" });
    const { loadPyodide } = await import(PYODIDE + "pyodide.mjs");
    self.postMessage({ type: "stage", stage: "starting" });
    py = await loadPyodide({ indexURL: PYODIDE });
    const harness = await (await fetch(new URL("harness.py", self.location.href))).text();
    py.runPython(harness);
    const version = py.runPython("import sys; sys.version.split()[0]");
    self.postMessage({ type: "ready", version });
  } catch (e) {
    self.postMessage({ type: "boot-error", message: String((e && e.message) || e), online: self.navigator.onLine });
  }
}

const booting = boot();

self.onmessage = async (ev) => {
  await booting;
  const msg = ev.data;
  if (!py) return;
  try {
    if (msg.type === "load") {
      py.globals.set("_dsa_code", msg.code);
      py.globals.set("_dsa_blocked", JSON.stringify(msg.blocked || []));
      const out = py.runPython("dsa_load(_dsa_code, _dsa_blocked)");
      self.postMessage({ type: "loaded", id: msg.id, result: JSON.parse(out) });
    } else if (msg.type === "test") {
      py.globals.set("_dsa_fn", msg.fn);
      py.globals.set("_dsa_args", msg.args);
      py.globals.set("_dsa_expect", msg.expect);
      py.globals.set("_dsa_probe", msg.probe || 0);
      py.globals.set("_dsa_expr", msg.expr || "");
      const t0 = performance.now();
      const out = py.runPython("dsa_test(_dsa_fn, _dsa_args, _dsa_expect, _dsa_probe, _dsa_expr)");
      const ms = Math.round(performance.now() - t0);
      self.postMessage({ type: "tested", id: msg.id, result: { ...JSON.parse(out), ms } });
    }
  } catch (e) {
    self.postMessage({ type: "crash", id: msg.id, message: String((e && e.message) || e) });
  }
};
