import { create } from "zustand";

export interface DraftState {
  /** Set of form IDs currently flagged as dirty. */
  dirtyForms: Set<string>;
  /** True when at least one form is dirty. */
  isDirty: boolean;
  /** Flag the given form ID as dirty. Idempotent. */
  markDirty: (formId: string) => void;
  /** Clear the given form ID. Idempotent. */
  markClean: (formId: string) => void;
  /** Drop every dirty flag. Useful in tests / global logout. */
  reset: () => void;
}

/**
 * Global store of dirty form IDs. Any component can subscribe with
 * `useDraftStore((s) => s.isDirty)` to react to the aggregate state — e.g.
 * an upload-in-progress indicator that lives outside the form tree.
 */
export const useDraftStore = create<DraftState>()((set) => ({
  dirtyForms: new Set<string>(),
  isDirty: false,
  markDirty: (formId) =>
    set((state) => {
      if (state.dirtyForms.has(formId)) return state;
      const next = new Set(state.dirtyForms);
      next.add(formId);
      return { dirtyForms: next, isDirty: next.size > 0 };
    }),
  markClean: (formId) =>
    set((state) => {
      if (!state.dirtyForms.has(formId)) return state;
      const next = new Set(state.dirtyForms);
      next.delete(formId);
      return { dirtyForms: next, isDirty: next.size > 0 };
    }),
  reset: () => set({ dirtyForms: new Set<string>(), isDirty: false }),
}));
