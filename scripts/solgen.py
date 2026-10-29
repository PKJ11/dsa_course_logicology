import json, pathlib
HEAD = "// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).\n"
BT = chr(96)
def write_station(station, n_lessons, sols):
    base = pathlib.Path(__file__).resolve().parent.parent / "app" / "dsa" / "_content" / station
    (base / "solutions").mkdir(exist_ok=True)
    code = station.upper()
    imports = "".join(f'import Lesson{k} from "./lesson{k}";\n' for k in range(1, n_lessons + 1))
    table = ", ".join(f"{k}: Lesson{k}" for k in range(1, n_lessons + 1))
    (base / "index.ts").write_text('import type { ComponentType } from "react";\n' + imports + f"\nexport const {code}_BODIES: Record<number, ComponentType> = {{ {table} }};\n", encoding="utf-8")
    idx = "// Each solution is its own chunk, fetched only when it unlocks.\nexport const SOLUTIONS: Record<number, () => Promise<{ code: string; notes: string[] }>> = {\n" + "".join(f'  {k}: () => import("./p{k}"),\n' for k in sorted(sols)) + "};\n"
    (base / "solutions" / "index.ts").write_text(idx, encoding="utf-8")
    for k, (src, notes) in sols.items():
        esc = src.replace("\\", "\\\\").replace(BT, "\\" + BT).replace("${", r"\${")
        body = HEAD + "export const code = " + BT + esc + BT + ";\n\nexport const notes = [\n" + "".join("  " + json.dumps(x, ensure_ascii=False) + ",\n" for x in notes) + "];\n"
        (base / "solutions" / f"p{k}.ts").write_text(body, encoding="utf-8")
    print("wrote", station, sorted(sols))
