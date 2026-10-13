/**
 * A value's label, drawn the same way everywhere: the source as the fill colour, private as a hatch
 * and a heavier outline, and both written out.
 */
import type { Obj } from "@/lib/engine";
import { swatch } from "@/lib/viz/palette";

export function labelText(l: Obj | null | undefined): string {
  if (!l) return "none";
  return `${l.src} · ${l.sens}`;
}

export function LabelChip({
  label,
  name,
}: {
  label: Obj | null | undefined;
  name?: string;
}): JSX.Element {
  if (!label)
    return (
      <span className="inline-flex items-center rounded border border-dashed border-neutral-400 px-1.5 py-0.5 font-mono text-xs text-neutral-600 dark:text-neutral-400">
        {name ? `${name}: ` : ""}none
      </span>
    );
  const priv = label.sens === "private";
  return (
    <span
      data-label={`${label.src}/${label.sens}`}
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-xs text-neutral-900 dark:text-neutral-100 ${
        priv
          ? "border-2 border-neutral-800 dark:border-neutral-200"
          : "border border-neutral-300 dark:border-neutral-700"
      }`}
    >
      <span
        aria-hidden="true"
        className="inline-block size-3 shrink-0 rounded-sm"
        style={{ background: swatch(label.src, label.sens) }}
      />
      {name ? `${name}: ` : ""}
      {labelText(label)}
    </span>
  );
}

export function LabelKey(): JSX.Element {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-700 dark:text-neutral-300">
      {(["user", "trusted", "untrusted"] as const).map((s) => (
        <li key={s} className="flex items-center gap-1">
          <span
            aria-hidden="true"
            className="inline-block size-3 rounded-sm"
            style={{ background: swatch(s, "public") }}
          />
          {s === "trusted" ? "trusted tool" : s}
        </li>
      ))}
      <li className="flex items-center gap-1">
        <span
          aria-hidden="true"
          className="inline-block size-3 rounded-sm border-2 border-neutral-800 dark:border-neutral-200"
          style={{ background: swatch("untrusted", "private") }}
        />
        private: hatched, heavy outline
      </li>
    </ul>
  );
}

export function DecisionBadge({ d }: { d: string }): JSX.Element {
  const text: Record<string, string> = {
    allow: "✓ allow",
    ask: "? ask",
    deny: "✕ deny",
    skip: "– skipped",
  };
  const cls: Record<string, string> = {
    allow:
      "border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300",
    ask: "border-fuchsia-700 text-fuchsia-800 dark:border-fuchsia-300 dark:text-fuchsia-200",
    deny: "border-red-700 bg-[repeating-linear-gradient(45deg,#d55e0022_0_3px,transparent_3px_6px)] text-red-800 dark:border-red-400 dark:text-red-300",
    skip: "border-neutral-500 text-neutral-600 dark:text-neutral-400",
  };
  return (
    <span
      data-decision={d}
      className={`inline-flex items-center whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-xs ${cls[d] ?? ""}`}
    >
      {text[d] ?? d}
    </span>
  );
}
