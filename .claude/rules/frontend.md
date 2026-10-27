---
paths:
  - "src/components/**/*.{tsx,jsx,vue,svelte}"
  - "src/pages/**/*.{tsx,jsx,vue,svelte}"
  - "app/**/*.{tsx,jsx}"
  - "components/**/*.{tsx,jsx,vue,svelte}"
---

# Frontend conventions

Applies when working on user-facing components. Loads only for these paths.

- Keep components cohesive. Small private helpers can stay beside their only consumer;
  extract when reuse or readability warrants it.
- Follow existing state boundaries. Split components when reuse or complexity warrants it;
  accessing global state alone does not require a refactor.
- Follow the active framework's data-loading model. Client views delegate reusable data
  access to hooks/clients; server components may fetch where their stack pack recommends it.
  Keep independently testable domain logic outside rendering.
- Reuse before creating: check the shared component directory, then the "Shared building
  blocks" map in `docs-vault/architecture.md`. A near-duplicate with one prop different is
  a prop, not a new component.
- Loading, empty, and error states are part of the component, not a follow-up. A component
  that only handles the success case is unfinished.
- Styling follows whatever the project already uses. Do not introduce a second styling
  approach alongside an existing one.
- Keys on list items come from stable ids, never the array index.
