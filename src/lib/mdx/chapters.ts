/**
 * The chapters' slugs, titles and summaries, in order: the single source of truth. Kept apart from
 * sections.ts (which reads MDX from disk) so client components can import it too.
 */
export const SECTIONS = [
  {
    slug: "01-trust-boundaries",
    title: "Trust boundaries",
    summary:
      "An agent drawn as values flowing between the user, the model, its tools and the outside world, each value labelled by where it came from and how secret it is; the boundaries it crosses are where defences go.",
  },
  {
    slug: "02-untrusted-input",
    title: "Untrusted input",
    summary:
      "Why a model cannot reliably tell data from instructions, from the published research; and what that does to every decision a classic agent makes after it reads something untrusted, against a plan fixed in advance.",
  },
  {
    slug: "03-the-lethal-trifecta",
    title: "The lethal trifecta",
    summary:
      "Private data, untrusted input and a way to send data out: hold all three and a flow out exists; remove any one and an exhaustive search finds none. One tool can sit in two circles.",
  },
  {
    slug: "04-least-privilege",
    title: "Least privilege and scoped credentials",
    summary:
      "Give each task only the tools, scopes and destinations it needs, and tokens bound to one audience: the same plan under a broad grant and under its least privilege, and a call outside the task stopped and explained.",
  },
  {
    slug: "05-sandboxing-and-egress",
    title: "Sandboxing and egress control",
    summary:
      "A file-system scope, a container and a network allow-list drawn as boundaries around a tool's process: which actions each layer stops, which it lets through, and the one no layer can see.",
  },
  {
    slug: "06-detection-is-not-enough",
    title: "Detection is not enough",
    summary:
      "Layered, imperfect detectors multiply their misses but never reach zero, and a blind spot they share sets a floor no extra layer removes: attempts drawn one by one through the layers, beside the closed forms and the published rates.",
  },
  {
    slug: "07-designs-that-make-it-structural",
    title: "Designs that make it structural",
    summary:
      "Plan-then-execute and the dual-model pattern: a planner that never reads untrusted data, a quarantined model with no tools, and the policy enforcing every flow; step by step, beside a classic agent.",
  },
  {
    slug: "08-humans-in-the-loop",
    title: "Humans in the loop",
    summary:
      "Approval thresholds, from none to every call, over a suite of benign tasks: prompts per task against the risky actions they gate, and how approval fatigue turns more prompts into less safety.",
  },
  {
    slug: "09-the-frontier",
    title: "The frontier",
    summary:
      "Every defence's cost (tasks it blocks, prompts, extra calls) against the risk it leaves, on the same benign suite, for fixed attacks and for an attacker who adapts: the security–utility frontier.",
  },
  {
    slug: "10-a-builders-checklist",
    title: "A builder's checklist",
    summary:
      "Nine checks derived from the chapters, each measured by the engine on a design you choose and linked back to its chapter: labels, routes, the trifecta, least privilege, the sandbox, detection, the plan, prompts and the frontier.",
  },
] as const;
