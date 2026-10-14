/**
 * /about: what the site is, what the engine computes and what it leaves out, how the animations are
 * driven and checked, and how the policy module is tested. Server Component, static.
 */
import Link from "next/link";

import VENDORED from "@/lib/engine/vendor/VENDORED.json";
import DATA from "@/lib/engine/vendor/policy_data.json";
import { formatValue, lookup } from "@/lib/security/values";
import {
  ARXIV,
  AUTHOR,
  CONTEXT_URL,
  DECODER_URL,
  ENGINE_URL,
  EVALS_URL,
  GITHUB_URL,
  HARNESSES_URL,
  INFERENCE_URL,
  ORCHESTRATION_URL,
  PAPERS,
  PROTOCOLS_URL,
  repoFile,
} from "@/lib/site";

export const metadata = {
  title: "About",
  description:
    "What Agent Security Explained's policy engine computes, how it is tested (lattice laws, soundness on every small plan, an exhaustive search behind the trifecta check, the cost-and-risk model against simulation), what is illustrative, and how Python and the browser are checked to agree exactly.",
};

const A =
  "focus-ring rounded text-accent underline underline-offset-2 dark:text-indigo-300";

export default function AboutPage(): JSX.Element {
  const v = (path: string, fmt: Parameters<typeof formatValue>[1]) =>
    formatValue(lookup(path), fmt);
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-accent dark:text-indigo-300">
        /about
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        About this site
      </h1>
      <div className="mdx-content mt-6">
        <p>
          Agent Security Explained is about building agents that stay safe:
          where the trust boundaries are, how labels flow, why untrusted input
          cannot be trusted to stay data, the lethal trifecta, least privilege
          and scoped credentials, and sandboxing. It covers defences only:
          threats appear as the categories their papers name, in a sentence or
          two, with no example attacks. It is the sixth of a family of agent
          sites, after{" "}
          <a href={HARNESSES_URL} className={A}>
            Agent Harnesses Explained
          </a>
          ,{" "}
          <a href={PROTOCOLS_URL} className={A}>
            Agent Protocols Explained
          </a>
          ,{" "}
          <a href={CONTEXT_URL} className={A}>
            Agent Context Explained
          </a>
          ,{" "}
          <a href={ORCHESTRATION_URL} className={A}>
            Agent Orchestration Explained
          </a>{" "}
          and{" "}
          <a href={EVALS_URL} className={A}>
            Agent Evals Explained
          </a>
          , next to the LLM-systems sites (the{" "}
          <a href={DECODER_URL} className={A}>
            Transformer Decoder Explainer
          </a>
          ,{" "}
          <a href={INFERENCE_URL} className={A}>
            LLM Inference Explained
          </a>{" "}
          and others, all in the header&apos;s menu). Chapters 6 to 10 weigh the
          defences: why detection never reaches zero, designs that make safety
          structural, humans in the loop, what each defence costs on a suite of{" "}
          {v("fr.n", "int")} benign tasks against what it leaves (the
          security–utility frontier), and a checklist that audits a design
          against every chapter.
        </p>

        <h2>Labels, not content</h2>
        <p>
          No model runs, and no text is modelled. Each value carries a label: a
          source (the user, a trusted tool, or untrusted) and a sensitivity
          (public or private), {v("consts.labels", "int")} labels in all,
          ordered as a lattice. The engine runs small task plans over{" "}
          {v("consts.tools", "int")} abstract tools, propagates labels, and
          applies a policy whose every decision lists the rules that fired. It
          assumes the worst about the model: once it has read untrusted data,
          any choice it makes may be that data&apos;s choice. The published
          measurements the chapters quote (for example InjecAgent&apos;s{" "}
          {v("pub.injecagent_react_gpt4", "pct")},{" "}
          <a href={ARXIV(PAPERS.injecagent)} className={A}>
            Zhan et al. 2024
          </a>
          ) are quoted from their papers, each checked at export.arxiv.org.
        </p>

        <h2>The engine, and how it is tested</h2>
        <p>
          The engine is{" "}
          <a href={ENGINE_URL} className={A}>
            Agent_Loop_Sim
          </a>
          &apos;s policy module (engine {DATA.version}): a Python reference with
          a TypeScript port, vendored here at commit{" "}
          <code>{VENDORED.commit.slice(0, 7)}</code> with every file&apos;s
          SHA-256 recorded. In the engine&apos;s CI:
        </p>
        <ul>
          <li>
            every lattice law (order, least upper and greatest lower bounds,
            commutativity, associativity, absorption) is checked on all{" "}
            {v("consts.labels", "int")} labels;
          </li>
          <li>
            on every plan of up to three calls, under several grants, in both
            kinds of agent and with approvals granted or refused, each
            call&apos;s label equals an independent computation from the reads
            it depends on, and no call that ran carried private data out under
            untrusted control; decisions never relax when a label rises or a
            grant shrinks;
          </li>
          <li>
            the trifecta check equals an exhaustive search for a flow out on
            every one of the {v("tri.n", "int")} subsets of the tools; the
            sandbox layers only ever stop more as layers are added; the
            defence-in-depth formulas match a seeded simulation;
          </li>
          <li>
            the cost and risk of every defence on the benign suite match a
            seeded simulation; least privilege never adds risk or blocks a
            benign task; an adaptive attacker never lowers risk; each approval
            threshold asks at least as often as the one before; the frontier
            matches its definition on random point sets; a plan that branches on
            a value is never stricter once the branch is dropped;
          </li>
          <li>
            the TS port reproduces every fixture exactly, with no tolerance.
          </li>
        </ul>
        <ul>
          <li>
            In this site&apos;s CI, the Python reference installed from the
            vendored commit regenerates{" "}
            <a
              href={repoFile("tests/fixtures/site_fixtures.json")}
              className={A}
            >
              this site&apos;s fixtures
            </a>{" "}
            (everything each chapter animates), and the unit tests require the
            vendored TS engine to reproduce them exactly.
          </li>
          <li>
            Every number in the prose is computed by the engine when the page is
            built, never typed in. The recorded run is on the{" "}
            <Link href="/data" className={A}>
              data page
            </Link>
            .
          </li>
          <li>
            Every code block in a chapter is cut from the vendored engine, and
            every equation compiles; end-to-end tests play, step, scrub and
            reset every animation in light and dark mode at desktop and phone
            widths, and check its captions at key steps against the Python
            reference&apos;s frames.
          </li>
        </ul>

        <h2>What is illustrative</h2>
        <ul>
          <li>
            The {v("consts.tools", "int")} tools, {v("consts.dests", "int")}{" "}
            destinations, {v("consts.plans", "int")} tasks, the grants, scopes
            and servers, and the sandbox&apos;s {v("consts.actions", "int")}{" "}
            actions and {v("consts.layers", "int")} layers are abstract
            placeholders, not products.
          </li>
          <li>
            The rules are one reasonable policy, not a standard: real systems
            choose their own rules, and their own trade-off between asking the
            user and refusing.
          </li>
          <li>
            The published rates hold for their papers&apos; models and test
            suites; they are not the rate for any other agent.
          </li>
          <li>
            Part two: the suite of benign tasks, two of the three detector
            layers&apos; miss and false-positive rates, the approval miss rates
            and fatigue, one steering attempt per task, the planner&apos;s one
            extra call, the checklist&apos;s thresholds and{" "}
            {v("ck.budget", "pct")} risk budget, and the adaptive
            attacker&apos;s &ldquo;every detector passed&rdquo; (a bound read
            from{" "}
            <a href={ARXIV(PAPERS.adaptive)} className={A}>
              Zhan et al. 2025
            </a>
            ). Threats are only ever an abstract event: an attempt, a route, a
            label.
          </li>
        </ul>

        <h2>Accessibility</h2>
        <p>
          Every animation has keyboard controls (Space plays or pauses, the
          arrow keys step), a live caption read out by screen readers, and
          starts paused when the reader prefers reduced motion. Colours come
          from Okabe and Ito&apos;s colour-blind-safe palette, and nothing is
          told by colour alone: every label is also written out, private values
          are hatched with a heavier outline, and a denial is marked ✕ and
          hatched.
        </p>

        <h2>Source</h2>
        <p>
          The site&apos;s source is on{" "}
          <a href={GITHUB_URL} className={A}>
            GitHub
          </a>{" "}
          (MIT). The design patterns behind chapter 7 are surveyed by{" "}
          <a href={ARXIV(PAPERS.patterns)} className={A}>
            Beurer-Kellner et al. (2025)
          </a>
          .
        </p>
      </div>
      <p
        className="mt-12 text-sm text-neutral-600 dark:text-neutral-400"
        data-author-credit
      >
        Built by{" "}
        <a className={A} href={AUTHOR.url}>
          {AUTHOR.name}
        </a>
      </p>
    </main>
  );
}
