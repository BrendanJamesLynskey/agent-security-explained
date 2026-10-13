"use client";

/**
 * Everything a chapter animates, computed by the vendored engine's policy module in the browser,
 * after the page loads, in the widget's own code-split chunk; results are cached per chapter. The
 * module is small and works on labels, so every chapter runs in a few milliseconds.
 */
import { useEffect, useState } from "react";

import type { Chapter, Obj } from "@/lib/engine";

export type EngineState =
  | { status: "loading" }
  | { status: "ready"; data: Obj }
  | { status: "error"; error: string };

const cache = new Map<Chapter, Promise<Obj>>();

export function loadChapter(chapter: Chapter): Promise<Obj> {
  let p = cache.get(chapter);
  if (!p) {
    p = import("@/lib/engine").then((E) => E.runChapter(chapter));
    cache.set(chapter, p);
  }
  return p;
}

export function useEngine(chapter: Chapter): EngineState {
  const [state, setState] = useState<EngineState>({ status: "loading" });
  useEffect(() => {
    let live = true;
    loadChapter(chapter).then(
      (data) => live && setState({ status: "ready", data }),
      (e: Error) => live && setState({ status: "error", error: e.message }),
    );
    return () => {
      live = false;
    };
  }, [chapter]);
  return state;
}
