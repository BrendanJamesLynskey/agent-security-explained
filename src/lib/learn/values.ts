/**
 * The learning layer's numbers (brief 44) that are not already a path in the
 * chapters' value tree (`src/lib/security/values.ts`): each is a ratio, a difference or
 * a share computed here from the same engine runs the chapters quote, at
 * build time. A self-check cites one as `<Check v="…">`, prose as
 * `<V v="…" />`; tests/unit/learn.test.ts checks every one against the tree.
 */
import { lookup } from "@/lib/security/values";

const n = (path: string): number => {
  const v = lookup(path);
  if (typeof v !== "number") throw new Error(`${path} is not a number`);
  return v;
};

const VALUES: Record<string, () => number> = {
  // chapter 6: all three layers missing with a 1% shared blind spot, against independent misses
  "ch06.blindOverIndependent": () =>
    n("dp.t.c0.01k3.all_miss") / n("dp.independent"),
};

export const LEARN_VALUE_NAMES = Object.keys(VALUES);

const CACHE = new Map<string, number>();

export function learnValue(name: string): number {
  const cached = CACHE.get(name);
  if (cached !== undefined) return cached;
  const f = VALUES[name];
  if (!f) throw new Error(`no learn value ${name}`);
  const v = f();
  if (!Number.isFinite(v)) throw new Error(`learn value ${name} is ${v}`);
  CACHE.set(name, v);
  return v;
}
