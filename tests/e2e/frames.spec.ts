/**
 * Frame tests on the page (visual standard §4): set key frames of every animation and require
 * the caption on screen to be the caption of the Python reference's frame
 * (tests/fixtures/site_fixtures.json): the engine writes the captions, in both languages.
 */
import { expect, test, type Locator } from "@playwright/test";

import fx2 from "../fixtures/policy2_fixtures.json";
import fx from "../fixtures/site_fixtures.json";

import type { Obj } from "@/lib/engine";
import { privilegeFrames } from "@/lib/security/captions";

import { ENGINE_TIMEOUT } from "./pages";

// No autoplay (reduced motion): the test sets each frame itself.
test.use({ contextOptions: { reducedMotion: "reduce" } });

const CH = (fx as Obj).chapters as Obj;

async function change(fig: Locator, act: () => Promise<void>): Promise<void> {
  const before = (await fig.getAttribute("data-key")) ?? "";
  await act();
  await expect(fig).not.toHaveAttribute("data-key", before);
}

async function frame(fig: Locator, i: number, want: string): Promise<void> {
  await fig.getByTestId("scrub").fill(String(i));
  await expect(fig).toHaveAttribute("data-step", String(i));
  await expect(fig.getByTestId("caption")).toHaveText(want);
}

function keySteps(n: number): number[] {
  return [...new Set([0, 1, Math.floor(n / 2), n - 1])];
}

type Case = {
  path: string;
  id: string;
  name: string;
  captions: string[];
  choose?: (fig: Locator) => Promise<void>;
};

const radio =
  (...names: string[]) =>
  async (fig: Locator) => {
    for (const n of names)
      await change(fig, async () => {
        await fig.getByRole("radio", { name: n, exact: true }).click();
      });
  };

const select = (label: string, value: string) => async (fig: Locator) =>
  change(fig, async () => {
    await fig
      .getByRole("combobox", { name: label, exact: true })
      .selectOption(value);
  });

const press = (name: RegExp) => async (fig: Locator) =>
  change(fig, async () => {
    await fig.getByRole("button", { name }).click();
  });

const caps = (frames: Obj[]) => frames.map((f) => f.caption as string);
const P1 = "/learn/01-trust-boundaries";
const P2 = "/learn/02-untrusted-input";
const P3 = "/learn/03-the-lethal-trifecta";
const P4 = "/learn/04-least-privilege";
const P5 = "/learn/05-sandboxing-and-egress";
const P6 = "/learn/06-detection-is-not-enough";
const P7 = "/learn/07-designs-that-make-it-structural";
const P8 = "/learn/08-humans-in-the-loop";
const P9 = "/learn/09-the-frontier";
const P10 = "/learn/10-a-builders-checklist";
const DEPTH = (c: number) =>
  (CH.depth.runs as Obj[]).find((r) => r.c === c)!.frames as Obj[];
const DUAL = CH.dual.plans as Obj;
const APPROVAL = CH.approval.thresholds as Obj;
const CHECKS = ((fx2 as Obj).study.checklist as Obj[]).filter(
  (c) => c.design.sandbox.length === 3 && !c.design.approval,
);
const checkOf = (d: string) => CHECKS.find((c) => c.design.defence === d)!;
const B = CH.boundary.plans as Obj;
const CX = CH.context.plans as Obj;
const SETS = CH.sandbox.sets as Obj[];
const setOf = (layers: string[]) =>
  SETS.find(
    (x) =>
      x.layers.length === layers.length &&
      layers.every((l: string) => x.layers.includes(l)),
  )!;

const CASES: Case[] = [
  {
    path: P1,
    id: "boundary-widget",
    name: "the reply, classic agent (default)",
    captions: caps(B.reply_from_notes.context),
  },
  {
    path: P1,
    id: "boundary-widget",
    name: "notes then page, planned in advance",
    captions: caps(B.notes_then_page.dataflow),
    choose: async (fig) => {
      await select("Task", "notes_then_page")(fig);
      await radio("Planned")(fig);
    },
  },
  {
    path: P2,
    id: "context-widget",
    name: "notes then page (default)",
    captions: caps(CX.notes_then_page.frames),
  },
  {
    path: P2,
    id: "context-widget",
    name: "the inbox digest",
    captions: caps(CX.inbox_digest.frames),
    choose: select("Task", "inbox_digest"),
  },
  {
    path: P3,
    id: "trifecta-widget",
    name: "every combination",
    captions: caps([...CH.trifecta.circles, ...CH.trifecta.double]),
  },
  {
    path: P4,
    id: "privilege-widget",
    name: "two grants",
    captions: caps(privilegeFrames(CH.privilege)),
  },
  {
    path: P5,
    id: "sandbox-widget",
    name: "every layer (default)",
    captions: caps(setOf(["fs_scope", "container", "egress"]).frames),
  },
  {
    path: P5,
    id: "sandbox-widget",
    name: "no allow-list",
    captions: caps(setOf(["fs_scope", "container"]).frames),
    choose: press(/^Network allow-list/),
  },
  {
    path: P6,
    id: "depth-widget",
    name: "a 1% blind spot (default)",
    captions: caps(DEPTH(0.01)),
  },
  {
    path: P6,
    id: "depth-widget",
    name: "a 4% blind spot",
    captions: caps(DEPTH(0.04)),
    choose: select("Shared blind spot c", "0.04"),
  },
  {
    path: P7,
    id: "dual-widget",
    name: "notes then page (default)",
    captions: caps(DUAL.notes_then_page.frames),
  },
  {
    path: P7,
    id: "dual-widget",
    name: "a task that branches on what it read",
    captions: caps(DUAL.adaptive.frames),
    choose: select("Task", "adaptive"),
  },
  {
    path: P8,
    id: "approval-widget",
    name: "the policy's asks (default)",
    captions: caps(APPROVAL.policy.frames),
  },
  {
    path: P8,
    id: "approval-widget",
    name: "every call",
    captions: caps(APPROVAL.every.frames),
    choose: select("Who must approve", "every"),
  },
  {
    path: P9,
    id: "frontier-widget",
    name: "an adaptive attacker (default)",
    captions: caps(CH.frontier.adaptive.frames),
  },
  {
    path: P9,
    id: "frontier-widget",
    name: "fixed attacks",
    captions: caps(CH.frontier.fixed.frames),
    choose: radio("fixed (published rates)"),
  },
  {
    path: P10,
    id: "checklist-widget",
    name: "the default design",
    captions: caps(CH.checklist.default.frames),
  },
  {
    path: P10,
    id: "checklist-widget",
    name: "detectors alone",
    captions: caps(checkOf("detectors").frames),
    choose: select("Design", "detectors"),
  },
];

for (const c of CASES) {
  test(`${c.id} (${c.name}): key frames are the reference's`, async ({
    page,
  }) => {
    await page.goto(c.path);
    const fig = page.getByTestId(c.id);
    await expect(fig).toBeVisible({ timeout: ENGINE_TIMEOUT });
    await fig.scrollIntoViewIfNeeded();
    if (c.choose) await c.choose(fig);
    for (const i of keySteps(c.captions.length))
      await frame(fig, i, c.captions[i]!);
  });
}

test("chapter 4: the last call's token check is the reference's", async ({
  page,
}) => {
  await page.goto(P4);
  const fig = page.getByTestId("privilege-widget");
  await expect(fig).toBeVisible({ timeout: ENGINE_TIMEOUT });
  const fr = privilegeFrames(CH.privilege);
  await fig.getByTestId("scrub").fill(String(fr.length - 2));
  const extra = fr[fr.length - 2]!;
  await expect(
    fig.getByTestId("grant-task").locator("[data-token-ok]"),
  ).toHaveAttribute("data-token-ok", extra.task.token.ok ? "true" : "false");
  await expect(
    fig.getByTestId("grant-task").locator("[data-decision]"),
  ).toHaveAttribute("data-decision", extra.task.decision);
});

test("chapter 10: approving every write and send passes check 2 and warns on check 8", async ({
  page,
}) => {
  await page.goto(P10);
  const fig = page.getByTestId("checklist-widget");
  await expect(fig).toBeVisible({ timeout: ENGINE_TIMEOUT });
  await press(/^Approve every write and send/)(fig);
  const want = ((fx2 as Obj).study.checklist as Obj[]).find(
    (c) =>
      c.design.defence === "planned" &&
      c.design.approval === "consequential" &&
      c.design.sandbox.length === 3,
  )!;
  const last = want.frames.length - 1;
  await frame(fig, last, want.frames[last].caption);
  await expect(fig.locator("[data-check='2']")).toHaveAttribute(
    "data-verdict",
    "pass",
  );
  await expect(fig.locator("[data-check='8']")).toHaveAttribute(
    "data-verdict",
    "warn",
  );
});
