"""The site's parity fixtures, from the Python reference engine at the vendored commit.

    python scripts/make_fixtures.py          # write tests/fixtures/site_fixtures.json
    python scripts/make_fixtures.py --check  # fail if it is out of date (CI)

For every chapter (src/data/chapter_configs.json), everything it animates and quotes, computed by the
reference's policy module: each task's boundary frames in both kinds of agent (chapter 1), the classic
agent against the plan made in advance (2), the trifecta cases and the agreement of the trifecta check
with the exhaustive search over every subset of the tools (3), least privilege (4) and every set of
sandbox layers (5); attempts through the detector layers (6), plan-then-execute (7), approval thresholds
(8), the frontier (9) and the default design's checklist (10). tests/unit/frames.test.ts recomputes them with the vendored TS port (src/lib/engine's
runChapter) and requires equality; tests/e2e/frames.spec.ts checks the captions on the page.

The engine must be installed from git at the commit in src/lib/engine/vendor/VENDORED.json
(reference/requirements.txt pins it); this script refuses to run otherwise.
"""
from __future__ import annotations

import argparse
import importlib.metadata
import json
import sys
from pathlib import Path

from agent_loop_sim.policy import capabilities as C
from agent_loop_sim.policy import catalogue as K
from agent_loop_sim.policy import study as S

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "tests/fixtures/site_fixtures.json"


def installed_commit() -> str:
    d = importlib.metadata.distribution("agent-loop-sim")
    info = json.loads(d.read_text("direct_url.json") or "{}")
    return info.get("vcs_info", {}).get("commit_id", "")


def run_chapter(chapter: str) -> dict:
    if chapter == "boundary":
        return {"plans": {p: {"context": S.boundary_frames(p, "context"), "dataflow": S.boundary_frames(p, "dataflow")}
                          for p in K.PLAN_ORDER}}
    if chapter == "context":
        return {"plans": {p: S.context_frames(p) for p in K.PLAN_ORDER}}
    if chapter == "trifecta":
        subsets = []
        for m in range(1 << len(K.TOOL_ORDER)):
            g = S.grant_for([t for i, t in enumerate(K.TOOL_ORDER) if m >> i & 1])
            subsets.append((C.trifecta(g)["all"], C.exposure(g)["exposed"]))
        return {**S.trifecta_study(),
                "subsets": {"n": len(subsets), "trifecta": sum(1 for a, _ in subsets if a),
                            "agree": sum(1 for a, b in subsets if a == b)}}
    if chapter == "privilege":
        return S.privilege_study()
    if chapter == "sandbox":
        return {"frames": S.sandbox_frames(), "sets": S.all_layer_sets()}
    if chapter == "depth":
        return {"runs": [S.depth_frames(c) for c in K.DEPTH["c"]], "study": S.depth_study()}
    if chapter == "dual":
        return {"plans": {p: S.dual_frames(p) for p in K.DUAL_PLANS}}
    if chapter == "approval":
        return S.approval_study()
    if chapter == "frontier":
        return S.frontier_study()
    return {"default": S.checklist()}


def build() -> dict[Path, str]:
    vendored = json.loads((ROOT / "src/lib/engine/vendor/VENDORED.json").read_text())
    commit = installed_commit()
    if commit != vendored["commit"]:
        sys.exit(f"installed agent-loop-sim is at {commit[:7] or '?'}, the site vendors {vendored['commit'][:7]}: "
                 "pip install -r reference/requirements.txt")
    configs = json.loads((ROOT / "src/data/chapter_configs.json").read_text())
    out = {"commit": commit, "chapters": {ch: run_chapter(ch) for ch in configs}}
    return {OUT: json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n"}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    files = build()
    for path, text in files.items():
        rel = path.relative_to(ROOT)
        if a.check:
            if not path.exists() or path.read_text(encoding="utf-8") != text:
                sys.exit(f"{rel} is out of date (run python scripts/make_fixtures.py)")
        else:
            path.write_text(text, encoding="utf-8")
            print(f"wrote {rel} ({len(text)} bytes)")
    if a.check:
        print("site fixtures up to date")


if __name__ == "__main__":
    main()
