# @idevconn/use-draft

## 0.2.2

### Patch Changes

- 0d2ceba: Fix: auto-resolve a pending blocked-navigation on unmount instead of leaving it hanging forever. If the component holding the resolver (returned by `useDraft`) unmounts while `showDialog` is true — e.g. a consumer that doesn't render the confirm dialog, or a route swap that tears the component down before the user answers — every subsequent in-app navigation attempt would silently do nothing with no dialog shown, since nothing was ever calling `confirmLeave`/`cancelLeave` to resolve the underlying router promise. `useDraft` now calls `reset()` on unmount whenever a navigation is still blocked.

## 0.2.1

### Patch Changes

- 8f43d02: Fix native "leave site?" dialog firing on every page refresh regardless of dirty state. `useBlocker`'s `enableBeforeUnload` defaults to `true` and was never passed, so TanStack Router's beforeunload handler ignored `shouldBlockFn` entirely. Now `enableBeforeUnload` is tied to the same dirty check.
