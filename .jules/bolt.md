## 2026-06-10 - [React useMemo Optimization in VisualAnalytics]
**Learning:** Found a performance bottleneck in `VisualAnalytics.tsx` where expensive data calculations mapping over `submissions` for every `chartableQuestion` were executing on every component render.
**Action:** Always verify if expensive iteration or filtering inside functional components should be memoized using `useMemo` based on data inputs rather than allowing standard React rendering loops to repeatedly execute O(N*M) operations.

## 2026-06-11 - [React.memo Optimization in FormBuilder]
**Learning:** Using `JSON.stringify` for deep equality checks in a custom `React.memo` comparison function is a React anti-pattern that can actually degrade performance (O(N) operation on the main thread). Additionally, hardcoding an `areEqual` function that ignores callback props can cause stale closures, leading to subtle data corruption bugs.
**Action:** Instead of writing complex custom `areEqual` functions for heavy components that receive large global objects (like the whole `form` object just to read some ids), refactor the parent component to derive the specific data needed (e.g., `logicJumpOptions`), memoize it with `useMemo`, pass that derived data down, and rely on standard `React.memo` (shallow equality check) in the child.
