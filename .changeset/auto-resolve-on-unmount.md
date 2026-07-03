---
"@idevconn/use-draft": patch
---

Fix: auto-resolve a pending blocked-navigation on unmount instead of leaving it hanging forever. If the component holding the resolver (returned by `useDraft`) unmounts while `showDialog` is true — e.g. a consumer that doesn't render the confirm dialog, or a route swap that tears the component down before the user answers — every subsequent in-app navigation attempt would silently do nothing with no dialog shown, since nothing was ever calling `confirmLeave`/`cancelLeave` to resolve the underlying router promise. `useDraft` now calls `reset()` on unmount whenever a navigation is still blocked.
