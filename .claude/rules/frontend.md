---
paths:
  - "src/components/**/*.{tsx,jsx,vue,svelte}"
  - "src/pages/**/*.{tsx,jsx,vue,svelte}"
  - "app/**/*.{tsx,jsx}"
  - "components/**/*.{tsx,jsx,vue,svelte}"
---

# Frontend conventions

Applies when working on user-facing components. Loads only for these paths.

- Component files own one component. Extract a second one to its own file rather than
  growing a module of siblings.
- Props in, events out. A component that reaches for global state to do its job is usually
  a container that has been mixed into a presentational piece — split it.
- Fetching and formatting live outside the component: data access in the API client,
  formatting in `lib/`. Components render.
- Reuse before creating: check the shared component directory, then the "Shared building
  blocks" map in `docs-vault/architecture.md`. A near-duplicate with one prop different is
  a prop, not a new component.
- Loading, empty, and error states are part of the component, not a follow-up. A component
  that only handles the success case is unfinished.
- Styling follows whatever the project already uses. Do not introduce a second styling
  approach alongside an existing one.
- Keys on list items come from stable ids, never the array index.
