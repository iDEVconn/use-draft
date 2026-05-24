import { beforeEach, describe, expect, it } from "vitest";
import { useDraftStore } from "../store";

beforeEach(() => {
  useDraftStore.getState().reset();
});

describe("useDraftStore", () => {
  it("starts clean", () => {
    const s = useDraftStore.getState();
    expect(s.isDirty).toBe(false);
    expect(s.dirtyForms.size).toBe(0);
  });

  it("markDirty flips isDirty and stores the form id", () => {
    useDraftStore.getState().markDirty("form-a");
    const s = useDraftStore.getState();
    expect(s.isDirty).toBe(true);
    expect(s.dirtyForms.has("form-a")).toBe(true);
  });

  it("markDirty is idempotent (no re-render when id already present)", () => {
    const ref = useDraftStore.getState();
    ref.markDirty("form-a");
    const after1 = useDraftStore.getState();
    ref.markDirty("form-a");
    const after2 = useDraftStore.getState();
    expect(after1.dirtyForms).toBe(after2.dirtyForms);
  });

  it("aggregates dirty state across multiple forms", () => {
    useDraftStore.getState().markDirty("form-a");
    useDraftStore.getState().markDirty("form-b");
    expect(useDraftStore.getState().dirtyForms.size).toBe(2);
    expect(useDraftStore.getState().isDirty).toBe(true);
  });

  it("markClean only clears isDirty when the LAST dirty form is removed", () => {
    useDraftStore.getState().markDirty("form-a");
    useDraftStore.getState().markDirty("form-b");
    useDraftStore.getState().markClean("form-a");
    expect(useDraftStore.getState().isDirty).toBe(true);
    useDraftStore.getState().markClean("form-b");
    expect(useDraftStore.getState().isDirty).toBe(false);
  });

  it("markClean is idempotent for unknown ids", () => {
    const before = useDraftStore.getState().dirtyForms;
    useDraftStore.getState().markClean("never-added");
    expect(useDraftStore.getState().dirtyForms).toBe(before);
  });

  it("reset drops every flag", () => {
    useDraftStore.getState().markDirty("a");
    useDraftStore.getState().markDirty("b");
    useDraftStore.getState().reset();
    expect(useDraftStore.getState().isDirty).toBe(false);
    expect(useDraftStore.getState().dirtyForms.size).toBe(0);
  });
});
