"use client";

/**
 * Chapter 6: attempts drawn one by one through layered detectors. Each dot is one attempt in an
 * untrusted result; the first step keeps those that would steer an undefended model (the base rate),
 * and each later step adds a detector layer, which misses some. Dots still lit got through. Choose
 * the share of attempts every layer misses together (a shared blind spot): the engine re-draws the
 * attempts and recomputes the closed form beside them. Frames from the engine's policy
 * `depthFrames`.
 */
import { useState, type ReactNode } from "react";

import { AnimationPanel } from "@/components/anim/AnimationPanel";
import { useStepper } from "@/components/anim/useStepper";
import { Choice, Stat } from "@/components/ui/Controls";
import { useSvgFont } from "@/components/viz/useSvgFont";
import { P, type Obj } from "@/lib/engine";
import { pct, trim } from "@/lib/format";
import { MUTED, OKABE_ITO, SOURCE_COLOUR } from "@/lib/viz/palette";

import { EngineStatus } from "../agent/EngineStatus";
import { useEngine } from "./useEngine";

const W = 360;
const COLS = 25;

export default function DepthWidget({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  const st = useEngine("depth");
  if (st.status !== "ready")
    return (
      <EngineStatus error={st.status === "error" ? st.error : undefined} />
    );
  return <Depth data={st.data}>{children}</Depth>;
}

function Depth({
  data,
  children,
}: {
  data: Obj;
  children?: ReactNode;
}): JSX.Element {
  const K = P.catalogue;
  const runs = data.runs as Obj[];
  const [c, setC] = useState<string>("0.01");
  const [hover, setHover] = useState<string | null>(null);
  const run = runs.find((r) => String(r.c) === c)!;
  const frames = run.frames as Obj[];
  const s = useStepper(frames.length, { stepMs: 1600, resetKey: c });
  const f = frames[s.step]!;
  const font = useSvgFont(W);
  const fs = font.fs(10);
  const stages = run.stages as number[];
  const rows = Math.ceil(stages.length / COLS);
  const cell = W / COLS;
  const gridH = rows * cell;
  const layers = K.DEPTH.layers as Obj[];
  const H = gridH + fs * 2.2;
  const hl =
    hover ??
    (f.f <= 1 ? "base" : f.f === frames.length - 1 && run.c > 0 ? "c" : "prod");

  const visual = (
    <div className="min-w-0 space-y-3">
      <svg
        ref={font.ref}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={`${stages.length} attempts as dots; those still lit got through every layer so far. ${f.caption}`}
        data-testid="dots"
      >
        {stages.map((st, i) => {
          const x = (i % COLS) * cell + cell / 2;
          const y = Math.floor(i / COLS) * cell + cell / 2;
          const alive = st >= f.f;
          // where an attempt stopped: never steered (stage 0) or at layer st (stage 1 + j)
          const lit = alive && f.f > 0;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={lit ? cell * 0.42 : cell * 0.28}
              fill={lit ? SOURCE_COLOUR.untrusted : "none"}
              stroke={lit ? "#262626" : MUTED.light}
              strokeWidth={lit ? 1.4 : 0.8}
              className={lit ? "dark:stroke-neutral-100" : undefined}
              data-alive={alive ? "true" : "false"}
            />
          );
        })}
        <text
          x={0}
          y={gridH + fs * 1.6}
          style={{ fontSize: fs }}
          className="fill-neutral-700 dark:fill-neutral-300"
        >
          {f.f === 0
            ? `${stages.length} attempts`
            : f.f === 1
              ? `${f.count} steer an undefended model`
              : `${f.count} past ${f.f - 1} layer${f.f === 2 ? "" : "s"}`}
        </text>
        <text
          x={W}
          y={gridH + fs * 1.6}
          textAnchor="end"
          style={{ fontSize: fs }}
          className="fill-neutral-600 dark:fill-neutral-400"
        >
          expected {trim(f.expected)}
        </text>
      </svg>
      <ol className="space-y-1 text-xs" data-testid="stages">
        {frames.map((g, i) => (
          <li
            key={i}
            data-stage={i}
            className={`grid grid-cols-[minmax(0,1fr)_4rem_5rem] items-baseline gap-2 rounded px-2 py-0.5 ${i === s.step ? "bg-white ring-1 ring-neutral-300 dark:bg-neutral-950 dark:ring-neutral-700" : ""}`}
          >
            <span>
              {i === 0
                ? "attempts in untrusted results"
                : i === 1
                  ? `steer an undefended model (${pct(K.DEPTH.base)})`
                  : `+ ${layers[i - 2]!.name} (misses ${pct(layers[i - 2]!.miss)})`}
            </span>
            <span className="text-right font-mono">
              {i <= s.step ? g.count : "·"}
            </span>
            <span className="text-right font-mono text-neutral-600 dark:text-neutral-400">
              {i <= s.step ? trim(g.expected) : ""}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-neutral-600 dark:text-neutral-400">
        Columns: drawn by the engine&apos;s seeded generator, and expected from
        the closed form.{" "}
        <span style={{ color: OKABE_ITO.orange }} aria-hidden="true">
          ●
        </span>{" "}
        still getting through.
      </p>
    </div>
  );

  const last = frames[frames.length - 1]!;
  return (
    <AnimationPanel
      testId="depth-widget"
      title="Every layer misses some; a shared blind spot sets a floor"
      summary="Attempts in untrusted results, drawn one by one through three detector layers, beside the closed form. Change the share of attempts every layer misses together. From the engine's policy module."
      stepper={s}
      stepLabel="layer"
      countFrom={0}
      caption={f.caption}
      visual={visual}
      equation={children}
      hl={hl}
      onEquationHover={setHover}
      stats={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat label="Got through" value={String(last.count)} />
          <Stat label="Expected" value={trim(last.expected)} />
          <Stat
            label="Floor from the blind spot"
            value={trim(stages.length * K.DEPTH.base * run.c)}
          />
        </div>
      }
      params={
        <Choice
          label="Shared blind spot c"
          value={c}
          // the default first: every other choice re-runs the animation
          options={[
            "0.01",
            ...runs.map((r) => String(r.c)).filter((x) => x !== "0.01"),
          ].map((x) => ({ value: x, label: pct(Number(x), 1) }))}
          onChange={setC}
        />
      }
    />
  );
}
