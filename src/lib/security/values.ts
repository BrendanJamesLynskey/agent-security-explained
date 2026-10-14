/**
 * Every number the chapters quote comes from here: a path into what the engine computes for each
 * chapter (the same data the animations draw, src/lib/engine's runChapter), e.g.
 * "plan.reply_from_notes.classic.deny" or "pub.injecagent_react_gpt4". The MDX writes
 * <V of="…" fmt="…" />, so prose cannot drift from the tested engine (tests/unit/values.test.ts
 * checks every path the chapters use resolves, and that key numbers equal the engine's recorded
 * results).
 */
import {
  CHAPTER_CONFIGS,
  P,
  runChapter,
  type Chapter,
  type Obj,
} from "@/lib/engine";
import { fmtInt, pct, trim } from "@/lib/format";

export type Fmt = "int" | "pct" | "pct1" | "pct2" | "num" | "f2" | "raw";

let TREE: Obj | null = null;

export function tree(): Obj {
  if (TREE) return TREE;
  const t: Obj = {};
  for (const ch of Object.keys(CHAPTER_CONFIGS) as Chapter[])
    t[ch] = runChapter(ch);
  const K = P.catalogue;
  t.consts = {
    tools: K.TOOL_ORDER.length,
    plans: K.PLAN_ORDER.length,
    dests: K.DEST_ORDER.length,
    labels: P.labels.allLabels().length,
    actions: K.ACTIONS.length,
    layers: K.LAYERS.length,
  };
  // the published measurements, by id
  t.pub = {};
  t.pubtext = {};
  for (const x of K.PUBLISHED) {
    t.pub[x.id] = x.value;
    t.pubtext[x.id] = x.text;
  }
  // each plan under the broad grant: classic agent against planned in advance
  t.plan = {};
  for (const p of K.PLAN_ORDER) {
    const c = t.context.plans[p] as Obj;
    const fr = c.frames as Obj[];
    const last = fr[fr.length - 1]!;
    t.plan[p] = {
      title: K.PLANS[p]!.title,
      classic: c.summary.context,
      planned: c.summary.dataflow,
      classic_last: last.context.decision,
      planned_last: last.dataflow.decision,
      calls: fr.length - 1,
    };
  }
  // chapter 3
  const tri = t.trifecta as Obj;
  t.tri = {
    ...tri.subsets,
    held: Object.fromEntries(
      (tri.circles as Obj[]).map((c) => [
        c.name,
        { exposed: c.exposure.exposed, checked: c.exposure.checked },
      ]),
    ),
  };
  const all = (tri.circles as Obj[]).find((c) => c.mask === 7)!;
  const lastStep = (all.steps as Obj[])[(all.steps as Obj[]).length - 1]!;
  t.tri.all_decision = lastStep.decision;
  t.tri.all_rule = lastStep.fired.map((f: Obj) => f.rule).join(", ");
  // chapter 4
  const pv = t.privilege as Obj;
  const ext = (pv.frames as Obj[])[(pv.frames as Obj[]).length - 1]!;
  t.priv = {
    broad_tools: pv.runs.broad.grant.tools.length,
    task_tools: pv.runs.task.grant.tools.length,
    task_list: pv.runs.task.grant.tools.join(", "),
    unneeded: pv.runs.broad.over.tools.length,
    unneeded_list: pv.runs.broad.over.tools.join(", "),
    broad_tokens: Object.keys(pv.runs.broad.tokens).length,
    task_tokens: Object.keys(pv.runs.task.tokens).length,
    extra_broad: ext.broad.decision,
    extra_task: ext.task.decision,
    extra_task_rules: ext.task.fired.length,
    passthrough: pv.passthrough.check.reason,
  };
  // chapter 5: the cumulative layers
  const sb = t.sandbox as Obj;
  t.sb = {};
  (sb.frames as Obj[]).forEach((f, i) => {
    t.sb[`f${i}`] = { ...f.tally, layers: f.layers.length };
  });
  t.sb.needed = K.ACTIONS.filter((a) => a.need).length;
  t.sb.unneeded = K.ACTIONS.filter((a) => !a.need).length;
  // part two. Chapter 6: the depth table (keys "c<c>k<layers>"), the dots, the layers' miss rates
  const dp = t.depth as Obj;
  t.dp = {
    base: K.DEPTH.base,
    base_hi: K.DEPTH.base_range[1],
    n: K.DEPTH_DOTS.n,
    attempts: K.DEPTH.attempts,
    trials: K.DEPTH.trials,
    independent: dp.study.independent,
    miss: Object.fromEntries(
      (K.DEPTH.layers as Obj[]).map((l) => [l.id, l.miss]),
    ),
    t: {},
    run: {},
  };
  for (const r of dp.study.table as Obj[]) t.dp.t[`c${r.c}k${r.layers}`] = r;
  for (const r of dp.runs as Obj[])
    t.dp.run[`c${r.c}`] = {
      ...Object.fromEntries(
        (r.frames as Obj[]).map((f) => [`f${f.f}`, f.count]),
      ),
      floor: r.n * K.DEPTH.base * r.c,
    };
  // chapter 7
  t.du = {};
  for (const [p, d] of Object.entries(t.dual.plans as Obj))
    t.du[p] = {
      title: d.title,
      planned: d.summary.dataflow,
      classic: d.summary.context,
      extra: d.extra_calls,
    };
  // chapter 8
  const ap = t.approval as Obj;
  t.ap = { fatigue: {} };
  for (const th of K.UTILITY.thresholds as string[])
    t.ap[th] = ap.thresholds[th].summary;
  for (const x of ap.fatigue as Obj[]) t.ap.fatigue[`n${x.n}`] = x.miss;
  t.ap.first = K.UTILITY.approval_first_miss;
  t.ap.decay = K.UTILITY.approval_decay;
  t.ap.frames = K.UTILITY.frames;
  // chapter 9
  const fr = t.frontier as Obj;
  t.fr = {
    n: fr.n,
    adaptive_share: fr.adaptive_share,
    defences: K.DEFENCES.length,
    sim: fr.sim,
    fixed: {},
    adaptive: {},
    planner_calls: K.UTILITY.planner_calls,
    fp: K.UTILITY.fp,
    camel_ratio: t.pub.camel_secure / t.pub.camel_undefended,
  };
  for (const key of ["fixed", "adaptive"]) {
    for (const p of fr[key].points as Obj[])
      t.fr[key][p.id] = { ...p, front: fr[key].front.includes(p.id) };
    t.fr[key].front_n = fr[key].front.length;
    t.fr[key].base = fr[key].base;
  }
  // chapter 10
  const ck = (t.checklist as Obj).default as Obj;
  const withApproval = P.study.checklist({
    defence: "planned",
    approval: "consequential",
    sandbox: ["fs_scope", "container", "egress"],
  });
  t.ck = {
    approve: {
      passed: withApproval.passed,
      prompts: withApproval.summary.prompts,
      verdict: Object.fromEntries(
        (withApproval.items as Obj[]).map((i) => [`ch${i.ch}`, i.verdict]),
      ),
    },
    risk: ck.summary.risk,
    utility: ck.summary.utility,
    prompts: ck.summary.prompts,
    passed: ck.passed,
    budget: K.UTILITY.risk_budget,
    verdict: Object.fromEntries(
      (ck.items as Obj[]).map((i) => [`ch${i.ch}`, i.verdict]),
    ),
  };
  TREE = t;
  return t;
}

export function formatValue(v: unknown, fmt: Fmt): string {
  if (fmt === "raw") return String(v);
  const n = v as number;
  switch (fmt) {
    case "int":
      return fmtInt(n);
    case "pct":
      return pct(n);
    case "pct1":
      return pct(n, 1);
    case "pct2":
      return pct(n, 2);
    case "num":
      return trim(n);
    case "f2":
      return n.toFixed(2);
  }
}

export function lookup(path: string): unknown {
  // keys may contain dots or bars: at each level take the shortest run of segments that names a key
  const parts = path.split(".");
  let v: unknown = tree();
  let i = 0;
  while (i < parts.length) {
    if (v === null || typeof v !== "object")
      throw new Error(`no value at "${path}"`);
    let j = i + 1;
    while (j <= parts.length && !(parts.slice(i, j).join(".") in (v as Obj)))
      j++;
    if (j > parts.length) throw new Error(`no value at "${path}"`);
    v = (v as Obj)[parts.slice(i, j).join(".")];
    i = j;
  }
  if (v === undefined || v === null) throw new Error(`no value at "${path}"`);
  return v;
}
