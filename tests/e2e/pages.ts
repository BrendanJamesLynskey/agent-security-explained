/** The pages and animations every e2e spec walks. */
export const PAGES = [
  "/",
  "/learn",
  "/data",
  "/about",
  "/learn/01-trust-boundaries",
  "/learn/02-untrusted-input",
  "/learn/03-the-lethal-trifecta",
  "/learn/04-least-privilege",
  "/learn/05-sandboxing-and-egress",
  "/learn/06-detection-is-not-enough",
  "/learn/07-designs-that-make-it-structural",
  "/learn/08-humans-in-the-loop",
  "/learn/09-the-frontier",
  "/learn/10-a-builders-checklist",
] as const;

export const ANIMATIONS = [
  ["/learn/01-trust-boundaries", "boundary-widget"],
  ["/learn/02-untrusted-input", "context-widget"],
  ["/learn/03-the-lethal-trifecta", "trifecta-widget"],
  ["/learn/04-least-privilege", "privilege-widget"],
  ["/learn/05-sandboxing-and-egress", "sandbox-widget"],
  ["/learn/06-detection-is-not-enough", "depth-widget"],
  ["/learn/07-designs-that-make-it-structural", "dual-widget"],
  ["/learn/08-humans-in-the-loop", "approval-widget"],
  ["/learn/09-the-frontier", "frontier-widget"],
  ["/learn/10-a-builders-checklist", "checklist-widget"],
] as const;

/** The engine runs in the page after it loads: allow for a slow runner. */
export const ENGINE_TIMEOUT = 45_000;
