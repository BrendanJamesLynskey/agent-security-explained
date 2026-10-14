/**
 * /data: the engine's recorded run, as tables. Every value is computed by the vendored engine when
 * the page is built, the same numbers as the engine's fixtures/policy_results.md (checked in
 * tests/unit/values.test.ts). Server Component, static.
 */
import type { ReactNode } from "react";

import { MdxTable } from "@/components/ui/MdxTable";
import { P, type Obj } from "@/lib/engine";
import { tree } from "@/lib/security/values";
import { ARXIV, ENGINE_URL, PAPERS, repoFile } from "@/lib/site";

export const metadata = {
  title: "Data",
  description:
    "The policy engine's recorded run: every task's decisions in a classic agent and planned in advance, the trifecta check against an exhaustive search, least privilege, sandbox layers, layered detectors, plan-then-execute, approval thresholds, every defence's cost and risk on the benign suite, the checklist, and the published measurements the chapters quote.",
};

const A =
  "focus-ring rounded text-accent underline underline-offset-2 dark:text-indigo-300";

function T({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <MdxTable>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </MdxTable>
  );
}

const aad = (s: Obj) => `${s.allow} / ${s.ask} / ${s.deny}`;
const pc = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;

export default function DataPage(): JSX.Element {
  const t = tree();
  const K = P.catalogue;
  const tri = t.trifecta as Obj;
  const pv = t.privilege as Obj;
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-accent dark:text-indigo-300">
        /data
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        The recorded run
      </h1>
      <div className="mdx-content mt-6">
        <p>
          Everything the chapters quote, computed by the vendored{" "}
          <a href={ENGINE_URL} className={A}>
            engine
          </a>{" "}
          as this page was built; the engine records the same run in{" "}
          <a href={repoFile("src/data/policy_results.md")} className={A}>
            policy_results.md
          </a>
          . The tools, tasks, grants and sandbox actions are abstract
          placeholders; the published measurements are quoted from their papers.
        </p>

        <h2>Chapters 1 and 2: every task, two kinds of agent</h2>
        <T
          head={[
            "task",
            "classic agent: allow / ask / deny",
            "planned in advance: allow / ask / deny",
            "last call, classic",
            "last call, planned",
          ]}
          rows={K.PLAN_ORDER.map((p) => {
            const r = t.plan[p] as Obj;
            return [
              r.title,
              aad(r.classic),
              aad(r.planned),
              r.classic_last,
              r.planned_last,
            ];
          })}
        />

        <h2>Chapter 3: the trifecta</h2>
        <p>
          Over all {t.tri.n} subsets of the {K.TOOL_ORDER.length} tools,{" "}
          {t.tri.trifecta} hold all three circles; the trifecta check and the
          exhaustive search for a flow out agree on {t.tri.agree} of {t.tri.n}.
        </p>
        <T
          head={[
            "circles held",
            "trifecta",
            "flow out found",
            "sequences checked",
          ]}
          rows={[...(tri.circles as Obj[]), ...(tri.double as Obj[])].map(
            (c) => [
              c.name,
              c.trifecta.all ? "yes" : "no",
              c.exposure.exposed
                ? `${(c.exposure.path as string[]).join(" → ")} (${c.exposure.dest})`
                : "none",
              c.exposure.checked,
            ],
          )}
        />

        <h2>Chapter 4: least privilege</h2>
        <p>
          {pv.plan.title}. Broad grant: {t.priv.broad_tools} tools; least
          privilege: {t.priv.task_tools} ({t.priv.task_list}). Held but unused
          under the broad grant: {t.priv.unneeded_list}.
        </p>
        <T
          head={[
            "call",
            "broad grant",
            "least privilege",
            "token, least privilege",
          ]}
          rows={(pv.frames as Obj[])
            .slice(1)
            .map((f) => [
              f.broad.tool,
              f.broad.decision,
              f.task.decision,
              f.task.token.reason,
            ])}
        />

        <h2>Chapter 5: sandbox layers</h2>
        <T
          head={[
            "layers",
            "needed, working",
            "needed, broken",
            "unneeded, stopped",
            "unneeded, open",
          ]}
          rows={(t.sandbox.frames as Obj[]).map((f) => [
            (f.layers as string[]).join(" + ") || "none",
            f.tally.works,
            f.tally.broken,
            f.tally.stopped,
            f.tally.open,
          ])}
        />

        <p>
          Part two&apos;s numbers are recorded in{" "}
          <a href={repoFile("src/data/policy2_results.md")} className={A}>
            policy2_results.md
          </a>
          .
        </p>

        <h2>Chapter 6: attempts through the detector layers</h2>
        <p>
          {t.dp.n} attempts, drawn with the engine&apos;s seeded generator; base
          rate {pc(t.dp.base, 0)}; expected values from the closed form in
          brackets.
        </p>
        <T
          head={[
            "shared blind spot c",
            "attempts",
            "steer the model",
            ...(K.DEPTH.layers as Obj[]).map((l) => `+ ${l.name}`),
          ]}
          rows={(t.depth.runs as Obj[]).map((r) => [
            pc(r.c),
            ...(r.frames as Obj[]).map(
              (f) => `${f.count} (${(f.expected as number).toFixed(2)})`,
            ),
          ])}
        />

        <h2>Chapter 7: plan-then-execute</h2>
        <T
          head={[
            "task",
            "planned: allow / ask / deny",
            "classic agent: allow / ask / deny",
          ]}
          rows={K.DUAL_PLANS.map((p) => {
            const d = t.du[p] as Obj;
            return [d.title, aad(d.planned), aad(d.classic)];
          })}
        />

        <h2>Chapter 8: approval thresholds over the label policy</h2>
        <T
          head={[
            "who must approve",
            "tasks finished",
            "prompts per task",
            "risk per task",
            "unchecked route",
          ]}
          rows={(K.UTILITY.thresholds as string[]).map((th) => {
            const x = t.ap[th] as Obj;
            return [
              th,
              pc(x.utility),
              (x.prompts as number).toFixed(2),
              pc(x.risk, 2),
              pc(x.ungated),
            ];
          })}
        />

        {(["adaptive", "fixed"] as const).map((key) => (
          <div key={key}>
            <h2>
              Chapter 9: the frontier,{" "}
              {key === "adaptive"
                ? "an attacker who adapts to the detectors"
                : "fixed attacks (published rates)"}
            </h2>
            <p>
              {t.fr.n} benign tasks; base rate {pc(t.fr[key].base, 0)}
              {key === "adaptive" ? (
                <>
                  ; every detector layer passed (
                  <a href={ARXIV(PAPERS.adaptive)} className={A}>
                    arXiv {PAPERS.adaptive}
                  </a>
                  )
                </>
              ) : null}
              .
            </p>
            <T
              head={[
                "defence",
                "tasks finished",
                "blocked",
                "prompts / task",
                "extra calls / task",
                "risk / task",
                "on the frontier",
              ]}
              rows={K.DEFENCES.map((d) => {
                const p = t.fr[key][d.id] as Obj;
                return [
                  d.name,
                  pc(p.utility),
                  pc(p.blocked),
                  (p.prompts as number).toFixed(2),
                  (p.extra as number).toFixed(2),
                  pc(p.risk, 2),
                  p.front ? "yes" : "no",
                ];
              })}
            />
          </div>
        ))}

        <h2>Chapter 10: the default design&apos;s checklist</h2>
        <T
          head={["chapter", "check", "verdict", "measured"]}
          rows={((t.checklist.default as Obj).items as Obj[]).map((i) => [
            i.ch,
            i.item,
            i.verdict,
            i.value,
          ])}
        />

        <h2>Published measurements</h2>
        <T
          head={["measurement", "value", "source"]}
          rows={K.PUBLISHED.map((x) => [
            x.what,
            x.text,
            <a key={x.id} href={ARXIV(x.arxiv)} className={A}>
              arXiv {x.arxiv}
            </a>,
          ])}
        />
      </div>
    </main>
  );
}
