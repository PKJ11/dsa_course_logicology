import re, sys, pathlib
root = pathlib.Path(r"D:/claude/dsa-self-paced/app/dsa")
c = root / "_content"
for code in sys.argv[1:]:
    lo = code.lower()
    f = c / "registry.ts"; s = f.read_text(encoding="utf-8")
    if f"{code}:" not in s:
        s = s.replace('import { PYTH_LESSONS', f'import {{ {code}_LESSONS, {code}_PROBLEMS }} from "./{lo}/meta";\nimport {{ PYTH_LESSONS', 1)
        s = s.replace("  BSRC: { lessons", f"  {code}: {{ lessons: {code}_LESSONS, problems: {code}_PROBLEMS }},\n  BSRC: {{ lessons", 1)
        f.write_text(s, encoding="utf-8")
    f = c / "bodies.ts"; s = f.read_text(encoding="utf-8")
    if f"{code}:" not in s:
        s = s.replace('import { PYTH_BODIES', f'import {{ {code}_BODIES }} from "./{lo}";\nimport {{ PYTH_BODIES', 1)
        s = s.replace("  BSRC: BSRC_BODIES", f"  {code}: {code}_BODIES,\n  BSRC: BSRC_BODIES", 1)
        f.write_text(s, encoding="utf-8")
    f = c / "defs.ts"; s = f.read_text(encoding="utf-8")
    if f"{code}:" not in s:
        s = s.replace('import { PYTH_PROBLEM_DEFS', f'import {{ {code}_PROBLEM_DEFS }} from "./{lo}/problems";\nimport {{ PYTH_PROBLEM_DEFS', 1)
        s = s.replace("  BSRC: BSRC_PROBLEM_DEFS", f"  {code}: {code}_PROBLEM_DEFS,\n  BSRC: BSRC_PROBLEM_DEFS", 1)
        f.write_text(s, encoding="utf-8")
    f = c / "solutions.ts"; s = f.read_text(encoding="utf-8")
    if f"{code}:" not in s:
        s = s.replace("  BSRC: () =>", f'  {code}: () => import("./{lo}/solutions"),\n  BSRC: () =>', 1)
        f.write_text(s, encoding="utf-8")
    f = root / "_data" / "syllabus.ts"; s = f.read_text(encoding="utf-8")
    s = re.sub(rf'(code: "{code}", name: "[^"]+", leg: "[A-D]", )(?!open)', r"\1open: true, ", s)
    f.write_text(s, encoding="utf-8")
    print("registered", code)
