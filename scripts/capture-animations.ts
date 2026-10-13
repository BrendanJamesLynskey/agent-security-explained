/**
 * Records the README's animated GIFs (and WebM videos) of the hero
 * animations. Manual run, output committed; a heavy job, so run it alone:
 *
 *   pnpm build && pnpm start   # in another shell
 *   pnpm animations            # writes docs/media/*.gif and *.webm
 *
 * Every frame is a model state set by the animation's scrub bar (reduced
 * motion, so nothing plays by itself), screenshotted, then joined by
 * ffmpeg: the recordings are reproducible frame for frame. Needs ffmpeg on
 * the PATH.
 */
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { chromium } from "@playwright/test";

const OUT = path.join(process.cwd(), "docs", "media");
const BASE = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";
const ONLY = process.env.CLIPS?.split(",");

type Clip = {
  name: string;
  path: string;
  widget: string;
  /** frames per second of the output */
  fps: number;
  /** a radio to press first (a parameter), if any */
  radio?: string;
  /** record every n-th step only (long animations) */
  every?: number;
};

const CLIPS: Clip[] = [
  {
    name: "boundary",
    path: "/learn/01-trust-boundaries",
    widget: "boundary-widget",
    fps: 1,
  },
  {
    name: "context",
    path: "/learn/02-untrusted-input",
    widget: "context-widget",
    fps: 1,
  },
  {
    name: "trifecta",
    path: "/learn/03-the-lethal-trifecta",
    widget: "trifecta-widget",
    fps: 1,
  },
  {
    name: "privilege",
    path: "/learn/04-least-privilege",
    widget: "privilege-widget",
    fps: 1,
  },
  {
    name: "sandbox",
    path: "/learn/05-sandboxing-and-egress",
    widget: "sandbox-widget",
    fps: 1,
  },
];

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  for (const c of CLIPS.filter((x) => !ONLY || ONLY.includes(x.name))) {
    const dir = mkdtempSync(path.join(tmpdir(), `ahe-${c.name}-`));
    await page.goto(BASE + c.path, { waitUntil: "networkidle" });
    const fig = page.getByTestId(c.widget);
    await fig.waitFor({ timeout: 30_000 });
    if (c.radio) {
      const key = await fig.getAttribute("data-key");
      await fig.getByRole("radio", { name: c.radio, exact: true }).click();
      await fig
        .page()
        .waitForFunction(
          ([id, k]) =>
            document
              .querySelector(`[data-testid="${id}"]`)
              ?.getAttribute("data-key") !== k,
          [c.widget, key] as const,
        );
    }
    const scrub = fig.getByTestId("scrub");
    const max = Number(await scrub.getAttribute("max"));
    const visual = fig.getByTestId("visual");
    let n = 0;
    for (let s = 0; s <= max; s += c.every ?? 1) {
      await scrub.fill(String(s));
      await visual.screenshot({
        path: path.join(dir, `f${String(n++).padStart(4, "0")}.png`),
      });
    }
    const input = path.join(dir, "f%04d.png");
    const gif = path.join(OUT, `${c.name}.gif`);
    const webm = path.join(OUT, `${c.name}.webm`);
    // frames can differ in size (a panel that grows): without -reinit_filter 0 ffmpeg rebuilds the
    // filter graph at each change and the GIF keeps only one frame; pad every frame to the largest
    // (read from each PNG's header); even dimensions for the video encoder; a shared GIF palette
    let mw = 0;
    let mh = 0;
    for (const f of readdirSync(dir)) {
      const b = readFileSync(path.join(dir, f));
      mw = Math.max(mw, b.readUInt32BE(16));
      mh = Math.max(mh, b.readUInt32BE(20));
    }
    const scale = `pad=${mw}:${mh}:0:0:color=white,scale=560:-2:flags=lanczos`;
    execFileSync("ffmpeg", [
      "-y",
      "-loglevel",
      "error",
      "-framerate",
      String(c.fps),
      // keep one filter graph across frames of different sizes (the pad evens them out)
      "-reinit_filter",
      "0",
      "-i",
      input,
      "-vf",
      `${scale},split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=none`,
      "-loop",
      "0",
      gif,
    ]);
    execFileSync("ffmpeg", [
      "-y",
      "-loglevel",
      "error",
      "-framerate",
      String(c.fps),
      // keep one filter graph across frames of different sizes (the pad evens them out)
      "-reinit_filter",
      "0",
      "-i",
      input,
      "-vf",
      scale,
      "-c:v",
      "libvpx-vp9",
      "-b:v",
      "0",
      "-crf",
      "40",
      "-pix_fmt",
      "yuv420p",
      webm,
    ]);
    if (process.env.KEEP) console.log(dir);
    else rmSync(dir, { recursive: true, force: true });
    console.log(
      `wrote ${path.relative(process.cwd(), gif)} and .webm (${max + 1} frames)`,
    );
  }
  await browser.close();
}

void main();
