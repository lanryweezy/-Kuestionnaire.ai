## 2026-06-10 - [React useMemo Optimization in VisualAnalytics]
**Learning:** Found a performance bottleneck in `VisualAnalytics.tsx` where expensive data calculations mapping over `submissions` for every `chartableQuestion` were executing on every component render.
**Action:** Always verify if expensive iteration or filtering inside functional components should be memoized using `useMemo` based on data inputs rather than allowing standard React rendering loops to repeatedly execute O(N*M) operations.
