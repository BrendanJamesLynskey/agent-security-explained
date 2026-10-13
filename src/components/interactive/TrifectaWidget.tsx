"use client";

/**
 * Chapter 3: the lethal trifecta as a live Venn. Each step is one combination of the three
 * circles (private data, untrusted input, an outbound channel) the agent holds, then two agents
 * whose single tools each fill two circles. Where all three overlap, the engine's exhaustive search
 * finds a flow out and the policy denies it; remove any circle and the search finds none. Frames
 * from the engine's policy `trifectaStudy`.
 */
import { useState, type ReactNode } from "react";

import { AnimationPanel } from "@/components/anim/AnimationPanel";
import { useStepper } from "@/components/anim/useStepper";
import { Hatch } from "@/components/interactive/Hatch";
import { DecisionBadge } from "@/components/interactive/LabelChip";
import { Stat } from "@/components/ui/Controls";
import { useSvgFont } from "@/components/viz/useSvgFont";
import type { Obj } from "@/lib/engine";
import { CIRCLE_COLOUR, DECISION_COLOUR, MUTED } from "@/lib/viz/palette";

import { EngineStatus } from "../agent/EngineStatus";
import { useEngine } from "./useEngine";

const W = 360;
const H = 250;
const R = 66;
const CENTRES: Record<string, [number, number]> = {
  private: [138, 92],
  untrusted: [222, 92],
  outbound: [180, 160],
};
const KEYS = ["private", "untrusted", "outbound"] as const;

export default function TrifectaWidget({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  const st = useEngine("trifecta");
  if (st.status !== "ready")
    return (
      <EngineStatus error={st.status === "error" ? st.error : undefined} />
    );
  return <Trifecta data={st.data}>{children}</Trifecta>;
}

function Trifecta({
  data,
  children,
}: {
  data: Obj;
  children?: ReactNode;
}): JSX.Element {
  const cases = [...(data.circles as Obj[]), ...(data.double as Obj[])];
  const [hover, setHover] = useState<string | null>(null);
  const s = useStepper(cases.length, { stepMs: 1800 });
  const c = cases[s.step]!;
  const tri = c.trifecta as Obj;
  const held = (k: string) => (tri[k] as string[]).length > 0;
  const font = useSvgFont(W);
  const fs = font.fs(11);
  const exposed = c.exposure.exposed as boolean;
  const last = exposed
    ? (c.steps as Obj[])[(c.steps as Obj[]).length - 1]!
    : null;
  const hl = hover ?? (exposed ? "all" : (KEYS.find((k) => !held(k)) ?? "all"));
  const toggle = (k: (typeof KEYS)[number]) => {
    const mask = s.step < 8 ? (c.mask as number) : 7;
    const next = mask ^ (1 << KEYS.indexOf(k));
    s.setStep(next);
  };
  const LABEL: Record<string, string> = {
    private: "Private data",
    untrusted: "Untrusted input",
    outbound: "Outbound channel",
  };
  const pos: Record<string, [number, number, "start" | "end" | "middle"]> = {
    private: [10, 26, "start"],
    untrusted: [W - 10, 26, "end"],
    outbound: [W / 2, H - 6, "middle"],
  };

  const visual = (
    <div className="min-w-0 space-y-3">
      <svg
        ref={font.ref}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={`Three circles: private data, untrusted input, an outbound channel. ${c.caption}`}
        data-testid="venn"
      >
        <defs>
          <Hatch id="tf-centre" colour={DECISION_COLOUR.deny} />
        </defs>
        {KEYS.map((k) => {
          const [x, y] = CENTRES[k]!;
          const on = held(k);
          return (
            <g key={k} data-circle={k} data-held={on ? "true" : "false"}>
              <circle
                cx={x}
                cy={y}
                r={R}
                fill={on ? CIRCLE_COLOUR[k] : "none"}
                fillOpacity={on ? 0.28 : 0}
                stroke={on ? CIRCLE_COLOUR[k] : MUTED.light}
                strokeWidth={on ? 2.2 : 1.2}
                strokeDasharray={on ? undefined : "4 4"}
              />
              <text
                x={pos[k]![0]}
                y={pos[k]![1]}
                textAnchor={pos[k]![2]}
                style={{ fontSize: fs }}
                className="fill-neutral-800 dark:fill-neutral-200"
              >
                {LABEL[k]}
                {on ? "" : " (none)"}
              </text>
            </g>
          );
        })}
        {exposed && (
          <g data-testid="flow-out">
            <circle
              cx={180}
              cy={116}
              r={17}
              fill="url(#tf-centre)"
              stroke={DECISION_COLOUR.deny}
              strokeWidth={2}
            />
            <text
              x={180}
              y={116 + fs * 0.36}
              textAnchor="middle"
              style={{ fontSize: fs }}
              fill={DECISION_COLOUR.deny}
              className="font-bold"
            >
              ✕
            </text>
          </g>
        )}
      </svg>
      <div
        role="group"
        aria-label="Circles the agent holds"
        className="flex flex-wrap gap-2"
      >
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={held(k)}
            onClick={() => toggle(k)}
            className={`focus-ring min-h-11 rounded border px-3 text-sm ${
              held(k)
                ? "border-neutral-800 bg-neutral-100 dark:border-neutral-200 dark:bg-neutral-800"
                : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
            }`}
          >
            {held(k) ? "Remove" : "Add"} {LABEL[k]!.toLowerCase()}
          </button>
        ))}
      </div>
      <dl className="grid gap-1 text-xs text-neutral-700 dark:text-neutral-300">
        {KEYS.map((k) => (
          <div key={k} className="flex flex-wrap gap-1">
            <dt className="font-medium">{LABEL[k]}:</dt>
            <dd className="font-mono">
              {held(k) ? (tri[k] as string[]).join(", ") : "none"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );

  return (
    <AnimationPanel
      testId="trifecta-widget"
      title="Hold all three and a way out exists; remove any one and it is gone"
      summary="Every combination of the three circles, then two agents whose one tool fills two circles: an exhaustive search for a flow of private data out under untrusted control, and the policy's decision on it. From the engine's policy module."
      stepper={s}
      stepLabel="case"
      caption={c.caption}
      visual={visual}
      equation={children}
      hl={hl}
      onEquationHover={setHover}
      stats={
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Trifecta" value={tri.all ? "yes" : "no"} />
          <Stat
            label="Flow out"
            value={
              exposed ? `${(c.exposure.path as string[]).join(" → ")}` : "none"
            }
            hint={`${c.exposure.checked} sequences checked`}
          />
          <div className="min-w-0 rounded bg-white p-2 ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800">
            <div className="text-[0.7rem] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Policy
            </div>
            <div className="mt-1">
              {last ? <DecisionBadge d={last.decision} /> : "nothing to stop"}
            </div>
          </div>
        </div>
      }
    />
  );
}
