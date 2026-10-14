"use client";

/**
 * Chapter 7: plan-then-execute, step by step. The planner (a privileged model) reads only the
 * request and writes the whole plan; an interpreter runs it, keeping each value in a variable with
 * its label; reads run as tools, rewriting untrusted values happens in a quarantined model that has
 * no tools, and the policy checks every call on the labels. The planner only ever sees variable
 * names. Beside each step, the decision a classic agent gets for the same call. Frames from the
 * engine's policy `dualFrames`.
 */
import { useState, type ReactNode } from "react";

import { AnimationPanel } from "@/components/anim/AnimationPanel";
import { useStepper } from "@/components/anim/useStepper";
import { DecisionBadge, LabelChip } from "@/components/interactive/LabelChip";
import { Choice, Stat } from "@/components/ui/Controls";
import { useSvgFont } from "@/components/viz/useSvgFont";
import { P, type Obj } from "@/lib/engine";
import {
  DECISION_COLOUR,
  DECISION_MARK,
  MUTED,
  OKABE_ITO,
} from "@/lib/viz/palette";

import { EngineStatus } from "../agent/EngineStatus";
import { useEngine } from "./useEngine";

const W = 360;
const H = 232;
type Box = { x: number; y: number; w: number; h: number };
const BOX: Record<string, Box> = {
  planner: { x: 4, y: 6, w: 168, h: 58 },
  quarantined: { x: 188, y: 6, w: 168, h: 58 },
  interp: { x: 70, y: 96, w: 220, h: 46 },
  tool: { x: 70, y: 176, w: 220, h: 46 },
};
const NAME: Record<string, string> = {
  planner: "Planner",
  quarantined: "Quarantined model",
  interp: "Interpreter + policy",
  tool: "Tools",
};
const SUB: Record<string, string> = {
  planner: "reads the request only",
  quarantined: "no tools",
  interp: "holds values and labels",
  tool: "reads, writes, sends",
};

const mid = (b: Box): [number, number] => [b.x + b.w / 2, b.y + b.h / 2];

export default function DualWidget({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  const st = useEngine("dual");
  if (st.status !== "ready")
    return (
      <EngineStatus error={st.status === "error" ? st.error : undefined} />
    );
  return <Dual data={st.data}>{children}</Dual>;
}

function Dual({
  data,
  children,
}: {
  data: Obj;
  children?: ReactNode;
}): JSX.Element {
  const K = P.catalogue;
  const [plan, setPlan] = useState<string>("notes_then_page");
  const [hover, setHover] = useState<string | null>(null);
  const run = data.plans[plan] as Obj;
  const frames = run.frames as Obj[];
  const s = useStepper(frames.length, { stepMs: 1800, resetKey: plan });
  const f = frames[s.step]!;
  const font = useSvgFont(W);
  const fs = font.fs(10);
  const x = f.flow as Obj;
  const actor = f.actor as string;
  const hl =
    hover ?? ("ctrl" in x ? "ctrl" : x.op === "input" ? "plan" : "args");
  // the values the interpreter holds after this step, with their labels
  const vars: [string, Obj][] = [];
  for (const g of frames.slice(0, s.step + 1)) {
    const r = g.flow as Obj;
    if (r.out && r.out_label) vars.push([r.out, r.out_label]);
  }
  const arrow = (a: Box, b: Box, on: boolean, key: string) => {
    const [x1, y1] = mid(a);
    const [x2, y2] = mid(b);
    // from edge to edge, vertically or sideways
    const vy = Math.abs(y2 - y1) > Math.abs(x2 - x1);
    const p1: [number, number] = vy
      ? [x1, y1 + (Math.sign(y2 - y1) * a.h) / 2]
      : [x1 + (Math.sign(x2 - x1) * a.w) / 2, y1];
    const p2: [number, number] = vy
      ? [x2, y2 - (Math.sign(y2 - y1) * b.h) / 2]
      : [x2 - (Math.sign(x2 - x1) * b.w) / 2, y2];
    return (
      <line
        key={key}
        x1={p1[0]}
        y1={p1[1]}
        x2={p2[0]}
        y2={p2[1]}
        stroke={on ? OKABE_ITO.blue : MUTED.light}
        strokeWidth={on ? 2.6 : 1.2}
        markerEnd={on ? "url(#du-arrow)" : undefined}
        data-active={on ? "true" : "false"}
      />
    );
  };
  const box = (k: string) => {
    const b = BOX[k]!;
    const on =
      k === actor || (k === "interp" && x.op === "call" && actor !== "planner");
    return (
      <g key={k} data-box={k} data-active={on ? "true" : "false"}>
        <rect
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx={6}
          className={
            on
              ? "fill-white dark:fill-neutral-950"
              : "fill-neutral-50 dark:fill-neutral-900"
          }
          stroke={on ? OKABE_ITO.blue : MUTED.light}
          strokeWidth={on ? 2.4 : 1}
        />
        <text
          x={b.x + b.w / 2}
          y={b.y + b.h / 2 - fs * 0.15}
          textAnchor="middle"
          style={{ fontSize: fs }}
          className="fill-neutral-900 font-medium dark:fill-neutral-100"
        >
          {NAME[k]}
        </text>
        <text
          x={b.x + b.w / 2}
          y={b.y + b.h / 2 + fs * 1.1}
          textAnchor="middle"
          style={{ fontSize: fs }}
          className="fill-neutral-600 dark:fill-neutral-400"
        >
          {k === "tool" && x.op === "call" && actor === "tool"
            ? x.tool
            : SUB[k]}
        </text>
      </g>
    );
  };
  const gate = mid(BOX.interp!);
  const visual = (
    <div className="min-w-0 space-y-3">
      <svg
        ref={font.ref}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={`Plan-then-execute: the planner, the interpreter and its policy, the quarantined model and the tools. ${f.caption}`}
        data-testid="dual"
      >
        <defs>
          <marker
            id="du-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={OKABE_ITO.blue} />
          </marker>
        </defs>
        {arrow(BOX.planner!, BOX.interp!, actor === "planner", "p")}
        {arrow(BOX.interp!, BOX.quarantined!, actor === "quarantined", "q")}
        {arrow(BOX.interp!, BOX.tool!, actor === "tool", "t")}
        {["planner", "quarantined", "interp", "tool"].map(box)}
        {x.op === "call" && (
          <g data-gate={x.decision}>
            <circle
              cx={BOX.interp!.x + BOX.interp!.w - 4}
              cy={gate[1] - BOX.interp!.h / 2 + 4}
              r={fs * 0.95}
              className="fill-white dark:fill-neutral-950"
              stroke={DECISION_COLOUR[x.decision]}
              strokeWidth={2}
            />
            <text
              x={BOX.interp!.x + BOX.interp!.w - 4}
              y={gate[1] - BOX.interp!.h / 2 + 4 + fs * 0.36}
              textAnchor="middle"
              style={{ fontSize: fs }}
              fill={DECISION_COLOUR[x.decision]}
              className="font-bold"
            >
              {DECISION_MARK[x.decision]}
            </text>
          </g>
        )}
      </svg>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <div
          className="min-w-0 rounded bg-white p-2 text-xs ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800"
          data-testid="planner-sees"
        >
          <p className="font-medium text-neutral-800 dark:text-neutral-200">
            The planner sees
          </p>
          <p className="mt-1 font-mono">
            {(f.planner_sees as string[]).join(", ")}
          </p>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            names only, never what a tool returned
          </p>
        </div>
        <div
          className="min-w-0 rounded bg-white p-2 text-xs ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800"
          data-testid="variables"
        >
          <p className="font-medium text-neutral-800 dark:text-neutral-200">
            The interpreter holds
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {vars.map(([n, l]) => (
              <LabelChip key={n} name={n} label={l} />
            ))}
          </div>
        </div>
      </div>
      {x.op === "call" && (
        <div
          className="flex min-w-0 flex-wrap items-center gap-2 text-xs"
          data-testid="decisions"
        >
          <span className="font-mono">{x.tool}</span>
          <span className="text-neutral-600 dark:text-neutral-400">
            planned:
          </span>
          <DecisionBadge d={x.decision} />
          <span className="text-neutral-600 dark:text-neutral-400">
            classic agent:
          </span>
          <DecisionBadge d={(f.classic as Obj).decision} />
        </div>
      )}
    </div>
  );

  const sum = run.summary as Obj;
  const aad = (a: Obj) => `${a.allow} / ${a.ask} / ${a.deny}`;
  return (
    <AnimationPanel
      testId="dual-widget"
      title="The planner never reads untrusted data; the policy checks every call"
      summary="A task run as plan-then-execute: who handles each step, what the planner sees, the labels the interpreter holds and the policy's decision, beside a classic agent's. From the engine's policy module."
      stepper={s}
      stepLabel="step"
      caption={f.caption}
      visual={visual}
      equation={children}
      hl={hl}
      onEquationHover={setHover}
      stats={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat label="Planned: allow / ask / deny" value={aad(sum.dataflow)} />
          <Stat label="Classic: allow / ask / deny" value={aad(sum.context)} />
          <Stat label="Extra model calls" value={String(run.extra_calls)} />
        </div>
      }
      params={
        <Choice
          label="Task"
          value={plan}
          options={[
            "notes_then_page",
            ...K.DUAL_PLANS.filter((p) => p !== "notes_then_page"),
          ].map((p) => ({
            value: p,
            label: P.study.dualPlan(p).title as string,
          }))}
          onChange={setPlan}
        />
      }
    />
  );
}
