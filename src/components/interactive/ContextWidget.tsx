"use client";

/**
 * Chapter 2: the same task run two ways, side by side. In a classic agent the model reads every
 * result before choosing the next call, so each call is controlled by everything in its context;
 * planned in advance, the calls are fixed from the request and labels flow only along arguments.
 * Each box is one call, filled with its control label, marked with the policy's decision. Frames
 * from the engine's policy `contextFrames`.
 */
import { useState, type ReactNode } from "react";

import { AnimationPanel } from "@/components/anim/AnimationPanel";
import { useStepper } from "@/components/anim/useStepper";
import { Hatch } from "@/components/interactive/Hatch";
import { DecisionBadge, LabelChip } from "@/components/interactive/LabelChip";
import { Choice, Stat } from "@/components/ui/Controls";
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
const LANES = [
  { key: "context", name: "Classic agent" },
  { key: "dataflow", name: "Planned in advance" },
] as const;

export default function ContextWidget({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  const st = useEngine("context");
  if (st.status !== "ready")
    return (
      <EngineStatus error={st.status === "error" ? st.error : undefined} />
    );
  return <Context data={st.data}>{children}</Context>;
}

function Context({
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
  const s = useStepper(frames.length, { stepMs: 1500, resetKey: plan });
  const f = frames[s.step]!;
  const font = useSvgFont(W);
  const fs = font.fs(11);
  const calls = frames.slice(1);
  const n = calls.length;
  const nameW = fs * 7.5;
  const boxW = (W - nameW - 4) / n;
  const laneH = 46;
  const top = fs + 6;
  const H = top + LANES.length * (laneH + 8) + 2;
  const hl = hover ?? (f.step === 0 ? "req" : "ctx");

  const visual = (
    <div className="min-w-0 space-y-3">
      <svg
        ref={font.ref}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={`Each call's control label and decision, in a classic agent and planned in advance. ${f.caption}`}
        data-testid="lanes"
      >
        <defs>
          {Object.entries(SOURCE_COLOUR).map(([k, c]) => (
            <Hatch key={k} id={`cx-${k}`} colour={c} />
          ))}
        </defs>
        {calls.map((c, i) => (
          <text
            key={i}
            x={nameW + i * boxW + boxW / 2}
            y={fs}
            textAnchor="middle"
            style={{ fontSize: fs }}
            className="fill-neutral-600 font-mono dark:fill-neutral-400"
          >
            {i + 2}
          </text>
        ))}
        {LANES.map((lane, li) => {
          const y = top + li * (laneH + 8);
          return (
            <g key={lane.key} data-lane={lane.key}>
              <text
                x={0}
                y={y + laneH / 2 + fs / 3}
                style={{ fontSize: fs }}
                className="fill-neutral-700 dark:fill-neutral-300"
              >
                {lane.key === "context" ? "Classic" : "Planned"}
              </text>
              {calls.map((c, i) => {
                const r = c[lane.key] as Obj;
                const shown = c.step <= f.step;
                const ctl = r.control as Obj;
                const x = nameW + i * boxW + 2;
                const cur = c.step === f.step;
                return (
                  <g
                    key={i}
                    data-call={r.tool}
                    data-shown={shown ? "true" : "false"}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={boxW - 4}
                      height={laneH}
                      rx={4}
                      fill={
                        !shown
                          ? "none"
                          : ctl.sens === "private"
                            ? `url(#cx-${ctl.src})`
                            : SOURCE_COLOUR[ctl.src]
                      }
                      opacity={shown && ctl.sens !== "private" ? 0.55 : 1}
                      stroke={cur ? "#262626" : MUTED.light}
                      strokeWidth={cur ? 2.4 : ctl.sens === "private" ? 2 : 1}
                      strokeDasharray={shown ? undefined : "3 3"}
                      className={cur ? "dark:stroke-neutral-100" : undefined}
                    />
                    {shown && (
                      <text
                        x={x + (boxW - 4) / 2}
                        y={y + laneH / 2 + fs / 2.8}
                        textAnchor="middle"
                        style={{ fontSize: fs * 1.2 }}
                        fill={DECISION_COLOUR[r.decision]}
                        className="font-bold"
                        data-decision={r.decision}
                      >
                        {DECISION_MARK[r.decision]}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-neutral-600 dark:text-neutral-400">
        Each box is one call (numbered by step), filled with the label of what
        controls it; ✓ allowed, ? sent for approval, ✕ denied.
      </p>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        {LANES.map((lane) => {
          const r = f[lane.key] as Obj;
          return (
            <div
              key={lane.key}
              className="min-w-0 rounded bg-white p-2 text-xs ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800"
              data-testid={`lane-${lane.key}`}
            >
              <p className="font-medium text-neutral-800 dark:text-neutral-200">
                {lane.name}
              </p>
              {r.op === "input" ? (
                <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                  The request: <LabelChip label={r.out_label} />
                </p>
              ) : (
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span className="font-mono">{r.tool}</span>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    control
                  </span>
                  <LabelChip label={r.control} />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    carries
                  </span>
                  <LabelChip label={r.effective} />
                  <DecisionBadge d={r.decision} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const sum = run.summary as Obj;
  return (
    <AnimationPanel
      testId="context-widget"
      title="After one untrusted read, a classic agent's every choice is untrusted"
      summary="The same task run as a classic agent and as a plan fixed in advance: each call's control label and the policy's decision. From the engine's policy module."
      stepper={s}
      stepLabel="step"
      caption={f.caption}
      visual={visual}
      equation={children}
      hl={hl}
      onEquationHover={setHover}
      stats={
        <div className="grid grid-cols-2 gap-2">
          <Stat
            label="Classic: allow / ask / deny"
            value={`${sum.context.allow} / ${sum.context.ask} / ${sum.context.deny}`}
          />
          <Stat
            label="Planned: allow / ask / deny"
            value={`${sum.dataflow.allow} / ${sum.dataflow.ask} / ${sum.dataflow.deny}`}
          />
        </div>
      }
      params={
        <Choice
          label="Task"
          value={plan}
          // the default task first: every other choice re-runs the animation
          options={[
            "notes_then_page",
            ...K.PLAN_ORDER.filter((p) => p !== "notes_then_page"),
          ].map((p) => ({
            value: p,
            label: K.PLANS[p]!.title as string,
          }))}
          onChange={setPlan}
        />
      }
    />
  );
}
