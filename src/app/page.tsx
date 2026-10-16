import type { Route } from "next";
import Link from "next/link";

import { CheckedStrip, StartButton } from "@/components/ui/Landing";
import { SECTIONS } from "@/lib/mdx/sections";
import { formatValue, lookup } from "@/lib/security/values";
import { ENGINE_URL } from "@/lib/site";
import { CIRCLE_COLOUR, DECISION_COLOUR } from "@/lib/viz/palette";
import { ReadingOrder } from "@/components/ui/ReadingOrder";

const LINK =
  "focus-ring rounded underline decoration-accent/40 underline-offset-4 hover:decoration-accent";

/**
 * Landing page: what the site is, a picture of the trifecta (from the engine's exhaustive search,
 * at build time), and the ways in. Server Component with no client JavaScript of its own.
 */
export default function HomePage(): JSX.Element {
  const v = (path: string, fmt: Parameters<typeof formatValue>[1]) =>
    formatValue(lookup(path), fmt);
  const C: [string, number, number, string][] = [
    ["private", 112, 70, "private data"],
    ["untrusted", 188, 70, "untrusted input"],
    ["outbound", 150, 128, "a way out"],
  ];
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-accent dark:text-indigo-300">
        Agent Security Explained
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        Agents that stay safe by design
      </h1>
      <div className="mt-6 grid items-start gap-8 md:grid-cols-[1fr_minmax(0,22rem)]">
        <div>
          <p className="max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
            An interactive guide to the defences that keep AI agents safe, each
            one animated by a tested policy engine.
          </p>
          <div className="mt-6">
            <StartButton href={`/learn/${SECTIONS[0]!.slug}` as Route} />
          </div>
        </div>
        <figure
          data-hero-figure
          className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
        >
          <svg
            viewBox="0 0 300 200"
            className="h-auto w-full"
            role="img"
            aria-label="Three overlapping circles: private data, untrusted input and a way out. Where all three overlap, a flow out exists, and the policy denies it."
          >
            {C.map(([k, x, y]) => (
              <circle
                key={k}
                cx={x}
                cy={y}
                r={56}
                fill={CIRCLE_COLOUR[k]}
                fillOpacity={0.25}
                stroke={CIRCLE_COLOUR[k]}
                strokeWidth={2}
              />
            ))}
            {C.map(([k, x, y, label]) => (
              <text
                key={k}
                x={k === "outbound" ? x : k === "private" ? x - 30 : x + 30}
                y={k === "outbound" ? y + 40 : y - 18}
                textAnchor="middle"
                fontSize={13}
                className="fill-neutral-800 dark:fill-neutral-200"
              >
                {label}
              </text>
            ))}
            <circle
              cx={150}
              cy={92}
              r={13}
              fill="none"
              stroke={DECISION_COLOUR.deny}
              strokeWidth={2.5}
            />
            <text
              x={150}
              y={97}
              textAnchor="middle"
              fontSize={14}
              fill={DECISION_COLOUR.deny}
              className="font-bold"
            >
              ✕
            </text>
          </svg>
          <figcaption className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
            Chapter 3: an agent holding all three can be steered into sending
            private data out ({v("tri.trifecta", "int")} of the{" "}
            {v("tri.n", "int")} tool subsets do); the policy&apos;s decision on
            that flow: {v("tri.all_decision", "raw")}. Computed by the engine at
            build time.
          </figcaption>
        </figure>
      </div>
      <CheckedStrip href="/about#engine">
        The trifecta check agrees with an exhaustive search on all{" "}
        {v("tri.n", "int")} tool subsets, and the TypeScript engine in your
        browser reproduces the Python reference&apos;s fixtures exactly.
      </CheckedStrip>
      <section aria-labelledby="learn-heading" className="mt-12">
        <h2 id="learn-heading" className="text-xl font-semibold tracking-tight">
          What you&apos;ll learn
        </h2>
        <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-300">
          An agent reads text that anyone could have written, holds data that
          should stay private, and can act on the world. This site is about the{" "}
          <strong>defences</strong>: where the trust boundaries are, how to
          label every value by where it came from and how secret it is, why a
          model cannot be trusted to tell data from instructions, the three
          capabilities that must never meet, least privilege and audience-bound
          tokens, the sandbox around a tool&apos;s process, why detectors never
          reach zero, designs that make safety structural, approvals that stay
          worth reading, and what every defence costs. Threats appear only as
          the categories their papers name; there are no attack recipes here.
        </p>
        <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-300">
          The animations are driven by{" "}
          <a href={ENGINE_URL} className={LINK}>
            Agent_Loop_Sim
          </a>
          &apos;s policy module, identically in Python and in your browser: a
          policy engine over abstract labels, never content. Over all{" "}
          {v("tri.n", "int")} subsets of its {v("consts.tools", "int")} tools,
          the trifecta check agrees with an exhaustive search for a way out on{" "}
          {v("tri.agree", "int")}. On a suite of {v("fr.n", "int")} benign
          tasks, planning in advance with least privilege finishes{" "}
          {v("fr.adaptive.planned.utility", "pct1")} of them and leaves a
          steered attempt {v("fr.adaptive.planned.risk", "pct1")} of tasks
          against an adaptive attacker, where no defence leaves{" "}
          {v("fr.adaptive.none.risk", "pct1")}. No language model runs anywhere.
        </p>
      </section>
      <ReadingOrder current="security" />
      <nav aria-label="Chapters" className="mt-12 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s, i) => (
          <Link
            key={s.slug}
            href={`/learn/${s.slug}`}
            className="focus-ring group rounded-lg border border-neutral-200 p-5 hover:border-accent dark:border-neutral-800 dark:hover:border-indigo-400"
          >
            <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-1 font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {s.summary}
            </p>
          </Link>
        ))}
      </nav>
      <p className="mt-12 text-sm text-neutral-600 dark:text-neutral-400">
        Part of a family of sixteen companion sites in four tracks, all in the
        site menu above: Foundations (
        <a
          href="https://transformer-decoder-explained.vercel.app"
          className={LINK}
        >
          Decoder
        </a>
        ,{" "}
        <a
          href="https://transformer-training-explained.vercel.app"
          className={LINK}
        >
          Training
        </a>
        ), Hardware (
        <a href="https://gpu-kernels-explained.vercel.app" className={LINK}>
          Kernels
        </a>
        ,{" "}
        <a href="https://systolic-arrays-explained.vercel.app" className={LINK}>
          Systolic
        </a>
        ,{" "}
        <a href="https://ai-accelerators-explained.vercel.app" className={LINK}>
          Accelerators
        </a>
        ,{" "}
        <a href="https://ai-racks-explained.vercel.app" className={LINK}>
          Racks
        </a>
        ), Inference (
        <a href="https://llm-inference-explained.vercel.app" className={LINK}>
          Serving
        </a>
        ,{" "}
        <a
          href="https://llm-architectures-explained.vercel.app"
          className={LINK}
        >
          Architectures
        </a>
        ,{" "}
        <a href="https://numerics-explained.vercel.app" className={LINK}>
          Numerics
        </a>
        ,{" "}
        <a
          href="https://inference-tradeoffs-explained.vercel.app"
          className={LINK}
        >
          Trade-offs
        </a>
        ) and Agents (
        <a href="https://agent-harnesses-explained.vercel.app" className={LINK}>
          Harnesses
        </a>
        ,{" "}
        <a href="https://agent-protocols-explained.vercel.app" className={LINK}>
          Protocols
        </a>
        ,{" "}
        <a href="https://agent-context-explained.vercel.app" className={LINK}>
          Context
        </a>
        ,{" "}
        <a
          href="https://agent-orchestration-explained.vercel.app"
          className={LINK}
        >
          Orchestration
        </a>
        ,{" "}
        <a href="https://agent-evals-explained.vercel.app" className={LINK}>
          Evals
        </a>
        , <strong className="font-medium">Security</strong>). It is the sixth of
        the six agent sites. How this one was built, and how to check it:{" "}
        <Link href="/about" className={LINK}>
          about
        </Link>
        .
      </p>
    </main>
  );
}
