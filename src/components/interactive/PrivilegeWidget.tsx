"use client";

/**
 * Chapter 4: one task under two grants. On the left a broad grant (every tool, every scope,
 * every destination); on the right the task's least privilege, computed from its plan. The eight
 * tools are tiles: held or not, needed or not. Each step runs one call through the policy and
 * presents the token the grant minted for that call's server; the last call is one the task does
 * not need. Then a token is presented to the wrong server. Frames from the engine's policy
 * `privilegeStudy`.
 */
import { useState, type ReactNode } from "react";

import { AnimationPanel } from "@/components/anim/AnimationPanel";
import { useStepper } from "@/components/anim/useStepper";
import { Hatch } from "@/components/interactive/Hatch";
import { DecisionBadge } from "@/components/interactive/LabelChip";
import { Stat } from "@/components/ui/Controls";
import { useSvgFont } from "@/components/viz/useSvgFont";
import { P, type Obj } from "@/lib/engine";
import { privilegeFrames } from "@/lib/security/captions";
import { DECISION_COLOUR, MUTED } from "@/lib/viz/palette";

import { EngineStatus } from "../agent/EngineStatus";
import { useEngine } from "./useEngine";

const W = 360;
const GRANTS = [
  { key: "broad", name: "Broad grant" },
  { key: "task", name: "Least privilege" },
] as const;

export default function PrivilegeWidget({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  const st = useEngine("privilege");
  if (st.status !== "ready")
    return (
      <EngineStatus error={st.status === "error" ? st.error : undefined} />
    );
  return <Privilege data={st.data}>{children}</Privilege>;
}

function Privilege({
  data,
  children,
}: {
  data: Obj;
  children?: ReactNode;
}): JSX.Element {
  const K = P.catalogue;
  const frames = privilegeFrames(data);
  const [hover, setHover] = useState<string | null>(null);
  const s = useStepper(frames.length, { stepMs: 1800 });
  const f = frames[s.step]!;
  const font = useSvgFont(W);
  const fs = font.fs(11);
  const needed = (data.runs.task.grant.tools as string[]) ?? [];
  const cols = font.narrow ? 2 : 4;
  const tileW = (W - 4) / cols;
  const tileH = fs * 2.4;
  const block = fs + 8 + (8 / cols) * (tileH + 4) + 8;
  const H = 2 * block;
  const tool = f.kind === "step" ? (f.broad.tool as string | null) : null;
  const hl =
    hover ??
    (f.kind === "passthrough" ? "aud" : f.step === 0 ? "need" : "grant");

  const visual = (
    <div className="min-w-0 space-y-3">
      <svg
        ref={font.ref}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={`The eight tools under a broad grant and under least privilege. ${f.caption}`}
        data-testid="grants"
      >
        <defs>
          <Hatch id="pv-deny" colour={DECISION_COLOUR.deny} />
        </defs>
        {GRANTS.map((g, gi) => {
          const x0 = 2;
          const y0 = gi * block;
          const run = data.runs[g.key] as Obj;
          const holds = run.grant.tools as string[];
          const cur = f.kind === "step" ? (f[g.key] as Obj) : null;
          return (
            <g key={g.key} data-grant={g.key}>
              <text
                x={x0}
                y={y0 + fs}
                style={{ fontSize: fs }}
                className="fill-neutral-800 font-medium dark:fill-neutral-200"
              >
                {g.name} ({holds.length})
              </text>
              {K.TOOL_ORDER.map((t, i) => {
                const x = x0 + (i % cols) * tileW;
                const y = y0 + fs + 8 + Math.floor(i / cols) * (tileH + 4);
                const held = holds.includes(t);
                const need = needed.includes(t);
                const on = t === tool && cur !== null && cur.op === "call";
                return (
                  <g key={t} data-tool={t} data-held={held ? "true" : "false"}>
                    <rect
                      x={x}
                      y={y}
                      width={tileW - 3}
                      height={tileH}
                      rx={3}
                      fill={
                        on && cur!.decision === "deny"
                          ? "url(#pv-deny)"
                          : held
                            ? need
                              ? "#0072B2"
                              : "#E69F00"
                            : "none"
                      }
                      fillOpacity={on && cur!.decision === "deny" ? 1 : 0.22}
                      stroke={on ? DECISION_COLOUR[cur!.decision] : MUTED.light}
                      strokeWidth={on ? 2.4 : 1}
                      strokeDasharray={held ? undefined : "3 3"}
                    />
                    <text
                      x={x + (tileW - 3) / 2}
                      y={y + tileH / 2 + fs / 3}
                      textAnchor="middle"
                      style={{ fontSize: fs }}
                      className={
                        held
                          ? "fill-neutral-900 font-mono dark:fill-neutral-100"
                          : "fill-neutral-500 font-mono dark:fill-neutral-400"
                      }
                    >
                      {t.replace("_", " ")}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-700 dark:text-neutral-300">
        <li className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-sm bg-[#0072B2]/40" />
          held, and the task needs it
        </li>
        <li className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-sm bg-[#E69F00]/40" />
          held, but the task never uses it
        </li>
        <li className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-sm border border-dashed border-neutral-400" />
          not held
        </li>
      </ul>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        {GRANTS.map((g) => {
          const run = data.runs[g.key] as Obj;
          const r = f.kind === "step" ? (f[g.key] as Obj) : null;
          return (
            <div
              key={g.key}
              data-testid={`grant-${g.key}`}
              className="min-w-0 space-y-1 rounded bg-white p-2 text-xs ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800"
            >
              <p className="font-medium text-neutral-800 dark:text-neutral-200">
                {g.name}
              </p>
              <p className="break-words text-neutral-600 dark:text-neutral-400">
                Tokens:{" "}
                {Object.values(run.tokens as Obj)
                  .map(
                    (t) =>
                      `${(t as Obj).aud} (${((t as Obj).scopes as string[]).join(", ")})`,
                  )
                  .join("; ")}
              </p>
              {r && r.op === "call" && (
                <div className="flex flex-wrap items-center gap-1">
                  <span className="font-mono">{r.tool}</span>
                  <DecisionBadge d={r.decision} />
                  <span
                    data-token-ok={r.token.ok ? "true" : "false"}
                    className="text-neutral-700 dark:text-neutral-300"
                  >
                    token {r.token.ok ? "✓" : "✕"} {r.token.reason}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {f.kind === "passthrough" && (
        <p
          data-testid="passthrough"
          className="rounded bg-white p-2 font-mono text-xs ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800"
        >
          {data.passthrough.token.aud} token → {data.passthrough.tool}:{" "}
          {data.passthrough.check.ok ? "accepted" : "rejected"}
        </p>
      )}
    </div>
  );

  return (
    <AnimationPanel
      testId="privilege-widget"
      title="Least privilege: the call the task does not need has nothing to call with"
      summary="The same task under a broad grant and under the least privilege its plan needs, one call at a time, with the token each grant minted; the last call is outside the task. From the engine's policy module."
      stepper={s}
      stepLabel="step"
      caption={f.caption}
      visual={visual}
      equation={children}
      hl={hl}
      onEquationHover={setHover}
      stats={
        <div className="grid grid-cols-3 gap-2">
          <Stat
            label="Tools held"
            value={`${data.runs.broad.grant.tools.length} vs ${data.runs.task.grant.tools.length}`}
          />
          <Stat
            label="Held, never used"
            value={String(data.runs.broad.over.tools.length)}
            hint="under the broad grant"
          />
          <Stat
            label="Tokens minted"
            value={`${Object.keys(data.runs.broad.tokens).length} vs ${Object.keys(data.runs.task.tokens).length}`}
          />
        </div>
      }
    />
  );
}
