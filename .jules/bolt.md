## 2026-06-10 - [React useMemo Optimization in VisualAnalytics]
**Learning:** Found a performance bottleneck in `VisualAnalytics.tsx` where expensive data calculations mapping over `submissions` for every `chartableQuestion` were executing on every component render.
**Action:** Always verify if expensive iteration or filtering inside functional components should be memoized using `useMemo` based on data inputs rather than allowing standard React rendering loops to repeatedly execute O(N*M) operations.

## 2026-06-11 - [React.memo Optimization in FormBuilder]
**Learning:** Using `JSON.stringify` for deep equality checks in a custom `React.memo` comparison function is a React anti-pattern that can actually degrade performance (O(N) operation on the main thread). Additionally, hardcoding an `areEqual` function that ignores callback props can cause stale closures, leading to subtle data corruption bugs.
**Action:** Instead of writing complex custom `areEqual` functions for heavy components that receive large global objects (like the whole `form` object just to read some ids), refactor the parent component to derive the specific data needed (e.g., `logicJumpOptions`), memoize it with `useMemo`, pass that derived data down, and rely on standard `React.memo` (shallow equality check) in the child.

## 2024-05-24 - [React.memo and Global State Anti-pattern]
**Learning:** React.memo optimizations are completely neutralized if the memoized child component hooks directly into a global reactive store (like \`useStore\` from Zustand) for properties that change frequently.
**Action:** Always extract the necessary specific properties (like \`theme\`) and callbacks from the global store in the parent component and pass them down as stable props to memoized child components. To perform global updates within those stable callbacks without triggering re-renders or creating stale closures, use \`useStore.getState()\` to access the latest state rather than including the reactive state object in the \`useCallback\` dependency array.

## 2024-06-12 - [Zustand React.useCallback Anti-pattern]
**Learning:** Found an anti-pattern in `FormBuilder.tsx` where callback functions (`addQuestion`, `removeQuestion`, etc.) passed to heavy memoized child components (`QuestionEditor`) included the reactive `form` state in their dependency arrays. This effectively broke standard React memoization across the app, as typing into any input would change the `form` object, recreate all callbacks, and trigger massive unnecessary re-renders.
**Action:** When creating callbacks that only need to read the current global state to apply updates, always use the imperative API (`useStore.getState().currentForm`) instead of including the reactive state in the dependency array. Keep dependencies minimal and ensure callbacks passed as props remain strictly stable.

## 2026-06-13 - [Zustand React.useCallback Anti-pattern in Async Handlers]
**Learning:** Found several async handlers (`applyTemplate`, `generateSmartForm`, `suggestRelatedQuestions`, `autoFormatQuestions`) and inline `onChange` handlers in `FormBuilder.tsx` that were re-created on every render because they accessed the reactive `form` state object directly. This caused unnecessary re-renders of child components that depend on these handlers.
**Action:** When creating async or complex handlers that need to read and update global state, wrap them in `useCallback` and use `useStore.getState().currentForm` instead of accessing the reactive `form` state directly from the component scope. This keeps the handler references stable and prevents unnecessary re-renders. Also, extract inline `onChange` handlers into stable `useCallback` functions.

## 2024-06-16 - [Zustand Debounced Input Anti-pattern]
**Learning:** Updating global state on every keystroke for top-level form fields caused the entire component tree to re-render, leading to input lag. While debouncing helps, syncing global state back to local state dependencies like `form.title` on every re-render can cause a race condition where fast typing gets overwritten by the slightly older global state immediately after the debounce fires.
**Action:** Use local state for the inputs and flush to the global store with `lodash.debounce`. Only synchronize the local state from the global store when `form.id` changes to prevent overwriting user input while they type.

## 2026-10-18 - [O(n²) Array.find() Bottleneck in Data Processing]
**Learning:** Calling `Array.find()` inside a loop that iterates over a large dataset (like processing all submissions to calculate chart data) creates an O(N*M) performance bottleneck, as it performs a linear search for every iteration.
**Action:** Always extract the array into a hash map (`Map` or plain object) before the loop to allow for O(1) lookups during the main iteration, especially in data aggregation or visualization components.
## 2026-10-20 - [O(N^2) Array Iteration Bottleneck in Storage Service]
**Learning:** Calling `Array.filter()` inside an `Array.map()` loop that iterates over a large dataset (like matching questions or answers to forms or submissions) creates an O(N*M) performance bottleneck, as it performs a linear search for every iteration.
**Action:** Always group the related data into a hash map (`Record<string, any[]>`) keyed by the foreign key (e.g. `form_id` or `response_id`) before the loop to allow for O(1) lookups during the main mapping iteration.

## 2024-10-23 - [O(n²) Array.includes() Bottleneck in Data Deletion]
**Learning:** Calling `Array.includes()` inside an `Array.filter()` loop over a large dataset creates an O(N*M) performance bottleneck, as it performs a linear search for every iteration. This can severely affect performance during form syncing or deletion tasks when a form contains many elements.
**Action:** Always extract the target array into a `Set` before the loop and use `Set.has()` for O(1) lookups during the main filtering iteration, especially in data synchronization services.

## 2024-10-28 - [O(n*m) Array.includes() and Array.map() inside render loops]
**Learning:** Found an O(N*M) performance bottleneck in `FormPreview.tsx` where mapping over options triggered an `Array.includes()` linear search for every iteration when rendering checkboxes. Additionally, inside a conditional logic loop, mapping strings via `.map(a => String(a).toLowerCase())` occurred repeatedly on every rule check.
**Action:** Extract large arrays into a `Set` before render mapping for O(1) `.has()` lookups. Move data formatting/mapping like string `.toLowerCase()` conversions outside of inner loops to prevent redundant processing.
