"""The vendored engine files are the engine repository's files at the pinned commit, and the reference
installed at that commit reproduces the engine's policy fixtures."""
from __future__ import annotations

import hashlib
import importlib.metadata
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
VENDORED = json.loads((ROOT / "src/lib/engine/vendor/VENDORED.json").read_text())


def test_every_vendored_file_matches_its_hash():
    assert len(VENDORED["files"]) == 15
    for path, rec in VENDORED["files"].items():
        assert hashlib.sha256((ROOT / path).read_bytes()).hexdigest() == rec["sha256"], path


def test_installed_reference_is_the_vendored_commit():
    d = importlib.metadata.distribution("agent-loop-sim")
    assert json.loads(d.read_text("direct_url.json"))["vcs_info"]["commit_id"] == VENDORED["commit"]


def test_the_reference_reproduces_the_engine_fixtures():
    from agent_loop_sim.policy import catalogue as K
    from agent_loop_sim.policy import engine as E
    from agent_loop_sim.policy import study as S

    fx = json.loads((ROOT / "tests/fixtures/policy_fixtures.json").read_text())
    assert fx["engine"] == "1.10.0"
    assert json.loads(json.dumps(S.trifecta_study())) == fx["study"]["trifecta"]
    assert json.loads(json.dumps(S.privilege_study())) == fx["study"]["privilege"]
    assert json.loads(json.dumps(S.sandbox_frames())) == fx["study"]["sandbox"]
    for r in fx["runs"][:12]:
        assert r["grant"] != "broad" or json.loads(json.dumps(E.run_plan(K.PLANS[r["plan"]], K.BROAD, r["mode"],
                                                                         r["approve"]))) == r["steps"]


def test_the_site_fixtures_come_from_the_vendored_commit():
    fx = json.loads((ROOT / "tests/fixtures/site_fixtures.json").read_text())
    assert fx["commit"] == VENDORED["commit"]
    assert set(fx["chapters"]) == {"boundary", "context", "trifecta", "privilege", "sandbox"}
