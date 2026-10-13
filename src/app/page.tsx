import Link from "next/link";

import { SECTIONS } from "@/lib/mdx/sections";
import { PLANNED } from "@/lib/planned";
import { formatValue, lookup } from "@/lib/security/values";
import {
  CONTEXT_URL,
  DECODER_URL,
  ENGINE_URL,
  EVALS_URL,
  HARNESSES_URL,
  INFERENCE_URL,
  ORCHESTRATION_URL,
  PROTOCOLS_URL,
} from "@/lib/site";
import { CIRCLE_COLOUR, DECISION_COLOUR } from "@/lib/viz/palette";

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
      <div className="mt-8 grid items-center gap-8 md:grid-cols-[1fr_minmax(0,22rem)]">
        <div>
          <p className="max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
            An agent reads text that anyone could have written, holds data that
            should stay private, and can act on the world. This site is about
            the <strong>defences</strong>: where the trust boundaries are, how
            to label every value by where it came from and how secret it is, why
            a model cannot be trusted to tell data from instructions, the three
            capabilities that must never meet, least privilege and
            audience-bound tokens, and the sandbox around a tool&apos;s process.
            Threats appear only as the categories their papers name; there are
            no attack recipes here.
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
            {v("tri.agree", "int")}. No language model runs anywhere.
          </p>
        </div>
        <figure className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
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
      <p className="mt-8 text-sm text-neutral-600 dark:text-neutral-400">
        Coming next: {PLANNED.join("; ")}.
      </p>
      <p className="mt-12 text-sm text-neutral-600 dark:text-neutral-400">
        The sixth of a family of agent sites, after{" "}
        <a href={HARNESSES_URL} className={LINK}>
          Agent Harnesses Explained
        </a>
        ,{" "}
        <a href={PROTOCOLS_URL} className={LINK}>
          Agent Protocols Explained
        </a>
        ,{" "}
        <a href={CONTEXT_URL} className={LINK}>
          Agent Context Explained
        </a>
        ,{" "}
        <a href={ORCHESTRATION_URL} className={LINK}>
          Agent Orchestration Explained
        </a>{" "}
        and{" "}
        <a href={EVALS_URL} className={LINK}>
          Agent Evals Explained
        </a>
        , alongside the LLM-systems sites, from the{" "}
        <a href={DECODER_URL} className={LINK}>
          Transformer Decoder Explainer
        </a>{" "}
        to{" "}
        <a href={INFERENCE_URL} className={LINK}>
          LLM Inference Explained
        </a>{" "}
        (the site menu above lists them all). How this one was built, and how to
        check it:{" "}
        <Link href="/about" className={LINK}>
          about
        </Link>
        .
      </p>
    </main>
  );
}
