/**
 * How this site presents itself when a link to it is shared (brief 39): its name, track, one-line
 * claim and how it is checked, as drawn on the link-preview card (src/app/_og/card.tsx), and the
 * Open Graph and Twitter tags for each page. Every page passes its own path to `withShare`, so
 * a shared chapter link names that chapter, not the home page.
 */
import type { Metadata } from "next";

import { SITE_URL } from "@/lib/site";

export const SHARE = {
  name: "Agent Security Explained",
  /** The track in the site menu (null: the site sits outside the four tracks). */
  track: "Agents" as string | null,
  /** The one-line claim under the name on the card. */
  claim: "Agents that stay safe by design",
  /** How the site is checked, in one line (from the About page). */
  checkedShort:
    "Trifecta check equals an exhaustive search on all 256 tool subsets; TS engine matches Python exactly",
  /** The site's colour on its card and favicon. */
  color: "#0e7490",
  url: SITE_URL,
  description:
    "How to build agents that stay safe: trust boundaries, labels on every value, untrusted input, the lethal trifecta, least privilege and scoped credentials, sandboxing, detection, structural designs, humans in the loop and the security–utility frontier, each animated by a tested policy engine. Defences only.",
} as const;

/** `m` plus Open Graph and Twitter tags for the page at `path` (titled as `m` titles it). */
export function withShare<M extends Metadata>(
  path: string,
  m: M,
): M & Pick<Metadata, "openGraph" | "twitter"> {
  const t = m.title;
  const own =
    typeof t === "string"
      ? t
      : t && typeof t === "object" && "absolute" in t
        ? t.absolute
        : null;
  const title =
    own && own !== SHARE.name ? `${own} · ${SHARE.name}` : SHARE.name;
  const description =
    typeof m.description === "string" ? m.description : SHARE.description;
  return {
    ...m,
    openGraph: {
      title,
      description,
      url: path,
      siteName: SHARE.name,
      type: path === "/" ? "website" : "article",
      locale: "en_GB",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
