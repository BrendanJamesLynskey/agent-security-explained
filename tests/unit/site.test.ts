/**
 * The small modules around the engine: number formats, the palette, the chapter catalogue and
 * the site constants.
 */
import { describe, expect, it } from "vitest";

import {
  clip,
  fmtInt,
  fmtMs,
  fmtTokens,
  fmtUsd,
  pct,
  trim,
} from "@/lib/format";
import {
  SECTIONS,
  getSectionMeta,
  isValidSlug,
  readSectionMdx,
} from "@/lib/mdx/sections";
import { ARXIV, GITHUB_URL, PAPERS, SITE_URL, repoFile } from "@/lib/site";
import {
  CIRCLE_COLOUR,
  DECISION_COLOUR,
  LAYER_COLOUR,
  SOURCE_COLOUR,
  swatch,
} from "@/lib/viz/palette";
describe("format", () => {
  it("durations", () => {
    expect(fmtMs(0)).toBe("0 s");
    expect(fmtMs(850)).toBe("850 ms");
    expect(fmtMs(12345)).toBe("12.3 s");
    expect(fmtMs(125_000)).toBe("2 min 5 s");
    expect(fmtMs(119_800)).toBe("2 min 0 s");
  });
  it("money, counts, percentages, clipping", () => {
    expect(fmtUsd(0)).toBe("$0");
    expect(fmtUsd(0.00236)).toBe("$0.00236");
    expect(fmtUsd(1.234)).toBe("$1.23");
    expect(fmtTokens(4342)).toBe("4,342 tokens");
    expect(fmtInt(1234.4)).toBe("1,234");
    expect(pct(0.531)).toBe("53%");
    expect(trim(0)).toBe("0");
    expect(clip("short")).toBe("short");
    expect(clip("a few words that will not fit in the space", 20)).toBe(
      "a few words that…",
    );
    expect(clip("abcdefghijklmnopqrstuvwxyz", 10)).toBe("abcdefghi…");
  });
});

describe("palette", () => {
  it("every source, decision, circle and layer has a colour", () => {
    for (const m of [
      SOURCE_COLOUR,
      DECISION_COLOUR,
      CIRCLE_COLOUR,
      LAYER_COLOUR,
    ])
      for (const v of Object.values(m)) expect(v).toMatch(/^#[0-9A-F]{6}$/i);
    expect(swatch("user", "public")).toBe(SOURCE_COLOUR.user);
    expect(swatch("untrusted", "private")).toContain(
      "repeating-linear-gradient",
    );
    expect(swatch("nobody", "public")).toBe("#737373");
  });
});

describe("chapters and site", () => {
  it("catalogue", async () => {
    expect(SECTIONS).toHaveLength(10);
    expect(getSectionMeta("03-the-lethal-trifecta").title).toBe(
      "The lethal trifecta",
    );
    expect(isValidSlug("05-sandboxing-and-egress")).toBe(true);
    expect(isValidSlug("99-nope")).toBe(false);
    expect(await readSectionMdx("01-trust-boundaries")).toMatch(
      /^<BoundaryWidget>/,
    );
    expect(await readSectionMdx("10-a-builders-checklist")).toMatch(
      /^<ChecklistWidget>/,
    );
  });
  it("constants", () => {
    expect(SITE_URL).toBe("https://agent-security-explained.vercel.app");
    expect(repoFile("README.md")).toBe(`${GITHUB_URL}/blob/main/README.md`);
    expect(ARXIV(PAPERS.camel)).toBe("https://arxiv.org/abs/2503.18813");
    expect(ARXIV(PAPERS.adaptive)).toBe("https://arxiv.org/abs/2503.00061");
  });
});
