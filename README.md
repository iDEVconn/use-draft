# @idevconn/use-draft

Global unsaved-changes blocker for [TanStack Router](https://tanstack.com/router) SPAs.

Aggregates dirty state from every mounted form via a [Zustand](https://zustand.docs.pmnd.rs/) store and blocks both:

- **In-app navigation** through `useBlocker` (renders your own confirm dialog).
- **Browser refresh / tab-close** through `beforeunload` (native dialog).

Any component on the page can subscribe to the aggregate `isDirty` state — useful for showing an upload-in-progress indicator outside the form tree.

## Install

```bash
npm install @idevconn/use-draft
```

Peer dependencies: `react >= 18`, `@tanstack/react-router >= 1.100`, `zustand >= 4`.

## Usage

### Inside a form

```tsx
import { useDraft } from "@idevconn/use-draft";
import { useForm } from "react-hook-form";

function ProductForm() {
  const form = useForm<ProductInput>();
  const { showDialog, confirmLeave, cancelLeave } = useDraft(form.formState.isDirty);

  return (
    <>
      <form onSubmit={...}>{/* ... */}</form>
      {showDialog && (
        <ConfirmDialog
          message="You have unsaved changes. Leave anyway?"
          onConfirm={confirmLeave}
          onCancel={cancelLeave}
        />
      )}
    </>
  );
}
```

### When the dirty flag changes inside the navigation handler

If you set the dirty state synchronously **right before** triggering navigation (e.g. on save), pass a **getter function**. `useBlocker` invokes the predicate lazily, so the getter sees the latest value before React has had a chance to re-render.

```tsx
const savedRef = useRef(false);
useDraft(() => form.formState.isDirty && !savedRef.current);

async function onSubmit(values: ProductInput) {
  await mutation.mutateAsync(values);
  savedRef.current = true; // synchronous
  navigate({ to: "/products" }); // not blocked
}
```

### Reading the aggregate state

```tsx
import { useDraftStore } from "@idevconn/use-draft";

function UploadIndicator() {
  const isDirty = useDraftStore((s) => s.isDirty);
  return isDirty ? <span>Saving…</span> : null;
}
```

## API

### `useDraft(isDirty)`

| Argument  | Type                          | Description                                                          |
| --------- | ----------------------------- | -------------------------------------------------------------------- |
| `isDirty` | `boolean \| (() => boolean)`  | Current dirty state, or a getter evaluated lazily on each navigation attempt. |

Returns `{ showDialog, confirmLeave, cancelLeave }`. `showDialog` is `true` while navigation is held; call `confirmLeave()` to release it or `cancelLeave()` to stay.

Side effects per mount:

- Registers a synthetic form ID (`useId`) in the global `useDraftStore`.
- Hooks `useBlocker({ shouldBlockFn, withResolver: true })`.
- Adds a `beforeunload` listener that vetoes the unload when the aggregate `isDirty` is true.

### `useDraftStore`

A Zustand store exposing `{ dirtyForms, isDirty, markDirty, markClean, reset }`. Read-only for most consumers; the hook owns writes.

## Why a global store?

Multiple independent forms on the same page (a product edit form and an inline avatar uploader, say) each need to block navigation. Tracking the state per-component means each one only knows about its own dirty flag — the avatar uploader can't block when only the product form is dirty. The global store aggregates: any one dirty → page-level block.

## License

Apache-2.0
