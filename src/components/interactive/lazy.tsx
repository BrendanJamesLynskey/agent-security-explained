"use client";

/**
 * Code-split client widgets: each loads its own chunk after the page shell, so pages stay
 * light (the pattern of the companion sites' lazy.tsx). Each widget takes its equation as
 * server-rendered children.
 */
import dynamic from "next/dynamic";

function Placeholder({ what }: { what: string }): JSX.Element {
  return (
    <p
      data-pending-widget
      className="my-8 min-h-96 text-sm text-neutral-600 dark:text-neutral-400"
    >
      Loading the {what}…
    </p>
  );
}

const loading = (what: string) =>
  function Loading(): JSX.Element {
    return <Placeholder what={what} />;
  };

export const BoundaryWidget = dynamic(() => import("./BoundaryWidget"), {
  ssr: false,
  loading: loading("animation"),
});
export const ContextWidget = dynamic(() => import("./ContextWidget"), {
  ssr: false,
  loading: loading("animation"),
});
export const TrifectaWidget = dynamic(() => import("./TrifectaWidget"), {
  ssr: false,
  loading: loading("animation"),
});
export const PrivilegeWidget = dynamic(() => import("./PrivilegeWidget"), {
  ssr: false,
  loading: loading("animation"),
});
export const SandboxWidget = dynamic(() => import("./SandboxWidget"), {
  ssr: false,
  loading: loading("animation"),
});
export const DepthWidget = dynamic(() => import("./DepthWidget"), {
  ssr: false,
  loading: loading("animation"),
});
export const DualWidget = dynamic(() => import("./DualWidget"), {
  ssr: false,
  loading: loading("animation"),
});
export const ApprovalWidget = dynamic(() => import("./ApprovalWidget"), {
  ssr: false,
  loading: loading("animation"),
});
export const FrontierWidget = dynamic(() => import("./FrontierWidget"), {
  ssr: false,
  loading: loading("animation"),
});
export const ChecklistWidget = dynamic(() => import("./ChecklistWidget"), {
  ssr: false,
  loading: loading("animation"),
});
