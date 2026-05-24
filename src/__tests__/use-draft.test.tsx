import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

const blockerMock = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useBlocker: (...args: unknown[]) => blockerMock(...args),
}));

import { useDraft } from "../use-draft";
import { useDraftStore } from "../store";

beforeEach(() => {
  blockerMock.mockReset();
  useDraftStore.getState().reset();
});

describe("useDraft", () => {
  it("flags the form dirty in the store while isDirty=true", () => {
    blockerMock.mockReturnValue({ status: "idle", proceed: vi.fn(), reset: vi.fn() });
    renderHook(() => useDraft(true));
    expect(useDraftStore.getState().isDirty).toBe(true);
  });

  it("clears the dirty flag on unmount", () => {
    blockerMock.mockReturnValue({ status: "idle", proceed: vi.fn(), reset: vi.fn() });
    const { unmount } = renderHook(() => useDraft(true));
    expect(useDraftStore.getState().isDirty).toBe(true);
    unmount();
    expect(useDraftStore.getState().isDirty).toBe(false);
  });

  it("returns showDialog=true when the blocker reports status=blocked", () => {
    blockerMock.mockReturnValue({ status: "blocked", proceed: vi.fn(), reset: vi.fn() });
    const { result } = renderHook(() => useDraft(true));
    expect(result.current.showDialog).toBe(true);
  });

  it("confirmLeave/cancelLeave call into the blocker resolver", () => {
    const proceed = vi.fn();
    const reset = vi.fn();
    blockerMock.mockReturnValue({ status: "blocked", proceed, reset });
    const { result } = renderHook(() => useDraft(true));
    act(() => result.current.confirmLeave());
    act(() => result.current.cancelLeave());
    expect(proceed).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("accepts a getter function and the blocker reads it lazily", () => {
    blockerMock.mockReturnValue({ status: "idle", proceed: vi.fn(), reset: vi.fn() });
    let dirtyFlag = true;
    renderHook(() => useDraft(() => dirtyFlag));

    const lastCall = blockerMock.mock.calls.at(-1)?.[0] as {
      shouldBlockFn: () => boolean;
    };
    expect(lastCall.shouldBlockFn()).toBe(true);
    dirtyFlag = false;
    expect(lastCall.shouldBlockFn()).toBe(false);
  });
});
