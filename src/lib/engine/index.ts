/**
 * The vendored Agent_Loop_Sim engine (src/lib/engine/vendor, pinned in VENDORED.json) and what
 * each chapter animates (src/data/chapter_configs.json). Every frame is computed by the engine's
 * policy module, whose TS port reproduces the Python reference exactly (the engine's CI checks
 * it). The module works on labels only: no content, no prompts, no language model.
 */
import CONFIGS from "@/data/chapter_configs.json";

import * as P from "./vendor/policy/index";

export { P };
export type Obj = { [k: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

export type Chapter = keyof typeof CONFIGS;
export const CHAPTER_CONFIGS = CONFIGS as unknown as Record<Chapter, Obj>;

/** Everything one chapter animates (and quotes). */
export function runChapter(chapter: Chapter): Obj {
  const S = P.study;
  const K = P.catalogue;
  if (chapter === "boundary") {
    const plans: Obj = {};
    for (const p of K.PLAN_ORDER)
      plans[p] = {
        context: S.boundaryFrames(p, "context"),
        dataflow: S.boundaryFrames(p, "dataflow"),
      };
    return { plans };
  }
  if (chapter === "context") {
    const plans: Obj = {};
    for (const p of K.PLAN_ORDER) plans[p] = S.contextFrames(p);
    return { plans };
  }
  if (chapter === "trifecta") {
    const subsets = [];
    for (let m = 0; m < 1 << K.TOOL_ORDER.length; m++) {
      const tools = K.TOOL_ORDER.filter((_, i) => (m >> i) & 1);
      const g = S.grantFor(tools);
      subsets.push({
        tri: P.capabilities.trifecta(g).all,
        exposed: P.capabilities.exposure(g).exposed,
      });
    }
    return {
      ...S.trifectaStudy(),
      subsets: {
        n: subsets.length,
        trifecta: subsets.filter((s) => s.tri).length,
        agree: subsets.filter((s) => s.tri === s.exposed).length,
      },
    };
  }
  if (chapter === "privilege") return S.privilegeStudy();
  return { frames: S.sandboxFrames(), sets: S.allLayerSets() };
}
