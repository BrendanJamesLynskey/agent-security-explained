"use client";

/**
 * Chapter 9: the security–utility frontier. Each defence is one point: the share of the benign
 * suite it lets finish (across) against the chance a steered attempt succeeds in a task (up, on a log
 * scale). Points arrive one per step; filled points are on the frontier (no other defence is at least
 * as good on tasks finished, risk and prompts, and better on one). Switch between fixed attacks (the
 * published rates) and an attacker who adapts to the detectors. Frames from the engine's policy
 * `frontierStudy`.
 */
import { useState, type ReactNode } from "react";

import { AnimationPanel } from "@/components/anim/AnimationPanel";
import { useStepper } from "@/components/anim/useStepper";
import { Segmented, Stat } from "@/components/ui/Controls";
import { useSvgFont } from "@/components/viz/useSvgFont";
import { type Obj } from "@/lib/engine";
import { pct } from "@/lib/format";
import { MUTED, OKABE_ITO } from "@/lib/viz/palette";

import { EngineStatus } from "../agent/EngineStatus";
import { useEngine } from "./useEngine";

const W = 360;
/** The colour of each kind of defence: detectors, humans, the policy, the structural design. */
const KIND: Record<string, string> = {
  none: "#737373",
  marking: OKABE_ITO.orange,
  detectors: OKABE_ITO.orange,
  approve_all: OKABE_ITO.purple,
  policy: OKABE_ITO.blue,
  policy_refuse: OKABE_ITO.blue,
  least: OKABE_ITO.green,
  planned: OKABE_ITO.green,
};
const LO = 1e-3;
const HI = 1;

export default function FrontierWidget({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  const st = useEngine("frontier");
  if (st.status !== "ready")
    return (
      <EngineStatus error={st.status === "error" ? st.error : undefined} />
    );
  return <Frontier data={st.data}>{children}</Frontier>;
}

function Frontier({
  data,
  children,
}: {
  data: Obj;
  children?: ReactNode;
}): JSX.Element {
  const [key, setKey] = useState<"adaptive" | "fixed">("adaptive");
  const [hover, setHover] = useState<string | null>(null);
  const fr = data[key] as Obj;
  const points = fr.points as Obj[];
  const frames = fr.frames as Obj[];
  const s = useStepper(frames.length, { stepMs: 1700, resetKey: key });
  const f = frames[s.step]!;
  const font = useSvgFont(W);
  const fs = font.fs(10);
  const left = fs * 3.6;
  const top = fs * 0.8;
  const pw = W - left - fs * 1.4;
  const ph = font.narrow ? 250 : 190;
  const H = top + ph + fs * 3.4;
  const umin = 0.4;
  const X = (u: number) => left + ((u - umin) / (1 - umin)) * pw;
  const Y = (r: number) =>
    top +
    ph -
    ((Math.log10(Math.max(r, LO)) - Math.log10(LO)) /
      (Math.log10(HI) - Math.log10(LO))) *
      ph;
  const front = fr.front as string[];
  const shown = points.slice(0, s.step + 1);
  const cur = points[s.step]!;
  // coincident points share one label, "1, 2", drawn at the first of them
  const same = (a: Obj, b: Obj) => a.utility === b.utility && a.risk === b.risk;
  const labelOf = (i: number): string | null => {
    if (shown.slice(0, i).some((q) => same(q, shown[i]!))) return null;
    return shown
      .map((q, k) => (same(q, shown[i]!) ? String(k + 1) : null))
      .filter(Boolean)
      .join(", ");
  };
  const hl =
    hover ??
    (["marking", "detectors"].includes(cur.id)
      ? "det"
      : cur.id === "none"
        ? "base"
        : "route");

  const visual = (
    <div className="min-w-0 space-y-3">
      <svg
        ref={font.ref}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-w-xl"
        role="img"
        aria-label={`Each defence's share of benign tasks finished against its risk per task, log scale. ${f.caption}`}
        data-testid="frontier"
      >
        {[1e-3, 1e-2, 1e-1, 1].map((r) => (
          <g key={r}>
            <line
              x1={left}
              x2={left + pw}
              y1={Y(r)}
              y2={Y(r)}
              stroke={MUTED.light}
              strokeOpacity={0.5}
            />
            <text
              x={left - 4}
              y={Y(r) + fs / 3}
              textAnchor="end"
              style={{ fontSize: fs }}
              className="fill-neutral-600 dark:fill-neutral-400"
            >
              {r >= 0.01 ? pct(r) : pct(r, 1)}
            </text>
          </g>
        ))}
        {[0.4, 0.6, 0.8, 1].map((u) => (
          <text
            key={u}
            x={X(u)}
            y={top + ph + fs * 1.3}
            textAnchor={u === 1 ? "end" : "middle"}
            style={{ fontSize: fs }}
            className="fill-neutral-600 dark:fill-neutral-400"
          >
            {pct(u)}
          </text>
        ))}
        <text
          x={left + pw / 2}
          y={top + ph + fs * 2.7}
          textAnchor="middle"
          style={{ fontSize: fs }}
          className="fill-neutral-700 dark:fill-neutral-300"
        >
          benign tasks finished →
        </text>
        <line x1={left} x2={left} y1={top} y2={top + ph} stroke={MUTED.light} />
        {shown.map((p, i) => {
          const on = front.includes(p.id);
          const now = i === s.step;
          const x = X(p.utility);
          const label = labelOf(i);
          // labels sit to the right of a point, or above it near the right edge
          const above = p.utility > 0.9;
          const y = Y(p.risk);
          return (
            <g key={p.id} data-point={p.id} data-front={on ? "true" : "false"}>
              <circle
                cx={x}
                cy={y}
                r={fs * (now ? 0.85 : 0.65)}
                fill={on ? KIND[p.id] : "none"}
                stroke={KIND[p.id]}
                strokeWidth={now ? 3 : 2}
              />
              {label && (
                <text
                  x={above ? x : x + fs * 1.1}
                  y={above ? y - fs * 1.05 : y + fs / 3}
                  textAnchor={above ? "middle" : "start"}
                  style={{ fontSize: fs }}
                  className="fill-neutral-900 font-mono dark:fill-neutral-100"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <ol className="space-y-1 text-xs" data-testid="defences">
        {points.map((p, i) => (
          <li
            key={p.id}
            data-defence={p.id}
            className={`grid grid-cols-[1.5rem_minmax(0,1fr)_3.5rem_3.5rem] items-baseline gap-1 rounded px-2 py-0.5 ${i === s.step ? "bg-white ring-1 ring-neutral-300 dark:bg-neutral-950 dark:ring-neutral-700" : ""}`}
          >
            <span className="font-mono">{i + 1}</span>
            <span>
              <span
                aria-hidden="true"
                className="mr-1 inline-block size-2.5 rounded-full"
                style={{ background: KIND[p.id] }}
              />
              {p.name}
              {i <= s.step && front.includes(p.id) ? " (frontier)" : ""}
            </span>
            <span className="text-right font-mono">
              {i <= s.step ? pct(p.utility) : "·"}
            </span>
            <span className="text-right font-mono">
              {i <= s.step ? pct(p.risk, 1) : ""}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-neutral-600 dark:text-neutral-400">
        Columns: tasks finished, risk per task. Filled: on the frontier. Colour:
        grey none, orange detectors, purple a human, blue the label policy,
        green least privilege and planning.
      </p>
    </div>
  );

  return (
    <AnimationPanel
      testId="frontier-widget"
      title="What each defence costs against what it leaves"
      summary="Every defence on the same benign suite: tasks finished against the risk a steered attempt succeeds, one defence per step. Switch the attacker. From the engine's policy module."
      stepper={s}
      stepLabel="defence"
      caption={f.caption}
      visual={visual}
      equation={children}
      hl={hl}
      onEquationHover={setHover}
      stats={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Finished" value={pct(cur.utility, 1)} />
          <Stat label="Risk per task" value={pct(cur.risk, 2)} />
          <Stat label="Prompts per task" value={cur.prompts.toFixed(2)} />
          <Stat label="Extra calls per task" value={cur.extra.toFixed(2)} />
        </div>
      }
      params={
        <Segmented
          label="Attacker"
          value={key}
          options={[
            { value: "adaptive", label: "adapts to detectors" },
            { value: "fixed", label: "fixed (published rates)" },
          ]}
          onChange={setKey}
        />
      }
    />
  );
}
