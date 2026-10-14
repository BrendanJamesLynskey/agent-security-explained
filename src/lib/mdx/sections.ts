/**
 * Chapter catalogue + filesystem loader for /learn content.
 *
 * MDX sources live under `/content/chapters/`, one per idea, each built
 * around an animation. Their slugs and order are defined here (single source
 * of truth); the `[slug]` route validates incoming params against this list
 * before reading from disk. Same shape as the companion sites'
 * `src/lib/mdx/sections.ts`.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

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
] as const;

export type SectionSlug = (typeof SECTIONS)[number]["slug"];

const SLUG_SET = new Set<string>(SECTIONS.map((s) => s.slug));

export function isValidSlug(slug: string): slug is SectionSlug {
  return SLUG_SET.has(slug);
}

export function getSectionMeta(slug: SectionSlug): (typeof SECTIONS)[number] {
  return SECTIONS.find((s) => s.slug === slug) ?? SECTIONS[0];
}

/** Read the raw MDX source for a chapter, or `null` if it doesn't exist. */
export async function readSectionMdx(
  slug: SectionSlug,
): Promise<string | null> {
  const path = join(process.cwd(), "content", "chapters", `${slug}.mdx`);
  try {
    return await readFile(path, "utf-8");
  } catch {
    return null;
  }
}
