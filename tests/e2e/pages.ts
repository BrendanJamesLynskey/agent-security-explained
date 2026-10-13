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
] as const;

export const ANIMATIONS = [
  ["/learn/01-trust-boundaries", "boundary-widget"],
  ["/learn/02-untrusted-input", "context-widget"],
  ["/learn/03-the-lethal-trifecta", "trifecta-widget"],
  ["/learn/04-least-privilege", "privilege-widget"],
  ["/learn/05-sandboxing-and-egress", "sandbox-widget"],
] as const;

/** The engine runs in the page after it loads: allow for a slow runner. */
export const ENGINE_TIMEOUT = 45_000;
