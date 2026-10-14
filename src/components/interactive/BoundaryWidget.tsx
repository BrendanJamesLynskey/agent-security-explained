"use client";

/**
 * Chapter 1, the hero: an agent as four zones (the user, the model, its tools, the outside world)
 * with the policy gate between the model and everything it can act on. Each step moves one value
 * across a boundary, coloured by its label (where it came from, how secret it is); a call stops at
 * the gate if the policy denies it. Frames from the engine's policy `boundaryFrames`.
 */
import { useState, type ReactNode } from "react";

import { AnimationPanel } from "@/components/anim/AnimationPanel";
import { useStepper } from "@/components/anim/useStepper";
import { Hatch } from "@/components/interactive/Hatch";
import {
  DecisionBadge,
  LabelChip,
  LabelKey,
} from "@/components/interactive/LabelChip";
import { Choice, Segmented } from "@/components/ui/Controls";
import { useSvgFont } from "@/components/viz/useSvgFont";
import { P, type Obj } from "@/lib/engine";
import {
  DECISION_COLOUR,
  DECISION_MARK,
  MUTED,
  SOURCE_COLOUR,
} from "@/lib/viz/palette";

import { EngineStatus } from "../agent/EngineStatus";
import { useEngine } from "./useEngine";

const W = 360;
const ZONES = [
  { id: "user", name: "User", x: 2, w: 74 },
  { id: "model", name: "Model", x: 92, w: 84 },
  { id: "tools", name: "Tools", x: 200, w: 70 },
  { id: "outside", name: "Outside", x: 284, w: 74 },
] as const;
const GATE = 188;

export default function BoundaryWidget({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  const st = useEngine("boundary");
  if (st.status !== "ready")
    return (
      <EngineStatus error={st.status === "error" ? st.error : undefined} />
    );
  return <Boundary data={st.data}>{children}</Boundary>;
}

function Boundary({
  data,
  children,
}: {
  data: Obj;
  children?: ReactNode;
}): JSX.Element {
  const K = P.catalogue;
  const [plan, setPlan] = useState<string>("reply_from_notes");
  const [mode, setMode] = useState<"context" | "dataflow">("context");
  const [hover, setHover] = useState<string | null>(null);
  const frames = data.plans[plan][mode] as Obj[];
  const s = useStepper(frames.length, {
    stepMs: 1400,
    resetKey: `${plan}|${mode}`,
    smooth: true,
  });
  const f = frames[s.step]!;
  const font = useSvgFont(W);
  const fs = font.fs(11);
  const H = 112;
  const zoneTop = fs + 8;
  const zoneH = H - zoneTop - 4;
  const cx = (id: string) => {
    const z = ZONES.find((x) => x.id === id)!;
    return z.x + z.w / 2;
  };
  const isCall = f.from === "model" && f.to !== "model";
  const denied = f.decision === "deny" || f.decision === "skip";
  const x0 = cx(f.from);
  const xEnd = denied ? GATE : cx(f.to);
  const p = s.playing ? Math.min(1, s.frac * 1.6) : 1;
  const tx = f.from === f.to ? x0 : x0 + (xEnd - x0) * p;
  const ty = zoneTop + zoneH * 0.62;
  const lab = f.label as Obj | null;
  const colour = lab ? SOURCE_COLOUR[lab.src]! : MUTED.light;
  const priv = lab?.sens === "private";
  const hl = hover ?? (isCall ? "ctl" : f.to === "model" ? "out" : "args");
  // one row per call: its first frame (the call; a result frame follows it)
  const rows: Obj[] = [];
  const seen = new Set<number>();
  for (const g of frames.slice(0, s.step + 1)) {
    if (g.from === "user" || seen.has(g.step)) continue;
    seen.add(g.step);
    rows.push(g);
  }
  const visual = (
    <div className="min-w-0 space-y-3">
      <svg
        ref={font.ref}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={`The user, the model, its tools and the outside world; the policy gate between the model and its tools. Step ${s.step + 1}: ${f.caption}`}
        data-testid="zones"
      >
        <defs>
          <Hatch id="bd-tok" colour={colour} />
          <Hatch id="bd-deny" colour={DECISION_COLOUR.deny} />
        </defs>
        {ZONES.map((z) => (
          <g key={z.id} data-zone={z.id}>
            <rect
              x={z.x}
              y={zoneTop}
              width={z.w}
              height={zoneH}
              rx={6}
              fill="none"
              stroke={MUTED.light}
              strokeWidth={f.from === z.id || f.to === z.id ? 2 : 1}
            />
            <text
              x={z.x + z.w / 2}
              y={fs}
              textAnchor="middle"
              style={{ fontSize: fs }}
              className="fill-neutral-700 dark:fill-neutral-300"
            >
              {z.name}
            </text>
          </g>
        ))}
        <line
          x1={GATE}
          x2={GATE}
          y1={zoneTop - 2}
          y2={H - 2}
          stroke={DECISION_COLOUR[f.decision]}
          strokeWidth={isCall ? 3 : 1.5}
          strokeDasharray={isCall ? undefined : "3 3"}
          data-gate={isCall ? f.decision : "idle"}
        />
        <text
          x={GATE}
          y={fs}
          textAnchor="middle"
          style={{ fontSize: fs }}
          className="fill-neutral-600 dark:fill-neutral-400"
        >
          policy
        </text>
        {f.from !== f.to && (
          <line
            x1={x0}
            x2={xEnd}
            y1={ty}
            y2={ty}
            stroke={colour}
            strokeWidth={priv ? 3.5 : 1.8}
            strokeDasharray={f.decision === "skip" ? "2 3" : undefined}
            opacity={0.5}
          />
        )}
        <circle
          cx={tx}
          cy={ty}
          r={9}
          fill={priv ? "url(#bd-tok)" : colour}
          stroke={priv ? "#262626" : "none"}
          strokeWidth={priv ? 2 : 0}
          className={priv ? "dark:stroke-neutral-200" : undefined}
          data-token={lab ? `${lab.src}/${lab.sens}` : "none"}
        />
        {isCall && p >= 1 && (
          <g data-mark={f.decision}>
            <circle
              cx={GATE}
              cy={ty - 30}
              r={10}
              fill={f.decision === "deny" ? "url(#bd-deny)" : undefined}
              className={
                f.decision === "deny"
                  ? undefined
                  : "fill-white dark:fill-neutral-950"
              }
              stroke={DECISION_COLOUR[f.decision]}
              strokeWidth={2}
            />
            <text
              x={GATE}
              y={ty - 30 + fs * 0.36}
              textAnchor="middle"
              style={{ fontSize: fs }}
              fill={DECISION_COLOUR[f.decision]}
              className="font-semibold"
            >
              {DECISION_MARK[f.decision]}
            </text>
          </g>
        )}
        {f.value && (
          <text
            x={f.from === f.to ? x0 : (x0 + xEnd) / 2}
            y={ty + 24}
            textAnchor="middle"
            style={{ fontSize: fs }}
            className="fill-neutral-800 font-mono dark:fill-neutral-200"
          >
            {f.from === f.to ? `${f.value} (joined)` : f.value}
          </text>
        )}
      </svg>
      <LabelKey />
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
        <span className="font-medium">The model holds:</span>
        {Object.entries(f.values as Obj).map(([k, l]) => (
          <LabelChip key={k} name={k} label={l as Obj} />
        ))}
        <span className="font-medium">context:</span>
        <LabelChip label={f.ctx} />
      </div>
      <ol className="space-y-1 text-xs" data-testid="call-log">
        {rows.map((g, i) => {
          const call = K.TOOLS[(K.PLANS[plan]!.steps as Obj[])[g.step]!.tool]!;
          const tool = (K.PLANS[plan]!.steps as Obj[])[g.step]!.tool as string;
          return (
            <li
              key={i}
              className={`flex flex-wrap items-center gap-2 rounded px-2 py-1 ${g.step === f.step ? "bg-white ring-1 ring-neutral-300 dark:bg-neutral-950 dark:ring-neutral-700" : ""}`}
            >
              <span className="font-mono text-neutral-600 dark:text-neutral-400">
                {g.step + 1}
              </span>
              <span className="font-mono">{tool}</span>
              <span className="text-neutral-600 dark:text-neutral-400">
                ({call.kind}
                {call.egress ? ", carries data out" : ""})
              </span>
              <LabelChip label={g.label} />
              <DecisionBadge d={g.decision} />
            </li>
          );
        })}
      </ol>
    </div>
  );

  return (
    <AnimationPanel
      testId="boundary-widget"
      title="Values cross boundaries, and every one carries its label"
      summary="One task, step by step: the request, each call and its result, labelled by source and sensitivity, and the policy's decision where a call leaves the model. From the engine's policy module."
      stepper={s}
      stepLabel="frame"
      caption={f.caption}
      visual={visual}
      equation={children}
      hl={hl}
      onEquationHover={setHover}
      params={
        <>
          <Choice
            label="Task"
            value={plan}
            // the default task first: every other choice re-runs the animation
            options={[
              "reply_from_notes",
              ...K.PLAN_ORDER.filter((p) => p !== "reply_from_notes"),
            ].map((p) => ({
              value: p,
              label: K.PLANS[p]!.title as string,
            }))}
            onChange={setPlan}
          />
          <Segmented
            label="Agent"
            value={mode}
            options={[
              { value: "context", label: "Classic" },
              { value: "dataflow", label: "Planned" },
            ]}
            onChange={(v) => setMode(v as "context" | "dataflow")}
          />
        </>
      }
    />
  );
}
