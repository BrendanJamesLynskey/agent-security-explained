/**
 * Every <V of="…" /> in the chapters resolves to an engine value, and the numbers the prose
 * quotes are the ones the engine's recorded run (policy_results.md) has.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { P, type Obj } from "@/lib/engine";
import { formatValue, lookup, tree, type Fmt } from "@/lib/security/values";

const DIR = join(__dirname, "../../content/chapters");
const RESULTS = readFileSync(
  join(__dirname, "../../src/data/policy_results.md"),
  "utf8",
);

describe("every quoted value resolves", () => {
  for (const f of readdirSync(DIR).filter((x) => x.endsWith(".mdx"))) {
    const src = readFileSync(join(DIR, f), "utf8");
    it(f, () => {
      const uses = [...src.matchAll(/<V of="([^"]+)"(?: fmt="([^"]+)")? \/>/g)];
      expect(uses.length).toBeGreaterThan(0);
      for (const [, path, fmt] of uses)
        expect(
          () => formatValue(lookup(path!), (fmt ?? "num") as Fmt),
          path,
        ).not.toThrow();
    });
  }
});

describe("formats and lookups", () => {
  it("formats", () => {
    expect(formatValue(1234, "int")).toBe("1,234");
    expect(formatValue(0.5, "pct")).toBe("50%");
    expect(formatValue(0.6825, "pct1")).toBe("68.3%");
    expect(formatValue(1.23456, "num")).toBe("1.23");
    expect(formatValue(1.234, "f2")).toBe("1.23");
    expect(formatValue("x", "raw")).toBe("x");
  });
  it("lookups fail loudly", () => {
    expect(() => lookup("plan.nope")).toThrow();
    expect(() => lookup("consts.tools.x")).toThrow();
    expect(lookup("tri.held.private+untrusted+outbound.exposed")).toBe(true);
    expect(lookup("pub.injecagent_react_gpt4")).toBe(0.24);
    expect(tree()).toBe(tree());
  });
});

describe("the prose agrees with the engine's recorded results", () => {
  const t = tree();
  it("every task's decisions", () => {
    for (const p of P.catalogue.PLAN_ORDER) {
      const r = t.plan[p] as Obj;
      const a = (s: Obj) => `${s.allow} / ${s.ask} / ${s.deny}`;
      expect(RESULTS).toContain(
        `| ${r.title} | ${a(r.classic)} | ${a(r.planned)} | ${r.classic_last} | ${r.planned_last} |`,
      );
    }
  });
  it("the trifecta", () => {
    expect(RESULTS).toContain(
      `Over all ${t.tri.n} subsets of the ${t.consts.tools} tools: ${t.tri.trifecta} hold all three circles; the trifecta check and the exhaustive search for a flow out agree on ${t.tri.agree} of ${t.tri.n}.`,
    );
  });
  it("least privilege", () => {
    expect(RESULTS).toContain(
      `least privilege: ${t.priv.task_tools} (${t.priv.task_list})`,
    );
    expect(RESULTS).toContain(
      `| send_message | ${t.priv.extra_broad} | ${t.priv.extra_task} |`,
    );
  });
  it("sandbox layers", () => {
    const f = t.sb.f3 as Obj;
    expect(RESULTS).toContain(
      `| fs_scope + container + egress | ${f.works} | ${f.broken} | ${f.stopped} | ${f.open} |`,
    );
  });
  it("published measurements", () => {
    for (const x of P.catalogue.PUBLISHED)
      expect(RESULTS).toContain(`| ${x.what} | ${x.text} | ${x.arxiv} |`);
  });
});
