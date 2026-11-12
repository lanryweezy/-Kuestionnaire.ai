## 2026-11-10 - Adding aria-labels to icon-only buttons
**Learning:** Found multiple icon-only buttons in `ResultsView.tsx` and `Toast.tsx` without adequate screen reader context. While the `title` attribute was present on some, it wasn't consistently paired with `aria-label` for guaranteed screen reader accessibility.
**Action:** Always ensure that icon-only interactive elements include both `aria-label` for screen readers and `title` for visual tooltip context.
