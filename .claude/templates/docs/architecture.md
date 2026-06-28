# Architecture

> System overview in one paragraph. The map everything else links back to.

## Components

- **<component>** — responsibility. Links: [[api]], [[database]], [[frontend]], [[backend]].

## Shared building blocks

> The reuse map — check here before creating new. Keep current via `/docs-update`.

- **Logic** — shared utils, services, hooks, state, API clients · `<where they live>`
- **UI** — shared components: buttons, cards, dialogs, forms, nav, layouts · `<where>`
- **UX** — standard patterns: loading/empty/error, modals, nav, a11y · `<where>`
- **Structure** — folder org, naming, where shared vs feature-local code goes

## Data flow

How a request/job moves through the system, end to end.

## Cross-cutting concerns

Auth, logging, error handling, background jobs.

## Decisions

Significant choices live in `decisions/` as ADRs — e.g. [[decisions/0001-title]].
