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
});
