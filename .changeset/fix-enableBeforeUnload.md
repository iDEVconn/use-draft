---
"@idevconn/use-draft": patch
---

Fix native "leave site?" dialog firing on every page refresh regardless of dirty state. `useBlocker`'s `enableBeforeUnload` defaults to `true` and was never passed, so TanStack Router's beforeunload handler ignored `shouldBlockFn` entirely. Now `enableBeforeUnload` is tied to the same dirty check.
