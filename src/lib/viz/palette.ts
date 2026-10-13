/**
 * The family's visual language (explained_sites_visual_standard.md §3): Okabe and Ito's
 * colour-blind-safe palette, the same in light and dark mode. On the Security site:
 *
 * - a label's **source** is its colour (the user blue, a trusted tool green, untrusted orange), and
 *   **private** adds a hatch and a heavier outline, so the two parts never rest on colour alone, and
 *   every label is also written out;
 * - a decision: allow green, ask purple, deny the warning hue with a hatch;
 * - each sandbox layer has its own colour.
 *
 * Okabe, M. and Ito, K. (2008), "Color Universal Design (CUD): how to make figures and
 * presentations that are friendly to colorblind people", https://jfly.uni-koeln.de/color/
 */

export const OKABE_ITO = {
  black: "#000000",
  orange: "#E69F00",
  sky: "#56B4E9",
  green: "#009E73",
  yellow: "#F0E442",
  blue: "#0072B2",
  vermillion: "#D55E00",
  purple: "#CC79A7",
} as const;

export const STATE_COLOUR = {
  active: OKABE_ITO.blue,
  stalled: OKABE_ITO.vermillion,
  ok: OKABE_ITO.green,
  paused: OKABE_ITO.purple,
} as const;

/** Muted ("done", "idle") greys: Tailwind neutral-400 and neutral-600. */
export const MUTED = { light: "#a3a3a3", dark: "#525252" } as const;

/** A label's source. */
export const SOURCE_COLOUR: Record<string, string> = {
  user: OKABE_ITO.blue,
  trusted: OKABE_ITO.green,
  untrusted: OKABE_ITO.orange,
};

/** A decision. */
export const DECISION_COLOUR: Record<string, string> = {
  allow: OKABE_ITO.green,
  ask: OKABE_ITO.purple,
  deny: OKABE_ITO.vermillion,
  skip: "#737373",
};

export const DECISION_MARK: Record<string, string> = {
  allow: "✓",
  ask: "?",
  deny: "✕",
  skip: "–",
};

/** The three circles of chapter 3. */
export const CIRCLE_COLOUR: Record<string, string> = {
  private: OKABE_ITO.purple,
  untrusted: OKABE_ITO.orange,
  outbound: OKABE_ITO.sky,
};

/** A CSS background for a label swatch: solid when public, hatched when private. */
export function swatch(src: string, sens: string): string {
  const c = SOURCE_COLOUR[src] ?? "#737373";
  return sens === "private"
    ? `repeating-linear-gradient(45deg, ${c} 0 2px, ${c}33 2px 5px)`
    : c;
}

/** Sandbox layers. */
export const LAYER_COLOUR: Record<string, string> = {
  fs_scope: OKABE_ITO.green,
  container: OKABE_ITO.blue,
  egress: OKABE_ITO.purple,
};
