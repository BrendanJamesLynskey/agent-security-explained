"use client";

/**
 * Chapter 5: a tool's process inside its sandbox. The layers are drawn as boundaries: the
 * workspace (the file-system scope), the container around it, and the network allow-list at the
 * host's edge. Each step is one action the process attempts; it reaches its target, or stops at the
 * first boundary whose layer stops it. Switch layers on and off: the engine recomputes which
 * actions each one stops. Frames from the engine's policy `allLayerSets` (`sandboxActionFrames`).
 */
import { useState, type ReactNode } from "react";

import { AnimationPanel } from "@/components/anim/AnimationPanel";
import { useStepper } from "@/components/anim/useStepper";
import { Stat } from "@/components/ui/Controls";
import { useSvgFont } from "@/components/viz/useSvgFont";
import { P, type Obj } from "@/lib/engine";
import { DECISION_COLOUR, LAYER_COLOUR, MUTED } from "@/lib/viz/palette";

import { EngineStatus } from "../agent/EngineStatus";
import { useEngine } from "./useEngine";

const W = 360;
const H = 262;
type Rect = { x: number; y: number; w: number; h: number };
const HOST: Rect = { x: 2, y: 18, w: 356, h: 196 };
const CONTAINER: Rect = { x: 10, y: 36, w: 206, h: 170 };
const WORKSPACE: Rect = { x: 20, y: 62, w: 150, h: 120 };
const PROC: [number, number] = [60, 140];
const TARGETS: Record<string, { at: [number, number]; name: string }> = {
  ws_read: { at: [128, 92], name: "workspace files" },
  ws_write: { at: [128, 92], name: "workspace files" },
  home_read: { at: [290, 52], name: "home directory" },
  sys_write: { at: [290, 96], name: "system files" },
  host_exec: { at: [290, 140], name: "host processes" },
  net_registry: { at: [92, 240], name: "registry" },
  net_registry_put: { at: [92, 240], name: "registry" },
  net_other: { at: [262, 240], name: "other host" },
};
const RECT_OF: Record<string, Rect> = {
  fs_scope: WORKSPACE,
  container: CONTAINER,
  egress: HOST,
};

/** Where the segment from p (inside r) to q first leaves r. */
function exitPoint(p: [number, number], q: [number, number], r: Rect) {
  const [x0, y0] = p;
  const dx = q[0] - x0;
  const dy = q[1] - y0;
  let t = 1;
  if (dx > 0) t = Math.min(t, (r.x + r.w - x0) / dx);
  if (dx < 0) t = Math.min(t, (r.x - x0) / dx);
  if (dy > 0) t = Math.min(t, (r.y + r.h - y0) / dy);
  if (dy < 0) t = Math.min(t, (r.y - y0) / dy);
  return [x0 + dx * t, y0 + dy * t] as [number, number];
}

export default function SandboxWidget({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  const st = useEngine("sandbox");
  if (st.status !== "ready")
    return (
      <EngineStatus error={st.status === "error" ? st.error : undefined} />
    );
  return <Sandbox data={st.data}>{children}</Sandbox>;
}

function Sandbox({
  data,
  children,
}: {
  data: Obj;
  children?: ReactNode;
}): JSX.Element {
  const K = P.catalogue;
  const order = K.LAYERS.map((l) => l.id as string);
  const [active, setActive] = useState<string[]>(order);
  const [hover, setHover] = useState<string | null>(null);
  const set = (data.sets as Obj[]).find(
    (x) =>
      (x.layers as string[]).length === active.length &&
      (x.layers as string[]).every((l) => active.includes(l)),
  )!;
  const frames = set.frames as Obj[];
  const s = useStepper(frames.length, {
    stepMs: 1500,
    resetKey: active.join(","),
    smooth: true,
  });
  const f = frames[s.step]!;
  const font = useSvgFont(W);
  const fs = font.fs(10);
  const target = TARGETS[f.id]!;
  const blocker = f.stopped ? (f.by as Obj[])[0]!.layer : null;
  const box: Rect = {
    x: target.at[0] - 52,
    y: target.at[1] - fs,
    w: 104,
    h: fs * 2,
  };
  const end = blocker
    ? exitPoint(PROC, target.at, RECT_OF[blocker]!)
    : exitPoint(target.at, PROC, box);
  const p = s.playing ? Math.min(1, s.frac * 1.6) : 1;
  const tip: [number, number] = [
    PROC[0] + (end[0] - PROC[0]) * p,
    PROC[1] + (end[1] - PROC[1]) * p,
  ];
  const colour = f.stopped
    ? DECISION_COLOUR.deny
    : f.need
      ? DECISION_COLOUR.allow
      : "#E69F00";
  const hl = hover ?? (blocker === "fs_scope" ? "scope" : (blocker ?? "reach"));
  const toggle = (id: string) =>
    setActive((a) =>
      a.includes(id)
        ? a.filter((x) => x !== id)
        : order.filter((x) => a.includes(x) || x === id),
    );
  const ring = (r: Rect, id: string, label: string, on: boolean) => (
    <g data-layer={id} data-on={on ? "true" : "false"}>
      <rect
        x={r.x}
        y={r.y}
        width={r.w}
        height={r.h}
        rx={8}
        fill="none"
        stroke={on ? LAYER_COLOUR[id] : MUTED.light}
        strokeWidth={on ? 2.2 : 1}
        strokeDasharray={on ? undefined : "4 4"}
      />
      <text
        x={r.x + 6}
        y={r.y + fs + 2}
        style={{ fontSize: fs }}
        className="fill-neutral-700 dark:fill-neutral-300"
      >
        {label}
        {on ? "" : " (off)"}
      </text>
    </g>
  );

  const visual = (
    <div className="min-w-0 space-y-3">
      <svg
        ref={font.ref}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={`A tool process inside its sandbox layers. ${f.caption}`}
        data-testid="sandbox"
      >
        <rect
          x={HOST.x}
          y={HOST.y}
          width={HOST.w}
          height={HOST.h}
          rx={8}
          fill="none"
          stroke={MUTED.light}
        />
        <text
          x={HOST.x + HOST.w - 6}
          y={HOST.y + fs + 2}
          textAnchor="end"
          style={{ fontSize: fs }}
          className="fill-neutral-600 dark:fill-neutral-400"
        >
          host
        </text>
        <line
          x1={HOST.x}
          x2={HOST.x + HOST.w}
          y1={HOST.y + HOST.h}
          y2={HOST.y + HOST.h}
          stroke={active.includes("egress") ? LAYER_COLOUR.egress : MUTED.light}
          strokeWidth={active.includes("egress") ? 3 : 1}
          strokeDasharray={active.includes("egress") ? "10 4" : "4 4"}
          data-layer="egress"
          data-on={active.includes("egress") ? "true" : "false"}
        />
        <text
          x={HOST.x + HOST.w - 6}
          y={HOST.y + HOST.h - 4}
          textAnchor="end"
          style={{ fontSize: fs }}
          className="fill-neutral-700 dark:fill-neutral-300"
        >
          allow-list{active.includes("egress") ? ": registry only" : " (off)"}
        </text>
        {ring(
          CONTAINER,
          "container",
          "container",
          active.includes("container"),
        )}
        {ring(
          WORKSPACE,
          "fs_scope",
          "workspace (file scope)",
          active.includes("fs_scope"),
        )}
        {Object.entries(TARGETS)
          .filter(([k]) => !["ws_write", "net_registry_put"].includes(k))
          .map(([k, t]) => (
            <g key={k}>
              <rect
                x={t.at[0] - 52}
                y={t.at[1] - fs}
                width={104}
                height={fs * 2}
                rx={4}
                className="fill-white dark:fill-neutral-950"
                stroke={MUTED.light}
              />
              <text
                x={t.at[0]}
                y={t.at[1] + fs / 3}
                textAnchor="middle"
                style={{ fontSize: fs }}
                className="fill-neutral-800 dark:fill-neutral-200"
              >
                {t.name}
              </text>
            </g>
          ))}
        <circle cx={PROC[0]} cy={PROC[1]} r={fs * 1.1} fill="#0072B2" />
        <text
          x={PROC[0]}
          y={PROC[1] + fs * 2.4}
          textAnchor="middle"
          style={{ fontSize: fs }}
          className="fill-neutral-800 dark:fill-neutral-200"
        >
          tool process
        </text>
        <line
          x1={PROC[0]}
          y1={PROC[1]}
          x2={tip[0]}
          y2={tip[1]}
          stroke={colour}
          strokeWidth={3}
          strokeLinecap="round"
          data-outcome={f.outcome}
        />
        {p >= 1 && (
          <g data-end={f.stopped ? "stopped" : "reached"}>
            <circle
              cx={end[0]}
              cy={end[1]}
              r={fs * 0.9}
              className="fill-white dark:fill-neutral-950"
              stroke={colour}
              strokeWidth={2}
            />
            <text
              x={end[0]}
              y={end[1] + fs * 0.36}
              textAnchor="middle"
              style={{ fontSize: fs }}
              fill={colour}
              className="font-bold"
            >
              {f.stopped ? "✕" : f.need ? "✓" : "!"}
            </text>
          </g>
        )}
      </svg>
      <div
        role="group"
        aria-label="Sandbox layers"
        className="flex flex-wrap gap-2"
      >
        {K.LAYERS.map((l) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={active.includes(l.id)}
            onClick={() => toggle(l.id)}
            className={`focus-ring min-h-11 rounded border px-3 text-sm ${
              active.includes(l.id)
                ? "border-neutral-800 bg-neutral-100 dark:border-neutral-200 dark:bg-neutral-800"
                : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
            }`}
          >
            {l.name}: {active.includes(l.id) ? "on" : "off"}
          </button>
        ))}
      </div>
      <ul className="space-y-1 text-xs" data-testid="action-list">
        {frames.map((g, i) => (
          <li
            key={g.id}
            data-action={g.id}
            data-outcome={g.outcome}
            className={`grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-2 rounded px-2 py-0.5 ${i === s.step ? "bg-white ring-1 ring-neutral-300 dark:bg-neutral-950 dark:ring-neutral-700" : ""}`}
          >
            <span className="whitespace-nowrap font-mono">
              {i <= s.step
                ? {
                    works: "✓ works",
                    stopped: "✕ stopped",
                    broken: "✕ broken",
                    open: "! open",
                  }[g.outcome as string]
                : "·"}
            </span>
            <span>
              {g.text}
              {!g.need && (
                <span className="text-neutral-600 dark:text-neutral-400">
                  {" "}
                  (not needed)
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  const t = set.tally as Obj;
  return (
    <AnimationPanel
      testId="sandbox-widget"
      title="Each layer stops some actions; one gets past them all"
      summary="A tool's process tries eight actions, three of which its task needs; each stops at the first sandbox layer that blocks it. Turn layers on and off. From the engine's policy module."
      stepper={s}
      stepLabel="action"
      caption={f.caption}
      visual={visual}
      equation={children}
      hl={hl}
      onEquationHover={setHover}
      stats={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Needed, working" value={String(t.works)} />
          <Stat label="Needed, broken" value={String(t.broken)} />
          <Stat label="Unneeded, stopped" value={String(t.stopped)} />
          <Stat label="Unneeded, open" value={String(t.open)} />
        </div>
      }
    />
  );
}
