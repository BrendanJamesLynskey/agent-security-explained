"use client";

/**
 * Chapter 8: approval thresholds over the benign suite. Each step is one task run by a classic agent
 * under the label policy: its calls in order, each marked with the policy's decision, marked "human" where
 * a human is asked. Below, the approval-fatigue curve: the more prompts a task makes, the likelier a
 * mistaken approval, and the task's prompt count is marked on it. Choose who is asked: nobody (the
 * policy's asks are refused), the policy's asks, every write and send, or every call. Frames from the
 * engine's policy `approvalFrames`.
 */
import { useState, type ReactNode } from "react";

import { AnimationPanel } from "@/components/anim/AnimationPanel";
import { useStepper } from "@/components/anim/useStepper";
import { Choice, Stat } from "@/components/ui/Controls";
import { useSvgFont } from "@/components/viz/useSvgFont";
import { P, type Obj } from "@/lib/engine";
import { pct } from "@/lib/format";
import {
  DECISION_COLOUR,
  DECISION_MARK,
  MUTED,
  OKABE_ITO,
} from "@/lib/viz/palette";

import { EngineStatus } from "../agent/EngineStatus";
import { useEngine } from "./useEngine";

const W = 360;
const LABEL: Record<string, string> = {
  refuse: "Nobody: asks are refused",
  policy: "The policy's asks",
  consequential: "Every write and send",
  every: "Every call",
};
const SHORT: Record<string, string> = {
  read_notes: "notes",
  read_inbox: "inbox",
  read_ticket: "ticket",
  search_docs: "docs",
  fetch_page: "page",
  summarise: "summary",
  write_file: "write",
  send_message: "send",
};

/** Whether a call ran and whether a human was asked, under a threshold (the engine's rules). */
export function gate(th: string, tool: string, decision: string) {
  const ran = decision === "allow" || (decision === "ask" && th !== "refuse");
  const human =
    ran &&
    (decision === "ask" ||
      th === "every" ||
      (th === "consequential" && P.utility.consequential(tool)));
  return { ran, human };
}

export default function ApprovalWidget({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  const st = useEngine("approval");
  if (st.status !== "ready")
    return (
      <EngineStatus error={st.status === "error" ? st.error : undefined} />
    );
  return <Approval data={st.data}>{children}</Approval>;
}

function Approval({
  data,
  children,
}: {
  data: Obj;
  children?: ReactNode;
}): JSX.Element {
  const K = P.catalogue;
  const [th, setTh] = useState<string>("policy");
  const [hover, setHover] = useState<string | null>(null);
  const study = data.thresholds[th] as Obj;
  const frames = study.frames as Obj[];
  const s = useStepper(frames.length, { stepMs: 1700, resetKey: th });
  const f = frames[s.step]!;
  const font = useSvgFont(W);
  const fs = font.fs(10);
  const steps = f.steps as Obj[];
  const row = f.row as Obj;
  const n = steps.length;
  const gap = 4;
  const bw = (W - gap * (n - 1)) / n;
  const bh = fs * 4.4;
  // the fatigue curve: prompts 1..8 in a task against the chance of a mistaken approval
  const curve = (data.fatigue as Obj[]).slice(0, 8);
  const cx0 = fs * 3.2;
  const cy0 = bh + fs * 3;
  const cw = W - cx0 - 6;
  const ch = 96;
  const X = (k: number) => cx0 + ((k - 1) / (curve.length - 1)) * cw;
  const Y = (m: number) => cy0 + ch - m * ch;
  const H = cy0 + ch + fs * 2.6;
  const hl =
    hover ??
    (row.prompts > 0 ? "fatigue" : row.routes.length ? "gate" : "fatigue");

  const visual = (
    <div className="min-w-0 space-y-3">
      <svg
        ref={font.ref}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={`One task's calls with the policy's decisions and the approvals asked, and the approval-fatigue curve. ${f.caption}`}
        data-testid="approvals"
      >
        {steps.map((c, i) => {
          const g = gate(th, c.tool, c.decision);
          const x = i * (bw + gap);
          return (
            <g
              key={i}
              data-call={c.tool}
              data-human={g.human ? "true" : "false"}
              data-decision={c.decision}
            >
              <rect
                x={x}
                y={0}
                width={bw}
                height={bh}
                rx={4}
                className="fill-white dark:fill-neutral-950"
                stroke={DECISION_COLOUR[c.decision]}
                strokeWidth={g.ran ? 2 : 1}
                strokeDasharray={g.ran ? undefined : "3 3"}
              />
              <text
                x={x + bw / 2}
                y={fs * 1.3}
                textAnchor="middle"
                style={{ fontSize: fs }}
                className="fill-neutral-800 font-mono dark:fill-neutral-200"
              >
                {SHORT[c.tool] ?? c.tool}
              </text>
              <text
                x={x + bw / 2}
                y={fs * 2.7}
                textAnchor="middle"
                style={{ fontSize: fs }}
                fill={DECISION_COLOUR[c.decision]}
                className="font-bold"
              >
                {DECISION_MARK[c.decision]}
              </text>
              {g.human && (
                <text
                  x={x + bw / 2}
                  y={fs * 3.9}
                  textAnchor="middle"
                  style={{ fontSize: fs }}
                  fill={OKABE_ITO.purple}
                  className="font-medium"
                >
                  human
                </text>
              )}
            </g>
          );
        })}
        <text
          x={0}
          y={bh + fs * 1.5}
          style={{ fontSize: fs }}
          className="fill-neutral-700 dark:fill-neutral-300"
        >
          {f.task}: {row.prompts} prompt{row.prompts === 1 ? "" : "s"}
          {row.blocked.length ? ", blocked" : ""}
        </text>
        {/* fatigue curve */}
        <line x1={cx0} x2={cx0 + cw} y1={Y(0)} y2={Y(0)} stroke={MUTED.light} />
        <line x1={cx0} x2={cx0} y1={Y(0)} y2={Y(1)} stroke={MUTED.light} />
        {[0, 0.5, 1].map((m) => (
          <text
            key={m}
            x={cx0 - 4}
            y={Y(m) + fs / 3}
            textAnchor="end"
            style={{ fontSize: fs }}
            className="fill-neutral-600 dark:fill-neutral-400"
          >
            {pct(m)}
          </text>
        ))}
        {curve.map((p) => (
          <text
            key={p.n}
            x={X(p.n)}
            y={Y(0) + fs * 1.3}
            textAnchor="middle"
            style={{ fontSize: fs }}
            className="fill-neutral-600 dark:fill-neutral-400"
          >
            {p.n}
          </text>
        ))}
        <polyline
          points={curve.map((p) => `${X(p.n)},${Y(p.miss)}`).join(" ")}
          fill="none"
          stroke={OKABE_ITO.purple}
          strokeWidth={2}
        />
        {row.prompts > 0 && row.prompts <= curve.length && (
          <circle
            cx={X(row.prompts)}
            cy={Y(row.miss)}
            r={fs * 0.55}
            fill={OKABE_ITO.purple}
            stroke="#262626"
            className="dark:stroke-neutral-100"
            data-testid="fatigue-mark"
          />
        )}
        <text
          x={cx0 + cw}
          y={Y(1) + fs}
          textAnchor="end"
          style={{ fontSize: fs }}
          className="fill-neutral-700 dark:fill-neutral-300"
        >
          mistaken approval at prompt n
        </text>
      </svg>
      <p className="text-xs text-neutral-600 dark:text-neutral-400">
        ✓ allowed, ? sent for approval, ✕ denied, – skipped; “human”: a person
        is asked to approve the call. A dashed box did not run.
      </p>
    </div>
  );

  const sum = study.summary as Obj;
  return (
    <AnimationPanel
      testId="approval-widget"
      title="More prompts gate more, but each one is read less carefully"
      summary="The label policy over the benign suite, task by task: each call's decision, where a human is asked, and the approval-fatigue curve. Choose who is asked. From the engine's policy module."
      stepper={s}
      stepLabel="task"
      caption={f.caption}
      visual={visual}
      equation={children}
      hl={hl}
      onEquationHover={setHover}
      stats={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Prompts so far" value={String(f.prompts)} />
          <Stat label="Risky tasks gated" value={`${f.gated} of ${f.risky}`} />
          <Stat
            label="Suite: prompts per task"
            value={sum.prompts.toFixed(2)}
          />
          <Stat label="Suite: risk per task" value={pct(sum.risk, 1)} />
        </div>
      }
      params={
        <Choice
          label="Who must approve"
          value={th}
          options={[
            "policy",
            ...(K.UTILITY.thresholds as string[]).filter((x) => x !== "policy"),
          ].map((x) => ({ value: x, label: LABEL[x]! }))}
          onChange={setTh}
        />
      }
    />
  );
}
