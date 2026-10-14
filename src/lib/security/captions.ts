/**
 * The one caption the site composes itself: chapter 4's last frame, from the engine's own token
 * check (privilegeStudy().passthrough). Everything else is the engine's caption, verbatim.
 */
import type { Obj } from "@/lib/engine";

export function passthroughCaption(pt: Obj): string {
  return (
    `Finally, a token minted for ${pt.token.aud} (scopes: ${(pt.token.scopes as string[]).join(", ")}) ` +
    `is presented to ${pt.tool}'s server: ${pt.check.reason}. A token is good only at its own audience.`
  );
}

/** Chapter 4's frames: the engine's steps, then the token presented to the wrong audience. */
export function privilegeFrames(study: Obj): Obj[] {
  const frames = (study.frames as Obj[]).map((f) => ({ ...f, kind: "step" }));
  return [
    ...frames,
    {
      kind: "passthrough",
      step: frames.length,
      caption: passthroughCaption(study.passthrough),
    },
  ];
}
