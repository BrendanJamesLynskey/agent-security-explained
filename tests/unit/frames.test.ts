/**
 * Every chapter's data (src/lib/engine's runChapter, what the animations draw) equals what the
 * Python reference computes at the vendored commit (tests/fixtures/site_fixtures.json, regenerated
 * in CI from the reference installed at that commit), with no tolerance; and key frames say what the
 * chapters claim they say.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CHAPTER_CONFIGS,
  P,
  runChapter,
  type Chapter,
  type Obj,
} from "@/lib/engine";
import { passthroughCaption, privilegeFrames } from "@/lib/security/captions";

const ROOT = join(__dirname, "../..");
const fx = JSON.parse(
  readFileSync(join(ROOT, "tests/fixtures/site_fixtures.json"), "utf8"),
) as Obj;
const norm = (x: unknown) => JSON.parse(JSON.stringify(x));

describe("every chapter equals the Python reference", () => {
  for (const ch of Object.keys(CHAPTER_CONFIGS) as Chapter[])
    it(ch, () => expect(norm(runChapter(ch))).toEqual(fx.chapters[ch]));
});

describe("key frames", () => {
  it("chapter 1: the reply is denied at the gate, the notes-to-file task is not", () => {
    const b = runChapter("boundary").plans as Obj;
    const reply = b.reply_from_notes.context as Obj[];
    const last = reply[reply.length - 1]!;
    expect(last.decision).toBe("deny");
    expect(last.to).toBe("outside");
    expect(last.label).toEqual({ src: "untrusted", sens: "private" });
    for (const f of b.notes_to_file.context as Obj[])
      expect(f.decision).toBe("allow");
    // every frame has a caption, and labels only rise
    for (const p of P.catalogue.PLAN_ORDER)
      for (const m of ["context", "dataflow"])
        for (const f of b[p][m] as Obj[]) expect(f.caption).toMatch(/^Step /);
  });

  it("chapter 2: the classic agent is untrusted-controlled after the page; planned is not", () => {
    const c = runChapter("context").plans.notes_then_page as Obj;
    const fr = c.frames as Obj[];
    expect(fr.map((f) => f.context.decision)).toEqual([
      "allow",
      "allow",
      "ask",
      "allow",
      "deny",
    ]);
    expect(fr.map((f) => f.dataflow.decision)).toEqual([
      "allow",
      "allow",
      "allow",
      "allow",
      "ask",
    ]);
    expect(fr[4]!.context.control).toEqual({
      src: "untrusted",
      sens: "private",
    });
    for (const f of fr)
      expect(f.dataflow.control ?? P.labels.BOTTOM).toEqual(P.labels.BOTTOM);
  });

  it("chapter 3: only all three circles expose a flow out, and the check agrees with the search everywhere", () => {
    const t = runChapter("trifecta");
    for (const c of t.circles as Obj[])
      expect(c.exposure.exposed).toBe(c.mask === 7);
    for (const c of t.double as Obj[]) expect(c.exposure.exposed).toBe(true);
    expect(t.subsets.agree).toBe(t.subsets.n);
    expect(t.subsets.n).toBe(256);
  });

  it("chapter 4: the extra call is asked under the broad grant and denied under least privilege", () => {
    const s = runChapter("privilege");
    const fr = privilegeFrames(s);
    expect(fr).toHaveLength((s.frames as Obj[]).length + 1);
    const extra = fr[fr.length - 2]!;
    expect(extra.broad.decision).toBe("ask");
    expect(extra.task.decision).toBe("deny");
    expect(extra.task.token.ok).toBe(false);
    expect(fr[fr.length - 1]!.caption).toBe(passthroughCaption(s.passthrough));
    expect(fr[fr.length - 1]!.caption).toContain("rejected");
  });

  it("chapter 5: with every layer on, one unneeded action is still open, and nothing needed breaks", () => {
    const s = runChapter("sandbox");
    const all = (s.sets as Obj[]).find((x) => x.layers.length === 3)!;
    expect(all.tally).toEqual({ works: 3, broken: 0, stopped: 4, open: 1 });
    const open = (all.frames as Obj[]).filter((f) => f.outcome === "open");
    expect(open.map((f) => f.id)).toEqual(["net_registry_put"]);
    expect(open[0]!.caption).toContain("not what it carries");
    for (const set of s.sets as Obj[]) expect(set.tally.broken).toBe(0);
  });

  it("chapter 6: counts only fall, and with a shared blind spot the floor stays", () => {
    const d = runChapter("depth");
    for (const r of d.runs as Obj[]) {
      const counts = (r.frames as Obj[]).map((f) => f.count as number);
      expect(counts).toEqual([...counts].sort((a, b) => b - a));
      expect(counts[0]).toBe(P.catalogue.DEPTH_DOTS.n);
    }
    const last = (d.runs as Obj[]).find((r) => r.c === 0.04)!.frames.at(-1);
    expect(last.expected).toBeCloseTo(
      P.catalogue.DEPTH_DOTS.n * P.catalogue.DEPTH.base * 0.04,
      12,
    );
    expect(last.caption).toContain("no extra layer removes");
  });

  it("chapter 7: the planner sees names only, and planning is never stricter", () => {
    const d = runChapter("dual").plans as Obj;
    const R = P.engine.RANK;
    for (const p of P.catalogue.DUAL_PLANS) {
      const fr = d[p].frames as Obj[];
      expect(fr[0]!.actor).toBe("planner");
      expect(fr[0]!.planner_sees).toEqual(["q"]);
      for (const f of fr.slice(1))
        if (f.flow.decision !== "skip" && f.classic.decision !== "skip")
          expect(R[f.flow.decision]!).toBeLessThanOrEqual(
            R[f.classic.decision]!,
          );
    }
    const tp = d.notes_then_page.frames as Obj[];
    expect(tp.at(-1)!.flow.decision).toBe("ask");
    expect(tp.at(-1)!.classic.decision).toBe("deny");
    const ad = d.adaptive.frames as Obj[];
    expect(ad.at(-1)!.flow.control).toEqual({
      src: "untrusted",
      sens: "public",
    });
    expect(ad.at(-1)!.caption).toContain("tracked rather than hidden");
  });

  it("chapter 8: more prompts per threshold, and every call is worse than every write and send", () => {
    const a = runChapter("approval");
    const s = (th: string) => a.thresholds[th].summary as Obj;
    const ths = P.catalogue.UTILITY.thresholds as string[];
    const prompts = ths.map((t) => s(t).prompts as number);
    expect(prompts).toEqual([...prompts].sort((x, y) => x - y));
    expect(s("consequential").ungated).toBe(0);
    expect(s("every").risk).toBeGreaterThan(s("consequential").risk);
    expect(s("refuse").utility).toBeLessThan(s("policy").utility);
    for (const t of ths)
      expect(a.thresholds[t].frames).toHaveLength(P.catalogue.UTILITY.frames);
  });

  it("chapter 9: planning in advance is on the adaptive frontier, the detectors are not", () => {
    const f = runChapter("frontier");
    expect(f.adaptive.front).toContain("planned");
    expect(f.adaptive.front).not.toContain("detectors");
    expect(f.fixed.front).toContain("detectors");
    const pts = Object.fromEntries(
      (f.adaptive.points as Obj[]).map((p) => [p.id, p]),
    );
    expect(pts.detectors.risk).toBe(pts.none.risk);
    expect(pts.least.utility).toBe(pts.policy.utility);
    expect(pts.least.risk).toBeLessThan(pts.policy.risk);
    // every task the label policy blocks, it blocks by one rule
    const pol = (f.fixed.points as Obj[]).find((p) => p.id === "policy")!;
    expect(pol.by_rule["untrusted-egress-private"] / pol.n).toBe(pol.blocked);
  });

  it("chapter 10: the default design passes seven of nine; approvals trade check 2 for check 8", () => {
    const c = runChapter("checklist").default as Obj;
    expect(c.passed).toBe(7);
    expect(c.items.map((i: Obj) => i.ch)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const a = P.study.checklist({
      defence: "planned",
      approval: "consequential",
      sandbox: ["fs_scope", "container", "egress"],
    });
    expect(a.items[1].verdict).toBe("pass");
    expect(a.items[7].verdict).toBe("warn");
  });
});
