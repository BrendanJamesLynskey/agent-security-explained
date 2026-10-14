"use client";

/**
 * Chapter 10: a builder's checklist. Choose a design (one of the frontier's defences, optionally
 * with every write and send approved, and the sandbox layers), and the engine audits it against
 * chapters 1 to 9 on the benign suite, one check per step: each tile fills with its verdict, and the
 * list links back to the chapter. Frames from the engine's policy `checklist`.
 */
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { AnimationPanel } from "@/components/anim/AnimationPanel";
import { useStepper } from "@/components/anim/useStepper";
import { Choice, Stat } from "@/components/ui/Controls";
import { useSvgFont } from "@/components/viz/useSvgFont";
import { P, type Obj } from "@/lib/engine";
import { SECTIONS } from "@/lib/mdx/chapters";
import { MUTED, OKABE_ITO } from "@/lib/viz/palette";

import { EngineStatus } from "../agent/EngineStatus";
import { useEngine } from "./useEngine";

const W = 360;
export const VERDICT_COLOUR: Record<string, string> = {
  pass: OKABE_ITO.green,
  warn: OKABE_ITO.orange,
  fail: OKABE_ITO.vermillion,
};
const MARK: Record<string, string> = { pass: "✓", warn: "!", fail: "✕" };
/** Verdict text: darker shades of the same hues, for contrast on a light or dark background. */
const TEXT: Record<string, string> = {
  pass: "text-emerald-800 dark:text-emerald-300",
  warn: "text-amber-800 dark:text-amber-300",
  fail: "text-red-800 dark:text-red-300",
};
const FILL: Record<string, string> = {
  pass: "fill-emerald-800 dark:fill-emerald-300",
  warn: "fill-amber-800 dark:fill-amber-300",
  fail: "fill-red-800 dark:fill-red-300",
};
const ALL_LAYERS = ["fs_scope", "container", "egress"];

export default function ChecklistWidget({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  const st = useEngine("checklist");
  if (st.status !== "ready")
    return (
      <EngineStatus error={st.status === "error" ? st.error : undefined} />
    );
  return <Checklist data={st.data}>{children}</Checklist>;
}

function Checklist({
  data,
  children,
}: {
  data: Obj;
  children?: ReactNode;
}): JSX.Element {
  const K = P.catalogue;
  const [defence, setDefence] = useState<string>("planned");
  const [approve, setApprove] = useState(false);
  const [layers, setLayers] = useState<string[]>(ALL_LAYERS);
  const [hover, setHover] = useState<string | null>(null);
  const key = `${defence}|${approve}|${layers.join(",")}`;
  const audit = useMemo(() => {
    if (key === `planned|false|${ALL_LAYERS.join(",")}`)
      return data.default as Obj;
    return P.study.checklist({
      defence,
      approval: approve ? "consequential" : null,
      sandbox: layers,
    });
  }, [key, data, defence, approve, layers]);
  const frames = audit.frames as Obj[];
  const s = useStepper(frames.length, { stepMs: 1500, resetKey: key });
  const f = frames[s.step]!;
  const font = useSvgFont(W);
  const fs = font.fs(10);
  const tw = (W - 8) / 3;
  const th = fs * 4.2;
  const H = 3 * th + 8;
  const hl = hover ?? (f.verdict === "pass" ? "pass" : "check");
  const toggle = (id: string) =>
    setLayers((a) =>
      a.includes(id)
        ? a.filter((x) => x !== id)
        : ALL_LAYERS.filter((x) => a.includes(x) || x === id),
    );

  const visual = (
    <div className="min-w-0 space-y-3">
      <svg
        ref={font.ref}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={`Nine checks, one per chapter, each filled with its verdict as it is checked. ${f.caption}`}
        data-testid="tiles"
      >
        {frames.map((g, i) => {
          const x = (i % 3) * (tw + 4);
          const y = Math.floor(i / 3) * (th + 4);
          const done = i <= s.step;
          const c = VERDICT_COLOUR[g.verdict]!;
          return (
            <g
              key={i}
              data-check={g.ch}
              data-verdict={done ? g.verdict : "pending"}
            >
              <rect
                x={x}
                y={y}
                width={tw}
                height={th}
                rx={6}
                fill={done ? c : "none"}
                fillOpacity={done ? 0.18 : 0}
                stroke={done ? c : MUTED.light}
                strokeWidth={i === s.step ? 3 : done ? 2 : 1}
                strokeDasharray={done ? undefined : "4 3"}
              />
              <text
                x={x + tw / 2}
                y={y + fs * 1.5}
                textAnchor="middle"
                style={{ fontSize: fs }}
                className="fill-neutral-700 dark:fill-neutral-300"
              >
                chapter {g.ch}
              </text>
              <text
                x={x + tw / 2}
                y={y + fs * 3.3}
                textAnchor="middle"
                style={{ fontSize: fs * 1.25 }}
                fill={done ? undefined : MUTED.light}
                className={`font-bold ${done ? FILL[g.verdict] : ""}`}
              >
                {done ? `${MARK[g.verdict]} ${g.verdict}` : "·"}
              </text>
            </g>
          );
        })}
      </svg>
      <ol className="space-y-1 text-xs" data-testid="checks">
        {frames.map((g, i) => {
          const sec = SECTIONS[g.ch - 1]!;
          return (
            <li
              key={i}
              data-item={g.ch}
              className={`grid grid-cols-[3.2rem_minmax(0,1fr)] items-baseline gap-2 rounded px-2 py-0.5 ${i === s.step ? "bg-white ring-1 ring-neutral-300 dark:bg-neutral-950 dark:ring-neutral-700" : ""}`}
            >
              <span
                className={`font-mono font-bold ${i <= s.step ? TEXT[g.verdict] : ""}`}
              >
                {i <= s.step ? `${MARK[g.verdict]} ${g.verdict}` : "·"}
              </span>
              <span>
                <Link
                  href={`/learn/${sec.slug}`}
                  className="focus-ring rounded underline underline-offset-2"
                >
                  {g.ch}. {sec.title}
                </Link>
                : {g.item}
                {i <= s.step ? (
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {" "}
                    ({g.value})
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );

  const sm = audit.summary as Obj;
  return (
    <AnimationPanel
      testId="checklist-widget"
      title="Nine checks, one per chapter, measured on a design"
      summary="Choose a design: the engine audits it against chapters 1 to 9 on the benign suite, against an adaptive attacker, one check per step. From the engine's policy module."
      stepper={s}
      stepLabel="check"
      caption={f.caption}
      visual={visual}
      equation={children}
      hl={hl}
      onEquationHover={setHover}
      stats={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Passed so far" value={`${f.passed} of 9`} />
          <Stat
            label="Tasks finished"
            value={`${(sm.utility * 100).toFixed(1)}%`}
          />
          <Stat
            label="Risk per task"
            value={`${(sm.risk * 100).toFixed(2)}%`}
          />
          <Stat label="Prompts per task" value={sm.prompts.toFixed(2)} />
        </div>
      }
      params={
        <div className="grid min-w-0 gap-3">
          <Choice
            label="Design"
            value={defence}
            options={[
              "planned",
              ...K.DEFENCE_ORDER.filter((d) => d !== "planned"),
            ].map((d) => ({
              value: d,
              label: P.utility.defence(d).name as string,
            }))}
            onChange={setDefence}
          />
          <div
            role="group"
            aria-label="Design options"
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              aria-pressed={approve}
              onClick={() => setApprove((a) => !a)}
              className={`focus-ring min-h-11 rounded border px-3 text-sm ${
                approve
                  ? "border-neutral-800 bg-neutral-100 dark:border-neutral-200 dark:bg-neutral-800"
                  : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
              }`}
            >
              Approve every write and send: {approve ? "on" : "off"}
            </button>
            {K.LAYERS.map((l) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={layers.includes(l.id)}
                onClick={() => toggle(l.id)}
                className={`focus-ring min-h-11 rounded border px-3 text-sm ${
                  layers.includes(l.id)
                    ? "border-neutral-800 bg-neutral-100 dark:border-neutral-200 dark:bg-neutral-800"
                    : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
                }`}
              >
                {l.name}: {layers.includes(l.id) ? "on" : "off"}
              </button>
            ))}
          </div>
        </div>
      }
    />
  );
}
