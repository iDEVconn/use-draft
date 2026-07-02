import { useCallback, useEffect, useId } from "react";
import { useBlocker } from "@tanstack/react-router";
import { useDraftStore } from "./store";

export interface UseDraftReturn {
  /** True when navigation is blocked and the consumer should render its confirm dialog. */
  showDialog: boolean;
  /** Proceed with the originally-attempted navigation. */
  confirmLeave: () => void;
  /** Stay on the current page, dismiss the dialog. */
  cancelLeave: () => void;
}

export type IsDirtyInput = boolean | (() => boolean);

/**
 * Track unsaved-changes state for the current form and block navigation
 * while it's dirty. The hook:
 *
 *   1. Reports this form's dirty state into the global draft store so other
 *      components (e.g. an upload indicator outside the form tree) can read
 *      the aggregate via `useDraftStore`.
 *   2. Hooks TanStack Router's `useBlocker` (with `withResolver: true`) so
 *      in-app navigation pauses on a status === "blocked" condition,
 *      letting the caller render a confirm dialog and call confirmLeave /
 *      cancelLeave.
 *   3. Adds a `beforeunload` listener so browser refresh / tab-close
 *      surfaces the native "Leave site?" dialog when ANY form is dirty.
 *
 * Pass a getter function (`() => isDirty`) rather than a boolean when the
 * dirty state changes inside the same event handler that triggers
 * navigation — `useBlocker` evaluates the predicate lazily, so a getter
 * reading from a `useRef` sees the synchronously-set value before React
 * has a chance to re-render.
 */
export function useDraft(isDirty: IsDirtyInput): UseDraftReturn {
  const formId = useId();
  const markDirty = useDraftStore((s) => s.markDirty);
  const markClean = useDraftStore((s) => s.markClean);

  const isDirtyNow = typeof isDirty === "function" ? isDirty() : isDirty;

  useEffect(() => {
    if (isDirtyNow) {
      markDirty(formId);
    } else {
      markClean(formId);
    }
    return () => markClean(formId);
  }, [isDirtyNow, formId, markDirty, markClean]);

  const shouldBlockFn = useCallback(() => {
    return typeof isDirty === "function" ? isDirty() : isDirty;
  }, [isDirty]);

  const { status, proceed, reset } = useBlocker({
    shouldBlockFn,
    enableBeforeUnload: shouldBlockFn,
    withResolver: true,
  });

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (useDraftStore.getState().isDirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return {
    showDialog: status === "blocked",
    confirmLeave: () => proceed?.(),
    cancelLeave: () => reset?.(),
  };
}
