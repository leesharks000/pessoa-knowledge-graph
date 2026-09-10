#!/usr/bin/env python3
"""sync_graph.py — one store, two locations, byte-identical.

src/graph.json is the CANONICAL STORE: the component imports it, so Rollup inlines it and the
built bundle carries the graph. public/graph.json is the SERVED COPY, so /graph.json resolves
for machines that want the data without parsing a React bundle. They must not drift.

WHY A CHECK AND NOT A CONVENTION (2026-09-09). The first attempt put the store in public/ and
imported ../public/graph.json. Vite excludes public/ from the module graph: the import silently
resolved to nothing, THE BUILD SUCCEEDED, and the bundle shipped with no graph. The second
attempt moved the store to src/ but still referenced the old literal names (__G.RAW, __G.ET)
instead of the store's keys (nodes, edge_types); Rollup tree-shakes unused JSON keys, so again
the build succeeded and again the bundle was empty. Both failures looked identical from outside:
green build, plausible file sizes, blank graph. Hence a check that reads the BUILT BUNDLE and
asserts the data is in it.
"""
import json, pathlib, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, PUB = ROOT / "src/graph.json", ROOT / "public/graph.json"


def main():
    g = json.loads(SRC.read_text(encoding="utf-8"))
    ids = {x["id"] for x in g["nodes"]}
    dangling = [x for x in g["edges"] if x.get("source") not in ids or x.get("target") not in ids]
    if dangling:
        print(f"FAIL — {len(dangling)} dangling edge(s): {dangling[:3]}")
        return 1
    shutil.copyfile(SRC, PUB)
    print(f"synced: {len(g['nodes'])} nodes, {len(g['edges'])} edges, 0 dangling")

    dist = ROOT / "dist/assets"
    if dist.exists() and any(dist.glob("index-*.js")):
        js = max(dist.glob("index-*.js"), key=lambda p: p.stat().st_size).read_text(encoding="utf-8", errors="replace")
        probes = [g["nodes"][0]["label"], g["nodes"][len(g["nodes"]) // 2]["label"]]
        missing = [p for p in probes if p not in js]
        if missing:
            print(f"FAIL — the built bundle does not contain the graph; missing {missing}")
            return 1
        print(f"  bundle carries the graph ({len(js):,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
