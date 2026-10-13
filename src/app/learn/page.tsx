/**
 * /learn — index of chapters.
 *
 * Server Component, statically rendered. Same layout as the companion
 * sites' /learn (transformer-explainer's, minus the per-user progress
 * badges: this site has no accounts).
 */
import Link from "next/link";

import { SECTIONS } from "@/lib/mdx/sections";
import { PLANNED } from "@/lib/planned";
import { AGENTS_HUB } from "@/lib/site";

export const metadata = {
  title: "Learn",
  description:
    "Chapters on agent security, defences only: trust boundaries, untrusted input, the lethal trifecta, least privilege and scoped credentials, and sandboxing, each built around an animation driven by a tested policy engine.",
};

export default function LearnIndex(): JSX.Element {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-accent dark:text-indigo-300">
        /learn
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        How to keep an agent safe
      </h1>
      <p className="mt-4 text-neutral-600 dark:text-neutral-300">
        One chapter per idea, each opening with an animation. Every frame is
        computed by the Agent_Loop_Sim engine&apos;s policy module, identically
        in Python and in your browser, over labels, never content. Toggle layers
        (Concept / Maths / Code) inside any chapter to choose how deep to go.
        For the wider picture, see the{" "}
        <a
          href={AGENTS_HUB}
          className="focus-ring rounded text-accent underline underline-offset-2 dark:text-indigo-300"
        >
          LLM Hub: Agents
        </a>{" "}
        decks.
      </p>

      <ol className="mt-10 divide-y divide-neutral-200 dark:divide-neutral-800">
        {SECTIONS.map((s, i) => (
          <li key={s.slug} className="py-5">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Link
                href={`/learn/${s.slug}`}
                className="focus-ring rounded text-lg font-medium text-neutral-900 hover:text-accent dark:text-neutral-100"
              >
                {s.title}
              </Link>
            </div>
            <p className="mt-1 pl-9 text-sm text-neutral-600 dark:text-neutral-400">
              {s.summary}
            </p>
          </li>
        ))}
        {PLANNED.map((p, i) => (
          <li key={p} className="py-4" data-planned>
            <div className="flex items-baseline gap-3 text-neutral-500 dark:text-neutral-400">
              <span className="font-mono text-xs">
                {String(SECTIONS.length + i + 1).padStart(2, "0")}
              </span>
              <span>
                {p} <span className="text-xs">(coming)</span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
